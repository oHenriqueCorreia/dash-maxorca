/* Dashboard MaxOrça — dados consolidados das exportações Meta Ads. */

const REPORT = {
  start: '2026-08-01',
  end: '2026-11-04',
  days: 96,
  spend: 16290.12,
  leadSpend: 13852.22,
  clicks: 45928,
  impressions: 1704922,
  conversions: 5825,
  profileVisits: 7526,
  ctr: 2.6938475778,
  cpc: 0.3546882076,
  cpa: 2.3780635193
};

/* Campanhas agregadas exatamente como aparecem no CSV de campanhas. */
const CAMPAIGNS = [
  { id: 'es-leads-lp-0206', name: '[ES] - Leads p/LP - 02/06', status: 'inactive', objective: 'lead', results: 560, spend: 1263.77, impressions: 117917, clicks: 3590 },
  { id: 'es-leads-lp-2406', name: '[ES] Leads LP - 24/06', status: 'inactive', objective: 'lead', results: 468, spend: 2917.23, impressions: 201424, clicks: 3654 },
  { id: 'tf-ig', name: '01 - [TF] [IG]', status: 'inactive', objective: 'traffic', results: 7526, spend: 811.98, impressions: 94128, clicks: 6989 },
  { id: 'lead-brforms', name: '02 - [LEAD] [BRFORMS]', status: 'inactive', objective: 'lead', results: 693, spend: 1450.07, impressions: 132860, clicks: 3836 },
  { id: 'es-quiz-0109', name: '[ES] Leads Quiz - 01/09', status: 'inactive', objective: 'unattributed', results: 0, spend: 1625.92, impressions: 100453, clicks: 1697 },
  { id: 'maxorca-lp-abo', name: '[MaxOrça] - Lead - LP nova - ABO', status: 'active', objective: 'lead', results: 2818, spend: 4723.55, impressions: 609284, clicks: 14134 },
  { id: 'video-campeao-01', name: 'Camp Lead - LP - Video Campeao 01 - 13/10', status: 'inactive', objective: 'contact', results: 301, spend: 1294.22, impressions: 198349, clicks: 8027 },
  { id: 'video-campeao-02', name: 'Camp Lead - LP - Video Campeao 02 - 13/10', status: 'inactive', objective: 'contact', results: 567, spend: 1294.75, impressions: 141607, clicks: 2447 },
  { id: 'video-campeao-03', name: 'Camp Lead - LP - Video Campeao 03 - 13/10', status: 'inactive', objective: 'contact', results: 418, spend: 908.63, impressions: 108900, clicks: 1554 }
];

const CREATIVES = [
  { name: 'REVIEW — demonstração rápida e prova visual', leads: 515, spend: 771.85, cpa: 1.50, ctr: 1.83, format: 'Vídeo', label: 'PROVA VISUAL', accent: '#37d3ff', dark: '#132f46' },
  { name: 'RAFACAR PDF — urgência e transformação do papel', leads: 494, spend: 717.71, cpa: 1.45, ctr: 1.95, format: 'Reels', label: 'PAPEL → PDF', accent: '#9afc7c', dark: '#263b2c' },
  { name: 'RAFACAR PDF — variação para oficinas', leads: 347, spend: 562.39, cpa: 1.62, ctr: 1.75, format: 'Reels', label: 'VARIAÇÃO 02', accent: '#b69cff', dark: '#2d234b' },
  { name: 'TRINITY — oficina corrida e profissional solo', leads: 183, spend: 388.30, cpa: 2.12, ctr: 2.32, format: 'Vídeo', label: 'ROTINA REAL', accent: '#ff9b83', dark: '#472d2b' },
  { name: 'REVIEW — original de remarketing', leads: 156, spend: 218.96, cpa: 1.40, ctr: 2.07, format: 'Vídeo', label: 'REVIEW', accent: '#ffd166', dark: '#4c3b1f' },
  { name: 'MATHEUS — recomendação autêntica', leads: 144, spend: 226.02, cpa: 1.57, ctr: 5.15, format: 'Reels', label: 'DEPOIMENTO', accent: '#54e6c1', dark: '#173d38' }
];

const formatBRL = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 }).format(value);
const formatNumber = value => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value);
const formatDecimal = (value, digits = 2) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);

let activeDays = REPORT.days;
let activeFilters = { campaign: 'all', objective: 'all', status: 'all' };
let tableSort = { key: 'spend', direction: 'desc' };
let trendChart;
let channelChart;

