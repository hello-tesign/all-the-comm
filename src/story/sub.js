// 국문 하위 페이지 상호작용: 단어 등장, 서비스 색인, 과정 레일. 외부 라이브러리를 쓰지 않습니다.
export function initSub() {
  const root = document.querySelector('[data-sub]');
  if (!root) return () => {};
  const $$ = (s, r = root) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cleanups = [];
  const on = (t, type, fn, o) => { t.addEventListener(type, fn, o); cleanups.push(() => t.removeEventListener(type, fn, o)); };

  // split words for section titles
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
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
    walk(el);
  });
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  $$('.st-rv,[data-st-words]').forEach(el => io.observe(el));
  cleanups.push(() => io.disconnect());

  // WORKS — service index with sticky preview (desktop) / inline detail (mobile)
  const svcButtons = $$('.sb-svc');
  if (svcButtons.length) {
    const panels = $$('.sb-svc-panel .sb-svc-detail');
    const mobile = () => innerWidth <= 760;
    const select = (id, { scroll = false, toggle = false } = {}) => {
      svcButtons.forEach(b => {
        const active = b.dataset.id === id;
        const li = b.closest('li');
        if (toggle && active && mobile()) { const open = !li.classList.contains('is-open'); li.classList.toggle('is-open', open); b.setAttribute('aria-pressed', String(open)); return; }
        b.setAttribute('aria-pressed', String(active)); li.classList.toggle('is-open', active);
      });
      panels.forEach(p => { p.hidden = p.dataset.for !== id; });
      if (scroll) document.getElementById(mobile() ? 'svc-' + id : 'services')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    };
    svcButtons.forEach(b => {
      on(b, 'click', () => select(b.dataset.id, { toggle: true }));
      on(b, 'mouseenter', () => { if (!mobile()) select(b.dataset.id); });
      on(b, 'focus', () => { if (!mobile()) select(b.dataset.id); });
    });
    // deep links from HOME and ABOUT: /works/#strategy
    const fromHash = () => { const id = location.hash.slice(1); if (svcButtons.some(b => b.dataset.id === id)) select(id, { scroll: true }); };
    // select at once, scroll after fonts and images have settled so the target does not drift
    const id0 = location.hash.slice(1);
    if (svcButtons.some(b => b.dataset.id === id0)) {
      select(id0);
      const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise(r => addEventListener('load', r, { once: true }));
      Promise.all([document.fonts?.ready, loaded]).then(() => requestAnimationFrame(() => requestAnimationFrame(() => { if (location.hash.slice(1) === id0) select(id0, { scroll: true }); })));
    }
    on(window, 'hashchange', fromHash);
    if (!svcButtons.some(b => b.getAttribute('aria-pressed') === 'true')) select(svcButtons[0].dataset.id);
  }

  // PROCESS — sticky rail follows the step in view
  const steps = $$('.sb-step');
  if (steps.length) {
    const num = root.querySelector('[data-sb-step]'), label = root.querySelector('[data-sb-step-label]');
    const bar = root.querySelector('.sb-rail-bar'), items = $$('.sb-rail-sticky li'), icons = $$('.sb-rail-ic i');
    const setStep = i => {
      num.textContent = String(i + 1).padStart(2, '0'); label.textContent = steps[i].dataset.label;
      bar.style.setProperty('--p', ((i + 1) / steps.length).toFixed(3));
      items.forEach((li, k) => li.classList.toggle('on', k === i));
      icons.forEach((el, k) => el.classList.toggle('on', k === i));
    };
    const sio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setStep(+e.target.dataset.sbStepI); }), { rootMargin: '-45% 0px -50% 0px' });
    steps.forEach(s => sio.observe(s));
    cleanups.push(() => sio.disconnect());
  }

  // FAQ — one answer open at a time
  const faqs = $$('.sb-faq details');
  faqs.forEach(d => on(d, 'toggle', () => { if (d.open) faqs.forEach(o => { if (o !== d) o.open = false; }); }));

  root.classList.add('st-ready');
  return () => cleanups.forEach(f => f());
}
