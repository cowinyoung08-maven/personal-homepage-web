/* 4단계: 수강생 참여 — 실시간 투표, 수강 신청서, 로그인(출석 체크·과제 제출)
 * 기록은 store.js를 통해 이 브라우저(localStorage)에 저장됩니다. */
(function () {
  const esc = window.esc;
  const S = window.Store;

  window.renderParticipate = function (root, C) {
    const K = () => window.COURSE; // curriculum.js가 만든 일정 정보

    root.innerHTML = `
      <div class="join-grid">
        <article class="panel reveal" id="poll">
          <div class="panel__head">
            <span class="panel__icon">🗳️</span>
            <div><h3>${esc(C.poll.title)}</h3><p>${esc(C.poll.description)}</p></div>
          </div>
          <div class="poll" id="pollList" role="group" aria-label="${esc(C.poll.title)}"></div>
          <p class="poll__foot"><span class="live-dot"></span><span id="pollTotal"></span></p>
        </article>

        <article class="panel reveal" id="student">
          <div id="studentBox"></div>
        </article>
      </div>

      <article class="panel panel--form reveal" id="apply">
        <div class="panel__head">
          <span class="panel__icon">📝</span>
          <div><h3>${esc(C.apply.title)}</h3><p>${esc(C.apply.description)}</p></div>
        </div>
        <div id="applyBox"></div>
      </article>`;

    /* ───────────────── 실시간 투표 ───────────────── */
    const opts = C.poll.options;
    const drawPoll = () => {
      const votes = S.get("poll:votes", {});
      const my = S.get("poll:my", null);
      const total = opts.reduce((s, o) => s + (votes[o.id] || 0), 0);
      const max = Math.max(1, ...opts.map((o) => votes[o.id] || 0));
      root.querySelector("#pollList").innerHTML = opts.map((o) => {
        const n = votes[o.id] || 0;
        const pct = total ? Math.round((n / total) * 100) : 0;
        const mine = my === o.id;
        return `
          <button class="poll__opt ${mine ? "is-mine" : ""} ${n === max && n > 0 ? "is-top" : ""}" data-id="${esc(o.id)}"
            aria-pressed="${mine}" title="${esc(o.label)}: ${n}표 (${pct}%)">
            <span class="poll__fill" style="width:${pct}%"></span>
            <span class="poll__label">${mine ? "✓ " : ""}${esc(o.label)}</span>
            <span class="poll__val"><b>${pct}%</b> · ${n}표</span>
          </button>`;
      }).join("");
      root.querySelector("#pollTotal").textContent = total
        ? `총 ${total}명 참여 · 실시간 반영 중${my ? " · 다른 항목을 누르면 투표가 바뀌어요" : ""}`
        : "아직 투표가 없어요. 첫 번째로 투표해 보세요!";
    };
    root.querySelector("#pollList").addEventListener("click", (e) => {
      const b = e.target.closest(".poll__opt"); if (!b) return;
      const id = b.dataset.id, my = S.get("poll:my", null);
      if (my === id) return;
      const votes = S.get("poll:votes", {});
      if (my && votes[my]) votes[my]--;
      votes[id] = (votes[id] || 0) + 1;
      S.set("poll:my", id);
      S.set("poll:votes", votes);
      window.toast(my ? "투표를 바꿨어요." : "투표해 주셔서 고마워요! 🌸");
    });
    S.on("poll:votes", drawPoll);
    S.on("poll:my", drawPoll);
    drawPoll();

    /* ───────────────── 수강 신청서 ───────────────── */
    const applyBox = root.querySelector("#applyBox");
    const fields = C.apply.fields;
    const fieldHTML = (f) => {
      const id = `ap-${f.name}`, req = f.required ? `<em aria-hidden="true">*</em>` : "";
      const common = `id="${id}" name="${esc(f.name)}" aria-describedby="${id}-err" ${f.required ? 'aria-required="true"' : ""}`;
      let control;
      if (f.type === "select") {
        control = `<select ${common}><option value="">선택해 주세요</option>${f.options.map((o) => `<option>${esc(o)}</option>`).join("")}</select>`;
      } else if (f.type === "radio") {
        control = `<div class="choice-row" role="radiogroup" aria-labelledby="${id}-lb" ${common.replace(`id="${id}"`, `id="${id}"`)}>
          ${f.options.map((o, i) => `<label class="choice"><input type="radio" name="${esc(f.name)}" value="${esc(o)}" ${i === 0 ? `data-first` : ""}/><span>${esc(o)}</span></label>`).join("")}</div>`;
      } else if (f.type === "textarea") {
        control = `<textarea ${common} rows="4" placeholder="${esc(f.placeholder)}"></textarea>`;
      } else if (f.type === "checkbox") {
        return `<div class="field field--check" data-name="${esc(f.name)}">
          <label class="check"><input type="checkbox" ${common} /><span>${esc(f.label)} ${req}</span></label>
          <p class="field__err" id="${id}-err"></p></div>`;
      } else {
        control = `<input type="${f.type === "email" ? "email" : f.type === "tel" ? "tel" : "text"}" ${common}
          placeholder="${esc(f.placeholder)}" ${f.type === "tel" ? 'inputmode="tel"' : ""} ${f.name === "studentId" ? 'inputmode="numeric"' : ""} />`;
      }
      const wide = f.type === "textarea" || f.type === "radio" ? " field--wide" : "";
      return `<div class="field${wide}" data-name="${esc(f.name)}">
        <label class="field__label" id="${id}-lb" for="${id}">${esc(f.label)} ${req}</label>
        ${control}
        <p class="field__err" id="${id}-err"></p></div>`;
    };

    const drawForm = () => {
      applyBox.innerHTML = `
        <form class="apply-form" id="applyForm" novalidate>
          <div class="form-summary" id="formSummary" role="alert" hidden></div>
          <div class="form-grid">${fields.map(fieldHTML).join("")}</div>
          <button class="btn btn--primary apply-form__submit" type="submit">${esc(C.apply.submitLabel)}</button>
        </form>`;
      const form = applyBox.querySelector("#applyForm");
      form.addEventListener("submit", onSubmit);
      form.addEventListener("input", (e) => {
        const wrap = e.target.closest(".field");
        if (wrap && wrap.classList.contains("is-invalid")) check(form, fields.find((f) => f.name === wrap.dataset.name));
      });
      form.addEventListener("change", (e) => {
        const wrap = e.target.closest(".field");
        if (wrap && wrap.classList.contains("is-invalid")) check(form, fields.find((f) => f.name === wrap.dataset.name));
      });
    };

    const valueOf = (form, f) => {
      if (f.type === "radio") { const r = form.querySelector(`input[name="${f.name}"]:checked`); return r ? r.value : ""; }
      if (f.type === "checkbox") return form.elements[f.name].checked;
      return form.elements[f.name].value.trim();
    };
    const errorOf = (form, f) => {
      const v = valueOf(form, f);
      if (f.required && (v === "" || v === false)) {
        if (f.type === "checkbox") return "동의가 필요해요.";
        if (f.type === "select" || f.type === "radio") return `${f.label} 항목을 선택해 주세요.`;
        return `${f.label} 항목을 입력해 주세요.`;
      }
      if (v && f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "이메일 형식이 올바르지 않아요. (예: name@korea.ac.kr)";
      if (v && f.pattern && !new RegExp(f.pattern).test(v)) return f.patternMessage || "형식이 올바르지 않아요.";
      if (f.name === "studentId" && v && S.get("applications", []).some((a) => a.studentId === v)) return "이미 신청한 학번이에요.";
      return "";
    };
    const check = (form, f) => {
      const msg = errorOf(form, f);
      const wrap = form.querySelector(`.field[data-name="${f.name}"]`);
      wrap.classList.toggle("is-invalid", !!msg);
      wrap.querySelector(".field__err").textContent = msg;
      const ctrl = form.elements[f.name];
      if (ctrl && ctrl.setAttribute) ctrl.setAttribute("aria-invalid", msg ? "true" : "false");
      return msg;
    };

    function onSubmit(e) {
      e.preventDefault();
      const form = e.target;
      const bad = fields.filter((f) => check(form, f));
      const summary = form.querySelector("#formSummary");
      if (bad.length) {
        summary.hidden = false;
        summary.innerHTML = `<strong>확인이 필요한 항목이 ${bad.length}개 있어요</strong>
          <ul>${bad.map((f) => `<li><a href="#ap-${esc(f.name)}" data-focus="${esc(f.name)}">${esc(f.label.length > 14 ? "개인정보 동의" : f.label)}</a> — ${esc(errorOf(form, f))}</li>`).join("")}</ul>`;
        summary.querySelectorAll("[data-focus]").forEach((a) => a.addEventListener("click", (ev) => {
          ev.preventDefault(); focusField(form, fields.find((f) => f.name === a.dataset.focus));
        }));
        summary.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => focusField(form, bad[0]), 350);
        return;
      }
      summary.hidden = true;
      const data = {};
      fields.forEach((f) => (data[f.name] = valueOf(form, f)));
      data.submittedAt = new Date().toISOString();
      const list = S.get("applications", []);
      list.push(data);
      S.set("applications", list);
      drawDone(data);
      if (window.Confetti) window.Confetti.burst();
    }
    const focusField = (form, f) => {
      const el = f.type === "radio" ? form.querySelector(`input[name="${f.name}"]`) : form.elements[f.name];
      if (el) el.focus({ preventScroll: false });
    };

    const drawDone = (d) => {
      applyBox.innerHTML = `
        <div class="done">
          <div class="done__icon">🎉</div>
          <h4>${esc(C.apply.successTitle)}</h4>
          <p>${esc(d.name)} 님 (${esc(d.studentId)}) · ${esc(C.apply.successText)}</p>
          <button class="pill-btn" id="applyAgain">다른 신청서 작성하기</button>
        </div>`;
      applyBox.querySelector("#applyAgain").addEventListener("click", drawForm);
      applyBox.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    drawForm();

    /* ───────────────── 로그인 · 출석 · 과제 ───────────────── */
    const box = root.querySelector("#studentBox");
    const roster = () => C.students || [];
    let pickedWeek = null;

    const drawLogin = (msg) => {
      box.innerHTML = `
        <div class="panel__head">
          <span class="panel__icon">🔐</span>
          <div><h3>${esc(C.login.title)}</h3><p>${esc(C.login.description)}</p></div>
        </div>
        ${msg ? `<p class="notice-inline">${esc(msg)}</p>` : ""}
        <form class="login-form" id="loginForm" novalidate>
          <div class="field"><label class="field__label" for="lg-id">학번</label>
            <input id="lg-id" name="id" inputmode="numeric" autocomplete="username" placeholder="학번 10자리" /></div>
          <div class="field"><label class="field__label" for="lg-name">이름</label>
            <input id="lg-name" name="name" autocomplete="name" placeholder="홍길동" /></div>
          <p class="field__err" id="loginErr" role="alert"></p>
          <button class="btn btn--primary" type="submit">로그인</button>
        </form>`;
      box.querySelector("#loginForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const id = e.target.elements.id.value.trim(), name = e.target.elements.name.value.trim();
        const err = box.querySelector("#loginErr");
        if (!id || !name) { err.textContent = "학번과 이름을 모두 입력해 주세요."; return; }
        const st = roster().find((s) => String(s.id) === id && s.name === name);
        if (!st) { err.textContent = "수강생 명단에서 찾을 수 없어요. 학번과 이름을 다시 확인해 주세요."; return; }
        S.set("session", { id: String(st.id), name: st.name });
        window.toast(`${st.name} 님, 반가워요!`);
        drawStudent();
      });
    };

    const drawStudent = () => {
      const me = S.get("session", null);
      if (!me || !roster().some((s) => String(s.id) === me.id)) { S.remove("session"); return drawLogin(); }
      const c = K(), now = c.now(), today = c.today;
      const att = (S.get("attendance", {})[me.id]) || {};
      const subs = (S.get("submissions", {})[me.id]) || {};
      // 출석은 수업 회차(날짜)별로 기록 — 키: "YYYY-MM-DD"
      const todayClass = c.sessions.find((s) => +s.date === +today);
      const nextClass = c.sessions.find((s) => s.date > today);
      const past = c.sessions.filter((s) => s.date <= today);
      const present = past.filter((s) => att[s.key]).length;
      const tasks = c.weeks.filter((w) => w.assignment);
      const openTasks = tasks.filter((w) => w.due > now);
      if (pickedWeek == null || !tasks.some((w) => w.no === pickedWeek)) pickedWeek = (openTasks[0] || tasks[tasks.length - 1] || {}).no;
      const picked = tasks.find((w) => w.no === pickedWeek);
      const time = (iso) => { const d = new Date(iso); return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };

      let attNow;
      if (todayClass && att[todayClass.key]) attNow = `<div class="att-now is-done">✓ 오늘 ${esc(todayClass.week.label)} 수업 출석 완료 <small>${time(att[todayClass.key])}</small></div>`;
      else if (todayClass) attNow = `<button class="btn btn--primary att-btn" id="checkIn">🙋 오늘(${esc(todayClass.week.label)}) 출석 체크하기</button>`;
      else attNow = `<div class="att-now">오늘은 수업일이 아니에요${nextClass ? ` · 다음 수업 <b>${c.fmt(nextClass.date)}</b> (${esc(nextClass.week.label)})` : ""}</div>`;

      box.innerHTML = `
        <div class="me">
          <span class="me__avatar">${esc(me.name.charAt(0))}</span>
          <div><strong>${esc(me.name)} 님</strong><small>${esc(me.id)}</small></div>
          <button class="pill-btn" id="logout">로그아웃</button>
        </div>

        <section class="stu-block">
          <h4>출석 체크 <span class="muted">출석 ${present} / ${past.length}회</span></h4>
          ${attNow}
          <ol class="att-strip" aria-label="수업 회차별 출석 현황">
            ${c.sessions.map((s) => {
              const st = att[s.key] ? "ok" : s.date < today ? "miss" : +s.date === +today ? "today" : "todo";
              const lb = { ok: "출석", miss: "결석", today: "오늘", todo: "예정" }[st];
              return `<li class="att att--${st}" title="${esc(s.week.label)} ${c.fmt(s.date)} · ${lb}"><span>${s.date.getMonth() + 1}/${s.date.getDate()}</span><i>${st === "ok" ? "✓" : st === "miss" ? "✕" : "·"}</i></li>`;
            }).join("")}
          </ol>
          <p class="att-legend"><span class="att--ok">✓ 출석</span><span class="att--miss">✕ 결석</span><span class="att--todo">· 예정</span></p>
        </section>

        <section class="stu-block" id="submitBox">
          <h4>과제 제출</h4>
          <label class="field__label" for="taskPick">제출할 과제</label>
          <select id="taskPick">
            ${tasks.map((w) => {
              const done = subs[w.no], closed = w.due <= now;
              return `<option value="${w.no}" ${w.no === pickedWeek ? "selected" : ""}>${esc(w.label)} · ${esc(w.assignment.title)} ${done ? "(제출함)" : closed ? "(마감)" : ""}</option>`;
            }).join("")}
          </select>
          ${picked ? (() => {
            const l = c.leftText(picked.due), done = subs[picked.no], closed = l.state === "closed";
            return `
              <div class="sub-info task--${l.state}">
                <span>마감 ${c.fmtDue(picked.due)}</span><b class="task__left">⏳ ${l.text}</b>
              </div>
              ${done ? `<div class="sub-done">📎 <b>${esc(done.file)}</b> <small>${window.fmtSize(done.size)} · ${time(done.at)} 제출</small></div>` : ""}
              ${closed ? `<p class="muted">마감된 과제는 제출할 수 없어요.</p>` : `
                <label class="drop" id="drop">
                  <input type="file" id="fileInput" accept="${esc(C.submission.accept)}" />
                  <span class="drop__icon">📂</span>
                  <span class="drop__text" id="dropText">파일을 끌어다 놓거나 눌러서 선택하세요<br /><small>최대 ${C.submission.maxSizeMB}MB · ${esc(C.submission.accept.replace(/\./g, "").replace(/,/g, ", "))}</small></span>
                </label>
                <p class="field__err" id="fileErr" role="alert"></p>
                <button class="btn btn--primary" id="sendFile">${done ? "다시 제출하기" : "제출하기"}</button>`}`;
          })() : `<p class="muted">등록된 과제가 없어요.</p>`}
        </section>`;

      box.querySelector("#logout").addEventListener("click", () => { S.remove("session"); window.toast("로그아웃했어요."); drawLogin(); });
      const ci = box.querySelector("#checkIn");
      if (ci) ci.addEventListener("click", () => {
        const all = S.get("attendance", {});
        all[me.id] = { ...(all[me.id] || {}), [todayClass.key]: c.now().toISOString() };
        S.set("attendance", all);
        window.toast(`오늘 수업 출석이 확인됐어요! ✓`);
        if (window.Confetti) window.Confetti.burst({ count: 60 });
        drawStudent();
      });
      box.querySelector("#taskPick").addEventListener("change", (e) => { pickedWeek = +e.target.value; drawStudent(); });

      const input = box.querySelector("#fileInput");
      if (input) {
        const drop = box.querySelector("#drop"), err = box.querySelector("#fileErr");
        let file = null;
        const pick = (f) => {
          err.textContent = "";
          if (!f) return;
          if (f.size > C.submission.maxSizeMB * 1024 * 1024) { err.textContent = `파일이 너무 커요. ${C.submission.maxSizeMB}MB 이하로 올려주세요.`; file = null; return; }
          file = f;
          box.querySelector("#dropText").innerHTML = `<b>${esc(f.name)}</b><br /><small>${window.fmtSize(f.size)} · 제출하기를 눌러주세요</small>`;
          drop.classList.add("has-file");
        };
        input.addEventListener("change", () => pick(input.files[0]));
        ["dragenter", "dragover"].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add("is-over"); }));
        ["dragleave", "drop"].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.remove("is-over"); }));
        drop.addEventListener("drop", (e) => pick(e.dataTransfer.files[0]));
        box.querySelector("#sendFile").addEventListener("click", () => {
          if (!file) { err.textContent = "제출할 파일을 먼저 선택해 주세요."; return; }
          if (picked.due <= c.now()) { err.textContent = "마감 시간이 지났어요."; return; }
          const all = S.get("submissions", {});
          all[me.id] = { ...(all[me.id] || {}), [picked.no]: { file: file.name, size: file.size, at: c.now().toISOString() } };
          S.set("submissions", all);
          window.toast(`${picked.label} 과제를 제출했어요! 📎`);
          drawStudent();
        });
      }
    };

    // 커리큘럼의 '과제 제출하기' 버튼에서 넘어올 때
    window.addEventListener("assignment:submit", (e) => {
      pickedWeek = e.detail.week;
      if (S.get("session", null)) {
        drawStudent();
        setTimeout(() => box.querySelector("#submitBox").scrollIntoView({ behavior: "smooth", block: "start" }), 50);
      } else {
        drawLogin("과제를 제출하려면 먼저 로그인해 주세요.");
        root.querySelector("#student").scrollIntoView({ behavior: "smooth", block: "start" });
        setTimeout(() => box.querySelector("#lg-id").focus({ preventScroll: true }), 500);
      }
    });

    S.get("session", null) ? drawStudent() : drawLogin();
  };
})();
