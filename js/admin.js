/* 5단계: 관리자 모드
 * - 오른쪽 위 자물쇠 → 비밀번호 확인(SHA-256 해시 비교, 원문은 코드에 없음)
 * - 사이트 정보·섹션 내용 편집, 수강생 명단, 공지
 * - 수강 신청·출석·과제·투표 기록 확인 및 CSV(엑셀) 내려받기
 * - 설정 파일(config.js) 저장/불러오기
 * ※ 정적 사이트라 고친 설정은 이 브라우저에 저장됩니다. 모든 방문자에게 반영하려면
 *   '설정 파일 저장'으로 받은 config.js를 js 폴더에 덮어써서 다시 배포하세요. */
(function () {
  const S = window.Store, esc = window.esc;
  const C = window.SITE_CONFIG;
  const SALT = "lecture-site:";
  const ss = {
    get: (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) {} },
    del: (k) => { try { sessionStorage.removeItem(k); } catch (e) {} }
  };

  /* ───── SHA-256 — store.js의 공용 함수를 사용 (지도학생 개인 코드 확인에도 씀) ─────*/
  const sha256 = window.sha256;
  const hashPw = (pw) => sha256(SALT + pw);

  /* ───── 파일 내려받기 도우미 ───── */
  const download = (name, text, type) => {
    const blob = new Blob([text], { type });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const stamp = () => { const d = new Date(); return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`; };
  // 엑셀에서 한글이 깨지지 않도록 UTF-8 BOM을 붙인 CSV
  const csv = (name, rows) => {
    const cell = (v) => { const s = String(v ?? ""); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    download(`${name}_${stamp()}.csv`, "﻿" + rows.map((r) => r.map(cell).join(",")).join("\r\n"), "text/csv;charset=utf-8");
  };
  const fmtTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  /* ───── 자물쇠 버튼 ───── */
  const lockBtn = document.getElementById("lockBtn");
  const authed = () => ss.get("adminAuthed") === C.admin.passwordHash;

  /* 다른 화면(달력 등)에서 관리자 기능을 부르는 창구 */
  window.AdminAPI = {
    isAdmin: () => authed(),
    open: (t, opts) => (authed() ? openAdmin(t, opts) : askPassword(t, opts)),
    calendar: (opts) => window.AdminAPI.open("calendar", opts)
  };

  /* 관리자 모드일 때 각 섹션 제목 옆에 보이는 '편집' 버튼
   * [위치, 열 탭, 섹션 내용 탭의 영역 이름, 버튼 글씨] */
  const EDIT_SPOTS = [
    ["#about .section__head", "content", "소개", "✏️ 소개 편집"],
    ["#research .section__head", "content", "연구", "✏️ 연구 편집"],
    ["#publications .section__head", "content", "논문·저서", "✏️ 논문·저서 편집"],
    ["#teaching .section__head", "content", "강의", "✏️ 강의 편집"],
    ["#members .section__head", "content", "지도학생", "✏️ 지도학생 편집"],
    ["#showcase .section__head", "content", "학생 우수 작품", "✏️ 학생 우수 작품 편집"],
    ["#lab .section__head", "content", "연구실 소개", "✏️ 연구실 소개 편집"],
    ["#consult .section__head", "content", "입학·지도 문의", "✏️ 입학·지도 문의 편집"],
    ["#resources .section__head", "content", "자료실", "✏️ 자료실 편집"],
    ["#portal .section__head", "advisees", null, "🎓 지도학생 관리 (진행 단계 · 코드 · 보고)"],
    ["#contact .prof__body", "content", "연락처", "✏️ 연락처 편집"],
    ["#curriculum .section__head", "content", "주차별 일정", "✏️ 주차별 일정 편집"],
    ["#schedule", "calendar", null, "📅 일정 추가 · 수정 · 삭제"],
    ["#portfolio .section__head", "content", "우수 과제", "✏️ 우수 과제 편집"],
    ["#guide .section__head", "content", "수강 안내 (교재·평가)", "✏️ 수강 안내 편집"],
    ["#join .section__head", "content", "참여하기 (투표·신청서·로그인)", "✏️ 참여하기 편집"],
    ["#faq .section__head", "content", "FAQ", "✏️ FAQ 편집"]
  ];
  EDIT_SPOTS.forEach(([sel, t, sec, label]) => {
    const host = document.querySelector(sel);
    if (!host) return;
    const b = document.createElement("button");
    b.type = "button"; b.className = "admin-edit"; b.textContent = label;
    b.addEventListener("click", () => window.AdminAPI.open(t, { sec }));
    host.appendChild(b);
  });

  const syncLock = () => {
    const on = authed();
    lockBtn.classList.toggle("is-admin", on);
    document.body.classList.toggle("is-admin", on); // 편집 버튼 보이기
    window.dispatchEvent(new Event("admin:state"));
  };
  syncLock();
  lockBtn.addEventListener("click", () => (authed() ? openAdmin() : askPassword()));

  function askPassword(nextTab, nextOpts) {
    const m = document.createElement("div");
    m.className = "modal";
    m.innerHTML = `
      <div class="modal__backdrop" data-close></div>
      <form class="modal__box admin-login" role="dialog" aria-modal="true" aria-labelledby="alTitle" novalidate>
        <button type="button" class="modal__x" data-close aria-label="닫기">✕</button>
        <div class="modal__art" aria-hidden="true">🔒</div>
        <h3 id="alTitle">관리자 모드</h3>
        <p>비밀번호를 입력하면 관리자 화면이 열려요.</p>
        <input type="password" id="adminPw" class="admin-input" placeholder="비밀번호" autocomplete="current-password" />
        <p class="field__err" id="adminErr" role="alert"></p>
        <button class="btn btn--primary modal__cta" type="submit">들어가기</button>
      </form>`;
    document.body.appendChild(m);
    requestAnimationFrame(() => m.classList.add("is-open"));
    const input = m.querySelector("#adminPw");
    setTimeout(() => input.focus(), 50);
    const close = () => { m.classList.remove("is-open"); setTimeout(() => m.remove(), 250); document.removeEventListener("keydown", onKey); };
    const onKey = (e) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    m.addEventListener("click", (e) => e.target.closest("[data-close]") && close());
    m.querySelector("form").addEventListener("submit", (e) => {
      e.preventDefault();
      const err = m.querySelector("#adminErr");
      if (!input.value) { err.textContent = "비밀번호를 입력해 주세요."; return; }
      if (hashPw(input.value) !== C.admin.passwordHash) {
        err.textContent = "비밀번호가 맞지 않아요.";
        input.select(); m.querySelector(".modal__box").classList.add("shake");
        setTimeout(() => m.querySelector(".modal__box").classList.remove("shake"), 400);
        return;
      }
      ss.set("adminAuthed", C.admin.passwordHash);
      if (window.ServerDB) window.ServerDB.login(input.value); // 서버 기록(면담 신청·진행 보고)을 볼 열쇠도 함께 받음
      syncLock(); close(); openAdmin(nextTab, nextOpts);
    });
  }

  /* ───── 편집기 라벨 ───── */
  const L = {
    site: "기본 정보", hero: "첫 화면", university: "대학", department: "학과", course: "과목명", title: "제목",
    shortTitle: "짧은 제목(헤더)", footerNote: "맨 아래 저작권 문구", badge: "배지", subtitle: "부제", description: "설명",
    buttons: "버튼", label: "표시 이름 (주차는 예: 5~6주)", href: "링크", style: "모양 (primary / ghost)", icon: "아이콘(이모지)", value: "값",
    suffix: "단위", text: "내용", name: "이름", eyebrow: "작은 영문 제목", items: "항목", q: "질문", a: "답변", id: "아이디",
    weeks: "주차", topics: "핵심 질문 / 학습 내용", videos: "참고 영상", dates: "수업 날짜 (YYYY-MM-DD)",
    readings: "필수 읽기", refs: "참고 문헌", notes: "안내 사항", exam: "시험 주간", topicsTitle: "핵심 질문 영역 제목", url: "주소", assignment: "과제", due: "마감 (YYYY-MM-DD HH:MM)",
    date: "날짜 (YYYY-MM-DD)", time: "시간", location: "장소", startDate: "첫 수업일 (YYYY-MM-DD)", holidays: "휴강일",
    submitUrl: "외부 제출 링크 (비우면 사이트 안에서 제출)", weeksTitle: "주차 목록 제목", calendarTitle: "달력 제목",
    options: "선택지", role: "소속", photo: "사진 경로", bio: "소개", contacts: "연락처", enabled: "사용", delaySeconds: "뜨는 시간(초)",
    button: "버튼", confetti: "첫 방문 폭죽", message: "환영 문구", fields: "입력 항목", type: "종류", required: "필수 항목",
    placeholder: "예시 문구", pattern: "형식 검사(정규식)", patternMessage: "형식 오류 안내", submitLabel: "제출 버튼 문구",
    successTitle: "완료 제목", successText: "완료 안내", maxSizeMB: "최대 파일 크기(MB)", accept: "허용 파일 형식",
    size: "카드 크기 (s / m / l)", pinned: "중요 공지", quickInfo: "수업 정보", stats: "통계 카드", intro: "강의 목표 제목·개요",
    strengths: "강의 목표 슬라이드", curriculum: "주차별 일정", guide: "교재·평가 영역 제목", tools: "강의 교재", prep: "평가 방법", faq: "FAQ",
    professor: "연락처 (페이지 끝)", popup: "안내 팝업", welcome: "환영 효과", nav: "상단 메뉴", participate: "참여하기 제목", poll: "투표",
    apply: "수강 신청서", login: "로그인 안내", submission: "과제 제출 설정",
    portfolio: "우수 과제", works: "과제", note: "아래 안내 문구", sample: "'예시' 표시", award: "수상 표시 (예: 최우수, 비우면 없음)",
    semester: "학기", authors: "참여 학생", summary: "카드 요약", detail: "자세한 설명", tags: "태그",
    driveUrl: "구글 드라이브 공유 주소 (링크가 있는 모든 사용자 보기 권한)",
    // ── 개인 홈페이지 항목 ──
    features: "화면에 보일 영역 (체크하면 보임)", notices: "공지사항", petals: "꽃잎 장식", join: "참여하기 (투표·신청서·로그인)",
    nameEn: "영문 이름", position: "직위", tagline: "한 줄 소개 (줄바꿈 가능)", keywords: "키워드",
    about: "소개", timelineTitle: "약력 제목", timeline: "약력", group: "구분 (학력 / 경력 / 주요 활동)", year: "연도",
    research: "연구", statement: "연구 소개 글", projectsTitle: "프로젝트 제목", projects: "연구 프로젝트",
    period: "기간 (예: 2024.03 ~ 2027.02)", funder: "지원 기관", status: "상태 (진행 중 / 완료)",
    publications: "논문·저서", types: "종류 목록", scholarUrl: "Google Scholar 주소 (비우면 버튼 숨김)",
    venue: "학술지 · 출판사", doi: "DOI (예: 10.1080/…)", kci: "KCI 주소",
    teaching: "강의", courses: "과목", en: "영문 과목명", link: "링크 (강의 사이트 등)", linkLabel: "링크 글씨",
    advisees: "지도학생", groups: "과정", members: "학생", field: "전공",
    "research.topicsTitle": "연구 주제 영역 제목", "research.topics": "연구 주제", "research.role": "역할",
    "publications.items": "논문·저서 목록", "publications.authors": "저자", "publications.detail": "권·호·쪽",
    "publications.type": "종류 (국내 학술지 / 해외 학술지 / 저서 / 학술대회)", "publications.url": "원문 주소",
    "advisees.title": "제목", "professor.bio": "안내 문구", "professor.role": "직위",
    // ── 3·4단계 항목 ──
    semesters: "학기", term: "학기 이름 (예: 2026년 2학기)", level: "구분 (학부 / 대학원)", schedule: "시간 · 장소",
    syllabus: "강의계획서 링크 (구글 드라이브 등)", site: "강의 사이트 주소", siteLabel: "강의 사이트 버튼 글씨",
    showcase: "학생 우수 작품", "advisees.students": "지도학생 목록", program: "과정 (박사과정 / 석사과정)", major: "전공",
    topic: "연구 주제", thesis: "학위논문 제목", "advisees.status": "상태 (재학 / 졸업)", "advisees.year": "연도 (예: 2024 입학, 2023 졸업)",
    public: "사이트에 공개 (끄면 '비공개'로 표시)", lab: "연구실 소개", intro: "소개 글", "lab.topics": "함께 다루는 주제",
    "lab.topicsTitle": "주제 영역 제목", mentoringTitle: "지도 방식 제목", mentoring: "지도 방식", rulesTitle: "연구실 규칙 제목",
    rules: "연구실 규칙", consult: "입학 · 지도 문의", "consult.guide": "안내 항목", form: "면담 신청서",
    resources: "자료실", category: "분류 (같은 분류끼리 묶여요)", "resources.items": "자료 목록", "resources.note": "설명",
    // ── 5단계 항목 ──
    "advisees.photo": "사진 (선택 — images/파일명.jpg 또는 구글 드라이브 공유 주소)", "advisees.keywords": "연구 분야 키워드",
    "advisees.works": "대표 연구 업적", "advisees.type": "종류 (학술지 / 학회 발표 / 수상 / 프로젝트 / 기타)",
    "advisees.link": "링크 (원문 · 발표자료 등)", "advisees.venue": "학술지 · 학회 · 수여 기관",
    "works.year": "연도", "students.year": "연도 (예: 2024 입학, 2023 졸업)",
    stages: "학위논문 진행 단계 이름", stage: "완료한 단계 수 (0 = 시작 전)", stageDates: "단계별 완료 시기 (예: 2025.12)",
    codeHash: "개인 코드 (암호화 — '지도학생 관리' 탭에서 발급)", portal: "학생 전용 공간",
    labEvents: "랩 일정", who: "대상 ('전체' 또는 학생 이름)", weekly: "매주 반복", until: "반복 종료일",
    sheets: "구글 시트 연결", endpoint: "Apps Script 웹 앱 주소", sheetUrl: "구글 시트 주소", "sheets.key": "확인 키"
  };
  // 섹션 내용 탭의 영역 목록 — 앞쪽은 개인 홈페이지, 뒤쪽은 강의 사이트에서 가져온 (지금은 숨긴) 영역
  const SECTIONS = [
    { label: "상단 메뉴", keys: ["nav"] },
    { label: "화면 표시 켜기/끄기", keys: ["features"] },
    { label: "소개", keys: ["about"] },
    { label: "연구", keys: ["research"] },
    { label: "논문·저서", keys: ["publications"] },
    { label: "강의", keys: ["teaching"] },
    { label: "학생 우수 작품", keys: ["showcase"] },
    { label: "지도학생", keys: ["advisees"] },
    { label: "연구실 소개", keys: ["lab"] },
    { label: "입학·지도 문의", keys: ["consult"] },
    { label: "자료실", keys: ["resources"] },
    { label: "학생 전용 공간", keys: ["portal"] },
    { label: "연락처", keys: ["professor"] },
    { label: "주차별 일정", keys: ["curriculum"], lecture: true },
    { label: "수강 안내 (교재·평가)", keys: ["guide", "tools", "prep"], lecture: true },
    { label: "우수 과제", keys: ["portfolio"], lecture: true },
    { label: "참여하기 (투표·신청서·로그인)", keys: ["participate", "poll", "apply", "login", "submission"], lecture: true },
    { label: "FAQ", keys: ["faq"], lecture: true },
    { label: "안내 팝업 · 환영 효과", keys: ["popup", "welcome"], lecture: true }
  ].filter((s) => s.keys.some((k) => k in C));
  const TEMPLATES = {
    topics: "", options: "", dates: "", readings: "", refs: "", notes: "", tags: "", keywords: "", types: "",
    timeline: { group: "주요 활동", year: "", text: "" },
    projects: { title: "", period: "", funder: "", role: "", status: "진행 중", text: "" },
    courses: { icon: "📘", title: "", en: "", text: "", link: "", linkLabel: "" },
    groups: { title: "", members: [{ name: "", field: "" }] }, members: { name: "", field: "" },
    semesters: { term: "", courses: [{ icon: "📘", title: "", en: "", level: "", schedule: "", text: "", syllabus: "", site: "", siteLabel: "" }] },
    students: { name: "", status: "재학", program: "석사과정", major: "", topic: "", thesis: "", year: "", public: true, stage: 0, stageDates: ["", "", "", "", ""], codeHash: "", photo: "", keywords: [""], works: [] },
    // 같은 이름이라도 영역마다 모양이 다른 목록 ("영역.이름"을 먼저 찾음)
    "advisees.works": { year: "", type: "학술지", title: "", venue: "", link: "" }, "advisees.keywords": "",
    mentoring: "", rules: "", guide: { icon: "", title: "", text: "" },
    works: { type: "팀 프로젝트", award: "", semester: "", icon: "📄", title: "", authors: "", summary: "", detail: "", tags: [""], driveUrl: "" },
    videos: { label: "", url: "" }, holidays: { date: "", label: "" },
    buttons: { label: "", href: "", style: "primary" }, contacts: { icon: "", label: "", value: "", href: "" },
    items: { icon: "", text: "" }, weeks: { label: "", dates: [""], title: "새 주차", topics: [""], readings: [], refs: [] }
  };
  // 새 항목을 만들 때 기존 항목 모양을 따라 빈칸으로 (공개 여부는 기본 '공개', 상태 값은 그대로 이어받음)
  const KEEP = ["status", "program", "type", "category", "icon"];
  const blank = (v, key) => Array.isArray(v) ? [] : v && typeof v === "object"
    ? Object.fromEntries(Object.entries(v).filter(([k]) => k !== "assignment").map(([k, x]) => [k, blank(x, k)]))
    : KEEP.includes(key) ? v
    : typeof v === "number" ? 0 : typeof v === "boolean" ? key === "public" : "";
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const getAt = (o, p) => p.reduce((x, k) => (x == null ? x : x[k]), o);
  const setAt = (o, p, v) => { getAt(o, p.slice(0, -1))[p[p.length - 1]] = v; };
  const itemName = (it, i) => (it && typeof it === "object" ? it.title || it.label || it.name || it.q || it.id : it) || `${i + 1}번`;

  /* ───── 관리자 화면 ───── */
  let draft, dirty = false, tab = "info", sectionIdx = 0, root, calOpts = null, calForm = null;
  // 강의 전용 탭은 해당 기능(features)이 켜져 있을 때만 보임
  const FEAT = C.features || {};
  const TABS = [
    ["info", "⚙️", "사이트 정보"], ["content", "🧩", "섹션 내용"],
    ["advisees", "🎓", "지도학생 관리"], ["consults", "🌿", "면담 신청"],
    ["notices", "📢", "공지"], ["sheets", "📊", "구글 시트 연결"], ["file", "💾", "설정 파일"],
    // ↓ 강의 사이트에서 가져온 탭 (해당 기능을 켰을 때만 보임)
    ["calendar", "📅", "수업 일정", "curriculum"], ["students", "👥", "수강생 명단", "join"],
    ["applications", "📝", "수강 신청", "join"], ["attendance", "✅", "출석", "join"], ["submissions", "📎", "과제", "join"], ["poll", "🗳️", "투표", "join"]
  ].filter((t) => !t[3] || FEAT[t[3]] !== false);

  function openAdmin(startTab, opts) {
    if (document.querySelector(".admin")) return;
    document.querySelectorAll(".modal").forEach((m) => m.remove());
    syncLock(); // 편집 버튼 표시 상태를 로그인 상태에 맞춤
    draft = clone(window.SITE_CONFIG); dirty = false; tab = startTab || tab;
    opts = opts || {};
    if (opts.sec) { const i = SECTIONS.findIndex((s) => s.label === opts.sec); if (i >= 0) sectionIdx = i; }
    calOpts = tab === "calendar" ? opts : null; calForm = null;
    issued = null; labEdit = null; // 발급한 코드는 관리자 화면을 다시 열면 보이지 않게
    root = document.createElement("div");
    root.className = "admin";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-label", "관리자 화면");
    root.innerHTML = `
      <header class="admin__top">
        <strong>🔓 관리자 모드</strong>
        <div class="admin__top-btns">
          <button class="pill-btn" id="adLogout">로그아웃</button>
          <button class="pill-btn pill-btn--solid" id="adClose">사이트로 돌아가기</button>
        </div>
      </header>
      <div class="admin__body">
        <nav class="admin__tabs" role="tablist">${TABS.map(([id, ic, lb]) =>
          `<button role="tab" data-tab="${id}" aria-selected="${id === tab}"><span>${ic}</span>${lb}</button>`).join("")}</nav>
        <div class="admin__main" id="adMain"></div>
      </div>
      <div class="admin__save" id="adSave" hidden>
        <span>저장하지 않은 변경 사항이 있어요.</span>
        <button class="pill-btn" id="adDiscard">되돌리기</button>
        <button class="btn btn--primary" id="adApply">저장하고 적용</button>
      </div>`;
    document.body.appendChild(root);
    document.body.classList.add("no-scroll");

    root.querySelector(".admin__tabs").addEventListener("click", (e) => {
      const b = e.target.closest("[data-tab]"); if (!b) return;
      tab = b.dataset.tab;
      root.querySelectorAll("[data-tab]").forEach((x) => x.setAttribute("aria-selected", x === b));
      draw();
    });
    root.querySelector("#adClose").addEventListener("click", closeAdmin);
    root.querySelector("#adLogout").addEventListener("click", () => {
      if (dirty && !confirm("저장하지 않은 변경 사항이 사라져요. 로그아웃할까요?")) return;
      ss.del("adminAuthed"); if (window.ServerDB) window.ServerDB.logout(); for (const k in remote) delete remote[k];
      dirty = false; closeAdmin(); syncLock(); window.toast("관리자 모드에서 나왔어요.");
    });
    root.querySelector("#adDiscard").addEventListener("click", () => { draft = clone(window.SITE_CONFIG); setDirty(false); draw(); });
    root.querySelector("#adApply").addEventListener("click", applyDraft);
    root.addEventListener("keydown", (e) => e.key === "Escape" && closeAdmin());
    draw();
    root.querySelector(`[data-tab="${tab}"]`).focus();
  }

  function closeAdmin() {
    if (dirty && !confirm("저장하지 않은 변경 사항이 사라져요. 닫을까요?")) return;
    root.remove(); root = null; document.body.classList.remove("no-scroll");
  }
  const setDirty = (v = true) => { dirty = v; root.querySelector("#adSave").hidden = !v; };
  function applyDraft() {
    S.set("config", draft);
    ss.set("adminReopen", tab);
    if (draft.admin.passwordHash !== C.admin.passwordHash) ss.set("adminAuthed", draft.admin.passwordHash);
    dirty = false;
    location.reload();
  }

  function draw() {
    const main = root.querySelector("#adMain");
    main.scrollTop = 0;
    ({ info: drawInfo, content: drawContent, calendar: drawCalendar, students: drawStudents, consults: drawConsults,
       advisees: drawAdvisees, labcal: drawLabCal, sheets: drawSheets, notices: drawNotices, applications: drawApps,
       attendance: drawAttendance, submissions: drawSubs, poll: drawPoll, file: drawFile })[tab](main);
  }
  const h2 = (t, sub) => `<div class="ad-head"><h2>${t}</h2>${sub ? `<p>${sub}</p>` : ""}</div>`;
  const overrideNote = () => S.get("config", null)
    ? `<p class="ad-note">💡 지금 이 브라우저에는 관리자 화면에서 고친 설정이 적용되어 있어요. 다른 방문자에게도 보이게 하려면 <b>설정 파일</b> 탭에서 config.js를 저장해 다시 배포하세요.</p>` : "";

  /* ───── 범용 편집기: 설정 값의 모양대로 입력칸을 만듦 ───── */
  function editorHTML(val, path, key) {
    const p = esc(JSON.stringify(path));
    // 같은 이름이라도 영역마다 뜻이 다를 수 있어 "영역.이름" 라벨을 먼저 찾음 (예: publications.detail)
    const parent = [...path.slice(0, -1)].reverse().find((x) => typeof x === "string" && x !== key); // 바로 위 목록 이름
    const lb = L[`${parent}.${key}`] || L[`${path[0]}.${key}`] || L[key] || key;
    if (Array.isArray(val)) {
      const tpl = TEMPLATES[`${path[0]}.${key}`] ?? TEMPLATES[key];
      const prim = val.length ? typeof val[0] !== "object" : typeof tpl !== "object";
      return `
        <fieldset class="ed-arr">
          <legend>${esc(lb)} <small>${val.length}개</small></legend>
          ${val.map((it, i) => {
            const ip = esc(JSON.stringify([...path, i]));
            const tools = `<span class="ed-tools">
                <button type="button" data-act="up" data-path="${ip}" aria-label="위로" ${i === 0 ? "disabled" : ""}>↑</button>
                <button type="button" data-act="down" data-path="${ip}" aria-label="아래로" ${i === val.length - 1 ? "disabled" : ""}>↓</button>
                <button type="button" data-act="del" data-path="${ip}" aria-label="삭제">✕</button></span>`;
            if (prim) return `<div class="ed-prim">${inputHTML(it, [...path, i], `${i + 1}`, key)}${tools}</div>`;
            return `<details class="ed-item" ${val.length <= 4 ? "open" : ""}>
                <summary><span>${esc(itemName(it, i))}</span>${tools}</summary>
                <div class="ed-fields">${objFields(it, [...path, i], key)}</div></details>`;
          }).join("")}
          <button type="button" class="ed-add" data-act="add" data-path="${p}" data-key="${esc(key)}">+ ${esc(lb)} 추가</button>
        </fieldset>`;
    }
    if (val && typeof val === "object") {
      return `<fieldset class="ed-obj"><legend>${esc(lb)}</legend><div class="ed-fields">${objFields(val, path, key)}</div></fieldset>`;
    }
    return inputHTML(val, path, lb, key);
  }
  function objFields(obj, path, parentKey) {
    let html = Object.entries(obj).map(([k, v]) => editorHTML(v, [...path, k], k)).join("");
    if (parentKey === "weeks") {
      html += obj.assignment
        ? `<button type="button" class="ed-add ed-add--del" data-act="noTask" data-path="${esc(JSON.stringify(path))}">과제 없애기</button>`
        : `<button type="button" class="ed-add" data-act="addTask" data-path="${esc(JSON.stringify(path))}">+ 이 주에 과제 추가</button>`;
    }
    return html;
  }
  function inputHTML(v, path, label, key) {
    const p = esc(JSON.stringify(path));
    const id = "ed" + Math.random().toString(36).slice(2, 8);
    if (typeof v === "boolean")
      return `<label class="ed-bool"><input type="checkbox" data-path="${p}" ${v ? "checked" : ""}/> ${esc(label)}</label>`;
    if (typeof v === "number")
      return `<div class="ed-field"><label for="${id}">${esc(label)}</label><input id="${id}" type="number" data-path="${p}" data-num value="${v}"/></div>`;
    if (key === "driveUrl") // 구글 드라이브 주소만 받음 — 입력하면 바로 확인 결과 표시
      return `<div class="ed-field ed-field--wide"><label for="${id}">${esc(label)}</label>
        <input id="${id}" data-path="${p}" data-drive value="${esc(v)}" placeholder="https://drive.google.com/file/d/…/view?usp=sharing" inputmode="url"/>
        <small class="ed-hint is-${driveState(v)}">${driveHint(v)}</small></div>`;
    const long = String(v).length > 48 || String(v).includes("\n") || ["description", "text", "bio", "a", "summary", "detail"].includes(key);
    return `<div class="ed-field ${long ? "ed-field--wide" : ""}"><label for="${id}">${esc(label)}</label>${long
      ? `<textarea id="${id}" rows="3" data-path="${p}">${esc(v)}</textarea>`
      : `<input id="${id}" data-path="${p}" value="${esc(v)}"/>`}</div>`;
  }
  const driveState = (v) => (!v || !String(v).trim() ? "empty" : window.parseDrive && window.parseDrive(v) ? "ok" : "bad");
  function driveHint(v) {
    if (!v || !String(v).trim()) return "비워두면 '자료 준비 중'으로 보여요.";
    const d = window.parseDrive ? window.parseDrive(v) : null;
    return d ? `✓ ${d.label}로 확인됐어요.` : "⚠️ 구글 드라이브(drive.google.com · docs.google.com) 공유 주소만 넣을 수 있어요.";
  }
  function bindEditor(box, redraw) {
    box.addEventListener("input", (e) => {
      const el = e.target; if (!el.dataset.path) return;
      const path = JSON.parse(el.dataset.path);
      setAt(draft, path, el.type === "checkbox" ? el.checked : "num" in el.dataset ? Number(el.value) : el.value);
      if ("drive" in el.dataset) {
        const hint = el.parentElement.querySelector(".ed-hint");
        hint.textContent = driveHint(el.value);
        hint.className = `ed-hint is-${driveState(el.value)}`;
      }
      setDirty();
    });
    box.addEventListener("click", (e) => {
      const b = e.target.closest("[data-act]"); if (!b) return;
      e.preventDefault();
      const path = JSON.parse(b.dataset.path), act = b.dataset.act;
      if (act === "add") {
        const arr = getAt(draft, path), key = b.dataset.key;
        arr.push(arr.length ? blank(arr[arr.length - 1]) : clone(TEMPLATES[`${path[0]}.${key}`] ?? TEMPLATES[key] ?? ""));
      } else if (act === "addTask") {
        getAt(draft, path).assignment = { title: "", text: "", due: "" };
      } else if (act === "noTask") {
        delete getAt(draft, path).assignment;
      } else {
        const i = path.pop(), arr = getAt(draft, path);
        if (act === "del") { if (!confirm(`'${itemName(arr[i], i)}' 항목을 지울까요?`)) return; arr.splice(i, 1); }
        if (act === "up") [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
        if (act === "down") [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]];
      }
      setDirty(); redraw();
    });
  }

  /* ── 탭: 사이트 정보 ── */
  function drawInfo(main) {
    main.innerHTML = h2("사이트 정보", "학과명, 과목명, 첫 화면 문구를 고칠 수 있어요. 고친 뒤 아래 '저장하고 적용'을 눌러주세요.") + overrideNote() + `
      <div class="ed" id="ed">${editorHTML(draft.site, ["site"], "site")}${editorHTML(draft.hero, ["hero"], "hero")}</div>
      <fieldset class="ed-obj">
        <legend>관리자 비밀번호 바꾸기</legend>
        <div class="ed-fields">
          <div class="ed-field"><label for="pw1">새 비밀번호 (6자 이상)</label><input type="password" id="pw1" autocomplete="new-password"/></div>
          <div class="ed-field"><label for="pw2">새 비밀번호 확인</label><input type="password" id="pw2" autocomplete="new-password"/></div>
        </div>
        <p class="field__err" id="pwErr" role="alert"></p>
        <button type="button" class="pill-btn pill-btn--solid" id="pwSet">비밀번호 바꾸기</button>
      </fieldset>`;
    const ed = main.querySelector("#ed");
    bindEditor(ed, () => drawInfo(main));
    main.querySelector("#pwSet").addEventListener("click", () => {
      const a = main.querySelector("#pw1").value, b = main.querySelector("#pw2").value, err = main.querySelector("#pwErr");
      if (a.length < 6) { err.textContent = "6자 이상으로 정해 주세요."; return; }
      if (a !== b) { err.textContent = "두 비밀번호가 서로 달라요."; return; }
      draft.admin.passwordHash = hashPw(a);
      err.textContent = ""; main.querySelector("#pw1").value = main.querySelector("#pw2").value = "";
      setDirty(); window.toast("새 비밀번호는 '저장하고 적용'을 눌러야 반영돼요.");
    });
  }

  /* ── 탭: 섹션 내용 ── */
  function drawContent(main) {
    const sec = SECTIONS[sectionIdx];
    main.innerHTML = h2("섹션 내용", "고칠 영역을 고르세요. 항목 추가(+), 순서 바꾸기(↑↓), 삭제(✕)도 할 수 있어요.") + `
      <div class="ad-chips">${SECTIONS.map((s, i) =>
        `<button class="ad-chip ${s.lecture ? "ad-chip--lecture" : ""}" data-sec="${i}" aria-pressed="${i === sectionIdx}">${esc(s.label)}${s.lecture ? " <small>강의용·숨김</small>" : ""}</button>`).join("")}</div>
      <div class="ed" id="ed">${sec.keys.map((k) => editorHTML(draft[k], [k], k)).join("")}</div>`;
    main.querySelector(".ad-chips").addEventListener("click", (e) => {
      const b = e.target.closest("[data-sec]"); if (!b) return;
      sectionIdx = +b.dataset.sec; drawContent(main);
    });
    bindEditor(main.querySelector("#ed"), () => { const y = main.scrollTop; drawContent(main); main.scrollTop = y; });
  }

  /* ── 탭: 수업 일정 (월간 달력의 일정 추가·수정·삭제) ──
   * 수업 → curriculum.weeks[].dates, 휴강 → curriculum.holidays, 그 밖의 일정 → curriculum.events */
  const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
  const EVENT_TYPES = ["일정", "행사", "특강", "보강"];
  const KIND_OPTS = [["class", "수업 (주차에 연결)"], ["휴강", "휴강"], ...EVENT_TYPES.map((t) => [t, t])];
  const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || "");
  const dayLabel = (s) => {
    if (!isDate(s)) return esc(s || "날짜 없음");
    const [y, m, d] = s.split("-").map(Number);
    return `${m}/${d} (${DAYS[new Date(y, m - 1, d).getDay()]})`;
  };

  function drawCalendar(main) {
    const cur = draft.curriculum;
    cur.holidays = cur.holidays || []; cur.events = cur.events || [];
    const weekName = (w, wi) => `${w.label || `${wi + 1}주차`} · ${w.title}`;

    // 지금 어떤 일정을 가리키는지 확인 (없어졌으면 null)
    const resolve = (ref) => {
      if (!ref) return null;
      if (ref.kind === "class") {
        const w = cur.weeks[ref.wi];
        return w && (w.dates || []).includes(ref.date) ? { kind: "class", wi: ref.wi, date: ref.date } : null;
      }
      if (ref.kind === "holiday") {
        const i = ref.i != null && cur.holidays[ref.i] && cur.holidays[ref.i].date === ref.date ? ref.i
          : cur.holidays.findIndex((h) => h.date === ref.date);
        return i >= 0 ? { kind: "holiday", i, date: cur.holidays[i].date } : null;
      }
      if (ref.kind === "event") return cur.events[ref.i] ? { kind: "event", i: ref.i } : null;
      return null;
    };
    const describe = (r) => r.kind === "class" ? `${dayLabel(r.date)} ${weekName(cur.weeks[r.wi], r.wi)} 수업`
      : r.kind === "holiday" ? `${dayLabel(r.date)} ${cur.holidays[r.i].label}`
      : `${dayLabel(cur.events[r.i].date)} ${cur.events[r.i].title}`;
    const remove = (r) => {
      if (r.kind === "class") { const ds = cur.weeks[r.wi].dates; ds.splice(ds.indexOf(r.date), 1); }
      if (r.kind === "holiday") cur.holidays.splice(r.i, 1);
      if (r.kind === "event") cur.events.splice(r.i, 1);
    };
    const confirmDelete = (r) => {
      let msg = `'${describe(r).replace(/<[^>]+>/g, "")}' 일정을 지울까요?`;
      if (r.kind === "class" && cur.weeks[r.wi].dates.length === 1)
        msg += "\n\n이 주차의 마지막 수업 날짜라서, 지우면 주차별 일정 목록에서도 이 주차가 보이지 않게 돼요.";
      if (!confirm(msg)) return false;
      remove(r); setDirty(); calForm = null;
      window.toast("지웠어요. '저장하고 적용'을 눌러 반영하세요.");
      return true;
    };

    // 달력에서 넘어온 요청 처리 (이 날 추가 / 수정 / 삭제)
    if (calOpts) {
      const o = calOpts; calOpts = null;
      if (o.date) calForm = { date: o.date };
      if (o.edit) { const r = resolve(o.edit); calForm = r ? { ref: r } : null; }
      if (o.del) { const r = resolve(o.del); if (r) confirmDelete(r); }
    }
    if (calForm && calForm.ref && !resolve(calForm.ref)) calForm = null;

    // ── 전체 일정 목록 ──
    const rows = [];
    cur.weeks.forEach((w, wi) => (w.dates || []).forEach((d) =>
      rows.push({ date: d, cls: w.exam ? "exam" : "class", tag: w.exam ? "시험" : "수업", title: weekName(w, wi), ref: { kind: "class", wi, date: d } })));
    cur.holidays.forEach((h, i) => rows.push({ date: h.date, cls: "off", tag: "휴강", title: h.label, ref: { kind: "holiday", i, date: h.date } }));
    cur.events.forEach((e, i) => rows.push({ date: e.date, cls: "event", tag: e.type || "일정", title: e.title,
      sub: [e.time, e.location, e.note].filter(Boolean).join(" · "), ref: { kind: "event", i } }));
    cur.weeks.forEach((w) => w.assignment && w.assignment.due && rows.push({
      date: String(w.assignment.due).slice(0, 10), cls: "due", tag: "과제 마감", title: w.assignment.title, ro: true }));
    rows.sort((a, b) => String(a.date).localeCompare(String(b.date)));
    const count = (c) => rows.filter((r) => r.cls === c).length;

    // ── 입력 양식 (추가 / 수정) ──
    const editing = calForm && calForm.ref ? resolve(calForm.ref) : null;
    let v = { kind: "일정", date: (calForm && calForm.date) || "", wi: "", title: "", time: "", location: "", note: "" };
    if (editing) {
      if (editing.kind === "class") v = { ...v, kind: "class", date: editing.date, wi: editing.wi };
      if (editing.kind === "holiday") v = { ...v, kind: "휴강", date: editing.date, title: cur.holidays[editing.i].label };
      if (editing.kind === "event") { const e = cur.events[editing.i]; v = { ...v, kind: e.type || "일정", date: e.date, title: e.title || "", time: e.time || "", location: e.location || "", note: e.note || "" }; }
    }

    main.innerHTML = h2("수업 일정", "월간 수업 달력에 보이는 수업·휴강·일정을 추가하고 고치고 지울 수 있어요. 바꾼 뒤 '저장하고 적용'을 눌러주세요.") + `
      <form class="ad-card cal-form ${editing ? "is-editing" : ""}" id="calForm" novalidate>
        <h3>${editing ? `✏️ 일정 수정 <small class="muted">${describe(editing)}</small>` : "➕ 새 일정 추가"}</h3>
        <div class="ed-fields">
          <div class="ed-field"><label for="cfKind">종류</label>
            <select id="cfKind">${KIND_OPTS.map(([val, lb]) => `<option value="${val}" ${val === v.kind ? "selected" : ""}>${lb}</option>`).join("")}</select></div>
          <div class="ed-field"><label for="cfDate">날짜</label><input type="date" id="cfDate" value="${esc(v.date)}" /></div>
          <div class="ed-field ed-field--wide cf-class"><label for="cfWeek">어느 주차 수업인가요?</label>
            <select id="cfWeek"><option value="">주차를 고르세요</option>${cur.weeks.map((w, wi) =>
              `<option value="${wi}" ${String(wi) === String(v.wi) ? "selected" : ""}>${esc(weekName(w, wi))}</option>`).join("")}</select>
            <small class="ed-hint">수업 시간·장소·내용은 '섹션 내용 → 주차별 일정'의 그 주차 설정을 따라요.</small></div>
          <div class="ed-field ed-field--wide cf-title"><label for="cfTitle" id="cfTitleLb">제목</label><input id="cfTitle" value="${esc(v.title)}" /></div>
          <div class="ed-field cf-ev"><label for="cfTime">시간</label><input id="cfTime" value="${esc(v.time)}" placeholder="예: 15:00 ~ 16:30" /></div>
          <div class="ed-field cf-ev"><label for="cfLoc">장소</label><input id="cfLoc" value="${esc(v.location)}" placeholder="예: 미디어관 410호" /></div>
          <div class="ed-field ed-field--wide cf-ev"><label for="cfNote">메모</label><textarea id="cfNote" rows="2">${esc(v.note)}</textarea></div>
        </div>
        <p class="field__err" id="cfErr" role="alert"></p>
        <div class="ad-row">
          <button class="btn btn--primary" type="submit">${editing ? "수정 내용 반영" : "추가하기"}</button>
          ${editing || (calForm && calForm.date) ? `<button class="pill-btn" type="button" id="cfCancel">취소</button>` : ""}
          ${editing ? `<button class="pill-btn cf-del" type="button" id="cfDel">🗑 이 일정 삭제</button>` : ""}
        </div>
      </form>

      <div class="ad-table-head"><h3>전체 일정 ${rows.length}개</h3>
        <span class="muted">수업 ${count("class")}회 · 시험 ${count("exam")}일 · 휴강 ${count("off")}일 · 기타 일정 ${count("event")}개</span></div>
      <div class="ad-table-wrap"><table class="ad-table cal-table">
        <thead><tr><th>날짜</th><th>종류</th><th>내용</th><th></th></tr></thead>
        <tbody>${rows.map((r, i) => {
          const month = isDate(r.date) ? `${r.date.slice(0, 4)}년 ${+r.date.slice(5, 7)}월` : "날짜 확인 필요";
          const prev = i ? (isDate(rows[i - 1].date) ? `${rows[i - 1].date.slice(0, 4)}년 ${+rows[i - 1].date.slice(5, 7)}월` : "날짜 확인 필요") : "";
          const isEd = editing && r.ref && JSON.stringify(resolve(r.ref)) === JSON.stringify(editing);
          return `${month !== prev ? `<tr class="tr-month"><td colspan="4">${month}</td></tr>` : ""}
            <tr class="${isEd ? "tr-editing" : ""}"><td class="td-date">${dayLabel(r.date)}</td>
              <td><span class="cal-k cal-k--${r.cls}">${esc(r.tag)}</span></td>
              <td class="td-long">${esc(r.title)}${r.sub ? `<small>${esc(r.sub)}</small>` : ""}</td>
              <td class="td-act">${r.ro ? `<span class="muted">주차별 일정에서 수정</span>` : `
                <button class="ad-x" data-row="${i}" data-act="edit">수정</button>
                <button class="ad-x" data-row="${i}" data-act="del">삭제</button>`}</td></tr>`;
        }).join("")}</tbody>
      </table></div>`;

    // 종류에 따라 필요한 칸만 보이기
    const form = main.querySelector("#calForm");
    const kindSel = form.querySelector("#cfKind");
    const syncKind = () => {
      const k = kindSel.value, isClass = k === "class", isOff = k === "휴강";
      form.querySelectorAll(".cf-class").forEach((el) => (el.hidden = !isClass));
      form.querySelectorAll(".cf-title").forEach((el) => (el.hidden = isClass));
      form.querySelectorAll(".cf-ev").forEach((el) => (el.hidden = isClass || isOff));
      form.querySelector("#cfTitleLb").textContent = isOff ? "휴강 사유 (예: 추석 휴강)" : "일정 제목";
    };
    kindSel.addEventListener("change", syncKind);
    syncKind();

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const err = form.querySelector("#cfErr");
      const k = kindSel.value, date = form.querySelector("#cfDate").value;
      const title = form.querySelector("#cfTitle").value.trim();
      if (!isDate(date)) { err.textContent = "날짜를 골라 주세요."; return; }
      if (k === "class") {
        const wi = form.querySelector("#cfWeek").value;
        if (wi === "") { err.textContent = "어느 주차 수업인지 골라 주세요."; return; }
        const same = editing && editing.kind === "class" && editing.wi === +wi && editing.date === date;
        if (!same && (cur.weeks[+wi].dates || []).includes(date)) { err.textContent = "그 주차에 이미 같은 날짜의 수업이 있어요."; return; }
        if (editing) remove(editing);
        const w = cur.weeks[+wi]; w.dates = [...(w.dates || []), date].sort();
      } else if (k === "휴강") {
        const dup = cur.holidays.findIndex((h) => h.date === date);
        if (dup >= 0 && !(editing && editing.kind === "holiday" && editing.i === dup)) { err.textContent = "그 날짜에는 이미 휴강이 등록돼 있어요."; return; }
        if (editing) remove(editing);
        cur.holidays.push({ date, label: title || "휴강" });
        cur.holidays.sort((a, b) => a.date.localeCompare(b.date));
      } else {
        if (!title) { err.textContent = "일정 제목을 적어 주세요."; return; }
        const old = editing && editing.kind === "event" ? cur.events[editing.i] : null;
        if (editing) remove(editing);
        cur.events.push({ id: (old && old.id) || "e" + Date.now(), date, type: k, title,
          time: form.querySelector("#cfTime").value.trim(), location: form.querySelector("#cfLoc").value.trim(),
          note: form.querySelector("#cfNote").value.trim() });
        cur.events.sort((a, b) => String(a.date).localeCompare(String(b.date)));
      }
      setDirty();
      window.toast(`${editing ? "수정했어요" : "추가했어요"}. '저장하고 적용'을 눌러 반영하세요.`);
      calForm = null; drawCalendar(main);
    });
    const cancel = form.querySelector("#cfCancel");
    if (cancel) cancel.addEventListener("click", () => { calForm = null; drawCalendar(main); });
    const del = form.querySelector("#cfDel");
    if (del) del.addEventListener("click", () => { if (confirmDelete(editing)) drawCalendar(main); });

    main.querySelectorAll(".cal-table [data-row]").forEach((b) => b.addEventListener("click", () => {
      const r = resolve(rows[+b.dataset.row].ref); if (!r) return;
      if (b.dataset.act === "edit") { calForm = { ref: r }; drawCalendar(main); main.scrollTop = 0; }
      else if (confirmDelete(r)) drawCalendar(main);
    }));
  }

  /* ── 탭: 수강생 명단 ── */
  function drawStudents(main) {
    const list = draft.students || (draft.students = []);
    main.innerHTML = h2("수강생 명단", "명단에 있는 학번 + 이름으로만 로그인할 수 있어요.") + `
      <div class="ad-card">
        <h3>한 명씩 추가</h3>
        <form class="ad-inline" id="stAdd" novalidate>
          <input name="id" placeholder="학번" inputmode="numeric" aria-label="학번" />
          <input name="name" placeholder="이름" aria-label="이름" />
          <button class="pill-btn pill-btn--solid">추가</button>
        </form>
        <p class="field__err" id="stErr" role="alert"></p>
      </div>
      <div class="ad-card">
        <h3>여러 명 한꺼번에 등록</h3>
        <p class="muted">한 줄에 한 명씩 <b>학번,이름</b> 형식으로 붙여 넣으세요. 엑셀에서 두 칸을 복사해 붙여 넣어도 돼요.</p>
        <textarea id="stBulk" rows="4" placeholder="2026000003,박석탑&#10;2026000004,최안암"></textarea>
        <div class="ad-row">
          <button class="pill-btn pill-btn--solid" id="stBulkBtn">등록하기</button>
          <button class="pill-btn" id="stFromApps">수강 신청자 모두 가져오기</button>
        </div>
      </div>
      <div class="ad-table-head"><h3>등록된 수강생 ${list.length}명</h3>
        <button class="pill-btn" id="stCsv">엑셀(CSV) 내려받기</button></div>
      ${list.length ? `<div class="ad-table-wrap"><table class="ad-table">
        <thead><tr><th>#</th><th>학번</th><th>이름</th><th></th></tr></thead>
        <tbody>${list.map((s, i) => `<tr><td>${i + 1}</td><td>${esc(s.id)}</td><td>${esc(s.name)}</td>
          <td><button class="ad-x" data-del="${i}" aria-label="${esc(s.name)} 삭제">삭제</button></td></tr>`).join("")}</tbody>
      </table></div>` : `<p class="ad-empty">아직 등록된 수강생이 없어요.</p>`}`;

    const add = (id, name) => {
      id = String(id).trim(); name = String(name).trim();
      if (!id || !name) return "skip";
      if (list.some((s) => String(s.id) === id)) return "dup";
      list.push({ id, name }); return "ok";
    };
    main.querySelector("#stAdd").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = e.target, err = main.querySelector("#stErr");
      const r = add(f.elements.id.value, f.elements.name.value);
      if (r === "skip") { err.textContent = "학번과 이름을 모두 입력해 주세요."; return; }
      if (r === "dup") { err.textContent = "이미 등록된 학번이에요."; return; }
      setDirty(); drawStudents(main);
    });
    main.querySelector("#stBulkBtn").addEventListener("click", () => {
      const lines = main.querySelector("#stBulk").value.split(/\r?\n/);
      let ok = 0, dup = 0;
      lines.forEach((ln) => { const [id, name] = ln.split(/[,\t]/); const r = add(id || "", name || ""); if (r === "ok") ok++; if (r === "dup") dup++; });
      window.toast(`${ok}명 추가${dup ? `, ${dup}명은 이미 있어요` : ""}.`);
      if (ok) { setDirty(); drawStudents(main); }
    });
    main.querySelector("#stFromApps").addEventListener("click", () => {
      let ok = 0; S.get("applications", []).forEach((a) => add(a.studentId, a.name) === "ok" && ok++);
      window.toast(ok ? `신청자 ${ok}명을 명단에 추가했어요.` : "새로 추가할 신청자가 없어요.");
      if (ok) { setDirty(); drawStudents(main); }
    });
    main.querySelector("#stCsv").addEventListener("click", () => csv("수강생명단", [["학번", "이름"], ...list.map((s) => [s.id, s.name])]));
    main.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => {
      const s = list[+b.dataset.del];
      if (!confirm(`${s.name}(${s.id}) 님을 명단에서 지울까요?`)) return;
      list.splice(+b.dataset.del, 1); setDirty(); drawStudents(main);
    }));
  }

  /* ── 탭: 공지 ── */
  function drawNotices(main) {
    const list = draft.notices || (draft.notices = []);
    const today = fmtTime(new Date().toISOString()).slice(0, 10);
    main.innerHTML = h2("공지", "올린 공지는 첫 화면 아래 '공지사항'에 보여요.") + `
      <form class="ad-card" id="ntForm" novalidate>
        <h3>새 공지 올리기</h3>
        <div class="ed-fields">
          <div class="ed-field ed-field--wide"><label for="ntTitle">제목</label><input id="ntTitle" /></div>
          <div class="ed-field ed-field--wide"><label for="ntText">내용</label><textarea id="ntText" rows="4"></textarea></div>
          <div class="ed-field"><label for="ntDate">날짜</label><input id="ntDate" type="date" value="${today}" /></div>
          <label class="ed-bool"><input type="checkbox" id="ntPin" /> 중요 공지 (맨 위에 고정)</label>
        </div>
        <p class="field__err" id="ntErr" role="alert"></p>
        <button class="btn btn--primary">공지 올리기</button>
      </form>
      <div class="ad-table-head"><h3>올린 공지 ${list.length}개</h3></div>
      ${list.length ? list.map((n, i) => `
        <div class="ad-notice">
          <div><strong>${n.pinned ? "📌 " : ""}${esc(n.title)}</strong><small>${esc(n.date)}</small><p>${esc(n.text)}</p></div>
          <button class="ad-x" data-del="${i}">삭제</button>
        </div>`).join("") : `<p class="ad-empty">올린 공지가 없어요.</p>`}`;
    main.querySelector("#ntForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const t = main.querySelector("#ntTitle").value.trim(), x = main.querySelector("#ntText").value.trim();
      if (!t || !x) { main.querySelector("#ntErr").textContent = "제목과 내용을 모두 입력해 주세요."; return; }
      list.unshift({ id: "n" + Date.now(), date: main.querySelector("#ntDate").value || today, title: t, text: x, pinned: main.querySelector("#ntPin").checked });
      setDirty(); drawNotices(main);
      window.toast("공지를 추가했어요. '저장하고 적용'을 눌러 반영하세요.");
    });
    main.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => {
      if (!confirm("이 공지를 지울까요?")) return;
      list.splice(+b.dataset.del, 1); setDirty(); drawNotices(main);
    }));
  }

  /* ── 탭: 지도학생 관리 (진행 단계 · 개인 코드 · 주간 보고) ── */
  let issued = null; // 방금 발급한 코드 (화면에 한 번만 보여줌)
  let reportFilter = "전체";
  function drawAdvisees(main) {
    const A = draft.advisees || (draft.advisees = { students: [] });
    const stages = A.stages || ["계획서", "연구윤리(IRB) 승인", "예비심사", "본심사", "인준"];
    const list = A.students || (A.students = []);
    const redraw = () => root && tab === "advisees" && drawAdvisees(root.querySelector("#adMain"));
    const sv = useServer("report", redraw);
    const reports = sv.rows || S.get("reports", []);
    const stageName = (n) => (n <= 0 ? "시작 전" : n >= stages.length ? "모든 단계 완료" : `${stages[n - 1]} 완료`);
    const sheetLink = (draft.sheets || {}).sheetUrl;
    const shown = reports.map((r, i) => ({ ...r, _i: i })).filter((r) => reportFilter === "전체" || r["이름"] === reportFilter).reverse();

    main.innerHTML = h2("지도학생 관리", "학위논문 진행 단계를 바꾸고, 학생 전용 공간 로그인용 개인 코드를 발급하고, 주간 진행 보고를 확인해요.") + `
      ${issued ? `<div class="ad-note code-note">🔑 <b>${esc(issued.name)}</b> 님 개인 코드: <code class="code-big">${esc(issued.code)}</code>
        <br>학생에게 이 코드를 알려주세요. 화면을 벗어나면 다시 볼 수 없어요. <b>'저장하고 적용'</b> 후 config.js에 반영·배포해야 학생이 로그인할 수 있어요.</div>` : ""}
      <div class="ad-table-wrap"><table class="ad-table">
        <thead><tr><th>이름</th><th>과정</th><th>학위논문 진행 단계</th><th>개인 코드</th><th>보고</th></tr></thead>
        <tbody>${list.map((s, i) => {
          const mine = reports.filter((r) => r["이름"] === s.name);
          const last = mine.length ? mine[mine.length - 1]["보고 기준일"] : "";
          return `<tr>
            <td><b>${esc(s.name)}</b>${s.public === false ? ` <small class="muted">(비공개)</small>` : ""}</td>
            <td>${esc([s.program, s.major].filter(Boolean).join(" · "))}</td>
            <td><select class="ad-select" data-stage="${i}" aria-label="${esc(s.name)} 진행 단계">
              ${Array.from({ length: stages.length + 1 }, (_, n) => `<option value="${n}" ${Number(s.stage || 0) === n ? "selected" : ""}>${n}. ${esc(stageName(n))}</option>`).join("")}
            </select></td>
            <td>${s.codeHash ? `<span class="chip chip--week">발급됨</span>` : `<span class="muted">없음</span>`}
              <button class="ad-x" data-code="${i}">${s.codeHash ? "재발급" : "발급"}</button></td>
            <td>${mine.length}건${last ? `<br><small class="muted">최근 ${esc(last)}</small>` : ""}</td>
          </tr>`;
        }).join("")}</tbody>
      </table></div>
      <p class="muted ad-hint">단계별 완료 시기와 연구 주제·학위논문 제목은 <b>섹션 내용 → 지도학생</b>에서 고칠 수 있어요.</p>

      <div class="ad-table-head"><h3>주간 진행 보고 ${reports.length}건</h3>
        <div class="ad-row">
          <select class="ad-select" id="rpFilter" aria-label="학생별 보기">${["전체", ...list.map((s) => s.name)].map((n) =>
            `<option ${n === reportFilter ? "selected" : ""}>${esc(n)}</option>`).join("")}</select>
          ${sheetLink ? `<a class="pill-btn" href="${esc(sheetLink)}" target="_blank" rel="noopener">구글 시트 열기 ↗</a>` : ""}
          <button class="pill-btn pill-btn--solid" id="rpCsv" ${reports.length ? "" : "disabled"}>엑셀(CSV) 내려받기</button>
        </div></div>
      ${serverBarHTML(sv)}
      ${shown.length ? shown.map((r) => `
        <details class="ad-task">
          <summary><strong>${esc(r["이름"])} · ${esc(r["보고 기준일"])}</strong><span class="muted">${fmtTime(r["제출 시각"])} 제출</span>
            <button class="ad-x" data-rdel="${r._i}">삭제</button></summary>
          <div class="report-view ad-report">
            <p><b>이번 주 한 일</b>${esc(r["이번 주 한 일"])}</p>
            <p><b>다음 주 계획</b>${esc(r["다음 주 계획"])}</p>
            ${r["질문"] ? `<p><b>질문</b>${esc(r["질문"])}</p>` : ""}
            ${r["자료 링크"] ? `<p><b>자료</b><a href="${esc(r["자료 링크"])}" target="_blank" rel="noopener">구글 드라이브에서 열기 ↗</a></p>` : ""}
          </div>
        </details>`).join("") : `<p class="ad-empty">표시할 보고가 없어요.</p>`}`;

    main.querySelectorAll("[data-stage]").forEach((sel) => sel.addEventListener("change", () => {
      list[+sel.dataset.stage].stage = Number(sel.value); setDirty();
    }));
    main.querySelectorAll("[data-code]").forEach((b) => b.addEventListener("click", () => {
      const s = list[+b.dataset.code];
      if (s.codeHash && !confirm(`${s.name} 님의 개인 코드를 새로 발급할까요? 예전 코드로는 더 이상 로그인할 수 없어요.`)) return;
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 헷갈리는 0·O·1·I 제외
      const rnd = new Uint32Array(6); crypto.getRandomValues(rnd);
      const code = Array.from(rnd, (n) => chars[n % chars.length]).join("");
      s.codeHash = sha256("advisee:" + code);
      issued = { name: s.name, code }; setDirty(); drawAdvisees(main);
    }));
    main.querySelector("#rpFilter").addEventListener("change", (e) => { reportFilter = e.target.value; issued = null; drawAdvisees(main); });
    main.querySelector("#rpCsv").addEventListener("click", () => {
      const cols = ["이름", "과정", "보고 기준일", "이번 주 한 일", "다음 주 계획", "질문", "자료 링크"];
      csv("주간진행보고", [[...cols, "제출 시각"], ...reports.map((r) => [...cols.map((c) => r[c] ?? ""), fmtTime(r["제출 시각"])])]);
    });
    bindServerBar(main, "report", redraw);
    main.querySelectorAll("[data-rdel]").forEach((b) => b.addEventListener("click", async (e) => {
      e.preventDefault();
      if (!confirm(sv.rows ? "이 보고를 서버에서 지울까요? 되돌릴 수 없어요." : "이 보고를 이 브라우저에서 지울까요? (구글 시트의 기록은 그대로예요)")) return;
      if (await removeRecord("report", reports[+b.dataset.rdel], "reports", +b.dataset.rdel)) { issued = null; redraw(); }
    }));
  }

  /* ── 탭: 랩 일정 (랩 미팅 · 면담 · 심사 일정 추가·수정·삭제) ── */
  let labEdit = null;
  const LAB_TYPES = ["랩 미팅", "면담", "심사", "세미나", "기타"];
  function drawLabCal(main) {
    const ev = draft.labEvents || (draft.labEvents = []);
    const e0 = labEdit != null && ev[labEdit] ? ev[labEdit] : null;
    const v = e0 || { date: "", time: "", type: "랩 미팅", title: "", location: "", who: "전체", note: "", weekly: false, until: "" };
    const sorted = ev.map((e, i) => ({ e, i })).sort((a, b) => String(a.e.date).localeCompare(String(b.e.date)));
    main.innerHTML = h2("랩 일정", "학생 전용 공간의 달력에 보이는 랩 미팅·면담·심사 일정을 추가하고 고치고 지울 수 있어요. 바꾼 뒤 '저장하고 적용'을 눌러주세요.") + `
      <form class="ad-card cal-form ${e0 ? "is-editing" : ""}" id="lcForm" novalidate>
        <h3>${e0 ? "✏️ 일정 수정" : "➕ 새 일정 추가"}</h3>
        <div class="ed-fields">
          <div class="ed-field"><label for="lcType">종류</label>
            <select id="lcType">${LAB_TYPES.map((t) => `<option ${t === v.type ? "selected" : ""}>${t}</option>`).join("")}</select></div>
          <div class="ed-field"><label for="lcDate">날짜</label><input type="date" id="lcDate" value="${esc(v.date)}" /></div>
          <div class="ed-field ed-field--wide"><label for="lcTitle">제목</label><input id="lcTitle" value="${esc(v.title)}" placeholder="예: 정기 랩 미팅" /></div>
          <div class="ed-field"><label for="lcTime">시간</label><input id="lcTime" value="${esc(v.time)}" placeholder="예: 15:00 ~ 17:00" /></div>
          <div class="ed-field"><label for="lcLoc">장소</label><input id="lcLoc" value="${esc(v.location)}" placeholder="예: 미디어관 408호" /></div>
          <div class="ed-field ed-field--wide"><label for="lcWho">대상 ('전체' 또는 학생 이름, 쉼표로 여러 명)</label><input id="lcWho" value="${esc(v.who || "전체")}" /></div>
          <div class="ed-field ed-field--wide"><label for="lcNote">메모</label><textarea id="lcNote" rows="2">${esc(v.note)}</textarea></div>
          <label class="ed-bool"><input type="checkbox" id="lcWeekly" ${v.weekly ? "checked" : ""}/> 매주 반복</label>
          <div class="ed-field lc-until" ${v.weekly ? "" : "hidden"}><label for="lcUntil">반복 종료일</label><input type="date" id="lcUntil" value="${esc(v.until)}" /></div>
        </div>
        <p class="field__err" id="lcErr" role="alert"></p>
        <div class="ad-row">
          <button class="btn btn--primary" type="submit">${e0 ? "수정 내용 반영" : "추가하기"}</button>
          ${e0 ? `<button class="pill-btn" type="button" id="lcCancel">취소</button><button class="pill-btn cf-del" type="button" id="lcDel">🗑 이 일정 삭제</button>` : ""}
        </div>
      </form>
      <div class="ad-table-head"><h3>등록된 일정 ${ev.length}개</h3></div>
      ${ev.length ? `<div class="ad-table-wrap"><table class="ad-table cal-table">
        <thead><tr><th>날짜</th><th>종류</th><th>내용</th><th>대상</th><th></th></tr></thead>
        <tbody>${sorted.map(({ e, i }) => `<tr class="${i === labEdit ? "tr-editing" : ""}">
          <td class="td-date">${dayLabel(e.date)}${e.weekly ? `<small>매주 · ~${esc(e.until ? dayLabel(e.until) : "?")}</small>` : ""}</td>
          <td><span class="cal-k cal-k--event">${esc(e.type)}</span></td>
          <td class="td-long">${esc(e.title)}<small>${esc([e.time, e.location, e.note].filter(Boolean).join(" · "))}</small></td>
          <td>${esc(e.who || "전체")}</td>
          <td class="td-act"><button class="ad-x" data-le="${i}">수정</button><button class="ad-x" data-ld="${i}">삭제</button></td></tr>`).join("")}</tbody>
      </table></div>` : `<p class="ad-empty">아직 등록된 일정이 없어요. 위에서 추가해 보세요. (예: 매주 화요일 정기 랩 미팅)</p>`}`;

    const f = main.querySelector("#lcForm");
    f.querySelector("#lcWeekly").addEventListener("change", (e) => { f.querySelector(".lc-until").hidden = !e.target.checked; });
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const g = (id) => f.querySelector(id).value.trim(), err = f.querySelector("#lcErr");
      const weekly = f.querySelector("#lcWeekly").checked;
      if (!isDate(g("#lcDate"))) { err.textContent = "날짜를 골라 주세요."; return; }
      if (!g("#lcTitle")) { err.textContent = "제목을 적어 주세요."; return; }
      if (weekly && !isDate(g("#lcUntil"))) { err.textContent = "매주 반복이면 반복 종료일을 골라 주세요."; return; }
      if (weekly && g("#lcUntil") < g("#lcDate")) { err.textContent = "반복 종료일이 시작 날짜보다 빨라요."; return; }
      const item = { date: g("#lcDate"), time: g("#lcTime"), type: f.querySelector("#lcType").value, title: g("#lcTitle"),
        location: g("#lcLoc"), who: g("#lcWho") || "전체", note: g("#lcNote"), weekly, until: weekly ? g("#lcUntil") : "" };
      if (e0) ev[labEdit] = item; else ev.push(item);
      ev.sort((a, b) => String(a.date).localeCompare(String(b.date)));
      window.toast(`${e0 ? "수정했어요" : "추가했어요"}. '저장하고 적용'을 눌러 반영하세요.`);
      labEdit = null; setDirty(); drawLabCal(main);
    });
    const cancel = f.querySelector("#lcCancel"); if (cancel) cancel.addEventListener("click", () => { labEdit = null; drawLabCal(main); });
    const del = f.querySelector("#lcDel");
    const remove = (i) => { if (!confirm(`'${ev[i].title}' 일정을 지울까요?`)) return false; ev.splice(i, 1); labEdit = null; setDirty(); window.toast("지웠어요. '저장하고 적용'을 눌러 반영하세요."); return true; };
    if (del) del.addEventListener("click", () => { if (remove(labEdit)) drawLabCal(main); });
    main.querySelectorAll("[data-le]").forEach((b) => b.addEventListener("click", () => { labEdit = +b.dataset.le; drawLabCal(main); main.scrollTop = 0; }));
    main.querySelectorAll("[data-ld]").forEach((b) => b.addEventListener("click", () => { if (remove(+b.dataset.ld)) drawLabCal(main); }));
  }

  /* ── 탭: 구글 시트 연결 ── */
  function drawSheets(main) {
    const s = draft.sheets || (draft.sheets = { endpoint: "", sheetUrl: "", key: "" });
    const ok = /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec/.test(s.endpoint || "");
    main.innerHTML = h2("구글 시트 연결", "학생들의 주간 진행 보고와 면담 신청서가 교수님의 구글 스프레드시트에 자동으로 쌓이게 해요.") + `
      <div class="ad-card">
        <h3>${ok ? "✅ 연결 주소가 등록되어 있어요" : "⚪ 아직 연결되지 않았어요"}</h3>
        <div class="ed-fields">
          <div class="ed-field ed-field--wide"><label for="shEp">Apps Script 웹 앱 주소 (…/exec 로 끝나요)</label>
            <input id="shEp" value="${esc(s.endpoint)}" placeholder="https://script.google.com/macros/s/…/exec" inputmode="url" />
            <small class="ed-hint" id="shHint"></small></div>
          <div class="ed-field ed-field--wide"><label for="shUrl">구글 시트 주소 (관리자 화면에서 바로 열기용)</label>
            <input id="shUrl" value="${esc(s.sheetUrl)}" placeholder="https://docs.google.com/spreadsheets/d/…" inputmode="url" /></div>
          <div class="ed-field"><label for="shKey">확인 키 (선택 — Apps Script의 KEY와 같게)</label><input id="shKey" value="${esc(s.key)}" /></div>
        </div>
        <div class="ad-row">
          <button class="pill-btn pill-btn--solid" id="shTest">연결 테스트 보내기</button>
          ${s.sheetUrl ? `<a class="pill-btn" href="${esc(s.sheetUrl)}" target="_blank" rel="noopener">구글 시트 열기 ↗</a>` : ""}
        </div>
        <p class="muted">테스트를 보낸 뒤 구글 시트에 <b>'연결테스트'</b> 탭이 생기고 한 줄이 들어오면 성공이에요. 주소를 고쳤다면 '저장하고 적용'도 눌러 주세요.</p>
      </div>
      <div class="ad-card">
        <h3>처음 연결하는 방법 (약 5분)</h3>
        <ol class="sh-steps">
          <li><b>구글 시트 만들기</b> — <a href="https://sheets.new" target="_blank" rel="noopener">sheets.new</a>에서 새 스프레드시트를 만들고 이름을 정해요. (예: 홈페이지 기록)</li>
          <li><b>Apps Script 열기</b> — 시트 메뉴 <b>확장 프로그램 → Apps Script</b>를 눌러요.</li>
          <li><b>코드 붙여 넣기</b> — 원래 있던 코드를 모두 지우고, 아래 코드를 복사해 붙여 넣은 뒤 💾 저장해요.</li>
          <li><b>웹 앱으로 배포</b> — 오른쪽 위 <b>배포 → 새 배포</b> → 톱니바퀴에서 <b>웹 앱</b> 선택 → 실행: <b>나</b>, 액세스 권한: <b>모든 사용자</b> → 배포.</li>
          <li><b>권한 허용</b> — '액세스 승인'을 누르고 본인 계정을 고른 뒤, 경고 화면이 나오면 <b>고급 → (안전하지 않음)으로 이동 → 허용</b>을 눌러요. (본인이 만든 스크립트라 괜찮아요)</li>
          <li><b>주소 붙여 넣기</b> — 나온 <b>웹 앱 URL</b>(…/exec)을 복사해 위 칸에 넣고, 시트 주소도 넣은 뒤 <b>연결 테스트</b> → <b>저장하고 적용</b>.</li>
          <li><b>사이트에 반영</b> — 설정 파일 탭에서 config.js를 내려받아 바꾸고 다시 배포해야 학생들의 보고가 시트로 들어와요.</li>
        </ol>
        <div class="ad-row"><button class="pill-btn" id="shCopy">📋 Apps Script 코드 복사</button></div>
        <pre class="sh-code" id="shCode">코드를 불러오는 중…</pre>
      </div>`;

    const ep = main.querySelector("#shEp"), hint = main.querySelector("#shHint");
    const sync = () => {
      const val = ep.value.trim(), good = /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec/.test(val);
      hint.textContent = !val ? "비워두면 기록은 각 브라우저에만 저장돼요." : good ? "✓ Apps Script 웹 앱 주소 형식이 맞아요." : "⚠️ https://script.google.com/macros/s/…/exec 형식이어야 해요.";
      hint.className = `ed-hint is-${!val ? "empty" : good ? "ok" : "bad"}`;
    };
    sync();
    ep.addEventListener("input", () => { s.endpoint = ep.value.trim(); sync(); setDirty(); });
    main.querySelector("#shUrl").addEventListener("input", (e) => { s.sheetUrl = e.target.value.trim(); setDirty(); });
    main.querySelector("#shKey").addEventListener("input", (e) => { s.key = e.target.value.trim(); setDirty(); });
    main.querySelector("#shTest").addEventListener("click", () => {
      if (!/^https:\/\/script\.google\.com\//.test(s.endpoint || "")) { window.toast("먼저 Apps Script 웹 앱 주소를 넣어 주세요."); return; }
      fetch(s.endpoint, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ type: "test", key: s.key || "", data: { "메시지": "홈페이지 연결 테스트", "보낸 시각": new Date().toISOString() } }) })
        .then(() => window.toast("테스트를 보냈어요. 구글 시트의 '연결테스트' 탭을 확인해 보세요."))
        .catch(() => window.toast("보내지 못했어요. 인터넷 연결과 주소를 확인해 주세요."));
    });
    const codeBox = main.querySelector("#shCode");
    fetch("google-apps-script.gs").then((r) => (r.ok ? r.text() : Promise.reject())).then((t) => (codeBox.textContent = t))
      .catch(() => (codeBox.textContent = "여기서는 코드를 불러올 수 없어요. 홈페이지 폴더의 google-apps-script.gs 파일을 메모장으로 열어 전체를 복사해 주세요."));
    main.querySelector("#shCopy").addEventListener("click", () => {
      navigator.clipboard.writeText(codeBox.textContent).then(() => window.toast("코드를 복사했어요."), () => window.toast("복사하지 못했어요. 코드를 직접 선택해 복사해 주세요."));
    });
  }

  /* ── 서버 데이터베이스 기록 (Railway + PostgreSQL) ──
   * 서버가 있으면 모든 방문자가 낸 기록을 서버에서 불러오고, 없으면 이 브라우저 기록을 보여 줌 */
  let dbOn = null;            // null: 확인 전, true/false: 서버 데이터베이스 연결 여부
  const remote = {};          // kind → 기록 배열 | "login"(비밀번호 다시 필요) | null(불러오기 실패)
  const loadingRemote = {};
  function useServer(kind, redraw) {
    if (!window.ServerDB) return { on: false };
    if (dbOn === null) { window.ServerDB.ready().then((v) => { dbOn = v; if (v) redraw(); }); return { on: false }; }
    if (!dbOn) return { on: false };
    if (remote[kind] === undefined && !loadingRemote[kind]) {
      loadingRemote[kind] = true;
      window.ServerDB.list(kind).then((rows) => { remote[kind] = rows; loadingRemote[kind] = false; redraw(); });
    }
    const r = remote[kind];
    return { on: true, rows: Array.isArray(r) ? r.map((x) => ({ ...x.data, _id: x.id, _at: x.created_at })) : null, state: Array.isArray(r) ? "ok" : r === undefined ? "loading" : r || "error" };
  }
  // 기록 위에 붙는 안내 줄: 어디서 불러온 기록인지 + 새로고침 / 비밀번호 다시 입력
  function serverBarHTML(sv) {
    if (!sv.on) return window.SheetSync.ready()
      ? `<p class="muted ad-hint">📊 모든 방문자의 기록은 <b>구글 시트</b>에 모여요. 여기에는 <b>이 브라우저</b>에서 낸 기록만 보여요.</p>`
      : `<p class="muted ad-hint">💾 서버나 구글 시트가 연결되지 않아 <b>이 브라우저</b>에 저장된 기록만 보여요.</p>`;
    if (sv.state === "ok") return `<p class="ad-note">🗄️ 서버 데이터베이스에 저장된 <b>모든 방문자의 기록</b>이에요. <button class="pill-btn" data-db-refresh>새로고침</button></p>`;
    if (sv.state === "loading") return `<p class="ad-note">🗄️ 서버에서 기록을 불러오는 중…</p>`;
    if (sv.state === "login") return `
      <form class="ad-note db-login" data-db-login>🔒 서버 기록을 보려면 관리자 비밀번호를 한 번 더 입력해 주세요.
        <input type="password" class="admin-input" placeholder="비밀번호" autocomplete="current-password" aria-label="관리자 비밀번호" />
        <button class="pill-btn pill-btn--solid" type="submit">불러오기</button><span class="field__err" role="alert"></span></form>`;
    return `<p class="ad-note">⚠️ 서버에서 기록을 불러오지 못했어요. <button class="pill-btn" data-db-refresh>다시 시도</button></p>`;
  }
  function bindServerBar(main, kind, redraw) {
    const again = main.querySelector("[data-db-refresh]");
    if (again) again.addEventListener("click", () => { delete remote[kind]; redraw(); });
    const f = main.querySelector("[data-db-login]");
    if (f) f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const ok = await window.ServerDB.login(f.querySelector("input").value);
      if (!ok) { f.querySelector(".field__err").textContent = "비밀번호가 맞지 않거나 서버에 연결할 수 없어요."; return; }
      for (const k in remote) delete remote[k];
      redraw();
    });
  }
  async function removeRecord(kind, item, localKey, localIndex) {
    if (item && item._id != null) {
      if (!(await window.ServerDB.remove(item._id))) { window.toast("지우지 못했어요. 다시 로그인해 보세요."); return false; }
      delete remote[kind]; return true;
    }
    const all = S.get(localKey, []); all.splice(localIndex, 1); S.set(localKey, all); return true;
  }

  /* ── 탭: 면담 신청 내역 (입학·지도 문의) ── */
  function drawConsults(main) {
    const redraw = () => root && tab === "consults" && drawConsults(root.querySelector("#adMain"));
    const sv = useServer("consult", redraw);
    const list = sv.rows || S.get("consults", []);
    const fields = ((window.SITE_CONFIG.consult || {}).form || {}).fields || [];
    const val = (a, f) => f.type === "checkbox" ? (a[f.name] ? "동의" : "") : a[f.name] ?? "";
    const head = (f) => (f.type === "checkbox" ? "개인정보 동의" : f.label);
    main.innerHTML = h2("면담 신청 내역", `입학·지도 문의로 접수된 신청서 ${list.length}건`) + serverBarHTML(sv) + `
      <div class="ad-table-head"><h3>신청 ${list.length}건</h3>
        <div class="ad-row">
          ${(window.SITE_CONFIG.sheets || {}).sheetUrl ? `<a class="pill-btn" href="${esc(window.SITE_CONFIG.sheets.sheetUrl)}" target="_blank" rel="noopener">구글 시트 열기 ↗</a>` : ""}
          <button class="pill-btn pill-btn--solid" id="csCsv" ${list.length ? "" : "disabled"}>엑셀(CSV) 내려받기</button>
        </div></div>
      ${list.length ? `<div class="ad-table-wrap"><table class="ad-table">
        <thead><tr><th>#</th>${fields.map((f) => `<th>${esc(head(f))}</th>`).join("")}<th>접수 시각</th><th></th></tr></thead>
        <tbody>${list.map((a, i) => `<tr><td>${i + 1}</td>${fields.map((f) => `<td class="${f.type === "textarea" ? "td-long" : ""}">${esc(val(a, f))}</td>`).join("")}
          <td>${fmtTime(a.submittedAt || a._at)}</td><td><button class="ad-x" data-del="${i}">삭제</button></td></tr>`).join("")}</tbody>
      </table></div>` : `<p class="ad-empty">아직 접수된 면담 신청서가 없어요.</p>`}`;
    bindServerBar(main, "consult", redraw);
    main.querySelector("#csCsv").addEventListener("click", () => csv("면담신청", [
      [...fields.map(head), "접수 시각"], ...list.map((a) => [...fields.map((f) => val(a, f)), fmtTime(a.submittedAt || a._at)])
    ]));
    main.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", async () => {
      if (!confirm("이 신청서를 지울까요? 되돌릴 수 없어요.")) return;
      if (await removeRecord("consult", list[+b.dataset.del], "consults", +b.dataset.del)) redraw();
    }));
  }

  /* ── 탭: 수강 신청 내역 ── */
  function drawApps(main) {
    const apps = S.get("applications", []);
    const fields = window.SITE_CONFIG.apply.fields;
    const val = (a, f) => f.type === "checkbox" ? (a[f.name] ? "동의" : "") : a[f.name] ?? "";
    main.innerHTML = h2("수강 신청 내역", `이 브라우저에서 접수된 신청서 ${apps.length}건`) + `
      <div class="ad-table-head"><h3>신청 ${apps.length}건</h3>
        <button class="pill-btn pill-btn--solid" id="apCsv" ${apps.length ? "" : "disabled"}>엑셀(CSV) 내려받기</button></div>
      ${apps.length ? `<div class="ad-table-wrap"><table class="ad-table">
        <thead><tr><th>#</th>${fields.map((f) => `<th>${esc(f.type === "checkbox" ? "개인정보 동의" : f.label)}</th>`).join("")}<th>제출 시각</th><th></th></tr></thead>
        <tbody>${apps.map((a, i) => `<tr><td>${i + 1}</td>${fields.map((f) => `<td class="${f.type === "textarea" ? "td-long" : ""}">${esc(val(a, f))}</td>`).join("")}
          <td>${fmtTime(a.submittedAt)}</td><td><button class="ad-x" data-del="${i}">삭제</button></td></tr>`).join("")}</tbody>
      </table></div>` : `<p class="ad-empty">아직 접수된 신청서가 없어요.</p>`}`;
    main.querySelector("#apCsv").addEventListener("click", () => csv("수강신청", [
      [...fields.map((f) => (f.type === "checkbox" ? "개인정보 동의" : f.label)), "제출 시각"],
      ...apps.map((a) => [...fields.map((f) => val(a, f)), fmtTime(a.submittedAt)])
    ]));
    main.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => {
      if (!confirm("이 신청서를 지울까요? 되돌릴 수 없어요.")) return;
      apps.splice(+b.dataset.del, 1); S.set("applications", apps); drawApps(main);
    }));
  }

  /* ── 탭: 출석 ── */
  function drawAttendance(main) {
    const c = window.COURSE, list = window.SITE_CONFIG.students || [];
    const att = S.get("attendance", {});
    // 출석은 수업 회차(날짜)별 — 시험 주간 제외
    const ses = c.sessions, md = (d) => `${d.getMonth() + 1}/${d.getDate()}`;
    const held = ses.filter((x) => x.date <= c.today).length;
    const rows = list.map((s) => {
      const a = att[s.id] || {};
      const n = ses.filter((x) => a[x.key]).length;
      return { s, a, n, rate: held ? Math.round((n / held) * 100) : 0 };
    });
    main.innerHTML = h2("출석 현황", `수업 ${ses.length}회 중 지금까지 ${held}회 진행 · 칸을 누르면 출석을 직접 고칠 수 있어요.`) + `
      <div class="ad-table-head"><h3>수강생 ${list.length}명</h3>
        <button class="pill-btn pill-btn--solid" id="atCsv" ${list.length ? "" : "disabled"}>엑셀(CSV) 내려받기</button></div>
      ${list.length ? `<div class="ad-table-wrap"><table class="ad-table ad-table--att">
        <thead><tr><th>학번</th><th>이름</th>${ses.map((x) => `<th title="${esc(x.week.label)} ${c.fmt(x.date)}">${md(x.date)}</th>`).join("")}<th>출석</th><th>출석률</th></tr></thead>
        <tbody>${rows.map(({ s, a, n, rate }) => `<tr><td>${esc(s.id)}</td><td>${esc(s.name)}</td>
          ${ses.map((x) => {
            const st = a[x.key] ? "ok" : x.date < c.today ? "miss" : "todo";
            return `<td><button class="at-cell at-${st}" data-sid="${esc(s.id)}" data-k="${x.key}"
              title="${esc(x.week.label)} ${md(x.date)} ${a[x.key] ? fmtTime(a[x.key]) + " 출석" : st === "miss" ? "결석" : "예정"}"
              aria-label="${esc(s.name)} ${md(x.date)} ${st === "ok" ? "출석" : st === "miss" ? "결석" : "예정"}">${st === "ok" ? "✓" : st === "miss" ? "✕" : "·"}</button></td>`;
          }).join("")}
          <td>${n}/${held}</td><td>${rate}%</td></tr>`).join("")}</tbody>
      </table></div>` : `<p class="ad-empty">수강생 명단이 비어 있어요. '수강생 명단' 탭에서 먼저 등록해 주세요.</p>`}`;
    main.querySelector("#atCsv").addEventListener("click", () => csv("출석부", [
      ["학번", "이름", ...ses.map((x) => `${x.week.label}(${md(x.date)})`), "출석 수", "출석률(%)"],
      ...rows.map(({ s, a, n, rate }) => [s.id, s.name, ...ses.map((x) => (a[x.key] ? "출석" : x.date < c.today ? "결석" : "")), n, rate])
    ]));
    main.querySelectorAll(".at-cell").forEach((b) => b.addEventListener("click", () => {
      const all = S.get("attendance", {}), id = b.dataset.sid, w = b.dataset.k;
      all[id] = all[id] || {};
      if (all[id][w]) delete all[id][w]; else all[id][w] = new Date().toISOString();
      S.set("attendance", all); drawAttendance(main);
    }));
  }

  /* ── 탭: 과제 ── */
  function drawSubs(main) {
    const c = window.COURSE, list = window.SITE_CONFIG.students || [];
    const subs = S.get("submissions", {});
    const tasks = c.weeks.filter((w) => w.assignment);
    main.innerHTML = h2("과제 제출 현황", "제출된 파일의 이름·크기·시각이 기록돼요.") + `
      <div class="ad-table-head"><h3>과제 ${tasks.length}개 · 수강생 ${list.length}명</h3>
        <button class="pill-btn pill-btn--solid" id="sbCsv">엑셀(CSV) 내려받기</button></div>
      ${tasks.map((w) => {
        const done = list.filter((s) => subs[s.id] && subs[s.id][w.no]);
        return `<details class="ad-task" ${w.due > c.now() ? "open" : ""}>
          <summary><strong>${esc(w.label)} · ${esc(w.assignment.title)}</strong>
            <span class="muted">마감 ${c.fmtDue(w.due)}</span>
            <span class="chip ${done.length === list.length && list.length ? "chip--now" : "chip--task"}">${done.length} / ${list.length} 제출</span></summary>
          <div class="ad-table-wrap"><table class="ad-table"><thead><tr><th>학번</th><th>이름</th><th>파일</th><th>크기</th><th>제출 시각</th></tr></thead>
          <tbody>${list.map((s) => { const x = subs[s.id] && subs[s.id][w.no];
            return `<tr class="${x ? "" : "tr-miss"}"><td>${esc(s.id)}</td><td>${esc(s.name)}</td><td>${x ? "📎 " + esc(x.file) : "미제출"}</td>
              <td>${x ? window.fmtSize(x.size) : ""}</td><td>${x ? fmtTime(x.at) : ""}</td></tr>`; }).join("")}</tbody></table></div>
        </details>`;
      }).join("")}`;
    main.querySelector("#sbCsv").addEventListener("click", () => {
      const rows = [["주차", "과제", "마감", "학번", "이름", "제출 여부", "파일 이름", "크기(MB)", "제출 시각"]];
      tasks.forEach((w) => list.forEach((s) => {
        const x = subs[s.id] && subs[s.id][w.no];
        rows.push([w.label, w.assignment.title, w.assignment.due, s.id, s.name, x ? "제출" : "미제출", x ? x.file : "", x ? (x.size / 1024 / 1024).toFixed(2) : "", x ? fmtTime(x.at) : ""]);
      }));
      csv("과제제출", rows);
    });
  }

  /* ── 탭: 투표 ── */
  function drawPoll(main) {
    const votes = S.get("poll:votes", {}), opts = window.SITE_CONFIG.poll.options;
    const total = opts.reduce((s, o) => s + (votes[o.id] || 0), 0);
    main.innerHTML = h2("투표 결과", `${esc(window.SITE_CONFIG.poll.title)} · 총 ${total}표`) + `
      <div class="ad-card">${opts.map((o) => { const n = votes[o.id] || 0, p = total ? Math.round((n / total) * 100) : 0;
        return `<div class="ad-bar"><span>${esc(o.label)}</span><div class="ad-bar__track"><i style="width:${p}%"></i></div><b>${n}표 · ${p}%</b></div>`; }).join("")}</div>
      <div class="ad-row">
        <button class="pill-btn pill-btn--solid" id="pCsv">엑셀(CSV) 내려받기</button>
        <button class="pill-btn" id="pReset">투표 초기화</button>
      </div>`;
    main.querySelector("#pCsv").addEventListener("click", () => csv("투표결과", [["항목", "표 수", "비율(%)"],
      ...opts.map((o) => [o.label, votes[o.id] || 0, total ? Math.round(((votes[o.id] || 0) / total) * 100) : 0])]));
    main.querySelector("#pReset").addEventListener("click", () => {
      if (!confirm("투표 결과를 모두 지울까요? 되돌릴 수 없어요.")) return;
      S.set("poll:votes", {}); S.remove("poll:my"); drawPoll(main);
    });
  }

  /* ── 탭: 설정 파일 ── */
  function drawFile(main) {
    main.innerHTML = h2("설정 파일 저장 · 불러오기", "관리자 화면에서 고친 모든 설정(사이트 정보, 섹션 내용, 명단, 공지, 비밀번호)을 파일 하나로 주고받아요.") + overrideNote() + `
      <div class="ad-card">
        <h3>💾 설정 파일 저장</h3>
        <p class="muted">지금 설정을 <b>config.js</b> 파일로 내려받아요. 이 파일로 사이트 폴더의 <code>js/config.js</code>를 바꿔 다시 배포하면 모든 방문자에게 반영돼요.</p>
        <button class="btn btn--primary" id="fSave">config.js 내려받기</button>
      </div>
      <div class="ad-card">
        <h3>📂 설정 파일 불러오기</h3>
        <p class="muted">예전에 저장한 config.js(또는 .json) 파일을 불러와 이 브라우저에 적용해요.</p>
        <label class="drop"><input type="file" id="fLoad" accept=".js,.json" /><span class="drop__icon">📂</span><span class="drop__text">파일을 눌러서 선택하세요</span></label>
        <p class="field__err" id="fErr" role="alert"></p>
      </div>
      <div class="ad-card">
        <h3>↩️ 기본값으로 되돌리기</h3>
        <p class="muted">이 브라우저에 저장된 수정 내용을 지우고, 사이트 폴더의 config.js 내용으로 돌아가요. (수강 신청·출석·과제 기록은 지워지지 않아요.)</p>
        <button class="pill-btn" id="fReset" ${S.get("config", null) ? "" : "disabled"}>기본값으로 되돌리기</button>
      </div>`;
    main.querySelector("#fSave").addEventListener("click", () => {
      const text = `/* =========================================================\n * 사이트 설정 파일 — 관리자 화면에서 저장함 (${fmtTime(new Date().toISOString())})\n * 이 파일로 js/config.js를 바꾸면 모든 방문자에게 반영됩니다.\n * ========================================================= */\nwindow.SITE_CONFIG = ${JSON.stringify(draft, null, 2)};\n`;
      download("config.js", text, "text/javascript;charset=utf-8");
      if (dirty) window.toast("저장하지 않은 변경 사항도 파일에 포함됐어요.");
    });
    main.querySelector("#fLoad").addEventListener("change", (e) => {
      const file = e.target.files[0], err = main.querySelector("#fErr"); if (!file) return;
      const r = new FileReader();
      r.onload = () => {
        try {
          const t = String(r.result), obj = JSON.parse(t.slice(t.indexOf("{"), t.lastIndexOf("}") + 1));
          if (!obj.site || !obj.nav || !obj.admin) throw new Error("bad");
          if (!confirm("불러온 설정으로 바꿀까요? 지금 화면의 설정은 덮어써져요.")) return;
          S.set("config", obj); ss.set("adminReopen", "file");
          if (obj.admin.passwordHash !== C.admin.passwordHash) ss.del("adminAuthed");
          dirty = false; location.reload();
        } catch (x) {
          err.textContent = "이 사이트의 설정 파일이 아니거나 형식이 올바르지 않아요. 관리자 화면에서 저장한 파일을 선택해 주세요.";
        }
      };
      r.readAsText(file, "utf-8");
    });
    main.querySelector("#fReset").addEventListener("click", () => {
      if (!confirm("이 브라우저에 저장된 설정 수정 내용을 지울까요?")) return;
      S.remove("config"); ss.del("adminAuthed"); dirty = false; location.reload();
    });
  }

  // 저장 후 새로고침되면 관리자 화면을 다시 열어줌
  const reopen = ss.get("adminReopen");
  if (reopen) {
    ss.del("adminReopen");
    if (authed()) { openAdmin(reopen); window.toast("저장하고 적용했어요. ✓"); }
  }
  window.addEventListener("beforeunload", (e) => { if (root && dirty) { e.preventDefault(); e.returnValue = ""; } });
})();
