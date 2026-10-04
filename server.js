/* 개인 홈페이지 서버 (Railway용)
 * - 홈페이지 파일(index.html, css, js, images)을 그대로 보여 줌
 * - 면담 신청 · 주간 진행 보고를 PostgreSQL에 저장 (POST /api/submit)
 * - 관리자만 저장된 기록을 보고 지울 수 있음 (POST /api/login → 토큰 → GET/DELETE /api/submissions)
 *
 * Railway 설정: 이 서비스의 Variables에 DATABASE_URL (PostgreSQL 연결 주소)만 있으면 됩니다.
 * 관리자 비밀번호는 js/config.js의 admin.passwordHash와 같은 방식으로 확인합니다.
 * (원하면 Variables에 ADMIN_PASSWORD_HASH를 따로 넣어 덮어쓸 수 있어요.)
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { Pool } = require("pg");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const SALT = "lecture-site:";
const KINDS = ["consult", "report"]; // 면담 신청, 주간 진행 보고

/* ── 데이터베이스 ── */
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      // Railway 내부 주소(*.railway.internal)는 SSL 없이, 외부 주소는 SSL로 연결
      ssl: /\.railway\.internal/.test(process.env.DATABASE_URL) ? false : { rejectUnauthorized: false }
    })
  : null;
let dbReady = false;
async function initDb() {
  if (!pool) { console.log("DATABASE_URL이 없어 데이터베이스 없이 실행해요."); return; }
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS submissions (
      id SERIAL PRIMARY KEY,
      kind TEXT NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);
    dbReady = true;
    console.log("데이터베이스 연결 완료");
  } catch (e) {
    console.error("데이터베이스 연결 실패:", e.message);
    setTimeout(initDb, 10000); // 데이터베이스가 늦게 켜질 때를 대비해 다시 시도
  }
}

/* ── 관리자 비밀번호 확인 ── */
function adminHash() {
  if (process.env.ADMIN_PASSWORD_HASH) return process.env.ADMIN_PASSWORD_HASH.trim();
  try {
    const src = fs.readFileSync(path.join(ROOT, "js", "config.js"), "utf8");
    const m = src.match(/passwordHash:\s*"([0-9a-f]{64})"/);
    return m ? m[1] : "";
  } catch (e) { return ""; }
}
const sha256 = (s) => crypto.createHash("sha256").update(s, "utf8").digest("hex");
const sameHex = (a, b) => a.length === b.length && a.length > 0 && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
const tokens = new Map(); // 토큰 → 만료 시각 (서버를 다시 켜면 다시 로그인)
const TOKEN_MS = 8 * 60 * 60 * 1000;
const validToken = (req) => {
  const t = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const exp = tokens.get(t);
  if (!exp) return false;
  if (exp < Date.now()) { tokens.delete(t); return false; }
  return true;
};

/* ── 너무 잦은 요청 막기 (IP별) ── */
const hits = new Map();
function limited(req, bucket, max, windowMs) {
  const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
  const k = bucket + ":" + ip, now = Date.now();
  const arr = (hits.get(k) || []).filter((t) => now - t < windowMs);
  arr.push(now); hits.set(k, arr);
  return arr.length > max;
}
setInterval(() => { const now = Date.now(); for (const [k, a] of hits) if (!a.some((t) => now - t < 3600000)) hits.delete(k); }, 600000).unref();

/* ── 도우미 ── */
const send = (res, code, obj) => {
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(obj));
};
const readBody = (req, max = 20000) => new Promise((resolve, reject) => {
  let size = 0; const chunks = [];
  req.on("data", (c) => { size += c.length; if (size > max) { reject(new Error("too large")); req.destroy(); } else chunks.push(c); });
  req.on("end", () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}")); } catch (e) { reject(e); } });
  req.on("error", reject);
});
// 제출 내용: 글자·숫자·참거짓 값만, 항목 40개 · 값 5,000자까지
function cleanData(d) {
  if (!d || typeof d !== "object" || Array.isArray(d)) return null;
  const out = {};
  for (const [k, v] of Object.entries(d).slice(0, 40)) {
    if (typeof v === "string") out[String(k).slice(0, 100)] = v.slice(0, 5000);
    else if (typeof v === "number" || typeof v === "boolean") out[String(k).slice(0, 100)] = v;
  }
  return out;
}

