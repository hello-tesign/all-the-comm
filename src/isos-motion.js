import { gsap } from 'gsap';

const ENABLED = '(min-width: 1060px) and (prefers-reduced-motion: no-preference)';
const TITLES = '.home-hero h1, .page-hero h1, .case-hero h1, .section-heading h2, .about-story h2, .principles-section > .shell > h2, .company-section h2';

// Split the original text, not an accessible duplicate. Inline semantics and
// explicit line breaks remain in place, including after a case title changes.
function splitWords(element, reading = false) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return node.parentElement?.closest('svg, script, style, [aria-hidden="true"], [data-isos-word]')
        ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  const words = [];
  for (const node of nodes) {
    const fragment = document.createDocumentFragment();
    for (const word of node.textContent.split(/(\s+)/)) {
      if (!word) continue;
      if (/^\s+$/.test(word)) { fragment.append(document.createTextNode(word)); continue; }
      const outer = document.createElement('span');
      outer.dataset.isosWord = '';
      outer.className = reading ? 'isos-read-word' : 'isos-word';
      if (reading) outer.textContent = word;
      else {
        const inner = document.createElement('span');
        inner.className = 'isos-word-inner';
        inner.textContent = word;
        outer.append(inner);
      }
      fragment.append(outer);
      words.push(reading ? outer : outer.firstElementChild);
    }
    node.replaceWith(fragment);
  }
  return words;
}

function unwrapWords(element) {
  element.querySelectorAll('[data-isos-word]').forEach(word => word.replaceWith(document.createTextNode(word.textContent)));
}

export function initIsosMotion() {
  if (!document.documentElement.lang.toLowerCase().startsWith('ko')) return () => {};
  const preference = matchMedia(ENABLED);
  let disposed = false;
  let release = () => {};
  const sync = () => {
    release();
    release = () => {};
    if (!disposed && preference.matches) release = mountIsosMotion();
  };
  preference.addEventListener('change', sync);
  sync();
  return () => {
    if (disposed) return;
    disposed = true;
    preference.removeEventListener('change', sync);
    release();
  };
}

