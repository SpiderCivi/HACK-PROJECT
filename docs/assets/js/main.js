/* HACK-PROJECT — interazioni minime, zero dipendenze */
(() => {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  /* Reveal on scroll per le voci d'archivio */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e, i) => {
        if (!e.isIntersecting) return;
        e.target.style.setProperty("--i", (i % 6).toString());
        e.target.classList.add("in-view");
        io.unobserve(e.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
  );

  document.querySelectorAll(".entry").forEach((el) => {
    el.style.opacity = "0";
    io.observe(el);
  });

  /* Ticker: orario locale live */
  const stamp = document.querySelector(".ticker span:nth-child(2)");
  if (stamp) {
    const tick = () => {
      const t = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      stamp.textContent = `Ora locale — ${t}`;
    };
    tick();
    setInterval(tick, 1000);
  }
})();
