/* HACK-PROJECT — grafo di rete animato per l'intestazione.
   Alternativa al video: ~2 KB invece di 142 MB, sempre nitido, loop infinito. */
(() => {
  "use strict";
  const c = document.getElementById("hero-canvas");
  if (!c) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const x = c.getContext("2d", { alpha: true });
  const OXIDE = "255,122,61", CYAN = "45,212,191", VIOLET = "167,139,250";
  let W, H, nodes = [], links = [], pulses = [], raf;

  const R = (a, b) => a + Math.random() * (b - a);

  function build() {
    const r = c.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    c.width = W * dpr; c.height = H * dpr;
    x.setTransform(dpr, 0, 0, dpr, 0, 0);

    const n = Math.round(Math.min(130, Math.max(52, (W * H) / 8200)));
    nodes = Array.from({ length: n }, () => ({
      x: R(0, W), y: R(0, H),
      vx: R(-0.09, 0.09), vy: R(-0.09, 0.09),
      r: R(1.6, 4.2),
      c: Math.random() > 0.86 ? VIOLET : (Math.random() > 0.5 ? OXIDE : CYAN),
      ph: R(0, 6.28),
    }));
    links = [];
    const D = Math.min(190, W / 7);
    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < n; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        if (dx * dx + dy * dy < D * D) links.push([i, j]);
      }
    pulses = Array.from({ length: Math.max(14, (links.length / 7) | 0) }, () => ({
      l: (Math.random() * links.length) | 0, t: Math.random(), s: R(0.0016, 0.005),
    }));
  }

  function frame(ts) {
    x.clearRect(0, 0, W, H);
    const t = ts / 1000;

    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    }

    const D = Math.min(190, W / 7);
    x.lineWidth = 1.05;
    for (const [i, j] of links) {
      const a = nodes[i], b = nodes[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const d = Math.hypot(dx, dy);
      if (d > D) continue;
      x.strokeStyle = "rgba(" + CYAN + "," + (0.72 * (1 - d / D)).toFixed(3) + ")";
      x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(b.x, b.y); x.stroke();
    }

    for (const p of pulses) {
      p.t += p.s;
      if (p.t > 1) { p.t = 0; p.l = (Math.random() * links.length) | 0; }
      const L = links[p.l]; if (!L) continue;
      const a = nodes[L[0]], b = nodes[L[1]];
      const px = a.x + (b.x - a.x) * p.t, py = a.y + (b.y - a.y) * p.t;
      const g = x.createRadialGradient(px, py, 0, px, py, 11);
      g.addColorStop(0, "rgba(" + OXIDE + ",.95)");
      g.addColorStop(1, "rgba(" + OXIDE + ",0)");
      x.fillStyle = g;
      x.beginPath(); x.arc(px, py, 11, 0, 6.284); x.fill();
    }

    for (const n of nodes) {
      const pulse = 0.55 + 0.45 * Math.sin(t * 1.1 + n.ph);
      x.fillStyle = "rgba(" + n.c + "," + (0.98 * pulse).toFixed(3) + ")";
      x.beginPath(); x.arc(n.x, n.y, n.r, 0, 6.284); x.fill();
      if (n.r > 2.4) {
        const g = x.createRadialGradient(n.x, n.y, 0, n.x, n.y, 18);
        g.addColorStop(0, "rgba(" + n.c + "," + (0.6 * pulse).toFixed(3) + ")");
        g.addColorStop(1, "rgba(" + n.c + ",0)");
        x.fillStyle = g;
        x.beginPath(); x.arc(n.x, n.y, 18, 0, 6.284); x.fill();
      }
    }
    raf = requestAnimationFrame(frame);
  }

  const io = new IntersectionObserver((e) => {
    if (e[0].isIntersecting) { if (!raf) raf = requestAnimationFrame(frame); }
    else { cancelAnimationFrame(raf); raf = 0; }
  });
  build(); io.observe(c);
  addEventListener("resize", () => { build(); }, { passive: true });
})();
