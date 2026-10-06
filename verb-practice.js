/* Contextual, original examples: plain/polite sentences and noun modifiers. */
(function(root){
const verbs=VERB_CONTEXT_ROWS.map(x=>{
 const word=N5_WORDS.find(w=>w.word===x[0]&&w.pos==='verb');if(!word)throw Error('Missing vocabulary verb: '+x[0]);
 const past=x[6],ongoing=x[7],future=x[8];
 return{word:word.word,reading:word.reading,group:word.group,prefix:x[1],prefixKo:x[2],noun:x[3],nounKo:x[4],
 plainKo:[x[5],past,ongoing,future],politeKo:[x[9],past.slice(0,-1)+'습니다',ongoing==='-'?'-':ongoing.replace(/있어$/,'있습니다'),future.replace(/거야$/,'겁니다')],
 modifierKo:[x[10],past.slice(0,-1)+'던',ongoing==='-'?'-':ongoing.replace(/있어$/,'있는'),x[11]],skipOngoing:ongoing==='-'};
});
const rows=[['present','현재·습관'],['past','과거'],['ongoing','진행·상태'],['future','미래']];
const targets=[['plain','반말'],['polite','존댓말'],['modifier','명사 꾸미기']];
function forms(v){
 const f=root.StudyCore.verbForms(v.word,v.group),r=root.StudyCore.verbForms(v.reading,v.word==='来る'?'v1':v.group);
 if(v.word==='来る')Object.assign(r,{base:'くる',masu:'きます',te:'きて',past:'きた',pastpolite:'きました'});
 return {ja:{present:[f.base,f.masu,f.base],past:[f.past,f.pastpolite,f.past],ongoing:[f.te+'いる',f.te+'います',f.te+'いる'],future:[f.base,f.masu,f.base]},reading:{present:[r.base,r.masu,r.base],past:[r.past,r.pastpolite,r.past],ongoing:[r.te+'いる',r.te+'います',r.te+'いる'],future:[r.base,r.masu,r.base]}};
}
function cells(v){const f=forms(v);return rows.flatMap(([tense,label],i)=>v.skipOngoing&&tense==='ongoing'?[]:targets.map(([target,targetLabel],j)=>({tense,label,target,targetLabel,form:f.ja[tense][j],reading:f.reading[tense][j],ja:target==='modifier'?f.ja[tense][j]+v.noun:v.prefix+f.ja[tense][j],ko:target==='modifier'?v.modifierKo[i]+' '+v.nounKo:[v.prefixKo,target==='plain'?v.plainKo[i]:v.politeKo[i]].filter(Boolean).join(' ')})));}
const api={verbs,rows,targets,forms,cells};root.VerbPractice=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
