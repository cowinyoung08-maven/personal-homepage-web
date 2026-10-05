/* 5단계: 학생 전용 공간 (지도학생 로그인)
 * - 로그인: 이름 + 개인 코드 (config에는 코드의 암호화된 값만 저장)
 * - 학위논문 진행 단계 / 주간 진행 보고 (구글 드라이브 자료 링크) / 프로필 수정 요청
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
  const tlCode = {
    get: () => { try { return sessionStorage.getItem("home:adviseeCode") || ""; } catch (e) { return ""; } },
    set: (v) => { try { v ? sessionStorage.setItem("home:adviseeCode", v) : sessionStorage.removeItem("home:adviseeCode"); } catch (e) {} }
  };

  /* ── 학기 타임라인 공용 도우미 (관리자 화면에서도 씀) ── */
  const TL = window.TL = {
    // 목표일까지 남은 날: "D-5" / "오늘" / "3일 지남"
    dday(due, done) {
      if (!isDate(due)) return "";
      const t = new Date(); t.setHours(0, 0, 0, 0);
      const n = Math.round((parse(due) - t) / 86400000);
      if (done) return "";
      return n > 0 ? `D-${n}` : n === 0 ? "오늘" : `${-n}일 지남`;
    },
    late: (r) => !r.done && isDate(r.due) && parse(r.due) < new Date(new Date().setHours(0, 0, 0, 0)),
    // 한 학생·학기 요약
    sum(rows) { const total = rows.length, done = rows.filter((r) => r.done).length, late = rows.filter(TL.late).length;
      return { total, done, late, pct: total ? Math.round((done / total) * 100) : 0 }; },
    terms(rows) { return [...new Set([window.currentTerm(), ...rows.map((r) => r.term)])].filter(Boolean).sort().reverse(); },
    itemHTML(r, opts = {}) {
      const dd = TL.dday(r.due, r.done);
      return `<li class="tl-item ${r.done ? "is-done" : ""} ${TL.late(r) ? "is-late" : ""}">
        ${opts.check ? `<label class="tl-item__check"><input type="checkbox" data-tl-done="${r.idx}" ${r.done ? "checked" : ""} aria-label="${esc(r.title)} 완료" /></label>`
          : `<span class="tl-item__mark" aria-hidden="true">${r.done ? "✓" : ""}</span>`}
        <span class="tl-item__body"><b>${esc(r.title)}</b>
          <small>${r.due ? `목표 ${esc(r.due)}` : "목표일 없음"}${r.done && r.doneAt ? ` · ${esc(r.doneAt)} 완료` : ""}${dd ? ` · <em>${esc(dd)}</em>` : ""}</small>
          ${r.memo ? `<span class="tl-item__memo">💬 ${esc(r.memo)}</span>` : ""}</span>
        ${r.ok ? `<span class="chip chip--week tl-item__ok">교수님 확인</span>` : ""}
        ${opts.admin || ""}
      </li>`;
    },
    barHTML(s) { return `<div class="stage-bar tl-bar" role="progressbar" aria-valuenow="${s.pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${s.pct}%"></i></div>`; }
  };

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
        tlCode.set(code); // 학기 타임라인을 시트에서 읽고 쓸 때 필요 (이 탭에서만 기억)
        window.toast(`${name} 님, 반가워요! 🌿`);
        drawHome();
      });
    };

    /* ── 로그인 후 ── */
    const drawHome = () => {
      const st = me();
      if (!st) { S.remove("advisee"); return drawLogin(); }
      const done = Math.max(0, Math.min(stages.length, Number(st.stage) || 0));
      const pct = Math.round((done / stages.length) * 100);

      root.innerHTML = `
        <div class="me portal-me">
          <span class="me__avatar">${esc(st.name.charAt(0))}</span>
          <div><strong>${esc(st.name)} 님</strong><small>${esc([st.program, st.major].filter(Boolean).join(" · "))}</small></div>
          <button class="pill-btn" id="ptLogout">로그아웃</button>
        </div>

        <div class="portal-grid portal-grid--one">
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
        </div>

        <section class="panel portal-card portal-report" id="tlBox"></section>
        <section class="panel portal-card portal-report" id="reportBox"></section>
        <section class="panel portal-card portal-report" id="profileBox"></section>`;

      root.querySelector("#ptLogout").addEventListener("click", () => { S.remove("advisee"); tlCode.set(""); window.toast("로그아웃했어요."); drawLogin(); });

      drawTimeline(st);
      drawReport(st);
      drawProfile(st);
    };

    /* ── 학기 타임라인: 학기마다 내 계획(할 일 + 목표일)을 올리고 완료를 체크, 연구실 전체 진행도 함께 봄 ── */
    let tlTerm = null, tlRows = null, tlEdit = false;
    const drawTimeline = async (st, reload = true) => {
      const box = root.querySelector("#tlBox"); if (!box) return;
      const head = `<h3>📅 학기 타임라인 <small>연구실 모두가 서로의 계획과 진행을 볼 수 있어요</small></h3>`;
      if (!window.SheetAPI.ready()) { box.innerHTML = head + `<p class="muted">구글 시트가 연결되지 않아 지금은 쓸 수 없어요.</p>`; return; }
      if (!tlCode.get()) {
        box.innerHTML = head + `<form class="tl-code" novalidate><p class="muted">타임라인을 불러오려면 개인 코드를 한 번 더 입력해 주세요. (이 탭을 닫으면 다시 물어봐요)</p>
          <div class="ad-row"><input class="admin-input" name="code" type="password" autocomplete="current-password" placeholder="개인 코드" aria-label="개인 코드" />
          <button class="btn btn--primary" type="submit">불러오기</button></div><p class="field__err" role="alert"></p></form>`;
        box.querySelector("form").addEventListener("submit", (e) => {
          e.preventDefault();
          const c = e.target.elements.code.value.trim();
          if (codeHash(c) !== st.codeHash) { e.target.querySelector(".field__err").textContent = "개인 코드가 맞지 않아요."; return; }
          tlCode.set(c); drawTimeline(st);
        });
        return;
      }
      if (reload || !tlRows) {
        box.innerHTML = head + `<p class="muted">불러오는 중…</p>`;
        let res;
        try { res = await window.SheetAPI.call("tl_all", { name: st.name, code: tlCode.get() }); }
        catch (e) { res = { ok: false, message: "시트에 연결하지 못했어요. 잠시 후 다시 시도해 주세요." }; }
        if (!res || !res.ok) {
          if (res && res.error === "auth") tlCode.set("");
          box.innerHTML = head + `<p class="notice-inline">${esc((res && (res.message || res.error)) || "불러오지 못했어요.")}</p><button class="pill-btn" type="button" id="tlRetry">다시 시도</button>`;
          box.querySelector("#tlRetry").addEventListener("click", () => drawTimeline(st));
          return;
        }
        tlRows = res.rows || [];
      }
      const terms = TL.terms(tlRows);
      if (!tlTerm || !terms.includes(tlTerm)) tlTerm = window.currentTerm();
      const termRows = tlRows.filter((r) => r.term === tlTerm);
      const mine = termRows.filter((r) => r.name === st.name).sort((a, b) => a.idx - b.idx);
      const sm = TL.sum(mine);
      const editing = tlEdit || !mine.length;
      const editRow = (it = {}) => `<div class="tl-edit-row">
          <input class="admin-input" name="title" maxlength="120" placeholder="할 일 (예: 문헌 검토 완료, IRB 신청, 본심사 원고 제출)" value="${esc(it.title || "")}" aria-label="할 일" />
          <input class="admin-input" name="due" type="date" value="${esc(it.due || "")}" aria-label="목표일" />
          <button class="ad-x" type="button" data-tl-del aria-label="이 줄 지우기">✕</button></div>`;
      const myHTML = editing ? `
          <form class="tl-edit" novalidate>
            <p class="muted">${mine.length ? "고친 뒤 저장하면 이번 학기 계획이 바뀌어요. 이름이 같은 항목은 완료·확인 표시가 그대로 남아요." : `${esc(window.termLabel(tlTerm))}에 할 일과 목표일을 적어 올려 주세요. 학기에 한 번 올리고, 필요하면 고칠 수 있어요.`}</p>
            <div class="tl-edit-rows">${(mine.length ? mine : [{}, {}, {}]).map(editRow).join("")}</div>
            <div class="ad-row"><button class="pill-btn" type="button" id="tlAddRow">+ 항목 추가</button></div>
            <p class="field__err" role="alert"></p>
            <div class="ad-row"><button class="btn btn--primary" type="submit">타임라인 저장</button>${mine.length ? `<button class="pill-btn" type="button" id="tlCancel">취소</button>` : ""}</div>
          </form>`
        : `${TL.barHTML(sm)}<p class="tl-sum">${sm.done} / ${sm.total} 완료${sm.late ? ` · <span class="tl-late">목표일 지난 항목 ${sm.late}개</span>` : ""}</p>
           <ul class="tl-list">${mine.map((r) => TL.itemHTML(r, { check: true })).join("")}</ul>
           <div class="ad-row"><button class="pill-btn" type="button" id="tlEditBtn">✏️ 타임라인 고치기</button></div>`;
      const labHTML = students.map((s) => {
        const rs = termRows.filter((r) => r.name === s.name).sort((a, b) => a.idx - b.idx), x = TL.sum(rs);
        return `<details class="tl-member ${s.name === st.name ? "is-me" : ""}">
          <summary><span class="tl-member__name">${esc(s.name)}${s.name === st.name ? " <small>(나)</small>" : ""}<small>${esc([s.program, s.major].filter(Boolean).join(" · "))}</small></span>
            ${rs.length ? `${TL.barHTML(x)}<span class="tl-member__num">${x.done}/${x.total}${x.late ? ` <span class="tl-late">⚠ ${x.late}</span>` : ""}</span>` : `<span class="muted tl-member__none">아직 올리지 않음</span>`}</summary>
          ${rs.length ? `<ul class="tl-list">${rs.map((r) => TL.itemHTML(r)).join("")}</ul>` : ""}
        </details>`;
      }).join("");
      box.innerHTML = head + `
        <div class="tl-term"><label for="tlTermSel">학기</label>
          <select class="ad-select" id="tlTermSel">${terms.map((t) => `<option value="${esc(t)}" ${t === tlTerm ? "selected" : ""}>${esc(window.termLabel(t))}</option>`).join("")}</select>
          <button class="pill-btn" type="button" id="tlReload">새로고침</button></div>
        <div class="tl-mine"><h4>내 타임라인</h4>${myHTML}</div>
        <div class="tl-lab"><h4>연구실 전체 <small>${esc(window.termLabel(tlTerm))}</small></h4>${labHTML}</div>`;

      box.querySelector("#tlTermSel").addEventListener("change", (e) => { tlTerm = e.target.value; tlEdit = false; drawTimeline(st, false); });
      box.querySelector("#tlReload").addEventListener("click", () => drawTimeline(st));
      const eb = box.querySelector("#tlEditBtn"); if (eb) eb.addEventListener("click", () => { tlEdit = true; drawTimeline(st, false); });
      const cb = box.querySelector("#tlCancel"); if (cb) cb.addEventListener("click", () => { tlEdit = false; drawTimeline(st, false); });
      const form = box.querySelector(".tl-edit");
      if (form) {
        const rowsBox = form.querySelector(".tl-edit-rows");
        form.querySelector("#tlAddRow").addEventListener("click", () => {
          if (rowsBox.children.length >= 20) { window.toast("항목은 20개까지 넣을 수 있어요."); return; }
          rowsBox.insertAdjacentHTML("beforeend", editRow()); rowsBox.lastElementChild.querySelector("input").focus();
        });
        rowsBox.addEventListener("click", (e) => { const b = e.target.closest("[data-tl-del]"); if (b) b.closest(".tl-edit-row").remove(); });
        form.addEventListener("submit", async (e) => {
          e.preventDefault();
          const items = [...rowsBox.querySelectorAll(".tl-edit-row")].map((r) => ({ title: r.querySelector("[name=title]").value.trim(), due: r.querySelector("[name=due]").value }))
            .filter((it) => it.title);
          const err = form.querySelector(".field__err");
          if (!items.length) { err.textContent = "할 일을 하나 이상 적어 주세요."; return; }
          if (new Set(items.map((i) => i.title)).size !== items.length) { err.textContent = "같은 이름의 항목이 있어요. 조금씩 다르게 적어 주세요."; return; }
          const btn = form.querySelector("button[type=submit]"); btn.disabled = true; btn.textContent = "저장하는 중…";
          let res; try { res = await window.SheetAPI.call("tl_save", { name: st.name, code: tlCode.get(), term: tlTerm, items }); } catch (x) { res = { ok: false }; }
          if (!res || !res.ok) { btn.disabled = false; btn.textContent = "타임라인 저장"; err.textContent = (res && res.message) || "저장하지 못했어요. 잠시 후 다시 시도해 주세요."; return; }
          window.toast("타임라인을 저장했어요. 📅"); tlEdit = false; drawTimeline(st);
        });
      }
      box.querySelectorAll("[data-tl-done]").forEach((c) => c.addEventListener("change", async () => {
        const r = mine.find((x) => x.idx === Number(c.dataset.tlDone)); c.disabled = true;
        let res; try { res = await window.SheetAPI.call("tl_done", { name: st.name, code: tlCode.get(), term: tlTerm, idx: r.idx, done: c.checked }); } catch (x) { res = { ok: false }; }
        if (!res || !res.ok) { c.checked = !c.checked; c.disabled = false; window.toast("저장하지 못했어요. 다시 시도해 주세요."); return; }
        r.done = c.checked; r.doneAt = c.checked ? key(new Date()) : ""; drawTimeline(st, false);
      }));
    };

    /* ── 내 프로필 수정 요청 (교수님이 확인한 뒤 홈페이지에 반영) ── */
    const workLine = (w) => [w.year, w.type, w.title, w.venue, w.link].map((x) => String(x || "").trim()).join(" | ");
    const drawProfile = (st) => {
      const box = root.querySelector("#profileBox");
      const mine = S.get("profileReqs", []).filter((r) => r["이름"] === st.name);
      const last = mine[mine.length - 1];
      box.innerHTML = `
        <h3>🪪 내 프로필 수정 요청</h3>
        <p class="muted">지도학생 카드와 프로필 팝업에 보이는 내용이에요. 고칠 부분만 바꿔서 보내면, 교수님이 확인한 뒤 홈페이지에 반영해요.</p>
        <form class="apply-form profile-form" novalidate>
          <div class="form-summary" role="alert" hidden></div>
          <div class="form-grid">
            <div class="field field--wide"><label class="field__label" for="pfPhoto">사진 (구글 드라이브 공유 주소)</label>
              <input id="pfPhoto" name="photo" inputmode="url" value="${esc(/drive\.google|docs\.google/.test(st.photo || "") ? st.photo : "")}" placeholder="https://drive.google.com/file/d/…/view" />
              <p class="field__hint">드라이브에 사진을 올리고 <b>공유 → 링크가 있는 모든 사용자</b>로 바꾼 뒤 주소를 붙여 넣어요. 얼굴이 잘 보이는 정사각형 사진이 좋아요.</p>
              <div class="pf-photo-preview" id="pfPreview" hidden></div>
              <p class="field__err"></p></div>
            <div class="field field--wide"><label class="field__label" for="pfKw">연구 분야 키워드 (쉼표로 구분)</label>
              <input id="pfKw" name="keywords" value="${esc((st.keywords || []).join(", "))}" placeholder="정치 커뮤니케이션, 뉴스 신뢰, 숙의" /><p class="field__err"></p></div>
            <div class="field field--wide"><label class="field__label" for="pfTopic">연구 주제</label>
              <input id="pfTopic" name="topic" value="${esc(st.topic || "")}" placeholder="한 줄로 소개해 주세요" /><p class="field__err"></p></div>
            <div class="field field--wide"><label class="field__label" for="pfThesis">학위논문 제목 (정해졌다면)</label>
              <input id="pfThesis" name="thesis" value="${esc(st.thesis || "")}" /><p class="field__err"></p></div>
            <div class="field field--wide"><label class="field__label" for="pfWorks">대표 연구 업적 (한 줄에 하나)</label>
              <textarea id="pfWorks" name="works" rows="4" placeholder="2025 | 학술지 | 논문 제목 | 학술지 이름 | 링크(선택)">${esc((st.works || []).map(workLine).join("\n"))}</textarea>
              <p class="field__hint">형식: <b>연도 | 종류 | 제목 | 학술지·학회 | 링크</b> — 종류는 학술지, 학회 발표, 수상, 프로젝트, 기타 중 하나예요. 교수님 논문 목록에 공동저자로 있는 논문은 따로 적지 않아도 자동으로 보여요.</p>
              <p class="field__err"></p></div>
            <div class="field field--wide"><label class="field__label" for="pfNote">교수님께 한마디 (선택)</label>
              <textarea id="pfNote" name="note" rows="2"></textarea><p class="field__err"></p></div>
          </div>
          <button class="btn btn--primary apply-form__submit" type="submit">수정 요청 보내기</button>
          <p class="report-dest">${window.SheetSync.ready() ? "📤 보내면 교수님의 구글 시트로 전달돼요." : "💾 지금은 구글 시트가 연결되지 않아 이 기기에만 저장돼요."}</p>
        </form>
        ${last ? `<p class="muted profile-last">마지막 요청: ${fmtTime(last["제출 시각"])} · 반영되기까지 며칠 걸릴 수 있어요.</p>` : ""}`;

      const form = box.querySelector("form");
      const preview = box.querySelector("#pfPreview");
      const showPreview = () => {
        const v = form.elements.photo.value.trim(), d = v && window.parseDrive ? window.parseDrive(v) : null;
        preview.hidden = !(d && d.thumb);
        preview.innerHTML = d && d.thumb ? `<img src="${esc(d.thumb)}" alt="사진 미리보기" referrerpolicy="no-referrer" onerror="this.parentElement.innerHTML='<small>미리보기를 불러오지 못했어요. 공유 설정이 &quot;링크가 있는 모든 사용자&quot;인지 확인해 주세요.</small>'" /><small>미리보기</small>` : "";
      };
      form.elements.photo.addEventListener("change", showPreview);
      showPreview();

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const v = (n) => form.elements[n].value.trim();
        const photo = v("photo");
        const errs = [];
        const setErr = (name, msg) => {
          const wrap = form.elements[name].closest(".field");
          wrap.classList.toggle("is-invalid", !!msg);
          wrap.querySelector(".field__err").textContent = msg;
          if (msg) errs.push({ name, msg });
        };
        setErr("photo", !photo || (window.parseDrive && window.parseDrive(photo)) ? "" : "구글 드라이브 공유 주소만 넣을 수 있어요.");
        const badLine = v("works").split("\n").map((l) => l.trim()).filter(Boolean).find((l) => l.split("|").length < 3);
        setErr("works", badLine ? `'${badLine.slice(0, 30)}' 줄의 형식을 확인해 주세요. (연도 | 종류 | 제목 | …)` : "");
        const sum = form.querySelector(".form-summary");
        if (errs.length) {
          sum.hidden = false;
          sum.innerHTML = `<strong>확인이 필요한 항목이 ${errs.length}개 있어요</strong><ul>${errs.map((x) => `<li>${esc(x.msg)}</li>`).join("")}</ul>`;
          form.elements[errs[0].name].focus();
          return;
        }
        sum.hidden = true;
        const data = {
          "이름": st.name, "과정": [st.program, st.major].filter(Boolean).join(" · "),
          "사진 주소": photo, "연구 분야 키워드": v("keywords"), "연구 주제": v("topic"), "학위논문 제목": v("thesis"),
          "대표 연구 업적": v("works"), "한마디": v("note"), "제출 시각": new Date().toISOString()
        };
        const all = S.get("profileReqs", []); all.push(data); S.set("profileReqs", all);
        const btn = form.querySelector("button[type=submit]"); btn.disabled = true; btn.textContent = "보내는 중…";
        const sent = await window.SheetSync.send("profile", data);
        window.toast(sent ? "수정 요청을 보냈어요. 교수님이 확인한 뒤 반영돼요! 📤" : "요청을 저장했어요. (구글 시트 미연결 — 이 기기에만 저장)");
        drawProfile(st);
      });
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
