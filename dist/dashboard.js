/* Max no Zap: leitura fiel às exportações agregadas da Meta Ads. */
const DATA = window.META_DATA;
const REPORT = {start: DATA.start, end: DATA.end, days:69};
const classify = row => row.resultType === 'profile_visit_view' ? 'traffic' : row.resultType === 'conversions:contact_website' ? 'contact' : row.resultType === 'actions:offsite_conversion.fb_pixel_lead' ? 'lead' : 'unattributed';
const CAMPAIGNS = DATA.campaigns.map((row, index) => ({...row, id: String(index), objective: classify(row)}));
const ADSETS = DATA.adsets.map(row => ({...row, objective: classify(row)}));
const CREATIVES = [...DATA.ads.reduce((map, ad) => {
  const name = ad.name.replace(/ — Cópia$/, '').trim();
  const key = name;
  const creative = map.get(key) || {name, objective: classify(ad), results: 0, spend: 0, impressions: 0, clicks: 0, placements: 0};
  creative.results += ad.results || 0;
  creative.spend += ad.spend || 0;
  creative.impressions += ad.impressions || 0;
  creative.clicks += ad.clicks || 0;
  creative.placements += 1;
  if (classify(ad) !== 'unattributed') creative.objective = classify(ad);
  map.set(key, creative);
  return map;
}, new Map()).values()].map(creative => ({...creative, cpa: creative.results ? creative.spend / creative.results : null, ctr: creative.impressions ? creative.clicks / creative.impressions * 100 : 0}));
const money = value => new Intl.NumberFormat('pt-BR', {style:'currency',currency:'BRL'}).format(value || 0);
const integer = value => new Intl.NumberFormat('pt-BR', {maximumFractionDigits:0}).format(value || 0);
const decimal = value => new Intl.NumberFormat('pt-BR', {minimumFractionDigits:2,maximumFractionDigits:2}).format(value || 0);
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const labels = {lead:'Lead do pixel', contact:'Contato no site', traffic:'Visita ao perfil', unattributed:'Sem resultado atribuído'};
const colors = {lead:'#4564ff',contact:'#879cff',traffic:'#c3d0ff',unattributed:'#5c6c9c'};
const sum = (items, key) => items.reduce((total, item) => total + (Number(item[key]) || 0), 0);
const set = (selector, value) => document.querySelectorAll(selector).forEach(element => { element.textContent = value; });
const leadRows = CAMPAIGNS.filter(row => row.objective === 'lead');
REPORT.leads = sum(leadRows, 'results');
REPORT.leadSpend = sum(leadRows, 'spend');
REPORT.cpa = REPORT.leads ? REPORT.leadSpend / REPORT.leads : 0;
let filters = {campaign:'all',objective:'all',status:'all'};
let sorting = {key:'spend',direction:'desc'};
let creativeSort = 'results';
let spendChart, mixChart;
let period = {start:REPORT.start,end:REPORT.end};
const periodDate = value => new Date(value+'T12:00:00');
const periodScale = () => ((periodDate(period.end)-periodDate(period.start))/86400000+1)/REPORT.days;
const periodExact = () => period.start===REPORT.start && period.end===REPORT.end;
const periodLabel = value => new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short',year:'numeric'}).format(periodDate(value));

function campaignRows() {
  return CAMPAIGNS.filter(row =>
    (filters.campaign === 'all' || row.id === filters.campaign) &&
    (filters.objective === 'all' || row.objective === filters.objective) &&
    (filters.status === 'all' || row.status === filters.status));
}

function metrics(rows) {
  const converting = rows.filter(row => row.objective === 'lead' || row.objective === 'contact');
  const factor=periodScale();
  const spend = sum(rows, 'spend')*factor, clicks = sum(rows, 'clicks')*factor, impressions = sum(rows, 'impressions')*factor;
  const results = sum(converting, 'results')*factor, conversionSpend = sum(converting, 'spend')*factor;
  return {spend,clicks,impressions,results,conversionSpend,
    ctr: impressions ? clicks / impressions * 100 : 0,
    cpc: clicks ? spend / clicks : 0,
    cpa: results ? conversionSpend / results : 0};
}

