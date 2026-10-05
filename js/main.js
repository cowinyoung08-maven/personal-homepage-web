/* config.js의 내용을 화면에 그려주는 스크립트 (개인 홈페이지) */
(function () {
  const C = window.SITE_CONFIG;
  const F = C.features || {};
  const $ = (sel) => document.querySelector(sel);
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const br = (s) => esc(s).replace(/\n/g, "<br />");
  const list = (arr, fn) => (arr || []).map(fn).join("");
  const head = (s) => `
    <header class="section__head reveal">
      <span class="eyebrow">${esc(s.eyebrow)}</span>
      <h2>${esc(s.title)}</h2>
      ${s.description ? `<p>${esc(s.description)}</p>` : ""}
    </header>`;

  // ── 장식 그림 (잎사귀 선 그림 · 반짝임 · 원형 도장) ──
  const LEAF = (cls) => `
    <svg class="${cls}" viewBox="0 0 120 230" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M58 226C57 170 60 100 72 8"/>
      <path d="M58 190C38 183 20 170 12 148C34 150 51 166 58 190Z"/><path d="M58 190L24 157"/>
      <path d="M59 158C80 150 97 136 106 114C84 118 66 134 59 158Z"/><path d="M59 158L96 124"/>
      <path d="M61 124C41 116 27 101 21 80C42 84 56 100 61 124Z"/><path d="M61 124L30 90"/>
      <path d="M64 92C82 84 95 69 99 50C80 54 68 70 64 92Z"/><path d="M64 92L92 60"/>
      <path d="M67 58C52 50 44 37 42 20C57 26 65 40 67 58Z"/><path d="M67 58L47 28"/>
    </svg>`;
  const SPARK = (cls) => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C12.8 8 16 11.2 24 12C16 12.8 12.8 16 12 24C11.2 16 8 12.8 0 12C8 11.2 11.2 8 12 0Z" fill="currentColor"/></svg>`;
  const STAMP = (text) => `
    <svg class="stamp" viewBox="0 0 160 160" aria-hidden="true">
      <defs><path id="stampPath" d="M80 80m-62 0a62 62 0 1 1 124 0a62 62 0 1 1 -124 0"/></defs>
      <circle cx="80" cy="80" r="44" fill="none" stroke="currentColor" stroke-width="1"/>
      <text><textPath href="#stampPath" textLength="385" lengthAdjust="spacing">${esc(text)}</textPath></text>
      <g transform="translate(66 50) scale(.26)" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round">
        <path d="M58 226C57 170 60 100 72 8"/><path d="M58 190C38 183 20 170 12 148C34 150 51 166 58 190Z"/>
        <path d="M59 158C80 150 97 136 106 114C84 118 66 134 59 158Z"/><path d="M61 124C41 116 27 101 21 80C42 84 56 100 61 124Z"/>
        <path d="M64 92C82 84 95 69 99 50C80 54 68 70 64 92Z"/><path d="M67 58C52 50 44 37 42 20C57 26 65 40 67 58Z"/>
      </g>
    </svg>`;
  const arrow = `<span class="arr" aria-hidden="true">→</span>`;

  // ── 기본 정보 ──
  document.title = C.site.title;
  $("#brand").innerHTML =
    `<span class="brand__mark">${LEAF("brand__leaf")}</span><span class="brand__text">${esc(C.site.shortTitle)}<small>${esc(C.site.university)} ${esc(C.site.department)}</small></span>`;

  // ── 메뉴 ──
  $("#nav").innerHTML = list(C.nav, (n) => `<a href="#${esc(n.id)}" data-id="${esc(n.id)}">${esc(n.label)}</a>`);

  // ── 첫 화면: 이름 + 직위 + 한 줄 소개 / 아치형 사진 ──
  const h = C.hero;
  $("#hero").innerHTML = `
    ${LEAF("deco-leaf deco-leaf--hero")}
    <div class="container home-hero">
      <div class="home-hero__text">
        <span class="hello">${esc(h.badge)}</span>
        <h1 class="home-hero__name">${esc(h.name)}<em>${esc(h.nameEn)}</em></h1>
        <p class="home-hero__pos">${esc(h.position)}</p>
        <p class="home-hero__tag">${br(h.tagline)}</p>
        ${(h.keywords || []).length ? `<ul class="home-hero__kw">${list(h.keywords, (k) => `<li>${esc(k)}</li>`)}</ul>` : ""}
        <div class="hero__buttons">
          ${list(h.buttons, (b) => b.style === "ghost"
            ? `<a class="text-link" href="${esc(b.href)}">${esc(b.label)} ${arrow}</a>`
            : `<a class="btn btn--${esc(b.style)}" href="${esc(b.href)}">${esc(b.label)} ${arrow}</a>`)}
        </div>
      </div>
      ${h.photo ? `
      <figure class="home-hero__photo">
        <span class="home-hero__disc" aria-hidden="true"></span>
        <svg class="home-hero__swirl" viewBox="0 0 300 200" aria-hidden="true"><path d="M2 150C60 40 150 20 170 80C185 125 120 150 110 105C98 52 190 8 298 30" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>
        ${LEAF("home-hero__leaf")}
        ${SPARK("spark spark--1")}${SPARK("spark spark--2")}
        <img src="${esc(h.photo)}" alt="${esc(h.name)} ${esc(h.nameEn)} 사진" onerror="this.parentElement.remove()" />
      </figure>` : ""}
    </div>`;

  // ── 영역별 HTML ──
  const A = C.about || {}, R = C.research || {}, P = C.publications || {}, T = C.teaching || {}, S = C.advisees || {};
  const groups = [...new Set((A.timeline || []).map((t) => t.group))];

  const aboutHTML = `
    <section class="section" id="about">
      ${LEAF("deco-leaf deco-leaf--about")}
      <div class="container">
        ${head(A)}
        <div class="about-card reveal">
          <div class="about-card__stamp">${STAMP("RESEARCH · TEACHING · MENTORING · ")}</div>
          <div class="about-card__text">
            <p>${br(A.text)}</p>
            <p class="about__sign">${esc(h.nameEn)}</p>
          </div>
        </div>
        <h3 class="sub-title sub-title--center reveal">${esc(A.timelineTitle || "약력")}</h3>
        <div class="tl-cols">
          ${groups.map((g) => `
            <div class="tl-group reveal">
              <h4>${esc(g)}</h4>
              <ol class="tl tl--noyear">${(A.timeline || []).filter((t) => t.group === g).map((t) => `
                <li><span class="tl__text">${t.year ? `<b class="tl__yr">${esc(t.year)}</b> ` : ""}${esc(t.text)}</span></li>`).join("")}</ol>
            </div>`).join("")}
        </div>
      </div>
    </section>`;

  const Sc = R.scholar;
  const researchHTML = `
    <section class="section section--tint" id="research">
      <div class="container">
        ${head(R)}
        ${R.statement ? `<blockquote class="statement reveal"><p>${br(R.statement)}</p></blockquote>` : ""}
      </div>
    </section>
    ${Sc && (Sc.stats || []).length ? `
    <section class="band" aria-label="Google Scholar 지표">
      <div class="container">
        <dl class="band__stats">${list(Sc.stats, (s) => `<div class="reveal"><dd>${esc(s.value)}</dd><dt>${esc(s.label)}</dt></div>`)}</dl>
        <p class="band__note">Google Scholar · ${esc(Sc.asOf)} 기준
          ${Sc.url ? ` · <a href="${esc(Sc.url)}" target="_blank" rel="noopener">프로필 보기 ↗</a>` : ""}</p>
      </div>
    </section>` : ""}
    <section class="section section--plain" id="research-topics">
      <div class="container">
        <header class="section__head section__head--sub reveal">
          <span class="eyebrow">Research Areas</span>
          <h2>${esc(R.topicsTitle || "주요 연구 주제")}</h2>
        </header>
        <div class="svc reveal">
          ${list(R.topics, (t, i) => `
            <article class="svc__item">
              <span class="svc__icon svc__icon--${i % 2 ? "clay" : "sage"}" aria-hidden="true"><i>${esc(t.icon)}</i></span>
              <h4>${esc(t.title)}</h4>
              <p>${esc(t.text)}</p>
            </article>`)}
        </div>
        ${(R.projects || []).length ? `
          <header class="section__head section__head--sub section__head--gap reveal">
            <span class="eyebrow">Projects</span>
            <h2>${esc(R.projectsTitle || "연구 프로젝트")}</h2>
          </header>
          <div class="projects">
            ${list(R.projects, (p, i) => `
              <article class="project reveal">
                <div class="project__top project__top--${i % 2 ? "clay" : "sage"}">
                  ${p.funder ? `<span class="project__funder">${esc(p.funder)}</span>` : ""}
                  ${p.status ? `<span class="chip ${/완료/.test(p.status) ? "chip--closed" : "chip--live"}">${esc(p.status)}</span>` : ""}
                </div>
                <div class="project__body">
                  <h4>${esc(p.title)}</h4>
                  <p class="project__meta">${[p.period, p.role].filter(Boolean).map(esc).join(" · ")}</p>
                  ${p.text ? `<p>${esc(p.text)}</p>` : ""}
                </div>
              </article>`)}
          </div>` : ""}
      </div>
    </section>`;

  const pubHTML = `
    <section class="section" id="publications">
      <div class="container">
        ${head(P)}
        <div class="pub-tools reveal">
          <div class="pub-filters" role="group" aria-label="종류로 걸러 보기" id="pubFilters"></div>
          <label class="pub-sort"><span class="sr-only">정렬</span>
            <select id="pubSort" aria-label="정렬"><option value="year">최신순</option><option value="cites">인용 많은 순</option></select></label>
          <label class="pub-search"><span aria-hidden="true">🔍</span>
            <input type="search" id="pubSearch" placeholder="제목·저자·학술지·연도로 찾기" aria-label="논문·저서 검색" /></label>
        </div>
        <p class="pub-count" id="pubCount" aria-live="polite"></p>
        <div class="pubs" id="pubList"></div>
      </div>
    </section>`;

  // ── 강의: 학기별 과목 카드 + 학생 우수 작품 ──
  const courseHTML = (c) => `
    <article class="course reveal">
      <span class="topic__icon">${esc(c.icon)}</span>
      <h4>${esc(c.title)}</h4>
      ${c.en ? `<p class="course__en">${esc(c.en)}</p>` : ""}
      ${c.level || c.schedule ? `<p class="course__meta">${[c.level, c.schedule].filter(Boolean).map(esc).join(" · ")}</p>` : ""}
      ${c.text ? `<p>${esc(c.text)}</p>` : ""}
      ${c.syllabus || c.site ? `<div class="course__links">
        ${c.syllabus ? `<a class="pill-btn" href="${esc(c.syllabus)}" target="_blank" rel="noopener">📄 강의계획서 ↗</a>` : ""}
        ${c.site ? `<a class="pill-btn pill-btn--solid" href="${esc(c.site)}" target="_blank" rel="noopener">🌐 ${esc(c.siteLabel || "강의 사이트")} ↗</a>` : ""}
      </div>` : ""}
    </article>`;
  const SH = C.showcase;
  const teachingHTML = `
    <section class="section section--tint" id="teaching">
      <div class="container">
        ${head(T)}
        ${list(T.semesters, (s) => `
          <div class="term">
            <h3 class="term__title reveal">${esc(s.term)}</h3>
            <div class="courses">${list(s.courses, courseHTML)}</div>
          </div>`)}
        ${F.showcase !== false && SH && (SH.works || []).length ? `
          <div class="showcase" id="showcase">
            <header class="section__head section__head--sub reveal">
              <span class="eyebrow">${esc(SH.eyebrow)}</span>
              <h2>${esc(SH.title)}</h2>
              ${SH.description ? `<p>${esc(SH.description)}</p>` : ""}
            </header>
            <div id="showcaseApp"></div>
          </div>` : ""}
      </div>
    </section>`;

  // ── 지도학생 + 연구실 (lab.js가 채움) ──
  const subHead = (o, id) => o ? `
    <header class="section__head section__head--sub reveal" ${id ? `id="${id}"` : ""}>
      <span class="eyebrow">${esc(o.eyebrow)}</span>
      <h2>${esc(o.title)}</h2>
      ${o.description ? `<p>${esc(o.description)}</p>` : ""}
    </header>` : "";
  // 연구실 소개 → 지도학생 소개 순서, 그다음 (색 바탕) 입학·지도 문의 · 자료실 · 학생 전용
  const studentsHTML = `
    <section class="section" id="students">
      <div class="container">
        ${C.lab ? `<div class="lab-part" id="lab">${head(C.lab)}` : ""}
        <nav class="lab-subnav reveal" aria-label="연구실 영역 바로가기">
          ${C.lab ? `<a href="#lab">연구실 소개</a>` : ""}
          <a href="#members">지도학생</a>
          ${C.consult ? `<a href="#consult">입학 · 지도 문의</a>` : ""}
          ${C.resources ? `<a href="#resources">자료실</a>` : ""}
          ${C.portal ? `<a href="#portal">🔒 학생 전용</a>` : ""}
        </nav>
        ${C.lab ? `<div id="labApp"></div></div>` : ""}
        <div class="lab-part" id="members">${C.lab ? subHead(S) : head(S)}<div id="membersApp"></div></div>
      </div>
    </section>
    ${C.consult || C.resources || C.portal ? `
    <section class="section section--tint" id="lab-area">
      <div class="container">
        ${C.consult ? `<div class="lab-part" id="consult">${subHead(C.consult)}<div id="consultApp"></div></div>` : ""}
        ${C.resources ? `<div class="lab-part" id="resources">${subHead(C.resources)}<div id="resourcesApp"></div></div>` : ""}
        ${C.portal ? `<div class="lab-part portal" id="portal">${subHead(C.portal)}<div id="portalApp"></div></div>` : ""}
      </div>
    </section>` : ""}`;

  // ── 강의 사이트에서 가져온 영역 (features로 켜고 끔) ──
  const noticesHTML = F.notices !== false && (C.notices || []).length ? `
    <div class="container notices">
      <h2 class="notices__title reveal">📢 공지사항</h2>
      ${[...C.notices].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || String(b.date).localeCompare(String(a.date)))
        .map((n) => `
        <details class="notice reveal ${n.pinned ? "is-pinned" : ""}">
          <summary>
            ${n.pinned ? `<span class="chip chip--task">중요</span>` : ""}
            <strong>${esc(n.title)}</strong>
            <time>${esc(n.date)}</time>
          </summary>
          <p>${br(n.text)}</p>
        </details>`).join("")}
    </div>` : "";

  const lectureHTML = [
    F.curriculum && C.curriculum ? `
    <section class="section section--tint" id="curriculum">
      <div class="container">${head(C.curriculum)}<div id="curriculumApp"></div></div>
    </section>` : "",
    F.guide && C.guide ? `
    <section class="section" id="guide">
      <div class="container">
        ${head(C.guide)}
        <h3 class="sub-title reveal">${esc(C.tools.title)}</h3>
        <div class="tools">${list(C.tools.items, (t) => `
          <article class="tool reveal"><span class="tool__icon">${esc(t.icon)}</span><div><h4>${esc(t.name)}</h4><p>${esc(t.text)}</p></div></article>`)}</div>
        <h3 class="sub-title reveal">${esc(C.prep.title)}</h3>
        <div class="masonry">${list(C.prep.items, (p, i) => `
          <article class="card card--${["m", "s", "s", "m"][i % 4]} reveal"><div class="card__icon">${esc(p.icon)}</div><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></article>`)}</div>
      </div>
    </section>` : "",
    F.portfolio && C.portfolio ? `
    <section class="section section--tint" id="portfolio">
      <div class="container">${head(C.portfolio)}<div id="portfolioApp"></div></div>
    </section>` : "",
    F.join && C.participate ? `
    <section class="section section--tint" id="join">
      <div class="container">${head(C.participate)}<div id="joinApp"></div></div>
    </section>` : "",
    F.faq && C.faq ? `
    <section class="section" id="faq">
      <div class="container container--narrow">
        ${head(C.faq)}
        <div class="faq">${list(C.faq.items, (f) => `
          <details class="faq__item reveal">
            <summary><span class="faq__q">Q</span><span>${esc(f.q)}</span><i aria-hidden="true"></i></summary>
            <p>${esc(f.a)}</p>
          </details>`)}</div>
      </div>
    </section>` : ""
  ].join("");

  $("#sections").innerHTML = noticesHTML + aboutHTML + researchHTML + pubHTML + teachingHTML + studentsHTML + lectureHTML;

  // 학생 우수 작품 — 강의 사이트의 포트폴리오 화면(portfolio.js)을 그대로 씀
  if (window.renderPortfolio && $("#showcaseApp")) window.renderPortfolio($("#showcaseApp"), { portfolio: C.showcase });
  if (window.renderLab) window.renderLab(C);
  if (window.renderPortal) window.renderPortal(C);
  if (F.curriculum && window.renderCurriculum && $("#curriculumApp")) window.renderCurriculum($("#curriculumApp"), C);
  if (F.portfolio && window.renderPortfolio && $("#portfolioApp")) window.renderPortfolio($("#portfolioApp"), C);
  if (F.join && window.renderParticipate && $("#joinApp")) window.renderParticipate($("#joinApp"), C);

  // ── 논문 · 저서: 연도별 목록 + 종류 걸러 보기 + 검색 ──
  (function publications() {
    const items = (P.items || []).map((it, i) => ({ ...it, i }));
    const types = (P.types && P.types.length ? P.types : [...new Set(items.map((x) => x.type).filter(Boolean))]);
    let type = "전체", q = "", sort = "year";
    // 저자 목록에서 교수님 이름을 굵게: 민영 / Y. Min / Young Min / Min, Y.
    const me = /민영|Y\.\s?Min|Young Min|Min,\s*Y(oung)?\.?/;
    const linkFor = (it) => [
      it.doi ? `<a href="https://doi.org/${esc(String(it.doi).replace(/^https?:\/\/(dx\.)?doi\.org\//, ""))}" target="_blank" rel="noopener">DOI ↗</a>` : "",
      it.kci ? `<a href="${esc(it.kci)}" target="_blank" rel="noopener">KCI ↗</a>` : "",
      it.url ? `<a href="${esc(it.url)}" target="_blank" rel="noopener">원문 ↗</a>` : "",
      it.scholar ? `<a href="${esc(it.scholar)}" target="_blank" rel="noopener">Scholar ↗</a>` : "",
      Number(it.cites) > 0 ? `<span class="pub__cites">인용 ${Number(it.cites).toLocaleString()}</span>` : ""
    ].join("");
    const authorsHTML = (a) => esc(a).replace(new RegExp(me.source, "g"), (m) => `<b>${m}</b>`);

    $("#pubFilters").innerHTML = ["전체", ...types].map((t) => `
      <button class="ad-chip" data-type="${esc(t)}" aria-pressed="${t === type}">${esc(t)}
        <small>${t === "전체" ? items.length : items.filter((x) => x.type === t).length}</small></button>`).join("");

    // 기본 화면은 최근 연구만 (config의 publications.recentFrom 이후), 그 이전은 Google Scholar로 안내
    // 검색할 때는 전체에서 찾고, 인용순은 상위 TOP_CITED편만 보여 줌. '여기서 모두 보기'를 누르면 전부 펼침
    const recentFrom = Number(P.recentFrom) || 0, TOP_CITED = 15;
    let showAll = false;
    const draw = () => {
      const qq = q.trim().toLowerCase();
      const matched = items
        .filter((x) => type === "전체" || x.type === type)
        .filter((x) => !qq || [x.title, x.authors, x.venue, x.year, x.detail].join(" ").toLowerCase().includes(qq))
        .sort((a, b) => sort === "cites"
          ? (Number(b.cites) || 0) - (Number(a.cites) || 0) || (Number(b.year) || 0) - (Number(a.year) || 0)
          : (Number(b.year) || 0) - (Number(a.year) || 0) || a.i - b.i);
      const limited = !qq && !showAll;
      const shown = !limited ? matched
        : sort === "cites" ? matched.slice(0, TOP_CITED)
        : recentFrom ? matched.filter((x) => Number(x.year) >= recentFrom) : matched;
      const hidden = matched.length - shown.length;
      $("#pubCount").textContent = !items.length ? ""
        : qq ? `검색 결과 ${matched.length}편`
        : hidden ? `전체 ${matched.length}편 중 ${sort === "cites" ? `인용 상위 ${shown.length}편` : `${recentFrom}년 이후 ${shown.length}편`}`
        : `${matched.length}편`;
      // 목록 아래 안내: 숨긴 연구 + Google Scholar + 여기서 모두 보기
      const more = () => {
        const box = document.createElement("div");
        box.className = "pub-older";
        box.innerHTML = hidden
          ? `<p>${sort === "cites" ? `인용 상위 ${TOP_CITED}편만 보여 드려요.` : `${recentFrom}년 이전 연구 ${hidden}편은 Google Scholar에서 볼 수 있어요.`}</p>
             <div class="pub-older__btns">
               ${P.scholarUrl ? `<a class="btn btn--primary" href="${esc(P.scholarUrl)}" target="_blank" rel="noopener">Google Scholar에서 전체 보기 ↗</a>` : ""}
               <button class="text-link" type="button" id="pubShowAll">여기서 모두 보기 <span class="arr" aria-hidden="true">↓</span></button>
             </div>`
          : `${showAll && !qq ? `<button class="text-link" type="button" id="pubShowRecent">최근 연구만 보기 <span class="arr" aria-hidden="true">↑</span></button>` : ""}
             ${P.scholarUrl ? `<a class="btn btn--ghost" href="${esc(P.scholarUrl)}" target="_blank" rel="noopener">Google Scholar 프로필 ↗</a>` : ""}`;
        $("#pubList").appendChild(box);
        const all = box.querySelector("#pubShowAll"), recent = box.querySelector("#pubShowRecent");
        if (all) all.addEventListener("click", () => { showAll = true; draw(); });
        if (recent) recent.addEventListener("click", () => { showAll = false; draw(); $("#publications").scrollIntoView({ behavior: "smooth" }); });
      };
      if (!shown.length) {
        $("#pubList").innerHTML = `<p class="ad-empty">${items.length ? "조건에 맞는 항목이 없어요." : "아직 등록된 논문·저서가 없어요."}</p>`;
        if (hidden) more();
        return;
      }
      const pubHTML = (x) => `
            <li class="pub">
              <span class="pub__type">${esc(x.type)}</span>
              <div class="pub__body">
                <p class="pub__authors">${authorsHTML(x.authors)}${sort === "cites" ? ` <span class="pub__yr">(${esc(x.year)})</span>` : ""}</p>
                <p class="pub__title">${esc(x.title)}</p>
                <p class="pub__venue"><i>${esc(x.venue)}</i>${x.detail ? `, ${esc(x.detail)}` : ""}</p>
                ${linkFor(x) ? `<p class="pub__links">${linkFor(x)}</p>` : ""}
              </div>
            </li>`;
      if (sort === "cites") { // 인용순: 연도 구분 없이 한 목록
        $("#pubList").innerHTML = `<div class="pub-year pub-year--flat"><h3>인용순</h3><ul>${shown.map(pubHTML).join("")}</ul></div>`;
        more();
        return;
      }
      // 연도별로 접기: 가장 최근 연도만 펼치고 나머지는 접어 둠 (검색 중에는 찾은 연도를 모두 펼침)
      const years = [...new Set(shown.map((x) => x.year))];
      $("#pubList").innerHTML = `
        <div class="pub-yearbar"><button class="pill-btn" type="button" id="pubToggleAll">모든 연도 펼치기</button></div>
        ${years.map((y, i) => {
          const rows = shown.filter((x) => x.year === y);
          return `
          <details class="pub-year pub-year--fold" ${i === 0 || qq ? "open" : ""}>
            <summary><h3>${esc(y || "연도 미상")}</h3><span class="pub-year__spacer"></span><i class="week__arrow" aria-hidden="true"></i></summary>
            <ul>${rows.map(pubHTML).join("")}</ul>
          </details>`;
        }).join("")}`;
      more();
      const folds = [...$("#pubList").querySelectorAll(".pub-year--fold")];
      const btn = $("#pubToggleAll");
      const sync = () => (btn.textContent = folds.every((d) => d.open) ? "모든 연도 접기" : "모든 연도 펼치기");
      btn.addEventListener("click", () => { const open = !folds.every((d) => d.open); folds.forEach((d) => (d.open = open)); sync(); });
      folds.forEach((d) => d.addEventListener("toggle", sync));
      sync();
    };
    $("#pubSort").addEventListener("change", (e) => { sort = e.target.value; draw(); });
    $("#pubFilters").addEventListener("click", (e) => {
      const b = e.target.closest("[data-type]"); if (!b) return;
      type = b.dataset.type;
      $("#pubFilters").querySelectorAll("[data-type]").forEach((x) => x.setAttribute("aria-pressed", x === b));
      draw();
    });
    $("#pubSearch").addEventListener("input", (e) => { q = e.target.value; draw(); });
    draw();
  })();

  // ── 푸터: 연락처 ──
  const Pr = C.professor;
  const initial = esc((Pr.name || "?").trim().charAt(0));
  const contactItem = (c) => c.href ? `<a href="${esc(c.href)}">${esc(c.value)}</a>` : `<span>${esc(c.value)}</span>`;
  $("#footer").innerHTML = `
    <section class="connect" id="contact">
      <span class="connect__blob" aria-hidden="true"></span>
      <div class="container connect__inner">
        <div class="prof__body reveal">
          <span class="eyebrow eyebrow--light">${esc(Pr.eyebrow)}</span>
          <h2>${esc(Pr.name)}</h2>
          <p class="prof__role">${esc(Pr.role)}</p>
          <p class="prof__bio">${br(Pr.bio)}</p>
        </div>
        <ul class="connect__list reveal">
          ${list(Pr.contacts, (c) => `
            <li><small>${esc(c.label)}</small>${contactItem(c)}</li>`)}
        </ul>
        <div class="connect__photo reveal">
          ${Pr.photo ? `<img src="${esc(Pr.photo)}" alt="${esc(Pr.name)} 사진" onerror="this.remove()" />` : ""}
          <span>${initial}</span>
        </div>
      </div>
    </section>
    <div class="foot">
      ${LEAF("deco-leaf deco-leaf--foot")}
      <div class="container foot__cols">
        <div class="foot__brand">
          <strong>${esc(C.site.shortTitle)}</strong>
          <small>${esc(C.site.university)} ${esc(C.site.department)}</small>
          <p>${br(h.tagline)}</p>
        </div>
        <nav class="foot__nav" aria-label="바로가기">
          <h4>바로가기</h4>
          ${list(C.nav, (n) => `<a href="#${esc(n.id)}">${esc(n.label)}</a>`)}
        </nav>
        <div class="foot__contact">
          <h4>연락처</h4>
          ${list(Pr.contacts, (c) => `<p>${contactItem(c)}</p>`)}
        </div>
      </div>
      <p class="foot__note">${esc(C.site.footerNote)}</p>
    </div>`;

  // ── 모바일 메뉴 ──
  const header = $(".header");
  const toggle = $("#menuToggle");
  const setMenu = (open) => {
    header.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open);
    toggle.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
  };
  toggle.addEventListener("click", () => setMenu(!header.classList.contains("is-open")));
  $("#nav").addEventListener("click", (e) => e.target.closest("a") && setMenu(false));

  // ── 스크롤: 헤더 그림자 + 맨 위로 버튼 ──
  const toTop = $("#toTop");
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 8);
    toTop.classList.toggle("is-visible", y > 400);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // ── 현재 위치 메뉴 강조 ──
  const links = [...document.querySelectorAll(".nav a")];
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) links.forEach((a) => a.classList.toggle("is-active", a.dataset.id === en.target.id));
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  C.nav.forEach((n) => { const el = document.getElementById(n.id); if (el) spy.observe(el); });

  // ── 스크롤 등장 효과 ──
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("is-in");
      io.unobserve(en.target);
    }),
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  // ── 꽃잎 장식 (features.petals가 true일 때만) ──
  if (F.petals && !reduce) {
    const box = $(".petals");
    for (let i = 0; i < 10; i++) {
      const p = document.createElement("i");
      p.style.left = Math.random() * 100 + "%";
      p.style.animationDuration = 14 + Math.random() * 14 + "s";
      p.style.animationDelay = -Math.random() * 20 + "s";
      p.style.setProperty("--s", 0.5 + Math.random() * 0.8);
      box.appendChild(p);
    }
  }
})();
