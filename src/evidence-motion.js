import { gsap } from 'gsap';

const DESKTOP = '(min-width: 1060px) and (prefers-reduced-motion: no-preference)';

export function initEvidenceMotion() {
  if (!document.documentElement.lang.toLowerCase().startsWith('ko')) return () => {};
  const media = matchMedia(DESKTOP);
  let disposed = false;
  let release = () => {};
  const refresh = () => {
    release();
    release = () => {};
    if (!disposed && media.matches) release = mountEvidenceMotion();
  };
  media.addEventListener('change', refresh);
  refresh();
  return () => {
    if (disposed) return;
    disposed = true;
    media.removeEventListener('change', refresh);
    release();
  };
}

function mountEvidenceMotion() {
  const records = [];
  const detach = [];
  let disposed = false;
  document.documentElement.classList.add('evidence-motion-enabled');

  function on(target, name, handler, options) {
    target.addEventListener(name, handler, options);
    detach.push(() => target.removeEventListener(name, handler, options));
  }
  function clearScene(record) {
    record.context?.revert();
    record.context = null;
    record.timeline = null;
    record.selected?.classList.remove('is-evidence-revealing');
    record.images?.forEach(image => image.classList.remove('evidence-motion-media'));
    record.images = [];
  }
  function finishScene(record) {
    record.timeline?.progress(1).pause();
    record.selected?.classList.remove('is-evidence-revealing');
  }

  function activate(record) {
    if (disposed) return;
    const selected = record.frames.find(frame => !frame.hidden);
    if (selected !== record.selected) {
      clearScene(record);
      record.selected = selected;
      record.played = false;
    }
    if (!selected || !record.visible || document.hidden || record.played) return;
    if (record.once && record.seen.has(selected)) { record.played = true; return; }

    // Captions and controls remain available immediately. An image loading
    // later gets its entrance when ready, without a blank or hidden placeholder.
    const images = [...selected.querySelectorAll(record.imageSelector)];
    if (!images.length || images.some(image => !image.complete)) return;
    // A presentation mask on the supplied dashboard must never be animated away.
    const readyImages = images.filter(image => image.naturalWidth > 0 && !image.src.endsWith('/operations-dashboard.png'));
    if (!readyImages.length) { record.played = true; return; }
    record.played = true;
    record.seen.add(selected);
    record.images = readyImages;
    selected.classList.add('is-evidence-revealing');
    readyImages.forEach(image => image.classList.add('evidence-motion-media'));
    record.context = gsap.context(() => {
      record.timeline = gsap.timeline({
        onComplete: () => selected.classList.remove('is-evidence-revealing'),
      });
      // Only the photographic boundary opens. No zoom, pan, perspective,
      // opacity change or pointer movement is applied to the captured interface.
      record.timeline.fromTo(readyImages,
        { clipPath: record.hero ? 'inset(0% 4% 12% 4%)' : 'inset(0% 2% 7% 2%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: record.hero ? 0.78 : 0.6,
          stagger: index => Math.min(index, 2) * 0.07, ease: 'power3.out', clearProps: 'clipPath' });
    });
  }

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const record = records.find(item => item.host === entry.target);
      if (!record) continue;
      record.visible = entry.isIntersecting;
      if (record.visible) activate(record);
      else if (!document.hidden) finishScene(record);
    }
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0 });

  function observeStage(host, frames, hero = false, options = {}) {
    if (!frames.length) return;
    const record = { host, frames, hero, once: options.once ?? hero,
      imageSelector: options.imageSelector ?? (hero ? 'img' : '.evidence-visual figure img'), selected: null,
      visible: false, played: false, images: [], seen: new WeakSet() };
    records.push(record);
    observer.observe(host);
    const mutation = new MutationObserver(() => activate(record));
    mutation.observe(host, { attributes: true, attributeFilter: ['hidden'], subtree: true });
    detach.push(() => mutation.disconnect());
    on(host, 'load', event => { if (event.target instanceof HTMLImageElement) activate(record); }, true);
    on(host, 'error', event => { if (event.target instanceof HTMLImageElement) activate(record); }, true);
    on(host, 'focusin', event => {
      if (record.selected?.contains(event.target)) finishScene(record);
    });
  }

  document.querySelectorAll('[data-evidence-hero]').forEach(host => {
    observeStage(host, [...host.querySelectorAll('.evidence-hero-frame')], true);
  });
  document.querySelectorAll('[data-capabilities]').forEach(host => {
    observeStage(host, [...host.querySelectorAll('.capability-panel, .discipline-panel')]
      .filter(panel => panel.querySelector('.evidence-visual figure img')));
  });

  // New editorial spreads use the same restrained frame opening as case media.
  // Their text, links and original screenshot proportions remain stationary.
  document.querySelectorAll('.apd-proof-figure, .team-proof-image, .contact-reference figure').forEach(host => {
    observeStage(host, [host], false, { imageSelector: 'img', once: true });
  });

  on(document, 'visibilitychange', () => {
    if (document.hidden) records.forEach(record => record.timeline?.pause());
    else records.forEach(record => {
      if (!record.visible) { finishScene(record); return; }
      activate(record);
      if (record.timeline && record.timeline.progress() < 1) record.timeline.resume();
    });
  });

  return () => {
    if (disposed) return;
    disposed = true;
    observer.disconnect();
    detach.forEach(remove => remove());
    records.forEach(clearScene);
    document.documentElement.classList.remove('evidence-motion-enabled');
  };
}
