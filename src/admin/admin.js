'use strict';
let csrf = '', projects = [], serviceList = [], currentProject = null;
const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stateName = status => ({new:'새 문의','in-progress':'진행 중',closed:'처리 완료'}[status] || status);
function notice(message, error = false) { const box=$('#status');box.textContent=message;box.classList.toggle('error',error);box.hidden=false; }
async function api(url, options = {}) {
  const response = await fetch(url,{ ...options, headers:{'Content-Type':'application/json',...(csrf?{'X-CSRF-Token':csrf}:{}),...options.headers} });
  const value=await response.json();
  if(!response.ok){const detail=Object.entries(value.fields||{}).map(([key,message])=>`${key}: ${message}`).join(' ');throw new Error(value.error+(detail?' '+detail:''));}
  return value;
}
async function signedIn() {
  $('#login-panel').hidden=true;$('#workspace').hidden=false;$('#logout').hidden=false;
  if(!serviceList.length){serviceList=(await api('/api/services')).services.filter(s=>s.id!=='other');$('#project-services').innerHTML=serviceList.map(s=>`<label><input type="checkbox" name="services" value="${esc(s.id)}">${esc(s.name)}</label>`).join('');}
  await loadInquiries();
}
$('#login-form').addEventListener('submit',async event=>{event.preventDefault();const button=event.submitter;button.disabled=true;try{const result=await api('/api/admin/login',{method:'POST',body:JSON.stringify({password:event.target.password.value})});csrf=result.csrf;event.target.reset();$('#status').hidden=true;await signedIn();}catch(error){notice(error.message,true);}finally{button.disabled=false;}});
$('#logout').addEventListener('click',async()=>{try{await api('/api/admin/logout',{method:'POST',body:'{}'});csrf='';$('#workspace').hidden=true;$('#login-panel').hidden=false;$('#logout').hidden=true;$('#login-form input').focus();notice('로그아웃했습니다.');}catch(error){notice(error.message,true);}});
document.querySelectorAll('[data-tab]').forEach(button=>button.addEventListener('click',async()=>{document.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));const tab=button.dataset.tab;$('#inquiries-panel').hidden=tab!=='inquiries';$('#projects-panel').hidden=tab!=='projects';try{await(tab==='projects'?loadProjects():loadInquiries());}catch(error){notice(error.message,true);}}));
async function loadInquiries(){
  const {inquiries}=await api('/api/admin/inquiries');$('#inquiry-count').textContent=`(${inquiries.length})`;
  $('#inquiry-list').innerHTML=inquiries.length?inquiries.map(i=>`<article class="list-item"><div><h3>${esc(i.company)} · ${esc(i.name)}</h3><p><span class="badge">${esc(stateName(i.status))}</span>${esc(new Date(i.receivedAt).toLocaleString('ko-KR'))} · ${esc(i.locale)} · 첨부 ${i.attachmentCount}개</p><p>${esc(i.preview)}</p></div><button type="button" class="secondary" data-inquiry="${esc(i.id)}">상세 확인</button></article>`).join(''):'<p class="empty">아직 접수된 문의가 없습니다.</p>';
  document.querySelectorAll('[data-inquiry]').forEach(button=>button.addEventListener('click',()=>openInquiry(button.dataset.inquiry).catch(e=>notice(e.message,true))));
}
$('#refresh-inquiries').addEventListener('click',()=>loadInquiries().catch(e=>notice(e.message,true)));
async function openInquiry(id){
  const {inquiry:i}=await api(`/api/admin/inquiries/${id}`);const target=$('#inquiry-detail');target.hidden=false;
  const names=i.services.map(id=>serviceList.find(s=>s.id===id)?.name||'기타').join(', ');
  target.innerHTML=`<div class="toolbar"><h2>${esc(i.company)} · 문의 상세</h2><button type="button" class="secondary" id="close-inquiry">닫기</button></div><dl><dt>접수 번호</dt><dd>${esc(i.id)}</dd><dt>접수 일시</dt><dd>${esc(new Date(i.receivedAt).toLocaleString('ko-KR'))}</dd><dt>담당자</dt><dd>${esc(i.name)}</dd><dt>회신 연락처</dt><dd>${esc(i.phone)} · ${esc(i.email)}</dd><dt>관심 서비스</dt><dd>${esc(names)}</dd><dt>예산 · 일정</dt><dd>${esc(i.budget||'미정')} · ${esc(i.schedule||'미정')}</dd><dt>동의 기록</dt><dd>${i.consent?'동의함':'미확인'} · 안내 버전 ${esc(i.consentVersion)}</dd><dt>전달 상태</dt><dd>접수함 저장 완료 · 이메일 알림 미연결</dd></dl><div class="inquiry-message">${esc(i.message)}</div><h3>첨부파일</h3><div class="attachments">${i.attachments.length?i.attachments.map(a=>`<a class="button secondary" href="/api/admin/inquiries/${esc(i.id)}/attachments/${esc(a.id)}">${esc(a.name)} (${Math.ceil(a.size/1024)}KB) ↓</a>`).join(''):'<p class="muted">첨부 없음</p>'}</div><label>처리 상태<select id="inquiry-state">${['new','in-progress','closed'].map(s=>`<option value="${s}"${s===i.status?' selected':''}>${stateName(s)}</option>`).join('')}</select></label><div class="toolbar"><button type="button" id="save-inquiry-state">상태 저장</button></div>`;
  $('#close-inquiry').addEventListener('click',()=>{target.hidden=true;});
  $('#save-inquiry-state').addEventListener('click',async()=>{try{await api(`/api/admin/inquiries/${id}`,{method:'PATCH',body:JSON.stringify({status:$('#inquiry-state').value})});await loadInquiries();notice('문의 상태를 저장했습니다.');}catch(error){notice(error.message,true);}});
  target.scrollIntoView({behavior:'smooth',block:'start'});
}
async function loadProjects(){
  ({projects}=await api('/api/admin/projects'));
  $('#project-list').innerHTML=projects.length?projects.map((p,index)=>`<article class="list-item"><div><h3>${esc(p.title)}</h3><p><span class="badge">${p.status==='published'?'공개':'비공개 초안'}</span>${esc(p.client)} · ${esc(p.year)} · ${esc(p.slug)}</p></div><div class="list-actions"><button class="secondary" type="button" data-move="${esc(p.id)}" data-direction="-1"${index===0?' disabled':''} aria-label="${esc(p.title)} 위로">↑</button><button class="secondary" type="button" data-move="${esc(p.id)}" data-direction="1"${index===projects.length-1?' disabled':''} aria-label="${esc(p.title)} 아래로">↓</button><button type="button" data-project="${esc(p.id)}">편집</button></div></article>`).join(''):'<p class="empty">등록된 프로젝트가 없습니다.</p>';
  document.querySelectorAll('[data-project]').forEach(button=>button.addEventListener('click',()=>editProject(projects.find(p=>p.id===button.dataset.project))));
  document.querySelectorAll('[data-move]').forEach(button=>button.addEventListener('click',async()=>{try{const ids=projects.map(p=>p.id),index=ids.indexOf(button.dataset.move),other=index+Number(button.dataset.direction);[ids[index],ids[other]]=[ids[other],ids[index]];await api('/api/admin/projects/reorder',{method:'POST',body:JSON.stringify({ids})});await loadProjects();notice('사례 순서를 변경했습니다.');}catch(error){notice(error.message,true);}}));
}
function editProject(project=null){
  currentProject=project?structuredClone(project):null;
  const form=$('#project-form');form.reset();
  for(const field of ['slug','title','titleEn','summary','summaryEn','client','clientEn','type','typeEn','year','period','industry','industryEn','scope','scopeEn','problem','problemEn','strategy','strategyEn','execution','executionEn','result','resultEn','publicationNote','coverImage','status','order']) if(project && form.elements[field])form.elements[field].value=project[field]??'';
  form.elements.videoUrls.value=(project?.videoUrls||[]).join('\n');
  form.elements.englishPublished.checked=project?.englishPublished!==false;form.elements.featured.checked=project?.featured===true;form.elements.publicationConfirmed.checked=project?.publicationConfirmed===true;
  form.querySelectorAll('[name=services]').forEach(box=>box.checked=(project?.services||[]).includes(box.value));
  $('#editor-title').textContent=project?'사례 편집':'새 사례 등록';$('#project-editor').hidden=false;$('#delete-project').hidden=!project;$('#upload-image').disabled=!project;
  $('#project-preview').hidden=project?.status!=='published';if(project)$('#project-preview').href=`/works/project/${project.slug}/`;
  renderMedia();$('#project-editor').scrollIntoView({behavior:'smooth',block:'start'});
}
function renderMedia(){
  $('#project-media').innerHTML=(currentProject?.images||[]).map(i=>`<div class="media-item" data-media="${esc(i.id)}"><img src="${esc(i.url)}" alt="${esc(i.alt||'등록된 작업 이미지')}"><label>이미지 설명<input data-alt maxlength="300" value="${esc(i.alt)}"></label><label>캡션<input data-caption maxlength="500" value="${esc(i.caption)}"></label><button type="button" class="secondary" data-cover="${esc(i.url)}">대표 이미지로 선택</button></div>`).join('');
  document.querySelectorAll('[data-cover]').forEach(button=>button.addEventListener('click',()=>{$('#project-form').elements.coverImage.value=button.dataset.cover;notice('저장하면 대표 이미지에 반영됩니다.');}));
}
$('#new-project').addEventListener('click',()=>editProject());$('#close-editor').addEventListener('click',()=>{$('#project-editor').hidden=true;});
$('#project-form').addEventListener('submit',async event=>{
  event.preventDefault();const form=event.target;const data=Object.fromEntries(new FormData(form));data.services=[...form.querySelectorAll('[name=services]:checked')].map(i=>i.value);data.englishPublished=form.elements.englishPublished.checked;data.featured=form.elements.featured.checked;data.publicationConfirmed=form.elements.publicationConfirmed.checked;data.order=Number(data.order);data.videoUrls=data.videoUrls.split('\n').map(s=>s.trim()).filter(Boolean);
  data.images=[...document.querySelectorAll('[data-media]')].map(el=>({id:el.dataset.media,alt:el.querySelector('[data-alt]').value,caption:el.querySelector('[data-caption]').value}));
  const button=event.submitter;button.disabled=true;
  try{const {project}=await api(currentProject?`/api/admin/projects/${currentProject.id}`:'/api/admin/projects',{method:currentProject?'PUT':'POST',body:JSON.stringify(data)});await loadProjects();editProject(projects.find(p=>p.id===project.id));notice('사례를 저장했습니다. 공개 상태와 이미지 반영을 확인해 주세요.');}catch(error){notice(error.message,true);}finally{button.disabled=false;}
});
function fileBase64(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=()=>reject(new Error('파일을 읽을 수 없습니다.'));reader.readAsDataURL(file);});}
$('#upload-image').addEventListener('click',async event=>{const file=$('#image-upload').files[0];if(!file||!currentProject){notice('저장한 사례와 업로드할 이미지를 선택해 주세요.',true);return;}if(file.size>3*1024*1024){notice('이미지는 3MB 이하여야 합니다.',true);return;}event.currentTarget.disabled=true;try{await api(`/api/admin/projects/${currentProject.id}/media`,{method:'POST',body:JSON.stringify({name:file.name,type:file.type,dataBase64:await fileBase64(file)})});await loadProjects();currentProject=projects.find(p=>p.id===currentProject.id);renderMedia();$('#image-upload').value='';notice('이미지를 등록했습니다. 설명과 캡션을 입력하고 사례를 저장해 주세요.');}catch(error){notice(error.message,true);}finally{$('#upload-image').disabled=false;}});
$('#delete-project').addEventListener('click',async()=>{if(!currentProject||!confirm('이 사례를 삭제할까요? 공개 페이지에서도 내려갑니다. 이 작업은 되돌릴 수 없습니다.'))return;try{await api(`/api/admin/projects/${currentProject.id}`,{method:'DELETE',body:'{}'});currentProject=null;$('#project-editor').hidden=true;await loadProjects();notice('사례를 삭제했습니다.');}catch(error){notice(error.message,true);}});
(async()=>{try{const session=await api('/api/admin/session');csrf=session.csrf;await signedIn();}catch{$('#login-panel').hidden=false;}})();