const objectiveLabels = {
  lead: 'Geração de leads',
  contact: 'Contato no site',
  traffic: 'Visita ao perfil',
  unattributed: 'Sem atribuição'
};

function getFilteredCampaigns() {
  return CAMPAIGNS.filter(campaign => {
    const campaignMatch = activeFilters.campaign === 'all' || campaign.id === activeFilters.campaign;
    const objectiveMatch = activeFilters.objective === 'all' || campaign.objective === activeFilters.objective;
    const statusMatch = activeFilters.status === 'all' || campaign.status === activeFilters.status;
    return campaignMatch && objectiveMatch && statusMatch;
  });
}

function currentMetrics() {
  const scale = activeDays / REPORT.days;
  const campaigns = getFilteredCampaigns();
  const conversions = campaigns.filter(campaign => ['lead', 'contact'].includes(campaign.objective));
  const spend = campaigns.reduce((sum, campaign) => sum + campaign.spend, 0) * scale;
  const clicks = campaigns.reduce((sum, campaign) => sum + campaign.clicks, 0) * scale;
  const impressions = campaigns.reduce((sum, campaign) => sum + campaign.impressions, 0) * scale;
  const conversionCount = conversions.reduce((sum, campaign) => sum + campaign.results, 0) * scale;
  const conversionSpend = conversions.reduce((sum, campaign) => sum + campaign.spend, 0) * scale;
  return {
    spend,
    clicks: Math.round(clicks),
    impressions: Math.round(impressions),
    conversions: Math.round(conversionCount),
    conversionSpend,
    ctr: impressions ? clicks / impressions * 100 : 0,
    cpc: clicks ? spend / clicks : 0,
    cpa: conversionCount ? conversionSpend / conversionCount : 0,
    campaignCount: campaigns.length,
    exact: activeDays === REPORT.days
  };
}

function animateValue(element, target, formatter, duration = 700) {
  const start = performance.now();
  const from = Number(element.dataset.current || 0);
  const tick = now => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = from + (target - from) * eased;
    element.textContent = formatter(value);
    if (progress < 1) requestAnimationFrame(tick);
    else element.dataset.current = target;
  };
  requestAnimationFrame(tick);
}

function updateKPIs() {
  const metrics = currentMetrics();
  const values = {
    spend: [metrics.spend, value => formatBRL(value)],
    clicks: [metrics.clicks, value => formatNumber(value)],
    impressions: [metrics.impressions, value => formatNumber(value)],
    conversions: [metrics.conversions, value => formatNumber(value)],
    ctr: [metrics.ctr, value => `${formatDecimal(value)}%`],
    cpc: [metrics.cpc, value => formatBRL(value)],
    cpa: [metrics.cpa, value => metrics.conversions ? formatBRL(value) : '—']
  };
  Object.entries(values).forEach(([key, [value, formatter]]) => {
    document.querySelectorAll(`[data-kpi="${key}"]`).forEach(element => animateValue(element, value, formatter));
  });
  document.getElementById('campaign-count').textContent = `${metrics.campaignCount} ${metrics.campaignCount === 1 ? 'campanha' : 'campanhas'}`;
  document.getElementById('filter-result-count').textContent = `${metrics.campaignCount} ${metrics.campaignCount === 1 ? 'campanha' : 'campanhas'}`;
  document.getElementById('lead-spend').textContent = formatBRL(metrics.conversionSpend);
  document.getElementById('table-total-spend').textContent = formatBRL(metrics.spend);
}

function buildEstimatedSeries(days) {
  const metrics = currentMetrics();
  const points = Math.min(days, 30);
  const step = days / points;
  const labels = [];
  const spendWeights = [];
  const leadWeights = [];
  const startDate = new Date(`${REPORT.end}T12:00:00`);
  startDate.setDate(startDate.getDate() - days + 1);

  for (let index = 0; index < points; index += 1) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + Math.round(index * step));
    labels.push(new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(date));
    spendWeights.push(0.86 + Math.sin(index * 0.77) * 0.16 + (index / points) * 0.18);
    leadWeights.push(0.9 + Math.sin(index * 0.77 + 0.6) * 0.13 + (index / points) * 0.16);
  }
  const spendTotal = spendWeights.reduce((sum, value) => sum + value, 0);
  const leadTotal = leadWeights.reduce((sum, value) => sum + value, 0);
  return {
    labels,
    spend: spendWeights.map(value => value / spendTotal * metrics.spend),
    leads: leadWeights.map(value => value / leadTotal * metrics.conversions)
  };
}

