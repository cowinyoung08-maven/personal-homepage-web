/* 3단계: 주차별 커리큘럼 + 월간 수업 달력
 * main.js가 window.renderCurriculum(요소)를 불러 화면을 그립니다.
 * 주소 뒤에 ?today=2026-04-01 을 붙이면 그 날짜를 '오늘'로 보고 미리볼 수 있습니다. */
(function () {
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

  // ── 날짜 도우미 ──
  const parseDate = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const parseDateTime = (s) => {
    const [date, time = "23:59"] = s.trim().split(/\s+/);
    const d = parseDate(date); const [hh, mm] = time.split(":").map(Number);
    d.setHours(hh, mm, 0, 0); return d;
  };
  const key = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const dayOnly = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const fmt = (d) => `${d.getMonth() + 1}월 ${d.getDate()}일 (${DAYS[d.getDay()]})`;
  const fmtLong = (d) => `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${DAYS[d.getDay()]}요일`;
  const fmtDue = (d) => `${fmt(d)} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

  // '오늘' — 미리보기용 ?today= 지원
  const now = () => {
    const q = new URLSearchParams(location.search).get("today");
    if (q && /^\d{4}-\d{2}-\d{2}$/.test(q)) {
      const d = parseDate(q); const t = new Date();
      d.setHours(t.getHours(), t.getMinutes(), t.getSeconds()); return d;
    }
    return new Date();
  };

  // 남은 시간 문구
  const leftText = (due) => {
    const ms = due - now();
    if (ms <= 0) return { text: "마감되었습니다", state: "closed", chip: "마감" };
    const m = Math.floor(ms / 60000), d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60), mi = m % 60;
    const text = "마감까지 " + (d ? `${d}일 ${h}시간` : h ? `${h}시간 ${mi}분` : `${mi}분`) + " 남았어요";
    const dd = Math.round((dayOnly(due) - dayOnly(now())) / 86400000);
    return { text, state: ms < 86400000 ? "urgent" : d < 3 ? "soon" : "open", chip: dd === 0 ? "D-Day" : `D-${dd}` };
  };

  window.renderCurriculum = function (root, C) {
    const cur = C.curriculum;
    const holidays = new Map((cur.holidays || []).map((h) => [h.date, h.label]));

    // ── 주차별 수업 날짜 ──
    // dates(수업 날짜 목록)가 있으면 그대로 쓰고, 없으면 startDate부터 매주 자동 계산(휴강일은 건너뜀)
    let next = cur.startDate ? parseDate(cur.startDate) : null;
    const weeks = cur.weeks.map((w, i) => {
      let dates = (w.dates || []).filter(Boolean).map(parseDate);
      if (!dates.length && w.date) dates = [parseDate(w.date)];
      if (!dates.length && next) { while (holidays.has(key(next))) next = addDays(next, 7); dates = [next]; }
      dates.sort((a, b) => a - b);
      if (dates.length) next = addDays(dates[dates.length - 1], 7);
      return {
        ...w, no: i + 1, dates,
        date: dates[0], last: dates[dates.length - 1],
        label: w.label || `${i + 1}주차`,
        time: w.time || cur.time,
        location: w.location || cur.location,
        due: w.assignment && w.assignment.due ? parseDateTime(w.assignment.due) : null
      };
    }).filter((w) => w.date);

    // 수업 회차 목록 (출석 체크용 — 시험 주간 제외)
    const sessions = weeks.filter((w) => !w.exam)
      .flatMap((w) => w.dates.map((d) => ({ date: d, key: key(d), week: w })))
      .sort((a, b) => a.date - b.date);

    // 날짜별 이벤트 모음
    const events = new Map();
    const at = (k) => events.get(k) || (events.set(k, { classes: [], deadlines: [], extras: [] }), events.get(k));
    weeks.forEach((w) => {
      w.dates.forEach((d) => at(key(d)).classes.push(w));
      if (w.due) at(key(w.due)).deadlines.push(w);
    });
    // 그 밖의 일정 (특강·행사·보강 등)
    const extras = (cur.events || []).map((e, idx) => ({ ...e, idx }))
      .filter((e) => /^\d{4}-\d{2}-\d{2}$/.test(e.date || ""))
      .map((e) => ({ ...e, d: parseDate(e.date) }));
    extras.forEach((e) => at(e.date).extras.push(e));
    const isAdmin = () => !!(window.AdminAPI && window.AdminAPI.isAdmin());

    const today = dayOnly(now());
    // 이번 주: 오늘부터 6일 안에 수업이 있는 첫 주차
    const currentWeek = weeks.find((w) => w.dates.some((d) => d >= today && (d - today) / 86400000 <= 6));
    const dateList = (w) => w.dates.map(fmt).join(" · ");
    const shortLabel = (w) => w.label.replace(/\s*주차?$/, "");

    // ── 과제 블록 (주차 상세·달력 상세에서 공용) ──
    const taskHTML = (w, compact) => {
      const a = w.assignment, l = leftText(w.due);
      return `
        <div class="task task--${l.state}">
          <div class="task__head"><span class="task__icon">📝</span><div>
            <small>${esc(w.label)} 과제</small><h4>${esc(a.title)}</h4></div></div>
          ${compact ? "" : `<p class="task__text">${esc(a.text)}</p>`}
          <div class="task__due"><span>마감</span><strong>${fmtDue(w.due)}</strong></div>
          <div class="task__left" data-due="${w.due.getTime()}">⏳ ${l.text}</div>
          <button class="btn btn--primary task__submit" data-week="${w.no}" ${l.state === "closed" ? "disabled" : ""}>
            ${l.state === "closed" ? "제출 마감" : "과제 제출하기"}</button>
        </div>`;
    };

    // ── 주차 목록 ──
    const weekHTML = (w) => {
      const l = w.due ? leftText(w.due) : null;
      const past = w.last < today;
      const topics = w.topics || [], reads = w.readings || [], refs = w.refs || [], vids = w.videos || [], notes = w.notes || [];
      const lab = shortLabel(w);
      return `
        <details class="week ${past ? "is-past" : ""} ${w === currentWeek ? "is-current" : ""} ${w.exam ? "is-exam" : ""}" id="week-${w.no}">
          <summary>
            <span class="week__no ${lab.length > 3 ? "week__no--long" : ""}"><small>WEEK</small>${esc(lab)}</span>
            <span class="week__main">
              <strong>${esc(w.title)}</strong>
              <span class="week__date">${dateList(w)} · ${esc(w.time)}</span>
            </span>
            <span class="week__chips">${
              (w === currentWeek ? `<span class="chip chip--now">이번 주</span>` : "") +
              (w.exam ? `<span class="chip chip--exam">시험</span>` : "") +
              (l ? `<span class="chip chip--task chip--${l.state}" data-chip-due="${w.due.getTime()}">과제 ${l.chip}</span>` : "")
            }</span>
            <i class="week__arrow" aria-hidden="true"></i>
          </summary>
          <div class="week__body">
            <dl class="week__meta">
              <div><dt>📅 날짜</dt><dd>${dateList(w)}</dd></div>
              <div><dt>⏰ 시간</dt><dd>${esc(w.time)}</dd></div>
              <div><dt>📍 장소</dt><dd>${esc(w.location)}</dd></div>
            </dl>
            ${notes.length ? `<ul class="week__notes">${notes.map((n) => `<li>📌 ${esc(n)}</li>`).join("")}</ul>` : ""}
            ${topics.length || reads.length || refs.length || vids.length ? `
            <div class="week__cols">
              ${topics.length ? `<div class="week__block">
                <h4>${esc(cur.topicsTitle || "학습 내용")}</h4>
                <ul class="week__topics">${topics.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
              </div>` : ""}
              ${reads.length || refs.length ? `<div class="week__block">
                <h4>읽기 자료</h4>
                <ul class="week__reads">
                  ${reads.map((r) => `<li><span class="read-tag">필수</span>${esc(r)}</li>`).join("")}
                  ${refs.map((r) => `<li><span class="read-tag read-tag--ref">참고</span>${esc(r)}</li>`).join("")}
                </ul>
              </div>` : ""}
              ${vids.length ? `<div class="week__block">
                <h4>참고 영상</h4>
                <div class="week__videos">${vids.map((v) => `
                  <a href="${esc(v.url)}" target="_blank" rel="noopener"><span>▶</span>${esc(v.label)}</a>`).join("")}</div>
              </div>` : ""}
            </div>` : ""}
            ${w.assignment ? taskHTML(w) : ""}
          </div>
        </details>`;
    };

    // ── 기본 뼈대 ──
    root.innerHTML = `
      <div class="cur-bar">
        <h3 class="sub-title">${esc(cur.weeksTitle)}</h3>
        <button class="pill-btn" id="weeksToggle">전체 펼치기</button>
      </div>
      <div class="weeks">${weeks.map(weekHTML).join("")}</div>

      <h3 class="sub-title" id="schedule">${esc(cur.calendarTitle)}</h3>
      <div class="cal-wrap">
        <div class="cal">
          <div class="cal__head">
            <button class="slider__btn" id="calPrev" aria-label="이전 달">
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <strong id="calTitle" aria-live="polite"></strong>
            <button class="slider__btn" id="calNext" aria-label="다음 달">
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
          <div class="cal__week">${DAYS.map((d) => `<span>${d}</span>`).join("")}</div>
          <div class="cal__grid" id="calGrid"></div>
          <div class="cal__legend">
            <span><i class="lg lg--class"></i>수업</span>
            <span><i class="lg lg--exam"></i>시험</span>
            <span><i class="lg lg--event"></i>일정</span>
            <span><i class="lg lg--due"></i>과제 마감</span>
            <span><i class="lg lg--off"></i>휴강</span>
          </div>
        </div>
        <aside class="cal-detail" id="calDetail" aria-live="polite"></aside>
      </div>`;

    // ── 전체 펼치기 ──
    const allWeeks = [...root.querySelectorAll(".week")];
    const toggleBtn = root.querySelector("#weeksToggle");
    const syncToggle = () => (toggleBtn.textContent = allWeeks.every((d) => d.open) ? "전체 접기" : "전체 펼치기");
    toggleBtn.addEventListener("click", () => {
      const open = !allWeeks.every((d) => d.open);
      allWeeks.forEach((d) => (d.open = open)); syncToggle();
    });
    allWeeks.forEach((d) => d.addEventListener("toggle", syncToggle));
    if (currentWeek) root.querySelector(`#week-${currentWeek.no}`).open = true;

    // ── 달력 ──
    const first = new Date(Math.min(...weeks.map((w) => w.date), ...extras.map((e) => e.d)));
    const last = dayOnly(new Date(Math.max(...weeks.map((w) => Math.max(w.last, w.due || 0)), ...extras.map((e) => +e.d))));
    const minM = new Date(first.getFullYear(), first.getMonth(), 1);
    const maxM = new Date(last.getFullYear(), last.getMonth(), 1);
    let selected = today >= first && today <= last ? today : (currentWeek ? currentWeek.date : first);
    let month = new Date(selected.getFullYear(), selected.getMonth(), 1);

    const grid = root.querySelector("#calGrid");
    const detail = root.querySelector("#calDetail");

    const drawMonth = () => {
      root.querySelector("#calTitle").textContent = `${month.getFullYear()}년 ${month.getMonth() + 1}월`;
      root.querySelector("#calPrev").disabled = month <= minM;
      root.querySelector("#calNext").disabled = month >= maxM;
      const startPad = month.getDay();
      const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
      let html = "";
      for (let i = 0; i < startPad; i++) html += `<span class="cal__day is-empty"></span>`;
      for (let d = 1; d <= days; d++) {
        const date = new Date(month.getFullYear(), month.getMonth(), d), k = key(date);
        const ev = events.get(k), off = holidays.get(k);
        const exam = ev && ev.classes.some((w) => w.exam);
        const cls = [
          "cal__day",
          ev && ev.classes.length && (exam ? "has-exam" : "has-class"),
          ev && ev.deadlines.length && "has-due",
          ev && ev.extras.length && !ev.classes.length && "has-event",
          off && "is-off",
          date.getDay() === 0 && "is-sun",
          date.getDay() === 6 && "is-sat",
          +date === +today && "is-today",
          +date === +selected && "is-selected"
        ].filter(Boolean).join(" ");
        const label = [fmt(date), ev && ev.classes.map((w) => (w.exam ? w.title : `${w.label} 수업`)).join(", "),
          ev && ev.deadlines.length && "과제 마감", ev && ev.extras.map((e) => e.title).join(", "), off].filter(Boolean).join(", ");
        html += `
          <button class="${cls}" data-date="${k}" aria-label="${esc(label)}" aria-pressed="${+date === +selected}">
            <span class="cal__num">${d}</span>
            ${ev && ev.classes.length ? `<span class="cal__tag ${exam ? "cal__tag--exam" : ""}">${esc(exam ? ev.classes[0].title : ev.classes[0].label)}</span>` : ""}
            ${off ? `<span class="cal__tag cal__tag--off">휴강</span>` : ""}
            ${ev && ev.extras.length && !ev.classes.length && !off ? `<span class="cal__tag cal__tag--event">${esc(ev.extras[0].type || "일정")}</span>` : ""}
            ${ev && ev.extras.length && (ev.classes.length || off) ? `<span class="cal__ev" aria-hidden="true"></span>` : ""}
            ${ev && ev.deadlines.length ? `<span class="cal__due" aria-hidden="true"></span>` : ""}
          </button>`;
      }
      grid.innerHTML = html;
    };

    const drawDetail = () => {
      const k = key(selected), ev = events.get(k), off = holidays.get(k);
      const admin = isAdmin();
      // 관리자 모드일 때만 보이는 수정·삭제 버튼 (ref: 어떤 일정인지)
      const tools = (ref) => admin ? `<span class="cd-admin">
          <button class="ad-x" data-cal-act="edit" data-ref='${esc(JSON.stringify(ref))}'>✏️ 수정</button>
          <button class="ad-x" data-cal-act="del" data-ref='${esc(JSON.stringify(ref))}'>🗑 삭제</button></span>` : "";
      let body = "";
      if (ev && ev.classes.length) {
        body += ev.classes.map((w) => `
          <div class="cd-class">
            <span class="cd-row"><span class="chip ${w.exam ? "chip--exam" : "chip--week"}">${esc(w.label)}${w.exam ? " · 시험" : ""}</span>
              ${tools({ kind: "class", wi: w.no - 1, date: k })}</span>
            <h4>${esc(w.title)}</h4>
            <ul class="cd-meta">
              <li>⏰ ${esc(w.time)}</li>
              <li>📍 ${esc(w.location)}</li>
            </ul>
            <ul class="week__topics">${((w.topics || []).length ? w.topics : w.notes || []).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
            <button class="pill-btn pill-btn--solid" data-open-week="${w.no}">주차 상세 보기 →</button>
          </div>`).join("");
      }
      if (ev && ev.extras.length) {
        body += ev.extras.map((e) => `
          <div class="cd-event">
            <span class="cd-row"><span class="chip chip--event">${esc(e.type || "일정")}</span>${tools({ kind: "event", i: e.idx })}</span>
            <h4>${esc(e.title)}</h4>
            ${e.time || e.location ? `<ul class="cd-meta">${e.time ? `<li>⏰ ${esc(e.time)}</li>` : ""}${e.location ? `<li>📍 ${esc(e.location)}</li>` : ""}</ul>` : ""}
            ${e.note ? `<p class="cd-note">${esc(e.note)}</p>` : ""}
          </div>`).join("");
      }
      if (ev && ev.deadlines.length) body += ev.deadlines.map((w) => taskHTML(w, true)).join("");
      if (off) body += `<div class="cd-off"><span>🌷 ${esc(off)}</span>${tools({ kind: "holiday", date: k })}</div>`;
      if (!body) {
        const nx = weeks.flatMap((w) => w.dates.map((d) => ({ d, w }))).sort((a, b) => a.d - b.d).find((x) => x.d > selected);
        body = `<div class="cd-empty"><span>🌸</span><p>이 날은 수업이 없어요.</p>
          ${nx ? `<button class="pill-btn" data-go-date="${key(nx.d)}">다음 수업: ${fmt(nx.d)} · ${esc(nx.w.label)}</button>` : ""}</div>`;
      }
      if (admin) body += `<button class="ed-add cd-add" data-cal-act="add" data-date="${k}">+ 이 날 일정 추가</button>`;
      detail.innerHTML = `<p class="cd-date">${+selected === +today ? `<span class="chip chip--now">오늘</span>` : ""}${fmtLong(selected)}</p>${body}`;
    };

    const select = (d) => {
      selected = d;
      month = new Date(d.getFullYear(), d.getMonth(), 1);
      drawMonth(); drawDetail();
    };

    grid.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-date]"); if (b) select(parseDate(b.dataset.date));
    });
    root.querySelector("#calPrev").addEventListener("click", () => { month = new Date(month.getFullYear(), month.getMonth() - 1, 1); drawMonth(); });
    root.querySelector("#calNext").addEventListener("click", () => { month = new Date(month.getFullYear(), month.getMonth() + 1, 1); drawMonth(); });
    detail.addEventListener("click", (e) => {
      const go = e.target.closest("[data-go-date]");
      if (go) select(parseDate(go.dataset.goDate));
      const ow = e.target.closest("[data-open-week]");
      if (ow) {
        const el = root.querySelector(`#week-${ow.dataset.openWeek}`);
        el.open = true; syncToggle();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      // 관리자: 일정 추가·수정·삭제 → 관리자 화면 '수업 일정' 탭으로
      const ca = e.target.closest("[data-cal-act]");
      if (ca && window.AdminAPI) {
        const act = ca.dataset.calAct;
        if (act === "add") window.AdminAPI.calendar({ date: ca.dataset.date });
        else window.AdminAPI.calendar({ [act]: JSON.parse(ca.dataset.ref) });
      }
    });
    drawMonth(); drawDetail();
    // 관리자 로그인·로그아웃 시 달력 상세의 관리 버튼을 다시 그림
    window.addEventListener("admin:state", drawDetail);

    // ── 과제 제출 버튼 → 수강생 영역(participate.js)으로 연결 ──
    root.addEventListener("click", (e) => {
      const b = e.target.closest(".task__submit"); if (!b || b.disabled) return;
      if (cur.submitUrl) window.open(cur.submitUrl, "_blank", "noopener");
      else window.dispatchEvent(new CustomEvent("assignment:submit", { detail: { week: +b.dataset.week } }));
    });

    // 다른 기능(출석·과제 제출·관리자)에서 쓰도록 일정 정보 공개
    window.COURSE = { weeks, sessions, holidays, now, today, key, parseDate, fmt, fmtLong, fmtDue, leftText };

    // ── 남은 시간 실시간 갱신 (30초마다) ──
    const tick = () => {
      root.querySelectorAll("[data-due]").forEach((el) => {
        const l = leftText(new Date(+el.dataset.due));
        el.textContent = "⏳ " + l.text;
        const task = el.closest(".task");
        task.className = `task task--${l.state}`;
        const btn = task.querySelector(".task__submit");
        btn.disabled = l.state === "closed";
        btn.textContent = l.state === "closed" ? "제출 마감" : "과제 제출하기";
      });
      root.querySelectorAll("[data-chip-due]").forEach((el) => {
        const l = leftText(new Date(+el.dataset.chipDue));
        el.textContent = "과제 " + l.chip;
        el.className = `chip chip--task chip--${l.state}`;
      });
    };
    setInterval(tick, 30000);
  };
})();
