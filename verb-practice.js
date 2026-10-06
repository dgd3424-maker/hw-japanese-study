/* Contextual, original examples: plain/polite sentences and noun modifiers. */
(function(root){
const verbs=[
 ['会う','あう','v5','先生に','선생님을','先生','선생님',['만나','만났어','만나고 있어','만날 거야'],['만납니다','만났습니다','만나고 있습니다','만날 겁니다'],['만나는','만났던','만나고 있는','만날']],
 ['食べる','たべる','v1','ご飯を','밥을','料理','요리',['먹어','먹었어','먹고 있어','먹을 거야'],['먹습니다','먹었습니다','먹고 있습니다','먹을 겁니다'],['먹는','먹었던','먹고 있는','먹을']],
 ['読む','よむ','v5','本を','책을','本','책',['읽어','읽었어','읽고 있어','읽을 거야'],['읽습니다','읽었습니다','읽고 있습니다','읽을 겁니다'],['읽는','읽었던','읽고 있는','읽을']],
 ['行く','いく','v5','学校に','학교에','場所','장소',['가','갔어','가고 있어','갈 거야'],['갑니다','갔습니다','가고 있습니다','갈 겁니다'],['가는','갔던','가고 있는','갈']],
 ['書く','かく','v5','手紙を','편지를','手紙','편지',['써','썼어','쓰고 있어','쓸 거야'],['씁니다','썼습니다','쓰고 있습니다','쓸 겁니다'],['쓰는','썼던','쓰고 있는','쓸']],
 ['買う','かう','v5','服を','옷을','服','옷',['사','샀어','사고 있어','살 거야'],['삽니다','샀습니다','사고 있습니다','살 겁니다'],['사는','샀던','사고 있는','살']],
 ['見る','みる','v1','映画を','영화를','映画','영화',['봐','봤어','보고 있어','볼 거야'],['봅니다','봤습니다','보고 있습니다','볼 겁니다'],['보는','봤던','보고 있는','볼']],
 ['飲む','のむ','v5','お茶を','차를','お茶','차',['마셔','마셨어','마시고 있어','마실 거야'],['마십니다','마셨습니다','마시고 있습니다','마실 겁니다'],['마시는','마셨던','마시고 있는','마실']],
 ['勉強する','べんきょうする','irregular','','','人','사람',['공부해','공부했어','공부하고 있어','공부할 거야'],['공부합니다','공부했습니다','공부하고 있습니다','공부할 겁니다'],['공부하는','공부했던','공부하고 있는','공부할']],
 ['来る','くる','irregular','家に','집에','人','사람',['와','왔어','오고 있어','올 거야'],['옵니다','왔습니다','오고 있습니다','올 겁니다'],['오는','왔던','오고 있는','올']]
].map(x=>({word:x[0],reading:x[1],group:x[2],prefix:x[3],prefixKo:x[4],noun:x[5],nounKo:x[6],plainKo:x[7],politeKo:x[8],modifierKo:x[9]}));
const rows=[['present','현재·습관'],['past','과거'],['ongoing','진행·상태'],['future','미래']];
const targets=[['plain','반말'],['polite','존댓말'],['modifier','명사 꾸미기']];
function forms(v){
 const f=root.StudyCore.verbForms(v.word,v.group),r=root.StudyCore.verbForms(v.reading,v.word==='来る'?'v1':v.group);
 if(v.word==='来る')Object.assign(r,{base:'くる',masu:'きます',te:'きて',past:'きた',pastpolite:'きました'});
 return {ja:{present:[f.base,f.masu,f.base],past:[f.past,f.pastpolite,f.past],ongoing:[f.te+'いる',f.te+'います',f.te+'いる'],future:[f.base,f.masu,f.base]},reading:{present:[r.base,r.masu,r.base],past:[r.past,r.pastpolite,r.past],ongoing:[r.te+'いる',r.te+'います',r.te+'いる'],future:[r.base,r.masu,r.base]}};
}
function cells(v){const f=forms(v);return rows.flatMap(([tense,label],i)=>targets.map(([target,targetLabel],j)=>({tense,label,target,targetLabel,form:f.ja[tense][j],reading:f.reading[tense][j],ja:target==='modifier'?f.ja[tense][j]+v.noun:v.prefix+f.ja[tense][j],ko:target==='modifier'?v.modifierKo[i]+' '+v.nounKo:[v.prefixKo,target==='plain'?v.plainKo[i]:v.politeKo[i]].filter(Boolean).join(' ')})));}
const api={verbs,rows,targets,forms,cells};root.VerbPractice=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
