/* HACK-PROJECT — zero dipendenze */
(() => {
  "use strict";

  /* Ora locale nel ticker */
  const stamp = document.querySelector(".ticker span:nth-child(2)");
  if (stamp) {
    const lang = document.documentElement.lang === "en" ? "en-GB" : "it-IT";
    const label = document.documentElement.lang === "en" ? "Local time" : "Ora locale";
    const tick = () => {
      stamp.textContent = `${label} — ${new Date().toLocaleTimeString(lang, {
        hour: "2-digit", minute: "2-digit", second: "2-digit",
      })}`;
    };
    tick();
    setInterval(tick, 1000);
  }

  /* Copia link */
  document.querySelectorAll(".share__copy").forEach((b) => {
    b.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(b.dataset.url);
        const old = b.textContent;
        b.textContent = "✓";
        setTimeout(() => (b.textContent = old), 1400);
      } catch (e) { /* clipboard negata: non fare nulla di rumoroso */ }
    });
  });

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Avanzamento lettura */
  const bar = document.querySelector(".progress i");
  const art = document.querySelector(".prose");
  if (bar && art) {
    const update = () => {
      const r = art.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const done = Math.min(1, Math.max(0, -r.top / (total > 0 ? total : 1)));
      bar.style.width = (done * 100).toFixed(1) + "%";
    };
    update();
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update, { passive: true });
  }

  /* Voce dell'indice attiva */
  const links = [...document.querySelectorAll(".toc__list a")];
  if (links.length) {
    const heads = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((l) => l.classList.remove("is-active"));
        const i = heads.indexOf(e.target);
        if (i > -1) links[i].classList.add("is-active");
      });
    }, { rootMargin: "-15% 0px -70% 0px" });
    heads.forEach((h) => io.observe(h));
  }

})();

/* ============================================================
   HACK-PROJECT — layer animazioni + temi (vanilla, zero dipendenze)
   Innestato dalla skill sito-animato. Ogni modulo è isolato in try/catch:
   se uno fallisce, gli altri (e il contenuto) restano intatti.
   ============================================================ */
