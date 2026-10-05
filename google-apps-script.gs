/**
 * 개인 홈페이지 → 구글 스프레드시트 연결 스크립트 (2판: 학기 타임라인 추가)
 * --------------------------------------------------------
 * 1) 기록 쌓기 (예전과 같음) — 홈페이지에서 보낸 기록을 시트에 한 줄씩 추가
 *    - 주간 진행 보고 → '주간보고'   · 면담 신청서 → '면담신청'
 *    - 프로필 수정 요청 → '프로필수정' · 연결 테스트 → '연결테스트'
 * 2) 학기 타임라인 (새 기능) — '학기계획' 시트에 저장하고 다시 읽어 줌
 *    - 지도학생: 이름 + 개인 코드로 확인 → 자기 타임라인 저장·완료 체크, 연구실 전체 타임라인 보기
 *    - 교수님: 관리자 비밀번호로 확인 → 항목별 '확인'과 메모
 *
 * 학생 개인 코드와 관리자 비밀번호는 원문을 저장하지 않습니다.
 * 홈페이지의 js/config.js(공개)에 있는 암호화된 값(SHA-256)을 10분마다 읽어 와 비교합니다.
 * 그래서 코드를 새로 발급하거나 비밀번호를 바꿔도 이 스크립트는 고칠 필요가 없습니다.
 */

// (선택) 홈페이지 config.js의 sheets.key와 같게 맞추면 그 값이 맞는 기록만 저장됩니다. 비워두면 확인하지 않음.
const KEY = "";
// 홈페이지 설정 파일 주소 (학생 코드·관리자 비밀번호의 암호화된 값을 읽어 옴)
const CONFIG_URL = "https://cowinyoung08-maven.github.io/personal-homepage-web/js/config.js";

