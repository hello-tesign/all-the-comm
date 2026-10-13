const locale=document.documentElement.lang,en=locale==='en',t=(ko,eng)=>en?eng:ko;
const U=url=>(en?'/en':'')+url;
const data=JSON.parse(document.querySelector('#site-data')?.textContent||'{}');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arrow='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" stroke-width="1.5"/></svg>';
const safeURL=value=>{try{const u=new URL(value,location.origin);return ['http:','https:'].includes(u.protocol)?u.href:'';}catch{return '';}};
document.documentElement.classList.add('js');
document.querySelectorAll('[data-evidence-hero]').forEach(hero=>{
 const buttons=[...hero.querySelectorAll('[data-evidence-select]')],panels=[...hero.querySelectorAll('.evidence-hero-frame')];
 const select=(index,focus=false)=>{buttons.forEach((b,i)=>{b.setAttribute('aria-selected',String(i===index));b.tabIndex=i===index?0:-1;});panels.forEach((p,i)=>p.hidden=i!==index);if(focus)buttons[index].focus();};
 buttons.forEach((button,index)=>{button.addEventListener('click',()=>select(index));button.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight')next=(index+1)%buttons.length;if(event.key==='ArrowLeft')next=(index+buttons.length-1)%buttons.length;if(event.key==='Home')next=0;if(event.key==='End')next=buttons.length-1;if(next!==undefined){event.preventDefault();select(next,true);}});});
});
const header=document.querySelector('.site-header');
let scrollQueued=false;
function updateHeader(){header?.classList.toggle('is-scrolled',scrollY>30);scrollQueued=false;}
addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(updateHeader);}},{passive:true});updateHeader();
const menu=document.querySelector('#mobile-menu'),toggle=document.querySelector('.menu-toggle');
if(menu&&toggle){toggle.addEventListener('click',()=>{menu.showModal();toggle.setAttribute('aria-expanded','true');document.body.classList.add('menu-open');menu.querySelector('nav a')?.focus();});menu.querySelector('.menu-close')?.addEventListener('click',()=>menu.close());menu.addEventListener('close',()=>{toggle.setAttribute('aria-expanded','false');document.body.classList.remove('menu-open');toggle.focus();});menu.addEventListener('click',e=>{if(e.target===menu)menu.close();});addEventListener('resize',()=>{if(innerWidth>1050&&menu.open)menu.close();},{passive:true});}

// Explicit cycling also covers WebKit's platform-dependent default Tab model.
document.addEventListener('keydown',event=>{
 if(!menu?.open||event.key!=='Tab')return;
 const stops=[...menu.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),[tabindex="0"]')].filter(el=>el.getClientRects().length);
 if(!stops.length)return;event.preventDefault();
 const current=stops.indexOf(document.activeElement),next=current<0?(event.shiftKey?stops.length-1:0):(current+(event.shiftKey?-1:1)+stops.length)%stops.length;
 stops[next].focus();
});

