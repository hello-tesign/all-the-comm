// 국문 HOME 스크롤 스토리 엔진. 외부 라이브러리 없이 스크롤 진행률로 장면을 계산합니다.
// 모바일(760px 이하)과 동작 줄이기에서는 장면 계산을 멈추고 완성 상태를 그립니다.
export function initStory() {
  const root = document.querySelector('[data-story]');
  if (!root) return () => {};
  const $ = (s, r = root) => r.querySelector(s), $$ = (s, r = root) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const lerp = (a, b, t) => a + (b - a) * t;
  const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const isMobile = () => innerWidth <= 760;
  const staticMode = () => reducedQuery.matches || isMobile();
  const cleanups = [];
  const on = (target, type, fn, opts) => { target.addEventListener(type, fn, opts); cleanups.push(() => target.removeEventListener(type, fn, opts)); };
  const SVG = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs = {}, parent) => { const el = document.createElementNS(SVG, tag); for (const k in attrs) el.setAttribute(k, attrs[k]); parent?.appendChild(el); return el; };

  /* ---------- split words ---------- */
  $$('[data-st-words]').forEach(el => {
    if (el.dataset.split) return; el.dataset.split = '1';
    let i = 0;
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(w => {
          if (!w) return;
          if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(' ')); return; }
          const o = document.createElement('span'); o.className = 'sw';
          const inner = document.createElement('span'); inner.textContent = w; inner.style.setProperty('--i', i++);
          o.appendChild(inner); frag.appendChild(o);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
    walk(el);
  });

  /* ---------- reveal + count up ---------- */
  const counted = new WeakSet();
  const countUp = el => {
    if (counted.has(el)) return; counted.add(el);
    const to = +el.dataset.stCount, t0 = performance.now(), dur = reducedQuery.matches ? 1 : 1400;
    const f = now => { const k = ease(clamp((now - t0) / dur)); el.textContent = Math.round(to * k); if (k < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  };
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in'); $$('[data-st-count]', e.target).forEach(countUp); io.unobserve(e.target);
  }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  $$('.st-rv,[data-st-words],.st-nums').forEach(el => io.observe(el));
  cleanups.push(() => io.disconnect());

  /* ---------- 04 services sentence: pick words, carry them into the enquiry ---------- */
  const words = $$('.st-word'), rows = $$('.st-svc-row'), pick = $('[data-st-pick]');
  const pickN = $('[data-st-pick-n]'), pickT = $('[data-st-pick-t]'), pickGo = $('[data-st-pick-go]');
  const pickDefault = pickT?.textContent;
  const showService = id => { rows.forEach(r => { r.hidden = r.dataset.for !== id; }); words.forEach(w => w.classList.toggle('is-active', w.dataset.id === id)); };
  const updatePick = () => {
    const sel = words.filter(w => w.getAttribute('aria-pressed') === 'true');
    pickN.textContent = sel.length;
    pickT.textContent = sel.length ? sel.map(w => w.lastChild.textContent).join(' · ') : pickDefault;
    pickGo.href = sel.length ? '/contact/?services=' + sel.map(w => w.dataset.id).join(',') : '/contact/';
    pick.classList.toggle('has', sel.length > 0);
  };
  words.forEach(w => {
    on(w, 'click', () => { w.setAttribute('aria-pressed', String(w.getAttribute('aria-pressed') !== 'true')); showService(w.dataset.id); updatePick(); });
    on(w, 'mouseenter', () => showService(w.dataset.id));
    on(w, 'focus', () => showService(w.dataset.id));
  });
  if (words.length) showService(words[0].dataset.id);

  /* ---------- scene refs ---------- */
  const S = {}; $$('[data-scene]').forEach(el => { S[el.dataset.scene] = el; });
  const hud = $('.st-hud'), progBar = $('.st-prog'), chapN = $('[data-st-chapn]'), chapT = $('[data-st-chapt]');
  const chapters = $$('[data-chapter]');
  const heroGrid = $('.st-hero-grid'), heroEnd = $('.st-hero-end'), mark = $('.st-mark');
  const painRows = $$('.st-pain-row');
  const caseBg = $('.st-case-bg'), beats = $$('.st-beat'), week = $('[data-st-week]');
  const rBase = $('#st-route-path'), rLive = $('.st-route-live'), carDot = $('.st-cardot'), wps = $$('.st-wp');
  const phr = $$('.st-phr li'), panes = $$('.st-pane'), nodes = $$('.st-node'), wheel = $('.st-wheel');
  const maniMark = $('.st-mani-mark'), maniWords = $('.st-mani-words'), mw = $$('.st-mani-words span');
  const levels = $$('.st-level'), growMarks = $$('.st-g');

  /* ---------- 01 hero: where the mark must travel to cover the screen ---------- */
  const measureHero = () => {
    if (!mark) return;
    const prev = heroGrid.style.getPropertyValue('--e');
    heroGrid.style.setProperty('--e', 0);
    const r = mark.getBoundingClientRect(), sticky = S.hero.querySelector('.st-sticky').getBoundingClientRect();
    heroGrid.style.setProperty('--e', prev || 0);
    const cx = r.left + r.width / 2, cy = r.top - sticky.top + r.height / 2;
    mark.style.setProperty('--dx', (innerWidth / 2 - cx).toFixed(1) + 'px');
    mark.style.setProperty('--dy', (innerHeight / 2 - cy).toFixed(1) + 'px');
    mark.style.setProperty('--ms', (Math.hypot(innerWidth, innerHeight) / r.width * 1.08).toFixed(3));
  };

  /* ---------- 03 tangle: six vendors drawn as crossing lines, then one team ---------- */
  const net = $('[data-st-net]');
  const vendorsA = ['디자인 업체', '광고 대행사', '홍보 대행사', '영상 제작사', '웹 개발사', '인플루언서 에이전시'];
  const vendorsB = ['디자인·콘텐츠', '디지털 광고', '언론홍보', '영상', '웹·IT', '인플루언서'];
  const costs = ['메시지 불일치', '중복 제작비', '소통 지연', '일정 충돌', '보고 공백', '기회 손실'];
  const off1 = [-210, 170, -90, 230, -250, 60], off2 = [120, -90, 150, -170, 100, -120], off4 = [90, -80, 70, -40, 120, -100];
  let netState = null;
  const buildNet = vertical => {
    if (!net) return;
    const L = vertical
      ? { w: 600, h: 900, C: [300, 64], H: [300, 420], V: i => [75 + i * 90, 770], mid: [[470, 300], [130, 240], [430, 540], [150, 590], [520, 190], [250, 650]] }
      : { w: 1200, h: 560, C: [110, 280], H: [600, 280], V: i => [1010, 58 + i * 89], mid: [[720, 440], [470, 110], [840, 250], [400, 470], [650, 80], [560, 350]] };
    net.innerHTML = ''; net.setAttribute('viewBox', `0 0 ${L.w} ${L.h}`);
    const gLines = svgEl('g', {}, net), gCosts = svgEl('g', {}, net), gNodes = svgEl('g', {}, net);
    const lines = vendorsA.map(() => svgEl('path', { class: 'net-line', pathLength: 1, 'stroke-dasharray': 1 }, gLines));
    const vend = vendorsA.map((name, i) => {
      const [x, y] = L.V(i); const g = svgEl('g', { class: 'net-node' }, gNodes);
      svgEl('circle', { cx: x, cy: y, r: vertical ? 11 : 9 }, g);
      const t = svgEl('text', vertical ? { x, y: y + 34 + (i % 2) * 30, 'text-anchor': 'middle', style: 'font-size:19px' } : { x: x + 22, y }, g); t.textContent = name;
      return t;
    });
    const client = svgEl('g', { class: 'net-node net-client' }, gNodes);
    svgEl('circle', { cx: L.C[0], cy: L.C[1], r: vertical ? 50 : 48 }, client);
    svgEl('text', { x: L.C[0], y: L.C[1] }, client).textContent = '우리 회사';
    const hub = svgEl('g', { class: 'net-hub' }, gNodes);
    svgEl('circle', { class: 'ring', cx: 0, cy: 0, r: 92 }, hub); svgEl('circle', { cx: 0, cy: 0, r: 70 }, hub);
    svgEl('text', { x: 0, y: -8 }, hub).textContent = '올더커뮤니케이션';
    const sub = svgEl('text', { class: 'sub', x: 0, y: 16 }, hub); sub.textContent = '전담 창구 · 한 팀';
    const costEls = costs.map((c, i) => {
      const g = svgEl('g', { class: 'net-cost' }, gCosts); const w = c.length * 15 + 26;
      svgEl('rect', { x: -w / 2, y: -15, width: w, height: 30, rx: 15 }, g); svgEl('text', { x: 0, y: 1 }, g).textContent = c;
      g.setAttribute('transform', `translate(${L.mid[i][0]} ${L.mid[i][1]})`); return g;
    });
    netState = { L, vertical, lines, vend, hub, costEls, b: null };
  };
  const drawNet = p => {
    if (!netState) return;
    const { L, vertical, lines, vend, hub, costEls } = netState;
    const m = ease(seg(p, .5, .82));
    lines.forEach((path, i) => {
      const [cx, cy] = L.C, [hx, hy] = L.H, [vx, vy] = L.V(i), [mx, my] = L.mid[i];
      const T = vertical
        ? [[cx + off1[i] * .8, cy + 180], [mx + off2[i], my - 140], [mx, my], [mx - off2[i], my + 140], [vx + off4[i] * .6, vy - 160]]
        : [[cx + 220, cy + off1[i]], [mx - 160, my + off2[i]], [mx, my], [mx + 160, my - off2[i]], [vx - 200, vy + off4[i]]];
      const B = vertical
        ? [[cx, cy + (hy - cy) * .33], [hx, hy - (hy - cy) * .33], [hx, hy], [hx, hy + 150], [vx, vy - 210]]
        : [[cx + (hx - cx) * .33, cy], [hx - (hx - cx) * .33, hy], [hx, hy], [hx + 170, hy], [vx - 230, vy]];
      const P = T.map((pt, k) => [lerp(pt[0], B[k][0], m), lerp(pt[1], B[k][1], m)]);
      path.setAttribute('d', `M${cx} ${cy}C${P[0]} ${P[1]} ${P[2]}C${P[3]} ${P[4]} ${vx} ${vy}`);
      path.style.strokeDashoffset = (1 - seg(p, .02 + i * .04, .2 + i * .04)).toFixed(3);
      costEls[i].style.opacity = Math.min(seg(p, .1 + i * .04, .18 + i * .04), 1 - seg(p, .42, .52)).toFixed(3);
    });
    const hs = ease(seg(p, .52, .74));
    hub.setAttribute('transform', `translate(${L.H[0]} ${L.H[1]}) scale(${hs.toFixed(3)})`);
    const b = m > .5;
    if (netState.b !== b) { netState.b = b; S.tangle.classList.toggle('is-b', b); vend.forEach((t, i) => { t.textContent = (b ? vendorsB : vendorsA)[i]; }); }
  };

  /* ---------- 05 case route ---------- */
  let rLen = 0;
  const placeRoute = () => {
    if (!rBase) return;
    rLen = rBase.getTotalLength(); rLive.style.strokeDasharray = rLen;
    wps.forEach(w => { const pt = rBase.getPointAtLength(rLen * +w.dataset.at); w.style.left = (pt.x / 12) + '%'; w.style.top = (pt.y / 3) + '%'; });
  };
  const moveCar = d => { const pt = rBase.getPointAtLength(rLen * d); carDot.style.left = (pt.x / 12) + '%'; carDot.style.top = (pt.y / 3) + '%'; };

  /* ---------- 06 gallery: 3D corridor + flip ---------- */
  const gItems = $$('.sc-item'), gCount = gItems.length;
  const gTitle = $('[data-sc-title]'), gType = $('[data-sc-type]'), gCounter = $('[data-sc-count]');
  const meta = gItems.map(it => ({ title: it.querySelector('.sc-back h3').textContent, type: it.querySelector('.sc-back small').textContent }));
  let gCur = 0, gPos = 0;
  const setFlip = (it, flip, focus = false) => {
    it.classList.toggle('flipped', flip);
    const front = it.querySelector('.sc-turn'), back = it.querySelector('.sc-back');
    front.setAttribute('aria-pressed', String(flip)); front.tabIndex = flip ? -1 : 0;
    back.setAttribute('aria-hidden', String(!flip));
    back.querySelectorAll('a,button').forEach(el => { el.tabIndex = flip ? 0 : -1; });
    if (focus) (flip ? back.querySelector('a') : front).focus({ preventScroll: true });
  };
  const setCurrent = i => {
    if (gCur === i) return; gCur = i;
    gItems.forEach((it, k) => { if (k !== i && it.classList.contains('flipped')) setFlip(it, false); });
    gTitle.textContent = meta[i].title; gType.textContent = meta[i].type;
    gCounter.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(gCount).padStart(2, '0');
  };
  const layoutGallery = c => {
    const W = gItems[0].offsetWidth;
    gItems.forEach((it, i) => {
      const o = i - c, a = Math.abs(o), s = Math.sign(o);
      // a near-flat filmstrip: neighbours sit beside the centre instead of folding behind it
      const x = s * (Math.min(a, 1) * W * 1.12 + Math.max(a - 1, 0) * W * 1.1);
      const z = -(Math.min(a, 1) * 160 + Math.max(a - 1, 0) * 120);
      const ry = -s * (Math.min(a, 1) * 12 + Math.max(a - 1, 0) * 3);
      it.style.transform = `translate3d(${x.toFixed(1)}px,0,${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg)`;
      it.style.setProperty('--dim', Math.min(.6, a * .24).toFixed(3));
      it.style.zIndex = String(1000 - Math.round(a * 100));
      it.style.visibility = a > 4.6 ? 'hidden' : 'visible';
      it.classList.toggle('center', a < .5);
    });
  };
  const galleryTarget = i => { const el = S.gallery; const top = el.getBoundingClientRect().top + scrollY; const tot = el.offsetHeight - innerHeight; return top + tot * (.05 + (i / (gCount - 1)) * .9); };
  const goTo = i => {
    i = clamp(i, 0, gCount - 1);
    if (staticMode()) { setCurrent(i); if (isMobile()) gItems[i].scrollIntoView({ inline: 'center', block: 'nearest', behavior: reducedQuery.matches ? 'auto' : 'smooth' }); return; }
    scrollTo({ top: galleryTarget(i), behavior: reducedQuery.matches ? 'auto' : 'smooth' });
  };
  gItems.forEach((it, i) => {
    on(it.querySelector('.sc-turn'), 'click', () => {
      if (!staticMode() && i !== gCur) { goTo(i); return; }
      const flip = () => { setCurrent(i); setFlip(it, !it.classList.contains('flipped'), true); };
      // mid-transition: settle the corridor on this work first, then turn it
      if (!staticMode() && Math.abs(gPos - i) > .04) { goTo(i); setTimeout(flip, reducedQuery.matches ? 0 : 650); } else flip();
    });
    on(it.querySelector('.sc-unturn'), 'click', () => setFlip(it, false, true));
  });
  const prevBtn = $('[data-sc-prev]'), nextBtn = $('[data-sc-next]');
  prevBtn && on(prevBtn, 'click', () => goTo(gCur - 1));
  nextBtn && on(nextBtn, 'click', () => goTo(gCur + 1));
  S.gallery && on(S.gallery, 'keydown', e => {
    if (e.target.closest('.sc-back')) { if (e.key === 'Escape') { const it = e.target.closest('.sc-item'); setFlip(it, false, true); } return; }
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); goTo(gCur + (e.key === 'ArrowRight' ? 1 : -1)); }
  });

  const prog = el => { const r = el.getBoundingClientRect(); const tot = el.offsetHeight - innerHeight; return tot > 0 ? clamp(-r.top / tot) : (r.top < innerHeight ? 1 : 0); };
  let last = {};

  const finalState = () => {
    heroGrid?.style.removeProperty('--e'); heroEnd?.style.removeProperty('--end');
    painRows.forEach(r => { r.style.setProperty('--s', 1); r.style.setProperty('--a', 1); });
    buildNet(isMobile()); drawNet(1);
    beats.forEach(b => b.classList.add('on')); if (week) week.textContent = 'W+12';
    if (rLive) rLive.style.strokeDashoffset = 0; wps.forEach(w => w.classList.add('on')); if (rBase) moveCar(1);
    gItems.forEach(it => { it.style.transform = ''; it.style.removeProperty('--dim'); it.style.zIndex = ''; it.style.visibility = ''; it.classList.remove('center'); });
    phr.forEach(s => s.classList.add('on')); panes.forEach(s => s.classList.add('on')); nodes.forEach(s => s.classList.add('done'));
    wheel?.style.setProperty('--wp', 0);
    mw.forEach(w => w.classList.add('lit')); maniWords?.classList.remove('dark');
    levels.forEach(l => l.classList.add('on')); growMarks.forEach(g => g.classList.add('on'));
    hud?.classList.remove('on');
  };

  function frame() {
    if (staticMode()) { const key = isMobile() ? 'm' : 'r'; if (last.static !== key) { last = { static: key }; finalState(); } return; }
    if (last.static) {
      last = {}; buildNet(false); measureHero();
      [beats, phr, panes].forEach(list => list.forEach(x => x.classList.remove('on')));
      nodes.forEach(s => s.classList.remove('done')); mw.forEach(w => w.classList.remove('lit'));
    }
    const H = document.documentElement.scrollHeight - innerHeight;
    progBar.style.setProperty('--p', clamp(scrollY / H).toFixed(4));
    const rr = root.getBoundingClientRect();
    const pinned = Object.entries(S).some(([k, el]) => { if (k === 'hero') return false; const r = el.getBoundingClientRect(); return r.top <= 1 && r.bottom >= innerHeight - 1; });
    hud.classList.toggle('on', pinned && rr.bottom > innerHeight * .6);
    for (let i = chapters.length - 1; i >= 0; i--) {
      if (chapters[i].getBoundingClientRect().top <= innerHeight * .5) {
        const [n, t] = chapters[i].dataset.chapter.split('|');
        if (chapN.textContent !== n) { chapN.textContent = n; chapT.textContent = t; }
        break;
      }
    }

    // 01 HERO — copy lifts away; the logo-shaped window travels to centre and opens over the screen
    { const p = prog(S.hero); const e = ease(seg(p, 0, .6));
      heroGrid.style.setProperty('--e', e.toFixed(4));
      heroEnd.style.setProperty('--end', seg(p, .55, .8).toFixed(3)); }

    // 02 WHY — each worry is struck through, then answered
    { const p = prog(S.why);
      painRows.forEach((r, k) => { const t = seg(p, .06 + k * .27, .3 + k * .27);
        r.style.setProperty('--s', ease(seg(t, 0, .5)).toFixed(3)); r.style.setProperty('--a', ease(seg(t, .4, 1)).toFixed(3)); }); }

    // 03 TANGLE
    drawNet(prog(S.tangle));

    // 05 CASE — route, waypoints, project clock, beats
    { const p = prog(S.case); caseBg.style.setProperty('--c', p.toFixed(3));
      const d = seg(p, .06, .86); rLive.style.strokeDashoffset = (rLen * (1 - d)).toFixed(1); moveCar(d);
      wps.forEach(w => w.classList.toggle('on', d >= +w.dataset.at - .001 && p > .04));
      const wk = 1 + Math.round(d * 11); if (last.wk !== wk) { week.textContent = 'W+' + wk; last.wk = wk; }
      const b = p < .28 ? 0 : p < .5 ? 1 : p < .72 ? 2 : 3; if (last.b !== b) { beats.forEach((x, i) => x.classList.toggle('on', i === b)); last.b = b; } }

    // 06 GALLERY — corridor follows scroll, the nearest work comes to the front
    if (S.gallery) { const p = prog(S.gallery); const raw = seg(p, .05, .95) * (gCount - 1); const i0 = Math.floor(raw);
      const c = i0 + ease(clamp((raw - i0 - .22) / .56)); // each work dwells facing front before the corridor moves on
      gPos = c; layoutGallery(c); setCurrent(Math.round(c));
      S.gallery.querySelector('.sc-glow').style.setProperty('--gl', (.5 + .5 * Math.sin(p * Math.PI)).toFixed(3)); }

    // 07 CYCLE
    { const p = prog(S.cycle); const a = Math.min(3, Math.floor(seg(p, .04, .96) * 4));
      wheel.style.setProperty('--wp', (100 - seg(p, .02, .96) * 100).toFixed(2));
      if (last.cy !== a) { last.cy = a; phr.forEach((s, i) => s.classList.toggle('on', i === a)); panes.forEach((s, i) => s.classList.toggle('on', i === a)); nodes.forEach((s, i) => { s.classList.toggle('on', i === a); s.classList.toggle('done', i < a); }); } }

    // 08 MANIFESTO — words light up, then the mark rises and fills the frame
    { const p = prog(S.mani); const n = mw.length; const lit = seg(p, .02, .32) * n;
      mw.forEach((w, i) => w.classList.toggle('lit', lit > i + .2));
      const ge = ease(seg(p, .36, .74));
      maniMark.style.setProperty('--s', (.3 + 3.3 * ge).toFixed(4));
      maniMark.style.setProperty('--ty', ((1 - ge) * 40).toFixed(2) + 'svh');
      maniMark.style.setProperty('--o', seg(p, .3, .4).toFixed(3));
      maniWords.classList.toggle('dark', p > .58); }

    // 10 GROW — engagement levels grow from the corner of the mark
    { const p = prog(S.grow); const L = p < .3 ? 1 : p < .62 ? 2 : 3;
      if (last.L !== L) { last.L = L; levels.forEach((l, i) => l.classList.toggle('on', i < L)); growMarks.forEach(g => g.classList.toggle('on', +g.className.match(/g(\d)/)[1] <= L)); } }
  }

  let queued = false;
  const req = () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; frame(); }); } };
  on(window, 'scroll', req, { passive: true });
  on(window, 'resize', () => { last = {}; placeRoute(); if (!staticMode()) { buildNet(false); measureHero(); } req(); });
  const onReduce = () => { last = {}; req(); };
  reducedQuery.addEventListener?.('change', onReduce); cleanups.push(() => reducedQuery.removeEventListener?.('change', onReduce));
  placeRoute();
  if (!staticMode()) { buildNet(false); measureHero(); }
  gItems.forEach(it => setFlip(it, false));
  document.fonts?.ready.then(() => { last = {}; if (!staticMode()) measureHero(); req(); });
  root.classList.add('st-ready');
  frame();
  return () => cleanups.forEach(f => f());
}
