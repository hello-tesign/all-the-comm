// ISOS-style scroll narration, adapted to the existing Korean agency content.
// The reader keeps native scrolling and every chapter stays in the document.
export function initScrollStory() {
  if (document.documentElement.lang !== 'ko') return () => {};
  const media = matchMedia('(min-width: 1060px) and (prefers-reduced-motion: no-preference)');
  let dispose = () => {}, ended = false;
  const bind = () => { dispose(); dispose = media.matches && !ended ? mount() : () => {}; };
  media.addEventListener('change', bind);
  bind();
  return () => { if (ended) return; ended = true; media.removeEventListener('change', bind); dispose(); };
}

function mount() {
  const root = document.documentElement;
  root.classList.add('isos-story-enabled');
  const progress = document.createElement('div');
  progress.className = 'site-reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  progress.innerHTML = '<i></i>';
  document.body.append(progress);
  const line = progress.firstElementChild;
  const section = document.querySelector('.process-chapters');
  const chapters = [...(section?.querySelectorAll('.process-chapter') || [])];
  const records = chapters.map(chapter => ({
    chapter, art: chapter.querySelector('.chapter-art'),
    name: chapter.querySelector('.eyebrow').textContent,
  }));
  let stage, narrative, nav, current = -1, frame = 0, disposed = false;
  if (records.length) {
    section.classList.add('scroll-story');
    stage = document.createElement('div'); stage.className = 'process-cinema';
    const artboard = document.createElement('div'); artboard.className = 'process-cinema-art';
    nav = document.createElement('nav'); nav.className = 'process-cinema-nav'; nav.setAttribute('aria-label', '업무 단계 바로가기');
    narrative = document.createElement('div'); narrative.className = 'process-narrative';
    records.forEach((record, index) => {
      const link = document.createElement('a'); link.href = '#' + record.chapter.id;
      const number = document.createElement('span'); number.textContent = String(index + 1).padStart(2, '0'); number.setAttribute('aria-hidden', 'true');
      link.append(number, document.createTextNode(record.name)); nav.append(link); record.link = link;
      artboard.append(record.art); narrative.append(record.chapter);
      record.paths = [...record.art.querySelectorAll('path')].map(path => ({ path, style: path.getAttribute('style'), length: path.getTotalLength() }));
    });
    stage.append(artboard, nav); section.append(stage, narrative);
  }
  const setChapter = index => {
    if (index === current) return;
    current = index;
    records.forEach((record, i) => {
      record.art.classList.toggle('is-current', i === index);
      record.chapter.classList.toggle('is-current', i === index);
      if (i === index) record.link.setAttribute('aria-current', 'step');
      else record.link.removeAttribute('aria-current');
    });
    if (section) section.dataset.activeStep = String(index + 1);
  };
  const clamp = n => Math.max(0, Math.min(1, n));
  function render() {
    frame = 0;
    if (disposed || document.hidden) return;
    const distance = root.scrollHeight - innerHeight;
    const bounds = records.map(record => record.chapter.getBoundingClientRect());
    line.style.transform = `scaleX(${distance > 0 ? clamp(scrollY / distance) : 0})`;
    if (bounds.length) {
      let active = 0;
      bounds.forEach((rect, index) => { if (rect.top < innerHeight * .58) active = index; });
      setChapter(active);
      const rect = bounds[active];
      const travel = clamp((innerHeight * .8 - rect.top) / Math.min(rect.height, innerHeight * .65));
      records[active].paths.forEach(({path, length}) => {
        path.style.strokeDasharray = String(length);
        path.style.strokeDashoffset = String(length * (1 - travel));
      });
      stage.style.setProperty('--scene-progress', travel.toFixed(4));
    }
  }
  const schedule = () => { if (!disposed && !document.hidden && !frame) frame = requestAnimationFrame(render); };
  const visibility = () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else schedule(); };
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule, {passive:true});
  document.addEventListener('visibilitychange', visibility);
  const resize = new ResizeObserver(schedule); resize.observe(document.body);
  document.fonts?.ready.then(schedule);
  render();
  return () => {
    disposed = true; cancelAnimationFrame(frame); resize.disconnect();
    removeEventListener('scroll', schedule); removeEventListener('resize', schedule);
    document.removeEventListener('visibilitychange', visibility);
    progress.remove(); root.classList.remove('isos-story-enabled');
    if (section && records.length) {
      records.forEach(record => {
        record.paths.forEach(({path, style}) => style === null ? path.removeAttribute('style') : path.setAttribute('style', style));
        record.art.classList.remove('is-current'); record.chapter.classList.remove('is-current');
        record.chapter.prepend(record.art); section.append(record.chapter);
      });
      stage.remove(); narrative.remove(); section.classList.remove('scroll-story'); delete section.dataset.activeStep;
    }
  };
}