function chartDefaults() {
  Chart.defaults.color = '#66768b';
  Chart.defaults.font.family = 'Manrope, Inter, sans-serif';
  Chart.defaults.font.size = 10;
}

function initCharts() {
  chartDefaults();
  const trendContext = document.getElementById('trend-chart').getContext('2d');
  const gradient = trendContext.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, 'rgba(55,211,255,.28)');
  gradient.addColorStop(1, 'rgba(55,211,255,0)');
  const series = buildEstimatedSeries(activeDays);

  trendChart = new Chart(trendContext, {
    type: 'line',
    data: {
      labels: series.labels,
      datasets: [
        { label: 'Investimento estimado', data: series.spend, yAxisID: 'y', borderColor: '#37d3ff', backgroundColor: gradient, fill: true, borderWidth: 2, tension: .42, pointRadius: 0, pointHoverRadius: 4 },
        { label: 'Conversões estimadas', data: series.leads, yAxisID: 'y1', borderColor: '#9afc7c', backgroundColor: 'transparent', borderWidth: 2, borderDash: [5, 5], tension: .42, pointRadius: 0, pointHoverRadius: 4 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
      animation: { duration: 1100, easing: 'easeOutQuart' },
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: '#0a1727', borderColor: 'rgba(255,255,255,.1)', borderWidth: 1, padding: 12, displayColors: true, callbacks: { label: context => context.datasetIndex === 0 ? ` Investimento: ${formatBRL(context.parsed.y)}` : ` Conversões: ${formatNumber(context.parsed.y)}` } }
      },
      scales: {
        x: { grid: { display: false }, ticks: { maxTicksLimit: 7, maxRotation: 0 } },
        y: { position: 'left', grid: { color: 'rgba(148,163,184,.08)' }, border: { display: false }, ticks: { callback: value => `R$ ${formatNumber(value)}` } },
        y1: { position: 'right', grid: { display: false }, border: { display: false }, ticks: { callback: value => formatNumber(value) } }
      }
    }
  });

  channelChart = new Chart(document.getElementById('channel-chart'), {
    type: 'doughnut',
    data: { labels: ['Meta Ads', 'Google Ads'], datasets: [{ data: [100, 0], backgroundColor: ['#37d3ff', '#1b2b3c'], borderWidth: 0, hoverOffset: 5 }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '78%', animation: { animateRotate: true, duration: 1200 }, plugins: { legend: { display: false }, tooltip: { callbacks: { label: context => context.dataIndex === 0 ? ' Meta Ads: 100%' : ' Google Ads: sem arquivo' } } } }
  });
}

function updateTrendChart() {
  const series = buildEstimatedSeries(activeDays);
  trendChart.data.labels = series.labels;
  trendChart.data.datasets[0].data = series.spend;
  trendChart.data.datasets[1].data = series.leads;
  trendChart.update();
}

function renderCampaignTable() {
  const scale = activeDays / REPORT.days;
  const campaigns = getFilteredCampaigns().map(campaign => {
    const spend = campaign.spend * scale;
    const results = campaign.results * scale;
    return {
      ...campaign,
      spend,
      results,
      ctr: campaign.impressions ? campaign.clicks / campaign.impressions * 100 : 0,
      cpa: campaign.results ? campaign.spend / campaign.results : null
    };
  });

  campaigns.sort((a, b) => {
    const left = a[tableSort.key];
    const right = b[tableSort.key];
    if (left === null && right === null) return 0;
    if (left === null) return 1;
    if (right === null) return -1;
    const comparison = typeof left === 'string' ? left.localeCompare(right, 'pt-BR') : left - right;
    return tableSort.direction === 'asc' ? comparison : -comparison;
  });

  const body = document.getElementById('campaign-table-body');
  const empty = document.getElementById('table-empty');
  empty.classList.toggle('hidden', campaigns.length > 0);
  body.innerHTML = campaigns.map(campaign => {
    const cpaClass = campaign.cpa === null ? '' : campaign.cpa <= REPORT.cpa ? 'cpa-good' : 'cpa-alert';
    return `<tr>
      <td>${campaign.name}</td>
      <td><span class="table-status ${campaign.status}">${campaign.status === 'active' ? 'Ativa' : 'Inativa'}</span></td>
      <td><span class="objective-chip">${objectiveLabels[campaign.objective]}</span></td>
      <td>${formatBRL(campaign.spend)}</td>
      <td>${campaign.objective === 'unattributed' ? '—' : formatNumber(campaign.results)}</td>
      <td class="${cpaClass}">${campaign.cpa === null ? '—' : formatBRL(campaign.cpa)}</td>
      <td>${formatDecimal(campaign.ctr)}%</td>
    </tr>`;
  }).join('');
}

