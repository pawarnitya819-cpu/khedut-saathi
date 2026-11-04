const $=id=>document.getElementById(id);
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem('ks-'+key))??fallback}catch{return fallback}};
const write=(key,value)=>{try{localStorage.setItem('ks-'+key,JSON.stringify(value));return true}catch{return false}};
const prefs={district:0,crop:0,en:false,a:0,b:1,...read('prefs',{})};
const t=(en,gu)=>prefs.en?en:gu;
const tr=pair=>pair?t(...pair):t('Unavailable','ઉપલબ્ધ નથી');
const money=value=>value==null?tr(null):'₹'+new Intl.NumberFormat('en-IN',{maximumFractionDigits:2}).format(value);
const date=(value,time=false)=>value?new Intl.DateTimeFormat(prefs.en?'en-IN':'gu-IN',{dateStyle:'medium',...(time?{timeStyle:'short'}:{}),timeZone:'Asia/Kolkata'}).format(new Date(value)):tr(null);
const unit=value=>value==='kg'?t('kg','કિગ્રા'):value==='q'?t('quintal','ક્વિન્ટલ'):tr(null);
const icon=name=>'<span class="icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="'+({weather:'M5 15h14a3 3 0 0 0 0-6 5 5 0 0 0-9-2A4 4 0 0 0 5 15zm3 3-1 2m6-2-1 2m6-2-1 2',mandi:'M3 9l2-5h14l2 5v3H3zm2 3v8h14v-8m-9 8v-5h4v5',sale:'M6 3h12v18H6zm3 4h6m-6 5h1m4 0h1m-6 4h1m4 0h1',schemes:'M6 3h8l4 4v14H6zm8 0v5h4m-9 4h6m-6 4h6'})[name]+'"/></svg></span>';
const toolsList=[['weather',['Weather','હવામાન'],['Rain and field work','વરસાદ અને ખેતરકામ']],['mandi',['Mandi Prices','મંડીના ભાવ'],['Compare two markets','બે મંડીની સરખામણી']],['sale',['Sale Calculator','વેચાણની ગણતરી'],['Amount after expenses','ખર્ચ બાદ મળતી રકમ']],['schemes',['Government Schemes','સરકારી યોજનાઓ'],['Documents and application','દસ્તાવેજો અને અરજી']]];
const select=(id,label,items,value)=>'<label for="'+id+'">'+label+'<select id="'+id+'">'+items.map((item,i)=>'<option value="'+i+'"'+(i===value?' selected':'')+'>'+tr(item)+'</option>').join('')+'</select></label>';
const input=(id,label,value)=>'<label for="'+id+'">'+label+'<input id="'+id+'" type="number" min="0" step="any" inputmode="decimal" required value="'+value+'"></label>';
const notice=message=>'<p class="notice">'+message+'</p>';
const stale=(stamp,hours)=>!stamp||Date.now()-Date.parse(stamp)>hours*3600000;
const source=r=>'<details><summary>'+t('More details','વધુ વિગતો')+'</summary><small>'+t('Source','સ્રોત')+' · '+tr(r.source)+'</small></details>';
const button=(href,label,secondary=false)=>'<a class="action '+(secondary?'secondary':'')+'" href="'+href+'">'+label+'</a>';
const savePrefs=()=>write('prefs',prefs);
const getSaved=()=>read('markets',[]);
let pending=0;
let quoteRows=[];
let draft=null;
const online=()=>navigator.onLine!==false;
async function loadCard(kind,id){
 const key=kind+'-'+id;
 if(!online())return {value:read(key,null),saved:true};
 let timer;
 try{
   const value=await Promise.race([provider[kind](id),new Promise((_,reject)=>{timer=setTimeout(reject,4500)})]);
   write(key,value);
   return {value,saved:false};
 }catch{return {value:read(key,null),saved:true}}finally{clearTimeout(timer)}
}
const sample=r=>r.sample?'<span class="pill">'+t('Sample data','નમૂનાનો ડેટા')+'</span>':'';
const savedMessage=t=>t('Saved on this device','આ ફોનમાં સાચવેલી માહિતી');
function status(saved,old){return (saved?notice(savedMessage(t)):'')+(old?notice(t('Outdated data · check for a newer report','જૂની માહિતી · નવો અહેવાલ તપાસો')):'')}
function home(){
 return '<p class="eyebrow">'+t('Field & market tools','ખેતર અને બજારનાં સાધનો')+'</p><h1>'+t('Your farm dashboard','તમારા ખેતરની માહિતી')+'</h1><section class="panel selection"><div class="grid fields">'+select('district',t('District','જિલ્લો'),districts,prefs.district)+select('crop',t('Crop','પાક'),crops,prefs.crop)+'</div></section><div class="grid shortcuts">'+toolsList.map(([id,label,desc])=>'<a class="tile" href="#'+id+'">'+icon(id)+'<span>'+tr(label)+'</span><small>'+tr(desc)+'</small></a>').join('')+'</div>'+notice(t('College demo · weather and mandi prices are examples.','કોલેજ ડેમો · હવામાન અને મંડીના ભાવ નમૂના છે.'));
}
function weather({value:r,saved}){
 if(!r)return unavailable('weather');
 const rain=r.rain>=50;
 return '<article class="panel">'+sample(r)+'<h2>'+tr(districts[r.district])+'</h2><div class="big">'+(rain?t('Rain likely','વરસાદની શક્યતા વધુ'):t('Low chance of rain','વરસાદની શક્યતા ઓછી'))+'</div><p>'+t('Chance of rain','વરસાદની શક્યતા')+' · '+r.rain+'%</p>'+status(saved,stale(r.updated,24))+'<h2>'+t('Field work advisory','ખેતરકામની સલાહ')+'</h2><p>'+(rain?t('Postpone spraying and cover harvested crops before rain.','છંટકાવ મુલતવી રાખો અને વરસાદ પહેલાં કાપેલો પાક ઢાંકો.'):t('Routine field work can go ahead in this sample outlook. Check local conditions before spraying.','આ નમૂના મુજબ સામાન્ય ખેતરકામ કરી શકાય. છંટકાવ પહેલાં સ્થાનિક સ્થિતિ તપાસો.'))+'</p><small>'+t('Issued','સલાહનો સમય')+' · '+date(r.issued,true)+'<br>'+t('Last update','છેલ્લો સુધારો')+' · '+date(r.updated,true)+'</small>'+source(r)+'</article>';
}
function unavailable(page){return notice(t('Data unavailable. Reconnect and try again.','માહિતી ઉપલબ્ધ નથી. ઇન્ટરનેટ જોડીને ફરી પ્રયાસ કરો.'))+(page==='mandi'?button('#sale',t('Enter prices manually','ભાવ જાતે દાખલ કરો')):'');}
function mandi({value:rows,saved}){
 if(!rows)return unavailable('mandi');
 quoteRows=rows;
 const a=rows[prefs.a],b=rows[prefs.b], favorites=getSaved();
 const differences=[];
 if(a.id===b.id)differences.push(t('Choose two different markets.','બે અલગ મંડી પસંદ કરો.'));
 if(!a.grade||!b.grade||a.grade[0]!==b.grade[0])differences.push(t('Grade differs or is unavailable.','ગુણવત્તા અલગ છે અથવા ઉપલબ્ધ નથી.'));
 if(a.unit!==b.unit)differences.push(t('Sale units differ.','વેચાણના એકમ અલગ છે.'));
 if(!a.date||!b.date||a.date!==b.date)differences.push(t('Reporting dates differ or are unavailable.','ભાવની તારીખ અલગ છે અથવા ઉપલબ્ધ નથી.'));
 const card=r=>'<article class="panel">'+sample(r)+'<h2>'+tr(r.market)+'</h2><div class="big">'+money(r.price)+(r.price==null?'':' <small>/ '+unit(r.unit)+'</small>')+'</div><p>'+t('Reported','ભાવની તારીખ')+' · '+date(r.date)+'<br>'+t('Grade / variety','ગુણવત્તા / જાત')+' · '+tr(r.grade)+'</p>'+status(saved,Boolean(r.date)&&stale(r.date,48))+source(r)+'<div class="row"><button class="secondary" data-save="'+r.id+'" aria-pressed="'+favorites.includes(r.id)+'">'+(favorites.includes(r.id)?t('★ Saved','★ સાચવ્યું'):t('☆ Save market','☆ મંડી સાચવો'))+'</button><button class="secondary" data-share="'+r.id+'">'+t('Share','શેર કરો')+'</button></div></article>';
 return '<section class="panel selection grid fields">'+select('a',t('First mandi','પહેલી મંડી'),markets,prefs.a)+select('b',t('Second mandi','બીજી મંડી'),markets,prefs.b)+'</section>'+(differences.length?notice(differences.join(' ')):'')+'<div class="grid pair">'+card(a)+card(b)+'</div><p id="share-status" role="status"></p><textarea id="share-text" rows="4" hidden readonly style="width:100%"></textarea>'+button('#sale',t('Calculate proceeds','મળતી રકમ ગણો'))+'<details><summary>'+t('Saved markets','સાચવેલી મંડી')+'</summary>'+(favorites.length?'<div class="row">'+favorites.map(id=>'<button class="secondary" data-pick="'+id+'">'+tr(markets[id])+'</button>').join('')+'</div>':t('No saved markets yet.','હજુ કોઈ મંડી સાચવી નથી.'))+'</details>';
}
function sale({value:rows,saved}){
 const sides=[prefs.a,prefs.b];
 const key=prefs.crop+'-'+sides.join('-');
 if(draft?.key!==key)draft={key,quantity:'',quantityUnit:1,sides:sides.map(id=>({price:rows?.[id]?.price??'',priceUnit:rows?.[id]?.unit==='kg'?0:1,freight:0,fees:0}))};
 const labels=[['Kilograms','કિલોગ્રામ'],['Quintals','ક્વિન્ટલ']];
 return (rows?notice(t('Starting prices come from sample mandi cards. Edit them as needed.','શરૂઆતના ભાવ મંડીના નમૂનામાંથી છે. જરૂર મુજબ બદલો.')):notice(t('Enter expected prices manually.','અપેક્ષિત ભાવ જાતે દાખલ કરો.')))+(saved&&rows?notice(savedMessage(t)):'')+'<form id="calculator" novalidate><div class="panel grid fields">'+input('quantity',t('Quantity','જથ્થો'),draft.quantity)+select('quantityUnit',t('Quantity unit','જથ્થાનો એકમ'),labels,draft.quantityUnit)+'</div><div class="grid pair">'+sides.map((id,i)=>{const d=draft.sides[i],r=rows?.[id];return '<section class="panel"><h2>'+tr(markets[id])+'</h2>'+(r?'<p><small>'+t('Sample quote','નમૂનાનો ભાવ')+' · '+date(r.date)+' · '+tr(r.source)+'</small></p>'+status(false,Boolean(r.date)&&stale(r.date,48)):'')+'<div class="grid fields">'+input('price'+i,t('Expected price ₹','અપેક્ષિત ભાવ ₹'),d.price)+select('priceUnit'+i,t('Price per','ભાવનો એકમ'),labels,d.priceUnit)+input('freight'+i,t('Transport ₹','ભાડું ₹'),d.freight)+input('fees'+i,t('Other fees ₹','અન્ય ખર્ચ ₹'),d.fees)+'</div></section>'}).join('')+'</div><button>'+t('Calculate','ગણતરી કરો')+'</button></form><div id="result" aria-live="polite" style="margin-top:16px"></div>';
}
function calculate(){
 const number=id=>$(id).value===''?NaN:$(id).valueAsNumber;
 draft.quantity=$('quantity').value;
 draft.quantityUnit=+$('quantityUnit').value;
 draft.sides.forEach((d,i)=>Object.keys(d).forEach(k=>d[k]=k==='priceUnit'?+$(k+i).value:$(k+i).value));
 const ids=['quantity','price0','freight0','fees0','price1','freight1','fees1'];
 const invalid=ids.filter(id=>!Number.isFinite(number(id))||number(id)<0||(id==='quantity'&&number(id)===0));
 ids.forEach(id=>$(id).setAttribute('aria-invalid',String(invalid.includes(id))));
 if(invalid.length){$('result').innerHTML='<p class="error">'+t('Enter a quantity above zero and valid prices and costs of zero or more.','જથ્થો શૂન્યથી વધુ રાખો. ભાવ અને ખર્ચમાં શૂન્ય કે તેથી વધુ રકમ લખો.')+'</p>';$(invalid[0]).focus();return}
 const kg=number('quantity')*(draft.quantityUnit===1?100:1);
 const results=draft.sides.map((d,i)=>{const gross=kg/(d.priceUnit===1?100:1)*number('price'+i),cost=number('freight'+i)+number('fees'+i);return {gross,cost,net:gross-cost}});
 if(results.some(r=>!Number.isFinite(r.gross)||!Number.isFinite(r.cost)||!Number.isFinite(r.net))){$('result').innerHTML=notice(t('Enter smaller amounts.','નાની રકમ દાખલ કરો.'));return}
 const diff=Math.round((results[0].net-results[1].net)*100)/100;
 const winner=diff===0?-1:diff>0?0:1;
 $('result').innerHTML='<h2>'+t('Estimated proceeds','અંદાજે મળતી રકમ')+'</h2>'+notice(winner<0?t('Both mandis have the same estimated return.','બંને મંડીમાં અંદાજે સરખી રકમ મળે છે.'):tr(markets[[prefs.a,prefs.b][winner]])+' · '+money(Math.abs(diff))+' '+t('more after costs','ખર્ચ બાદ વધુ'))+'<div class="grid pair">'+results.map((r,i)=>'<article class="panel '+(i===winner?'winner':'')+'"><h2>'+tr(markets[[prefs.a,prefs.b][i]])+'</h2><div class="big">'+money(r.net)+'</div><small>'+t('Gross sale','કુલ વેચાણ')+' · '+money(r.gross)+'<br>'+t('Total costs','કુલ ખર્ચ')+' · '+money(r.cost)+'</small></article>').join('')+'</div>';
}
function schemeList(){return '<p class="muted">'+t('Check current eligibility and document requirements on the official portal.','હાલની પાત્રતા અને જરૂરી દસ્તાવેજો સત્તાવાર પોર્ટલ પર તપાસો.')+'</p>'+schemes.map((s,i)=>'<article class="panel"><h2>'+tr(s.title)+'</h2><p>'+tr(s.summary)+'</p><strong>'+t('Document checklist','દસ્તાવેજોની યાદી')+'</strong>'+s.docs.map((d,j)=>'<label class="check"><input type="checkbox" data-doc="'+i+'-'+j+'" '+(read('doc-'+i+'-'+j,false)?'checked':'')+'>'+tr(d)+'</label>').join('')+'<div class="row">'+button(s.url,t('Official application','સત્તાવાર અરજી'))+'</div></article>').join('')}
async function render(){
 const token=++pending;
 const current=location.hash.slice(1);
 const item=toolsList.find(([id])=>id===current);
 document.documentElement.lang=prefs.en?'en':'gu';
 $('language').textContent=t('ગુજરાતી','English');
 $('language').lang=t('gu','en');
 $('footer').textContent=t('Khedut Saathi · College prototype · Guest tools','ખેડૂત સાથી · કોલેજ પ્રોટોટાઇપ · લૉગિન વગર ઉપયોગ');
 const offline=online()?'':notice(t('Offline · showing information saved on this device when available.','ઇન્ટરનેટ બંધ છે · ફોનમાં સાચવેલી માહિતી ઉપલબ્ધ હોય ત્યાં દેખાશે.'));
 const header=item?'<div class="back">'+button('#home',t('← Home','← મુખ્ય પાનું'),true)+'</div><p class="eyebrow">'+tr(districts[prefs.district])+' · '+tr(crops[prefs.crop])+'</p><h1>'+tr(item[1])+'</h1>':'';
 if(!item||current==='schemes'){$('app').innerHTML=offline+header+(item?schemeList():home());return}
 $('app').innerHTML=offline+header+'<p role="status">'+t('Loading… A slow connection may take a few seconds.','માહિતી લાવી રહ્યા છીએ… ધીમા ઇન્ટરનેટમાં થોડી વાર લાગી શકે.')+'</p>';
 const response=await loadCard(current==='weather'?'weather':'prices',current==='weather'?prefs.district:prefs.crop);
 if(token!==pending)return;
 $('app').innerHTML=offline+header+({weather,mandi,sale})[current](response);
}
$('language').onclick=()=>{prefs.en=!prefs.en;savePrefs();render()};
$('app').addEventListener('change',e=>{
 const {id,dataset,checked,value}=e.target;
 if(['district','crop','a','b'].includes(id)){prefs[id]=+value;savePrefs();render().then(()=>$(id)?.focus())}
 if(dataset.doc)write('doc-'+dataset.doc,checked);
});
$('app').addEventListener('input',e=>{
 if(e.target.form?.id!=='calculator'||!draft)return;
 const {id,value}=e.target;
 if(id==='quantity'||id==='quantityUnit')draft[id]=id==='quantity'?value:+value;
 else {const key=id.slice(0,-1);draft.sides[+id.at(-1)][key]=key==='priceUnit'?+value:value}
 $('result').textContent='';
});
$('app').addEventListener('submit',e=>{if(e.target.id==='calculator'){e.preventDefault();calculate()}});
$('app').addEventListener('click',async e=>{
 const {save,share,pick}=e.target.dataset;
 if(save!==undefined){
   const id=+save, existing=getSaved(), selected=!existing.includes(id);
   if(write('markets',selected?[...existing,id]:existing.filter(x=>x!==id))){
     document.querySelectorAll('[data-save="'+id+'"]').forEach(b=>{b.textContent=selected?t('★ Saved','★ સાચવ્યું'):t('☆ Save market','☆ મંડી સાચવો');b.setAttribute('aria-pressed',selected)});
     render().then(()=>document.querySelector('[data-save="'+id+'"]')?.focus());
   }else $('share-status').textContent=t('This device could not save the market.','આ ફોનમાં મંડી સાચવી શકાઈ નહીં.');
 }
 if(pick!==undefined){prefs.a=+pick;savePrefs();render().then(()=>$('a')?.focus())}
 if(share!==undefined){
   const r=quoteRows[+share];
   const message=['Khedut Saathi · '+tr(r.source),tr(r.market)+' · '+tr(crops[prefs.crop]),money(r.price)+(r.price==null?'':' / '+unit(r.unit)),tr(r.grade),t('Reported','ભાવની તારીખ')+' · '+date(r.date)].join('\n');
   try{if(navigator.share){await navigator.share({text:message});return}await navigator.clipboard.writeText(message);if($('share-status'))$('share-status').textContent=t('Dated price card copied.','તારીખ સાથેનો ભાવ કૉપી થયો.')}
   catch(error){if(error.name==='AbortError'||!$('share-text'))return;$('share-text').hidden=false;$('share-text').value=message;$('share-text').select();$('share-status').textContent=t('Copy this dated price card to share it.','શેર કરવા તારીખ સાથેનો ભાવ કૉપી કરો.')}
 }
});
addEventListener('hashchange',()=>{window.scrollTo(0,0);render()});
addEventListener('online',render);
addEventListener('offline',render);
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
render();