document.querySelectorAll('[data-capabilities]').forEach(stage=>{
 const buttons=[...stage.querySelectorAll('[data-service-choice]')],panels=[...stage.querySelectorAll('[data-service-panel]')];
 function select(button,focus=false){const id=button.dataset.serviceChoice;buttons.forEach(b=>{b.setAttribute('aria-selected',String(b===button));b.tabIndex=b===button?0:-1;});panels.forEach(p=>{p.hidden=p.dataset.servicePanel!==id;if(!p.hidden&&!reduced.matches&&!document.documentElement.classList.contains('isos-motion-enabled'))p.animate([{opacity:.3,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:380,easing:'cubic-bezier(.22,1,.36,1)'});});if(focus)button.focus();}
 buttons.forEach((b,i)=>{b.addEventListener('click',()=>select(b));b.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(i+1)%buttons.length;if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=(i-1+buttons.length)%buttons.length;if(event.key==='Home')next=0;if(event.key==='End')next=buttons.length-1;if(next!==undefined){event.preventDefault();select(buttons[next],true);}});});
 function readHash(scroll=false){const id=location.hash.slice(1),target=buttons.find(b=>b.dataset.serviceChoice===id);if(target){select(target);if(scroll)stage.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});}}
 readHash(true);addEventListener('hashchange',()=>readHash(true));
});
document.querySelectorAll('[data-process-step]').forEach(button=>button.addEventListener('click',()=>{
 const value=button.dataset.processStep;document.querySelectorAll('[data-process-step]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));document.querySelectorAll('[data-process-panel]').forEach(panel=>{panel.hidden=panel.dataset.processPanel!==value;if(!panel.hidden&&!reduced.matches)panel.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:500,easing:'cubic-bezier(.22,1,.36,1)'});});
}));
document.querySelectorAll('.role-item').forEach(item=>item.addEventListener('toggle',()=>{if(item.open)document.querySelectorAll('.role-item').forEach(other=>{if(other!==item)other.open=false;});}));

const list=document.querySelector('[data-project-list]');
const selfCard=list?.querySelector('[data-project-card]')?.cloneNode(true);
let projects=[],activeFilter='all',visibleCount=6;
function translated(p,key){return en&&p[key+'En']?p[key+'En']:p[key]||'';}
function projectMarkup(p){
 const href=U('/works/project/'+encodeURIComponent(p.slug)+'/'),cover=safeURL(p.coverImage||p.cover||'');
 if(p.slug==='all-the-comm'&&selfCard){const card=selfCard.cloneNode(true);card.dataset.services=(p.services||[]).join(' ');card.dataset.projectSlug=p.slug;if(!en)card.classList.add('portfolio-piece');card.querySelector('h3').textContent=translated(p,'title');return card;}
 const article=document.createElement('article');article.className='project-card';article.dataset.projectCard='';article.dataset.projectSlug=p.slug;if(!en)article.classList.add('portfolio-piece');article.dataset.services=(p.services||[]).join(' ');
 article.innerHTML=`<a class="project-visual" href="${href}">${cover?`<div class="portfolio-shot"><div class="shot-frame"><span class="shot-bar" aria-hidden="true"></span><img class="project-image-real" loading="lazy" width="1440" height="900" src="${E(cover)}" alt="${E(translated(p,'title'))} — 제작 화면 캡처"></div></div>`:`<div class="project-text-cover"><strong>${E(translated(p,'title'))}</strong><span>${E(translated(p,'summary'))}</span></div>`}<span class="project-open">${arrow}<span class="sr-only">${t('프로젝트 보기','View project')}</span></span></a><div class="project-caption"><div><span class="eyebrow">${E(p.type||translated(p,'industry'))} · ${E(p.year)}</span><a href="${href}"><h3>${E(translated(p,'title'))}</h3></a></div><p>${(p.services||[]).map(id=>{const s=data.services?.find(s=>s.id===id);return E(s?t(s.ko,s.en):id);}).join(' · ')}</p>${!en?`<p class="portfolio-summary">${E(p.summary)}</p>`:''}</div>`;return article;
}
// Posters and book covers sit on the board as objects; screen captures get a browser frame.
function markPosters(){document.querySelectorAll('.portfolio-shot img,[data-case-cover] img,.evidence-image-link img').forEach(img=>{const host=img.closest('.portfolio-shot,[data-case-cover],.evidence-image-link');const apply=()=>{if(img.naturalWidth)host.classList.toggle('is-poster',img.naturalWidth/img.naturalHeight<1.2);};if(img.complete)apply();else img.addEventListener('load',apply,{once:true});});}
markPosters();
function renderProjects(){if(!list)return;const filtered=projects.filter(p=>activeFilter==='all'||(p.services||[]).some(s=>s===activeFilter||(activeFilter==='strategy'&&s==='consulting')));list.replaceChildren(...filtered.slice(0,visibleCount).map(projectMarkup));const empty=document.querySelector('.project-empty');if(empty)empty.hidden=filtered.length>0;const more=document.querySelector('[data-load-more]');if(more)more.hidden=filtered.length<=visibleCount;markPosters();document.dispatchEvent(new CustomEvent('portfolio:updated'));}
function buildFilters(){const bar=document.querySelector('[data-project-filters]');if(!bar)return;const ids=new Set(projects.flatMap(p=>(p.services||[]).map(id=>id==='consulting'?'strategy':id)));bar.replaceChildren();for(const id of ['all',...data.services.filter(s=>s.id!=='consulting'&&ids.has(s.id)).map(s=>s.id)]){const b=document.createElement('button');b.type='button';b.dataset.filter=id;b.setAttribute('aria-pressed',String(id===activeFilter));const s=data.services.find(s=>s.id===id);b.textContent=id==='all'?t('전체','All'):id==='strategy'?t('전략·컨설팅','Strategy & consulting'):id==='it'?t('웹·UI/UX·개발',s.en):t(s.ko,s.en);b.addEventListener('click',()=>{activeFilter=id;visibleCount=6;bar.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));renderProjects();});bar.append(b);}}
const projectsReady=list?fetch('/api/projects'+(en?'?lang=en':''),{headers:{Accept:'application/json'}}).then(r=>{if(!r.ok)throw Error('Unavailable');return r.json();}).then(result=>{projects=result.projects||[];if(list.hasAttribute('data-featured')){projects=projects.filter(p=>p.featured&&(en||p.slug!=='all-the-comm'));if(!en)projects=projects.slice(0,3);}buildFilters();renderProjects();}).catch(()=>{document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));document.querySelectorAll('[data-project-card]').forEach(c=>c.hidden=b.dataset.filter!=='all'&&!c.dataset.services?.split(' ').includes(b.dataset.filter));}));}):Promise.resolve();
document.querySelector('[data-load-more]')?.addEventListener('click',()=>{visibleCount+=6;renderProjects();});

