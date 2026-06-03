/* =========================================================================
   MORIO — motion behaviour
   Scroll progress · hero cursor glow · stat count-up · nav scroll-spy
   ========================================================================= */
(function(){
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- scroll progress bar ---- */
  var bar = document.createElement('div');
  bar.className = 'scroll-prog';
  document.body.appendChild(bar);
  function progress(){
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var p = max > 0 ? h.scrollTop / max : 0;
    bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
  }
  window.addEventListener('scroll', progress, { passive:true });
  window.addEventListener('resize', progress);
  progress();

  /* ---- hero cursor glow ---- */
  var hero = document.querySelector('.hero');
  if(hero && !reduce && window.matchMedia('(pointer:fine)').matches){
    hero.addEventListener('pointermove', function(e){
      var r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      hero.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    });
  }

  /* ---- stat count-up ---- */
  function countUp(){
    [].forEach.call(document.querySelectorAll('.stat .n'), function(n){
      var node = n.firstChild;                       // leading text node
      if(!node || node.nodeType !== 3) return;
      var raw = node.nodeValue.trim();
      var m = raw.match(/^([^\d]*)([\d,]+)(.*)$/);    // prefix · number · suffix
      if(!m) return;
      var prefix = m[1], suffix = m[3];
      var target = parseInt(m[2].replace(/,/g, ''), 10);
      if(isNaN(target)) return;
      var comma = m[2].indexOf(',') >= 0 || target >= 1000;
      var dur = 1500, start = null;
      function fmt(v){ return comma ? v.toLocaleString('en-US') : String(v); }
      function tick(ts){
        if(!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var e = 1 - Math.pow(1 - p, 3);               // easeOutCubic
        node.nodeValue = prefix + fmt(Math.round(target * e)) + suffix;
        if(p < 1) requestAnimationFrame(tick);
        else node.nodeValue = prefix + fmt(target) + suffix;
      }
      node.nodeValue = prefix + fmt(0) + suffix;
      requestAnimationFrame(tick);
    });
  }
  var statsWrap = document.querySelector('.stats');
  if(statsWrap && !reduce){
    if('IntersectionObserver' in window){
      var sio = new IntersectionObserver(function(entries){
        entries.forEach(function(en){
          if(en.isIntersecting){ countUp(); sio.disconnect(); }
        });
      }, { threshold:0.35 });
      sio.observe(statsWrap);
    } else {
      countUp();
    }
  }

  /* ---- nav scroll-spy ---- */
  var anchorLinks = [].slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  var homeLink = document.querySelector('.nav-links a[href="index.html"], .nav-links a[href="#top"]');
  var targets = anchorLinks
    .map(function(a){ var s = document.querySelector(a.getAttribute('href')); return s ? { a:a, sec:s } : null; })
    .filter(Boolean);
  function spy(){
    var mark = window.scrollY + window.innerHeight * 0.4;
    var current = null;
    targets.forEach(function(t){ if(t.sec.offsetTop <= mark) current = t; });
    var atTop = window.scrollY < 220;
    anchorLinks.forEach(function(a){ a.classList.remove('active'); });
    if(homeLink) homeLink.classList.toggle('active', atTop);
    if(current && !atTop){ current.a.classList.add('active'); }
  }
  if(targets.length){
    window.addEventListener('scroll', spy, { passive:true });
    window.addEventListener('resize', spy);
    spy();
  }
})();
