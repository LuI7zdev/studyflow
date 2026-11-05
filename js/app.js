'use strict';
const $=s=>document.querySelector(s),D=()=>DB.d;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const today=()=>iso(new Date());
const addD=(s,n)=>{const d=new Date(s+'T12:00:00');d.setDate(d.getDate()+n);return iso(d)};
const dl=(s,o)=>new Date(s+'T12:00:00').toLocaleDateString('pt-BR',o);
const fmt=s=>s?dl(s,{day:'2-digit',month:'short'}):'';
const subj=id=>D().subjects.find(s=>s.id===id);
const hm=m=>m>=60?`${Math.floor(m/60)}h${String(m%60).padStart(2,'0')}`:`${m}min`;
const ic=d=>`<svg viewBox="0 0 24 24"><path d="${d}"/></svg>`;
const txt=h=>{const t=document.createElement('template');t.innerHTML=h;return t.content.textContent};
function clean(html){const t=document.createElement('template');t.innerHTML=html;const ok=new Set(['B','STRONG','I','U','H3','UL','LI','MARK','DIV','BR','P']);
 (function w(n){[...n.childNodes].forEach(c=>{if(c.nodeType===1){if(!ok.has(c.tagName)){if(['SCRIPT','STYLE','IFRAME','OBJECT'].includes(c.tagName))return c.remove();w(c);c.replaceWith(...c.childNodes)}else{[...c.attributes].forEach(a=>c.removeAttribute(a.name));w(c)}}})})(t.content);return t.innerHTML}
function toast(m,t='ok'){const e=$('#toast');e.textContent=m;e.className='show '+t;clearTimeout(toast.t);toast.t=setTimeout(()=>e.className='',2600)}

const NAV=[['home','Início','M3 11l9-8 9 8v10H4z'],['agenda','Agenda','M4 6h16v14H4zM4 10h16M8 3v4M16 3v4'],['mat','Matérias','M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3zM5 17a3 3 0 013-3h11'],['foco','Foco','M12 8v5l3 2M12 21a8 8 0 100-16 8 8 0 000 16zM9 2h6'],['perfil','Perfil','M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 4-6 8-6s8 2 8 6']];
const ST=[['pendente','Pendente'],['andamento','Em andamento'],['concluida','Concluída']];
const PR={alta:'Alta',media:'Média',baixa:'Baixa'};
const CAT=[['aula','Aula'],['prova','Prova'],['trabalho','Trabalho'],['entrega','Entrega'],['pessoal','Compromisso pessoal']],CATL={...Object.fromEntries(CAT),simulado:'Simulado'},cats=()=>D().profile.nivel==='medio'?[...CAT.slice(0,4),['simulado','Simulado'],CAT[4]]:CAT;
const S={tab:'home',mat:'subjects',sid:null,agV:'day',agD:today(),f:{subj:'',prior:'',status:''},q:'',nid:null,pedit:false};
const V={},MT={},A={},C={};
const sOpts=req=>[...(req?[]:[['','Sem matéria']]),...D().subjects.map(s=>[s.id,s.nome])];
const late=t=>t.status!=='concluida'&&t.data&&t.data<today();
const cmpEv=(a,b)=>(a.data+(a.hora||'')).localeCompare(b.data+(b.hora||''));
const studied=d=>D().sessions.filter(s=>s.date===d).reduce((a,s)=>a+(+s.min||0),0);
const empty=(m,l,a)=>`<div class="empty"><p>${m}</p>${l?`<button class="btn" ${a}>${l}</button>`:''}</div>`;
function avg(sid,b){if(!b&&D().profile.nivel==='medio'){const v=[1,2,3,4].map(i=>avg(sid,i)).filter(x=>x!=null);return v.length?v.reduce((a,c)=>a+c,0)/v.length:null}
 const g=D().grades.filter(x=>x.subj===sid&&(!b||(+x.bim||1)===b)&&x.nota!==''&&x.nota!=null&&x.max>0);if(!g.length)return null;
 const w=g.reduce((a,x)=>a+(x.peso>0?x.peso:0),0);
 return w?g.reduce((a,x)=>a+x.nota/x.max*10*(x.peso>0?x.peso:0),0)/w:g.reduce((a,x)=>a+x.nota/x.max*10,0)/g.length}
const W=()=>D().profile.nivel==='superior'?'Disciplinas':'Matérias';
const verdict=a=>a==null?'Sem notas lançadas':a>=D().profile.media?'Aprovado':'Abaixo da média';
function streak(){const ds=new Set(D().sessions.map(s=>s.date));let n=0,d=today();if(!ds.has(d))d=addD(d,-1);while(ds.has(d)){n++;d=addD(d,-1)}return n}

/* ---------- Modais e formulários ---------- */
let CB=null;
const closeM=()=>{$('#modal').className='';$('#modal').innerHTML=''};
const fld=(f,v)=>{const val=v??'';let i;
 if(f.t==='days')return `<div class="fl"><small>${f.l}</small><input type="hidden" name="${f.k}" value="${esc(val)}"><div class="chips2" id="dg">${DS.map((l,n)=>n?`<button type="button" class="${String(val).split(',').includes(String(n))?'on':''}" data-a="dtog" data-id="${n}">${l}</button>`:'').join('')}</div></div>`;
 if(f.t==='img')return `<div class="fl"><small>${f.l}</small><div class="imgp" id="ip" style="${val?`background-image:url(${esc(val)})`:''}">${val?'':'Sem imagem, usa a cor'}</div><input type="hidden" name="${f.k}" value="${esc(val)}"><div class="row"><button type="button" class="btn ghost" data-a="imgpick">Escolher imagem</button><button type="button" class="btn ghost" data-a="imgdel">Usar só a cor</button></div><input type="file" id="imf" data-c="img" accept="image/*" hidden></div>`;
 if(f.t==='select')i=`<select name="${f.k}">${f.o.map(([k,l])=>`<option value="${esc(k)}" ${k==val?'selected':''}>${esc(l)}</option>`).join('')}</select>`;
 else if(f.t==='area')i=`<textarea name="${f.k}" rows="3">${esc(val)}</textarea>`;
 else i=`<input name="${f.k}" ${f.t==='number'?'type="text" inputmode="decimal"':`type="${f.t||'text'}"`} value="${esc(val)}">`;
 return `<label>${f.l}${f.r?' *':''}${i}</label>`};
function modal(title,fields,vals,save,extra=''){const m=$('#modal');
 m.innerHTML=`<div class="sheet"><h2>${title}</h2><form id="f" novalidate>${fields.map(f=>fld(f,vals[f.k])).join('')}<div class="row"><button type="button" class="btn ghost" data-a="close">Cancelar</button><button class="btn">Salvar</button></div>${extra}</form></div>`;
 m.className='open';
 $('#f').onsubmit=e=>{e.preventDefault();const v={};
  for(const f of fields){let x=e.target.elements[f.k].value.trim();
   if(f.r&&!x)return toast(`Preencha: ${f.l}`,'err');
   if(f.t==='number'&&x!==''){x=parseFloat(x.replace(',','.'));if(isNaN(x)||x<(f.min??0))return toast(`Valor inválido: ${f.l}`,'err')}
   v[f.k]=x}
  if(save(v)!==false){closeM();DB.save();render()}}}
function ask(msg,fn,label='Excluir'){CB=fn;const m=$('#modal');m.className='open';m.innerHTML=`<div class="sheet"><h2>${msg}</h2><div class="row"><button class="btn ghost" data-a="close">Cancelar</button><button class="btn danger" data-a="yes">${label}</button></div></div>`}