/* ── API ── */
async function api(req, res, url) {
  if (url.pathname === "/api/health" && req.method === "GET") return send(res, 200, { ok: true, db: dbReady });

  if (url.pathname === "/api/submit" && req.method === "POST") {
    if (!dbReady) return send(res, 503, { error: "데이터베이스가 연결되지 않았어요." });
    if (limited(req, "submit", 10, 10 * 60 * 1000)) return send(res, 429, { error: "잠시 후 다시 시도해 주세요." });
    let body; try { body = await readBody(req); } catch (e) { return send(res, 400, { error: "잘못된 요청이에요." }); }
    const data = cleanData(body.data);
    if (!KINDS.includes(body.kind) || !data) return send(res, 400, { error: "잘못된 요청이에요." });
    const r = await pool.query("INSERT INTO submissions (kind, data) VALUES ($1, $2) RETURNING id", [body.kind, data]);
    return send(res, 201, { ok: true, id: r.rows[0].id });
  }

  if (url.pathname === "/api/login" && req.method === "POST") {
    if (limited(req, "login", 10, 15 * 60 * 1000)) return send(res, 429, { error: "시도가 너무 많아요. 15분 뒤 다시 해 주세요." });
    let body; try { body = await readBody(req, 2000); } catch (e) { return send(res, 400, { error: "잘못된 요청이에요." }); }
    if (typeof body.password !== "string" || !sameHex(sha256(SALT + body.password), adminHash())) return send(res, 401, { error: "비밀번호가 맞지 않아요." });
    const t = crypto.randomBytes(24).toString("hex");
    tokens.set(t, Date.now() + TOKEN_MS);
    return send(res, 200, { token: t });
  }

  if (url.pathname === "/api/submissions" && req.method === "GET") {
    if (!validToken(req)) return send(res, 401, { error: "다시 로그인해 주세요." });
    if (!dbReady) return send(res, 503, { error: "데이터베이스가 연결되지 않았어요." });
    const kind = url.searchParams.get("kind");
    const r = KINDS.includes(kind)
      ? await pool.query("SELECT id, kind, data, created_at FROM submissions WHERE kind = $1 ORDER BY id", [kind])
      : await pool.query("SELECT id, kind, data, created_at FROM submissions ORDER BY id");
    return send(res, 200, { rows: r.rows });
  }

  const del = url.pathname.match(/^\/api\/submissions\/(\d+)$/);
  if (del && req.method === "DELETE") {
    if (!validToken(req)) return send(res, 401, { error: "다시 로그인해 주세요." });
    if (!dbReady) return send(res, 503, { error: "데이터베이스가 연결되지 않았어요." });
    await pool.query("DELETE FROM submissions WHERE id = $1", [Number(del[1])]);
    return send(res, 200, { ok: true });
  }

  return send(res, 404, { error: "없는 주소예요." });
}

/* ── 홈페이지 파일 ── */
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif",
  ".svg": "image/svg+xml", ".webp": "image/webp", ".ico": "image/x-icon", ".pdf": "application/pdf",
  ".woff": "font/woff", ".woff2": "font/woff2"
};
// 보여 줄 수 있는 것: index.html과 css · js · images 폴더만 (server.js 등 서버 파일은 숨김)
const PUBLIC = /^\/(index\.html|(css|js|images)\/[^\0]+)$/;
function serveFile(req, res, url) {
  let p; try { p = decodeURIComponent(url.pathname); } catch (e) { p = ""; }
  if (p === "/") p = "/index.html";
  const file = path.normalize(path.join(ROOT, p));
  // ../ 같은 우회를 막기 위해, 정리된 실제 경로로 다시 확인
  const rel = "/" + path.relative(ROOT, file).split(path.sep).join("/");
  if (!file.startsWith(ROOT + path.sep) || !PUBLIC.test(rel) || rel.includes("/..")) { res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }); return res.end("Not found"); }
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }); return res.end("Not found"); }
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, {
      "Content-Type": TYPES[ext] || "application/octet-stream",
      "Content-Length": st.size,
      // 고친 내용이 바로 보이도록 html·css·js는 매번 새로 확인
      "Cache-Control": /\.(html|css|js)$/.test(ext) ? "no-cache" : "public, max-age=86400",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    });
    if (req.method === "HEAD") return res.end();
    fs.createReadStream(file).pipe(res);
  });
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  try {
    if (url.pathname.startsWith("/api/")) return await api(req, res, url);
    if (req.method !== "GET" && req.method !== "HEAD") { res.writeHead(405); return res.end(); }
    serveFile(req, res, url);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) send(res, 500, { error: "서버 오류가 났어요." });
  }
}).listen(PORT, () => {
  console.log(`홈페이지 서버 실행 중: 포트 ${PORT}`);
  initDb();
});