function renderKPIs(rows) {
  const m = metrics(rows);
  const values = {spend:money(m.spend),clicks:integer(m.clicks),impressions:integer(m.impressions),conversions:integer(m.results),ctr:decimal(m.ctr)+'%',cpc:money(m.cpc),cpa:m.results?money(m.cpa):'—'};
  Object.entries(values).forEach(([key,value]) => set(`[data-kpi="${key}"]`,value));
  set('#campaign-count, #filter-result-count',`${rows.length} ${rows.length===1?'campanha':'campanhas'}`);
  set('#lead-spend',money(m.conversionSpend));
  set('#table-total-spend',money(m.spend));
  const factor=periodScale(),mode=periodExact()?'':' • estimado';
  document.getElementById('outcome-breakdown').innerHTML=`
    <div><span>Leads do pixel${mode}</span><strong>${integer(sum(rows.filter(row=>row.objective==='lead'),'results')*factor)}</strong></div>
    <div><span>Contatos no site${mode}</span><strong>${integer(sum(rows.filter(row=>row.objective==='contact'),'results')*factor)}</strong></div>
    <div><span>Visitas ao perfil${mode}</span><strong>${integer(sum(rows.filter(row=>row.objective==='traffic'),'results')*factor)}</strong></div>
    <div><span>Gasto sem resultado atribuído${mode}</span><strong>${money(sum(rows.filter(row=>row.objective==='unattributed'),'spend')*factor)}</strong></div>`;
  set('#source-badge',periodExact()?'Fonte agregada • Meta Ads':'Estimativa • exportação agregada');
  set('#period-caption',periodLabel(period.start)+' — '+periodLabel(period.end)+(periodExact()?' • observado':' • estimativa linear'));
  set('#chart-period-label',periodLabel(period.start)+' — '+periodLabel(period.end)+(periodExact()?' • observado':' • estimado'));
}

function renderCampaigns(rows) {
  const data = rows.map(row => ({...row, cpa:row.results ? row.spend / row.results : null, ctr:row.impressions ? row.clicks / row.impressions * 100 : 0}));
  data.sort((a,b) => {
    const av = a[sorting.key], bv = b[sorting.key];
    if (av == null) return 1;
    if (bv == null) return -1;
    const comparison = typeof av === 'string' ? av.localeCompare(bv,'pt-BR') : av-bv;
    return sorting.direction === 'asc' ? comparison : -comparison;
  });
  document.getElementById('table-empty').classList.toggle('hidden',data.length > 0);
  document.getElementById('campaign-table-body').innerHTML = data.map(row => `<tr>
    <td>${esc(row.name)}</td>
    <td><span class="table-status ${row.status==='active'?'active':'inactive'}">${row.status==='active'?'Ativa':'Inativa'}</span></td>
    <td><span class="objective-chip">${labels[row.objective]}</span></td>
    <td>${money(row.spend*periodScale())}</td><td>${row.results==null?'—':integer(row.results*periodScale())}</td>
    <td>${row.cpa==null?'—':money(row.cpa)}</td><td>${row.impressions?decimal(row.ctr)+'%':'—'}</td>
  </tr>`).join('');
}

function renderAdsets() {
  const data = ADSETS.filter(row => (filters.objective === 'all' || row.objective === filters.objective)
    && (filters.campaign === 'all' || (filters.campaign === '5' ? row.objective === 'lead' : Number(filters.campaign)>=6 && row.objective==='contact' && Math.abs(row.spend-CAMPAIGNS[Number(filters.campaign)].spend)<.01))
    && (filters.status==='all' || (row.objective==='lead'?'active':'inactive')===filters.status));
  document.getElementById('adset-table-body').innerHTML = data.map(row => {
    const campaign = CAMPAIGNS.find(item => item.objective === row.objective && (row.objective === 'lead' ? item.status === 'active' : Math.abs(item.spend-row.spend)<.01));
    return `<tr><td>${esc(row.name)}</td><td>${campaign?esc(campaign.name):'—'}</td><td>${labels[row.objective]}</td><td>${money(row.spend*periodScale())}</td><td>${row.results==null?'—':integer(row.results*periodScale())}</td><td>${row.results?money(row.spend/row.results):'—'}</td></tr>`;
  }).join('');
}