const TIPOS=['Prova','Teste','Trabalho','Seminário','Atividade','Participação','Simulado','Outro'].map(x=>[x,x]);
const K={
 h:{l:'horario',n:'Aula no horário',f:()=>[{k:'subj',l:'Matéria',t:'select',o:sOpts(1),r:1},{k:'dias',l:'Dias da semana',t:'days'},{k:'ini',l:'Início',t:'time',r:1},{k:'fim',l:'Término',t:'time'},{k:'sala',l:'Sala ou local'}],in:o=>({...o,dias:String(o.dia)}),d:()=>({dias:String((typeof S.hd==='number'?S.hd:new Date().getDay())||1),subj:S.sid||''})},
 s:{l:'subjects',n:'Matéria',f:()=>[{k:'nome',l:'Nome',r:1},{k:'prof',l:'Professor'},{k:'desc',l:'Descrição',t:'area'},{k:'cor',l:'Cor (usada quando não há imagem)',t:'color'},{k:'img',l:'Imagem de fundo (opcional)',t:'img'}],d:()=>({cor:'#0f766e'})},
 t:{l:'tasks',n:'Tarefa',f:()=>[{k:'titulo',l:'Título',r:1},{k:'desc',l:'Descrição',t:'area'},{k:'subj',l:'Matéria',t:'select',o:sOpts()},{k:'data',l:'Data de entrega',t:'date'},{k:'prior',l:'Prioridade',t:'select',o:Object.entries(PR)},{k:'status',l:'Status',t:'select',o:ST},{k:'subs',l:'Subtarefas (uma por linha)',t:'area'}],
  d:()=>({prior:'media',status:'pendente',subj:S.sid||''}),in:o=>({...o,subs:(o.subs||[]).map(s=>s.t).join('\n')}),
  out:(v,o)=>({...v,doneAt:v.status==='concluida'?(o?.doneAt||Date.now()):0,subs:v.subs.split('\n').map(x=>x.trim()).filter(Boolean).map(t=>({t,d:!!(o?.subs||[]).find(s=>s.t===t&&s.d)}))})},
 e:{l:'events',n:'Evento',f:()=>[{k:'titulo',l:'Título',r:1},{k:'desc',l:'Descrição',t:'area'},{k:'data',l:'Data',t:'date',r:1},{k:'hora',l:'Horário',t:'time'},{k:'cat',l:'Categoria',t:'select',o:cats()},{k:'subj',l:'Matéria',t:'select',o:sOpts()},{k:'cor',l:'Cor',t:'color'}],d:()=>({data:S.agD,cat:'aula',cor:'#2563eb',subj:S.sid||''})},
 g:{l:'grades',n:'Atividade avaliativa',f:()=>[{k:'name',l:'Nome da atividade',r:1},{k:'tipo',l:'Tipo',t:'select',o:TIPOS},{k:'subj',l:'Disciplina',t:'select',o:sOpts(1),r:1},{k:'nota',l:'Nota obtida (vazio = sem nota)',t:'number'},{k:'max',l:'Nota máxima',t:'number',r:1,min:0.01},{k:'peso',l:'Peso',t:'number'},...(D().profile.nivel==='medio'?[{k:'bim',l:'Bimestre',t:'select',o:[['1','1º bimestre'],['2','2º bimestre'],['3','3º bimestre'],['4','4º bimestre']]}]:[])],d:()=>{const m=new Date().getMonth()+1;return {max:10,peso:1,tipo:'Prova',bim:String(m<=4?1:m<=7?2:m<=9?3:4),subj:S.sid||''}}},
 n:{l:'notes'}};
function edit(k,id){const c=K[k],L=D()[c.l],o=id&&L.find(x=>x.id===id);
 if((k==='g'||k==='h')&&!D().subjects.length)return toast('Cadastre uma matéria primeiro','err');
 let vals=o?{...o}:c.d();if(c.in&&o)vals=c.in(vals);
 modal((o?'Editar ':'Nova ')+c.n.toLowerCase(),c.f(),vals,v=>{if(c.out)v=c.out(v,o);
  if(k==='h'){const ds=v.dias.split(',').filter(Boolean);if(!ds.length){toast('Escolha ao menos um dia','err');return false}delete v.dias;ds.forEach((d,n)=>{const e={...v,dia:+d};if(o&&n===0)Object.assign(o,e);else L.push({id:DB.uid(),created:Date.now(),...e})});toast('Horário salvo');return}
  if(o)Object.assign(o,v);else L.push({id:DB.uid(),created:Date.now(),...v});toast(o?'Alterações salvas':c.n+' criada')},
  o?`<button type="button" class="btn danger full" data-a="del" data-k="${k}" data-id="${o.id}">Excluir</button>`:'')}
function del(k,id){const c=K[k];ask('Excluir este item? Não é possível desfazer.',()=>{
 D()[c.l]=D()[c.l].filter(x=>x.id!==id);
 if(k==='s'){D().grades=D().grades.filter(g=>g.subj!==id);D().lessons=D().lessons.filter(x=>x.subj!==id);D().horario=D().horario.filter(x=>x.subj!==id);['tasks','events','notes','sessions'].forEach(l=>D()[l].forEach(x=>{if(x.subj===id)x.subj=''}));S.sid=null}
 if(k==='n')S.nid=null;
 DB.save();closeM();render();toast('Excluído')})}

/* ---------- Componentes ---------- */
const evRow=e=>{const s=subj(e.subj);return `<div class="card ev" style="--c:${esc(e.cor||'#2563eb')}" data-a="edit" data-k="e" data-id="${e.id}"><b>${esc(e.titulo)}</b><small>${fmt(e.data)}${e.hora?' às '+esc(e.hora):''}, ${CATL[e.cat]||''}${s?', '+esc(s.nome):''}</small></div>`};
const taskCard=t=>{const s=subj(t.subj),sd=t.subs||[];return `<div class="card task ${late(t)?'late':''}" style="--c:${esc(s?.cor||'#93a39d')}"><div class="top"><button class="chk ${t.status==='concluida'?'on':''}" data-a="tgl" data-id="${t.id}" aria-label="Concluir"></button><div class="grow" data-a="tview" data-id="${t.id}"><b>${esc(t.titulo)}</b><small>${s?esc(s.nome)+', ':''}${t.data?fmt(t.data):'sem data'}${late(t)?', atrasada':''}${t.status==='andamento'?', em andamento':''}</small></div><span class="pill ${t.prior}">${PR[t.prior]||''}</span></div>${sd.length?`<div class="subs">${sd.map((x,i)=>`<label class="sub"><input type="checkbox" data-c="sub" data-id="${t.id}" data-i="${i}" ${x.d?'checked':''}>${esc(x.t)}</label>`).join('')}</div>`:''}</div>`};
const gRow=x=>`<div class="act" data-a="edit" data-k="g" data-id="${x.id}">${esc(x.name)}<small>${x.tipo?esc(x.tipo)+', ':''}${x.nota===''||x.nota==null?'sem nota':x.nota+'/'+x.max}, peso ${x.peso||0}</small></div>`;
const gList=sid=>{const g=D().grades.filter(x=>x.subj===sid);if(!g.length)return '<p class="mut">Nenhuma atividade avaliativa.</p>';
 if(D().profile.nivel!=='medio')return g.map(gRow).join('');
 return [1,2,3,4].map(b=>{const L=g.filter(x=>(+x.bim||1)===b);if(!L.length)return '';const a=avg(sid,b);return `<h3>${b}º bimestre<span class="sum">média ${a==null?'–':a.toFixed(1)}</span></h3>`+L.map(gRow).join('')}).join('')};
const DIAS=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'],DS=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const clsOf=d=>D().horario.filter(x=>x.dia===d).sort((a,b)=>(a.ini||'').localeCompare(b.ini||''));
const clsCard=(x,ed)=>{const s=subj(x.subj);return `<div class="card cls" style="--c:${esc(s?.cor||'#93a39d')}"><div class="ct"><b>${esc(x.ini||'--:--')}</b><small>${esc(x.fim||'')}</small></div><div class="grow"><b>${esc(s?s.nome:'Sem matéria')}</b>${x.sala?`<small>${esc(x.sala)}</small>`:''}</div>${ed?`<button class="ib sm2" data-a="edit" data-k="h" data-id="${x.id}" aria-label="Editar aula">${ic('M4 20h4L19 9l-4-4L4 16zM13 7l4 4')}</button>`:''}</div>`};
const nCard=n=>{const s=subj(n.subj);return `<div class="card" data-a="nedit" data-id="${n.id}"><div class="top"><b class="grow">${esc(n.titulo)}</b><button class="ib" data-a="nfav" data-id="${n.id}" aria-label="Favoritar">${n.fav?'★':'☆'}</button></div><small>${s?esc(s.nome)+': ':''}${esc(txt(n.html||'').slice(0,90))}</small></div>`};
const nlist=()=>{const q=S.q.toLowerCase(),L=D().notes.filter(n=>!q||(n.titulo+' '+txt(n.html||'')).toLowerCase().includes(q)).sort((a,b)=>(b.fav?1:0)-(a.fav?1:0)||(b.upd||0)-(a.upd||0));
 return L.length?L.map(nCard).join(''):empty(D().notes.length?'Nada encontrado.':'Nenhuma anotação ainda. Registre resumos e ideias.','Nova anotação','data-a="nnew"')};
