/* Category navigation and kanji/furigana quiz presentation. */
const POS_NAMES={noun:'명사',verb:'동사',i:'이형용사',na:'나형용사',adverb:'부사',other:'기타·인사말'};
const STUDY_GROUPS={
 all:{label:'전체',subs:[]},
 numbers:{label:'숫자·시간',subs:[['all','전체'],['number','숫자'],['date','날짜·요일']]},
 words:{label:'단어',subs:[['all','전체'],...Object.entries(POS_NAMES) ]},
 grammar:{label:'문법',subs:[['all','전체'],['basic','기본문장'],['particle','조사'],['i','이형용사 활용'],['na','나형용사 활용'],['verb','동사 활용'],['expression','문법 표현'],['connection','문장 연결']]},
 sentences:{label:'문장',subs:[['all','전체'],['meaning','뜻 고르기'],['blank','빈칸 채우기']]}
};
let studyGroup='all',studySub='all',wordMode='meaning',verbKind='all';
let showFurigana=localStorage.jpFurigana!=='off',autoNext=localStorage.jpAutoNext!=='off';
const originalMakeQ=makeQ;
const words=[...N5_WORDS];
// Keep existing app words that are not represented in the imported list.
const legacy=[...VOC.map(x=>({reading:x[1],meaning:x[0],pos:'noun'})),...NA.map(x=>({reading:x[0],meaning:x[1],pos:'na'})),...IA.map(x=>({reading:x[0],meaning:x[1],pos:'i'}))];
legacy.forEach((w,i)=>{if(!words.some(x=>x.reading===w.reading&&x.pos===w.pos))words.push({...w,word:w.reading,id:'legacy-'+i,level:'기초 보충',source:'original'});});
const rubyMap=new Map();
function addRuby(word,reading){if(/[一-龯々]/.test(word))rubyMap.set(word,reading);}
words.forEach(w=>addRuby(w.word,w.reading));
// Explicit inflected readings avoid assuming 来 has the same reading in every form.
words.filter(w=>w.pos==='verb').forEach(w=>{
 try{
  const f=StudyCore.verbForms(w.word,w.group),r=StudyCore.verbForms(w.reading,w.word==='来る'?'v1':w.group);
  if(w.word==='来る')Object.assign(r,{masu:'きます',neg:'こない',te:'きて',past:'きた',pastpolite:'きました',pastneg:'こなかった'});
  Object.keys(f).forEach(k=>addRuby(f[k],r[k]));
 }catch(e){/* Nominal entries are not used as conjugation prompts. */}
});
words.filter(w=>['i','na'].includes(w.pos)).forEach(w=>{
 const fn=w.pos==='i'?iForms:naForms;
 const f=fn(w.word),r=fn(w.reading);Object.keys(f).forEach(k=>addRuby(f[k],r[k]));
});
VerbPractice.verbs.forEach(v=>VerbPractice.cells(v).forEach(c=>addRuby(c.form,c.reading)));
const rubyKeys=[...rubyMap.keys()].sort((a,b)=>b.length-a.length);
function studyHTML(text,reveal=false){
 let out='',i=0;const t=String(text);
 while(i<t.length){const key=rubyKeys.find(k=>t.startsWith(k,i));if(key){out+=StudyCore.ruby(key,rubyMap.get(key),showFurigana&&(!jq?.readingTest||reveal));i+=key.length;}else{out+=StudyCore.escape(t[i]);i++;}}
 return out.replace(/\n/g,'<br>');
}
function choicesFor(answer,pool){const others=shuffle(uniq(pool).filter(x=>x!==answer)).slice(0,3);if(others.length<3)throw Error('Insufficient unique choices');return shuffle([answer,...others]);}
function wordQuestion(pos='all'){
 const bank=pos==='all'?words:words.filter(w=>w.pos===pos),w=rpick(bank),same=words.filter(x=>x.pos===w.pos&&x.id!==w.id);
 const readingTest=wordMode==='reading'&&/[一-龯々]/.test(w.word);
 if(readingTest)return{q:`「${w.word}」の読み方は？（읽는 법）`,a:w.reading,cat:`단어 · ${POS_NAMES[w.pos]} · 읽기`,choices:choicesFor(w.reading,same.map(x=>x.reading)),why:`${w.word}는 ${w.reading}로 읽고, 뜻은 '${w.meaning}'입니다.`,readingTest:true};
 if(wordMode==='reading'&&!/[一-龯々]/.test(w.word))return{q:`「${w.word}」의 뜻은? (가나 표기 단어)`,a:w.meaning,cat:`단어 · ${POS_NAMES[w.pos]} · 뜻`,choices:choicesFor(w.meaning,same.map(x=>x.meaning)),why:`${w.word} · ${w.meaning}`};
 const koToJa=Math.random()<.5;
 return{q:koToJa?`「${w.meaning}」에 맞는 일본어는?`:`「${w.word}」의 뜻은?`,a:koToJa?w.word:w.meaning,cat:`단어 · ${POS_NAMES[w.pos]} · 뜻`,choices:choicesFor(koToJa?w.word:w.meaning,same.map(x=>koToJa?x.word:x.meaning)),why:`${w.word} (${w.reading}) · ${w.meaning}`};
}
const VERB_KINDS=[['ます형','masu'],['ない형','neg'],['て형','te'],['た형 (보통체 과거)','past'],['정중한 과거형','pastpolite'],['보통체 과거 부정','pastneg']];
function verbQuestion(){
 if(verbKind==='sentence')return verbSentenceQuestion();
 const bank=words.filter(x=>x.pos==='verb'&&(/[うくぐすつぬぶむる]$/.test(x.word))),w=rpick(bank),kind=verbKind==='all'?rpick(VERB_KINDS):VERB_KINDS.find(x=>x[1]===verbKind),f=StudyCore.verbForms(w.word,w.group);
 return{q:`「${w.word}」(${w.meaning})의 ${kind[0]}은?`,a:f[kind[1]],cat:`문법 · 동사 활용 · ${kind[0]}`,choices:choicesFor(f[kind[1]],Object.values(f)),why:`${w.word} → ${f[kind[1]]}. ${w.group==='v1'?'2그룹(1단)':w.group==='irregular'?'3그룹(불규칙)':'1그룹(5단)'} 동사입니다.${w.word==='行く'?' 行く의 て형·た형은 예외로 行って·行った입니다.':''}`};
}
let practiceVerb='mixed',practiceTarget='all';
function verbSentenceQuestion(){
 const v=practiceVerb==='mixed'?rpick(VerbPractice.verbs):VerbPractice.verbs.find(v=>v.word===practiceVerb),cells=VerbPractice.cells(v),cell=rpick(cells.filter(c=>practiceTarget==='all'||c.target===practiceTarget));
 const future=cell.tense==='future',present=cell.tense==='present';
 const context=future?'내일의 일을 말합니다. ':present?'평소·현재의 일을 말합니다. ':'';
 const pool=cells.map(c=>c.ja);
 const why=cell.target==='modifier'?`보통체 ${cell.form} 뒤에 ${v.noun}을 붙여 ${cell.ja}로 명사를 꾸밉니다. 명사를 꾸미는 절은 보통체를 쓰고, 문장 끝에서 정중함을 표현합니다.`:`${cell.label}의 ${cell.targetLabel}: ${cell.ja}.`;
 return{q:`${context}「${cell.ko}」에 맞는 표현은?`,a:cell.ja,cat:`문법 · 문장·명사 꾸미기 · ${cell.label} / ${cell.targetLabel}`,choices:choicesFor(cell.ja,pool),why:why+(future||present?' 일본어는 현재·미래에 같은 형태를 쓰므로 시간 표현과 문맥으로 구분합니다.':''),practiceWord:v.word};
}
function renderVerbComparison(){
 const panel=$('#verbPracticePanel');panel.hidden=!(studyGroup==='grammar'&&studySub==='verb'&&verbKind==='sentence');if(panel.hidden)return;
 const v=VerbPractice.verbs.find(v=>v.word===(practiceVerb==='mixed'?jq?.practiceWord:practiceVerb))||VerbPractice.verbs[0],cells=VerbPractice.cells(v);
 $('#verbCompareContent').innerHTML=`<p class="verb-compare-title">${studyHTML(v.word,true)} · ${v.plainKo[0]} / ${v.nounKo} 꾸미기</p><div class="verb-compare-wrap"><table class="verb-compare"><thead><tr><th scope="col">의미</th>${VerbPractice.targets.map(t=>`<th scope="col">${t[1]}</th>`).join('')}</tr></thead><tbody>${VerbPractice.rows.map(([tense,label])=>`<tr><th scope="row">${label}</th>${cells.filter(c=>c.tense===tense).length?cells.filter(c=>c.tense===tense).map(c=>`<td>${studyHTML(c.ja,true)}<small>${esc(c.ko)}</small></td>`).join(''):'<td colspan="3">この動詞の ～ている は今回の練習対象外です。<small>이 동사는 이 문맥에서 진행·상태 연습을 생략해요.</small></td>'}</tr>`).join('')}</tbody></table></div><p class="verb-compare-note">회화에서는 ～ている를 ～てる로 줄이기도 해요. ～ている는 동사와 문맥에 따라 진행·상태·반복을 나타냅니다. 동사가 형용사로 바뀌는 것이 아니라 동사절이 명사를 꾸미는 역할이에요.</p>`;
}
function adjectiveQuestion(type){
 const w=rpick(words.filter(x=>x.pos===type)),forms=type==='i'?iForms(w.word):naForms(w.word),kinds=type==='i'?[['부정형','neg'],['과거형','past'],['과거 부정형','pastneg'],['て형','te']]:[['부정형','neg'],['과거형','past'],['과거 부정형','pastneg'],['명사 앞 형태','attr'],['부사형','adv']],kind=rpick(kinds);
 return{q:`「${w.word}」(${w.meaning})의 ${kind[0]}은?`,a:forms[kind[1]],cat:`문법 · ${POS_NAMES[type]} 활용`,choices:choicesFor(forms[kind[1]],Object.values(forms)),why:`${w.word} → ${forms[kind[1]]}.${w.word==='いい'?' いい는 활용할 때 よ-로 바뀝니다.':''}`};
}
function patternQuestion(type){const x=rpick(GRAMMAR_ITEMS.filter(x=>type==='all'||x.type===type));return{q:`「${x.ja}」의 뜻은?`,a:x.meaning,cat:`문법 · ${STUDY_GROUPS.grammar.subs.find(s=>s[0]===x.type)[1]}`,choices:shuffle([x.meaning,...x.wrong]),why:x.why};}
function particleQuestion(){const q=originalMakeQ('particle');if(q.a==='に'||q.a==='へ')q.choices=choicesFor(q.a,['は','を','で','と','の']);return q;}
function sentenceQuestion(blank=false){
 if(!blank){const x=rpick(SENT);return{q:`「${x[1]}」의 뜻은?`,a:x[0],cat:'문장 · 뜻 고르기',choices:choicesFor(x[0],SENT.map(s=>s[0])),why:`${x[1]} → ${x[0]}`};}
 return particleQuestion();
}
function nextStudyQuestion(){
 if(studyGroup==='numbers')return originalMakeQ(studySub==='all'?rpick(['number','date']):studySub);
 if(studyGroup==='words')return wordQuestion(studySub);
 if(studyGroup==='grammar'){
  const sub=studySub==='all'?rpick(['basic','particle','i','na','verb','expression','connection']):studySub;
  return sub==='verb'?verbQuestion():['i','na'].includes(sub)?adjectiveQuestion(sub):sub==='particle'?particleQuestion():patternQuestion(sub);
 }
 if(studyGroup==='sentences')return sentenceQuestion(studySub==='all'?Math.random()<.5:studySub==='blank');
 return rpick([()=>wordQuestion(),()=>verbQuestion(),()=>patternQuestion('all'),()=>particleQuestion(),()=>adjectiveQuestion(rpick(['i','na'])),()=>originalMakeQ(rpick(['number','date'])),()=>sentenceQuestion()])();
}
function paintQuestion(){
 $('#jpQ').innerHTML=studyHTML(jq.q,locked);$('#jpCategory').textContent=jq.cat+' · 4지선다';
 $('#jpChoices').innerHTML=jq.choices.map((v,i)=>`<button class="choice-btn" data-choice="${esc(v)}"><span>${i+1}</span><div>${studyHTML(v,locked)}</div></button>`).join('');
 $$('[data-choice]').forEach(b=>b.onclick=()=>pickChoice(b));
 if(locked){$$('[data-choice]').forEach(b=>{b.disabled=true;if(b.dataset.choice===jq.a)b.classList.add('correct');if(b.dataset.choice===jq.picked&&jq.picked!==jq.a)b.classList.add('wrong');});}
}
qnext=function(){if(qt){clearTimeout(qt);qt=null;}locked=false;jq=nextStudyQuestion();paintQuestion();renderVerbComparison();$('#jpA').textContent='보기 하나를 선택하세요.';$('#jpA').className='choice-feedback';renderJpStats();};
pickChoice=function(btn){
 if(locked)return;locked=true;jq.picked=btn.dataset.choice;const ok=jq.picked===jq.a;
 js.total=(js.total||0)+1;if(ok){js.score=(js.score||0)+10;js.correct=(js.correct||0)+1;js.streak=(js.streak||0)+1;}else js.streak=0;
 paintQuestion();$('#jpA').innerHTML=`<b>${ok?'정답! +10점':'오답 · 정답: '+studyHTML(jq.a,true)}</b><div class="quiz-explain">${studyHTML(jq.why,true)}</div>`;
 $('#jpA').className='choice-feedback '+(ok?'ok':'bad');localStorage.jpStats=JSON.stringify(js);renderJpStats();
 if(ok&&autoNext)qt=setTimeout(qnext,1800);
};
function renderStudyFilters(){
 $('#jpTypes').innerHTML=Object.entries(STUDY_GROUPS).map(([k,g])=>`<button class="chip ${studyGroup===k?'active':''}" aria-pressed="${studyGroup===k}" data-group="${k}">${g.label}</button>`).join('');
 $('#jpSubtypes').innerHTML=STUDY_GROUPS[studyGroup].subs.map(([k,label])=>`<button class="chip ${studySub===k?'active':''}" aria-pressed="${studySub===k}" data-sub="${k}">${label}</button>`).join('');
 $('#jpWordModes').hidden=studyGroup!=='words';$('#jpVerbModes').hidden=!(studyGroup==='grammar'&&studySub==='verb');
 $$('[data-group]').forEach(b=>b.onclick=()=>{studyGroup=b.dataset.group;studySub='all';renderStudyFilters();qnext();});
 $$('[data-sub]').forEach(b=>b.onclick=()=>{studySub=b.dataset.sub;renderStudyFilters();qnext();});
 const subLabel=STUDY_GROUPS[studyGroup].subs.find(x=>x[0]===studySub)?.[1];
 $('#studySelection').textContent=STUDY_GROUPS[studyGroup].label+(subLabel?' / '+subLabel:'')+' 문제를 풀고 있어요.';
}
$('#jpFurigana').checked=showFurigana;$('#jpAutoNext').checked=autoNext;
$('#jpFurigana').onchange=e=>{showFurigana=e.target.checked;localStorage.jpFurigana=showFurigana?'on':'off';paintQuestion();renderVerbComparison();if(locked)$('#jpA').innerHTML=`<b>${jq.picked===jq.a?'정답! +10점':'오답 · 정답: '+studyHTML(jq.a,true)}</b><div class="quiz-explain">${studyHTML(jq.why,true)}</div>`;};
$('#jpAutoNext').onchange=e=>{autoNext=e.target.checked;localStorage.jpAutoNext=autoNext?'on':'off';if(!autoNext&&qt){clearTimeout(qt);qt=null;}};
$('#wordMode').onchange=e=>{wordMode=e.target.value;qnext();};$('#verbKind').onchange=e=>{verbKind=e.target.value;qnext();};
$('#practiceVerb').innerHTML='<option value="mixed">여러 동사 섞기</option>'+VerbPractice.verbs.map(v=>`<option value="${esc(v.word)}">${esc(v.word)} (${esc(v.reading)})</option>`).join('');
$('#practiceVerb').onchange=e=>{practiceVerb=e.target.value;qnext();};$('#practiceTarget').onchange=e=>{practiceTarget=e.target.value;qnext();};
$('#jpNext').onclick=qnext;
$('#vocabCount').textContent=words.length+'개';
renderStudyFilters();qnext();