function renderCreatives() {
  const data = CREATIVES.filter(row => (filters.objective === 'all' || row.objective === filters.objective)
    && (filters.campaign === 'all' || (filters.campaign === '5' ? row.objective === 'lead' : Number(filters.campaign)>=6 && row.name==='Vt Ad Campeao 0'+(Number(filters.campaign)-5)))
    && (filters.status === 'all' || (row.objective==='lead'?'active':'inactive')===filters.status));
  data.sort((a,b) => creativeSort === 'cpa' ? ((a.results>=30?a.cpa:Infinity)-(b.results>=30?b.cpa:Infinity)) || b.results-a.results : b.results-a.results);
  document.getElementById('creative-grid').innerHTML = data.length ? data.map((row,index) => `<article class="creative-card is-visible">
    <div class="creative-thumb" style="--accent:${colors[row.objective]};--dark:#102f8c"><span class="creative-rank">#${index+1}</span><span class="creative-format">${row.objective==='lead'?'LEAD':'CONTATO'}</span><span class="play-button" aria-hidden="true">▶</span><span class="thumb-label">${esc(row.name.split('—')[0])}</span></div>
    <div class="creative-body"><h3>${esc(row.name)}</h3><p class="creative-sub">${row.placements} conjunto(s) • CTR ${decimal(row.ctr)}%</p><div class="creative-meta"><div><span>Resultados${periodExact()?'':' est.'}</span><strong>${integer(row.results*periodScale())}</strong></div><div><span>Custo/resultado</span><strong>${row.cpa?money(row.cpa):'—'}</strong></div><div><span>Gasto${periodExact()?'':' est.'}</span><strong>${money(row.spend*periodScale())}</strong></div></div></div>
  </article>`).join('') : '<p class="text-slate-300">Não há anúncios detalhados para este objetivo na exportação.</p>';
  set('#creative-period-note',periodExact() ? 'Resultados observados na exportação agregada de 01/09 a 08/11/2026.' : 'Estimativas lineares. A ordem dos criativos usa o período completo; os CSVs não permitem confirmar vencedores reais nesta janela.');
}

function renderCharts(rows) {
  if (!window.Chart) return;
  const ranked = [...rows].filter(row=>row.spend>0).sort((a,b)=>b.spend-a.spend);
  const spendData = {labels:ranked.map(row=>row.name.length>34?row.name.slice(0,32)+'…':row.name),datasets:[{label:'Investimento',data:ranked.map(row=>row.spend*periodScale()),backgroundColor:'#5a72f0',borderRadius:6}]};
  if (!spendChart) spendChart = new Chart(document.getElementById('trend-chart'),{type:'bar',data:spendData,options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:context=>' '+money(context.raw)}}},scales:{x:{grid:{color:'rgba(170,190,255,.1)'},ticks:{color:'#afbee3',callback:value=>'R$ '+integer(value)}},y:{grid:{display:false},ticks:{color:'#d7e2ff',font:{size:10}}}}}});
  else {spendChart.data=spendData;spendChart.update();}
  const objectiveKeys = ['lead','contact','traffic','unattributed'];
  const objectiveValues = objectiveKeys.map(key=>sum(rows.filter(row=>row.objective===key),'spend')*periodScale());
  const mixData = {labels:objectiveKeys.map(key=>labels[key]),datasets:[{data:objectiveValues,backgroundColor:objectiveKeys.map(key=>colors[key]),borderWidth:0}]};
  if (!mixChart) mixChart = new Chart(document.getElementById('channel-chart'),{type:'doughnut',data:mixData,options:{responsive:true,maintainAspectRatio:false,cutout:'78%',plugins:{legend:{display:false},tooltip:{callbacks:{label:context=>` ${context.label}: ${money(context.raw)}`}}}}});
  else {mixChart.data=mixData;mixChart.update();}
  set('#mix-center',String(rows.length));
  document.getElementById('objective-mix').innerHTML = objectiveKeys.filter((key,index)=>objectiveValues[index]>0).map(key=>{const value=sum(rows.filter(row=>row.objective===key),'spend')*periodScale();return `<div><span><i style="background:${colors[key]}"></i>${labels[key]}</span><strong>${money(value)}</strong></div>`;}).join('') || '<div><span>Sem investimento no recorte</span></div>';
}

