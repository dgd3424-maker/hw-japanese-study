/* Pure helpers shared by the quiz and tests. */
(function(root){
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function rubyParts(word,reading){
 if(word===reading||!/[一-龯々]/.test(word))return[{text:word}];
 const tokens=word.match(/[一-龯々]+|[^一-龯々]+/g);
 function split(i,offset){
  if(i===tokens.length)return offset===reading.length?[]:null;
  const token=tokens[i];
  if(!/[一-龯々]/.test(token)){
   if(!reading.startsWith(token,offset))return null;
   const rest=split(i+1,offset+token.length);return rest&&[{text:token},...rest];
  }
  for(let end=offset+1;end<=reading.length;end++){
   const rest=split(i+1,end);if(rest)return[{text:token,reading:reading.slice(offset,end)},...rest];
  }
  return null;
 }
 return split(0,0)||[{text:word,reading}];
}
function ruby(word,reading,show=true){return rubyParts(word,reading).map(x=>x.reading?`<ruby>${escape(x.text)}${show?`<rt>${escape(x.reading)}</rt>`:''}</ruby>`:escape(x.text)).join('');}
function verbForms(word,group){
 if(word==='する'||word.endsWith('する')){const s=word.slice(0,-2);return{base:word,masu:s+'します',neg:s+'しない',te:s+'して',past:s+'した',pastpolite:s+'しました',pastneg:s+'しなかった'};}
 if(word==='来る')return{base:word,masu:'来ます',neg:'来ない',te:'来て',past:'来た',pastpolite:'来ました',pastneg:'来なかった'};
 if(group==='v1'){const s=word.slice(0,-1);return{base:word,masu:s+'ます',neg:s+'ない',te:s+'て',past:s+'た',pastpolite:s+'ました',pastneg:s+'なかった'};}
 const last=word.slice(-1),s=word.slice(0,-1),i={'う':'い','く':'き','ぐ':'ぎ','す':'し','つ':'ち','ぬ':'に','ぶ':'び','む':'み','る':'り'}[last],a={'う':'わ','く':'か','ぐ':'が','す':'さ','つ':'た','ぬ':'な','ぶ':'ば','む':'ま','る':'ら'}[last];
 if(!i)throw Error('Unsupported verb: '+word);
 let te=['行く','いく'].includes(word)?'って':{'う':'って','つ':'って','る':'って','む':'んで','ぶ':'んで','ぬ':'んで','く':'いて','ぐ':'いで','す':'して'}[last];
 const neg=word==='ある'?'ない':s+a+'ない';
 return{base:word,masu:s+i+'ます',neg,te:s+te,past:s+te.replace(/て$/,'た').replace(/で$/,'だ'),pastpolite:s+i+'ました',pastneg:neg.slice(0,-2)+'なかった'};
}
const api={escape,rubyParts,ruby,verbForms};if(typeof module!=='undefined')module.exports=api;root.StudyCore=api;
})(typeof globalThis!=='undefined'?globalThis:this);
