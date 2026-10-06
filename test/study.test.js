const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const core=require('../study-core');
test('furigana preserves kana around and between kanji',()=>{
 assert.deepEqual(core.rubyParts('高い','たかい'),[{text:'高',reading:'たか'},{text:'い'}]);
 assert.deepEqual(core.rubyParts('お母さん','おかあさん'),[{text:'お'},{text:'母',reading:'かあ'},{text:'さん'}]);
 assert.deepEqual(core.rubyParts('食べ物','たべもの'),[{text:'食',reading:'た'},{text:'べ'},{text:'物',reading:'もの'}]);
 assert.equal(core.ruby('高い','たかい',false),'<ruby>高</ruby>い');assert.equal(core.ruby('パン','パン'), 'パン');
});
test('verb forms cover all godan endings and exceptions',()=>{
 for(const [w,te,past,neg,masu] of [['買う','買って','買った','買わない','買います'],['書く','書いて','書いた','書かない','書きます'],['泳ぐ','泳いで','泳いだ','泳がない','泳ぎます'],['話す','話して','話した','話さない','話します'],['待つ','待って','待った','待たない','待ちます'],['死ぬ','死んで','死んだ','死なない','死にます'],['遊ぶ','遊んで','遊んだ','遊ばない','遊びます'],['読む','読んで','読んだ','読まない','読みます'],['帰る','帰って','帰った','帰らない','帰ります']]){const f=core.verbForms(w,'v5');assert.deepEqual([f.te,f.past,f.neg,f.masu],[te,past,neg,masu]);}
 assert.equal(core.verbForms('食べる','v1').te,'食べて');assert.equal(core.verbForms('する','irregular').neg,'しない');assert.equal(core.verbForms('来る','irregular').masu,'来ます');assert.equal(core.verbForms('行く','v5').te,'行って');assert.equal(core.verbForms('いく','v5').te,'いって');assert.equal(core.verbForms('ある','v5').neg,'ない');
});
function setup(){
 const nodes=new Map(),node=id=>{if(!nodes.has(id))nodes.set(id,{textContent:'',innerHTML:'',className:'',checked:true,hidden:false,dataset:{},classList:{contains:()=>true,add(){},remove(){}}});return nodes.get(id);};
 const c=vm.createContext({console,Math,rpick:a=>a[Math.floor(Math.random()*a.length)],StudyCore:core,localStorage:{},setTimeout:()=>1,clearTimeout(){},document:{addEventListener(){},activeElement:{}},$:s=>node(s),$$:()=>[],esc:core.escape,toast(){}});
 const html=fs.readFileSync('index.html','utf8'),start=html.indexOf('const ONES='),end=html.indexOf('// DAILY ASSET',start);
 const section=html.slice(start,html.indexOf('// PORTFOLIO',start)>0?html.indexOf('// PORTFOLIO',start):end);
 // Include only the quiz declarations, not unrelated portfolio code.
 vm.runInContext(section.slice(0,section.indexOf('qnext();')+9),c);
 for(const p of ['data/vocabulary.js','data/grammar.js','study.js'])vm.runInContext(fs.readFileSync(p,'utf8'),c);
 return c;
}
test('every category generates four distinct choices with exactly one answer',()=>{
 const c=setup();const counts=vm.runInContext('words.length',c);assert.ok(counts>=674);
 for(const group of ['all','numbers','words','grammar','sentences']){
  const subs=vm.runInContext(`STUDY_GROUPS.${group}.subs.map(x=>x[0])`,c);if(!subs.length)subs.push('all');
  for(const sub of subs)for(let i=0;i<60;i++){
   const q=vm.runInContext(`studyGroup=${JSON.stringify(group)};studySub=${JSON.stringify(sub)};nextStudyQuestion()`,c);
   assert.equal(q.choices.length,4,`${group}/${sub}`);assert.equal(new Set(q.choices).size,4);assert.equal(q.choices.filter(x=>x===q.a).length,1);assert.ok(!q.choices.some(x=>/undefined/.test(x)),q.q);
  }
 }
});
test('reading questions hide furigana until answered, toggle does not replace question',()=>{
 const c=setup();vm.runInContext("studyGroup='words';studySub='i';wordMode='reading';qnext()",c);
 for(let i=0;i<50&&!vm.runInContext('jq.readingTest',c);i++)vm.runInContext('qnext()',c);
 assert.ok(vm.runInContext('jq.readingTest',c));assert.ok(!vm.runInContext('studyHTML(jq.q)',c).includes('<rt>'));
 assert.ok(vm.runInContext('studyHTML(jq.q,true)',c).includes('<rt>'));
 const before=vm.runInContext('JSON.stringify(jq)',c);vm.runInContext('showFurigana=false;paintQuestion()',c);assert.equal(vm.runInContext('JSON.stringify(jq)',c),before);
});
test('correct answer updates existing stats and manual mode leaves explanation available',()=>{
 const c=setup();vm.runInContext("autoNext=false;qnext();pickChoice({dataset:{choice:jq.a}})",c);
 assert.equal(vm.runInContext('js.correct',c),1);assert.equal(vm.runInContext('js.total',c),1);assert.equal(vm.runInContext('js.score',c),10);assert.equal(vm.runInContext('qt',c),null);assert.ok(vm.runInContext('locked',c));
});
