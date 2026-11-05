'use strict';
const DB={key:'studyflow_v1',d:null,fail:false,
def:()=>({profile:{name:'',inst:'',curso:'',turma:'',periodo:'',turno:'',meta:120,metaSem:600,media:6,theme:'dark',foto:'',notif:false,nivel:'',serie:'',enem:'',pomo:{f:25,c:5,l:15}},subjects:[],tasks:[],events:[],grades:[],notes:[],lessons:[],horario:[],sessions:[]}),
uid:()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6),
sane(r){const F=this.def(),o={};if(!r||typeof r!=='object')throw 0;
 for(const k in F){if(Array.isArray(F[k])){if(r[k]===undefined)r[k]=[];if(!Array.isArray(r[k]))throw 0;o[k]=r[k].filter(x=>x&&typeof x==='object'&&typeof x.id==='string')}
  else{if(!r[k]||typeof r[k]!=='object')throw 0;o[k]={...F[k],...r[k]}}}
 o.profile.pomo={...F.profile.pomo,...(r.profile.pomo||{})};if(typeof o.profile.foto!=='string'||!o.profile.foto.startsWith('data:image/'))o.profile.foto='';o.subjects.forEach(x=>{if(typeof x.img!=='string'||!x.img.startsWith('data:image/'))x.img=''});o.notes.forEach(n=>n.html=clean(n.html||''));return o},
load(){let raw=null;try{raw=localStorage.getItem(this.key)}catch(e){}
 if(!raw)return this.d=this.def();
 try{this.d=this.sane(JSON.parse(raw))}catch(e){try{localStorage.setItem(this.key+'_corrompido',raw)}catch(x){}this.d=this.def();this.fail=true}
 return this.d},
save(){try{localStorage.setItem(this.key,JSON.stringify(this.d))}catch(e){toast('Não foi possível salvar: armazenamento cheio','err')}if(typeof syncNotifs==='function')syncNotifs()}};
