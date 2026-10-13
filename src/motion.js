import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initMotion() {
  let disposeScene = () => {};
  let disposed = false;
  if (document.querySelector('#brand-canvas')) import('./brand-scene.js').then(module => module.initBrandScene()).then(dispose => {
    if (disposed) dispose();
    else disposeScene = dispose;
  }).catch(() => {
    const host = document.querySelector('.hero-art');
    if (host) host.dataset.renderer = 'fallback';
    const button = document.querySelector('[data-motion-toggle]');
    const label = document.documentElement.lang.startsWith('en') ? 'Static view' : '정적 화면';
    if (button) { button.disabled = true; button.setAttribute('aria-label', label); button.setAttribute('aria-pressed', 'true'); }
    const text = button?.querySelector('[data-motion-label]');
    if (text) text.textContent = label;
  });
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    const reveals = gsap.utils.toArray('[data-reveal]');
    reveals.forEach(element => {
      if (document.documentElement.classList.contains('isos-motion-enabled') && element.matches('h1,h2')) return;
      if (document.documentElement.classList.contains('isos-story-enabled') && element.matches('.chapter-copy')) return;
      // Content remains readable until it actually enters the viewport.
      ScrollTrigger.create({ trigger: element, start: 'top 96%', once: true,
        onEnter: () => gsap.fromTo(element, { y: 28, opacity: 0.12 }, { y: 0, opacity: 1,
          duration: 0.85, ease: 'power3.out', clearProps: 'transform,opacity' }) });
    });
    if (matchMedia('(min-width: 800px)').matches) {
      gsap.utils.toArray('.project-visual img:not(.project-image-real), .project-visual video').forEach(element => {
        gsap.fromTo(element, { scale: 1.04, yPercent: -2 }, { scale: 1, yPercent: 2, ease: 'none',
          scrollTrigger: { trigger: element.parentElement, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
      });
    }
  });
  document.fonts?.ready.then(() => { if (!disposed) ScrollTrigger.refresh(); });
  function cleanup() { if (disposed) return; disposed = true; disposeScene(); media.revert(); window.removeEventListener('pagehide', onHide); }
  function onHide(event) { if (!event.persisted) cleanup(); }
  window.addEventListener('pagehide', onHide);
  return cleanup;
}
