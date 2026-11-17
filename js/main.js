/* 播放器 */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const audio = $('audio');
  const enEl = $('en'), zhEl = $('zh'), subEl = $('sub');
  const bar = $('bar'), fill = $('fill'), head = $('head'), clock = $('clock');
  const gate = $('gate'), btnPlay = $('play');

  const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
  const fmt = s => { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const esc = s => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;');

  let curLine = -2, token = 0;

  function renderLine(L) {
    enEl.innerHTML = (L.en || []).map(s => '<span class="l">' + esc(s) + '</span>').join('');
    zhEl.textContent = L.zh || '';
    subEl.classList.toggle('small', !!L.small);
  }

  function syncText(t) {
    const idx = t > 289 ? -1 : lineAt(t);
    if (idx !== curLine) {
      curLine = idx;
      const L = idx >= 0 ? LINES[idx] : null;
      const my = ++token;
      subEl.classList.remove('in');
      setTimeout(() => {
        if (my !== token) return;
        if (L && !L.last) { renderLine(L); subEl.classList.add('in'); }
        else { enEl.innerHTML = ''; zhEl.textContent = ''; }
      }, 110);
    }
  }

  /* 音频 */
  let ac = null;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const useAnalyser = location.protocol !== 'file:' && !isIOS;
  function initAudio() {
    if (!useAnalyser || ac) return;
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      const src = ac.createMediaElementSource(audio);
      const an = ac.createAnalyser();
      an.fftSize = 128;
      src.connect(an); an.connect(ac.destination);
    } catch (e) { /* 静默降级 */ }
  }

  let overrideT = null;
  function loop() {
    const t = overrideT !== null ? overrideT : (audio.currentTime || 0);
    WORLD.draw(t);
    syncText(t);
    const d = audio.duration || SONG.dur;
    const k = clamp(t / d);
    fill.style.width = (k * 100) + '%';
    head.style.left = (k * 100) + '%';
    clock.textContent = fmt(t) + ' / ' + fmt(d);
    requestAnimationFrame(loop);
  }

  const ICON_PLAY = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';
  const ICON_PAUSE = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/></svg>';
  function setPlaying(p) { btnPlay.innerHTML = p ? ICON_PAUSE : ICON_PLAY; }
  function toggle() {
    if (audio.paused) {
      if (ac && ac.state === 'suspended') ac.resume();
      audio.play().catch(() => setPlaying(false));
    } else audio.pause();
  }
  btnPlay.addEventListener('click', toggle);
  audio.addEventListener('play', () => setPlaying(true));
  audio.addEventListener('pause', () => setPlaying(false));
  $('start').addEventListener('click', () => {
    gate.classList.add('off');
    initAudio();
    if (ac && ac.state === 'suspended') ac.resume();
    audio.play().catch(() => setPlaying(false));
  });

  let drag = false;
  function seekTo(x) {
    const r = bar.getBoundingClientRect();
    audio.currentTime = clamp((x - r.left) / r.width) * (audio.duration || SONG.dur);
    curLine = -2;
  }
  bar.addEventListener('pointerdown', e => { drag = true; bar.setPointerCapture(e.pointerId); seekTo(e.clientX); });
  bar.addEventListener('pointermove', e => { if (drag) seekTo(e.clientX); });
  bar.addEventListener('pointerup', () => { drag = false; });

  document.addEventListener('keydown', e => {
    if (e.code === 'Space') { e.preventDefault(); toggle(); }
    if (e.code === 'ArrowRight') { audio.currentTime = Math.min(audio.duration || SONG.dur, audio.currentTime + 5); curLine = -2; }
    if (e.code === 'ArrowLeft') { audio.currentTime = Math.max(0, audio.currentTime - 5); curLine = -2; }
  });

  let idle = 0;
  document.addEventListener('mousemove', () => {
    document.body.classList.remove('idle');
    clearTimeout(idle);
    idle = setTimeout(() => { if (!audio.paused) document.body.classList.add('idle'); }, 2400);
  });

  const q = new URLSearchParams(location.search);
  if (q.has('t')) {
    overrideT = parseFloat(q.get('t')) || 0;
    gate.classList.add('off');
  }
  setPlaying(false);
  clock.textContent = '0:00 / ' + fmt(SONG.dur);
  loop();
})();
