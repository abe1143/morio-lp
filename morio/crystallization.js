/* =========================================================================
   MORIO — Chaos → Crystal
   Real-estate produce, visualised: scattered value-variables are drawn
   together by one producing force and crystallise into a faceted form.
   Deterministic timeline (no physics sim) → resize-safe & scrubbable.
   ========================================================================= */
(function () {
  "use strict";

  var root = document.getElementById("crystalStage") || document.getElementById("stage");
  if (!root) return;
  var EMBED = root.id === "crystalStage";
  var cv = root.querySelector("canvas");
  var ctx = cv.getContext("2d");
  var W = 0, H = 0, DPR = 1, scale = 1, cx = 0, cy = 0;
  var visible = true, seenOnce = false;

  /* ---- crystal geometry (normalised, centred on 0,0; y down) ---- */
  // a quartz-like point: hexagonal prism + pyramidal termination
  var NODES = [
    [ 0.00, -1.18], // 0  apex
    [ 0.66, -0.50], // 1  upper-right shoulder
    [ 0.66,  0.55], // 2  lower-right
    [ 0.30,  1.14], // 3  base-right
    [ 0.00,  1.30], // 4  base point
    [-0.30,  1.14], // 5  base-left
    [-0.66,  0.55], // 6  lower-left
    [-0.66, -0.50], // 7  upper-left shoulder
    [ 0.00, -0.50], // 8  termination centre (M)
    [ 0.00,  0.55]  // 9  prism centre (N)
  ];
  var EDGES = [
    [0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,0], // silhouette
    [0,8],[7,8],[8,1],                               // top facets → M
    [8,9],                                           // central axis
    [2,9],[9,6],                                     // mid shoulder line
    [9,4],[3,9],[9,5]                                // base facets
  ];
  // facet polygons (for soft lit fills) + a relative brightness
  var FACETS = [
    { p:[0,8,7], b:0.55 },
    { p:[0,1,8], b:0.95 },
    { p:[7,8,9,6], b:0.34 },
    { p:[8,1,2,9], b:0.72 },
    { p:[6,9,5], b:0.22 },
    { p:[9,4,5], b:0.30 },
    { p:[9,2,3], b:0.50 },
    { p:[9,3,4], b:0.40 }
  ];
  // 7 value-variables pinned to outer vertices (apex = Time, the coefficient)
  var LABELS = [
    { n:0, jp:"時間",  en:"TIME",      side:"up"   },
    { n:1, jp:"権利",  en:"RIGHTS",    side:"right"},
    { n:2, jp:"素材",  en:"MATERIAL",  side:"right"},
    { n:3, jp:"運用",  en:"OPERATION", side:"right"},
    { n:5, jp:"収益",  en:"REVENUE",   side:"left" },
    { n:6, jp:"構造",  en:"STRUCTURE", side:"left" },
    { n:7, jp:"立地",  en:"LOCATION",  side:"left" }
  ];

  /* ---- particles ---- */
  var parts = [];
  var COUNT = 0;
  function rand(a, b) { return a + Math.random() * (b - a); }

  function lerpN(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }

  function buildParticles() {
    parts = [];
    // 1) the 7 labelled variable nodes
    LABELS.forEach(function (L, i) {
      parts.push(mkPart(NODES[L.n], 0, i));
    });
    // 2) reinforce every structural node with a small cluster
    NODES.forEach(function (nd) {
      for (var k = 0; k < 3; k++) {
        var t = [nd[0] + rand(-0.03, 0.03), nd[1] + rand(-0.03, 0.03)];
        parts.push(mkPart(t, 1, -1));
      }
    });
    // 3) trace each edge with points (gives the lattice body)
    EDGES.forEach(function (e) {
      var a = NODES[e[0]], b = NODES[e[1]];
      for (var k = 1; k <= 4; k++) {
        var t = lerpN(a, b, k / 5);
        parts.push(mkPart([t[0] + rand(-0.012, 0.012), t[1] + rand(-0.012, 0.012)], 2, -1));
      }
    });
    // 4) interior dust — sampled inside the silhouette
    var sil = [0,1,2,3,4,5,6,7];
    var tries = 0, got = 0;
    while (got < 46 && tries < 4000) {
      tries++;
      var px = rand(-0.62, 0.62), py = rand(-1.05, 1.18);
      if (pointInPoly(px, py, sil)) { parts.push(mkPart([px, py], 3, -1)); got++; }
    }
    COUNT = parts.length;
  }

  function mkPart(target, kind, label) {
    return {
      tx: target[0], ty: target[1],           // crystal target (normalised)
      hx: Math.random(), hy: Math.random(),   // chaos home (viewport fraction)
      ph: rand(0, Math.PI * 2), ph2: rand(0, Math.PI * 2),
      fx: rand(0.5, 1.3), fy: rand(0.5, 1.3), // drift frequencies
      amp: rand(0.012, 0.05),                 // drift amplitude (vw)
      s: rand(0.18, 0.30),                    // assemble start
      e: rand(0.52, 0.66),                    // assemble end
      r: kind === 0 ? 3.0 : (kind === 1 ? 2.3 : rand(1.1, 2.1)),
      kind: kind, label: label,
      tw: rand(0, Math.PI * 2)                // twinkle phase
    };
  }

  function pointInPoly(x, y, idx) {
    var inside = false, n = idx.length;
    for (var i = 0, j = n - 1; i < n; j = i++) {
      var a = NODES[idx[i]], b = NODES[idx[j]];
      var xi = a[0], yi = a[1], xj = b[0], yj = b[1];
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside;
    }
    return inside;
  }

  /* ---- easing ---- */
  function easeIO(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function clamp01(t) { return t < 0 ? 0 : t > 1 ? 1 : t; }
  function smooth(a, b, x) { var t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); }
  function win(p, a, b, c, d) { return smooth(a, b, p) * (1 - smooth(c, d, p)); }

  /* ---- layout ---- */
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    if (EMBED) { W = root.clientWidth; H = root.clientHeight; }
    else { W = window.innerWidth; H = window.innerHeight; }
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    cv.style.width = W + "px"; cv.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (EMBED) { scale = Math.min(H * 0.165, W * 0.21); cx = W / 2; cy = H * 0.40; root.classList.toggle("compact", H < 660); }
    else { scale = Math.min(H * 0.20, W * 0.25); cx = W / 2; cy = H * 0.45; }
  }
  function nodeScreen(n) { return [cx + NODES[n][0] * scale, cy + NODES[n][1] * scale]; }
  function targScreen(p) { return [cx + p.tx * scale, cy + p.ty * scale]; }

  /* ---- timeline ---- */
  var DUR = 16;                 // seconds per loop
  var SPEEDS = [0.5, 1, 1.5];
  var si = EMBED ? 0 : 1;                 // embedded section plays at 0.5× by default
  var clock = 0, playing = true, speed = SPEEDS[si], last = 0, scrub = false;
  var KEY = "morio-crystal-t";
  if (!EMBED) { try { var sv = parseFloat(localStorage.getItem(KEY)); if (sv >= 0 && sv < DUR) clock = sv; } catch (e) {} }

  // phase blend over loop p∈[0,1): chaos→produce→crystallize→hold→dissolve
  function dissolveF(p) { return smooth(0.90, 1.0, p); }

  function partBlend(pt, p) {
    var g = easeIO(clamp01((p - pt.s) / (pt.e - pt.s)));
    return g * (1 - dissolveF(p));
  }

  /* crystal structural alpha (lines/facets/labels) */
  function crystalA(p) {
    var build = smooth(0.46, 0.66, p);     // ridges draw in
    return build * (1 - dissolveF(p));
  }

  /* ---- DOM refs ---- */
  var capEls = [].slice.call(root.querySelectorAll(".cap"));
  var resolveEl = root.querySelector("#resolve");
  var fillEl = root.querySelector("#fill");
  var knobEl = root.querySelector("#knob");
  var phaseEl = root.querySelector("#phaseName");
  var playBtn = root.querySelector("#playBtn");

  var PHASES = [
    { a: 0.00, n: "Entropy" },
    { a: 0.18, n: "Convergence" },
    { a: 0.46, n: "Crystallization" },
    { a: 0.68, n: "Order" },
    { a: 0.90, n: "Dissolve" }
  ];
  function phaseName(p) { var nm = PHASES[0].n; for (var i = 0; i < PHASES.length; i++) if (p >= PHASES[i].a) nm = PHASES[i].n; return nm; }

  var ICON_PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
  var ICON_PAUSE = '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';
  function setPlayIcon() { playBtn.innerHTML = playing ? ICON_PAUSE : ICON_PLAY; }

  /* ---- render ---- */
  function draw(p) {
    ctx.clearRect(0, 0, W, H);

    var cA = crystalA(p);
    var radiance = win(p, 0.62, 0.74, 0.90, 0.99);   // glow peak in hold
    var produceF = win(p, 0.18, 0.40, 0.66, 0.82);   // central pull intensity

    // ---- central produce-glow (the gathering force) ----
    var glowR = scale * (1.5 + radiance * 0.5);
    var gGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
    var ga = 0.05 * produceF + 0.16 * radiance;
    gGlow.addColorStop(0, "rgba(194,162,95," + ga.toFixed(3) + ")");
    gGlow.addColorStop(0.5, "rgba(194,162,95," + (ga * 0.4).toFixed(3) + ")");
    gGlow.addColorStop(1, "rgba(194,162,95,0)");
    ctx.fillStyle = gGlow;
    ctx.fillRect(cx - glowR, cy - glowR, glowR * 2, glowR * 2);

    // ---- facet fills (cut-gem lighting: a slow-rotating light glints each facet) ----
    if (cA > 0.001) {
      var la = clock * 0.5;
      var ldx = Math.cos(la), ldy = Math.sin(la);
      FACETS.forEach(function (f) {
        var ccx = 0, ccy = 0;
        ctx.beginPath();
        f.p.forEach(function (ni, k) {
          var s = nodeScreen(ni); ccx += s[0]; ccy += s[1];
          if (k === 0) ctx.moveTo(s[0], s[1]); else ctx.lineTo(s[0], s[1]);
        });
        ctx.closePath();
        ccx /= f.p.length; ccy /= f.p.length;
        // pseudo-normal = outward direction from crystal centre
        var nx = ccx - cx, ny = ccy - cy, nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
        var spec = Math.max(0, nx * ldx + ny * ldy); spec = Math.pow(spec, 2.4);
        var base = 0.045 + f.b * 0.14;
        var aa = cA * (base + spec * 0.5 * (0.45 + radiance)) * (0.72 + radiance * 0.55);
        var g = ctx.createLinearGradient(ccx, cy - scale * 1.25, ccx, cy + scale * 1.35);
        g.addColorStop(0, "rgba(235,224,196," + aa.toFixed(3) + ")");
        g.addColorStop(0.5, "rgba(217,190,132," + (aa * 0.82).toFixed(3) + ")");
        g.addColorStop(1, "rgba(163,129,68," + (aa * 0.32).toFixed(3) + ")");
        ctx.fillStyle = g; ctx.fill();
        // specular hotspot, clipped to the facet
        if (spec > 0.5 && radiance > 0.04) {
          ctx.save(); ctx.clip();
          var hr = scale * 0.55;
          var hg = ctx.createRadialGradient(ccx, ccy, 0, ccx, ccy, hr);
          var ha = (spec - 0.5) * 0.55 * radiance;
          hg.addColorStop(0, "rgba(255,249,232," + ha.toFixed(3) + ")");
          hg.addColorStop(1, "rgba(255,249,232,0)");
          ctx.fillStyle = hg; ctx.fillRect(ccx - hr, ccy - hr, hr * 2, hr * 2);
          ctx.restore();
        }
      });
    }

    // ---- struts / ridges ----
    if (cA > 0.001) {
      ctx.lineJoin = "round"; ctx.lineCap = "round";
      EDGES.forEach(function (e) {
        var a = nodeScreen(e[0]), b = nodeScreen(e[1]);
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
        ctx.strokeStyle = "rgba(222,196,140," + (cA * (0.5 + radiance * 0.5)).toFixed(3) + ")";
        ctx.lineWidth = 1 + radiance * 0.9;
        ctx.stroke();
      });
      // brilliance pass — every ridge gets a white-gold glow at full crystal
      if (radiance > 0.01) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.shadowColor = "rgba(212,178,108," + (0.7 * radiance).toFixed(3) + ")";
        ctx.shadowBlur = 16 * radiance;
        EDGES.forEach(function (e) {
          var a = nodeScreen(e[0]), b = nodeScreen(e[1]);
          ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
          ctx.strokeStyle = "rgba(255,248,231," + (0.3 * radiance).toFixed(3) + ")";
          ctx.lineWidth = 1; ctx.stroke();
        });
        ctx.restore();
      }
    }

    // ---- vertex brilliance (sparkles on the seven variables) ----
    if (radiance > 0.02) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      LABELS.forEach(function (L) {
        var s = nodeScreen(L.n);
        var tw = 0.45 + 0.55 * Math.sin(clock * 3.1 + L.n * 1.7);
        var sr = scale * (0.10 + 0.05 * tw) * radiance;
        var rg = ctx.createRadialGradient(s[0], s[1], 0, s[0], s[1], sr);
        rg.addColorStop(0, "rgba(255,250,236," + (0.85 * radiance).toFixed(3) + ")");
        rg.addColorStop(0.42, "rgba(217,190,132," + (0.32 * radiance).toFixed(3) + ")");
        rg.addColorStop(1, "rgba(217,190,132,0)");
        ctx.fillStyle = rg; ctx.fillRect(s[0] - sr, s[1] - sr, sr * 2, sr * 2);
        var arm = sr * (1.6 + 0.6 * tw);
        ctx.strokeStyle = "rgba(255,250,236," + (0.55 * radiance * tw).toFixed(3) + ")";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(s[0] - arm, s[1]); ctx.lineTo(s[0] + arm, s[1]);
        ctx.moveTo(s[0], s[1] - arm); ctx.lineTo(s[0], s[1] + arm);
        ctx.stroke();
      });
      ctx.restore();
    }

    // ---- particles ----
    var tNow = clock;
    for (var i = 0; i < COUNT; i++) {
      var pt = parts[i];
      var bl = partBlend(pt, p);
      // chaos position (viewport-spread + drift)
      var driftX = Math.sin(tNow * pt.fx + pt.ph) * pt.amp * W;
      var driftY = Math.cos(tNow * pt.fy + pt.ph2) * pt.amp * W;
      var chx = (0.08 + pt.hx * 0.84) * W + driftX;
      var chy = (0.10 + pt.hy * 0.80) * H + driftY;
      var tg = targScreen(pt);
      var x = chx + (tg[0] - chx) * bl;
      var y = chy + (tg[1] - chy) * bl;

      // colour: dust → gold as it assembles
      var tw = 0.6 + 0.4 * Math.sin(tNow * 2.2 + pt.tw);
      var rr = pt.r * (0.85 + 0.3 * bl) * tw;
      var goldA = bl;
      // dim grey when scattered, warm gold when crystallised
      var cr = Math.round(150 + 70 * goldA);
      var cg = Math.round(144 + 30 * goldA);
      var cb = Math.round(130 - 35 * goldA);
      var alpha = (0.28 + 0.55 * bl) * (0.5 + 0.5 * tw);
      if (pt.kind === 0) alpha = Math.min(1, alpha + 0.25);
      // condense: interior dust recedes at full crystal so the gem reads solid
      if (pt.kind === 3) { rr *= (1 - 0.55 * radiance); alpha *= (1 - 0.5 * radiance); }

      if (bl > 0.55 && pt.kind <= 1) {
        ctx.save();
        ctx.shadowColor = "rgba(194,162,95," + (0.6 * bl).toFixed(3) + ")";
        ctx.shadowBlur = 8 * bl;
        ctx.beginPath(); ctx.arc(x, y, rr, 0, 6.2832);
        ctx.fillStyle = "rgba(" + cr + "," + cg + "," + cb + "," + alpha.toFixed(3) + ")";
        ctx.fill(); ctx.restore();
      } else {
        ctx.beginPath(); ctx.arc(x, y, rr, 0, 6.2832);
        ctx.fillStyle = "rgba(" + cr + "," + cg + "," + cb + "," + alpha.toFixed(3) + ")";
        ctx.fill();
      }
      pt._x = x; pt._y = y; pt._bl = bl;
    }

    // ---- variable labels (fade with crystal) ----
    var labA = smooth(0.52, 0.70, p) * (1 - dissolveF(p));
    if (labA > 0.001) {
      ctx.textBaseline = "middle";
      LABELS.forEach(function (L) {
        var s = nodeScreen(L.n);
        var ox = 0, oy = 0, align = "center";
        var off = scale * 0.18 + 14;
        if (L.side === "left") { ox = -off; align = "right"; }
        else if (L.side === "right") { ox = off; align = "left"; }
        else if (L.side === "up") { oy = -off * 0.95; align = "center"; }
        else { oy = off * 0.95; align = "center"; }
        ctx.textAlign = align;
        var lx = s[0] + ox, ly = s[1] + oy;
        // tick
        ctx.strokeStyle = "rgba(194,162,95," + (labA * 0.5).toFixed(3) + ")";
        ctx.lineWidth = 1; ctx.beginPath();
        if (L.side === "left") { ctx.moveTo(s[0] - 6, s[1]); ctx.lineTo(lx + 6, ly); }
        else if (L.side === "right") { ctx.moveTo(s[0] + 6, s[1]); ctx.lineTo(lx - 6, ly); }
        else if (L.side === "up") { ctx.moveTo(s[0], s[1] - 6); ctx.lineTo(lx, ly + 8); }
        else { ctx.moveTo(s[0], s[1] + 6); ctx.lineTo(lx, ly - 8); }
        ctx.stroke();
        // jp
        ctx.fillStyle = "rgba(236,231,221," + labA.toFixed(3) + ")";
        ctx.font = "300 " + Math.max(13, scale * 0.085).toFixed(0) + "px 'Noto Serif JP', serif";
        var jy = L.side === "down" ? ly + 1 : ly - (L.side === "up" ? 7 : 7);
        ctx.fillText(L.jp, lx, L.side === "up" || L.side === "down" ? (L.side === "up" ? ly - 8 : ly + 8) : ly - 7);
        // en
        ctx.fillStyle = "rgba(194,162,95," + (labA * 0.85).toFixed(3) + ")";
        ctx.font = "400 " + Math.max(8, scale * 0.034).toFixed(0) + "px 'Jost', sans-serif";
        var ey = (L.side === "up") ? ly + 10 : (L.side === "down" ? ly + 26 : ly + 11);
        // letter-spaced en
        drawTracked(ctx, L.en, lx, ey, align, 2.2);
      });
    }

    // ---- DOM overlays ----
    for (var c = 0; c < capEls.length; c++) {
      var o = 0;
      if (c === 0) o = win(p, 0.015, 0.07, 0.17, 0.24);
      else if (c === 1) o = win(p, 0.22, 0.30, 0.43, 0.50);
      else if (c === 2) o = win(p, 0.49, 0.56, 0.64, 0.70);
      else o = win(p, 0.71, 0.78, 0.90, 0.96);
      capEls[c].style.opacity = o.toFixed(3);
      capEls[c].style.transform = "translate(-50%," + ((1 - o) * 10).toFixed(1) + "px)";
    }
    resolveEl.style.opacity = (win(p, 0.66, 0.76, 0.90, 0.97)).toFixed(3);

    // progress UI
    fillEl.style.width = (p * 100).toFixed(2) + "%";
    knobEl.style.left = (p * 100).toFixed(2) + "%";
    phaseEl.textContent = phaseName(p);
  }

  function drawTracked(ctx, str, x, y, align, ls) {
    // crude letter-spacing for canvas
    var widths = [], total = 0, i;
    for (i = 0; i < str.length; i++) { var w = ctx.measureText(str[i]).width; widths.push(w); total += w + ls; }
    total -= ls;
    var sx = align === "center" ? x - total / 2 : align === "right" ? x - total : x;
    var prevAlign = ctx.textAlign; ctx.textAlign = "left";
    for (i = 0; i < str.length; i++) { ctx.fillText(str[i], sx, y); sx += widths[i] + ls; }
    ctx.textAlign = prevAlign;
  }

  /* ---- loop ---- */
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function frame(ts) {
    if (!last) last = ts;
    var dt = (ts - last) / 1000; last = ts;
    if (dt > 0.1) dt = 0.1;
    if (playing && !scrub && !reduce && (!EMBED || visible)) {
      clock += dt * speed;
      if (clock >= DUR) clock -= DUR;
    }
    var p = (clock % DUR) / DUR;
    draw(p);
    if (!EMBED && Math.random() < 0.02) { try { localStorage.setItem(KEY, clock.toFixed(2)); } catch (e) {} }
    requestAnimationFrame(frame);
  }

  /* ---- controls ---- */
  var replayBtn = document.getElementById("replayBtn");
  var speedBtn = document.getElementById("speedBtn");
  var speedLab = document.getElementById("speedLab");
  var track = document.getElementById("track");

  playBtn.addEventListener("click", function () { playing = !playing; setPlayIcon(); });
  replayBtn.addEventListener("click", function () { clock = 0; playing = true; setPlayIcon(); });
  speedBtn.addEventListener("click", function () { si = (si + 1) % SPEEDS.length; speed = SPEEDS[si]; speedLab.textContent = speed + "×"; });

  function seekAt(clientX) {
    var r = track.getBoundingClientRect();
    var f = clamp01((clientX - r.left) / r.width);
    clock = f * DUR;
  }
  track.addEventListener("pointerdown", function (e) { scrub = true; track.setPointerCapture(e.pointerId); seekAt(e.clientX); });
  track.addEventListener("pointermove", function (e) { if (scrub) seekAt(e.clientX); });
  track.addEventListener("pointerup", function (e) { scrub = false; });
  track.addEventListener("pointercancel", function () { scrub = false; });

  window.__seek = function (f) { clock = clamp01(f) * DUR; draw((clock % DUR) / DUR); };

  window.addEventListener("keydown", function (e) {
    if (e.code === "Space") { e.preventDefault(); playing = !playing; setPlayIcon(); }
    else if (e.code === "ArrowRight") { clock = (clock + 0.5) % DUR; }
    else if (e.code === "ArrowLeft") { clock = (clock - 0.5 + DUR) % DUR; }
  });

  /* ---- boot ---- */
  function boot() {
    resize();
    buildParticles();
    setPlayIcon();
    if (reduce) { clock = DUR * 0.80; playing = false; setPlayIcon(); }
    requestAnimationFrame(frame);
  }
  window.addEventListener("resize", resize);
  if (EMBED && window.ResizeObserver) { new ResizeObserver(resize).observe(root); }
  if (EMBED && window.IntersectionObserver) {
    visible = false;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        visible = e.isIntersecting;
        if (visible && !seenOnce) { seenOnce = true; if (!reduce) clock = 0; }
      });
    }, { threshold: 0.12 });
    io.observe(root);
  }
  // ensure fonts are ready so canvas labels use the right faces
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { resize(); }).catch(function () {});
  }
  boot();
})();