const seg=(items,cur,a)=>`<div class="seg">${items.map(([k,l])=>`<button data-a="${a}" data-id="${k}" class="${cur===k?'on':''}">${l}</button>`).join('')}</div>`;

/* ---------- Telas ---------- */
const pie=it=>{const tot=it.reduce((a,x)=>a+x.n,0);let a0=-Math.PI/2;
 const sl=it.length===1?`<circle cx="60" cy="60" r="56" fill="${esc(it[0].c)}" stroke="none"/>`:it.map(x=>{const a1=a0+x.n/tot*2*Math.PI,P=a=>`${(60+56*Math.cos(a)).toFixed(2)} ${(60+56*Math.sin(a)).toFixed(2)}`,d=`M60 60L${P(a0)}A56 56 0 ${a1-a0>Math.PI?1:0} 1 ${P(a1)}Z`;a0=a1;return `<path d="${d}" fill="${esc(x.c)}" stroke="var(--card)" stroke-width="2"/>`}).join('');
 return `<svg class="pie" viewBox="0 0 120 120" role="img" aria-label="Atividades por matéria">${sl}</svg>`};
function actCard(f){const act=D().subjects.map(s=>({nm:s.nome,c:s.cor,n:D().tasks.filter(x=>x.subj===s.id).length+D().grades.filter(x=>x.subj===s.id).length})).filter(x=>x.n>0);if(!act.length)return f?'<div class="card"><h3 class="t">Atividades por matéria</h3><p class="mut">Cadastre tarefas ou atividades avaliativas para ver aqui o gráfico por matéria.</p></div>':'';
 const tot=act.reduce((a,x)=>a+x.n,0);return `<div class="card"><h3 class="t">Atividades por matéria<span class="sum">${tot} no total</span></h3><div class="pw">${pie(act)}<div class="pl">${act.map(x=>`<div><b style="background:${esc(x.c)}"></b>${esc(x.nm)}<i>${x.n}</i></div>`).join('')}</div></div></div>`}
const LN=()=>window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.LocalNotifications;
const nid=s=>100+Math.abs([...String(s)].reduce((a,c)=>(a*31+c.charCodeAt(0))|0,7))%2000000000;
async function nOk(ask){const l=LN();if(!l)return false;try{let p=await l.checkPermissions();if(p.display!=='granted'&&ask)p=await l.requestPermissions();return p.display==='granted'}catch(e){return false}}
let nTm=0;
function syncNotifs(){clearTimeout(nTm);nTm=setTimeout(doSync,900)}
async function doSync(){const l=LN();if(!l)return;try{
 const pend=(await l.getPending()).notifications.filter(n=>n.id!==1);if(pend.length)await l.cancel({notifications:pend.map(n=>({id:n.id}))});
 if(!D().profile.notif||!(await nOk(false)))return;
 const now=Date.now(),out=[],ch='studyflow';
 const add=(id,title,body,at)=>{if(at.getTime()>now+5000)out.push({id:nid(id),title,body,channelId:ch,schedule:{at,allowWhileIdle:true}})};
 D().tasks.filter(t=>t.status!=='concluida'&&t.data).forEach(t=>{const s=subj(t.subj),b=t.titulo+(s?' ('+s.nome+')':'');add(t.id+'a','Tarefa vence hoje',b,new Date(t.data+'T08:00:00'));add(t.id+'b','Tarefa vence amanhã',b,new Date(addD(t.data,-1)+'T18:00:00'))});
 D().events.filter(e=>e.data).forEach(e=>{const s=subj(e.subj),at=new Date(e.data+'T'+(e.hora||'08:00')+':00');if(e.hora)at.setMinutes(at.getMinutes()-30);add(e.id,(CATL[e.cat]||'Evento')+(e.hora?' às '+e.hora:' hoje'),e.titulo+(s?' ('+s.nome+')':''),at)});
 D().horario.forEach(x=>{if(!x.ini)return;const [h,m]=x.ini.split(':').map(Number),t=h*60+m-15;if(isNaN(t)||t<0)return;const s=subj(x.subj);out.push({id:nid(x.id),title:'Aula em 15 minutos',body:(s?s.nome:'Aula')+(x.sala?', '+x.sala:''),channelId:ch,schedule:{on:{weekday:x.dia+1,hour:Math.floor(t/60),minute:t%60},allowWhileIdle:true}})});
 if(out.length)await l.schedule({notifications:out.slice(0,400)})}catch(e){}}
function tmNotif(on){const l=LN();if(!l)return;if(!on){l.cancel({notifications:[{id:1}]}).catch(()=>{});return}
 nOk(true).then(ok=>{if(!ok||!T.run)return;l.schedule({notifications:[{id:1,title:T.mode==='f'?'Foco concluído!':'Pausa encerrada',body:T.mode==='f'?'Hora de uma pausa.':'Vamos voltar a focar?',channelId:'studyflow',schedule:{at:new Date(T.end),allowWhileIdle:true}}]}).catch(()=>{})})}
function nativeExport(){const CP=window.Capacitor&&window.Capacitor.Plugins;if(!(CP&&CP.Filesystem&&CP.Share))return false;
 CP.Filesystem.writeFile({path:`studyflow-${today()}.json`,data:JSON.stringify({app:'studyflow',v:1,data:D()},null,1),directory:'CACHE',encoding:'utf8'}).then(r=>CP.Share.share({title:'Backup StudyFlow',url:r.uri})).catch(()=>toast('Não foi possível exportar','err'));return true}