if(document.body.classList.contains('case-page')){
 const match=location.pathname.match(/\/works\/project\/([^/]+)\/?$/),slug=match&&decodeURIComponent(match[1]);
 if(slug)document.body.dataset.caseSlug=slug;
 if(slug)fetch('/api/projects/'+encodeURIComponent(slug)+(en?'?lang=en':'')).then(async r=>{if(!r.ok)throw Error(String(r.status));return r.json();}).then(({project:p})=>{
   if(!p)throw Error('missing');document.title=translated(p,'title')+' — ALL THE COMMUNICATION';
   for(const [target,key] of [['title','title'],['summary','summary'],['client','client'],['scope','scope'],['year','year'],['problem','problem'],['strategy','strategy'],['execution','execution'],['result','result']]){const el=document.querySelector('[data-case-'+target+']');if(el&&!(en&&slug==='all-the-comm'&&!p[key+'En'])){el.textContent=translated(p,key);if(en&&!p[key+'En']&&/[가-힣]/.test(el.textContent))el.lang='ko';}}
   const canonical=document.querySelector('link[rel=canonical]');if(canonical)canonical.href=new URL(U('/works/project/'+slug+'/'),canonical.href).href;
   document.querySelectorAll('link[rel=alternate]').forEach(link=>{if(p.englishPublished===false&&link.hreflang==='en'){link.remove();return;}const prefix=link.hreflang==='en'?'/en':'';link.href=new URL(prefix+'/works/project/'+slug+'/',link.href).href;});
   const languageLink=document.querySelector('[data-lang]');if(languageLink)languageLink.href=p.englishPublished===false?'/en/works/':(en?'':'/en')+'/works/project/'+slug+'/';
   const type=document.querySelector('[data-case-type]');if(type&&slug!=='all-the-comm')type.textContent=[translated(p,'type'),p.year].filter(Boolean).join(' · ');
   const cta=document.querySelector('.case-result .button');if(cta)cta.href=U('/contact/?project='+encodeURIComponent(slug));
   if(slug!=='all-the-comm'){
     document.querySelectorAll('.case-story h2').forEach((el,i)=>el.textContent=[t('프로젝트의 과제','The challenge'),t('실행의 방향','The strategy'),t('만들고 실행한 일','The execution')][i]);
     const cover=safeURL(p.coverImage||p.cover||'');const host=document.querySelector('[data-case-cover]');host.replaceChildren();if(cover){const img=new Image();img.src=cover;img.alt=translated(p,'title');host.append(img);markPosters();}
     const film=document.querySelector('.case-film');film.replaceChildren();for(const url of p.videoUrls||[]){const safe=safeURL(url);if(!safe)continue;const a=document.createElement('a');a.href=safe;a.textContent=t('프로젝트 영상 보기','Watch project video');a.className='text-link';a.target='_blank';a.rel='noopener';film.append(a);}
   }
   const gallery=document.querySelector('[data-case-gallery]');for(const media of p.images||[]){const url=safeURL(media.url);if(!url)continue;const figure=document.createElement('figure'),img=new Image();img.src=url;img.alt=media.alt||translated(p,'title');img.loading='lazy';img.className='case-gallery-img';figure.append(img);if(media.caption){const c=document.createElement('figcaption');c.textContent=media.caption;figure.append(c);}gallery.append(figure);}if(!en){document.body.classList.add('capture-case');document.querySelector('.case-facts dt').textContent='PROJECT';mountCaptureViewer();document.dispatchEvent(new CustomEvent('portfolio:updated'));}
 }).catch(()=>{if(slug!=='all-the-comm'){const main=document.querySelector('main');main.replaceChildren();const el=document.createElement('section');el.className='page-error';el.innerHTML=`<h1>${t('프로젝트를 찾을 수 없습니다.','Project not found.')}</h1><p><a class="text-link" href="${U('/works/')}">${t('프로젝트 목록으로','Back to projects')}${arrow}</a></p>`;main.append(el);}});
}

