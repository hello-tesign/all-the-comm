// WORKS 갤러리 팝업. 이미지 연작 프로젝트는 카드를 누르면 전체 화면에서 작품을 넘겨 봅니다.
// 누른 카드의 이미지가 그대로 커지며 열리고, Esc·뒤로 가기·닫기 버튼으로 닫힙니다. 주소는 #view-<slug>.
let dialog, img, cap, count, strip, title, type, detail, prevBtn, nextBtn;
let items = [], index = 0, pushed = false, slug = '';
const ease = 'cubic-bezier(.2,.8,.2,1)';
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const pad = n => String(n).padStart(2, '0');

function mount() {
  if (dialog) return;
  dialog = document.createElement('dialog');
  dialog.className = 'wv';
  dialog.setAttribute('aria-label', '작품 크게 보기');
  dialog.tabIndex = -1;
  dialog.innerHTML = `<div class="wv-top"><div class="wv-title"><small data-wv-type></small><b data-wv-title></b></div><span class="wv-count" data-wv-count aria-live="polite"></span><a class="wv-detail" data-wv-detail href="/works/">프로젝트 자세히 보기<span aria-hidden="true"> →</span></a><button type="button" class="wv-close" data-wv-close aria-label="닫기">×</button></div>
<div class="wv-stage"><button type="button" class="wv-nav prev" data-wv-prev aria-label="이전 작품">←</button><figure class="wv-figure"><img data-wv-img alt=""><figcaption data-wv-cap></figcaption></figure><button type="button" class="wv-nav next" data-wv-next aria-label="다음 작품">→</button></div>
<div class="wv-strip" data-wv-strip role="list" aria-label="작품 목록"></div>`;
  document.body.append(dialog);
  const $ = s => dialog.querySelector(s);
  img = $('[data-wv-img]'); cap = $('[data-wv-cap]'); count = $('[data-wv-count]'); strip = $('[data-wv-strip]');
  title = $('[data-wv-title]'); type = $('[data-wv-type]'); detail = $('[data-wv-detail]');
  prevBtn = $('[data-wv-prev]'); nextBtn = $('[data-wv-next]');
  prevBtn.addEventListener('click', () => go(index - 1));
  nextBtn.addEventListener('click', () => go(index + 1));
  $('[data-wv-close]').addEventListener('click', () => close());
  dialog.addEventListener('cancel', e => { e.preventDefault(); close(); });
  dialog.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
    else if (e.key === 'Home') { e.preventDefault(); go(0); }
    else if (e.key === 'End') { e.preventDefault(); go(items.length - 1); }
  });
  // clicking the dark area around the work closes; swiping moves between works
  $('.wv-stage').addEventListener('click', e => { if (e.target === e.currentTarget) close(); });
  let x0 = null;
  $('.wv-stage').addEventListener('pointerdown', e => { x0 = e.clientX; });
  $('.wv-stage').addEventListener('pointerup', e => { if (x0 === null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1)); });
  addEventListener('popstate', () => { if (dialog.open && !history.state?.wv) { pushed = false; close({ fromHistory: true }); } });
}

function show(i, dir = 0) {
  index = i;
  const it = items[i];
  img.src = it.src; img.alt = it.alt;
  cap.textContent = it.cap; cap.hidden = !it.cap;
  count.textContent = `${pad(i + 1)} / ${pad(items.length)}`;
  prevBtn.disabled = i === 0; nextBtn.disabled = i === items.length - 1;
  strip.querySelectorAll('button').forEach((b, k) => { b.classList.toggle('on', k === i); b.setAttribute('aria-current', String(k === i)); });
  strip.children[i]?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduced() ? 'auto' : 'smooth' });
  if (dir && !reduced()) img.animate([{ opacity: 0, transform: `translateX(${dir * 48}px)` }, { opacity: 1, transform: 'none' }], { duration: 420, easing: ease });
  [items[i + 1], items[i - 1]].forEach(n => { if (n) new Image().src = n.src; });
}

function go(i) { if (i < 0 || i >= items.length || i === index) return; show(i, i > index ? 1 : -1); }

// The clicked card image grows into place (FLIP), so the popup reads as the same work coming forward.
function grow(from) {
  if (!from || reduced() || !img.complete) return;
  const a = from.getBoundingClientRect(), b = img.getBoundingClientRect();
  if (!a.width || !b.width) return;
  img.animate([{ transformOrigin: '0 0', transform: `translate(${a.left - b.left}px,${a.top - b.top}px) scale(${a.width / b.width},${a.height / b.height})` }, { transformOrigin: '0 0', transform: 'none' }], { duration: 560, easing: ease });
}

export function openWorkViewer(project, { from = null, start = 0, fromHash = false } = {}) {
  mount();
  const urls = [project.coverImage || project.cover, ...(project.images || []).map(m => m.url)].filter(Boolean);
  const caps = new Map((project.images || []).map(m => [m.url, m]));
  items = urls.filter((u, k) => urls.indexOf(u) === k).map(u => ({ src: u, alt: caps.get(u)?.alt || project.title, cap: caps.get(u)?.caption || '' }));
  slug = project.slug;
  title.textContent = project.title; type.textContent = project.type || '';
  detail.href = '/works/project/' + encodeURIComponent(slug) + '/';
  strip.replaceChildren(...items.map((it, k) => { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'listitem'); b.setAttribute('aria-label', `${k + 1}번째 작품 보기`); const t = new Image(); t.src = it.src; t.alt = ''; t.loading = 'lazy'; b.append(t); b.addEventListener('click', () => go(k)); return b; }));
  index = -1; show(Math.min(start, items.length - 1));
  document.documentElement.classList.add('wv-lock');
  dialog.showModal();
  dialog.focus(); // keys work at once without a focus ring on the first button
  requestAnimationFrame(() => grow(from));
  if (fromHash) pushed = false;
  else if (!history.state?.wv) { history.pushState({ wv: slug }, '', '#view-' + slug); pushed = true; }
}

function close({ fromHistory = false } = {}) {
  if (!dialog?.open) return;
  const done = () => {
    dialog.close(); document.documentElement.classList.remove('wv-lock');
    if (!fromHistory) {
      if (pushed && history.state?.wv) history.back();
      else if (location.hash.startsWith('#view-')) history.replaceState(null, '', location.pathname + location.search);
    }
    pushed = false;
  };
  if (reduced()) done();
  else dialog.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: 'ease-out' }).finished.then(done);
}