function mountIsosMotion() {
  const html = document.documentElement;
  const detach = [];
  const restore = [];
  const observed = new Map();
  const animations = new Set();
  const readPassages = new Set();
  let disposed = false;
  let readingFrame = 0;
  html.classList.add('isos-motion-enabled');

  function on(target, name, callback, options) {
    target.addEventListener(name, callback, options);
    detach.push(() => target.removeEventListener(name, callback, options));
  }
  function reset(record) {
    record.context?.revert();
    record.context = null;
    record.timeline = null;
    record.element.classList.remove('isos-scene-playing');
    animations.delete(record);
  }
  function finish(record) {
    record.timeline?.progress(1).pause();
    record.element.classList.remove('isos-scene-playing');
  }
  function play(record, compose) {
    reset(record);
    record.element.classList.add('isos-scene-playing');
    record.context = gsap.context(() => {
      record.timeline = gsap.timeline({ onComplete: () => record.element.classList.remove('isos-scene-playing') });
      compose(record.timeline);
    });
    animations.add(record);
  }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const record = observed.get(entry.target);
      if (!record) continue;
      record.visible = entry.isIntersecting;
      if (entry.isIntersecting) {
        if (!document.hidden) record.enter?.();
      } else record.leave?.();
    }
  }, { rootMargin: '0px 0px -7% 0px', threshold: 0 });
  function watch(record) { observed.set(record.element, record); observer.observe(record.element); }

  function maskTitle(element, footer = false) {
    const record = { element, visible: false, played: false, words: [] };
    let queued = 0;
    const mutation = new MutationObserver(() => {
      if (!queued && !disposed) queued = requestAnimationFrame(rebuild);
    });
    function reveal() {
      if (record.played || document.hidden || !record.words.length) return;
      record.played = true;
      play(record, timeline => {
        timeline.fromTo(record.words,
          { yPercent: 112, rotation: 1.6 },
          { yPercent: 0, rotation: 0, duration: 1.05, stagger: index => Math.min(index, 7) * 0.055,
            ease: 'power4.out', clearProps: 'transform' }, 0);
        if (footer) {
          const arrow = element.querySelector(':scope > svg');
          if (arrow) timeline.from(arrow, { x: -24, y: 24, opacity: 0,
            duration: 0.85, ease: 'power3.out', clearProps: 'transform,opacity' }, 0.2);
        }
      });
    }
    function rebuild() {
      queued = 0;
      if (disposed || !element.isConnected) return;
      mutation.disconnect();
      reset(record);
      unwrapWords(element);
      record.words = splitWords(element);
      record.played = false;
      mutation.observe(element, { childList: true, characterData: true, subtree: true });
      if (record.visible && !document.hidden) reveal();
    }
    record.enter = reveal;
    record.leave = () => { if (!document.hidden) finish(record); };
    record.words = splitWords(element);
    mutation.observe(element, { childList: true, characterData: true, subtree: true });
    watch(record);
    on(element, 'focusin', () => { record.played = true; finish(record); });
    restore.push(() => {
      cancelAnimationFrame(queued);
      mutation.disconnect();
      unwrapWords(element);
    });
    return record;
  }
  document.querySelectorAll(TITLES).forEach(element => maskTitle(element));

  // Observe the real tab state. Keyboard, hash and pointer selection all use
  // the same sequence, and a panel hidden midway is restored immediately.
  document.querySelectorAll('[data-capabilities]').forEach(stage => {
    const panels = [...stage.querySelectorAll('.capability-panel, .discipline-panel')];
    if (!panels.length) return;
    const record = { element: stage, visible: false, selected: null, current: null };
    function activate() {
      const selected = panels.find(panel => !panel.hidden);
      if (selected !== record.selected) {
        if (record.current) reset(record.current);
        record.selected = selected;
        record.current = null;
      }
      if (!selected || !record.visible || document.hidden || record.current) return;
      const scene = { element: selected, visible: true };
      record.current = scene;
      play(scene, timeline => {
        const glass = [...selected.querySelectorAll('.glass-plane')];
        const lens = selected.querySelector('.discipline-lens');
        const orbits = [...selected.querySelectorAll('.discipline-orbit')];
        const word = selected.querySelector('.discipline-word');
        // A tab selection must expose its answer immediately. Animate the
        // illustration while keeping headings, descriptions and actions readable.
        if (glass.length) timeline.from(glass, { x: '-=26', y: '+=42', rotation: '-=6', opacity: 0,
          duration: 1.1, stagger: 0.11, ease: 'power3.out', clearProps: 'transform,opacity' }, 0);
        if (word) timeline.from(word, { y: '+=26', opacity: 0, duration: 0.8,
          ease: 'power3.out', clearProps: 'transform,opacity' }, 0);
        if (orbits.length) timeline.from(orbits, { scale: 0.86, opacity: 0, duration: 1.1,
          stagger: 0.1, ease: 'power3.out', clearProps: 'transform,opacity' }, 0.08);
        if (lens) timeline.from(lens, { y: '+=38', rotation: '-=7', opacity: 0,
          duration: 1.1, ease: 'power3.out', clearProps: 'transform,opacity' }, 0.13);
        selected.querySelectorAll('.service-symbol path, .service-symbol circle, .service-symbol line, .service-symbol polyline, .service-symbol rect').forEach((path, i) => {
          let length;
          try { length = path.getTotalLength(); } catch { return; }
          if (!Number.isFinite(length) || length <= 0) return;
          timeline.fromTo(path, { strokeDasharray: `${length} ${length}`, strokeDashoffset: length },
            { strokeDashoffset: 0, duration: 1.25, ease: 'power2.inOut',
              clearProps: 'strokeDasharray,strokeDashoffset' }, 0.24 + i * 0.07);
        });
      });
    }
    record.enter = () => { activate(); if (record.current) record.current.visible = true; };
    record.leave = () => {
      if (record.current) { record.current.visible = false; if (!document.hidden) finish(record.current); }
    };
    watch(record);
    const mutation = new MutationObserver(activate);
    mutation.observe(stage, { attributes: true, attributeFilter: ['hidden'], subtree: true });
    restore.push(() => mutation.disconnect());
    on(stage, 'focusin', event => {
      if (record.current && record.current.element.contains(event.target)) finish(record.current);
    });
  });

  function updateReading() {
    readingFrame = 0;
    if (disposed || document.hidden) return;
    const viewport = window.innerHeight;
    readPassages.forEach(record => {
      if (!record.visible) return;
      const bounds = record.element.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (viewport * 0.82 - bounds.top) / (viewport * 0.43 + bounds.height * 0.45)));
      const count = Math.ceil(progress * record.words.length);
      if (count === record.lit) return;
      record.lit = count;
      record.words.forEach((word, index) => word.classList.toggle('is-lit', index < count));
    });
  }
  function scheduleReading() {
    if (!disposed && !document.hidden && !readingFrame && [...readPassages].some(record => record.visible)) {
      readingFrame = requestAnimationFrame(updateReading);
    }
  }
  document.querySelectorAll('.about-story .lead').forEach(element => {
    const record = { element, words: splitWords(element, true), visible: false, lit: -1 };
    readPassages.add(record);
    record.enter = scheduleReading;
    record.leave = () => {
      const above = element.getBoundingClientRect().bottom < 0;
      if (above) {
        record.lit = record.words.length;
        record.words.forEach(word => word.classList.add('is-lit'));
      }
    };
    watch(record);
    restore.push(() => unwrapWords(element));
  });
  on(window, 'scroll', scheduleReading, { passive: true });
  on(window, 'resize', scheduleReading, { passive: true });

  document.querySelectorAll('.channel-composition').forEach(element => {
    const record = { element, visible: false, played: false };
    record.enter = () => {
      if (record.played || document.hidden) return;
      record.played = true;
      play(record, timeline => {
        const layers = [...element.querySelectorAll('.channel-sheet')];
        layers.forEach((layer, index) => timeline.from(layer, { y: '+=64', x: index % 2 ? '+=24' : '-=24',
          rotation: index % 2 ? '+=5' : '-=5', opacity: 0, duration: 1.2,
          ease: 'power4.out', clearProps: 'transform,opacity' }, index * 0.15));
        const caption = element.querySelector('.channel-caption');
        if (caption) timeline.from(caption, { y: 12, opacity: 0, duration: 0.7,
          ease: 'power3.out', clearProps: 'transform,opacity' }, 0.52);
      });
    };
    record.leave = () => { if (!document.hidden) finish(record); };
    watch(record);
  });

  document.querySelectorAll('.footer-invitation').forEach(element => {
    const copy = document.createElement('span');
    copy.className = 'isos-footer-copy';
    const nodes = [...element.childNodes].filter(node => node.nodeName.toLowerCase() !== 'svg');
    element.insertBefore(copy, element.firstChild);
    nodes.forEach(node => copy.append(node));
    const record = maskTitle(element, true);
    restore.push(() => copy.replaceWith(...copy.childNodes));
    const arrow = element.querySelector(':scope > svg');
    if (!arrow || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const arrowContext = gsap.context(() => {});
    let xTo, yTo;
    arrowContext.add(() => {
      xTo = gsap.quickTo(arrow, 'x', { duration: 0.4, ease: 'power3.out' });
      yTo = gsap.quickTo(arrow, 'y', { duration: 0.4, ease: 'power3.out' });
    });
    const resetArrow = immediate => {
      if (immediate) {
        xTo.tween.pause(); yTo.tween.pause();
        arrowContext.add(() => gsap.set(arrow, { x: 0, y: 0 }));
      } else { xTo(0); yTo(0); }
    };
    record.resetPointer = resetArrow;
    on(element, 'pointermove', event => {
      if (!record.visible || document.hidden || event.pointerType === 'touch') return;
      // A focus or pointer interaction completes the entrance before responding.
      finish(record);
      const bounds = element.getBoundingClientRect();
      xTo(Math.max(-9, Math.min(9, (event.clientX - bounds.left) / bounds.width * 18 - 9)));
      yTo(Math.max(-9, Math.min(9, (event.clientY - bounds.top) / bounds.height * 18 - 9)));
    }, { passive: true });
    on(element, 'pointerleave', () => resetArrow(document.hidden || !record.visible));
    on(element, 'pointercancel', () => resetArrow(true));
    const leave = record.leave;
    record.leave = () => { leave(); resetArrow(true); };
    restore.push(() => arrowContext.revert());
  });

  on(document, 'visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(readingFrame);
      readingFrame = 0;
      animations.forEach(record => record.timeline?.pause());
      observed.forEach(record => record.resetPointer?.(true));
    } else {
      observed.forEach(record => { if (record.visible) record.enter?.(); });
      animations.forEach(record => {
        if (record.visible && record.timeline?.progress() < 1) record.timeline.resume();
        else if (!record.visible) finish(record);
      });
      scheduleReading();
    }
  });
  document.fonts?.ready.then(() => { if (!disposed) scheduleReading(); });

  return () => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(readingFrame);
    observer.disconnect();
    detach.forEach(remove => remove());
    animations.forEach(record => record.context?.revert());
    observed.forEach(record => record.element.classList.remove('isos-scene-playing'));
    document.querySelectorAll('.isos-scene-playing').forEach(element => element.classList.remove('isos-scene-playing'));
    restore.forEach(undo => undo());
    html.classList.remove('isos-motion-enabled');
  };
}
