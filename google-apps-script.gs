/**
 * 개인 홈페이지 → 구글 스프레드시트 기록 저장 스크립트
 * --------------------------------------------------------
 * 홈페이지에서 보낸 '주간 진행 보고'와 '면담 신청서'를 이 스프레드시트에 한 줄씩 쌓습니다.
 *   - 주간 진행 보고 → '주간보고' 시트
 *   - 면담 신청서     → '면담신청' 시트
 *   - 프로필 수정 요청 → '프로필수정' 시트
 *   - 관리자 화면의 연결 테스트 → '연결테스트' 시트
 * 시트와 맨 윗줄(열 이름)은 처음 기록이 들어올 때 자동으로 만들어집니다.
 *
 * 설치 방법은 사용안내.md의 '구글 스프레드시트 연결' 부분을 따라 하세요.
 */

// (선택) 아무 문자열을 정해 넣으세요. 홈페이지 설정(config.js의 sheets.key)과 같아야 저장됩니다.
// 비워두면 확인하지 않고 모두 저장합니다.
const KEY = "";

const SHEET_NAMES = { report: "주간보고", consult: "면담신청", profile: "프로필수정", test: "연결테스트" };

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000); // 여러 명이 동시에 보내도 줄이 섞이지 않게
  try {
    const body = JSON.parse(e.postData.contents);
    if (KEY && body.key !== KEY) return reply({ ok: false, error: "key가 맞지 않아요" });

    const name = SHEET_NAMES[body.type] || "기타";
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(name) || ss.insertSheet(name);
    const data = body.data || {};

    // 맨 윗줄(열 이름) 준비 — 새 항목이 생기면 오른쪽에 열을 덧붙임
    let header = sheet.getLastRow() === 0 ? [] : sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    if (header.length === 0) header = ["받은 시각"];
    Object.keys(data).forEach(function (k) { if (header.indexOf(k) < 0) header.push(k); });
    sheet.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight("bold");
    sheet.setFrozenRows(1);

    const row = header.map(function (h, i) { return i === 0 ? new Date() : (data[h] !== undefined ? data[h] : ""); });
    sheet.appendRow(row);
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// 브라우저에서 웹 앱 주소를 열었을 때 연결 확인용
function doGet() {
  return reply({ ok: true, message: "연결되었습니다. 이 주소를 홈페이지 관리자 화면에 붙여 넣으세요." });
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
