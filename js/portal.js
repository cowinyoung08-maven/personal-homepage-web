/* 5단계: 학생 전용 공간 (지도학생 로그인)
 * - 로그인: 이름 + 개인 코드 (config에는 코드의 암호화된 값만 저장)
 * - 학위논문 진행 단계 / 랩 미팅·면담 달력 / 주간 진행 보고 (구글 드라이브 자료 링크)
 * - 보고는 이 브라우저에 저장하고, 구글 시트가 연결돼 있으면 시트로도 보냄
 * main.js가 window.renderPortal(설정)을 부릅니다. */
(function () {
  const esc = window.esc, S = window.Store;
  const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
  const pad = (n) => String(n).padStart(2, "0");
  const key = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = (s) => { const [y, m, d] = String(s).split("-").map(Number); return new Date(y, m - 1, d); };
  const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || "");
  const fmt = (d) => `${d.getMonth() + 1}월 ${d.getDate()}일 (${DAYS[d.getDay()]})`;
  const fmtTime = (iso) => { const d = new Date(iso); return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`; };
  const codeHash = (code) => window.sha256("advisee:" + String(code).trim().toUpperCase());

  /* 랩 일정 → 날짜별 목록 (매주 반복 일정 펼치기) */
  window.labOccurrences = function (events, who) {
    const out = [];
    (events || []).forEach((e, idx) => {
      if (!isDate(e.date)) return;
      const target = String(e.who || "전체").split(/[,，]/).map((s) => s.trim()).filter(Boolean);
      if (who && !(target.includes("전체") || target.includes(who))) return;
      const start = parse(e.date);
      const end = e.weekly && isDate(e.until) ? parse(e.until) : start;
      for (let d = new Date(start), n = 0; d <= end && n < 200; d.setDate(d.getDate() + 7), n++)
        out.push({ ...e, idx, day: new Date(d), dayKey: key(d) });
    });
    return out.sort((a, b) => a.day - b.day || String(a.time).localeCompare(String(b.time)));
  };

  window.renderPortal = function (C) {
    const root = document.getElementById("portalApp");
    if (!root) return;
    const A = C.advisees || {};
    const students = A.students || [];
    const stages = A.stages || ["계획서", "연구윤리(IRB) 승인", "예비심사", "본심사", "인준"];
    const me = () => {
      const s = S.get("advisee", null);
      return s && students.find((x) => x.name === s.name && x.codeHash && x.codeHash === s.h) || null;
    };

    /* ── 로그인 ── */
    const drawLogin = (msg) => {
      root.innerHTML = `
        <div class="portal-login reveal is-in">
          <div class="panel__head"><span class="panel__icon">🔐</span>
            <div><h3>지도학생 로그인</h3><p>교수님께 받은 개인 코드로 로그인하세요.</p></div></div>
          ${msg ? `<p class="notice-inline">${esc(msg)}</p>` : ""}
          <form class="login-form" novalidate>
            <div class="field"><label class="field__label" for="ptName">이름</label>
              <input id="ptName" name="name" autocomplete="name" placeholder="홍길동" /></div>
            <div class="field"><label class="field__label" for="ptCode">개인 코드</label>
              <input id="ptCode" name="code" type="password" autocomplete="current-password" placeholder="6자리 코드" /></div>
            <p class="field__err" role="alert"></p>
            <button class="btn btn--primary" type="submit">로그인</button>
          </form>
        </div>`;
      root.querySelector("form").addEventListener("submit", (e) => {
        e.preventDefault();
        const f = e.target, err = f.querySelector(".field__err");
        const name = f.elements.name.value.trim(), code = f.elements.code.value.trim();
        if (!name || !code) { err.textContent = "이름과 개인 코드를 모두 입력해 주세요."; return; }
        const st = students.find((x) => x.name === name);
        if (!st) { err.textContent = "지도학생 명단에서 찾을 수 없어요. 이름을 확인해 주세요."; return; }
        if (!st.codeHash) { err.textContent = "아직 개인 코드가 발급되지 않았어요. 교수님께 문의해 주세요."; return; }
        const h = codeHash(code);
        if (h !== st.codeHash) { err.textContent = "개인 코드가 맞지 않아요."; return; }
        S.set("advisee", { name, h });
        window.toast(`${name} 님, 반가워요! 🌿`);
        drawHome();
      });
    };

    /* ── 로그인 후 ── */
    let month = null, selected = null;
    const drawHome = () => {
      const st = me();
      if (!st) { S.remove("advisee"); return drawLogin(); }
      const done = Math.max(0, Math.min(stages.length, Number(st.stage) || 0));
      const pct = Math.round((done / stages.length) * 100);
      const occ = window.labOccurrences(C.labEvents, st.name);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const upcoming = occ.filter((o) => o.day >= today).slice(0, 5);
      if (!month) { const base = upcoming[0] ? upcoming[0].day : today; month = new Date(base.getFullYear(), base.getMonth(), 1); selected = upcoming[0] ? upcoming[0].day : today; }

      root.innerHTML = `
        <div class="me portal-me">
          <span class="me__avatar">${esc(st.name.charAt(0))}</span>
          <div><strong>${esc(st.name)} 님</strong><small>${esc([st.program, st.major].filter(Boolean).join(" · "))}</small></div>
          <button class="pill-btn" id="ptLogout">로그아웃</button>
        </div>

        <div class="portal-grid">
          <section class="panel portal-card">
            <h3>🎓 학위논문 진행 단계 <small>${done} / ${stages.length} 단계 완료</small></h3>
            <div class="stage-bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div>
            <ol class="stepper">
              ${stages.map((s, i) => {
                const state = i < done ? "done" : i === done ? "now" : "todo";
                const date = (st.stageDates || [])[i];
                return `<li class="step step--${state}">
                  <span class="step__dot" aria-hidden="true">${state === "done" ? "✓" : i + 1}</span>
                  <span class="step__label">${esc(s)}<small>${state === "done" ? (date ? `${esc(date)} 완료` : "완료") : state === "now" ? "진행 중" : "예정"}</small></span>
                </li>`;
              }).join("")}
            </ol>
            ${done >= stages.length ? `<p class="stage-done">🎉 모든 단계를 마쳤어요. 수고 많았어요!</p>` : ""}
          </section>

          <section class="panel portal-card">
            <h3>🗓️ 랩 미팅 · 면담 일정</h3>
            ${upcoming.length ? `<ul class="upcoming">${upcoming.map((o) => `
              <li><span class="upcoming__date">${fmt(o.day)}</span>
                <span><b class="chip chip--week">${esc(o.type || "일정")}</b> ${esc(o.title)}
                <small>${[o.time, o.location].filter(Boolean).map(esc).join(" · ")}</small></span></li>`).join("")}</ul>`
              : `<p class="muted">다가오는 일정이 없어요.</p>`}
            <div class="cal portal-cal">
              <div class="cal__head">
                <button class="slider__btn" id="pcPrev" aria-label="이전 달"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
                <strong id="pcTitle"></strong>
                <button class="slider__btn" id="pcNext" aria-label="다음 달"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
              </div>
              <div class="cal__week">${DAYS.map((d) => `<span>${d}</span>`).join("")}</div>
              <div class="cal__grid" id="pcGrid"></div>
            </div>
            <div class="pc-detail" id="pcDetail" aria-live="polite"></div>
          </section>
        </div>

        <section class="panel portal-card portal-report" id="reportBox"></section>`;

      root.querySelector("#ptLogout").addEventListener("click", () => { S.remove("advisee"); month = null; window.toast("로그아웃했어요."); drawLogin(); });

      /* 달력 */
      const byDay = new Map();
      occ.forEach((o) => (byDay.get(o.dayKey) || byDay.set(o.dayKey, []).get(o.dayKey)).push(o));
      const drawCal = () => {
        root.querySelector("#pcTitle").textContent = `${month.getFullYear()}년 ${month.getMonth() + 1}월`;
        const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
        let html = "";
        for (let i = 0; i < month.getDay(); i++) html += `<span class="cal__day is-empty"></span>`;
        for (let d = 1; d <= days; d++) {
          const date = new Date(month.getFullYear(), month.getMonth(), d), k = key(date), ev = byDay.get(k);
          html += `<button class="cal__day ${ev ? "has-class" : ""} ${+date === +today ? "is-today" : ""} ${selected && +date === +selected ? "is-selected" : ""} ${date.getDay() === 0 ? "is-sun" : date.getDay() === 6 ? "is-sat" : ""}"
            data-d="${k}" aria-label="${fmt(date)}${ev ? ", 일정 " + ev.length + "개" : ""}">
            <span class="cal__num">${d}</span>${ev ? `<span class="cal__tag">${esc(ev[0].type || "일정")}</span>` : ""}</button>`;
        }
        root.querySelector("#pcGrid").innerHTML = html;
        const sel = selected ? byDay.get(key(selected)) : null;
        root.querySelector("#pcDetail").innerHTML = selected ? `<p class="cd-date">${fmt(selected)}</p>${sel ? sel.map((o) => `
          <div class="cd-event"><span class="chip chip--event">${esc(o.type || "일정")}</span><h4>${esc(o.title)}</h4>
            ${o.time || o.location ? `<ul class="cd-meta">${o.time ? `<li>⏰ ${esc(o.time)}</li>` : ""}${o.location ? `<li>📍 ${esc(o.location)}</li>` : ""}</ul>` : ""}
            ${o.note ? `<p class="cd-note">${esc(o.note)}</p>` : ""}</div>`).join("") : `<p class="muted">이 날은 일정이 없어요.</p>`}` : "";
      };
      root.querySelector("#pcGrid").addEventListener("click", (e) => { const b = e.target.closest("[data-d]"); if (b) { selected = parse(b.dataset.d); drawCal(); } });
      root.querySelector("#pcPrev").addEventListener("click", () => { month = new Date(month.getFullYear(), month.getMonth() - 1, 1); drawCal(); });
      root.querySelector("#pcNext").addEventListener("click", () => { month = new Date(month.getFullYear(), month.getMonth() + 1, 1); drawCal(); });
      drawCal();

      drawReport(st);
    };

    /* ── 주간 진행 보고 ── */
    const drawReport = (st) => {
      const box = root.querySelector("#reportBox");
      const mine = S.get("reports", []).filter((r) => r["이름"] === st.name).reverse();
      const sheet = window.SheetSync.ready();
      box.innerHTML = `
        <h3>📝 주간 진행 보고</h3>
        <p class="muted">이번 주에 한 일과 다음 주 계획을 적어 주세요. 자료는 구글 드라이브 공유 주소로 첨부해요.</p>
        <form class="apply-form report-form" novalidate>
          <div class="form-summary" role="alert" hidden></div>
          <div class="form-grid">
            <div class="field"><label class="field__label" for="rpDate">보고 기준일 <em>*</em></label>
              <input type="date" id="rpDate" name="date" value="${key(new Date())}" /><p class="field__err"></p></div>
            <div class="field"><label class="field__label" for="rpLink">자료 링크 (구글 드라이브)</label>
              <input id="rpLink" name="link" inputmode="url" placeholder="https://drive.google.com/…" /><p class="field__err"></p></div>
            <div class="field field--wide"><label class="field__label" for="rpDone">이번 주 한 일 <em>*</em></label>
              <textarea id="rpDone" name="done" rows="4" placeholder="읽은 문헌, 분석 진행 상황, 쓴 원고 등"></textarea><p class="field__err"></p></div>
            <div class="field field--wide"><label class="field__label" for="rpPlan">다음 주 계획 <em>*</em></label>
              <textarea id="rpPlan" name="plan" rows="3"></textarea><p class="field__err"></p></div>
            <div class="field field--wide"><label class="field__label" for="rpAsk">질문 · 논의하고 싶은 점</label>
              <textarea id="rpAsk" name="ask" rows="3"></textarea><p class="field__err"></p></div>
          </div>
          <button class="btn btn--primary apply-form__submit" type="submit">보고 제출하기</button>
          <p class="report-dest" id="reportDest">${sheet ? "📤 제출하면 교수님께 바로 전달돼요." : "💾 지금은 서버가 연결되지 않아 이 기기에만 저장돼요."}</p>
        </form>
        <h4 class="report-mine">내가 낸 보고 <small>${mine.length}건 · 이 기기 기준</small></h4>
        ${mine.length ? `<div class="faq">${mine.map((r) => `
          <details class="faq__item"><summary><span class="faq__q">✓</span><span>${esc(r["보고 기준일"])} 보고 <small class="muted">${fmtTime(r["제출 시각"])} 제출</small></span><i aria-hidden="true"></i></summary>
            <div class="report-view">
              <p><b>이번 주 한 일</b>${esc(r["이번 주 한 일"])}</p>
              <p><b>다음 주 계획</b>${esc(r["다음 주 계획"])}</p>
              ${r["질문"] ? `<p><b>질문</b>${esc(r["질문"])}</p>` : ""}
              ${r["자료 링크"] ? `<p><b>자료</b><a href="${esc(r["자료 링크"])}" target="_blank" rel="noopener">구글 드라이브에서 열기 ↗</a></p>` : ""}
            </div></details>`).join("")}</div>` : `<p class="muted">아직 낸 보고가 없어요.</p>`}`;

      window.ServerDB.ready().then((on) => {
        const d = box.querySelector("#reportDest");
        if (on && d) d.textContent = "📤 제출하면 교수님께 바로 전달돼요.";
      });
      const form = box.querySelector("form");
      const setErr = (name, msg) => {
        const wrap = form.elements[name].closest(".field");
        wrap.classList.toggle("is-invalid", !!msg);
        wrap.querySelector(".field__err").textContent = msg;
        form.elements[name].setAttribute("aria-invalid", msg ? "true" : "false");
        return msg ? { name, label: wrap.querySelector("label").textContent.replace("*", "").trim(), msg } : null;
      };
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const v = (n) => form.elements[n].value.trim();
        const link = v("link");
        const bad = [
          setErr("date", isDate(v("date")) ? "" : "보고 기준일을 골라 주세요."),
          setErr("done", v("done") ? "" : "이번 주 한 일을 적어 주세요."),
          setErr("plan", v("plan") ? "" : "다음 주 계획을 적어 주세요."),
          setErr("link", !link || window.parseDrive(link) ? "" : "구글 드라이브 공유 주소만 넣을 수 있어요.")
        ].filter(Boolean);
        const sum = form.querySelector(".form-summary");
        if (bad.length) {
          sum.hidden = false;
          sum.innerHTML = `<strong>확인이 필요한 항목이 ${bad.length}개 있어요</strong><ul>${bad.map((b) => `<li>${esc(b.label)} — ${esc(b.msg)}</li>`).join("")}</ul>`;
          form.elements[bad[0].name].focus();
          return;
        }
        sum.hidden = true;
        const data = {
          "이름": st.name, "과정": [st.program, st.major].filter(Boolean).join(" · "),
          "보고 기준일": v("date"), "이번 주 한 일": v("done"), "다음 주 계획": v("plan"),
          "질문": v("ask"), "자료 링크": link, "제출 시각": new Date().toISOString()
        };
        const all = S.get("reports", []); all.push(data); S.set("reports", all);
        const btn = form.querySelector("button[type=submit]"); btn.disabled = true; btn.textContent = "보내는 중…";
        const [toDb, toSheet] = await Promise.all([window.ServerDB.send("report", data), window.SheetSync.send("report", data)]);
        window.toast(toDb || toSheet ? "보고를 제출했어요. 교수님께 전달됐어요! 📤" : "보고를 저장했어요. (서버 미연결 — 이 기기에만 저장)");
        drawReport(st);
      });
    };

    me() ? drawHome() : drawLogin();
  };
})();
