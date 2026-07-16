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

  if (reduced) return;

  /* Comparsa delle voci d'archivio */
  const io2 = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (!e.isIntersecting) return;
      e.target.style.setProperty("--i", (i % 6).toString());
      e.target.classList.add("in-view");
      io2.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
  document.querySelectorAll(".entry, .rel__card").forEach((el) => {
    el.style.opacity = "0";
    io2.observe(el);
  });
})();