const hbar=(l,v,max,c,r)=>`<div class="hb"><span>${esc(l)}</span><div><i style="width:${Math.max(2,Math.min(100,v/max*100))}%;background:${esc(c)}"></i></div><b>${r}</b></div>`;
V.home=()=>{const p=D().profile,t=today(),h=new Date().getHours(),td=studied(t),pc=Math.min(100,Math.round(td/p.meta*100));
 const days=Array.from({length:7},(_,i)=>addD(t,i-6)),vals=days.map(studied),wk=vals.reduce((a,b)=>a+b,0),wp=Math.min(100,Math.round(wk/p.metaSem*100)),mx=Math.max(...vals,p.meta,1);
 const TK=D().tasks,pend=TK.filter(x=>x.status!=='concluida'),lt=pend.filter(late).length,hoje=pend.filter(x=>x.data&&x.data<=t).sort((a,b)=>a.data.localeCompare(b.data));
 const cnt=s=>TK.filter(x=>x.status===s).length,tot=TK.length;
 const as=D().subjects.map(s=>({s,a:avg(s.id)})).filter(x=>x.a!=null),og=as.length?as.reduce((a,x)=>a+x.a,0)/as.length:null;
 const since=addD(t,-6),bySub=D().subjects.map(s=>({s,m:D().sessions.filter(x=>x.subj===s.id&&x.date>=since).reduce((a,x)=>a+(+x.min||0),0)})).filter(x=>x.m>0).sort((a,b)=>b.m-a.m);
 const up=cs=>D().events.filter(e=>cs.includes(e.cat)&&e.data>=t).sort(cmpEv).slice(0,3);
 const list=(a,m)=>a.length?a.map(evRow).join(''):`<p class="mut">${m}</p>`;
 const acts=[...D().sessions.map(x=>({t:x.ts,x:`Estudou ${hm(x.min)}${subj(x.subj)?' de '+subj(x.subj).nome:''}`})),...TK.filter(x=>x.doneAt).map(x=>({t:x.doneAt,x:'Concluiu: '+x.titulo})),...D().grades.filter(g=>g.created).map(g=>({t:g.created,x:'Avaliação: '+g.name}))].sort((a,b)=>b.t-a.t).slice(0,5);
 const C0=2*Math.PI*52,sc=[['pendente','Pendentes','#d97706'],['andamento','Em andamento','#2563eb'],['concluida','Concluídas','var(--ac)']];
 const ls=D().sessions.slice().sort((a,b)=>b.ts-a.ts)[0],cs=subj(ls?.subj)||D().subjects[0],pad=n=>String(n).padStart(2,'0'),en=p.nivel==='medio'&&p.enem?Math.ceil((new Date(p.enem+'T12:00:00')-new Date(t+'T12:00:00'))/864e5):null;
 return `<div class="top"><span class="logo">${ic(NAV[2][2])}</span><b class="grow lg2">StudyFlow</b><button class="ib" data-a="goto" data-id="agenda" aria-label="Agenda">${ic('M18 8a6 6 0 10-12 0c0 7-3 8-3 8h18s-3-1-3-8M10 21h4')}</button></div>
<h1 style="margin-top:18px">Olá, ${p.name?esc(p.name.split(' ')[0]):'estudante'}!</h1><p class="mut cap">${new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'})}</p>
${actCard(1)}
<div class="card meta"><div class="top"><b class="grow">Meta de hoje</b><span class="pc">${pc}%</span></div><div class="bar"><i style="width:${pc}%"></i></div><small>${hm(td)} de ${hm(p.meta)}, sequência de ${streak()} dia${streak()===1?'':'s'}</small></div>
${p.nivel==='medio'?`<div class="card top" data-a="goto" data-id="perfil"><span class="ic">${ic('M12 3l9 5-9 5-9-5zM7 11v5c0 1.5 2.2 3 5 3s5-1.5 5-3v-5')}</span><div class="grow"><b>${en==null?'ENEM e vestibular':en>0?en+' dias para a prova':en===0?'A prova é hoje!':'Prova realizada'}</b><small>${p.enem?'Data: '+fmt(p.enem):'Defina a data no Perfil'}</small></div></div>`:''}<div class="grid2"><div class="card tl" data-a="goto" data-id="mat" data-sub="tasks"><span class="ic">${ic('M5 5h14v14H5zM9 10h6M9 14h4')}</span><small>Tarefas</small><b>${pad(pend.length)}</b></div><div class="card tl" data-a="goto" data-id="agenda"><span class="ic">${ic(NAV[1][2])}</span><small>Próximas provas</small><b>${pad(D().events.filter(e=>(e.cat==='prova'||e.cat==='simulado')&&e.data>=t).length)}</b></div></div>
${clsOf(new Date().getDay()).length?`<h2>Aulas de hoje</h2>${clsOf(new Date().getDay()).map(x=>clsCard(x)).join('')}`:''}
<div class="top"><h2 class="grow">Próximas atividades</h2><button class="link" data-a="goto" data-id="agenda">Ver todas ›</button></div>${list(D().events.filter(e=>e.data>=t).sort(cmpEv).slice(0,3),'Nenhuma atividade agendada.')}
${cs?`<h2>Continue estudando</h2><div class="card top" data-a="cont" data-id="${cs.id}"><span class="ic">${ic(NAV[2][2])}</span><div class="grow"><b>${esc(cs.nome)}</b><small>${ls?'Último estudo: '+fmt(ls.date):'Comece uma sessão de foco'}</small></div><span class="play">▶</span></div>`:''}
<button class="btn full" data-a="quick">Adicionar rápido</button>
<h2>Para hoje</h2>${hoje.length?hoje.slice(0,3).map(taskCard).join('')+(hoje.length>3?`<button class="link" data-a="goto" data-id="mat" data-sub="tasks">Ver mais ${hoje.length-3}</button>`:''):`<p class="mut">${tot?'Nada vence hoje nem está atrasado.':'Sem tarefas ainda. Toque em + para criar a primeira.'}</p>`}
<h2>Painel de estudos</h2>
<div class="card"><h3 class="t">Últimos 7 dias<span class="sum">${hm(wk)} de ${hm(p.metaSem)}</span></h3><div class="bar"><i style="width:${wp}%"></i></div>${wk?`<div class="bars">${days.map((d,i)=>`<div><i style="height:${vals[i]/mx*100}%;opacity:${i===6?1:.55}"></i><small>${dl(d,{weekday:'short'}).slice(0,3)}</small></div>`).join('')}</div>`:'<p class="mut">Use o Foco para registrar sessões e ver sua evolução.</p>'}</div>
${tot?`<div class="card"><h3 class="t">Tarefas por status<span class="sum">${tot} no total</span></h3><div class="stk">${sc.map(([k,,c])=>cnt(k)?`<i style="width:${cnt(k)/tot*100}%;background:${c}"></i>`:'').join('')}</div><div class="lg">${sc.map(([k,l,c])=>`<span><b style="background:${c}"></b>${l}: ${cnt(k)}</span>`).join('')}</div></div>`:''}
${bySub.length?`<div class="card"><h3 class="t">Tempo por matéria<span class="sum">7 dias</span></h3>${bySub.slice(0,5).map(x=>hbar(x.s.nome,x.m,bySub[0].m,x.s.cor,hm(x.m))).join('')}</div>`:''}
${as.length?`<div class="card"><h3 class="t">Desempenho<span class="sum">mínima ${p.media}</span></h3>${as.map(x=>hbar(x.s.nome,x.a,10,x.a>=p.media?x.s.cor:'#c2410c',x.a.toFixed(1))).join('')}</div>`:''}
<h2>Próximas provas</h2>${list(up(['prova','simulado']),'Nenhuma prova agendada. Cadastre na Agenda.')}
<h2>Próximos trabalhos</h2>${list(up(['trabalho','entrega']),'Nenhum trabalho ou entrega agendado.')}
<h2>Atividade recente</h2>${acts.length?acts.map(a=>`<div class="act">${esc(a.x)}<small>${new Date(a.t).toLocaleDateString('pt-BR')}</small></div>`).join(''):'<p class="mut">Suas atividades aparecerão aqui.</p>'}`};

V.agenda=()=>{const d=S.agD,dt=new Date(d+'T12:00:00'),v=S.agV,ds=x=>D().events.filter(e=>e.data===x).sort(cmpEv);
 const day=x=>{const cl=clsOf(new Date(x+'T12:00:00').getDay());return cl.map(c=>clsCard(c)).join('')+(ds(x).length?ds(x).map(evRow).join(''):(cl.length?'':'<p class="mut">Sem compromissos.</p>'))};let title,h;
 if(v==='day'){title=dl(d,{weekday:'long',day:'numeric',month:'long'});h=day(d)}
 else if(v==='week'){const s=addD(d,-dt.getDay());title=fmt(s)+' a '+fmt(addD(s,6));h=Array.from({length:7},(_,i)=>{const x=addD(s,i);return `<h3 class="${x===today()?'tdy':''}">${dl(x,{weekday:'long',day:'numeric'})}</h3>${day(x)}`}).join('')}
 else{title=dl(d,{month:'long',year:'numeric'});const y=dt.getFullYear(),m=dt.getMonth(),first=new Date(y,m,1).getDay(),n=new Date(y,m+1,0).getDate();
  let g='<div class="cal">'+['D','S','T','Q','Q','S','S'].map(x=>`<span>${x}</span>`).join('')+'<span></span>'.repeat(first);
  for(let i=1;i<=n;i++){const x=iso(new Date(y,m,i));g+=`<button data-a="agday" data-id="${x}" class="${x===d?'on':''} ${x===today()?'tdy':''}">${i}${ds(x).length?'<i></i>':''}</button>`}
  h=g+`</div><h3>${dl(d,{weekday:'long',day:'numeric'})}</h3>`+day(d)}
 return `<div class="top"><h1 class="grow">Agenda</h1><button class="ib plus" data-a="edit" data-k="e" aria-label="Novo evento">+</button></div>${seg([['day','Dia'],['week','Semana'],['month','Mês']],v,'agv')}<div class="nav"><button data-a="agnav" data-id="-1" aria-label="Anterior">‹</button><b>${title}</b><button data-a="agnav" data-id="1" aria-label="Próximo">›</button></div>${h}<button class="btn ghost full" data-a="edit" data-k="e">Novo evento</button><button class="link" data-a="agtoday">Ir para hoje</button>`};