function renderInsights() {
  const topAdset = [...ADSETS].filter(row=>row.objective==='lead').sort((a,b)=>(b.results||0)-(a.results||0))[0];
  const topCreative = [...CREATIVES].filter(row=>row.objective==='lead').sort((a,b)=>b.results-a.results)[0];
  const quiz = CAMPAIGNS.find(row=>/quiz/i.test(row.name));
  if (topAdset) {set('#top-adset-name',topAdset.name);set('#top-adset-detail',`${integer(topAdset.results)} leads • ${money(topAdset.spend/topAdset.results)} por lead`);}
  if (topCreative) {set('#top-creative-name',topCreative.name);set('#top-creative-detail',`${integer(topCreative.results)} leads • ${money(topCreative.cpa)} por lead`);}
  if (quiz) set('#quiz-detail',`${money(quiz.spend)} gastos • conferir pixel e jornada`);
}

function update() {const rows=campaignRows();renderKPIs(rows);renderCampaigns(rows);renderAdsets();renderCreatives();renderCharts(rows);}

function initControls() {
  const campaign=document.getElementById('campaign-filter'),objective=document.getElementById('objective-filter'),status=document.getElementById('status-filter');
  CAMPAIGNS.forEach(row=>{const option=document.createElement('option');option.value=row.id;option.textContent=row.name;campaign.appendChild(option);});
  [campaign,objective,status].forEach(select=>select.addEventListener('change',()=>{filters={campaign:campaign.value,objective:objective.value,status:status.value};update();}));
  document.getElementById('clear-filters').addEventListener('click',()=>{campaign.value=objective.value=status.value='all';filters={campaign:'all',objective:'all',status:'all'};document.querySelector('[data-period="all"]').click();});
  document.querySelectorAll('[data-sort]').forEach(button=>button.addEventListener('click',()=>{sorting={key:button.dataset.sort,direction:sorting.key===button.dataset.sort&&sorting.direction==='desc'?'asc':'desc'};renderCampaigns(campaignRows());}));
  document.querySelectorAll('.rank-btn').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('.rank-btn').forEach(item=>item.classList.remove('active'));button.classList.add('active');creativeSort=button.dataset.rank==='cpa'?'cpa':'results';renderCreatives();}));
  const menu=document.getElementById('mobile-menu'),menuButton=document.getElementById('mobile-menu-button');
  menuButton.addEventListener('click',()=>{const open=!menu.classList.toggle('hidden');menuButton.setAttribute('aria-expanded',String(open));});
  const method=document.getElementById('method-note'),methodButton=document.getElementById('method-button');
  methodButton.addEventListener('click',()=>{const open=!method.classList.toggle('hidden');methodButton.setAttribute('aria-expanded',String(open));});
  document.querySelectorAll('.audience-btn').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('.audience-btn').forEach(item=>item.classList.remove('active'));button.classList.add('active');document.querySelectorAll('.audience-card').forEach(card=>card.classList.toggle('is-hidden',button.dataset.audience!=='all'&&card.dataset.type!==button.dataset.audience));}));
  document.querySelectorAll('.idea-filter-btn').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('.idea-filter-btn').forEach(item=>item.classList.remove('active'));button.classList.add('active');document.querySelectorAll('.idea-card').forEach(card=>card.classList.toggle('is-hidden',button.dataset.ideaFilter!=='all'&&card.dataset.ideaType!==button.dataset.ideaFilter));}));
}