(() => {
  "use strict";
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const themeCbs = [];
  const onTheme = (fn) => { themeCbs.push(fn); };

  /* ---------- 1. Selettore temi ---------- */
  try {
    const THEMES = [
      { id: "dark",     name: "Notte",     sw: "linear-gradient(135deg,#0b0b0f 58%,#ff7a3d 58%)" },
      { id: "light",    name: "Giorno",    sw: "linear-gradient(135deg,#f6f3ec 58%,#d5491d 58%)" },
      { id: "terminal", name: "Terminale", sw: "linear-gradient(135deg,#05070a 58%,#5eead4 58%)" },
    ];
    const nav = document.querySelector(".masthead__nav");
    const host = document.querySelector(".masthead__inner") || nav;
    const cur = () => root.getAttribute("data-theme") || "dark";
    const setMeta = () => {
      const bg = getComputedStyle(root).getPropertyValue("--paper").trim() || "#0b0b0f";
      let m = document.querySelector('meta[name="theme-color"]');
      if (!m) { m = document.createElement("meta"); m.name = "theme-color"; document.head.appendChild(m); }
      m.setAttribute("content", bg);
    };
    if (nav) {
      const wrap = document.createElement("div");
      wrap.className = "themectl";
      const btn = document.createElement("button");
      btn.type = "button"; btn.className = "themectl__btn";
      btn.setAttribute("aria-haspopup", "true"); btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-label", "Tema del sito");
      btn.innerHTML = '<span class="dot" aria-hidden="true"></span><span class="themectl__lbl">TEMA</span>';
      const menu = document.createElement("div");
      menu.className = "themectl__menu"; menu.setAttribute("role", "menu");
      THEMES.forEach((th) => {
        const o = document.createElement("button");
        o.type = "button"; o.className = "themectl__opt"; o.setAttribute("role", "menuitemradio");
        o.dataset.theme = th.id;
        o.setAttribute("aria-checked", String(cur() === th.id));
        o.innerHTML = '<span class="themectl__sw" style="background:' + th.sw + '"></span>' + th.name;
        o.addEventListener("click", () => {
          root.setAttribute("data-theme", th.id);
          try { localStorage.setItem("hp-theme", th.id); } catch (e) {}
          menu.querySelectorAll(".themectl__opt").forEach((x) =>
            x.setAttribute("aria-checked", String(x.dataset.theme === th.id)));
          setMeta();
          themeCbs.forEach((f) => { try { f(); } catch (e) {} });
          close();
        });
        menu.appendChild(o);
      });
      wrap.appendChild(btn); wrap.appendChild(menu); host.appendChild(wrap);
      const close = () => { wrap.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); };
      const toggle = () => {
        const open = wrap.classList.toggle("open");
        btn.setAttribute("aria-expanded", String(open));
      };
      btn.addEventListener("click", (e) => { e.stopPropagation(); toggle(); });
      document.addEventListener("click", (e) => { if (!wrap.contains(e.target)) close(); });
      document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
      setMeta();
    }
  } catch (e) { /* temi non critici */ }

  if (reduce) return; /* niente movimento: il contenuto resta pienamente visibile */

  /* ---------- 2. Reveal allo scroll ---------- */
  try {
    const io = "IntersectionObserver" in window ? new IntersectionObserver((es, ob) => {
      es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); ob.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.01 }) : null;

    const watch = (el) => { if (io) io.observe(el); else el.classList.add("is-in"); };
    // server-side [data-reveal] (hero): li nasconde già il CSS, li osserviamo tutti
    document.querySelectorAll("[data-reveal]").forEach(watch);
    // auto-tag: blocchi di rilievo, solo se sotto la piega (niente flash sopra)
    const SEL = ".entry, .stats, .follow__inner, .field, .sources, .sevbar, .dossier-video, .hero-figure," +
                " .prose h2, .prose h3, .prose figure, .prose .flow, .prose .stat, .prose .timeline," +
                " .about__head, .textpage__head, .section-head, .toc";
    const vh = innerHeight;
    document.querySelectorAll(SEL).forEach((el) => {
      if (el.hasAttribute("data-reveal") || el.classList.contains("rv")) return;
      if (el.getBoundingClientRect().top < vh) return;   // già in vista: lascialo com'è
      el.classList.add("rv"); watch(el);
    });
    // stagger per gruppi di card
    document.querySelectorAll(".archive, .entries, .index__list, main").forEach((grp) => {
      [...grp.children].filter((c) => c.classList && c.classList.contains("entry"))
        .forEach((c, i) => c.style.setProperty("--i", (i % 6)));
    });
    // reti di sicurezza
    addEventListener("load", () => document.querySelectorAll("[data-reveal],.rv").forEach((el) => {
      if (el.getBoundingClientRect().top < innerHeight) el.classList.add("is-in");
    }));
    setTimeout(() => document.querySelectorAll("[data-reveal].is-in, .rv.is-in").length ||
      document.querySelectorAll("[data-reveal], .rv").forEach((el) => el.classList.add("is-in")), 3000);
  } catch (e) { document.querySelectorAll("[data-reveal], .rv").forEach((el) => el.classList.add("is-in")); }

  /* ---------- 3. Hero: griglia di punti ondulante (canvas) ---------- */
  try {
    document.querySelectorAll(".hero, .method-hero").forEach((hero) => {
      const fx = document.createElement("div"); fx.className = "hero__fx";
      const cv = document.createElement("canvas"); fx.appendChild(cv); hero.prepend(fx);
      const ctx = cv.getContext("2d");
      let W = 0, H = 0, dpr = 1, cols = 0, rows = 0, sp = 26, col = "255,122,61", al = 0.55, raf = 0, vis = true, t0 = performance.now();
      const readCol = () => { const cs = getComputedStyle(root);
        col = (cs.getPropertyValue("--fx-dot").trim() || "255,122,61");
        al = parseFloat(cs.getPropertyValue("--fx-alpha")) || 0.5; };
      const size = () => {
        const r = hero.getBoundingClientRect();
        W = Math.max(1, r.width); H = Math.max(1, r.height);
        dpr = Math.min(2, devicePixelRatio || 1);
        cv.width = W * dpr; cv.height = H * dpr;
        sp = W < 640 ? 30 : 26; cols = Math.ceil(W / sp) + 2; rows = Math.ceil(H / sp) + 2;
      };
      const mouse = { x: -1e4, y: -1e4 };
      if (fine) hero.addEventListener("mousemove", (e) => { const r = hero.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
      hero.addEventListener("mouseleave", () => { mouse.x = mouse.y = -1e4; });
      const draw = () => {
        raf = requestAnimationFrame(draw); if (!vis) return;
        const t = (performance.now() - t0) / 1000;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
        for (let gy = 0; gy < rows; gy++) for (let gx = 0; gx < cols; gx++) {
          const bx = gx * sp, by = gy * sp;
          const w = Math.sin(gx * 0.4 + t * 0.8) * Math.cos(gy * 0.35 + t * 0.6);
          const y = by + w * (sp * 0.42);
          let a = al * (0.35 + 0.4 * (w + 1) / 2), rad = 1.5;
          const dx = bx - mouse.x, dy = y - mouse.y, d2 = dx * dx + dy * dy;
          if (d2 < 16900) { const k = 1 - Math.sqrt(d2) / 130; a += k * 0.6; rad += k * 2.4; }
          ctx.beginPath(); ctx.fillStyle = "rgba(" + col + "," + Math.min(1, a).toFixed(3) + ")";
          ctx.arc(bx, y, rad, 0, 6.2832); ctx.fill();
        }
      };
      readCol(); size(); onTheme(readCol);
      addEventListener("resize", size, { passive: true });
      if ("IntersectionObserver" in window) new IntersectionObserver((es) => { vis = es[0].isIntersecting; })
        .observe(hero);
      draw();
    });
  } catch (e) {}

  /* ---------- 4. Cursore accento (solo desktop) ---------- */
  try {
    if (fine) {
      const ring = document.createElement("div"); ring.className = "cursor-ring"; document.body.appendChild(ring);
      root.classList.add("cursor-ready");
      let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
      addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
      addEventListener("mouseout", (e) => { if (!e.relatedTarget) root.classList.remove("cursor-ready"); });
      addEventListener("mouseover", () => root.classList.add("cursor-ready"));
      const hot = "a,button,.entry,.cta,[data-cursor],.themectl__opt,summary,label";
      addEventListener("pointerover", (e) => root.classList.toggle("cursor-hot", !!(e.target.closest && e.target.closest(hot))));
      (function loop() { rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
        ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0)"; requestAnimationFrame(loop); })();
    }
  } catch (e) {}

  /* ---------- 5. Magnetic sui CTA ---------- */
  try {
    if (fine) document.querySelectorAll(".cta").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        const cx = Math.max(-12, Math.min(12, dx * 0.3)), cy = Math.max(-12, Math.min(12, dy * 0.3));
        el.style.transition = "transform .08s linear"; el.style.transform = "translate(" + cx + "px," + cy + "px)";
      });
      el.addEventListener("mouseleave", () => { el.style.transition = "transform .35s cubic-bezier(.16,1,.3,1)"; el.style.transform = ""; });
    });
  } catch (e) {}

  /* ---------- 6. Masthead che si nasconde scrollando giù ---------- */
  try {
    const mh = document.querySelector(".masthead"); let last = scrollY, tick = false;
    if (mh) addEventListener("scroll", () => { if (tick) return; tick = true;
      requestAnimationFrame(() => { const y = scrollY;
        mh.classList.toggle("nav-hidden", y > 160 && y > last);
        last = y; tick = false; });
    }, { passive: true });
  } catch (e) {}

  /* ---------- 7. Scramble sui kicker (stile terminale) ---------- */
  try {
    const CH = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@_!/";
    const scramble = (el) => {
      const txt = el.textContent; if (!txt || txt.length > 42) return;
      let f = 0; const steps = Math.max(8, txt.length);
      const run = () => { let out = "";
        for (let i = 0; i < txt.length; i++) out += i < f ? txt[i] : (txt[i] === " " ? " " : CH[(Math.random() * CH.length) | 0]);
        el.textContent = out; f += 0.5;
        if (f < txt.length) requestAnimationFrame(run); else el.textContent = txt;
      }; run();
    };
    const ks = [...document.querySelectorAll(".kicker")];
    if (ks.length && "IntersectionObserver" in window) {
      const kio = new IntersectionObserver((es, ob) => es.forEach((en) => {
        if (en.isIntersecting) { scramble(en.target); ob.unobserve(en.target); }
      }), { threshold: 0.5 });
      ks.forEach((k) => kio.observe(k));
    }
  } catch (e) {}
})();

