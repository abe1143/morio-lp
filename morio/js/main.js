// ── INTRO ──
(function () {
  const intro   = document.getElementById('intro');
  const skipBtn = document.getElementById('intro-skip');

  document.documentElement.style.overflow = 'hidden';

  function exitIntro() {
    intro.classList.add('hide');
    // bg: 1.6s, content: delay 1s + 0.6s = 1.6s → remove at 2s
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

// ── HERO LOGO SYNC: イントロとヒーローのMORIO位置を実測して一致させる ──
function syncHeroLogo() {
  const introLogo = document.getElementById('intro-logo');
  const heroLogo  = document.querySelector('.hero-logo');
  if (!introLogo || !heroLogo) return;

  heroLogo.style.transform = ''; // リセット
  const diff = introLogo.getBoundingClientRect().top
             - heroLogo.getBoundingClientRect().top;
  if (Math.abs(diff) > 0.5) {
    heroLogo.style.transform = `translateY(${diff}px)`;
  }
}
// フォント読み込み完了後に実測（フォントで高さが変わるため）
document.fonts.ready.then(syncHeroLogo);
window.addEventListener('resize', syncHeroLogo);

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

// イージング関数（easeInOutCubic）
function ease(t) {
  return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
}

// スムーススクロールアニメーション（duration ms）
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

  // 現在のコンテンツをフェードアウト
  slides[currentIdx].classList.remove('active');

  // スクロール中間でコンテンツをフェードイン
  setTimeout(() => {
    resetKenBurns(slides[idx]);
    slides[idx].classList.add('active');
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    currentIdx = idx;
  }, duration * 0.55);

  // スムーススクロール実行
  animateScroll(slides[idx].offsetTop, duration, () => {
    isMoving = false;
  });
}

// 初期アクティブ
slides[0].classList.add('active');
resetKenBurns(slides[0]);

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
