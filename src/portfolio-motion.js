import { gsap } from 'gsap';

// The SOS reference supplies the choreography: an expanding image window,
// successive text beats and a reading line. The captured interface stays flat.
const DESKTOP_MOTION = '(min-width: 1060px) and (prefers-reduced-motion: no-preference)';
const clamp = value => Math.max(0, Math.min(1, value));

export function initPortfolioMotion() {
  const korean = document.documentElement.lang.toLowerCase().startsWith('ko');
  const portfolioPage = document.body.matches('.works-page, .case-page') || document.querySelector('[data-project-list][data-featured]');
  if (!korean || !portfolioPage) return () => {};

  const preference = window.matchMedia(DESKTOP_MOTION);
  const revealed = new WeakSet();
  let disposed = false;
  let queued = 0;
  let release = () => {};

  const bind = () => {
    queued = 0;
    release();
    release = () => {};
    if (!disposed && preference.matches) release = mountPortfolio(revealed);
  };
  const schedule = () => {
    if (!disposed && !queued) queued = requestAnimationFrame(bind);
  };
  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(queued);
    release();
    preference.removeEventListener('change', schedule);
    document.removeEventListener('portfolio:updated', schedule);
  };

  preference.addEventListener('change', schedule);
  document.addEventListener('portfolio:updated', schedule);
  bind();
  return cleanup;
}