const form=document.querySelector('#inquiry-form');
if(form){
 if(!en){
   const input=form.elements.attachments,control=document.createElement('div'),display=document.createElement('div'),trigger=document.createElement('span'),names=document.createElement('span');
   control.className='attachment-control';display.className='attachment-display';trigger.className='attachment-trigger';names.className='attachment-names';
   trigger.textContent='파일 선택';names.setAttribute('role','status');names.setAttribute('aria-live','polite');
   display.append(trigger,names);input.before(control);control.append(input,display);
   const describeFiles=()=>{names.textContent=input.files.length?[...input.files].map(file=>file.name).join(' · '):'선택한 파일이 없습니다';};
   input.addEventListener('change',describeFiles);form.addEventListener('reset',()=>queueMicrotask(describeFiles));describeFiles();
 }
 const status=document.querySelector('#form-status'),submit=form.querySelector('[type=submit]');let submissionKey=crypto.randomUUID(),busy=false;
 const query=new URLSearchParams(location.search),requested=[query.get('service'),...(query.get('services')||'').split(',')].filter(Boolean);if(requested.length)form.querySelectorAll('[name=services]').forEach(input=>input.checked=requested.includes(input.value));
 const projectName=new URLSearchParams(location.search).get('project');if(projectName)form.elements.message.value=t('프로젝트 참고: ','Project reference: ')+projectName+'\n';
 const show=(message,state='error')=>{status.textContent=message;status.dataset.state=state;};
 form.addEventListener('invalid',()=>show(t('필수 입력 항목을 확인해 주세요.','Please check the required fields.')),true);
 form.addEventListener('input',()=>{if(!busy&&status.dataset.state==='success'){status.textContent='';delete status.dataset.state;}});
 const fileBase64=file=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=()=>reject(Error(t('파일을 읽을 수 없습니다.','Could not read the file.')));reader.readAsDataURL(file);});
 form.addEventListener('submit',async event=>{
   event.preventDefault();if(busy)return;if(!form.reportValidity())return;const f=new FormData(form),services=f.getAll('services');if(!services.length){show(t('관심 서비스를 한 개 이상 선택해 주세요.','Choose at least one service.'));form.querySelector('[name=services]').focus();return;}
   const files=[...form.elements.attachments.files];if(files.length>3||files.some(f=>f.size>3*1024*1024||!['application/pdf','image/jpeg','image/png'].includes(f.type))){show(t('PDF·JPG·PNG 파일만 최대 3개, 파일당 3MB까지 첨부할 수 있습니다.','Attach up to 3 PDF, JPG or PNG files, at most 3MB each.'));form.elements.attachments.focus();return;}
   busy=true;submit.disabled=true;form.setAttribute('aria-busy','true');show(t('문의 내용을 접수하고 있습니다.','Submitting your enquiry…'),'loading');
   try{
     const payload={company:f.get('company'),name:f.get('name'),phone:f.get('phone'),email:f.get('email'),services,message:f.get('message'),budget:f.get('budget'),schedule:f.get('schedule'),consent:f.get('consent')==='on',website:f.get('website'),locale,submissionKey,attachments:await Promise.all(files.map(async file=>({name:file.name,type:file.type,dataBase64:await fileBase64(file)})))};
     const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),30000);let response;try{response=await fetch('/api/inquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:controller.signal});}finally{clearTimeout(timer);}
     const result=await response.json().catch(()=>({}));if(!response.ok||!result.ok)throw Error(response.status===429?t('접수가 잠시 제한되었습니다. 잠시 후 다시 시도하거나 전화·이메일로 연락해 주세요.','Please wait before trying again, or contact us by phone or email.'):t('접수하지 못했습니다. 입력 내용은 유지됩니다. 다시 시도하거나 전화·이메일로 연락해 주세요.','We couldn’t submit your enquiry. Your entries are preserved. Try again or contact us by phone or email.'));
     show(t('문의가 접수되었습니다. 접수번호: ','Your enquiry has been received. Reference: ')+result.id,'success');form.reset();submissionKey=crypto.randomUUID();status.focus();
   }catch(error){show(error.name==='AbortError'?t('응답을 기다리지 못했습니다. 입력 내용을 유지했습니다. 다시 시도하면 중복 접수를 확인합니다.','The response timed out. Your entries are preserved; retrying checks for duplicates.'):error.message);status.focus();}
   finally{busy=false;submit.disabled=false;form.removeAttribute('aria-busy');}
 });
}

