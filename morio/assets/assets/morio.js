/* =========================================================================
   MORIO — shared behaviour
   ========================================================================= */
(function(){
  'use strict';

  /* ---- Nav: scroll state + mobile toggle ---- */
  var nav = document.querySelector('.nav');
  var onScroll = function(){
    if(!nav) return;
    if(window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if(toggle && links){
    toggle.addEventListener('click', function(){
      toggle.classList.toggle('x');
      links.classList.toggle('show');
    });
    links.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        toggle.classList.remove('x'); links.classList.remove('show');
      });
    });
  }

  /* ---- Reveal on scroll (fail-safe) ---- */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealEls = [].slice.call(document.querySelectorAll('[data-reveal]'));
  var showAll = function(){ revealEls.forEach(function(el){ el.classList.add('is-in'); }); };

  if(reduce || !('IntersectionObserver' in window)){
    showAll();
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold:0.08, rootMargin:'0px 0px -6% 0px' });
    revealEls.forEach(function(el){ io.observe(el); });

    // Fallback 1: reveal anything already within the viewport on load.
    var revealInView = function(){
      var vh = window.innerHeight || document.documentElement.clientHeight;
      revealEls.forEach(function(el){
        if(el.classList.contains('is-in')) return;
        var r = el.getBoundingClientRect();
        if(r.top < vh * 0.96 && r.bottom > 0){ el.classList.add('is-in'); io.unobserve(el); }
      });
    };
    window.addEventListener('load', revealInView);
    window.addEventListener('scroll', revealInView, { passive:true });
    setTimeout(revealInView, 200);

    // Fallback 2: safety net — never leave content stuck hidden.
    setTimeout(showAll, 1600);
  }

  /* ---- Subtle parallax ---- */
  var pxEls = [].slice.call(document.querySelectorAll('[data-parallax]'));
  if(!reduce && pxEls.length){
    var ticking = false;
    var run = function(){
      var vh = window.innerHeight;
      pxEls.forEach(function(el){
        var r = el.getBoundingClientRect();
        if(r.bottom < -200 || r.top > vh + 200) return;
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.12;
        var center = r.top + r.height/2 - vh/2;
        var img = el.querySelector('img') || el;
        img.style.transform = 'translate3d(0,' + (-center * speed).toFixed(1) + 'px,0) scale(1.06)';
      });
      ticking = false;
    };
    window.addEventListener('scroll', function(){
      if(!ticking){ window.requestAnimationFrame(run); ticking = true; }
    }, { passive:true });
    window.addEventListener('resize', run);
    run();
  }

  /* =======================================================================
     TWEAKS — vanilla panel + host protocol
     ======================================================================= */
  var KEY = 'morio-tweaks';
  var DEFAULTS = { accent:'gold', density:'comfortable', hero:'facade' };
  var ACCENTS = [
    { id:'gold',       label:'Gold',   sw:'#c2a25f' },
    { id:'bronze',     label:'Bronze', sw:'#b27e54' },
    { id:'achromatic', label:'Neutral',sw:'#cfc7b8' }
  ];

  function load(){
    var v = {};
    try{ v = JSON.parse(localStorage.getItem(KEY)) || {}; }catch(e){}
    return Object.assign({}, DEFAULTS, v);
  }
  function apply(v){
    var r = document.documentElement;
    r.setAttribute('data-accent', v.accent);
    r.setAttribute('data-density', v.density);
    r.setAttribute('data-hero', v.hero);
  }
  function save(v){
    try{ localStorage.setItem(KEY, JSON.stringify(v)); }catch(e){}
    try{ window.parent.postMessage({ type:'__edit_mode_set_keys', edits:v }, '*'); }catch(e){}
  }

  var state = load();
  apply(state);

  var hasHero = !!document.querySelector('.hero-bg[data-variant]');

  /* build panel */
  var panel = document.createElement('div');
  panel.id = 'tweaks';
  var heroSec = hasHero ? (
    '<div class="tw-sec"><div class="tw-lab">Hero</div>' +
      '<div class="seg" data-group="hero">' +
        '<button data-val="facade">Facade</button>' +
        '<button data-val="penthouse">Suite</button>' +
        '<button data-val="tower">Tower</button>' +
      '</div></div>' ) : '';
  panel.innerHTML =
    '<header><span class="ttl">Tweaks</span><button id="tw-close" aria-label="close">\u00d7</button></header>' +
    '<div class="tw-sec"><div class="tw-lab">Accent</div>' +
      '<div class="sw" data-group="accent">' +
        ACCENTS.map(function(a){ return '<button data-val="'+a.id+'" title="'+a.label+'" style="background:'+a.sw+'"></button>'; }).join('') +
      '</div></div>' +
    '<div class="tw-sec"><div class="tw-lab">Whitespace</div>' +
      '<div class="seg" data-group="density">' +
        '<button data-val="compact">Compact</button>' +
        '<button data-val="comfortable">Comfort</button>' +
        '<button data-val="spacious">Spacious</button>' +
      '</div></div>' +
    heroSec;
  document.body.appendChild(panel);

  function syncUI(){
    panel.querySelectorAll('[data-group]').forEach(function(g){
      var key = g.getAttribute('data-group');
      g.querySelectorAll('button').forEach(function(b){
        b.classList.toggle('on', b.getAttribute('data-val') === state[key]);
      });
    });
  }
  syncUI();

  panel.querySelectorAll('[data-group] button').forEach(function(b){
    b.addEventListener('click', function(){
      var key = b.parentElement.getAttribute('data-group');
      state[key] = b.getAttribute('data-val');
      apply(state); save(state); syncUI();
    });
  });

  var closeBtn = panel.querySelector('#tw-close');
  closeBtn.addEventListener('click', function(){
    panel.classList.remove('open');
    try{ window.parent.postMessage({ type:'__edit_mode_dismissed' }, '*'); }catch(e){}
  });

  /* host protocol */
  window.addEventListener('message', function(e){
    var t = e && e.data && e.data.type;
    if(t === '__activate_edit_mode') panel.classList.add('open');
    else if(t === '__deactivate_edit_mode') panel.classList.remove('open');
  });
  try{ window.parent.postMessage({ type:'__edit_mode_available' }, '*'); }catch(e){}

})();
