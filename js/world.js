/* 《第二天》—— 一个被现实压住的人，一天，然后又是第二天 */
window.WORLD = (function () {
  'use strict';
  const cv = document.getElementById('cv');
  const ctx = cv.getContext('2d');
  const W = 1600, H = 900;
  const HOR = H * 0.66;
  const BEAT = 0.5405;

  const C = {
    ink: '#010202',
    bone: '228,230,220',
    cold: '168,192,200',
    warm: '255,206,150',
    sick: '198,214,186'
  };
  const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
  const smooth = k => { k = clamp(k); return k * k * (3 - 2 * k); };
  const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const rgba = (c, a) => 'rgba(' + c + ',' + a + ')';

  /* ---------------- 人 ---------------- */
  function person(x, footY, h, o) {
    const p = o || {};
    const crouch = clamp(p.crouch || 0);
    const sit = clamp(p.sit || 0);
    const lie = clamp(p.lie || 0);
    const arms = clamp(p.arms || 0);
    const lean = (p.lean || 0) * h * 0.05;
    const headDown = clamp(p.headDown || 0);
    const headTurn = p.headTurn || 0;
    const reach = p.reach || null;          // 伸手够东西 [x,y]
    const armRaise = clamp(p.armRaise || 0); // 举手臂（按闹钟/挡脸）
    const col = p.color || C.ink;
    const alpha = p.alpha === undefined ? 1 : p.alpha;
    const walk = p.walk || 0;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = col;
    ctx.fillStyle = col;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (lie > 0.5) {
      // 躺着：用横线画
      const cy = footY - h * 0.12;
      ctx.lineWidth = h * 0.20;
      ctx.beginPath();
      ctx.moveTo(x, cy);
      ctx.lineTo(x + h * 0.62, cy);
      ctx.stroke();
      // 头
      ctx.beginPath();
      ctx.arc(x + h * 0.70, cy, h * 0.070, 0, Math.PI * 2);
      ctx.fill();
      // 腿
      ctx.lineWidth = h * 0.085;
      ctx.beginPath();
      ctx.moveTo(x, cy);
      ctx.lineTo(x - h * 0.34, cy + h * 0.02);
      ctx.stroke();
      ctx.restore();
      return;
    }

    let hipH = 0.47 - crouch * 0.17 - sit * 0.16;
    const hipY = footY - h * hipH;
    const shY = hipY - h * (0.30 - crouch * 0.02);
    const headR = h * 0.062;
    const headY = shY - h * 0.062 - headDown * h * 0.02;
    const nx = x + lean;

    // 腿
    const sw = h * (0.058 + 0.016 * (1 - crouch));
    const swing = walk ? Math.sin(walk * Math.PI * 2) * h * 0.05 : 0;
    ctx.lineWidth = h * 0.092;
    if (sit > 0.15) {
      ctx.beginPath();
      ctx.moveTo(x - sw * 0.5, hipY);
      ctx.lineTo(x + h * 0.10, hipY + h * 0.02);
      ctx.lineTo(x + h * 0.11, footY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + sw * 0.5, hipY);
      ctx.lineTo(x + h * 0.06, hipY + h * 0.03);
      ctx.lineTo(x + h * 0.07, footY);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(x - sw * 0.5, hipY);
      ctx.quadraticCurveTo(x - sw * 0.95 - swing, (hipY + footY) / 2, x - sw - swing, footY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + sw * 0.5, hipY);
      ctx.quadraticCurveTo(x + sw * 0.95 + swing, (hipY + footY) / 2, x + sw + swing, footY);
      ctx.stroke();
    }

    // 躯干
    ctx.lineWidth = h * 0.215;
    ctx.beginPath();
    ctx.moveTo(x, hipY);
    ctx.lineTo(nx, shY);
    ctx.stroke();
    ctx.lineWidth = h * 0.185;
    ctx.beginPath();
    ctx.moveTo(nx - h * 0.072, shY + h * 0.01);
    ctx.lineTo(nx + h * 0.072, shY + h * 0.01);
    ctx.stroke();

    // 手臂
    ctx.lineWidth = h * 0.064;
    const handX = h * (0.10 + 0.17 * arms);
    let handY = shY + h * (0.30 - 0.12 * arms);
    if (armRaise > 0) handY = shY - h * 0.34 * armRaise;
    ctx.beginPath();
    ctx.moveTo(nx - h * 0.066, shY);
    ctx.quadraticCurveTo(nx - handX * 0.9, shY + h * 0.16, nx - handX, handY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(nx + h * 0.066, shY);
    if (reach) {
      // 两段：肩 → 肘 → 手
      const mx = (nx + h * 0.066 + reach[0]) / 2;
      const my = (shY + reach[1]) / 2 + h * 0.10;
      ctx.quadraticCurveTo(mx, my, reach[0], reach[1]);
    } else {
      ctx.quadraticCurveTo(nx + handX * 0.9, shY + h * 0.16, nx + handX, handY);
    }
    ctx.stroke();

    // 头
    const hx = nx + headTurn * headR * 0.35;
    ctx.beginPath();
    ctx.ellipse(hx, headY - headR * 0.5, headR * (1 - Math.abs(headTurn) * 0.2), headR, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = headR * 0.62;
    ctx.beginPath();
    ctx.moveTo(hx, headY + headR * 0.3);
    ctx.lineTo(nx, shY);
    ctx.stroke();

    if (p.rim) {
      ctx.strokeStyle = p.rim;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(nx + h * 0.072, shY + h * 0.015);
      ctx.quadraticCurveTo(nx + h * 0.09, hipY - h * 0.03, x + h * 0.055, hipY + h * 0.02);
      ctx.stroke();
    }
    ctx.restore();
    return { sh: [nx, shY], head: [hx, headY], hip: [x, hipY] };
  }

  /* ---------------- 房间 ---------------- */
  function room(t, opt) {
    const o = opt || {};
    // 墙
    const wg = ctx.createLinearGradient(0, 0, 0, HOR);
    wg.addColorStop(0, o.wallTop || '#161C1A');
    wg.addColorStop(1, o.wallBot || '#1E2622');
    ctx.fillStyle = wg;
    ctx.fillRect(0, 0, W, HOR);

    // 墙纸竖纹
    ctx.strokeStyle = 'rgba(168,192,200,.045)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 16; i++) {
      const x = W * i / 16;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, HOR); ctx.stroke();
    }
    // 墙上的水渍
    ctx.fillStyle = 'rgba(10,14,12,.25)';
    ctx.beginPath();
    ctx.ellipse(W * 0.80, H * 0.18, W * 0.06, H * 0.10, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // 地板
    const fg = ctx.createLinearGradient(0, HOR, 0, H);
    fg.addColorStop(0, '#141A17');
    fg.addColorStop(1, '#080C0A');
    ctx.fillStyle = fg;
    ctx.fillRect(0, HOR, W, H - HOR);

    // 地板透视
    ctx.strokeStyle = 'rgba(168,192,200,.055)';
    for (let i = 1; i <= 5; i++) {
      const y = HOR + Math.pow(i / 5, 2.1) * (H - HOR);
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    for (let i = -7; i <= 7; i++) {
      ctx.beginPath();
      ctx.moveTo(W * 0.5 + i * W * 0.055, HOR);
      ctx.lineTo(W * 0.5 + i * W * 0.30, H);
      ctx.stroke();
    }

    // 窗（左上）
    if (o.window !== false) {
      const wx = W * 0.06, wy = H * 0.12, ww = W * 0.17, wh = H * 0.36;
      ctx.fillStyle = '#050807';
      ctx.fillRect(wx - 14, wy - 14, ww + 28, wh + 28);
      const lg = ctx.createLinearGradient(wx, wy, wx, wy + wh);
      lg.addColorStop(0, o.night ? 'rgba(28,44,56,.9)' : 'rgba(180,200,206,.55)');
      lg.addColorStop(1, o.night ? 'rgba(16,26,34,.9)' : 'rgba(140,166,176,.35)');
      ctx.fillStyle = lg;
      ctx.fillRect(wx, wy, ww, wh);
      ctx.fillStyle = '#050807';
      ctx.fillRect(wx + ww * 0.48, wy, 5, wh);
      ctx.fillRect(wx, wy + wh * 0.46, ww, 5);
      // 窗光
      if (!o.night) {
        ctx.save();
        ctx.globalAlpha = 0.10;
        const sh = ctx.createLinearGradient(wx, wy, wx + W * 0.4, H);
        sh.addColorStop(0, 'rgba(190,210,216,.8)');
        sh.addColorStop(1, 'rgba(190,210,216,0)');
        ctx.fillStyle = sh;
        ctx.beginPath();
        ctx.moveTo(wx + ww, wy);
        ctx.lineTo(wx + ww + W * 0.10, wy);
        ctx.lineTo(wx + ww + W * 0.30, H);
        ctx.lineTo(wx + ww - W * 0.05, H);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
  }

  /* ---------------- 物件 ---------------- */
  function clockRadio(x, y, s, on, t) {
    ctx.fillStyle = '#0A0D0C';
    ctx.fillRect(x - s, y - s * 0.55, s * 2, s * 1.1);
    ctx.strokeStyle = 'rgba(168,192,200,.18)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - s, y - s * 0.55, s * 2, s * 1.1);
    ctx.font = '600 ' + (s * 0.62) + 'px ui-monospace, Menlo, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = on ? 'rgba(226,74,60,.95)' : 'rgba(226,74,60,.18)';
    ctx.fillText('5:40', x, y + 1);
    if (on) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, s * 3);
      g.addColorStop(0, 'rgba(226,74,60,.16)');
      g.addColorStop(1, 'rgba(226,74,60,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - s * 3, y - s * 3, s * 6, s * 6);
    }
  }

  function bed(x, y, w, h, rumple) {
    ctx.fillStyle = '#0B100E';
    ctx.fillRect(x, y, w, h * 0.55);
    ctx.fillStyle = '#101714';
    ctx.beginPath();
    ctx.moveTo(x, y + h * 0.10);
    ctx.quadraticCurveTo(x + w * 0.30, y - h * 0.06 + rumple, x + w * 0.62, y + h * 0.04);
    ctx.lineTo(x + w * 0.62, y + h * 0.42);
    ctx.lineTo(x, y + h * 0.42);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(168,192,200,.10)';
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(x, y + h * 0.42); ctx.lineTo(x + w * 0.62, y + h * 0.42); ctx.stroke();
    // 枕头
    ctx.fillStyle = '#161E1A';
    ctx.beginPath();
    ctx.ellipse(x + w * 0.10, y + h * 0.10, w * 0.08, h * 0.10, -0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  function desk(x, y, w) {
    ctx.fillStyle = '#0C1210';
    ctx.fillRect(x, y, w, H * 0.02);
    ctx.fillRect(x + w * 0.06, y + H * 0.02, w * 0.03, H * 0.20);
    ctx.fillRect(x + w * 0.91, y + H * 0.02, w * 0.03, H * 0.20);
    ctx.strokeStyle = 'rgba(168,192,200,.10)';
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.stroke();
  }

  function bin(x, y, s) {
    ctx.fillStyle = '#0A0F0D';
    ctx.beginPath();
    ctx.moveTo(x - s * 0.5, y);
    ctx.lineTo(x + s * 0.5, y);
    ctx.lineTo(x + s * 0.38, y + s);
    ctx.lineTo(x - s * 0.38, y + s);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(168,192,200,.12)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    // 里面的纸团
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = 'rgba(200,204,190,' + (0.10 + rnd(i) * 0.08) + ')';
      ctx.beginPath();
      ctx.arc(x - s * 0.2 + i * s * 0.2, y + s * 0.06 + rnd(i * 3) * s * 0.1, s * 0.13, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* ---------------- 工厂 ---------------- */
  function factory(t, dim) {
    const g = ctx.createLinearGradient(0, 0, 0, HOR);
    g.addColorStop(0, '#0E1416');
    g.addColorStop(1, '#1A2426');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, HOR);

    // 天花板灯
    for (let i = 0; i < 4; i++) {
      const x = W * (0.16 + i * 0.23);
      const on = dim < (i / 4) ? 1 : 0.12;
      ctx.fillStyle = 'rgba(214,232,222,' + (0.6 * on) + ')';
      ctx.fillRect(x - W * 0.05, H * 0.08, W * 0.10, 4);
      if (on > 0.5) {
        const lg = ctx.createRadialGradient(x, H * 0.10, 0, x, H * 0.10, W * 0.16);
        lg.addColorStop(0, 'rgba(214,232,222,.14)');
        lg.addColorStop(1, 'rgba(214,232,222,0)');
        ctx.fillStyle = lg;
        ctx.fillRect(x - W * 0.16, H * 0.08, W * 0.32, H * 0.4);
      }
    }

    // 地面
    const fg = ctx.createLinearGradient(0, HOR, 0, H);
    fg.addColorStop(0, '#151D1E');
    fg.addColorStop(1, '#080C0C');
    ctx.fillStyle = fg;
    ctx.fillRect(0, HOR, W, H - HOR);

    // 传送带
    ctx.fillStyle = '#0A0F10';
    ctx.fillRect(0, H * 0.70, W, H * 0.06);
    ctx.strokeStyle = 'rgba(168,192,200,.16)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, H * 0.70); ctx.lineTo(W, H * 0.70); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, H * 0.76); ctx.lineTo(W, H * 0.76); ctx.stroke();

    // 零件
    const beat = t / BEAT;
    for (let i = 0; i < 16; i++) {
      const x = ((i * 110 + beat * 46) % (W + 160)) - 80;
      ctx.fillStyle = 'rgba(26,34,34,.95)';
      ctx.fillRect(x, H * 0.715, 54, H * 0.042);
      ctx.strokeStyle = 'rgba(168,192,200,.12)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, H * 0.715, 54, H * 0.042);
    }
  }

  /* ---------------- 街道 ---------------- */
  function street(t, night) {
    const g = ctx.createLinearGradient(0, 0, 0, HOR);
    g.addColorStop(0, night ? '#070B12' : '#141C1E');
    g.addColorStop(1, night ? '#121C26' : '#22302F');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, HOR);

    // 楼
    for (let i = 0; i < 7; i++) {
      const w = W * (0.12 + rnd(i) * 0.08);
      const h = H * (0.16 + rnd(i * 3) * 0.28);
      ctx.fillStyle = night ? '#060B0A' : '#101616';
      ctx.fillRect(W * (i * 0.15), HOR - h, w, h);
      for (let j = 0; j < 5; j++) {
        if (rnd(i * 7 + j) > 0.65) {
          ctx.fillStyle = 'rgba(255,206,150,' + (0.10 + rnd(j) * 0.16) + ')';
          ctx.fillRect(W * (i * 0.15) + w * (0.2 + j * 0.15), HOR - h + h * 0.2, 4, 5);
        }
      }
    }

    // 地面
    const fg = ctx.createLinearGradient(0, HOR, 0, H);
    fg.addColorStop(0, night ? '#101820' : '#1A2424');
    fg.addColorStop(1, night ? '#040709' : '#0A1010');
    ctx.fillStyle = fg;
    ctx.fillRect(0, HOR, W, H - HOR);

    // 路灯
    const lx = W * 0.78, ly = HOR - H * 0.30;
    ctx.strokeStyle = '#070B0A';
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx, HOR + 10); ctx.stroke();
    const lg = ctx.createRadialGradient(lx, ly, 0, lx, ly, W * 0.22);
    lg.addColorStop(0, 'rgba(255,206,150,.55)');
    lg.addColorStop(0.35, 'rgba(255,206,150,.14)');
    lg.addColorStop(1, 'rgba(255,206,150,0)');
    ctx.fillStyle = lg;
    ctx.beginPath(); ctx.arc(lx, ly, W * 0.22, 0, Math.PI * 2); ctx.fill();
  }

  /* ---------------- 绘制 ---------------- */
  function draw(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);

    /* 段落 */
    const P = [
      { t0: 0,   t1: 25.6, id: 'alarm' },
      { t0: 25.6,t1: 56,   id: 'rise' },
      { t0: 56,  t1: 71.3, id: 'work' },
      { t0: 71.3,t1: 98.4, id: 'paid' },
      { t0: 98.4,t1: 126,  id: 'walk' },
      { t0: 126, t1: 158,  id: 'room2' },
      { t0: 158, t1: 178,  id: 'sit' },
      { t0: 178, t1: 250,  id: 'letter' },
      { t0: 250, t1: 290,  id: 'sleep' },
      { t0: 290, t1: 297,  id: 'again' }
    ];
    let ph = P[0];
    for (let i = P.length - 1; i >= 0; i--) if (t >= P[i].t0) { ph = P[i]; break; }

    if (ph.id === 'alarm' || ph.id === 'rise' || ph.id === 'room2' || ph.id === 'sit' || ph.id === 'letter' || ph.id === 'sleep') {
      room(t, { night: ph.id === 'sleep' || ph.id === 'letter' });
    } else if (ph.id === 'work') {
      factory(t, 0);
    } else if (ph.id === 'paid' || ph.id === 'walk') {
      street(t, ph.id === 'walk');
    } else {
      room(t, { night: true });
    }

    /* 场景内容 */
    if (ph.id === 'alarm') {
      // 床 + 闹钟 + 躺着的他
      bed(W * 0.30, H * 0.60, W * 0.46, H * 0.24, Math.sin(t * 1.4) * 2);
      person(W * 0.40, H * 0.70, H * 0.16, { lie: 1 });
      clockRadio(W * 0.80, H * 0.58, H * 0.075, Math.floor(t * 0.8) % 2 === 0 || t > 6);
      // 被子掀开
      if (t > 12) {
        const k = smooth(clamp((t - 12) / 10));
        ctx.fillStyle = 'rgba(16,23,20,' + k + ')';
        ctx.beginPath();
        ctx.moveTo(W * 0.30, H * 0.62);
        ctx.quadraticCurveTo(W * 0.45, H * 0.52 + k * 10, W * 0.56, H * 0.66);
        ctx.lineTo(W * 0.56, H * 0.74);
        ctx.closePath();
        ctx.fill();
      }
    }

    if (ph.id === 'rise') {
      bed(W * 0.06, H * 0.62, W * 0.34, H * 0.20, 0);
      desk(W * 0.68, H * 0.62, W * 0.26);
      // 他坐起 → 站起
      const sitK = t < 31 ? 1 : 0;
      const stand = smooth(clamp((t - 32) / 10));
      if (stand < 0.6) {
        person(W * 0.24, H * 0.78, H * 0.30, { sit: 1, headDown: 0.5, fy: H * 0.78 });
      } else {
        person(W * 0.24 + stand * W * 0.20, H * 0.84, H * 0.32, { headDown: 0.4 * (1 - stand), lean: 0.2 });
      }
      // 镜子（墙上）
      const mx = W * 0.60, my = H * 0.22, mw = W * 0.13, mh = H * 0.22;
      ctx.fillStyle = '#1A2422';
      ctx.fillRect(mx, my, mw, mh);
      ctx.strokeStyle = 'rgba(168,192,200,.22)';
      ctx.lineWidth = 2;
      ctx.strokeRect(mx, my, mw, mh);
      if (t > 34) {
        ctx.save();
        ctx.globalAlpha = 0.35;
        person(mx + mw / 2, my + mh * 0.98, mh * 0.9, { headDown: 0.3, color: '#0A1210' });
        ctx.restore();
      }
    }

    if (ph.id === 'work') {
      // 他站在传送带后面，重复伸手
      const cyc = (t / BEAT) % 4;
      const reachK = cyc < 2 ? smooth(cyc) : smooth(4 - cyc);
      person(W * 0.50, H * 0.92, H * 0.38, {
        lean: 0.35,
        reach: [W * 0.50 + H * 0.16, H * 0.74 - reachK * H * 0.02]
      });
      // 工头（远处，指着他）
      if (t > 62) {
        person(W * 0.84, H * 0.86, H * 0.26, { lean: -0.4, armRaise: 0.6 });
      }
    }

    if (ph.id === 'paid') {
      // 他站在路灯下，手里几张钱
      person(W * 0.42, H * 0.90, H * 0.34, { headDown: 0.5, lean: 0.2 });
      // 手里的钱
      ctx.fillStyle = 'rgba(198,214,186,.35)';
      ctx.fillRect(W * 0.44, H * 0.74, W * 0.030, H * 0.018);
      ctx.fillRect(W * 0.441, H * 0.765, W * 0.028, H * 0.016);
      // 房租单（电线杆上）
      ctx.fillStyle = 'rgba(210,210,196,.12)';
      ctx.fillRect(W * 0.80, H * 0.34, W * 0.075, H * 0.10);
      ctx.strokeStyle = 'rgba(210,210,196,.18)';
      ctx.lineWidth = 1;
      ctx.strokeRect(W * 0.80, H * 0.34, W * 0.075, H * 0.10);
    }

    if (ph.id === 'walk') {
      const x = W * (0.22 + (t - 98.4) / 27 * 0.5);
      person(x, H * 0.90, H * 0.33, { walk: t * 1.7, headDown: 0.4, lean: 0.25 });
    }

    if (ph.id === 'room2') {
      bed(W * 0.08, H * 0.64, W * 0.32, H * 0.18, 0);
      desk(W * 0.62, H * 0.64, W * 0.30);
      // 泡面
      ctx.fillStyle = 'rgba(200,206,190,.16)';
      ctx.fillRect(W * 0.70, H * 0.615, W * 0.035, H * 0.026);
      // 手机亮着
      ctx.fillStyle = 'rgba(180,210,220,' + (0.25 + 0.15 * Math.sin(t * 3)) + ')';
      ctx.fillRect(W * 0.66, H * 0.622, W * 0.016, H * 0.018);
      // 他坐在床边
      person(W * 0.30, H * 0.86, H * 0.34, { sit: 1, headDown: 0.6, headTurn: -0.3 });
    }

    if (ph.id === 'sit') {
      bed(W * 0.08, H * 0.64, W * 0.32, H * 0.18, 0);
      person(W * 0.30, H * 0.86, H * 0.34, { sit: 1, headDown: 0.8 });
      // 墙上的影子（比人大）
      ctx.save();
      ctx.globalAlpha = 0.25;
      person(W * 0.36, H * 0.60, H * 0.52, { sit: 1, headDown: 0.8, color: '#050807' });
      ctx.restore();
    }

    if (ph.id === 'letter') {
      // 桌上：纸、笔、台灯
      desk(W * 0.34, H * 0.70, W * 0.40);
      const lampX = W * 0.62;
      const lg = ctx.createRadialGradient(lampX, H * 0.56, 0, lampX, H * 0.56, W * 0.28);
      lg.addColorStop(0, 'rgba(255,206,150,.30)');
      lg.addColorStop(0.4, 'rgba(255,206,150,.08)');
      lg.addColorStop(1, 'rgba(255,206,150,0)');
      ctx.fillStyle = lg;
      ctx.fillRect(lampX - W * 0.28, H * 0.30, W * 0.56, H * 0.5);
      // 台灯罩
      ctx.fillStyle = '#0C1210';
      ctx.beginPath();
      ctx.moveTo(lampX - W * 0.035, H * 0.56);
      ctx.lineTo(lampX - W * 0.018, H * 0.49);
      ctx.lineTo(lampX + W * 0.018, H * 0.49);
      ctx.lineTo(lampX + W * 0.035, H * 0.56);
      ctx.closePath(); ctx.fill();

      // 纸（写了 → 揉掉 → 扔）
      const write = smooth(clamp((t - 180) / 40));
      const crumple = smooth(clamp((t - 224) / 12));
      const throwK = smooth(clamp((t - 236) / 10));
      if (crumple < 0.9) {
        ctx.save();
        ctx.translate(W * 0.48, H * 0.695);
        ctx.rotate(-0.03 + crumple * 0.4);
        ctx.fillStyle = 'rgba(216,218,204,' + (0.55 * (1 - crumple * 0.3)) + ')';
        const pw = W * 0.11 * (1 - crumple * 0.45);
        const phh2 = H * 0.055 * (1 - crumple * 0.35);
        ctx.fillRect(-pw / 2, -phh2, pw, phh2);
        // 字（横线）
        ctx.strokeStyle = 'rgba(30,34,30,.5)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(-pw * 0.36, -phh2 * (0.75 - i * 0.2));
          ctx.lineTo(-pw * 0.36 + pw * 0.6 * (i < write * 4 ? 1 : 0.2), -phh2 * (0.75 - i * 0.2));
          ctx.stroke();
        }
        ctx.restore();
      }
      // 纸团飞向垃圾桶
      if (throwK > 0) {
        const bx = W * 0.82, by = H * 0.86;
        const kx = W * 0.48 + (bx - W * 0.48) * throwK;
        const ky = H * 0.69 + (by - H * 0.69) * throwK - Math.sin(throwK * Math.PI) * H * 0.12;
        ctx.fillStyle = 'rgba(200,202,188,.5)';
        ctx.beginPath();
        ctx.arc(kx, ky, W * 0.010 * (1 - throwK * 0.3), 0, Math.PI * 2);
        ctx.fill();
      }
      bin(W * 0.82, H * 0.86, W * 0.045);

      // 他坐着写
      person(W * 0.30, H * 0.94, H * 0.38, {
        sit: 1, lean: 0.5, headDown: 0.55,
        reach: t > 180 && crumple < 0.9 ? [W * 0.44, H * 0.70] : null
      });
    }

    if (ph.id === 'sleep') {
      // 关灯 → 只剩窗外的夜
      const dark = smooth(clamp((t - 250) / 12));
      room(t, { night: true });
      bed(W * 0.30, H * 0.58, W * 0.46, H * 0.24, 0);
      person(W * 0.40, H * 0.70, H * 0.16, { lie: 1, alpha: 0.9, color: '#0A0E0C' });
      ctx.fillStyle = 'rgba(0,0,0,' + (0.38 + dark * 0.30) + ')';
      ctx.fillRect(0, 0, W, H);
      // 窗外的城市（唯一的亮处）
      const wg2 = ctx.createLinearGradient(0, H * 0.12, 0, H * 0.48);
      wg2.addColorStop(0, 'rgba(34,54,66,' + (0.85 * (1 - dark * 0.2)) + ')');
      wg2.addColorStop(1, 'rgba(20,34,44,' + (0.7 * (1 - dark * 0.2)) + ')');
      ctx.fillStyle = wg2;
      ctx.fillRect(W * 0.06, H * 0.12, W * 0.17, H * 0.36);
      // 对面楼的窗灯
      for (let i = 0; i < 9; i++) {
        ctx.fillStyle = 'rgba(255,206,150,' + (0.10 + rnd(i * 3.7) * 0.22) + ')';
        ctx.fillRect(W * (0.075 + rnd(i * 1.9) * 0.14), H * (0.15 + rnd(i * 5.1) * 0.30), 4, 5);
      }
      // 他的轮廓
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = 'rgba(150,180,196,.55)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W * 0.40, H * 0.685);
      ctx.lineTo(W * 0.56, H * 0.685);
      ctx.stroke();
      ctx.restore();
    }

    if (ph.id === 'again') {
      // 全黑 → 闹钟又亮了
      ctx.fillStyle = '#020403';
      ctx.fillRect(0, 0, W, H);
      const k = smooth(clamp((t - 290) / 3));
      if (k > 0) {
        clockRadio(W * 0.50, H * 0.52, H * 0.10, Math.floor(t * 2) % 2 === 0, t);
      }
    }

    // 暗角
    const vg = ctx.createRadialGradient(W / 2, H * 0.5, H * 0.32, W / 2, H * 0.5, H * 1.02);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,.68)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
  }

  return { draw: draw, W: W, H: H, person: person };
})();
