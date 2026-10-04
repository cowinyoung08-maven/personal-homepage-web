/* 우수 과제 포트폴리오 — 핀터레스트식 카드 + 종류별 걸러 보기 + 자세히 보기 팝업
 * 자료는 구글 드라이브 주소(driveUrl)로만 등록합니다.
 * main.js가 window.renderPortfolio(요소, 설정)를 불러 화면을 그립니다. */
(function () {
  const esc = window.esc;

  /* ── 구글 드라이브 주소 해석 ──
   * 파일·구글 문서/슬라이드/시트·폴더 주소를 받아
   * 미리보기(iframe)·열기·썸네일 주소로 바꿔 줍니다. 구글 드라이브 주소가 아니면 null. */
  const DOC_KINDS = { document: "구글 문서", presentation: "구글 슬라이드", spreadsheets: "구글 시트", forms: "구글 설문지" };
  const parseDrive = (raw) => {
    if (!raw || !String(raw).trim()) return null;
    let u;
    try { u = new URL(String(raw).trim()); } catch (e) { return null; }
    if (u.protocol !== "https:") return null;
    const host = u.hostname, path = u.pathname;
    const thumb = (id) => `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w800`;
    if (host === "docs.google.com") {
      const m = path.match(/^\/(document|presentation|spreadsheets|forms)\/d\/([\w-]+)/);
      if (!m) return null;
      const [, type, id] = m;
      return { kind: "doc", label: DOC_KINDS[type], id, open: u.href,
        preview: `https://docs.google.com/${type}/d/${id}/${type === "forms" ? "viewform?embedded=true" : "preview"}`, thumb: thumb(id) };
    }
    if (host === "drive.google.com") {
      let m = path.match(/\/folders\/([\w-]+)/);
      if (m) return { kind: "folder", label: "드라이브 폴더", id: m[1], open: u.href,
        preview: `https://drive.google.com/embeddedfolderview?id=${m[1]}#grid`, thumb: "" };
      m = path.match(/\/file\/d\/([\w-]+)/);
      const id = m ? m[1] : u.searchParams.get("id");
      if (!id) return null;
      return { kind: "file", label: "드라이브 파일", id, open: `https://drive.google.com/file/d/${id}/view`,
        preview: `https://drive.google.com/file/d/${id}/preview`, thumb: thumb(id) };
    }
    return null;
  };
  window.parseDrive = parseDrive; // 관리자 화면에서 주소 확인에 사용

  window.renderPortfolio = function (root, C) {
    const P = C.portfolio || {};
    const works = P.works || [];
    if (!works.length) { root.innerHTML = `<p class="ad-empty">아직 등록된 우수 과제가 없어요.</p>`; return; }

    const types = [...new Set(works.map((w) => w.type).filter(Boolean))];
    let filter = "전체";
    // 미리보기 그림이 없을 때 카드 높이를 조금씩 달리해 핀터레스트 느낌을 냄
    const heights = [210, 160, 190, 230, 170, 200];

    root.innerHTML = `
      <div class="pf-filters" role="group" aria-label="과제 종류로 걸러 보기">
        ${["전체", ...types].map((t) => `
          <button class="ad-chip pf-chip" data-type="${esc(t)}" aria-pressed="${t === filter}">
            ${esc(t)} <small>${t === "전체" ? works.length : works.filter((w) => w.type === t).length}</small>
          </button>`).join("")}
      </div>
      <div class="masonry pf-grid" id="pfGrid"></div>
      ${P.note ? `<p class="pf-note">🔒 ${esc(P.note)}</p>` : ""}`;

    const grid = root.querySelector("#pfGrid");
    const cardHTML = (w, i) => {
      const d = parseDrive(w.driveUrl);
      return `
      <article class="pf-card">
        <button class="pf-card__btn" data-i="${i}" aria-label="${esc(w.title)} 자세히 보기">
          <div class="pf-thumb" style="height:${heights[i % heights.length]}px">
            <span class="pf-thumb__icon" aria-hidden="true">${esc(w.icon || "📄")}</span>
            ${d && d.thumb ? `<img src="${esc(d.thumb)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()" />` : ""}
            <span class="pf-badges">
              ${w.award ? `<span class="pf-award">🏆 ${esc(w.award)}</span>` : ""}
              ${w.sample ? `<span class="pf-sample">예시</span>` : ""}
            </span>
          </div>
          <div class="pf-body">
            <span class="pf-type">${esc(w.type)}${w.semester ? ` · ${esc(w.semester)}` : ""}</span>
            <h3>${esc(w.title)}</h3>
            <p>${esc(w.summary)}</p>
            ${(w.tags || []).length ? `<div class="pf-tags">${w.tags.map((t) => `<span>#${esc(t)}</span>`).join("")}</div>` : ""}
            <span class="pf-foot">
              <span class="pf-authors">${esc(w.authors)}</span>
              <span class="pf-drive ${d ? "" : "is-off"}">${d ? `📎 ${esc(d.label)}` : w.driveUrl ? "⚠️ 주소 확인 필요" : "자료 준비 중"}</span>
            </span>
          </div>
        </button>
      </article>`;
    };

    const draw = () => {
      grid.innerHTML = works
        .map((w, i) => ({ w, i }))
        .filter(({ w }) => filter === "전체" || w.type === filter)
        .map(({ w, i }) => cardHTML(w, i)).join("");
    };

    root.querySelector(".pf-filters").addEventListener("click", (e) => {
      const b = e.target.closest("[data-type]"); if (!b) return;
      filter = b.dataset.type;
      root.querySelectorAll("[data-type]").forEach((x) => x.setAttribute("aria-pressed", x === b));
      draw();
    });

    // ── 자세히 보기 팝업 (구글 드라이브 미리보기 포함) ──
    grid.addEventListener("click", (e) => {
      const b = e.target.closest("[data-i]"); if (!b) return;
      open(works[+b.dataset.i], b);
    });

    function open(w, from) {
      const d = parseDrive(w.driveUrl);
      const material = d
        ? `<div class="pf-frame"><iframe src="${esc(d.preview)}" title="${esc(w.title)} 자료 미리보기" loading="lazy" allow="autoplay; fullscreen" allowfullscreen></iframe></div>
           <div class="pf-links">
             <a class="btn btn--primary" href="${esc(d.open)}" target="_blank" rel="noopener">Google Drive에서 열기 ↗</a>
             <span class="muted">미리보기가 안 보이면 이 버튼으로 열어 주세요.</span>
           </div>`
        : w.driveUrl
          ? `<p class="pf-nolink pf-nolink--warn">⚠️ 등록된 주소가 구글 드라이브 주소가 아니라서 표시할 수 없어요.</p>`
          : `<p class="pf-nolink">📁 자료 준비 중이에요.</p>`;
      const m = document.createElement("div");
      m.className = "modal";
      m.innerHTML = `
        <div class="modal__backdrop" data-close></div>
        <div class="modal__box pf-modal" role="dialog" aria-modal="true" aria-labelledby="pfTitle" tabindex="-1">
          <button class="modal__x" data-close aria-label="닫기">✕</button>
          <div class="pf-modal__meta">
            <span class="pf-modal__icon" aria-hidden="true">${esc(w.icon || "📄")}</span>
            <span class="pf-type">${esc(w.type)}${w.semester ? ` · ${esc(w.semester)}` : ""}</span>
            ${w.award ? `<span class="pf-award">🏆 ${esc(w.award)}</span>` : ""}
            ${w.sample ? `<span class="pf-sample">예시</span>` : ""}
          </div>
          <h3 id="pfTitle">${esc(w.title)}</h3>
          <p class="pf-modal__authors">👥 ${esc(w.authors)}</p>
          <p class="pf-modal__text">${esc(w.detail || w.summary)}</p>
          ${(w.tags || []).length ? `<div class="pf-tags">${w.tags.map((t) => `<span>#${esc(t)}</span>`).join("")}</div>` : ""}
          ${material}
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
          const f = [...box.querySelectorAll("a, button, iframe")];
          if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
          else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
        }
      };
      document.addEventListener("keydown", onKey);
      m.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) close(); });
    }

    draw();
  };
})();
