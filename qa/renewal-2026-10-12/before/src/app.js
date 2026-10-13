document.documentElement.classList.add('js');
const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
const menu=document.querySelector('#mobile-menu');
const menuToggle=document.querySelector('.menu-toggle');
if(menu&&menuToggle){
 const closeMenu=()=>{menu.close();};
 menuToggle.addEventListener('click',()=>{menu.showModal();menuToggle.setAttribute('aria-expanded','true');document.body.classList.add('menu-open');});
 menu.querySelector('.menu-close').addEventListener('click',closeMenu);
 menu.addEventListener('close',()=>{menuToggle.setAttribute('aria-expanded','false');document.body.classList.remove('menu-open');menuToggle.focus();});
 menu.addEventListener('click',e=>{if(e.target===menu)closeMenu();});
 window.addEventListener('resize',()=>{if(innerWidth>760&&menu.open)closeMenu();},{passive:true});
}
if(!reduce.matches&&'IntersectionObserver'in window){
 document.body.classList.add('motion-ready');
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.08});
 document.querySelectorAll('[data-reveal]').forEach(el=>observer.observe(el));
}
const art=document.querySelector('[data-art]');
const expression=document.querySelector('[data-expression]');
const motionToggle=document.querySelector('.motion-toggle');
let paused=false,queued=false;
const clamp=(value,min=0,max=1)=>Math.min(max,Math.max(min,value));
function updateMotion(){
 queued=false;if(reduce.matches||paused)return;
 if(art){const rect=art.getBoundingClientRect();if(rect.bottom>0&&rect.top<innerHeight){const p=clamp((innerHeight-rect.top)/(innerHeight+rect.height));art.style.setProperty('--art-p',p.toFixed(3));}}
 if(expression&&innerWidth>760){const rect=expression.getBoundingClientRect();const p=clamp(-rect.top/(rect.height-innerHeight));expression.style.setProperty('--scene',p.toFixed(3));}
}
function queueMotion(){if(!queued){queued=true;requestAnimationFrame(updateMotion);}}
window.addEventListener('scroll',queueMotion,{passive:true});window.addEventListener('resize',queueMotion,{passive:true});
if(art){art.addEventListener('pointermove',e=>{if(reduce.matches||paused||e.pointerType!=='mouse')return;const rect=art.getBoundingClientRect();art.style.setProperty('--art-x',clamp((e.clientX-rect.left)/rect.width*2-1,-1,1).toFixed(3));});art.addEventListener('pointerleave',()=>art.style.setProperty('--art-x','0'));}
if(motionToggle)motionToggle.addEventListener('click',()=>{paused=!paused;motionToggle.setAttribute('aria-pressed',String(paused));motionToggle.textContent=paused?'모션 재생':'모션 정지';if(!paused)queueMotion();});
reduce.addEventListener('change',()=>{if(reduce.matches){document.body.classList.remove('motion-ready');art?.style.removeProperty('--art-p');art?.style.removeProperty('--art-x');expression?.style.removeProperty('--scene');}else queueMotion();});
queueMotion();
document.querySelectorAll('[data-glass]').forEach(card=>{
 let frame=0;
 card.addEventListener('pointermove',event=>{
  if(reduce.matches||event.pointerType!=='mouse')return;
  if(frame)cancelAnimationFrame(frame);
  frame=requestAnimationFrame(()=>{
   const rect=card.getBoundingClientRect();
   const x=(event.clientX-rect.left)/rect.width,y=(event.clientY-rect.top)/rect.height;
   card.style.setProperty('--glass-x',x.toFixed(3));card.style.setProperty('--glass-y',y.toFixed(3));
   card.style.setProperty('--glass-rx',((.5-y)*5).toFixed(2)+'deg');card.style.setProperty('--glass-ry',((x-.5)*5).toFixed(2)+'deg');
  });
 });
 card.addEventListener('pointerleave',()=>{
  if(frame)cancelAnimationFrame(frame);card.style.setProperty('--glass-rx','0deg');card.style.setProperty('--glass-ry','0deg');
 });
});
const form=document.querySelector('#inquiry-form');
if(form){
 const requested=new URLSearchParams(location.search).get('service');
 for(const box of form.querySelectorAll('input[name="service"]'))if(box.value===requested)box.checked=true;
 let draft='';
 const labels={strategy:'마케팅 전략',design:'디자인·홈페이지',content:'콘텐츠·영상',campaign:'광고·홍보 운영',discuss:'범위 협의'};
 form.addEventListener('submit',event=>{
  event.preventDefault();if(!form.reportValidity())return;
  const data=new FormData(form);
  const selected=data.getAll('service').map(key=>labels[key]||key).join(', ')||'상담 후 결정';
  draft=`[프로젝트 문의]\n\n회사·기관: ${String(data.get('company')).trim()}\n담당자: ${String(data.get('name')).trim()}\n회신 이메일: ${String(data.get('email')).trim()}\n필요한 업무: ${selected}\n\n${String(data.get('message')).trim()}`;
  const subject=`[프로젝트 문의] ${String(data.get('company')).trim()}`;
  const mail=`mailto:allthecom1@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(draft)}`;
  const result=form.querySelector('.draft-result');result.hidden=false;
  const open=document.querySelector('#open-email');open.href=mail;
  // The visitor explicitly opens and sends the prepared message in their email app.
  result.scrollIntoView({behavior:reduce.matches?'instant':'smooth',block:'nearest'});
  open.focus({preventScroll:true});
 });
 document.querySelector('#copy-inquiry').addEventListener('click',async e=>{
  try{await navigator.clipboard.writeText(draft);e.currentTarget.textContent='복사했습니다';}
  catch{e.currentTarget.textContent='텍스트로 저장해 주세요';}
 });
 document.querySelector('#download-inquiry').addEventListener('click',()=>{
  const objectURL=URL.createObjectURL(new Blob(['\ufeff'+draft],{type:'text/plain;charset=utf-8'}));
  const a=document.createElement('a');a.href=objectURL;a.download='ALL-THE-COMM-project-inquiry.txt';a.click();setTimeout(()=>URL.revokeObjectURL(objectURL),1000);
 });
}