function mountPortfolio(revealed) {
  const list = document.querySelector('[data-project-list]');
  const cards = [...(list?.querySelectorAll('.portfolio-piece') || [])];
  const caseCover = document.body.matches('.capture-case')
    ? document.querySelector('[data-case-cover]') : null;
  const gallery = caseCover ? document.querySelector('[data-case-gallery]') : null;
  const records = cards.map(card => {
    const caption = card.querySelector('.project-caption');
    const text = caption ? [
      ...caption.querySelectorAll('.eyebrow, h3'),
      ...[...caption.children].filter(child => child.tagName === 'P'),
    ] : [];
    return { element: card, visual: card.querySelector('.project-visual'), text,
      arrow: card.querySelector('.project-open'), card: true };
  }).filter(record => record.visual);

  if (caseCover?.querySelector('img')) {
    records.push({ element: caseCover,
      visual: caseCover.querySelector('.capture-open') || caseCover.querySelector('img'),
      text: [], card: false });
    gallery?.querySelectorAll('figure').forEach(figure => {
      const visual = figure.querySelector('.capture-open') || figure.querySelector('img');
      if (visual) records.push({ element: figure, visual,
        text: [...figure.querySelectorAll('figcaption')], card: false });
    });
  }
  if (!records.length) return () => {};

  let disposed = false;
  let pendingFrame = 0;
  let regionVisible = false;
  const detach = [];
  const context = gsap.context(() => {});
  const region = cards.length ? list : caseCover.closest('main') || caseCover;
  const first = records[0].element;
  const last = records.at(-1).element;
  const on = (target, name, handler, options) => {
    target.addEventListener(name, handler, options);
    detach.push(() => target.removeEventListener(name, handler, options));
  };
  const animate = callback => context.add(callback);

  const progress = document.createElement('div');
  progress.className = 'portfolio-reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  const line = document.createElement('i');
  progress.append(line);
  document.body.append(progress);

  function updateProgress() {
    pendingFrame = 0;
    if (disposed || document.hidden || !regionVisible) return;
    const start = first.getBoundingClientRect();
    const end = last.getBoundingClientRect();
    const viewport = window.innerHeight;
    const visible = start.top < viewport && end.bottom > 0;
    progress.classList.toggle('is-reading', visible);
    if (!visible) return;
    const distance = Math.max(1, end.bottom - start.top);
    line.style.transform = `scaleX(${clamp((viewport * 0.48 - start.top) / distance).toFixed(4)})`;
  }
  function scheduleProgress() {
    if (!disposed && !document.hidden && regionVisible && !pendingFrame) {
      pendingFrame = requestAnimationFrame(updateProgress);
    }
  }

  const finish = record => {
    if (!record.timeline) return;
    record.timeline.progress(1).pause();
    record.element.classList.remove('is-portfolio-entering');
    revealed.add(record.element);
  };

  function enter(record) {
    if (disposed || document.hidden || revealed.has(record.element) || record.timeline) return;
    record.element.classList.add('is-portfolio-entering');
    const rect = record.element.getBoundingClientRect();
    const rightColumn = record.card && rect.left > window.innerWidth * 0.4;
    animate(() => {
      record.timeline = gsap.timeline({
        delay: rightColumn ? 0.10 : 0,
        onComplete: () => {
          record.element.classList.remove('is-portfolio-entering');
          revealed.add(record.element);
        },
      });
      // The stage unfolds as a whole; the image never pans or crops inside it.
      record.timeline.fromTo(record.visual,
        { clipPath: 'inset(9% 4.5% 12% 4.5% round 12px)', scale: 0.975, y: 32 },
        { clipPath: 'inset(0% 0% 0% 0% round 0px)', scale: 1, y: 0,
          duration: 1.12, ease: 'power4.inOut', clearProps: 'clipPath,transform' }, 0);
      if (record.text.length) record.timeline.fromTo(record.text,
        { y: 24, opacity: 0.08 },
        { y: 0, opacity: 1, duration: 0.74, stagger: 0.075,
          ease: 'power3.out', clearProps: 'transform,opacity' }, 0.34);
      if (record.arrow) record.timeline.fromTo(record.arrow,
        { opacity: 0 }, { opacity: 1, duration: 0.45, clearProps: 'opacity' }, 0.58);
    });
  }

  const byElement = new Map(records.map(record => [record.element, record]));
  const sceneObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const record = byElement.get(entry.target);
      if (!record) continue;
      record.visible = entry.isIntersecting;
      if (entry.isIntersecting) enter(record);
      else {
        // No unfinished, hidden caption remains when the reader skips a scene.
        if (!document.hidden) finish(record);
        record.resetMagnet?.(true);
      }
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });

  const regionObserver = new IntersectionObserver(entries => {
    regionVisible = entries.some(entry => entry.isIntersecting);
    if (regionVisible) scheduleProgress();
    else {
      cancelAnimationFrame(pendingFrame);
      pendingFrame = 0;
      progress.classList.remove('is-reading');
    }
  });
  regionObserver.observe(region);

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  for (const record of records) {
    record.element.classList.add('portfolio-motion-ready');
    record.visible = false;
    sceneObserver.observe(record.element);
    on(record.element, 'focusin', () => { finish(record); revealed.add(record.element); });

    if (record.arrow && finePointer) {
      let xTo, yTo;
      animate(() => {
        xTo = gsap.quickTo(record.arrow, 'x', { duration: 0.34, ease: 'power3.out' });
        yTo = gsap.quickTo(record.arrow, 'y', { duration: 0.34, ease: 'power3.out' });
      });
      record.resetMagnet = immediate => {
        if (immediate) {
          xTo.tween.pause();
          yTo.tween.pause();
          animate(() => gsap.set(record.arrow, { x: 0, y: 0 }));
        } else { xTo(0); yTo(0); }
      };
      on(record.visual, 'pointermove', event => {
        if (!record.visible || document.hidden || event.pointerType === 'touch') return;
        const bounds = record.visual.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        xTo(Math.max(-7, Math.min(7, x * 14)));
        yTo(Math.max(-7, Math.min(7, y * 14)));
      }, { passive: true });
      on(record.visual, 'pointerleave', () => record.resetMagnet(document.hidden || !record.visible));
      on(record.visual, 'pointercancel', () => record.resetMagnet(true));
      on(record.visual, 'blur', () => record.resetMagnet(true));
    }
  }

  on(window, 'scroll', scheduleProgress, { passive: true });
  on(window, 'resize', scheduleProgress, { passive: true });
  on(document, 'visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(pendingFrame);
      pendingFrame = 0;
      records.forEach(record => {
        record.timeline?.pause();
        record.resetMagnet?.(true);
      });
    } else {
      records.forEach(record => {
        if (record.visible) {
          if (!record.timeline) enter(record);
          else if (record.timeline.progress() < 1) record.timeline.resume();
        } else finish(record);
      });
      scheduleProgress();
    }
  });
  region.querySelectorAll('img').forEach(img => {
    if (!img.complete) on(img, 'load', scheduleProgress, { once: true });
  });
  document.fonts?.ready.then(() => { if (!disposed) scheduleProgress(); });

  return () => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(pendingFrame);
    sceneObserver.disconnect();
    regionObserver.disconnect();
    detach.forEach(remove => remove());
    context.revert();
    progress.remove();
    records.forEach(record => record.element.classList.remove('portfolio-motion-ready', 'is-portfolio-entering'));
  };
}