const SHEET_NAMES = { report: "주간보고", consult: "면담신청", profile: "프로필수정", test: "연결테스트" };
const TL_SHEET = "학기계획";
const TL_HEAD = ["학생", "학기", "순번", "항목", "목표일", "학생 완료", "학생 완료일", "교수 확인", "교수 메모", "최종 수정"];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000); // 여러 명이 동시에 보내도 줄이 섞이지 않게
  try {
    const body = JSON.parse(e.postData.contents);
    if (KEY && body.key !== KEY) return reply({ ok: false, error: "key가 맞지 않아요" });
    if (body.action) return reply(handleTimeline(body));

    const name = SHEET_NAMES[body.type] || "기타";
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(name) || ss.insertSheet(name);
    const data = body.data || {};
    let header = sheet.getLastRow() === 0 ? [] : sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    if (header.length === 0) header = ["받은 시각"];
    Object.keys(data).forEach(function (k) { if (header.indexOf(k) < 0) header.push(k); });
    sheet.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight("bold");
    sheet.setFrozenRows(1);
    sheet.appendRow(header.map(function (h, i) { return i === 0 ? new Date() : (data[h] !== undefined ? data[h] : ""); }));
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// 브라우저에서 웹 앱 주소를 열었을 때 연결 확인용
function doGet() {
  return reply({ ok: true, version: 2, message: "연결되었습니다. 이 주소를 홈페이지 관리자 화면에 붙여 넣으세요." });
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ───────── 학기 타임라인 ───────── */

function handleTimeline(b) {
  const a = b.action;
  if (a === "tl_all" || a === "tl_save" || a === "tl_done") {
    if (!checkStudent(b.name, b.code)) return { ok: false, error: "auth", message: "이름이나 개인 코드가 맞지 않아요." };
  } else if (a === "adm_all" || a === "adm_check") {
    if (!checkAdmin(b.password)) return { ok: false, error: "auth", message: "관리자 비밀번호가 맞지 않아요." };
  } else {
    return { ok: false, error: "unknown action" };
  }
  const sheet = tlSheet();
  if (a === "tl_all" || a === "adm_all") return { ok: true, rows: readRows(sheet) };
  if (a === "tl_save") return saveTimeline(sheet, String(b.name), String(b.term || ""), b.items || []);
  if (a === "tl_done") return updateRow(sheet, String(b.name), String(b.term || ""), Number(b.idx), function (r) {
    r[5] = b.done ? "완료" : ""; r[6] = b.done ? today() : "";
  });
  if (a === "adm_check") return updateRow(sheet, String(b.name), String(b.term || ""), Number(b.idx), function (r) {
    if (b.ok !== undefined) r[7] = b.ok ? "확인" : "";
    if (b.memo !== undefined) r[8] = String(b.memo).slice(0, 500);
  });
}

function tlSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(TL_SHEET);
  if (!sh) { sh = ss.insertSheet(TL_SHEET); sh.getRange(1, 1, 1, TL_HEAD.length).setValues([TL_HEAD]).setFontWeight("bold"); sh.setFrozenRows(1); }
  return sh;
}
function readRows(sh) {
  const n = sh.getLastRow() - 1;
  if (n <= 0) return [];
  return sh.getRange(2, 1, n, TL_HEAD.length).getDisplayValues().map(function (r) {
    return { name: r[0], term: r[1], idx: Number(r[2]), title: r[3], due: r[4], done: r[5] === "완료", doneAt: r[6], ok: r[7] === "확인", memo: r[8], updated: r[9] };
  });
}
// 한 학생의 한 학기 계획을 통째로 바꿔 저장 (같은 이름의 항목은 완료·확인 상태를 이어 받음)
function saveTimeline(sh, name, term, items) {
  if (!term) return { ok: false, error: "학기를 골라 주세요." };
  const clean = items.slice(0, 20).map(function (it) {
    return { title: String(it.title || "").trim().slice(0, 120), due: String(it.due || "").trim().slice(0, 10) };
  }).filter(function (it) { return it.title; });
  const n = sh.getLastRow() - 1;
  const all = n > 0 ? sh.getRange(2, 1, n, TL_HEAD.length).getDisplayValues() : [];
  const prev = {}, keep = [];
  all.forEach(function (r) { if (r[0] === name && r[1] === term) prev[r[3]] = r; else keep.push(r); });
  const stamp = new Date().toISOString();
  const mine = clean.map(function (it, i) {
    const p = prev[it.title];
    return [name, term, i + 1, it.title, it.due, p ? p[5] : "", p ? p[6] : "", p ? p[7] : "", p ? p[8] : "", stamp];
  });
  const rows = keep.concat(mine);
  if (n > 0) sh.getRange(2, 1, n, TL_HEAD.length).clearContent();
  if (rows.length) sh.getRange(2, 1, rows.length, TL_HEAD.length).setValues(rows);
  return { ok: true, saved: mine.length };
}
function updateRow(sh, name, term, idx, fn) {
  const n = sh.getLastRow() - 1;
  if (n <= 0) return { ok: false, error: "항목을 찾지 못했어요." };
  const all = sh.getRange(2, 1, n, TL_HEAD.length).getDisplayValues();
  for (let i = 0; i < all.length; i++) {
    const r = all[i];
    if (r[0] === name && r[1] === term && Number(r[2]) === idx) {
      fn(r); r[9] = new Date().toISOString();
      sh.getRange(i + 2, 1, 1, TL_HEAD.length).setValues([r]);
      return { ok: true };
    }
  }
  return { ok: false, error: "항목을 찾지 못했어요." };
}
function today() { return Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd"); }

/* ───────── 본인 확인 (config.js의 암호화된 값과 비교) ───────── */

function sha256hex(s) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8)
    .map(function (b) { return ((b + 256) % 256).toString(16).padStart(2, "0"); }).join("");
}
function siteHashes() {
  const cache = CacheService.getScriptCache();
  const hit = cache.get("hashes");
  if (hit) return JSON.parse(hit);
  const src = UrlFetchApp.fetch(CONFIG_URL + "?t=" + Date.now(), { muteHttpExceptions: true }).getContentText();
  const admin = (src.match(/passwordHash:\s*"([0-9a-f]{64})"/) || [])[1] || "";
  const students = {};
  const re = /name:\s*"([^"]+)"[^\n]*?codeHash:\s*"([0-9a-f]{64})"/g;
  let m;
  while ((m = re.exec(src))) students[m[1]] = m[2];
  const out = { admin: admin, students: students };
  cache.put("hashes", JSON.stringify(out), 600);
  return out;
}
function checkStudent(name, code) {
  if (!name || !code) return false;
  const h = siteHashes().students[String(name)];
  return !!h && h === sha256hex("advisee:" + String(code).trim().toUpperCase());
}
function checkAdmin(pw) {
  if (!pw) return false;
  const h = siteHashes().admin;
  return !!h && h === sha256hex("lecture-site:" + String(pw));
}