// Heavy graphics load separately after the accessible page and controls are ready.
let cleanupMotion,cleanupIsos,cleanupStory,cleanupEvidence,cleanupAgencyHero,routeAlive=true;
const loadEnhancements=async()=>{
 if(en)return;
 if(document.querySelector('[data-story]')){const m=await import('./story/story.js').catch(()=>null);if(routeAlive&&m){cleanupStory?.();cleanupStory=m.initStory();}return;}
 const results=await Promise.allSettled([import('./isos-motion.js'),import('./scroll-story.js'),import('./evidence-motion.js'),document.querySelector('.agency-hero')?import('./agency-hero.js'):Promise.resolve(null)]);
 if(!routeAlive)return;
 cleanupIsos?.();cleanupStory?.();cleanupEvidence?.();cleanupAgencyHero?.();
 if(results[0].status==='fulfilled')cleanupIsos=results[0].value.initIsosMotion();
 if(results[1].status==='fulfilled')cleanupStory=results[1].value.initScrollStory();
 if(results[2].status==='fulfilled')cleanupEvidence=results[2].value.initEvidenceMotion();
 if(results[3].status==='fulfilled'&&results[3].value)cleanupAgencyHero=results[3].value.initAgencyHero();
};
let enhancementsReady=loadEnhancements();
// Entry links must align after fonts, project data and the initial layout settle.
// Yield immediately if the visitor begins scrolling or using the page.
if(!en&&['#healthcare-expertise','#projects','#services'].includes(location.hash)){
 const initialHash=location.hash;
 let interrupted=false;
 const stop=()=>{interrupted=true;};
 const events=['wheel','touchstart','pointerdown','keydown'];
 events.forEach(name=>addEventListener(name,stop,{once:true,passive:true}));
 const loaded=document.readyState==='complete'?Promise.resolve():new Promise(resolve=>addEventListener('load',resolve,{once:true}));
 Promise.all([enhancementsReady,projectsReady,document.fonts?.ready,loaded]).then(()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{
  if(!interrupted&&routeAlive&&location.hash===initialHash)document.querySelector(initialHash)?.scrollIntoView({behavior:'instant',block:'start'});
  events.forEach(name=>removeEventListener(name,stop));
 })));
}
const loadMotion=()=>document.querySelector('[data-story]')?Promise.resolve():enhancementsReady.then(()=>import('./motion.js')).then(module=>{if(routeAlive){cleanupMotion?.();cleanupMotion=module.initMotion();}}).catch(()=>{document.querySelector('.hero-art')?.setAttribute('data-renderer','fallback');});
if('requestIdleCallback'in window)requestIdleCallback(loadMotion,{timeout:1200});else setTimeout(loadMotion,50);
addEventListener('pagehide',()=>{routeAlive=false;cleanupMotion?.();cleanupIsos?.();cleanupStory?.();cleanupEvidence?.();cleanupAgencyHero?.();});
addEventListener('pageshow',event=>{if(event.persisted){routeAlive=true;enhancementsReady=loadEnhancements();loadMotion();}});

