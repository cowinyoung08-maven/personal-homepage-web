/* 4단계: 지도학생 공간 (공개 부분)
 * - 지도학생 소개 (재학생 / 졸업생, 비공개 설정)
 * - 연구실 소개, 입학·지도 문의 + 면담 신청서, 자료실(구글 드라이브)
 * main.js가 window.renderLab(설정)을 부릅니다. */
(function () {
  const esc = window.esc;
  const S = window.Store;
  const list = (arr, fn) => (arr || []).map(fn).join("");
  const sampleChip = (on) => (on ? `<span class="pf-sample lab-sample">예시</span>` : "");

  window.renderLab = function (C) {
    members(document.getElementById("membersApp"), C.advisees, (C.publications || {}).items || []);
    labIntro(document.getElementById("labApp"), C.lab);
    consult(document.getElementById("consultApp"), C.consult);
    resources(document.getElementById("resourcesApp"), C.resources);
  };

  /* ── 지도학생 소개: 카드 + 프로필 팝업 ── */
  // 사진: "images/…" 경로 또는 구글 드라이브 공유 주소(미리보기 그림으로 바꿔 씀)
  const photoSrc = (p) => {
    if (!p || !String(p).trim()) return "";
    const d = window.parseDrive ? window.parseDrive(p) : null;
    return d ? (d.thumb || "") : String(p).trim();
  };
  const avatarHTML = (s, cls) => {
    const src = photoSrc(s.photo);
    return `<span class="${cls}" aria-hidden="true"><span>${esc((s.name || "?").charAt(0))}</span>${src
      ? `<img src="${esc(src)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()" />` : ""}</span>`;
  };

  function members(root, A, pubs) {
    if (!root || !A) return;
    const all = A.students || [];
    const shown = all.filter((s) => s.public !== false);
    const hiddenCount = (st) => all.filter((s) => s.public === false && s.status === st).length;
    const tabs = ["재학", "졸업"].filter((st) => all.some((s) => s.status === st));
    let tab = tabs[0] || "재학";
    const order = { 박사과정: 0, 박사: 0, 석사과정: 1, 석사: 1 };
    // 교수님 논문 목록에서 이 학생이 공동저자인 논문 찾기 (한글 이름 기준)
    const coauthored = (s) => pubs.filter((p) => String(p.authors || "").split(/\s*[·,]\s*/).includes(s.name));

    const draw = () => {
      const people = shown.filter((s) => s.status === tab)
        .sort((a, b) => (order[a.program] ?? 9) - (order[b.program] ?? 9));
      const hid = hiddenCount(tab);
      root.innerHTML = `
        ${tabs.length > 1 ? `<div class="pub-filters lab-tabs" role="tablist">${tabs.map((t) => `
          <button class="ad-chip" role="tab" data-st="${t}" aria-selected="${t === tab}" aria-pressed="${t === tab}">
            ${t === "재학" ? "재학생" : "졸업생"} <small>${all.filter((s) => s.status === t).length}</small></button>`).join("")}</div>` : ""}
        <div class="members">
          ${people.length ? people.map((s) => {
            const kw = (s.keywords || []).filter(Boolean);
            const n = (s.works || []).filter((w) => w.title).length + coauthored(s).length;
            return `
            <article class="member reveal is-in">
              <button class="member__btn" type="button" data-name="${esc(s.name)}" aria-label="${esc(s.name)} 프로필 보기">
                ${avatarHTML(s, "member__avatar")}
                <span class="member__body">
                  <span class="member__name">${esc(s.name)}</span>
                  <span class="member__meta">
                    <span class="chip ${/박사/.test(s.program) ? "chip--week" : "chip--task"}">${esc(s.program)}</span>
                    ${s.major ? `<span>${esc(s.major)}</span>` : ""}
                    ${s.year ? `<span>· ${esc(s.year)}</span>` : ""}
                  </span>
                  ${kw.length ? `<span class="member__kw">${kw.slice(0, 3).map((k) => `<span>#${esc(k)}</span>`).join("")}</span>` : ""}
                  <span class="member__more">프로필 보기${n ? ` · 업적 ${n}` : ""} →</span>
                </span>
              </button>
            </article>`;
          }).join("") : `<p class="ad-empty">등록된 ${tab === "재학" ? "재학생" : "졸업생"}이 없어요.</p>`}
        </div>
        ${hid ? `<p class="pf-note">🔒 이 밖에 비공개 ${hid}명</p>` : ""}`;
      root.querySelectorAll("[data-st]").forEach((b) => b.addEventListener("click", () => { tab = b.dataset.st; draw(); }));
      root.querySelectorAll("[data-name]").forEach((b) => b.addEventListener("click", () => {
        const s = shown.find((x) => x.name === b.dataset.name); if (s) openProfile(s, b);
      }));
    };

    // ── 프로필 팝업 ──
    function openProfile(s, from) {
      const kw = (s.keywords || []).filter(Boolean);
      const own = (s.works || []).filter((w) => w.title);
      const ownTitles = new Set(own.map((w) => w.title.replace(/\s/g, "")));
      const co = coauthored(s).filter((p) => !ownTitles.has(String(p.title).replace(/\s/g, "")))
        .map((p) => ({ year: p.year, type: "공동 연구", title: p.title, venue: [p.venue, p.detail].filter(Boolean).join(", "),
          link: p.doi ? `https://doi.org/${p.doi}` : p.url || p.kci || p.scholar || "", auto: true, authors: p.authors }));
      const works = [...own, ...co].sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0));
      const m = document.createElement("div");
      m.className = "modal";
      m.innerHTML = `
        <div class="modal__backdrop" data-close></div>
        <div class="modal__box profile" role="dialog" aria-modal="true" aria-labelledby="pfName" tabindex="-1">
          <button class="modal__x" data-close aria-label="닫기">✕</button>
          <div class="profile__head">
            ${avatarHTML(s, "profile__photo")}
            <div>
              <h3 id="pfName">${esc(s.name)}</h3>
              <p class="profile__meta">${esc([s.program, s.major, s.status === "졸업" ? s.year || "졸업" : s.year].filter(Boolean).join(" · "))}</p>
              ${kw.length ? `<ul class="profile__kw">${kw.map((k) => `<li>#${esc(k)}</li>`).join("")}</ul>` : ""}
            </div>
          </div>
          ${s.topic ? `<p class="profile__topic"><b>연구 주제</b>${esc(s.topic)}</p>` : ""}
          ${s.thesis ? `<p class="profile__topic"><b>학위논문</b>${esc(s.thesis)}</p>` : ""}
          <h4 class="profile__h">대표 연구 업적 <small>${works.length}건</small></h4>
          ${works.length ? `<ul class="profile__works">${works.map((w) => `
            <li>
              <span class="profile__year">${esc(w.year)}</span>
              <span class="profile__work">
                <span class="chip ${w.auto ? "chip--week" : "chip--task"}">${esc(w.type || "업적")}</span>
                <strong>${esc(w.title)}</strong>
                ${w.authors ? `<small>${esc(w.authors)}</small>` : ""}
                ${w.venue ? `<small><i>${esc(w.venue)}</i></small>` : ""}
                ${w.link ? `<a href="${esc(w.link)}" target="_blank" rel="noopener">자세히 보기 ↗</a>` : ""}
              </span>
            </li>`).join("")}</ul>
            ${co.length ? `<p class="profile__note">'공동 연구'는 교수님 논문 목록에서 자동으로 찾아 보여주는 항목이에요.</p>` : ""}`
            : `<p class="pf-nolink">아직 등록된 연구 업적이 없어요.</p>`}
        </div>`;
      document.body.appendChild(m);
      requestAnimationFrame(() => m.classList.add("is-open"));
      const box = m.querySelector(".modal__box");
      box.focus();
      const close = () => {
        m.classList.remove("is-open");
        document.removeEventListener("keydown", onKey);
        setTimeout(() => m.remove(), 250);
        if (from) from.focus({ preventScroll: true });
      };
      const onKey = (e) => {
        if (e.key === "Escape") close();
        if (e.key === "Tab") { // 포커스가 팝업 안에서만 돌도록
          const f = [...box.querySelectorAll("a, button")];
          if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
          else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
        }
      };
      document.addEventListener("keydown", onKey);
      m.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) close(); });
    }
    draw();
  }

  /* ── 연구실 소개 ── */
  function labIntro(root, L) {
    if (!root || !L) return;
    root.innerHTML = `
      <div class="lab-intro reveal">
        <p class="lab-intro__text">${sampleChip(L.sample)}${esc(L.intro)}</p>
        ${(L.topics || []).length ? `
          <h4>${esc(L.topicsTitle || "함께 다루는 주제")}</h4>
          <ul class="home-hero__kw lab-topics">${list(L.topics, (t) => `<li>${esc(t)}</li>`)}</ul>` : ""}
      </div>
      <div class="lab-cols">
        <div class="lab-box reveal">
          <h4>🧭 ${esc(L.mentoringTitle || "지도 방식")}</h4>
          <ol class="lab-list">${list(L.mentoring, (m) => `<li>${esc(m)}</li>`)}</ol>
        </div>
        <div class="lab-box reveal">
          <h4>📌 ${esc(L.rulesTitle || "연구실 규칙")}</h4>
          <ul class="lab-list lab-list--dot">${list(L.rules, (r) => `<li>${esc(r)}</li>`)}</ul>
        </div>
      </div>`;
  }

  /* ── 입학 · 지도 문의 + 면담 신청서 ── */
  function consult(root, K) {
    if (!root || !K) return;
    const F = K.form || { fields: [] };
    const fields = F.fields || [];
    root.innerHTML = `
      <div class="consult">
        <div class="consult__guide">
          ${list(K.guide, (g) => `
            <div class="guide-item reveal">
              <span class="topic__icon">${esc(g.icon)}</span>
              <div><h4>${esc(g.title)}</h4><p>${/@/.test(g.text) && !/\s/.test(g.text.trim())
                ? `<a href="mailto:${esc(g.text.trim())}">${esc(g.text)}</a>` : esc(g.text)}</p></div>
            </div>`)}
          ${K.sample ? `<p class="pf-note">${sampleChip(true)} 안내 문구는 예시입니다. 관리자 화면에서 고쳐 주세요.</p>` : ""}
        </div>
        <article class="panel panel--form reveal" id="consultForm">
          <div class="panel__head"><span class="panel__icon">📝</span>
            <div><h3>${esc(F.title)}</h3><p>${esc(F.description)}</p></div></div>
          <div id="consultBox"></div>
        </article>
      </div>`;
    const box = root.querySelector("#consultBox");

    const fieldHTML = (f) => {
      const id = `cs-${f.name}`, req = f.required ? `<em aria-hidden="true">*</em>` : "";
      const common = `id="${id}" name="${esc(f.name)}" aria-describedby="${id}-err" ${f.required ? 'aria-required="true"' : ""}`;
      if (f.type === "checkbox") return `<div class="field field--check" data-name="${esc(f.name)}">
          <label class="check"><input type="checkbox" ${common} /><span>${esc(f.label)} ${req}</span></label>
          <p class="field__err" id="${id}-err"></p></div>`;
      let control;
      if (f.type === "select") control = `<select ${common}><option value="">선택해 주세요</option>${list(f.options, (o) => `<option>${esc(o)}</option>`)}</select>`;
      else if (f.type === "radio") control = `<div class="choice-row" role="radiogroup" aria-labelledby="${id}-lb">${list(f.options, (o) =>
        `<label class="choice"><input type="radio" name="${esc(f.name)}" value="${esc(o)}" /><span>${esc(o)}</span></label>`)}</div>`;
      else if (f.type === "textarea") control = `<textarea ${common} rows="3" placeholder="${esc(f.placeholder)}"></textarea>`;
      else control = `<input type="${f.type === "email" ? "email" : f.type === "tel" ? "tel" : "text"}" ${common} placeholder="${esc(f.placeholder)}" />`;
      const wide = f.type === "textarea" || f.type === "radio" ? " field--wide" : "";
      return `<div class="field${wide}" data-name="${esc(f.name)}">
        <label class="field__label" id="${id}-lb" for="${id}">${esc(f.label)} ${req}</label>${control}
        <p class="field__err" id="${id}-err"></p></div>`;
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
      if (v && f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "이메일 형식이 올바르지 않아요. (예: name@example.com)";
      return "";
    };
    const check = (form, f) => {
      const msg = errorOf(form, f), wrap = form.querySelector(`.field[data-name="${f.name}"]`);
      wrap.classList.toggle("is-invalid", !!msg);
      wrap.querySelector(".field__err").textContent = msg;
      const ctrl = form.elements[f.name];
      if (ctrl && ctrl.setAttribute) ctrl.setAttribute("aria-invalid", msg ? "true" : "false");
      return msg;
    };
    const drawForm = () => {
      box.innerHTML = `
        <form class="apply-form" novalidate>
          <div class="form-summary" role="alert" hidden></div>
          <div class="form-grid">${fields.map(fieldHTML).join("")}</div>
          <button class="btn btn--primary apply-form__submit" type="submit">${esc(F.submitLabel || "보내기")}</button>
        </form>`;
      const form = box.querySelector("form");
      const recheck = (e) => { const w = e.target.closest(".field"); if (w && w.classList.contains("is-invalid")) check(form, fields.find((f) => f.name === w.dataset.name)); };
      form.addEventListener("input", recheck);
      form.addEventListener("change", recheck);
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const bad = fields.filter((f) => check(form, f));
        const sum = form.querySelector(".form-summary");
        if (bad.length) {
          sum.hidden = false;
          sum.innerHTML = `<strong>확인이 필요한 항목이 ${bad.length}개 있어요</strong>
            <ul>${bad.map((f) => `<li><a href="#cs-${esc(f.name)}" data-focus="${esc(f.name)}">${esc(f.type === "checkbox" ? "개인정보 동의" : f.label)}</a> — ${esc(errorOf(form, f))}</li>`).join("")}</ul>`;
          sum.querySelectorAll("[data-focus]").forEach((a) => a.addEventListener("click", (ev) => {
            ev.preventDefault();
            const el = form.querySelector(`[name="${a.dataset.focus}"]`); if (el) el.focus();
          }));
          sum.scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }
        const data = {};
        fields.forEach((f) => (data[f.name] = valueOf(form, f)));
        data.submittedAt = new Date().toISOString();
        const all = S.get("consults", []); all.push(data); S.set("consults", all);
        // 구글 시트가 연결돼 있으면 시트로도 보냄 (열 이름은 한글 항목명)
        const row = {};
        fields.forEach((f) => (row[f.type === "checkbox" ? "개인정보 동의" : f.label] = f.type === "checkbox" ? (data[f.name] ? "동의" : "") : data[f.name]));
        row["제출 시각"] = data.submittedAt;
        window.SheetSync.send("consult", row);
        box.innerHTML = `
          <div class="done">
            <div class="done__icon">🌿</div>
            <h4>${esc(F.successTitle)}</h4>
            <p>${esc(data.name)} 님 · ${esc(F.successText)}</p>
            <button class="pill-btn" type="button">다른 신청서 작성하기</button>
          </div>`;
        box.querySelector("button").addEventListener("click", drawForm);
        box.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    };
    drawForm();
  }

  /* ── 자료실 (구글 드라이브 주소만) ── */
  function resources(root, R) {
    if (!root || !R) return;
    const items = R.items || [];
    const cats = [...new Set(items.map((i) => i.category || "기타"))];
    root.innerHTML = `<div class="res-grid">${cats.map((c) => `
      <div class="res-cat reveal">
        <h4>${esc(c)}</h4>
        <ul>${items.filter((i) => (i.category || "기타") === c).map((i) => {
          const d = window.parseDrive ? window.parseDrive(i.driveUrl) : null;
          return `<li class="res-item">
            <span class="res-item__icon" aria-hidden="true">${esc(i.icon || "📄")}</span>
            <span class="res-item__text"><strong>${esc(i.title)}</strong>${i.note ? `<small>${esc(i.note)}</small>` : ""}${d ? `<small class="res-kind">${esc(d.label)}</small>` : ""}</span>
            ${d ? `<a class="pill-btn res-open" href="${esc(d.open)}" target="_blank" rel="noopener">열기 ↗</a>`
              : `<span class="res-wait">${i.driveUrl ? "⚠️ 주소 확인 필요" : "준비 중"}</span>`}
          </li>`;
        }).join("")}</ul>
      </div>`).join("")}</div>`;
  }
})();
