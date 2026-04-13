// スクロール位置の自動復元を無効化（リロード時に必ず先頭から始まるように）
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// ── INTRO ──
(function () {
  const intro   = document.getElementById('intro');
  const skipBtn = document.getElementById('intro-skip');

  // サブページから戻ったときはイントロをスキップ
  if (sessionStorage.getItem('introSeen')) {
    intro.remove();
    return;
  }
  sessionStorage.setItem('introSeen', '1');

  document.documentElement.style.overflow = 'hidden';

  function exitIntro() {
    intro.classList.add('hide');
    setTimeout(() => {
      document.documentElement.style.overflow = '';
      intro.remove();
    }, 2000);
  }

  const autoTimer = setTimeout(exitIntro, 7000);

  skipBtn.addEventListener('click', () => {
    clearTimeout(autoTimer);
    exitIntro();
  });
})();

// ── HERO SYNC: イントロの各要素とヒーローの対応要素の位置を実測して一致させる ──
// 必ずslides[0].classList.add('active') の直前に呼ぶこと
// （active付与後だとCSSのtransform transitionが干渉するため）
function syncPair(introId, heroSelector) {
  const introEl = document.getElementById(introId);
  const heroEl  = document.querySelector(heroSelector);
  if (!introEl || !heroEl) return;

  heroEl.style.transform = '';
  const diff = introEl.getBoundingClientRect().top
             - heroEl.getBoundingClientRect().top;
  if (Math.abs(diff) > 0.5) {
    heroEl.style.transform = `translateY(${diff}px)`;
  }
}

function syncHero() {
  syncPair('intro-logo', '.hero-logo');
  syncPair('intro-sub',  '.s1 .slide-sub');
  syncPair('intro-line', '.hero-line');
}

// ── SLIDE SYSTEM ──
const slides     = Array.from(document.querySelectorAll('.slide'));
const progressEl = document.getElementById('progress');
let currentIdx   = 0;
let isMoving     = false;

// ドット生成
slides.forEach((_, i) => {
  const d = document.createElement('div');
  d.className = 'dot' + (i === 0 ? ' active' : '');
  d.addEventListener('click', () => goTo(i));
  progressEl.appendChild(d);
});
const dots = document.querySelectorAll('.dot');

// Ken Burns リセット
function resetKenBurns(slide) {
  const img = slide.querySelector('.slide-bg img');
  if (!img) return;
  img.style.animation = 'none';
  img.offsetHeight;
  img.style.animation = '';
}

// イージング
function ease(t) {
  return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
}

// スムーススクロール
function animateScroll(targetY, duration, onDone) {
  const startY = window.scrollY;
  const dist   = targetY - startY;
  let startTime = null;

  function step(now) {
    if (!startTime) startTime = now;
    const t = Math.min((now - startTime) / duration, 1);
    window.scrollTo(0, startY + dist * ease(t));
    if (t < 1) requestAnimationFrame(step);
    else if (onDone) onDone();
  }
  requestAnimationFrame(step);
}

// セクション遷移
function goTo(idx) {
  if (isMoving || idx === currentIdx) return;
  if (idx < 0 || idx >= slides.length) return;

  isMoving = true;
  const duration = 1500;

  slides[currentIdx].classList.remove('active');

  setTimeout(() => {
    resetKenBurns(slides[idx]);
    slides[idx].classList.add('active');
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    currentIdx = idx;
  }, duration * 0.55);

  animateScroll(slides[idx].offsetTop, duration, () => {
    isMoving = false;
  });
}

// ── 初期アクティブ: フォント読み込み後にシンクしてからactiveを付与 ──
// activeを付与する前にtransformをセットすることで、
// CSSのtransform transitionが干渉せず正確な位置に固定される
document.fonts.ready.then(() => {
  syncHero();
  slides[0].classList.add('active');
  resetKenBurns(slides[0]);
});

window.addEventListener('resize', () => {
  // リサイズ時: heroがactiveなら一旦リセットして再計測
  if (currentIdx === 0) {
    const heroLogo = document.querySelector('.hero-logo');
    const heroSub  = document.querySelector('.s1 .slide-sub');
    const heroLine = document.querySelector('.hero-line');
    if (heroLogo) heroLogo.style.transform = '';
    if (heroSub)  heroSub.style.transform  = '';
    if (heroLine) heroLine.style.transform = '';
  }
  syncHero();
});

// ホイールハンドラ
let wheelLock = false;
window.addEventListener('wheel', (e) => {
  e.preventDefault();
  if (wheelLock || isMoving) return;
  wheelLock = true;
  setTimeout(() => { wheelLock = false; }, 400);

  if (e.deltaY > 20)       goTo(currentIdx + 1);
  else if (e.deltaY < -20) goTo(currentIdx - 1);
}, { passive: false });

// キーボード
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); goTo(currentIdx + 1); }
  if (e.key === 'ArrowUp'   || e.key === 'PageUp')   { e.preventDefault(); goTo(currentIdx - 1); }
});

// ナビ・CTA クリック（data-goto属性）
document.querySelectorAll('[data-goto]').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    goTo(parseInt(el.dataset.goto, 10));
  });
});

// タッチ
let touchY = 0;
window.addEventListener('touchstart', e => { touchY = e.touches[0].clientY; }, { passive: true });
window.addEventListener('touchend', e => {
  const diff = touchY - e.changedTouches[0].clientY;
  if (Math.abs(diff) > 50) goTo(currentIdx + (diff > 0 ? 1 : -1));
});

// ── BGM ──
const bgm     = document.getElementById('bgm');
const btn     = document.getElementById('sound-btn');
const iconOn  = document.getElementById('icon-on');
const iconOff = document.getElementById('icon-off');
let playing   = false;

function startBgm() {
  bgm.volume = 0;
  bgm.play().then(() => {
    playing = true;
    fadeVolume(0, 0.18, 3000);
  }).catch(() => {});
}

function fadeVolume(from, to, duration) {
  const steps = 60;
  const interval = duration / steps;
  const delta = (to - from) / steps;
  let v = from;
  const t = setInterval(() => {
    v = Math.min(Math.max(v + delta, 0), 1);
    bgm.volume = v;
    if ((delta > 0 && v >= to) || (delta < 0 && v <= to)) clearInterval(t);
  }, interval);
}

btn.addEventListener('click', () => {
  if (!playing) {
    startBgm();
  } else if (bgm.paused) {
    bgm.play();
    fadeVolume(0, 0.18, 1000);
  } else {
    fadeVolume(bgm.volume, 0, 1000);
    setTimeout(() => bgm.pause(), 1100);
  }
  const muted = !bgm.paused && bgm.volume > 0;
  iconOn.style.display  = muted ? 'none' : '';
  iconOff.style.display = muted ? '' : 'none';
});

document.addEventListener('click', function autoplay() {
  if (!playing) startBgm();
  document.removeEventListener('click', autoplay);
}, { once: true });
