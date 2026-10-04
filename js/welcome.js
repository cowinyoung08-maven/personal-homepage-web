/* 4단계: 첫 방문 환영 폭죽 + 수강 신청 안내 팝업 */
(function () {
  const C = window.SITE_CONFIG, S = window.Store, esc = window.esc;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── 폭죽 (canvas) ── */
  const COLORS = ["#f59ab8", "#ec6f9b", "#ffd1e1", "#b496ef", "#8a64d6", "#e2d4fc", "#ffd27a"];
  window.Confetti = {
    burst({ count = 140 } = {}) {
      if (reduce) return;
      const cv = document.createElement("canvas");
      cv.className = "confetti";
      document.body.appendChild(cv);
      const ctx = cv.getContext("2d"), dpr = window.devicePixelRatio || 1;
      const W = innerWidth, H = innerHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.scale(dpr, dpr);
      const parts = [];
      // 왼쪽 아래·오른쪽 아래에서 위로 쏘아 올림
      [[0.08, -1], [0.92, 1]].forEach(([x, side]) => {
        for (let i = 0; i < count / 2; i++) {
          const deg = side < 0 ? -50 - Math.random() * 35 : -130 + Math.random() * 35;
          const ang = deg * Math.PI / 180, sp = 10 + Math.random() * 10;
          parts.push({
            x: W * x, y: H * 0.95, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
            r: 4 + Math.random() * 5, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3,
            c: COLORS[(Math.random() * COLORS.length) | 0], petal: Math.random() < 0.45
          });
        }
      });
      const start = performance.now();
      const frame = (t) => {
        const el = t - start;
        ctx.clearRect(0, 0, W, H);
        parts.forEach((p) => {
          p.vy += 0.28; p.vx *= 0.985; p.vy *= 0.985;
          p.x += p.vx; p.y += p.vy; p.rot += p.vr;
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          ctx.globalAlpha = Math.max(0, 1 - Math.max(0, el - 2200) / 800);
          ctx.fillStyle = p.c;
          if (p.petal) { ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * 0.6, 0, 0, Math.PI * 2); ctx.fill(); }
          else ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
          ctx.restore();
        });
        if (el < 3000) requestAnimationFrame(frame); else cv.remove();
      };
      requestAnimationFrame(frame);
    }
  };

  /* ── 첫 방문 환영 ── */
  if (!S.get("visited", false)) {
    S.set("visited", true);
    if (C.welcome && C.welcome.confetti) setTimeout(() => window.Confetti.burst(), 400);
    if (C.welcome && C.welcome.message) setTimeout(() => window.toast(C.welcome.message), 600);
  }

  /* ── 수강 신청 안내 팝업 ── */
  const P = C.popup;
  const realToday = (() => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; })();
  if (!P || !P.enabled || S.get("popupHide", "") === realToday) return;

  setTimeout(() => {
    if (document.querySelector(".admin, .modal")) return; // 관리자 화면이 열려 있으면 띄우지 않음
    const last = document.activeElement;
    const m = document.createElement("div");
    m.className = "modal";
    m.innerHTML = `
      <div class="modal__backdrop" data-close></div>
      <div class="modal__box" role="dialog" aria-modal="true" aria-labelledby="popTitle" tabindex="-1">
        <button class="modal__x" data-close aria-label="닫기">✕</button>
        <div class="modal__art" aria-hidden="true">🌸</div>
        <h3 id="popTitle">${esc(P.title)}</h3>
        <p>${esc(P.text)}</p>
        <ul class="modal__list">${(P.items || []).map((i) => `<li><span>${esc(i.icon)}</span>${esc(i.text)}</li>`).join("")}</ul>
        <a class="btn btn--primary modal__cta" href="${esc(P.button.href)}" data-close>${esc(P.button.label)}</a>
        <div class="modal__foot">
          <label class="check"><input type="checkbox" id="popHide" /><span>오늘 하루 보지 않기</span></label>
          <button class="pill-btn" data-close>닫기</button>
        </div>
      </div>`;
    document.body.appendChild(m);
    requestAnimationFrame(() => m.classList.add("is-open"));
    const boxEl = m.querySelector(".modal__box");
    boxEl.focus();

    const close = () => {
      if (m.querySelector("#popHide").checked) S.set("popupHide", realToday);
      m.classList.remove("is-open");
      document.removeEventListener("keydown", onKey);
      setTimeout(() => m.remove(), 250);
      if (last && last.focus) last.focus({ preventScroll: true });
    };
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") { // 포커스가 팝업 안에서만 돌도록
        const f = [...boxEl.querySelectorAll("a, button, input")];
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    m.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) close(); });
  }, (P.delaySeconds || 2) * 1000);
})();