// Korean portfolio refinement. Existing English presentation is kept for the later batch.
if(!en&&(document.body.classList.contains('works-page')||document.body.classList.contains('case-page')||list)){let release;const init=()=>import('./portfolio-motion.js').then(m=>{release?.();release=m.initPortfolioMotion();}).catch(()=>{});init();addEventListener('pagehide',()=>release?.());addEventListener('pageshow',event=>{if(event.persisted)init();});}
function mountCaptureViewer(){
 if(document.querySelector('#capture-viewer'))return;
 const shots=[...document.querySelectorAll('[data-case-cover]>img,[data-case-cover] .evidence-self-shot img,.evidence-self-detail img,[data-case-gallery] img')];if(!shots.length)return;
 const viewer=document.createElement('dialog');viewer.id='capture-viewer';viewer.setAttribute('aria-label','작업 화면 확대 보기');viewer.innerHTML='<div class="viewer-toolbar"><span>작업 화면</span><button type="button" data-viewer-scale aria-pressed="false">원본 크기</button><button type="button" data-viewer-close aria-label="확대 화면 닫기">닫기 ×</button></div><div class="viewer-scroll"><img alt=""></div>';document.body.append(viewer);
 const image=viewer.querySelector('img'),scale=viewer.querySelector('[data-viewer-scale]');let returnFocus;
 shots.forEach(img=>{const button=document.createElement('button');button.type='button';button.className='capture-open';button.setAttribute('aria-label',(img.alt||'작업 화면')+' 확대 보기');img.replaceWith(button);button.append(img);const hint=document.createElement('span');hint.className='capture-hint';hint.textContent='화면 크게 보기 ↗';button.append(hint);button.addEventListener('click',()=>{returnFocus=button;image.src=img.currentSrc||img.src;image.alt=img.alt;viewer.querySelector('.viewer-toolbar>span').textContent=img.alt||'작업 화면';viewer.classList.remove('is-original');scale.setAttribute('aria-pressed','false');scale.textContent='원본 크기';viewer.showModal();document.body.classList.add('viewer-open');viewer.querySelector('[data-viewer-close]').focus();});});
 scale.addEventListener('click',()=>{const full=viewer.classList.toggle('is-original');scale.setAttribute('aria-pressed',String(full));scale.textContent=full?'화면에 맞추기':'원본 크기';});
 viewer.querySelector('[data-viewer-close]').addEventListener('click',()=>viewer.close());viewer.addEventListener('close',()=>{document.body.classList.remove('viewer-open');returnFocus?.focus();});viewer.addEventListener('click',e=>{if(e.target===viewer)viewer.close();});viewer.addEventListener('keydown',e=>{if(e.key!=='Tab')return;e.preventDefault();const targets=[scale,viewer.querySelector('[data-viewer-close]')],i=targets.indexOf(document.activeElement);targets[(i+1)%targets.length].focus();});
}