/* Numeri che si contano + barre che crescono (visibile dove prima era tutto fermo) */
(() => {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasIO = "IntersectionObserver" in window;
  try {
    const nums = [...document.querySelectorAll(".stats .stat__n")];
    const run = (el) => {
      const target = parseInt((el.textContent || "").replace(/\D/g, ""), 10);
      if (!isFinite(target)) return;
      if (reduce) { el.textContent = String(target); return; }
      const dur = 1100, t0 = performance.now(), ease = (x) => 1 - Math.pow(1 - x, 3);
      const step = (t) => { const p = Math.min(1, (t - t0) / dur);
        el.textContent = Math.round(ease(p) * target).toString();
        if (p < 1) requestAnimationFrame(step); else el.textContent = String(target); };
      requestAnimationFrame(step);
    };
    if (nums.length) {
      if (hasIO && !reduce) {
        nums.forEach((n) => { n.dataset.v = n.textContent; n.textContent = "0"; });
        const ob = new IntersectionObserver((es, o) => es.forEach((e) => {
          if (e.isIntersecting) { run(e.target); o.unobserve(e.target); } }), { threshold: .6 });
        nums.forEach((n) => ob.observe(n));
        setTimeout(() => nums.forEach((n) => { if (n.textContent === "0") n.textContent = n.dataset.v || "0"; }), 4000);
      } else nums.forEach(run);
    }
  } catch (e) {}
  try {
    const fills = [...document.querySelectorAll(".sevbar__fill")];
    if (fills.length) {
      fills.forEach((f) => { f.dataset.w = f.style.width || ""; });
      const grow = (f) => { if (f.dataset.w) f.style.width = f.dataset.w; };
      if (hasIO && !reduce) {
        fills.forEach((f) => { if (f.dataset.w) f.style.width = "0"; });
        const ob = new IntersectionObserver((es, o) => es.forEach((e) => {
          if (e.isIntersecting) { grow(e.target); o.unobserve(e.target); } }), { threshold: .4 });
        fills.forEach((f) => ob.observe(f));
        setTimeout(() => fills.forEach((f) => { if (f.style.width === "0px" || f.style.width === "0") grow(f); }), 4000);
      }
    }
  } catch (e) {}
})();

