/* =========================================================================
   MORIO — Orchestration
   The producer (MORIO) sits as the upper layer and orchestrates the three
   hands the work was traditionally split across. Connectors draw down from
   the hub; a baton-like pulse sweeps across them in rhythm; each hand lights
   and its scattered fragments lock into order.
   SVG connectors + DOM nodes. Plays its assembly once on scroll-in, then
   runs the orchestration sweep continuously. Reduced-motion → settled state.
   ========================================================================= */
(function () {
  "use strict";

  var root = document.getElementById("orchestra");
  if (!root) return;
  var svg = root.querySelector(".orc-svg");
  var hub = root.querySelector(".orc-hub");
  var players = [].slice.call(root.querySelectorAll(".orc-player"));
  if (!svg || !hub || !players.length) return;

  var SVGNS = "http://www.w3.org/2000/svg";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- build SVG layers ---- */
  var gLines = document.createElementNS(SVGNS, "g");
  var gPulse = document.createElementNS(SVGNS, "g");
  svg.appendChild(gLines);
  svg.appendChild(gPulse);

  var conns = [];   // { path, len, glow, pulse }
  players.forEach(function () {
    var glow = document.createElementNS(SVGNS, "path");
    glow.setAttribute("fill", "none");
    glow.setAttribute("stroke", "rgba(194,162,95,0.12)");
    glow.setAttribute("stroke-width", "5");
    glow.setAttribute("stroke-linecap", "round");
    var path = document.createElementNS(SVGNS, "path");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "rgba(194,162,95,0.55)");
    path.setAttribute("stroke-width", "1.4");
    path.setAttribute("stroke-linecap", "round");
    var pulse = document.createElementNS(SVGNS, "circle");
    pulse.setAttribute("r", "3.2");
    pulse.setAttribute("fill", "#d9be84");
    pulse.setAttribute("opacity", "0");
    gLines.appendChild(glow);
    gLines.appendChild(path);
    gPulse.appendChild(pulse);
    conns.push({ path: path, glow: glow, pulse: pulse, len: 0 });
  });

  /* ---- fragments per player ---- */
  var FRAG_N = 3;
  var fragData = players.map(function (pl) {
    var box = pl.querySelector(".frags");
    var arr = [];
    for (var i = 0; i < FRAG_N; i++) {
      var f = document.createElement("span");
      f.className = "frag";
      box.appendChild(f);
      arr.push({
        el: f,
        // scattered home (px offsets) + drift
        sx: (Math.random() * 2 - 1) * 46,
        sy: (Math.random() * 2 - 1) * 16 - 6,
        // ordered slot
         ox: (i - (FRAG_N - 1) / 2) * 16,
        oy: 8,
        ph: Math.random() * 6.28, fr: 0.6 + Math.random() * 0.7,
        amp: 4 + Math.random() * 5
      });
    }
    return arr;
  });

  /* ---- geometry ---- */
  var W = 0, H = 0;
  function center(el) {
    var r = el.getBoundingClientRect();
    var rr = root.getBoundingClientRect();
    return { x: r.left - rr.left + r.width / 2, y: r.top - rr.top + r.height / 2,
             top: r.top - rr.top, bottom: r.bottom - rr.top, w: r.width };
  }
  function layout() {
    var rr = root.getBoundingClientRect();
    W = rr.width; H = rr.height;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    var hc = center(hub);
    var hx = hc.x, hy = hc.bottom;       // emit from hub bottom-centre
    conns.forEach(function (c, i) {
      var pc = center(players[i]);
      var px = pc.x, py = pc.top;        // arrive at player top
      var midY = (hy + py) / 2;
      var d = "M " + hx + " " + hy +
              " C " + hx + " " + (midY) + " " + px + " " + (midY) + " " + px + " " + py;
      c.path.setAttribute("d", d);
      c.glow.setAttribute("d", d);
      c.len = c.path.getTotalLength();
      c.path.style.strokeDasharray = c.len;
      c.glow.style.strokeDasharray = c.len;
    });
  }

  /* ---- easing ---- */
  function clamp01(t) { return t < 0 ? 0 : t > 1 ? 1 : t; }
  function smooth(a, b, x) { var t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); }
  function fract(x) { return x - Math.floor(x); }

  /* ---- timeline ---- */
  var t0 = 0, started = false, raf = 0;
  var INTRO = 2600;        // ms for the one-time assembly
  var BEAT = 1700;         // ms per baton step
  var STAGGER = 0.18;      // fraction offset between hands (left→right sweep)

  function render(now) {
    var intro = started ? clamp01((now - t0) / INTRO) : 0;
    if (reduce) intro = 1;

    // hub presence
    var hubA = smooth(0.0, 0.28, intro);
    hub.style.opacity = (0.25 + 0.75 * hubA).toFixed(3);
    var hubGlow = reduce ? 0.5 : (0.35 + 0.25 * Math.sin(now / 1100));
    hub.style.boxShadow = "0 0 " + (26 * hubA).toFixed(1) + "px rgba(194,162,95," + (0.16 * hubA * (0.6 + hubGlow)).toFixed(3) + ")";
    hub.style.borderColor = "rgba(236,231,221," + (0.13 + 0.16 * hubA).toFixed(3) + ")";

    conns.forEach(function (c, i) {
      // connector draw-in, staggered
      var ls = 0.22 + i * 0.10, le = 0.55 + i * 0.10;
      var drawn = smooth(ls, le, intro);
      c.path.style.strokeDashoffset = (c.len * (1 - drawn)).toFixed(1);
      c.glow.style.strokeDashoffset = (c.len * (1 - drawn)).toFixed(1);

      // player lights up as its connector completes
      var pl = players[i];
      var lit = drawn;
      pl.style.opacity = (0.5 + 0.5 * lit).toFixed(3);
      if (lit > 0.85) pl.classList.add("lit"); else pl.classList.remove("lit");

      // baton pulse — continuous sweep once connectors are mostly drawn
      var beat = now / BEAT;
      var f = fract(beat - i * STAGGER);
      var live = reduce ? 0 : drawn;            // no travelling pulse in reduced motion
      if (c.len > 0 && live > 0.4) {
        var pt = c.path.getPointAtLength(c.len * f);
        c.pulse.setAttribute("cx", pt.x);
        c.pulse.setAttribute("cy", pt.y);
        // bright at launch, fades as it arrives
        var pa = (1 - f) * live;
        c.pulse.setAttribute("opacity", pa.toFixed(3));
        c.pulse.setAttribute("r", (2.4 + 1.6 * (1 - f)).toFixed(2));
        // connector brightens on the active beat
        var beatGlow = 0.4 + 0.5 * (1 - f);
        c.path.setAttribute("stroke", "rgba(194,162,95," + (0.32 + 0.4 * drawn * beatGlow).toFixed(3) + ")");
        c.glow.setAttribute("stroke", "rgba(194,162,95," + (0.10 * drawn * beatGlow).toFixed(3) + ")");
        // arrival kick on the player
        var arrive = smooth(0.82, 1.0, f) * live;
        pl.style.transform = "translateY(" + (-1.5 * arrive).toFixed(2) + "px)";
      } else {
        c.pulse.setAttribute("opacity", "0");
        c.path.setAttribute("stroke", "rgba(194,162,95," + (0.4 * drawn).toFixed(3) + ")");
      }

      // fragments: scatter → lock into order as the hand lights
      var ord = smooth(ls + 0.05, le + 0.05, intro);
      fragData[i].forEach(function (fr) {
        var driftX = Math.sin(now / 1000 * fr.fr + fr.ph) * fr.amp;
        var driftY = Math.cos(now / 1000 * fr.fr + fr.ph) * fr.amp * 0.5;
        var x = (fr.sx + driftX) + (fr.ox - (fr.sx + driftX)) * ord;
        var y = (fr.sy + driftY) + (fr.oy - (fr.sy + driftY)) * ord;
        fr.el.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
        fr.el.style.background = ord > 0.5 ? "var(--accent)" : "var(--muted)";
        fr.el.style.opacity = (0.4 + 0.5 * ord).toFixed(2);
      });
    });

    raf = requestAnimationFrame(render);
  }

  /* ---- boot ---- */
  function start() {
    if (started) return;
    started = true;
    t0 = performance.now();
  }
  layout();
  if (window.ResizeObserver) new ResizeObserver(layout).observe(root);
  window.addEventListener("resize", layout);

  function inView() {
    var r = root.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    return r.top < vh * 0.85 && r.bottom > vh * 0.15;
  }

  if (reduce) {
    // settled state, no loop churn — render a couple of frames then stop
    started = true; t0 = performance.now() - INTRO;
    requestAnimationFrame(function (n) { render(n); cancelAnimationFrame(raf); render(n); cancelAnimationFrame(raf); });
  } else {
    var onScroll = function () { if (inView()) { start(); window.removeEventListener("scroll", onScroll); } };
    window.addEventListener("scroll", onScroll, { passive: true });
    if (window.IntersectionObserver) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { start(); io.disconnect(); } });
      }, { threshold: 0.18 });
      io.observe(root);
    }
    // already on-screen at load, or no observer fired
    if (inView()) start();
    requestAnimationFrame(render);
  }

  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(layout).catch(function () {}); }
})();
