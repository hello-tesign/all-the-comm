import { gsap } from 'gsap';

// The photo has one entrance. Headlines remain owned by the existing text motion.
export function initAgencyHero() {
  if (document.documentElement.lang !== 'ko') return () => {};
  const hero = document.querySelector('.agency-hero');
  const media = hero?.querySelector('.agency-hero-media');
  const image = hero?.querySelector('[data-agency-hero-image]');
  if (!hero || !media || !image) return () => {};

  const preference = matchMedia('(min-width:1060px) and (prefers-reduced-motion:no-preference)');
  let disposed = false, entered = false, release = () => {};
  const sync = () => {
    release();
    release = !disposed && preference.matches ? mount() : () => {};
  };

  function mount() {
    const originalStyle = media.getAttribute('style');
    let alive = true, visible = false, ready = image.complete && image.naturalWidth > 0;
    let frame = 0, entrance = null;
    const context = gsap.context(() => { gsap.set(media, {y:0}); }, hero);
    const move = gsap.quickSetter(media, 'y', 'px');

    function draw() {
      frame = 0;
      if (!alive || !visible || document.hidden) return;
      const bounds = hero.getBoundingClientRect();
      const distance = Math.max(0, Math.min(1, -bounds.top / Math.max(1, bounds.height)));
      move(Math.round(distance * 48 * 100) / 100);
    }
    function schedule() {
      if (alive && visible && !document.hidden && !frame) frame = requestAnimationFrame(draw);
    }
    function enter() {
      if (!alive || !ready || !visible || document.hidden || entered) return;
      entered = true;
      context.add(() => {
        entrance = gsap.fromTo(media, {clipPath:'inset(0 0 12% 0)'}, {
          clipPath:'inset(0 0 0% 0)', duration:.9, ease:'power3.out',
          onComplete:() => { if (alive) gsap.set(media, {clearProps:'clipPath'}); },
        });
      });
    }
    function updatePlayback() {
      if (visible && !document.hidden) {
        entrance?.resume(); enter(); schedule();
      } else {
        entrance?.pause(); cancelAnimationFrame(frame); frame = 0;
      }
    }
    function loaded() {
      ready = image.naturalWidth > 0;
      if (ready) enter();
    }
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      updatePlayback();
    }, {threshold:0});
    observer.observe(hero);
    image.addEventListener('load', loaded);
    addEventListener('scroll', schedule, {passive:true});
    addEventListener('resize', schedule, {passive:true});
    document.addEventListener('visibilitychange', updatePlayback);

    return () => {
      alive = false; cancelAnimationFrame(frame); observer.disconnect();
      image.removeEventListener('load', loaded);
      removeEventListener('scroll', schedule);
      removeEventListener('resize', schedule);
      document.removeEventListener('visibilitychange', updatePlayback);
      context.revert();
      if (originalStyle === null) media.removeAttribute('style');
      else media.setAttribute('style', originalStyle);
    };
  }

  preference.addEventListener('change', sync);
  sync();
  return () => {
    if (disposed) return;
    disposed = true; preference.removeEventListener('change', sync); release();
  };
}