function updateDashboard() {
  updateKPIs();
  renderCampaignTable();
  if (trendChart) updateTrendChart();
}

function renderCreatives(sortBy = 'leads') {
  const list = [...CREATIVES].sort((a, b) => sortBy === 'cpa' ? a.cpa - b.cpa : b.leads - a.leads).slice(0, 4);
  document.getElementById('creative-grid').innerHTML = list.map((creative, index) => `
    <article class="creative-card reveal is-visible" style="--delay:${index * 60}ms">
      <div class="creative-thumb" style="--accent:${creative.accent};--dark:${creative.dark}">
        <span class="creative-rank">#${index + 1}</span><span class="creative-format">${creative.format.toUpperCase()}</span>
        <span class="play-button" aria-hidden="true">▶</span><span class="thumb-label">${creative.label}</span>
      </div>
      <div class="creative-body">
        <h3>${creative.name}</h3>
        <div class="creative-meta">
          <div><span>Leads</span><strong>${formatNumber(creative.leads)}</strong></div>
          <div><span>CPA</span><strong>${formatBRL(creative.cpa)}</strong></div>
          <div><span>Gasto</span><strong>${formatBRL(creative.spend)}</strong></div>
        </div>
      </div>
    </article>`).join('');
}

function configurePeriodControls() {
  const caption = document.getElementById('period-caption');
  const chartLabel = document.getElementById('chart-period-label');
  const customPanel = document.getElementById('custom-period');
  const sourceBadge = document.getElementById('source-badge');

  function applyPeriod(days, label, exact = false) {
    activeDays = Math.max(1, Math.min(REPORT.days, days));
    caption.textContent = `${label} • ${exact ? 'dados observados' : 'estimativa proporcional'}`;
    chartLabel.textContent = label;
    sourceBadge.textContent = exact ? 'Fonte agregada • Meta Ads' : 'Estimativa • fonte agregada';
    updateDashboard();
  }

  function setDateInputs(start, end) {
    document.getElementById('date-start').value = start;
    document.getElementById('date-end').value = end;
  }

  document.querySelectorAll('.period-btn').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.period-btn').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    const period = button.dataset.period;
    customPanel.classList.remove('hidden');
    if (period === '7') { setDateInputs('2026-10-29', '2026-11-04'); applyPeriod(7, '29 out — 04 nov 2026'); }
    if (period === '30') { setDateInputs('2026-10-06', '2026-11-04'); applyPeriod(30, '06 out — 04 nov 2026'); }
    if (period === 'month') { setDateInputs('2026-11-01', '2026-11-04'); applyPeriod(4, '01 — 04 nov 2026'); }
    if (period === 'all') { setDateInputs('2026-08-01', '2026-11-04'); applyPeriod(REPORT.days, '01 ago — 04 nov 2026', true); }
    if (period === 'custom') document.getElementById('date-start').focus();
  }));

  document.getElementById('apply-custom').addEventListener('click', () => {
    const start = new Date(`${document.getElementById('date-start').value}T12:00:00`);
    const end = new Date(`${document.getElementById('date-end').value}T12:00:00`);
    if (end < start) return;
    const days = Math.round((end - start) / 86400000) + 1;
    const formatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    document.querySelectorAll('.period-btn').forEach(item => item.classList.toggle('active', item.dataset.period === 'custom'));
    applyPeriod(days, `${formatter.format(start)} — ${formatter.format(end)}`, days === REPORT.days);
  });
}

function configureCampaignFilters() {
  const campaignSelect = document.getElementById('campaign-filter');
  const objectiveSelect = document.getElementById('objective-filter');
  const statusSelect = document.getElementById('status-filter');

  CAMPAIGNS.forEach(campaign => {
    const option = document.createElement('option');
    option.value = campaign.id;
    option.textContent = campaign.name;
    campaignSelect.appendChild(option);
  });

  const applyFilters = () => {
    activeFilters = { campaign: campaignSelect.value, objective: objectiveSelect.value, status: statusSelect.value };
    updateDashboard();
  };

  [campaignSelect, objectiveSelect, statusSelect].forEach(select => select.addEventListener('change', applyFilters));

  document.getElementById('clear-filters').addEventListener('click', () => {
    campaignSelect.value = 'all';
    objectiveSelect.value = 'all';
    statusSelect.value = 'all';
    activeFilters = { campaign: 'all', objective: 'all', status: 'all' };
    document.querySelector('.period-btn[data-period="all"]').click();
  });

  document.querySelectorAll('[data-sort]').forEach(button => button.addEventListener('click', () => {
    const key = button.dataset.sort;
    if (tableSort.key === key) tableSort.direction = tableSort.direction === 'asc' ? 'desc' : 'asc';
    else tableSort = { key, direction: key === 'name' ? 'asc' : 'desc' };
    renderCampaignTable();
  }));
}