/* Redesign magazine: titolo cinetico, tilt 3D sulle card, parallax hero (vanilla, perf-first) */
(() => {
  "use strict";
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* Titolo hero cinetico: parole in reveal sfalsato */
  try {
    document.querySelectorAll(".hero__title").forEach((h) => {
      if (h.querySelector(".w")) return;
      const words = (h.textContent || "").trim().split(/\s+/);
      if (words.length < 2 || words.length > 24) return;
      h.innerHTML = words.map((w, i) => '<span class="w" style="--w:' + i + '">' + esc(w) + "</span>").join(" ");
      h.removeAttribute("data-reveal");
      requestAnimationFrame(() => requestAnimationFrame(() => h.classList.add("is-in")));
    });
  } catch (e) {}

  if (reduce) return;

  /* Tilt 3D sulle card (solo desktop) */
  try {
    if (fine) document.querySelectorAll(".entry").forEach((card) => {
      const media = card.querySelector(".entry__glow");
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        card.style.transition = "transform .2s cubic-bezier(.16,1,.3,1)";
        card.style.transform = "perspective(1000px) rotateX(" + (-py * 3.5).toFixed(2) + "deg) rotateY(" + (px * 4.5).toFixed(2) + "deg) translateY(-6px)";
        if (media) media.style.background = "radial-gradient(120% 90% at " + ((px + .5) * 100).toFixed(0) + "% 0%, rgba(var(--fx-dot),.2), transparent 60%)";
      });
      card.addEventListener("mouseleave", () => { card.style.transition = ""; card.style.transform = ""; if (media) media.style.background = ""; });
    });
  } catch (e) {}

  /* Parallax leggero sull'immagine hero */
  try {
    const artc = document.querySelector(".hero__art");
    if (artc) {
      let tick = false;
      addEventListener("scroll", () => { if (tick) return; tick = true;
        requestAnimationFrame(() => { const y = Math.min(scrollY, 800); artc.style.transform = "translateY(" + (y * 0.06).toFixed(1) + "px)"; tick = false; });
      }, { passive: true });
    }
  } catch (e) {}
})();
