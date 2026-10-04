/* 브라우저 저장소 도우미 (localStorage)
 * 서버가 없으므로 투표·신청서·출석·과제 기록은 이 브라우저에만 저장됩니다.
 * 저장이 막힌 환경(사생활 보호 모드 등)에서도 사이트가 멈추지 않도록 메모리로 대신합니다. */
(function () {
  // 강의 사이트(lecture:)와 저장 공간이 섞이지 않도록 별도 이름표를 씀
  const PREFIX = "home:";
  const memory = {};
  const listeners = {};

  const Store = {
    get(k, fallback) {
      try {
        const raw = localStorage.getItem(PREFIX + k);
        return raw == null ? fallback : JSON.parse(raw);
      } catch (e) {
        return k in memory ? memory[k] : fallback;
      }
    },
    set(k, v) {
      memory[k] = v;
      try { localStorage.setItem(PREFIX + k, JSON.stringify(v)); } catch (e) {}
      (listeners[k] || []).forEach((fn) => fn(v));
    },
    remove(k) {
      delete memory[k];
      try { localStorage.removeItem(PREFIX + k); } catch (e) {}
    },
    // 값이 바뀌면 알려줌 — 같은 브라우저의 다른 탭에서 바꾼 것도 받음(실시간 반영)
    on(k, fn) { (listeners[k] = listeners[k] || []).push(fn); }
  };

  window.addEventListener("storage", (e) => {
    if (!e.key || !e.key.startsWith(PREFIX)) return;
    const k = e.key.slice(PREFIX.length);
    let v; try { v = JSON.parse(e.newValue); } catch (err) { v = null; }
    (listeners[k] || []).forEach((fn) => fn(v));
  });

  window.Store = Store;

  /* SHA-256 (외부 라이브러리 없이, file:// 에서도 동작) — 관리자 비밀번호·지도학생 개인 코드 확인용 */
  window.sha256 = (() => {
    const K = [], H0 = [];
    const isPrime = (n) => { for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
    for (let n = 2, c = 0; c < 64; n++) if (isPrime(n)) {
      if (c < 8) H0[c] = (Math.pow(n, 1 / 2) % 1 * 4294967296) | 0;
      K[c++] = (Math.pow(n, 1 / 3) % 1 * 4294967296) | 0;
    }
    const ror = (x, n) => (x >>> n) | (x << (32 - n));
    return (str) => {
      const bytes = new TextEncoder().encode(str), l = bytes.length;
      const buf = new Uint8Array(((l + 9 + 63) >> 6) << 6);
      buf.set(bytes); buf[l] = 0x80;
      const dv = new DataView(buf.buffer);
      dv.setUint32(buf.length - 4, (l * 8) >>> 0);
      dv.setUint32(buf.length - 8, Math.floor((l * 8) / 4294967296));
      const h = H0.slice(), w = new Array(64);
      for (let i = 0; i < buf.length; i += 64) {
        for (let j = 0; j < 16; j++) w[j] = dv.getUint32(i + j * 4);
        for (let j = 16; j < 64; j++) {
          const a = w[j - 15], b = w[j - 2];
          w[j] = (w[j - 16] + (ror(a, 7) ^ ror(a, 18) ^ (a >>> 3)) + w[j - 7] + (ror(b, 17) ^ ror(b, 19) ^ (b >>> 10))) | 0;
        }
        let [a, b, c, d, e, f, g, hh] = h;
        for (let j = 0; j < 64; j++) {
          const t1 = (hh + (ror(e, 6) ^ ror(e, 11) ^ ror(e, 25)) + ((e & f) ^ (~e & g)) + K[j] + w[j]) | 0;
          const t2 = ((ror(a, 2) ^ ror(a, 13) ^ ror(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
          hh = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
        }
        [a, b, c, d, e, f, g, hh].forEach((v, k) => (h[k] = (h[k] + v) | 0));
      }
      return h.map((x) => (x >>> 0).toString(16).padStart(8, "0")).join("");
    };
  })();

  // 관리자 화면에서 고친 설정이 있으면 그것을 사용 (이 브라우저에만 적용)
  window.DEFAULT_CONFIG = window.SITE_CONFIG;
  const saved = Store.get("config", null);
  if (saved && saved.site && saved.nav) window.SITE_CONFIG = saved;

  // 화면 아래 잠깐 뜨는 안내 메시지
  window.toast = function (msg) {
    let t = document.querySelector(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("is-show");
    clearTimeout(window.toast._t); window.toast._t = setTimeout(() => t.classList.remove("is-show"), 2800);
  };

  // 파일 크기 표시 (예: 820KB, 2.4MB)
  window.fmtSize = (b) => b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))}KB` : `${(b / 1024 / 1024).toFixed(1)}MB`;

  /* 구글 스프레드시트로 기록 보내기 (5단계)
   * config.js의 sheets.endpoint에 Apps Script 웹 앱 주소를 넣으면 동작합니다.
   * 브라우저 보안 규칙상 응답을 읽을 수 없어(no-cors) '보냄'까지만 확인할 수 있어요.
   * 그래서 보낸 기록은 이 브라우저에도 함께 남겨 둡니다. */
  window.SheetSync = {
    ready() { const s = (window.SITE_CONFIG || {}).sheets || {}; return /^https:\/\/script\.google\.com\//.test(s.endpoint || ""); },
    send(type, data) {
      const s = (window.SITE_CONFIG || {}).sheets || {};
      if (!this.ready()) return Promise.resolve(false);
      return fetch(s.endpoint, {
        method: "POST", mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ type, key: s.key || "", data })
      }).then(() => true).catch(() => false);
    }
  };

  /* 서버 데이터베이스(PostgreSQL)로 기록 보내기 — Railway에서 server.js로 실행할 때만 동작
   * 정적 미리보기(서버 없음)에서는 ready()가 false라 지금처럼 이 브라우저에만 저장돼요. */
  const TOKEN = "home:dbToken";
  const tk = {
    get: () => { try { return sessionStorage.getItem(TOKEN) || ""; } catch (e) { return ""; } },
    set: (v) => { try { v ? sessionStorage.setItem(TOKEN, v) : sessionStorage.removeItem(TOKEN); } catch (e) {} }
  };
  const api = (url, opts = {}) => fetch(url, {
    cache: "no-store", ...opts,
    headers: { "Content-Type": "application/json", ...(tk.get() ? { Authorization: "Bearer " + tk.get() } : {}), ...(opts.headers || {}) }
  });
  let health = null;
  window.ServerDB = {
    // 데이터베이스가 연결돼 있는지 (한 번만 확인)
    ready() {
      if (!/^https?:$/.test(location.protocol)) return Promise.resolve(false);
      return health || (health = fetch("/api/health", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : {})).then((j) => !!j.db).catch(() => false));
    },
    async send(kind, data) {
      if (!(await this.ready())) return false;
      try { return (await api("/api/submit", { method: "POST", body: JSON.stringify({ kind, data }) })).ok; } catch (e) { return false; }
    },
    hasToken: () => !!tk.get(),
    // 관리자 비밀번호로 서버 열쇠(토큰) 받기 — 성공하면 true
    login(password) {
      this._pending = (async () => {
        if (!(await this.ready())) return false;
        try {
          const r = await api("/api/login", { method: "POST", body: JSON.stringify({ password }) });
          if (!r.ok) return false;
          tk.set((await r.json()).token); return true;
        } catch (e) { return false; }
      })();
      return this._pending;
    },
    logout: () => tk.set(""),
    // 저장된 기록 목록: 성공하면 [{id, kind, data, created_at}], 다시 로그인이 필요하면 "login", 실패하면 null
    async list(kind) {
      if (this._pending) await this._pending; // 방금 로그인 중이면 열쇠를 받을 때까지 기다림
      if (!tk.get()) return "login";
      try {
        const r = await api("/api/submissions?kind=" + encodeURIComponent(kind));
        if (r.status === 401) { tk.set(""); return "login"; }
        return r.ok ? (await r.json()).rows : null;
      } catch (e) { return null; }
    },
    async remove(id) {
      try { return (await api("/api/submissions/" + Number(id), { method: "DELETE" })).ok; } catch (e) { return false; }
    }
  };

  // HTML 특수문자 처리 (여러 파일에서 공용)
  window.esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
})();