function configureInteractions() {
  const menuButton = document.getElementById('mobile-menu-button');
  const menu = document.getElementById('mobile-menu');
  menuButton.addEventListener('click', () => {
    const open = menu.classList.toggle('hidden') === false;
    menuButton.setAttribute('aria-expanded', String(open));
  });

  const methodButton = document.getElementById('method-button');
  const methodNote = document.getElementById('method-note');
  methodButton.addEventListener('click', () => {
    const open = methodNote.classList.toggle('hidden') === false;
    methodButton.setAttribute('aria-expanded', String(open));
  });

  document.querySelectorAll('.rank-btn').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.rank-btn').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    renderCreatives(button.dataset.rank);
  }));

  document.querySelectorAll('.audience-btn').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.audience-btn').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    document.querySelectorAll('.audience-card').forEach(card => card.classList.toggle('is-hidden', button.dataset.audience !== 'all' && card.dataset.type !== button.dataset.audience));
  }));

  document.querySelectorAll('.idea-filter-btn').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.idea-filter-btn').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    document.querySelectorAll('.idea-card').forEach(card => {
      const shouldHide = button.dataset.ideaFilter !== 'all' && card.dataset.ideaType !== button.dataset.ideaFilter;
      card.classList.toggle('is-hidden', shouldHide);
    });
  }));
}

function configureForecast() {
  const inputs = ['budget-input', 'target-cpa-input', 'close-rate-input', 'ticket-input'].map(id => document.getElementById(id));
  const scenarios = {
    conservative: [8000, 2.80, 2, 297],
    base: [12000, 2.00, 3, 297],
    aggressive: [20000, 1.80, 4, 297]
  };
  const update = () => {
    const [budget, cpa, closeRate, ticket] = inputs.map(input => Math.max(0, Number(input.value) || 0));
    const leads = cpa ? budget / cpa : 0;
    const sales = leads * closeRate / 100;
    const revenue = sales * ticket;
    const roas = budget ? revenue / budget : 0;
    document.getElementById('forecast-leads').textContent = formatNumber(leads);
    document.getElementById('forecast-sales').textContent = formatNumber(sales);
    document.getElementById('forecast-revenue').textContent = formatBRL(revenue);
    document.getElementById('forecast-roas').textContent = `${formatDecimal(roas)}×`;
    document.getElementById('forecast-narrative').innerHTML = `Com <strong>${formatBRL(budget)}</strong> de mídia e CPA de <strong>${formatBRL(cpa)}</strong>, este cenário projeta cerca de <strong>${formatNumber(leads)} leads</strong>. Se ${formatDecimal(closeRate, 1)}% virarem clientes, o faturamento potencial será de <strong>${formatBRL(revenue)}</strong>.`;
    const benchmark = document.getElementById('cpa-benchmark');
    benchmark.textContent = cpa <= REPORT.cpa ? `Meta ${formatBRL(REPORT.cpa - cpa)} melhor que o histórico de ${formatBRL(REPORT.cpa)}.` : `Meta ${formatBRL(cpa - REPORT.cpa)} acima do histórico de ${formatBRL(REPORT.cpa)}.`;
    benchmark.style.color = cpa <= REPORT.cpa ? '#2f8b69' : '#b06a5e';
  };
  inputs.forEach(input => input.addEventListener('input', update));

  document.querySelectorAll('.scenario-button').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.scenario-button').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    scenarios[button.dataset.scenario].forEach((value, index) => { inputs[index].value = value; });
    update();
  }));
  update();
}

function configureReveal() {
  document.querySelectorAll('[data-delay]').forEach(element => element.style.setProperty('--delay', `${element.dataset.delay}ms`));
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), { threshold: .08 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
}

document.addEventListener('DOMContentLoaded', () => {
  renderCreatives();
  initCharts();
  configurePeriodControls();
  configureCampaignFilters();
  updateDashboard();
  configureInteractions();
  configureForecast();
  configureReveal();
});
