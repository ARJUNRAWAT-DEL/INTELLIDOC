import { useEffect, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
//  Realistic Solar System background — 60 fps Canvas
//
//  Scene:
//    BASE    — Deep space, 550 stars (twinkling), Milky Way band, 4 nebula patches
//    SUN     — Radial corona (5 layers), rotating 8 flare spikes, surface shimmer
//    PLANETS — Mercury → Neptune with per-planet sphere shading, atmospheric rim
//    RINGS   — Saturn 3-band ring system (correct front/back painter sort)
//    MOON    — Earth moon in own tilted orbit
//    BELT    — 220 asteroid belt particles between Mars & Jupiter
//    EXTRAS  — Occasional shooting stars
// ─────────────────────────────────────────────────────────────────────────────

export default function ProfessionalBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frame = 0;
    let w = window.innerWidth;
    let h = window.innerHeight;
    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w; canvas.height = h;
    };
    resize();
    window.addEventListener('resize', resize);

    // Perspective: ecliptic plane viewed ~25 deg from top -> b = a * TILT
    const TILT = 0.42;

    // Stars
    const STARS = Array.from({ length: 550 }, (_, i) => ({
      x: (Math.abs(Math.sin(i * 137.508)) ),
      y: (Math.abs(Math.sin(i * 94.32 + i * i * 0.001))),
      r: 0.3 + (((i * 73.1) % 23) / 23) * 1.3,
      phase: (((i * 43.7) % 37) / 37) * Math.PI * 2,
      brightness: 0.3 + (((i * 127.4) % 31) / 31) * 0.7,
    }));

    // Milky Way band (35 deg diagonal)
    const MW_STARS = Array.from({ length: 320 }, (_, i) => {
      const t = i / 320;
      const spread = ((i * 73.1) % 17) / 17;
      const along = t * 1.4 - 0.2;
      const across = spread * 0.18 - 0.09;
      const br = 35 * Math.PI / 180;
      return {
        x: along * Math.cos(br) - across * Math.sin(br),
        y: 0.30 + along * Math.sin(br) + across * Math.cos(br),
        r: 0.18 + (((i * 53.3) % 13) / 13) * 0.55,
        alpha: 0.03 + (((i * 89.1) % 19) / 19) * 0.09,
      };
    });

    // Planet definitions
    const PLANETS = [
      { name: 'Mercury', orbitR: 0.115, speed: 0.0200, startAngle: 0.80, radius: 11.0, color: [169, 160, 152] as number[], glow: [200, 192, 184] as number[], hasRings: false },
      { name: 'Venus',   orbitR: 0.185, speed: 0.0157, startAngle: 2.30, radius: 20.0, color: [230, 205, 140] as number[], glow: [245, 220, 160] as number[], hasRings: false },
      { name: 'Earth',   orbitR: 0.255, speed: 0.0120, startAngle: 4.10, radius: 22.0, color: [55,  110, 195] as number[], glow: [80,  160, 230] as number[], hasRings: false },
      { name: 'Mars',    orbitR: 0.330, speed: 0.0098, startAngle: 1.40, radius: 16.0, color: [185,  82,  48] as number[], glow: [210, 110,  74] as number[], hasRings: false },
      { name: 'Jupiter', orbitR: 0.470, speed: 0.0051, startAngle: 5.20, radius: 48.0, color: [200, 170, 130] as number[], glow: [220, 195, 155] as number[], hasRings: false },
      { name: 'Saturn',  orbitR: 0.600, speed: 0.0039, startAngle: 3.50, radius: 40.0, color: [205, 190, 135] as number[], glow: [225, 210, 160] as number[], hasRings: true  },
      { name: 'Uranus',  orbitR: 0.740, speed: 0.0027, startAngle: 0.20, radius: 28.0, color: [125, 200, 210] as number[], glow: [155, 220, 230] as number[], hasRings: false },
      { name: 'Neptune', orbitR: 0.870, speed: 0.0021, startAngle: 2.80, radius: 26.0, color: [48,   82, 188] as number[], glow: [68,  112, 218] as number[], hasRings: false },
    ];
    const angles = PLANETS.map(p => p.startAngle);
    let moonAngle = 0;

    // Asteroid belt
    const ASTEROIDS = Array.from({ length: 220 }, (_, i) => ({
      angle: (i / 220) * Math.PI * 2 + (((i * 73.1) % 13) / 13) * 0.5,
      dist:  0.385 + (((i * 53.9) % 17) / 17) * 0.060,
      speed: 0.00014 + (((i * 89.4) % 23) / 23) * 0.00012,
      alpha: 0.10  + (((i * 37.1) % 11) / 11) * 0.22,
      r:     0.4   + (((i * 61.3) % 7)  / 7)  * 0.6,
    }));

    // Shooting stars
    type SS = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; r: number };
    const shots: SS[] = [];

    // Helpers
    const getPos = (idx: number, sunX: number, sunY: number, scl: number) => {
      const p = PLANETS[idx];
      const ax = p.orbitR * scl;
      return { x: sunX + Math.cos(angles[idx]) * ax, y: sunY + Math.sin(angles[idx]) * ax * TILT };
    };
    const lc = (v: number, f: number) => Math.min(255, Math.round(v * f));
    const dc = (v: number, f: number) => Math.round(v * f);

    const drawSphere = (px: number, py: number, r: number, col: number[], name: string) => {
      ctx.globalCompositeOperation = 'source-over';
      const g = ctx.createRadialGradient(px - r * 0.30, py - r * 0.28, r * 0.05, px + r * 0.1, py + r * 0.1, r);
      const [rc, gc, bc] = col;
      if (name === 'Earth') {
        g.addColorStop(0,    'rgba(160,220,255,1)');
        g.addColorStop(0.25, 'rgba(90,160,230,1)');
        g.addColorStop(0.55, 'rgba(55,110,195,1)');
        g.addColorStop(0.78, 'rgba(28,68,128,1)');
        g.addColorStop(1,    'rgba(7,20,52,1)');
      } else if (name === 'Jupiter') {
        g.addColorStop(0,    'rgba(235,215,180,1)');
        g.addColorStop(0.22, 'rgba(200,155,110,1)');
        g.addColorStop(0.42, 'rgba(222,192,148,1)');
        g.addColorStop(0.62, 'rgba(185,135,90,1)');
        g.addColorStop(0.82, 'rgba(160,108,68,1)');
        g.addColorStop(1,    'rgba(88,52,28,1)');
      } else if (name === 'Venus') {
        g.addColorStop(0,    'rgba(255,245,200,1)');
        g.addColorStop(0.4,  `rgba(${rc},${gc},${bc},1)`);
        g.addColorStop(0.8,  `rgba(${dc(rc,0.55)},${dc(gc,0.55)},${dc(bc,0.55)},1)`);
        g.addColorStop(1,    `rgba(${dc(rc,0.18)},${dc(gc,0.18)},${dc(bc,0.18)},1)`);
      } else {
        g.addColorStop(0,    `rgba(${lc(rc,1.45)},${lc(gc,1.45)},${lc(bc,1.45)},1)`);
        g.addColorStop(0.35, `rgba(${rc},${gc},${bc},1)`);
        g.addColorStop(0.72, `rgba(${dc(rc,0.5)},${dc(gc,0.5)},${dc(bc,0.5)},1)`);
        g.addColorStop(1,    `rgba(${dc(rc,0.14)},${dc(gc,0.14)},${dc(bc,0.14)},1)`);
      }
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
      ctx.globalCompositeOperation = 'lighter';
      const rim = ctx.createRadialGradient(px, py, r * 0.78, px, py, r * 1.20);
      rim.addColorStop(0,    `rgba(${col[0]},${col[1]},${col[2]},0)`);
      rim.addColorStop(0.65, `rgba(${lc(col[0],1.3)},${lc(col[1],1.3)},${lc(col[2],1.3)},0.07)`);
      rim.addColorStop(1,    `rgba(${col[0]},${col[1]},${col[2]},0)`);
      ctx.fillStyle = rim;
      ctx.beginPath(); ctx.arc(px, py, r * 1.20, 0, Math.PI * 2); ctx.fill();
    };

    const drawGlow = (px: number, py: number, r: number, gc: number[]) => {
      ctx.globalCompositeOperation = 'lighter';
      const gr = r * 4.2;
      const gg = ctx.createRadialGradient(px, py, r * 0.5, px, py, gr);
      gg.addColorStop(0,   `rgba(${gc[0]},${gc[1]},${gc[2]},0.20)`);
      gg.addColorStop(0.4, `rgba(${gc[0]},${gc[1]},${gc[2]},0.07)`);
      gg.addColorStop(1,   `rgba(${gc[0]},${gc[1]},${gc[2]},0)`);
      ctx.fillStyle = gg;
      ctx.beginPath(); ctx.arc(px, py, gr, 0, Math.PI * 2); ctx.fill();
    };

    const drawSaturnRing = (px: number, py: number, r: number, front: boolean) => {
      const bands = [
        { inner: r * 1.28, outer: r * 1.58, alpha: front ? 0.60 : 0.42, col: [220, 205, 155] as number[] },
        { inner: r * 1.62, outer: r * 1.98, alpha: front ? 0.50 : 0.34, col: [205, 185, 130] as number[] },
        { inner: r * 2.02, outer: r * 2.28, alpha: front ? 0.34 : 0.22, col: [192, 170, 118] as number[] },
      ];
      bands.forEach(band => {
        const oAy = band.outer * TILT * 0.5;
        const iAy = band.inner * TILT * 0.5;
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = band.alpha;
        ctx.beginPath();
        if (front) {
          ctx.ellipse(px, py, band.outer, oAy, 0, 0, Math.PI);
          ctx.ellipse(px, py, band.inner, iAy, 0, Math.PI, 0, true);
        } else {
          ctx.ellipse(px, py, band.outer, oAy, 0, Math.PI, Math.PI * 2);
          ctx.ellipse(px, py, band.inner, iAy, 0, Math.PI * 2, Math.PI, true);
        }
        ctx.closePath();
        ctx.fillStyle = `rgba(${band.col[0]},${band.col[1]},${band.col[2]},1)`;
        ctx.fill();
        ctx.restore();
      });
    };

    // RENDER
    const render = () => {
      frame++;
      const time = frame * 0.004;
      const isPortrait = h > w;
      const scl  = isPortrait
        ? Math.min(w, h) * 0.62          // portrait: fill ~62% of shorter side
        : Math.max(Math.min(w * 0.43, h * 0.75), Math.min(w, h) * 0.70);
      const sunX = w * 0.50;
      // Portrait: center at 42% so system fills upper screen; landscape: 47% so it covers full page
      const sunY = isPortrait ? h * 0.42 : h * 0.47;

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#00030b';
      ctx.fillRect(0, 0, w, h);

      // Milky Way
      ctx.globalCompositeOperation = 'source-over';
      MW_STARS.forEach(st => {
        ctx.globalAlpha = st.alpha;
        ctx.fillStyle = 'rgba(220,230,255,1)';
        ctx.beginPath(); ctx.arc(st.x * w, st.y * h, st.r, 0, Math.PI * 2); ctx.fill();
      });

      // Stars
      STARS.forEach(st => {
        const alpha = st.brightness * (0.38 + 0.30 * Math.sin(time * 0.55 + st.phase));
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = alpha;
        ctx.fillStyle = st.r > 1.1 ? 'rgba(240,245,255,1)' : 'rgba(200,215,255,1)';
        ctx.beginPath(); ctx.arc(st.x * w, st.y * h, st.r, 0, Math.PI * 2); ctx.fill();
        if (st.brightness > 0.78 && st.r > 1.1) {
          ctx.globalAlpha = alpha * 0.35;
          ctx.strokeStyle = 'rgba(240,245,255,1)';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(st.x * w - st.r * 4, st.y * h); ctx.lineTo(st.x * w + st.r * 4, st.y * h);
          ctx.moveTo(st.x * w, st.y * h - st.r * 4); ctx.lineTo(st.x * w, st.y * h + st.r * 4);
          ctx.stroke();
        }
      });

      // Nebulae
      ctx.globalCompositeOperation = 'lighter';
      const nebS = Math.max(0.4, Math.min(1.0, w / 1440));
      ([
        { x: 0.18, y: 0.14, r: 250 * nebS, c: [60, 15, 100] },
        { x: 0.85, y: 0.22, r: 210 * nebS, c: [15, 35, 90]  },
        { x: 0.80, y: 0.82, r: 200 * nebS, c: [70, 18, 58]  },
        { x: 0.11, y: 0.78, r: 165 * nebS, c: [20, 50, 95]  },
      ] as { x: number; y: number; r: number; c: number[] }[]).forEach(nb => {
        const ng = ctx.createRadialGradient(nb.x * w, nb.y * h, 0, nb.x * w, nb.y * h, nb.r);
        ng.addColorStop(0,    `rgba(${nb.c[0]},${nb.c[1]},${nb.c[2]},0.055)`);
        ng.addColorStop(0.45, `rgba(${nb.c[0]},${nb.c[1]},${nb.c[2]},0.024)`);
        ng.addColorStop(1,    `rgba(${nb.c[0]},${nb.c[1]},${nb.c[2]},0)`);
        ctx.fillStyle = ng;
        ctx.beginPath(); ctx.arc(nb.x * w, nb.y * h, nb.r, 0, Math.PI * 2); ctx.fill();
      });

      // Orbital paths
      ctx.globalCompositeOperation = 'source-over';
      PLANETS.forEach(p => {
        const ax = p.orbitR * scl;
        ctx.globalAlpha = 0.06;
        ctx.strokeStyle = 'rgba(160,190,245,1)';
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.ellipse(sunX, sunY, ax, ax * TILT, 0, 0, Math.PI * 2); ctx.stroke();
      });

      // Asteroid belt
      ctx.globalCompositeOperation = 'source-over';
      ASTEROIDS.forEach(ast => {
        ast.angle += ast.speed;
        const ax = ast.dist * scl;
        const x2 = sunX + Math.cos(ast.angle) * ax;
        const y2 = sunY + Math.sin(ast.angle) * ax * TILT;
        ctx.globalAlpha = ast.alpha * 0.48;
        ctx.fillStyle = 'rgba(195,190,178,1)';
        ctx.beginPath(); ctx.arc(x2, y2, ast.r, 0, Math.PI * 2); ctx.fill();
      });

      // Sun corona
      const sunR = scl * 0.104;
      ctx.globalCompositeOperation = 'lighter';
      ([
        { r: scl * 0.112, a: 0.024 },
        { r: scl * 0.076, a: 0.042 },
        { r: scl * 0.054, a: 0.070 },
        { r: scl * 0.037, a: 0.125 },
        { r: scl * 0.022, a: 0.240 },
      ] as { r: number; a: number }[]).forEach(cl => {
        const sg = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, cl.r);
        sg.addColorStop(0,    `rgba(255,238,155,${cl.a * 1.8})`);
        sg.addColorStop(0.38, `rgba(255,172,50,${cl.a})`);
        sg.addColorStop(0.72, `rgba(255,92,22,${cl.a * 0.35})`);
        sg.addColorStop(1,    'rgba(255,50,0,0)');
        ctx.fillStyle = sg;
        ctx.beginPath(); ctx.arc(sunX, sunY, cl.r, 0, Math.PI * 2); ctx.fill();
      });
      // 8 flare spikes
      for (let si = 0; si < 8; si++) {
        const ang = (si / 8) * Math.PI * 2 + time * 0.14;
        const len = sunR * (2.3 + 0.65 * Math.sin(time * 2.2 + si * 1.7));
        const x2  = sunX + Math.cos(ang) * len;
        const y2  = sunY + Math.sin(ang) * len;
        ctx.globalAlpha = 0.038 + 0.018 * Math.sin(time * 1.8 + si * 2.1);
        const flr = ctx.createLinearGradient(sunX, sunY, x2, y2);
        flr.addColorStop(0, 'rgba(255,230,100,1)'); flr.addColorStop(1, 'rgba(255,130,20,0)');
        ctx.strokeStyle = flr;
        ctx.lineWidth = 1.4 + Math.sin(time * 1.2 + si) * 0.7;
        ctx.beginPath(); ctx.moveTo(sunX, sunY); ctx.lineTo(x2, y2); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      // Sun surface
      ctx.globalCompositeOperation = 'source-over';
      const sunGrd = ctx.createRadialGradient(sunX - sunR * 0.28, sunY - sunR * 0.22, 0, sunX, sunY, sunR);
      sunGrd.addColorStop(0,    'rgba(255,252,215,1)');
      sunGrd.addColorStop(0.28, 'rgba(255,228,118,1)');
      sunGrd.addColorStop(0.60, 'rgba(255,168,32,1)');
      sunGrd.addColorStop(0.85, 'rgba(232,98,12,1)');
      sunGrd.addColorStop(1,    'rgba(175,50,4,1)');
      ctx.fillStyle = sunGrd;
      ctx.beginPath(); ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2); ctx.fill();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.10 + 0.06 * Math.sin(time * 4.0);
      const shim = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 0.85);
      shim.addColorStop(0, 'rgba(255,252,200,1)'); shim.addColorStop(1, 'rgba(255,200,80,0)');
      ctx.fillStyle = shim;
      ctx.beginPath(); ctx.arc(sunX, sunY, sunR * 0.85, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;

      // Advance angles
      PLANETS.forEach((p, i) => { angles[i] += p.speed * 0.16; });
      moonAngle += 0.022;

      // Responsive planet scale — 810 is the reference scl at ~1920×1080 desktop
      const rScale = Math.min(1.5, Math.max(0.15, scl / 810));

      // Planets (painter sort by y)
      const pdata = PLANETS.map((p, i) => ({ ...p, pos: getPos(i, sunX, sunY, scl) }));
      pdata.sort((a, b) => a.pos.y - b.pos.y);

      pdata.forEach(pd => {
        const { pos, radius, name, color, glow, hasRings } = pd;
        const effectiveR = Math.max(2, radius * rScale);
        drawGlow(pos.x, pos.y, effectiveR, glow);
        if (hasRings) drawSaturnRing(pos.x, pos.y, effectiveR, false);
        drawSphere(pos.x, pos.y, effectiveR, color, name);
        if (hasRings) drawSaturnRing(pos.x, pos.y, effectiveR, true);
        if (name === 'Earth') {
          const mx = pos.x + Math.cos(moonAngle) * effectiveR * 3.0;
          const my = pos.y + Math.sin(moonAngle) * effectiveR * 3.0 * TILT;
          const moonR = Math.max(1, 2.2 * rScale);
          drawGlow(mx, my, moonR, [210, 205, 200]);
          drawSphere(mx, my, moonR, [200, 195, 188], 'Moon');
        }
        if (name !== 'Mercury') {
          ctx.globalCompositeOperation = 'source-over';
          ctx.save();
          ctx.globalAlpha = 0.22;
          ctx.font = `400 ${Math.max(8, Math.round(scl * 0.010))}px ui-sans-serif,system-ui,sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillStyle = 'rgba(195,215,255,1)';
          ctx.fillText(name, pos.x, pos.y + effectiveR + Math.max(5, Math.round(13 * rScale)));
          ctx.restore();
        }
      });

      // Shooting stars
      if (Math.random() < 0.004 && shots.length < 3) {
        const ang = 0.3 + Math.random() * 0.6;
        const spd = 8 + Math.random() * 10;
        shots.push({ x: Math.random() * w, y: Math.random() * h * 0.45,
          vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
          life: 0, maxLife: 45 + Math.random() * 40, r: 0.6 + Math.random() * 0.8 });
      }
      for (let i = shots.length - 1; i >= 0; i--) {
        const ss = shots[i];
        ss.x += ss.vx; ss.y += ss.vy; ss.life++;
        if (ss.life > ss.maxLife) { shots.splice(i, 1); continue; }
        const p2 = ss.life / ss.maxLife;
        const alpha = p2 < 0.2 ? p2 / 0.2 : p2 > 0.7 ? (1 - p2) / 0.3 : 1;
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = alpha * 0.72;
        const trl = ctx.createLinearGradient(ss.x, ss.y, ss.x - ss.vx * 14, ss.y - ss.vy * 14);
        trl.addColorStop(0, 'rgba(255,255,255,1)'); trl.addColorStop(1, 'rgba(200,220,255,0)');
        ctx.strokeStyle = trl; ctx.lineWidth = ss.r;
        ctx.beginPath(); ctx.moveTo(ss.x, ss.y); ctx.lineTo(ss.x - ss.vx * 14, ss.y - ss.vy * 14); ctx.stroke();
      }

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(render);
    };
    render();

    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animId); };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 -z-20 pointer-events-none" style={{ display: 'block' }} />
      <div className="fixed inset-0 pointer-events-none -z-10" style={{
        background: 'radial-gradient(ellipse 160% 150% at 50% 47%, transparent 30%, rgba(0,3,11,0.45) 100%)',
      }} />
    </>
  );
}