MT.subjects=()=>{const ss=D().subjects;if(!ss.length)return empty('Nenhuma matéria cadastrada. Comece adicionando suas disciplinas.','Nova matéria','data-a="edit" data-k="s"');
 const m=D().profile.media,as=ss.map(s=>avg(s.id)),vs=as.filter(a=>a!=null),og=vs.length?vs.reduce((a,b)=>a+b,0)/vs.length:0,C1=2*Math.PI*40;
 return `<div class="tiles">${ss.map((s,i)=>`<div class="tile" style="--c:${esc(s.cor)}${s.img?`;background-image:linear-gradient(180deg,#0002,#000b),url(${esc(s.img)});background-size:cover;background-position:center`:''}" data-a="sid" data-id="${s.id}">${ic(NAV[2][2])}<b>${esc(s.nome)}</b><small>Média: ${as[i]==null?'–':as[i].toFixed(1)}</small></div>`).join('')}</div>
<h2>Resumo geral</h2><div class="card hr"><svg class="ring" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" stroke="var(--line)" stroke-width="10"/><circle cx="50" cy="50" r="40" stroke="#34d399" stroke-width="10" stroke-linecap="round" stroke-dasharray="${C1*og/10} ${C1}" transform="rotate(-90 50 50)"/><text x="50" y="57" text-anchor="middle" fill="currentColor" stroke="none" font-size="20" font-weight="800">${Math.round(og*10)}%</text></svg><div class="grow"><div class="act">Disciplinas: ${ss.length}</div><div class="act">Aprovadas: ${vs.filter(a=>a>=m).length}</div><div class="act">Em atenção: ${vs.filter(a=>a<m).length}</div></div></div>${actCard()}`};
MT.tasks=()=>{const f=S.f,L=D().tasks.filter(t=>(!f.subj||t.subj===f.subj)&&(!f.prior||t.prior===f.prior)&&(!f.status||t.status===f.status)).sort((a,b)=>(a.status==='concluida')-(b.status==='concluida')||(a.data||'9').localeCompare(b.data||'9'));
 const sel=(k,o)=>`<select data-c="flt" data-k="${k}">${o.map(([v,l])=>`<option value="${esc(v)}" ${f[k]===v?'selected':''}>${l}</option>`).join('')}</select>`;
 return `<button class="btn full" data-a="edit" data-k="t">Nova tarefa</button><div class="chips2">${[['','Todas'],['pendente','Pendentes'],['andamento','Em andamento'],['concluida','Concluídas']].map(([v,l])=>`<button class="${S.f.status===v?'on':''}" data-a="fst" data-id="${v}">${l}</button>`).join('')}</div><div class="filters">${sel('subj',[['','Matéria'],...sOpts(1)])}${sel('prior',[['','Prioridade'],...Object.entries(PR)])}</div>`+(L.length?L.map(taskCard).join(''):empty(D().tasks.length?'Nenhuma tarefa com esses filtros.':'Nenhuma tarefa ainda. Adicione a primeira.'))};
MT.schedule=()=>{if(!D().subjects.length)return empty('Cadastre suas matérias para montar o horário de aulas.','Nova matéria','data-a="edit" data-k="s"');
 const hd=S.hd??(new Date().getDay()||1),tdy=new Date().getDay(),sec=i=>{const L=clsOf(i);return L.length?L.map(x=>clsCard(x,1)).join(''):'<p class="mut">Sem aulas neste dia.</p>'};
 return `<button class="btn full" data-a="edit" data-k="h">Adicionar aula ao horário</button><div class="chips2">${DS.map((l,i)=>i?`<button class="${hd===i?'on':''} ${i===tdy?'td':''}" data-a="hd" data-id="${i}">${l}</button>`:'').join('')}<button class="${hd==='w'?'on':''}" data-a="hd" data-id="w">Semana</button></div>`+(hd==='w'?[1,2,3,4,5,6].map(i=>`<h3 class="${i===tdy?'tdy':''}">${DIAS[i]}</h3>${sec(i)}`).join(''):`<h3>${DIAS[hd]}</h3>${sec(hd)}${D().horario.length?'':'<p class="mut">Adicione as aulas de cada dia para ver aqui quais matérias você tem.</p>'}`)};
MT.grades=()=>{const ss=D().subjects;if(!ss.length)return empty('Cadastre uma matéria para lançar notas.','Nova matéria','data-a="edit" data-k="s"');
 const as=ss.map(s=>avg(s.id)).filter(a=>a!=null),o=as.length?as.reduce((a,b)=>a+b,0)/as.length:null;
 return `<div class="hero"><small>Média geral (mínima ${D().profile.media})</small><div class="big">${o==null?'–':o.toFixed(1)}</div><small>${verdict(o)}</small></div><h2>Desempenho por disciplina</h2>${ss.map(s=>{const a=avg(s.id);return a==null?'':hbar(s.nome,a,10,s.cor,a.toFixed(1))}).join('')}<button class="btn full" data-a="edit" data-k="g">Nova atividade avaliativa</button>`+ss.map(s=>{const a=avg(s.id);return `<h3>${esc(s.nome)}: ${D().profile.nivel==='medio'?'média anual ':''}${a==null?'–':a.toFixed(1)}, ${verdict(a)}</h3>${gList(s.id)}`}).join('')};
MT.notes=()=>`<button class="btn full" data-a="nnew">Nova anotação</button><input id="q" data-c="q" placeholder="Pesquisar anotações" value="${esc(S.q)}"><div id="nl">${nlist()}</div>`;