function initForecast() {
  const inputs=['budget-input','target-cpa-input','close-rate-input','ticket-input'].map(id=>document.getElementById(id));
  const scenarios={conservative:[8000,2.8,2,297],base:[12000,Number(REPORT.cpa.toFixed(2)),3,297],aggressive:[20000,1.8,4,297]};
  const render=()=>{const [budget,cpa,rate,ticket]=inputs.map(input=>Math.max(0,Number(input.value)||0));const leads=cpa?budget/cpa:0,sales=leads*rate/100,revenue=sales*ticket;set('#forecast-leads',integer(leads));set('#forecast-sales',integer(sales));set('#forecast-revenue',money(revenue));set('#forecast-roas',decimal(budget?revenue/budget:0)+'×');set('#forecast-narrative',`Cenário hipotético: ${money(budget)} em mídia a ${money(cpa)} por lead produziria ${integer(leads)} leads. Com ${decimal(rate)}% de fechamento e ticket de ${money(ticket)}, a receita projetada seria ${money(revenue)}.`);};
  inputs.forEach(input=>input.addEventListener('input',render));
  document.querySelectorAll('.scenario-button').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('.scenario-button').forEach(item=>item.classList.remove('active'));button.classList.add('active');scenarios[button.dataset.scenario].forEach((value,index)=>{inputs[index].value=value;});render();}));
  set('#cpa-benchmark','CPA histórico de lead do pixel: '+money(REPORT.cpa));render();
}

function initPeriods() {
  document.querySelector('.period-control').innerHTML = `<div class="period-tabs" role="group" aria-label="Períodos rápidos">
    <button class="period-btn" data-period="7">7 dias</button>
    <button class="period-btn" data-period="30">30 dias</button>
    <button class="period-btn" data-period="60">60 dias</button>
    <button class="period-btn active" data-period="all">Período total</button>
    <button class="period-btn" data-period="custom">Personalizado</button></div>
    <p class="date-selector-label">Recortes menores são estimativas lineares: os CSVs não trazem dados diários</p>
    <div id="custom-period" class="date-selector-row grid grid-cols-[1fr_1fr_auto] gap-2 pt-2">
      <label class="date-field"><span>De</span><input id="date-start" type="date" min="2026-09-01" max="2026-11-08" value="2026-09-01"></label>
      <label class="date-field"><span>Até</span><input id="date-end" type="date" min="2026-09-01" max="2026-11-08" value="2026-11-08"></label>
      <button id="apply-custom" class="apply-button">Aplicar</button></div>
    <p id="period-caption" class="mt-2 text-right text-[10px] text-slate-500"></p>`;
  const apply=(start,end)=>{
    if(!start||!end||start<REPORT.start||end>REPORT.end||start>end){set('#period-caption','Selecione um intervalo válido dentro do relatório.');return;}
    period={start,end};
    document.getElementById('date-start').value=start;
    document.getElementById('date-end').value=end;
    update();
  };
  document.querySelectorAll('.period-btn').forEach(button=>button.addEventListener('click',()=>{
    document.querySelectorAll('.period-btn').forEach(item=>item.classList.remove('active'));button.classList.add('active');
    if(button.dataset.period==='custom')return document.getElementById('date-start').focus();
    if(button.dataset.period==='all')return apply(REPORT.start,REPORT.end);
    const start=periodDate(REPORT.end);start.setDate(start.getDate()-Number(button.dataset.period)+1);
    apply(start.toISOString().slice(0,10),REPORT.end);
  }));
  document.getElementById('apply-custom').addEventListener('click',()=>{
    document.querySelectorAll('.period-btn').forEach(button=>button.classList.toggle('active',button.dataset.period==='custom'));
    apply(document.getElementById('date-start').value,document.getElementById('date-end').value);
  });
  const guide=document.querySelector('.reading-guide .estimated-dot + p');
  if(guide)guide.innerHTML='<strong>Estimado</strong>Recortes menores usam rateio linear dos totais agregados.';
  const note=document.getElementById('method-note');
  if(note)note.textContent='Investimento, cliques e impressões vêm do CSV de campanhas. Leads do pixel e contatos no site são ações diferentes. Recortes menores usam rateio linear e não comprovam desempenho real na janela. Não há receita, qualificação de leads ou ROAS realizado.';
}

document.addEventListener('DOMContentLoaded',()=>{
  set('#data-status span:last-child, #mobile-data-status span:last-child','Dados até 08 nov 2026');
  initPeriods();initControls();initForecast();renderInsights();update();
  if ('IntersectionObserver' in window) {const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.08});document.querySelectorAll('.reveal').forEach(element=>observer.observe(element));}
  else document.querySelectorAll('.reveal').forEach(element=>element.classList.add('is-visible'));
});