const subjPage=()=>{const s=subj(S.sid);if(!s){S.sid=null;return V.mat()}const a=avg(s.id),L=D().tasks.filter(t=>t.subj===s.id),N=D().notes.filter(n=>n.subj===s.id);
 return `<div class="top"><button class="ib" data-a="back" aria-label="Voltar">‹</button><h1 class="grow">${esc(s.nome)}</h1><button class="ib" data-a="edit" data-k="s" data-id="${s.id}" aria-label="Editar">✎</button></div>
<div class="hero" style="${s.img?`background-image:linear-gradient(180deg,#0002,#000b),url(${esc(s.img)});background-size:cover;background-position:center`:''}"><small>${esc(s.prof||'Professor não informado')}</small><div class="big">${a==null?'–':a.toFixed(1)}</div><small>${verdict(a)}</small></div>${s.desc?`<p>${esc(s.desc)}</p>`:''}
<h2>Notas</h2>${gList(s.id)}<button class="btn ghost full" data-a="edit" data-k="g">Nova atividade avaliativa</button>
<h2>Horário</h2>${(()=>{const h=D().horario.filter(x=>x.subj===s.id).sort((a,b)=>((a.dia+6)%7)-((b.dia+6)%7)||(a.ini||'').localeCompare(b.ini||''));return h.length?h.map(x=>`<div class="act" data-a="edit" data-k="h" data-id="${x.id}">${DIAS[x.dia]}<small>${esc(x.ini||'')}${x.fim?' às '+esc(x.fim):''}${x.sala?', '+esc(x.sala):''}</small></div>`).join(''):'<p class="mut">Sem aulas no horário.</p>'})()}<button class="btn ghost full" data-a="edit" data-k="h">Adicionar aula ao horário</button>
<h2>Tarefas</h2>${L.length?L.map(taskCard).join(''):'<p class="mut">Nenhuma tarefa.</p>'}<button class="btn ghost full" data-a="edit" data-k="t">Nova tarefa</button>
<h2>Anotações</h2>${N.length?N.map(nCard).join(''):'<p class="mut">Nenhuma anotação.</p>'}<button class="btn ghost full" data-a="nnew">Nova anotação</button>`};
V.mat=()=>S.sid?subjPage():`<div class="top"><h1 class="grow">${W()}</h1><button class="ib plus" data-a="qk" data-id="${{subjects:'s',tasks:'t',schedule:'h',grades:'g',notes:'n'}[S.mat]}" aria-label="Novo">+</button></div>${seg([['subjects',W()],['tasks','Tarefas'],['schedule','Horário'],['grades','Notas'],['notes','Anotações']],S.mat,'msub')}${MT[S.mat]()}`;

const noteEd=()=>{const n=D().notes.find(x=>x.id===S.nid)||{};
 return `<div class="top"><button class="ib" data-a="nback" aria-label="Voltar">‹</button><h1 class="grow">${n.id?'Editar anotação':'Nova anotação'}</h1></div>
<input id="nt" placeholder="Título" value="${esc(n.titulo||'')}"><select id="ns">${sOpts().map(([v,l])=>`<option value="${esc(v)}" ${v===(n.subj??S.sid??'')?'selected':''}>${esc(l)}</option>`).join('')}</select>
<div class="tb">${[['bold','<b>B</b>'],['italic','<i>I</i>'],['h','T'],['insertUnorderedList','Lista'],['mark','Marca']].map(([m,l])=>`<button data-a="fmt" data-m="${m}" aria-label="${m}">${l}</button>`).join('')}</div>
<div id="nc" class="editor" contenteditable="true" data-ph="Escreva sua anotação">${clean(n.html||'')}</div>
<button class="btn full" data-a="nsave">Salvar anotação</button>${n.id?`<button class="btn danger full" data-a="del" data-k="n" data-id="${n.id}">Excluir anotação</button>`:''}`};

/* Pomodoro: estado global, independe da tela */
const T={mode:'f',left:0,run:false,end:0,el:0,start:0,subj:'',cyc:0};
const modeSec=m=>{const x=D().profile.pomo[m];return (x>0?x:25)*60};
const tmReset=m=>{T.mode=m||T.mode;T.run=false;T.el=0;T.left=T.mode==='free'?0:modeSec(T.mode)};
const fmtT=()=>{const s=T.mode==='free'?T.el:T.left;return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
const tPct=()=>T.mode==='free'?0:100-T.left/modeSec(T.mode)*100;
const RC=2*Math.PI*110,ringD=()=>{const f=T.mode==='free'?(T.el%3600)/3600:T.left/modeSec(T.mode);return `${(RC*f).toFixed(1)} ${RC.toFixed(1)}`};
function drawT(){const e=$('#tm');if(e){e.textContent=fmtT();$('#tr').setAttribute('stroke-dasharray',ringD())}document.title=T.run?fmtT()+' StudyFlow':'StudyFlow'}
const notify=m=>{try{if(window.Notification&&Notification.permission==='granted')new Notification('StudyFlow',{body:m})}catch(e){}toast(m)};
function log(min){D().sessions.push({id:DB.uid(),ts:Date.now(),date:today(),min,subj:T.subj});DB.save()}
function tmDone(){tmNotif(0);const m=T.mode;if(m==='f'){log(Math.round(modeSec('f')/60));T.cyc++}
 notify(m==='f'?'Foco concluído! Hora da pausa.':'Pausa encerrada. Vamos focar?');navigator.vibrate&&navigator.vibrate([300,150,300]);
 tmReset(m==='f'?(T.cyc%4===0?'l':'c'):'f');if(S.tab==='foco')render();else drawT()}
setInterval(()=>{if(!T.run)return;if(T.mode==='free')T.el=Math.floor((Date.now()-T.start)/1000);else{T.left=Math.max(0,Math.ceil((T.end-Date.now())/1000));if(!T.left)return tmDone()}drawT()},250);

V.foco=()=>{const L=D().sessions.slice().sort((a,b)=>b.ts-a.ts).slice(0,10),p=D().profile.pomo,began=T.mode==='free'?T.el>0:T.left<modeSec(T.mode);
 return `<h1>Foco</h1>
<div class="rt"><svg viewBox="0 0 240 240"><defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#34d399"/><stop offset="1" stop-color="#6366f1"/></linearGradient></defs><circle cx="120" cy="120" r="110" stroke="var(--line)" stroke-width="12"/><circle id="tr" cx="120" cy="120" r="110" stroke="url(#rg)" stroke-width="12" stroke-linecap="round" stroke-dasharray="${ringD()}" transform="rotate(-90 120 120)"/></svg><div class="tmw"><div id="tm" class="tm">${fmtT()}</div><small>${{f:'Foco',c:'Pausa curta',l:'Pausa longa',free:'Livre'}[T.mode]}</small></div></div>
<label>Matéria<select data-c="tsubj"><option value="">Sem matéria</option>${D().subjects.map(s=>`<option value="${s.id}" ${T.subj===s.id?'selected':''}>${esc(s.nome)}</option>`).join('')}</select></label>
<div class="row">${T.run?'<button class="btn" data-a="tpause">Pausar</button>':`<button class="btn" data-a="tstart">${began?'Continuar':'Iniciar'}</button>`}<button class="btn ghost" data-a="treset">Reiniciar</button>${T.mode==='free'&&T.el>=60?'<button class="btn ghost" data-a="tsave">Salvar</button>':''}</div>
<div class="mt">${[['f',p.f+'min','Foco'],['c',p.c+'min','Pausa'],['l',p.l+'min','Longa'],['free','Livre','Cronômetro']].map(([k,a,b])=>`<button data-a="mode" data-id="${k}" class="${T.mode===k?'on':''}"><b>${a}</b><small>${b}</small></button>`).join('')}</div>
<h2>Tempos (minutos)</h2><div class="grid2">${[['f','Foco'],['c','Pausa curta'],['l','Pausa longa']].map(([k,l])=>`<label>${l}<input type="number" inputmode="numeric" min="1" max="180" data-c="cfg" data-k="${k}" value="${p[k]}"></label>`).join('')}</div>
<h2>Histórico</h2>${L.length?L.map(s=>`<div class="act">${hm(s.min)}${subj(s.subj)?' de '+esc(subj(s.subj).nome):''}<small>${dl(s.date,{day:'2-digit',month:'short'})}</small></div>`).join(''):'<p class="mut">Nenhuma sessão ainda. Conclua um ciclo de foco para registrar.</p>'}`};

const perfFields=(p,inp)=>{const md=p.nivel==='medio';
 return `<label>Nível de ensino<select name="nivel"><option value="medio" ${md?'selected':''}>Ensino Médio</option><option value="superior" ${md?'':'selected'}>Ensino Superior</option></select></label>`+(md?inp('name','Nome')+inp('inst','Escola')+`<label>Série<select name="serie">${['','1º ano','2º ano','3º ano'].map(v=>`<option ${p.serie===v?'selected':''}>${v}</option>`).join('')}</select></label>`+inp('turma','Turma')+inp('turno','Turno')+`<label>Data do ENEM ou vestibular<input type="date" name="enem" value="${esc(p.enem)}"></label>`:[['name','Nome'],['inst','Instituição'],['curso','Curso'],['turma','Turma'],['periodo','Período'],['turno','Turno']].map(([k,l])=>inp(k,l)).join(''))};
const idCard=p=>{const row=(l,v)=>v?`<div><small>${l}</small><b>${esc(v)}</b></div>`:'';
 return `<div class="idc"><div class="top"><span class="logo">${ic(NAV[2][2])}</span><b class="grow">${esc(p.inst||(p.nivel==='medio'?'Escola':'Instituição'))}</b><button class="ib" data-a="pedit" aria-label="Editar perfil">${ic('M4 20h4L19 9l-4-4L4 16zM13 7l4 4')}</button></div>
<div class="idb"><span class="idp">${p.foto?`<img src="${esc(p.foto)}" alt="">`:esc(p.name[0].toUpperCase())}</span><div class="grow"><small>Estudante do Ensino ${p.nivel==='medio'?'Médio':'Superior'}</small><h2>${esc(p.name)}</h2></div></div>
<div class="idg">${(p.nivel==='medio'?[['Série',p.serie],['Turma',p.turma],['Turno',p.turno]]:[['Curso',p.curso],['Turma',p.turma],['Período',p.periodo],['Turno',p.turno]]).map(([l,v])=>row(l,v)).join('')}${row('Meta diária',hm(p.meta))}${row('Média mínima',String(p.media))}</div></div>`};
V.perfil=()=>{const p=D().profile,saved=!!p.name&&!S.pedit,cur=S.pfoto!==undefined?S.pfoto:p.foto,t=today(),days=Array.from({length:7},(_,i)=>addD(t,i-6)),vals=days.map(studied),wk=vals.reduce((a,b)=>a+b,0),mx=Math.max(...vals,p.meta,1),tot=D().sessions.reduce((a,s)=>a+(+s.min||0),0),wp=Math.min(100,Math.round(wk/p.metaSem*100));
 const inp=(k,l,m)=>`<label>${l}<input name="${k}" ${m?'inputmode="decimal"':''} value="${esc(p[k])}"></label>`;
 return `<div class="top"><h1 class="grow">Perfil</h1><div class="dd"><button class="ib" data-a="ddt" aria-label="Configurações" aria-expanded="${!!S.dd}">${ic('M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z')}</button>${S.dd?`<div class="ddm"><button data-a="theme">Tema: ${p.theme==='dark'?'escuro':'claro'} (alternar)</button><button data-a="notif">${p.notif&&LN()?'Lembretes: ligados (desativar)':'Ativar lembretes e notificações'}</button><button data-a="exp">Exportar dados</button><button data-a="imp">Importar dados</button><hr><button class="dg" data-a="clr">Limpar dados locais</button></div>`:''}</div></div>
${saved?idCard(p):''}<div class="av" ${saved?'hidden':''}><span id="pv">${cur?`<img src="${esc(cur)}" alt="">`:esc((p.name||'E')[0].toUpperCase())}</span><b>${esc(p.name||'Estudante')}</b><small>Estudante</small><div class="row"><button type="button" class="btn ghost" data-a="pfoto">Escolher foto</button><button type="button" class="btn ghost" data-a="pdel">Remover</button></div><input type="file" id="ph" data-c="foto" accept="image/*" hidden></div><form id="pf" ${saved?'hidden':''}>${perfFields(p,inp)}${inp('meta','Meta diária (minutos)',1)}${inp('metaSem','Meta semanal (minutos)',1)}${inp('media','Média mínima para aprovação (0 a 10)',1)}<button class="btn full">Salvar perfil</button>${p.name?'<button type="button" class="btn ghost full" data-a="pcancel">Cancelar</button>':''}</form>
<h2>Produtividade</h2><div class="card"><small>Últimos 7 dias: ${hm(wk)} de ${hm(p.metaSem)}</small><div class="bar"><i style="width:${wp}%"></i></div><div class="bars">${days.map((d,i)=>`<div><i style="height:${vals[i]/mx*100}%"></i><small>${dl(d,{weekday:'short'}).slice(0,3)}</small></div>`).join('')}</div></div>
<div class="grid2"><div class="card stat"><b>${streak()}</b><small>dias seguidos</small></div><div class="card stat"><b>${hm(tot)}</b><small>total estudado</small></div></div>
`};

/* ---------- Render e eventos ---------- */
const chooser=()=>`<div class="top"><span class="logo">${ic(NAV[2][2])}</span><b class="grow lg2">StudyFlow</b></div><h1 style="margin-top:24px">Qual é o seu nível de ensino?</h1><p class="mut">O app se adapta ao seu nível. Você pode mudar depois no Perfil.</p>
<div class="tiles" style="grid-template-columns:1fr"><div class="tile ch" style="--c:#ea580c" data-a="nivel" data-id="medio"><b>Ensino Médio</b><small>Matérias, bimestres, simulados e contagem para o ENEM</small></div><div class="tile ch" style="--c:#5b4bf0" data-a="nivel" data-id="superior"><b>Ensino Superior</b><small>Disciplinas, períodos, provas e trabalhos</small></div></div>`;
function render(){document.documentElement.dataset.theme=D().profile.theme;document.documentElement.dataset.nivel=D().profile.nivel||'superior';
 if(!D().profile.nivel){$('#main').innerHTML=chooser();$('#nav').style.display='none';$('#fab').style.display='none';return}
 $('#nav').style.display='';
 $('#nav').innerHTML=NAV.map(([k,l,i])=>`<button data-a="tab" data-id="${k}" class="${S.tab===k?'on':''}">${ic(i)}<span>${k==='mat'?W():l}</span></button>`).join('');
 $('#main').innerHTML=S.nid?noteEd():V[S.tab]();
 $('#fab').style.display=!S.nid&&S.tab!=='foco'&&S.tab!=='perfil'?'flex':'none';
 const f=$('#pf');if(f)f.onsubmit=e=>{e.preventDefault();const E=f.elements,p=D().profile,n=(k,a,b)=>{const x=parseFloat(String(E[k].value).replace(',','.'));return x>=a&&x<=b?x:null};
  const m=n('meta',1,1440),w=n('metaSem',1,10080),a=n('media',0,10);if(m==null||w==null||a==null)return toast('Confira as metas (minutos) e a média (0 a 10)','err');
  if(!E.name.value.trim())return toast('Informe seu nome para criar a carteirinha','err');['name','inst','curso','turma','periodo','turno','serie','enem','nivel'].forEach(k=>{if(E[k])p[k]=E[k].value.trim()});Object.assign(p,{meta:Math.round(m),metaSem:Math.round(w),media:a});if(S.pfoto!==undefined)p.foto=S.pfoto;S.pfoto=undefined;DB.save();S.pedit=false;render();toast('Perfil salvo')}}
Object.assign(A,{
 tab:d=>{S.tab=d.id;S.sid=null;S.pedit=false;S.pfoto=undefined;S.dd=false;render();$('#main').scrollTop=0},
 goto:d=>{S.tab=d.id;if(d.sub)S.mat=d.sub;S.sid=null;render()},
 imgpick:()=>$('#imf').click(),imgdel:()=>{document.querySelector('[name=img]').value='';const e=$('#ip');e.style.backgroundImage='';e.textContent='Sem imagem, usa a cor'},nivel:d=>{const p=D().profile;p.nivel=d.id;if(d.id==='medio'&&p.meta===120&&p.metaSem===600){p.meta=90;p.metaSem=450}DB.save();render()},ddt:()=>{S.dd=!S.dd;render()},pedit:()=>{S.pedit=true;render()},pcancel:()=>{S.pedit=false;S.pfoto=undefined;render()},pfoto:()=>$('#ph').click(),pdel:()=>{S.pfoto='';const v=$('#pv');if(v)v.textContent=((D().profile.name||'E')[0]).toUpperCase()},msub:d=>{S.mat=d.id;render()},hd:d=>{S.hd=d.id==='w'?'w':+d.id;render()},dtog:d=>{const h=document.querySelector('[name=dias]'),z=new Set(h.value.split(',').filter(Boolean));z.has(d.id)?z.delete(d.id):z.add(d.id);h.value=[...z].join(',');document.querySelectorAll('#dg button').forEach(b=>b.classList.toggle('on',z.has(b.dataset.id)))},fst:d=>{S.f.status=d.id;render()},cont:d=>{T.subj=d.id;S.tab='foco';S.sid=null;render()},sid:d=>{S.sid=d.id;render();$('#main').scrollTop=0},back:()=>{S.sid=null;render()},
 close:closeM,yes:()=>{const f=CB;CB=null;f&&f()},
 tview:d=>{const t=D().tasks.find(x=>x.id===d.id);if(!t)return;const s=subj(t.subj),sd=t.subs||[],stl=Object.fromEntries(ST)[t.status]||'';
  $('#modal').className='open';$('#modal').innerHTML=`<div class="sheet"><div class="top"><h2 class="grow" style="margin:0">${esc(t.titulo)}</h2><button class="ib" data-a="edit" data-k="t" data-id="${t.id}" aria-label="Editar tarefa">${ic('M4 20h4L19 9l-4-4L4 16zM13 7l4 4')}</button></div>
<p><span class="pill ${t.prior}">Prioridade ${(PR[t.prior]||'').toLowerCase()}</span> <span class="pill">${stl}</span></p>
<p class="mut">${s?esc(s.nome)+', ':''}${t.data?'entrega em '+fmt(t.data):'sem data de entrega'}${late(t)?', atrasada':''}</p>
${t.desc?`<p style="white-space:pre-wrap">${esc(t.desc)}</p>`:'<p class="mut">Sem descrição.</p>'}
${sd.length?`<h3>Subtarefas</h3>${sd.map((x,i)=>`<label class="sub"><input type="checkbox" data-c="sub" data-id="${t.id}" data-i="${i}" ${x.d?'checked':''}>${esc(x.t)}</label>`).join('')}`:''}
<div class="row"><button class="btn ghost" data-a="close">Fechar</button><button class="btn" data-a="tgl" data-id="${t.id}" data-close="1">${t.status==='concluida'?'Reabrir':'Concluir'}</button></div></div>`},
 edit:d=>edit(d.k,d.id),del:d=>del(d.k,d.id),
 quick:()=>{$('#modal').className='open';$('#modal').innerHTML=`<div class="sheet"><h2>Criar</h2>${[['t','Tarefa'],['e','Evento na agenda'],['s','Matéria'],['g','Atividade avaliativa'],['h','Aula no horário'],['n','Anotação']].map(([k,l])=>`<button class="btn ghost full" data-a="qk" data-id="${k}">${l}</button>`).join('')}</div>`},
 qk:d=>{closeM();d.id==='n'?A.nnew():edit(d.id)},
 tgl:d=>{const t=D().tasks.find(x=>x.id===d.id);if(!t)return;t.status=t.status==='concluida'?'pendente':'concluida';t.doneAt=t.status==='concluida'?Date.now():0;DB.save();render();if(d.close)closeM()},
 agv:d=>{S.agV=d.id;render()},agday:d=>{S.agD=d.id;render()},agtoday:()=>{S.agD=today();render()},
 agnav:d=>{const n=+d.id;if(S.agV==='month'){const x=new Date(S.agD+'T12:00:00');x.setDate(1);x.setMonth(x.getMonth()+n);S.agD=iso(x)}else S.agD=addD(S.agD,n*(S.agV==='week'?7:1));render()},
 nnew:()=>{S.nid='new';render()},nedit:d=>{S.nid=d.id;render()},nback:()=>{S.nid=null;render()},
 nfav:d=>{const n=D().notes.find(x=>x.id===d.id);if(n){n.fav=!n.fav;DB.save();render()}},
 nsave:()=>{const t=$('#nt').value.trim(),h=clean($('#nc').innerHTML),s=$('#ns').value;if(!t&&!txt(h).trim())return toast('Escreva um título ou conteúdo','err');
  const o=D().notes.find(x=>x.id===S.nid),v={titulo:t||'Sem título',html:h,subj:s,upd:Date.now()};if(o)Object.assign(o,v);else D().notes.push({id:DB.uid(),created:Date.now(),fav:false,...v});
  DB.save();S.nid=null;render();toast('Anotação salva')},
 fmt:d=>{const m=d.m;if(m==='mark'){const r=getSelection();if(r.rangeCount&&!r.isCollapsed){try{r.getRangeAt(0).surroundContents(document.createElement('mark'))}catch(e){toast('Selecione um trecho simples','err')}}}else if(m==='h')document.execCommand('formatBlock',false,'h3');else document.execCommand(m)},
 mode:d=>{tmNotif(0);tmReset(d.id);render()},
 tstart:()=>{if(window.Notification&&Notification.permission==='default')Notification.requestPermission();
  if(T.mode==='free')T.start=Date.now()-T.el*1000;else T.end=Date.now()+T.left*1000;T.run=true;tmNotif(T.mode!=='free');render()},
 tpause:()=>{if(T.mode==='free')T.el=Math.floor((Date.now()-T.start)/1000);else T.left=Math.max(0,Math.ceil((T.end-Date.now())/1000));T.run=false;tmNotif(0);render()},
 treset:()=>{tmNotif(0);tmReset();render()},
 tsave:()=>{const m=Math.floor(T.el/60);if(m<1)return toast('Estude ao menos 1 minuto','err');log(m);tmReset('free');render();toast('Sessão salva')},
 theme:()=>{const p=D().profile;p.theme=p.theme==='dark'?'light':'dark';DB.save();render()},
 notif:async()=>{const l=LN();if(!l){if(!window.Notification)return toast('Notificações não são suportadas aqui','err');return Notification.requestPermission().then(r=>toast(r==='granted'?'Notificações ativadas':'Permissão negada',r==='granted'?'ok':'err'))}
  const p=D().profile;if(p.notif){p.notif=false;DB.save();render();return toast('Lembretes desativados')}
  if(!(await nOk(true)))return toast('Permissão negada. Ative nas configurações do Android.','err');p.notif=true;DB.save();render();toast('Lembretes ativados: tarefas, eventos e aulas')},
 exp:()=>{if(nativeExport())return;const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({app:'studyflow',v:1,data:D()},null,1)],{type:'application/json'}));a.download=`studyflow-${today()}.json`;document.body.appendChild(a);a.click();a.remove();toast('Backup exportado')},
 imp:()=>$('#file').click(),
 clr:()=>ask('Apagar TODOS os dados deste aparelho?',()=>{DB.d=DB.def();DB.save();S.sid=null;closeM();render();toast('Dados apagados')},'Apagar')});
Object.assign(C,{
 img:(v,b)=>{const f=b.files[0];b.value='';if(!f)return;if(!f.type.startsWith('image/'))return toast('Escolha um arquivo de imagem','err');const r=new FileReader();r.onerror=()=>toast('Falha ao ler a imagem','err');r.onload=()=>{const im=new Image();im.onerror=()=>toast('Imagem inválida','err');im.onload=()=>{const W=480,H=300,c=document.createElement('canvas');c.width=W;c.height=H;const k=Math.max(W/im.width,H/im.height),w=im.width*k,h=im.height*k;c.getContext('2d').drawImage(im,(W-w)/2,(H-h)/2,w,h);const u=c.toDataURL('image/jpeg',.75);document.querySelector('[name=img]').value=u;const e=$('#ip');e.style.backgroundImage=`url(${u})`;e.textContent=''};im.src=r.result};r.readAsDataURL(f)},foto:(v,b)=>{const f=b.files[0];b.value='';if(!f)return;if(!f.type.startsWith('image/'))return toast('Escolha um arquivo de imagem','err');const r=new FileReader();r.onerror=()=>toast('Falha ao ler a imagem','err');r.onload=()=>{const im=new Image();im.onerror=()=>toast('Imagem inválida','err');im.onload=()=>{const z=256,c=document.createElement('canvas');c.width=c.height=z;const m=Math.min(im.width,im.height);c.getContext('2d').drawImage(im,(im.width-m)/2,(im.height-m)/2,m,m,0,0,z,z);S.pfoto=c.toDataURL('image/jpeg',.82);const v=$('#pv');if(v)v.innerHTML=`<img src="${S.pfoto}" alt="">`;toast('Foto selecionada. Toque em Salvar perfil.')};im.src=r.result};r.readAsDataURL(f)},flt:(v,b)=>{S.f[b.dataset.k]=v;render()},tsubj:v=>{T.subj=v},
 sub:(v,b)=>{const t=D().tasks.find(x=>x.id===b.dataset.id);if(t&&t.subs[+b.dataset.i]){t.subs[+b.dataset.i].d=b.checked;DB.save();render()}},
 cfg:(v,b)=>{const x=parseInt(v);if(!(x>=1&&x<=180)){toast('Use de 1 a 180 minutos','err');return render()}D().profile.pomo[b.dataset.k]=x;DB.save();if(!T.run)tmReset();render()}});
document.addEventListener('click',e=>{if(e.target.id==='modal')return closeM();if(S.dd&&!e.target.closest('.dd')){S.dd=false;render()}const b=e.target.closest('[data-a]');if(b&&A[b.dataset.a]){const m=!!b.closest('.ddm');if(m)S.dd=false;A[b.dataset.a](b.dataset,b);if(m)render()}});
document.addEventListener('change',e=>{const b=e.target.closest('[data-c]');if(b&&C[b.dataset.c])C[b.dataset.c](b.value,b)});
document.addEventListener('input',e=>{if(e.target.dataset.c==='q'){S.q=e.target.value;$('#nl').innerHTML=nlist()}});
document.addEventListener('pointerdown',e=>{if(e.target.closest('.tb button'))e.preventDefault()});
$('#file').onchange=e=>{const f=e.target.files[0];e.target.value='';if(!f)return;const r=new FileReader();
 r.onload=()=>{let d;try{const j=JSON.parse(r.result);d=DB.sane(j.data||j)}catch(x){return toast('Arquivo inválido ou corrompido','err')}
  ask('Substituir todos os dados atuais pelos do arquivo?',()=>{DB.d=d;DB.save();closeM();tmReset('f');render();toast('Dados importados')},'Importar')};
 r.onerror=()=>toast('Falha ao ler o arquivo','err');r.readAsText(f)};

DB.load();tmReset('f');render();if(DB.fail)toast('Dados corrompidos: iniciamos do zero (cópia guardada)','err');

const CP0=window.Capacitor&&window.Capacitor.Plugins;
if(CP0&&CP0.App)CP0.App.addListener('backButton',()=>{if($('#modal').className){closeM();return}if(S.nid){S.nid=null;return render()}if(S.pedit){S.pedit=false;return render()}if(S.sid){S.sid=null;return render()}if(S.tab!=='home'){S.tab='home';return render()}CP0.App.exitApp()});

if(LN()){LN().createChannel({id:'studyflow',name:'Lembretes StudyFlow',description:'Aulas, tarefas, eventos e Pomodoro',importance:4,vibration:true}).catch(()=>{});syncNotifs()}
