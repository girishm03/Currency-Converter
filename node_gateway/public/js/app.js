/**
 * CurrencyFlow Main Application Controller
 * High-performance fullstack controller with animations, fullscreen support, and mobile optimization
 */

// Application State
const state = {
  currencies: [],
  currenciesMap: {},
  fromCurrency: 'USD',
  toCurrency: 'EUR',
  amount: 1000,
  feePercent: 0.0,
  activeModalTarget: 'from', // 'from', 'to', or 'batchBase'
  favorites: [],
  history: [],
  chartTimeframe: '30d',
  chartInstance: null,
  batchBaseCurrency: 'USD',
  batchTargets: ['EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'CHF', 'CNY', 'SGD', 'AED'],
  lastTotalAmount: 0
};

// DOM Elements
const elements = {
  // Theme, Fullscreen & Status
  fullscreenToggleBtn: document.getElementById('fullscreenToggleBtn'),
  fsIconEnter: document.querySelector('.fs-icon-enter'),
  fsIconExit: document.querySelector('.fs-icon-exit'),
  themeToggleBtn: document.getElementById('themeToggleBtn'),
  pythonStatusChip: document.getElementById('pythonStatusChip'),
  pythonStatusText: document.getElementById('pythonStatusText'),
  nodeStatusChip: document.getElementById('nodeStatusChip'),
  nodeStatusText: document.getElementById('nodeStatusText'),
  quickFavoritesList: document.getElementById('quickFavoritesList'),

  // Tabs
  tabButtons: document.querySelectorAll('.tab-btn'),
  tabPanels: document.querySelectorAll('.tab-panel'),

  // Quick Convert Tab
  mainConverterCard: document.getElementById('mainConverterCard'),
  fromAmountInput: document.getElementById('fromAmountInput'),
  toAmountOutput: document.getElementById('toAmountOutput'),
  fromInputBox: document.getElementById('fromInputBox'),
  toOutputBox: document.getElementById('toOutputBox'),
  fromCurrencyBtn: document.getElementById('fromCurrencyBtn'),
  toCurrencyBtn: document.getElementById('toCurrencyBtn'),
  fromFlag: document.getElementById('fromFlag'),
  fromCode: document.getElementById('fromCode'),
  toFlag: document.getElementById('toFlag'),
  toCode: document.getElementById('toCode'),
  btnSwapCurrencies: document.getElementById('btnSwapCurrencies'),
  btnCopyResult: document.getElementById('btnCopyResult'),
  btnToggleFavorite: document.getElementById('btnToggleFavorite'),
  inverseRateText: document.getElementById('inverseRateText'),
  currentExchangeRateText: document.getElementById('currentExchangeRateText'),
  rateTimestampText: document.getElementById('rateTimestampText'),
  spinOnUpdate: document.querySelector('.spin-on-update'),
  feePills: document.querySelectorAll('.fee-pill'),
  customFeeInput: document.getElementById('customFeeInput'),
  feeBadgeText: document.getElementById('feeBadgeText'),
  grossConvertedText: document.getElementById('grossConvertedText'),
  deductedFeeText: document.getElementById('deductedFeeText'),
  netPayoutText: document.getElementById('netPayoutText'),
  quickChips: document.querySelectorAll('.quick-chips .chip'),

  // Side Overview Panel
  sideBaseCurrCode: document.getElementById('sideBaseCurrCode'),
  sideTickerList: document.getElementById('sideTickerList'),
  tiersGrid: document.getElementById('tiersGrid'),

  // Batch Matrix Tab
  batchAmountInput: document.getElementById('batchAmountInput'),
  batchBaseCurrencyBtn: document.getElementById('batchBaseCurrencyBtn'),
  batchBaseFlag: document.getElementById('batchBaseFlag'),
  batchBaseCode: document.getElementById('batchBaseCode'),
  btnRunBatchConvert: document.getElementById('btnRunBatchConvert'),
  btnSelectAllBatch: document.getElementById('btnSelectAllBatch'),
  btnResetBatch: document.getElementById('btnResetBatch'),
  batchCurrencyChipsGrid: document.getElementById('batchCurrencyChipsGrid'),
  batchTableBody: document.getElementById('batchTableBody'),

  // Historical Charts Tab
  timeframeButtons: document.querySelectorAll('.timeframe-btn'),
  chartFromFlag: document.getElementById('chartFromFlag'),
  chartToFlag: document.getElementById('chartToFlag'),
  chartPairTitle: document.getElementById('chartPairTitle'),
  chartTrendBadge: document.getElementById('chartTrendBadge'),
  chartTrendText: document.getElementById('chartTrendText'),
  statPeriodLow: document.getElementById('statPeriodLow'),
  statPeriodHigh: document.getElementById('statPeriodHigh'),
  statPeriodAvg: document.getElementById('statPeriodAvg'),
  statPeriodChange: document.getElementById('statPeriodChange'),

  // Market Analytics Tab
  btnRefreshAnalytics: document.getElementById('btnRefreshAnalytics'),
  analyticsSummaryText: document.getElementById('analyticsSummaryText'),
  analyticsVolTag: document.getElementById('analyticsVolTag'),
  analyticsVolScore: document.getElementById('analyticsVolScore'),
  volatilityGaugeFill: document.getElementById('volatilityGaugeFill'),
  analyticsTrajectoryNumber: document.getElementById('analyticsTrajectoryNumber'),
  analyticsBestDateText: document.getElementById('analyticsBestDateText'),

  // History Tab
  historyTableBody: document.getElementById('historyTableBody'),
  emptyHistoryPlaceholder: document.getElementById('emptyHistoryPlaceholder'),
  btnExportCSV: document.getElementById('btnExportCSV'),
  btnExportJSON: document.getElementById('btnExportJSON'),
  btnClearHistory: document.getElementById('btnClearHistory'),

  // Modal
  currencyModal: document.getElementById('currencyModal'),
  btnCloseModal: document.getElementById('btnCloseModal'),
  currencySearchInput: document.getElementById('currencySearchInput'),
  currencyListContainer: document.getElementById('currencyListContainer'),

  // Toast
  toastContainer: document.getElementById('toastContainer')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  initFullscreen();
  initTabs();
  initQuickConvertEvents();
  initBatchMatrixEvents();
  initHistoricalCharts();
  initAnalyticsEvents();
  initHistoryEvents();
  initModalEvents();

  // Load Initial Data
  await checkHealth();
  await loadCurrencies();
  await loadFavorites();
  await loadHistory();
  await runConversion();
});

// ================= Toast Notification with Progress Bar =================
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <div class="toast-progress"></div>
  `;
  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ================= Fullscreen Handling =================
function initFullscreen() {
  if (!elements.fullscreenToggleBtn) return;

  function isFullscreen() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement);
  }

  function updateFullscreenUI() {
    const fs = isFullscreen();
    if (fs) {
      document.body.classList.add('is-fullscreen');
      if (elements.fsIconEnter) elements.fsIconEnter.style.display = 'none';
      if (elements.fsIconExit) elements.fsIconExit.style.display = 'block';
    } else {
      document.body.classList.remove('is-fullscreen');
      if (elements.fsIconEnter) elements.fsIconEnter.style.display = 'block';
      if (elements.fsIconExit) elements.fsIconExit.style.display = 'none';
    }

    // Trigger canvas chart re-draw for accurate pixel bounds
    if (state.chartInstance && state.chartInstance.dataPoints.length > 0) {
      setTimeout(() => {
        state.chartInstance.render(state.chartInstance.dataPoints, state.chartInstance.stats);
      }, 100);
    }
  }

  elements.fullscreenToggleBtn.addEventListener('click', async () => {
    try {
      if (!isFullscreen()) {
        const root = document.documentElement;
        if (root.requestFullscreen) {
          await root.requestFullscreen();
        } else if (root.webkitRequestFullscreen) {
          await root.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  });

  document.addEventListener('fullscreenchange', updateFullscreenUI);
  document.addEventListener('webkitfullscreenchange', updateFullscreenUI);
}

// ================= Theme Handling =================
function initTheme() {
  const savedTheme = localStorage.getItem('currencyflow-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  elements.themeToggleBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const nextTheme = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('currencyflow-theme', nextTheme);

    // Re-draw chart on theme change for contrast colors
    if (state.chartInstance && state.chartInstance.dataPoints.length > 0) {
      state.chartInstance.render(state.chartInstance.dataPoints, state.chartInstance.stats);
    }
  });
}

// ================= Tab Navigation =================
function initTabs() {
  elements.tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');

      elements.tabButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      elements.tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const targetPanel = document.getElementById(tabId);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }

      // Trigger lazy loads for specific tabs
      if (tabId === 'chartsTab') {
        loadHistoricalChart();
      } else if (tabId === 'analyticsTab') {
        loadAnalytics();
      } else if (tabId === 'batchTab') {
        runBatchConvert();
      } else if (tabId === 'historyTab') {
        loadHistory();
      }
    });
  });
}

// ================= Health Checks =================
async function checkHealth() {
  try {
    const health = await API.getHealth();
    elements.nodeStatusChip.classList.remove('offline');
    elements.nodeStatusText.textContent = 'Online';

    if (health.python_service && health.python_service.status === 'healthy') {
      elements.pythonStatusChip.classList.remove('offline');
      elements.pythonStatusText.textContent = 'Operational';
    } else {
      elements.pythonStatusChip.classList.add('offline');
      elements.pythonStatusText.textContent = 'Offline';
    }
  } catch (err) {
    elements.pythonStatusChip.classList.add('offline');
    elements.pythonStatusText.textContent = 'Offline';
    elements.nodeStatusChip.classList.add('offline');
    elements.nodeStatusText.textContent = 'Error';
  }
}

// ================= Load Currencies =================
async function loadCurrencies() {
  try {
    const list = await API.getCurrencies();
    state.currencies = list;
    state.currenciesMap = {};
    list.forEach(c => {
      state.currenciesMap[c.code] = c;
    });

    updateSelectedCurrencyUI();
    renderBatchCurrencyChips();
  } catch (err) {
    showToast('Failed to load currency list: ' + err.message, 'error');
  }
}

function updateSelectedCurrencyUI() {
  const fromMeta = state.currenciesMap[state.fromCurrency] || { flag: '🌐', code: state.fromCurrency };
  const toMeta = state.currenciesMap[state.toCurrency] || { flag: '🌐', code: state.toCurrency };

  elements.fromFlag.textContent = fromMeta.flag;
  elements.fromCode.textContent = fromMeta.code;
  elements.toFlag.textContent = toMeta.flag;
  elements.toCode.textContent = toMeta.code;

  if (elements.sideBaseCurrCode) {
    elements.sideBaseCurrCode.textContent = fromMeta.code;
  }

  elements.chartFromFlag.textContent = fromMeta.flag;
  elements.chartToFlag.textContent = toMeta.flag;
  elements.chartPairTitle.textContent = `${fromMeta.code} to ${toMeta.code}`;

  elements.batchBaseFlag.textContent = fromMeta.flag;
  elements.batchBaseCode.textContent = fromMeta.code;

  updateFavoriteButtonState();
}

// ================= Number Rolling Animation =================
function animateCounter(element, startVal, endVal, duration = 300, symbol = '') {
  if (isNaN(startVal)) startVal = 0;
  if (isNaN(endVal)) endVal = 0;

  const startTime = performance.now();
  const diff = endVal - startVal;

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    // Smooth quadratic ease out
    const ease = 1 - (1 - progress) * (1 - progress);
    const current = startVal + diff * ease;

    element.value = `${symbol} ${current.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.value = `${symbol} ${endVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  }
  requestAnimationFrame(update);
}

// ================= Quick Convert Logic =================
let convertDebounceTimer = null;

function initQuickConvertEvents() {
  // Amount change with debounce
  elements.fromAmountInput.addEventListener('input', () => {
    state.amount = parseFloat(elements.fromAmountInput.value) || 0;
    clearTimeout(convertDebounceTimer);
    convertDebounceTimer = setTimeout(() => {
      runConversion();
    }, 250);
  });

  // Quick Amount Chips
  elements.quickChips.forEach(chip => {
    chip.addEventListener('click', () => {
      elements.quickChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const val = parseFloat(chip.getAttribute('data-amount'));
      elements.fromAmountInput.value = val;
      state.amount = val;
      runConversion();
    });
  });

  // Currency select triggers
  elements.fromCurrencyBtn.addEventListener('click', () => openCurrencyModal('from'));
  elements.toCurrencyBtn.addEventListener('click', () => openCurrencyModal('to'));

  // Swap currencies button with 3D animation
  elements.btnSwapCurrencies.addEventListener('click', () => {
    triggerCurrencySwap();
  });

  // Keyboard shortcut: Press 'S' to swap currencies when not typing in text field
  window.addEventListener('keydown', (e) => {
    if (e.key === 's' || e.key === 'S') {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) return;
      triggerCurrencySwap();
    }
  });

  // Copy converted amount
  elements.btnCopyResult.addEventListener('click', () => {
    const val = elements.toAmountOutput.value;
    if (!val) return;
    navigator.clipboard.writeText(val).then(() => {
      showToast(`Copied ${val} ${state.toCurrency} to clipboard!`);
    }).catch(() => {
      showToast('Clipboard access denied', 'error');
    });
  });

  // Toggle favorite pair
  elements.btnToggleFavorite.addEventListener('click', async () => {
    try {
      const res = await API.toggleFavorite(state.fromCurrency, state.toCurrency);
      state.favorites = res.favorites;
      renderFavoritesBar();
      updateFavoriteButtonState();
      showToast(res.action === 'added' ? 'Added pair to favorites!' : 'Removed pair from favorites');
    } catch (err) {
      showToast('Failed to toggle favorite: ' + err.message, 'error');
    }
  });

  // Fee pills selection
  elements.feePills.forEach(pill => {
    pill.addEventListener('click', () => {
      elements.feePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.feePercent = parseFloat(pill.getAttribute('data-fee'));
      elements.customFeeInput.value = state.feePercent.toFixed(1);
      updateFeeBadge();
      runConversion();
    });
  });

  // Custom fee input
  elements.customFeeInput.addEventListener('input', () => {
    elements.feePills.forEach(p => p.classList.remove('active'));
    state.feePercent = Math.max(0, Math.min(20, parseFloat(elements.customFeeInput.value) || 0));
    updateFeeBadge();
    runConversion();
  });
}

function triggerCurrencySwap() {
  elements.btnSwapCurrencies.classList.add('is-spinning');
  setTimeout(() => {
    elements.btnSwapCurrencies.classList.remove('is-spinning');
  }, 550);

  const temp = state.fromCurrency;
  state.fromCurrency = state.toCurrency;
  state.toCurrency = temp;
  updateSelectedCurrencyUI();
  runConversion();

  // Trigger chart and analytics refresh if currently visible
  const activeTab = document.querySelector('.tab-panel.active').id;
  if (activeTab === 'chartsTab') loadHistoricalChart();
  if (activeTab === 'analyticsTab') loadAnalytics();
}

function updateFeeBadge() {
  if (state.feePercent === 0) {
    elements.feeBadgeText.textContent = '0.0% (Interbank Rate)';
  } else {
    elements.feeBadgeText.textContent = `${state.feePercent.toFixed(1)}% Fee Applied`;
  }
}

async function runConversion() {
  if (!state.fromCurrency || !state.toCurrency || state.amount <= 0) return;

  try {
    const data = await API.convert(state.fromCurrency, state.toCurrency, state.amount, state.feePercent);
    const toMeta = state.currenciesMap[state.toCurrency] || { symbol: '' };

    // Smooth number animation
    animateCounter(elements.toAmountOutput, state.lastTotalAmount, data.total_amount, 320, toMeta.symbol);
    state.lastTotalAmount = data.total_amount;

    // Luminous pulse feedback on the output field
    if (elements.toOutputBox) {
      elements.toOutputBox.classList.remove('highlight-flash');
      void elements.toOutputBox.offsetWidth; // trigger reflow
      elements.toOutputBox.classList.add('highlight-flash');
    }

    // Spin animation on update icon
    if (elements.spinOnUpdate) {
      elements.spinOnUpdate.classList.remove('spinning');
      void elements.spinOnUpdate.offsetWidth;
      elements.spinOnUpdate.classList.add('spinning');
    }

    elements.inverseRateText.textContent = `1 ${state.toCurrency} = ${data.inverse_rate} ${state.fromCurrency}`;
    elements.currentExchangeRateText.textContent = `1 ${state.fromCurrency} = ${data.exchange_rate} ${state.toCurrency}`;

    const date = new Date(data.timestamp);
    elements.rateTimestampText.textContent = `Updated ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    // Breakdown details
    elements.grossConvertedText.textContent = `${toMeta.symbol} ${data.converted_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    elements.deductedFeeText.textContent = `${toMeta.symbol} ${data.fee_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    elements.netPayoutText.textContent = `${toMeta.symbol} ${data.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Populate side overview panel
    updateSideOverview(data.exchange_rate);

  } catch (err) {
    elements.toAmountOutput.value = 'Error';
    showToast('Conversion failed: ' + err.message, 'error');
  }
}

// ================= Widescreen Side Overview Populator =================
async function updateSideOverview(currentRate) {
  if (!elements.sideTickerList || !elements.tiersGrid) return;

  const toMeta = state.currenciesMap[state.toCurrency] || { symbol: '' };

  // 1. Common conversion tiers ($1, $10, $50, $100, $500, $1000)
  const tiers = [1, 10, 50, 100, 500, 1000];
  elements.tiersGrid.innerHTML = '';
  tiers.forEach(val => {
    const converted = val * currentRate;
    const div = document.createElement('div');
    div.className = 'tier-item';
    div.title = `Click to set amount to ${val}`;
    div.innerHTML = `
      <div class="tier-base">${val} ${state.fromCurrency}</div>
      <div class="tier-result">${toMeta.symbol}${converted.toFixed(converted >= 100 ? 1 : 2)}</div>
    `;
    div.addEventListener('click', () => {
      elements.fromAmountInput.value = val;
      state.amount = val;
      runConversion();
    });
    elements.tiersGrid.appendChild(div);
  });

  // 2. Top currencies ticker list against fromCurrency
  const topList = ['EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'CHF', 'SGD'].filter(c => c !== state.fromCurrency).slice(0, 5);
  elements.sideTickerList.innerHTML = '';

  topList.forEach(code => {
    const meta = state.currenciesMap[code] || { flag: '🌐', name: code };
    const row = document.createElement('div');
    row.className = 'side-ticker-row';
    row.innerHTML = `
      <div class="side-ticker-left">
        <span>${meta.flag}</span>
        <span>${code}</span>
      </div>
      <div class="side-ticker-rate" id="tickerRate_${code}">Calculating...</div>
    `;
    row.addEventListener('click', () => {
      state.toCurrency = code;
      updateSelectedCurrencyUI();
      renderFavoritesBar();
      runConversion();
    });
    elements.sideTickerList.appendChild(row);
  });

  // Fetch cross-rates for ticker
  try {
    const batch = await API.batchConvert(state.fromCurrency, topList, 1, 0);
    const results = batch.results || {};
    topList.forEach(code => {
      const el = document.getElementById(`tickerRate_${code}`);
      if (el && results[code]) {
        el.textContent = results[code].rate.toFixed(4);
      }
    });
  } catch {}
}

// ================= Favorites System =================
async function loadFavorites() {
  try {
    const favs = await API.getFavorites();
    state.favorites = favs;
    renderFavoritesBar();
    updateFavoriteButtonState();
  } catch (err) {
    console.error('Failed to load favorites', err);
  }
}

function renderFavoritesBar() {
  elements.quickFavoritesList.innerHTML = '';
  if (!state.favorites || state.favorites.length === 0) {
    elements.quickFavoritesList.innerHTML = '<span style="font-size: 0.78rem; color: var(--text-muted);">No favorites yet</span>';
    return;
  }

  state.favorites.forEach(pair => {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = `fav-pill ${pair.from === state.fromCurrency && pair.to === state.toCurrency ? 'active' : ''}`;
    pill.innerHTML = `<span>${pair.from} &rarr; ${pair.to}</span>`;
    pill.addEventListener('click', () => {
      state.fromCurrency = pair.from;
      state.toCurrency = pair.to;
      updateSelectedCurrencyUI();
      renderFavoritesBar();
      runConversion();

      const activeTab = document.querySelector('.tab-panel.active').id;
      if (activeTab === 'chartsTab') loadHistoricalChart();
      if (activeTab === 'analyticsTab') loadAnalytics();
    });
    elements.quickFavoritesList.appendChild(pill);
  });
}

function updateFavoriteButtonState() {
  const isFav = state.favorites.some(f => f.from === state.fromCurrency && f.to === state.toCurrency);
  if (isFav) {
    elements.btnToggleFavorite.classList.add('is-favorite');
  } else {
    elements.btnToggleFavorite.classList.remove('is-favorite');
  }
}

// ================= Batch Matrix Logic =================
function initBatchMatrixEvents() {
  elements.batchBaseCurrencyBtn.addEventListener('click', () => openCurrencyModal('batchBase'));

  elements.batchAmountInput.addEventListener('input', () => {
    clearTimeout(convertDebounceTimer);
    convertDebounceTimer = setTimeout(() => {
      runBatchConvert();
    }, 300);
  });

  elements.btnRunBatchConvert.addEventListener('click', () => runBatchConvert());

  elements.btnSelectAllBatch.addEventListener('click', () => {
    state.batchTargets = state.currencies.map(c => c.code).filter(c => c !== state.batchBaseCurrency);
    renderBatchCurrencyChips();
    runBatchConvert();
  });

  elements.btnResetBatch.addEventListener('click', () => {
    state.batchTargets = ['EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'CHF', 'CNY', 'SGD', 'AED'];
    renderBatchCurrencyChips();
    runBatchConvert();
  });
}

function renderBatchCurrencyChips() {
  elements.batchCurrencyChipsGrid.innerHTML = '';
  state.currencies.forEach(c => {
    if (c.code === state.batchBaseCurrency) return;
    const isSelected = state.batchTargets.includes(c.code);
    const chip = document.createElement('div');
    chip.className = `batch-chip-check ${isSelected ? 'selected' : ''}`;
    chip.innerHTML = `<span>${c.flag}</span> <span>${c.code}</span>`;
    chip.addEventListener('click', () => {
      if (state.batchTargets.includes(c.code)) {
        state.batchTargets = state.batchTargets.filter(item => item !== c.code);
      } else {
        state.batchTargets.push(c.code);
      }
      renderBatchCurrencyChips();
      runBatchConvert();
    });
    elements.batchCurrencyChipsGrid.appendChild(chip);
  });
}

async function runBatchConvert() {
  const amt = parseFloat(elements.batchAmountInput.value) || 1000;
  if (!state.batchTargets || state.batchTargets.length === 0) {
    elements.batchTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Please select at least one target currency.</td></tr>';
    return;
  }

  try {
    const data = await API.batchConvert(state.batchBaseCurrency, state.batchTargets, amt, state.feePercent);

    elements.batchTableBody.innerHTML = '';
    const results = data.results || {};

    Object.keys(results).forEach(code => {
      const item = results[code];
      const meta = state.currenciesMap[code] || { name: code, flag: '🌐', symbol: '' };
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>
          <div class="table-currency-cell">
            <span class="flag-icon">${meta.flag}</span>
            <span>${meta.name}</span>
          </div>
        </td>
        <td><strong>${code}</strong> (${meta.symbol})</td>
        <td class="table-rate-mono">1 ${state.batchBaseCurrency} = ${item.rate.toFixed(4)}</td>
        <td class="table-output-highlight">${meta.symbol} ${item.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td style="font-family: var(--font-mono); color: var(--text-secondary);">${((item.total_amount / (amt * item.rate)) * 100).toFixed(1)}%</td>
        <td>
          <button type="button" class="btn-secondary" style="padding: 4px 10px; font-size: 0.72rem;" onclick="switchToPair('${state.batchBaseCurrency}', '${code}')">
            Convert
          </button>
        </td>
      `;
      elements.batchTableBody.appendChild(tr);
    });

  } catch (err) {
    showToast('Batch conversion failed: ' + err.message, 'error');
  }
}

// Global switch to pair from batch row
window.switchToPair = function(from, to) {
  state.fromCurrency = from;
  state.toCurrency = to;
  updateSelectedCurrencyUI();
  document.getElementById('tabQuickBtn').click();
  runConversion();
};

// ================= Historical Charts =================
function initHistoricalCharts() {
  state.chartInstance = new HistoricalChart('historicalChartCanvas', 'chartTooltip');

  elements.timeframeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.timeframeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.chartTimeframe = btn.getAttribute('data-timeframe');
      loadHistoricalChart();
    });
  });
}

async function loadHistoricalChart() {
  updateSelectedCurrencyUI();
  try {
    const data = await API.getHistorical(state.fromCurrency, state.toCurrency, state.chartTimeframe);

    const stats = data.stats;
    elements.statPeriodLow.textContent = stats.min_rate.toFixed(4);
    elements.statPeriodHigh.textContent = stats.max_rate.toFixed(4);
    elements.statPeriodAvg.textContent = stats.avg_rate.toFixed(4);

    const isBullish = stats.change_percent >= 0;
    elements.statPeriodChange.textContent = `${isBullish ? '+' : ''}${stats.change_percent.toFixed(2)}%`;
    elements.statPeriodChange.className = `stat-value ${isBullish ? 'text-green' : 'text-red'}`;

    elements.chartTrendBadge.className = `chart-trend-tag ${isBullish ? 'bullish' : 'bearish'}`;
    elements.chartTrendText.textContent = `${isBullish ? '▲ +' : '▼ '}${stats.change_percent.toFixed(2)}% (${stats.trend.toUpperCase()})`;

    state.chartInstance.render(data.data_points, stats);
  } catch (err) {
    showToast('Failed to load chart data: ' + err.message, 'error');
  }
}

// ================= Market Analytics Tab =================
function initAnalyticsEvents() {
  elements.btnRefreshAnalytics.addEventListener('click', () => loadAnalytics());
}

async function loadAnalytics() {
  try {
    const data = await API.getAnalytics(state.fromCurrency, state.toCurrency);

    elements.analyticsSummaryText.textContent = data.summary;
    elements.analyticsVolScore.textContent = `${data.volatility_score.toFixed(1)}%`;
    elements.analyticsVolTag.textContent = data.volatility_rating;

    // Gauge width calculation (clamped 0 to 100%)
    const gaugeWidth = Math.min(100, Math.max(10, data.volatility_score * 4.5));
    elements.volatilityGaugeFill.style.width = `${gaugeWidth}%`;

    const traj = data.percentage_change_30d;
    const isUp = traj >= 0;
    elements.analyticsTrajectoryNumber.textContent = `${isUp ? '+' : ''}${traj.toFixed(2)}%`;
    elements.analyticsTrajectoryNumber.style.color = isUp ? 'var(--accent-success)' : 'var(--accent-danger)';

    if (data.best_rate_date) {
      elements.analyticsBestDateText.textContent = `Peak conversion rate occurred on: ${data.best_rate_date}`;
    } else {
      elements.analyticsBestDateText.textContent = 'High rate stability across the cycle';
    }

  } catch (err) {
    showToast('Failed to fetch analytics: ' + err.message, 'error');
  }
}

// ================= History & Export =================
function initHistoryEvents() {
  elements.btnClearHistory.addEventListener('click', async () => {
    if (confirm('Are you sure you want to clear all conversion history?')) {
      try {
        await API.clearHistory();
        await loadHistory();
        showToast('History cleared');
      } catch (err) {
        showToast('Failed to clear history: ' + err.message, 'error');
      }
    }
  });

  elements.btnExportCSV.addEventListener('click', () => exportHistoryCSV());
  elements.btnExportJSON.addEventListener('click', () => exportHistoryJSON());
}

async function loadHistory() {
  try {
    const history = await API.getHistory();
    state.history = history;
    renderHistoryTable();
  } catch (err) {
    console.error('Failed to load history', err);
  }
}

function renderHistoryTable() {
  elements.historyTableBody.innerHTML = '';
  if (!state.history || state.history.length === 0) {
    elements.emptyHistoryPlaceholder.style.display = 'flex';
    return;
  }
  elements.emptyHistoryPlaceholder.style.display = 'none';

  state.history.forEach(item => {
    const tr = document.createElement('tr');
    const d = new Date(item.created_at || item.timestamp);
    const dateFormatted = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    tr.innerHTML = `
      <td>${dateFormatted}</td>
      <td><strong>${item.from_currency} &rarr; ${item.to_currency}</strong></td>
      <td style="font-family: var(--font-mono);">${item.original_amount.toLocaleString()} ${item.from_currency}</td>
      <td style="font-family: var(--font-mono);">${item.exchange_rate.toFixed(4)}</td>
      <td class="table-output-highlight">${item.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${item.to_currency}</td>
      <td>${item.fee_percent > 0 ? `${item.fee_percent}% (${item.fee_amount})` : '0%'}</td>
      <td>
        <button type="button" class="btn-secondary" style="padding: 3px 8px; font-size: 0.72rem;" onclick="reapplyHistory('${item.from_currency}', '${item.to_currency}', ${item.original_amount})">
          Reapply
        </button>
      </td>
    `;
    elements.historyTableBody.appendChild(tr);
  });
}

window.reapplyHistory = function(from, to, amount) {
  state.fromCurrency = from;
  state.toCurrency = to;
  state.amount = amount;
  elements.fromAmountInput.value = amount;
  updateSelectedCurrencyUI();
  document.getElementById('tabQuickBtn').click();
  runConversion();
};

function exportHistoryCSV() {
  if (!state.history || state.history.length === 0) {
    showToast('No history records to export', 'error');
    return;
  }

  const headers = ['Timestamp', 'From Currency', 'To Currency', 'Original Amount', 'Exchange Rate', 'Net Amount', 'Fee Percent'];
  const rows = state.history.map(h => [
    h.created_at || h.timestamp,
    h.from_currency,
    h.to_currency,
    h.original_amount,
    h.exchange_rate,
    h.total_amount,
    h.fee_percent
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `currency_conversion_history_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  showToast('Exported conversion history to CSV');
}

function exportHistoryJSON() {
  if (!state.history || state.history.length === 0) {
    showToast('No history records to export', 'error');
    return;
  }

  const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state.history, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', jsonStr);
  link.setAttribute('download', `currency_conversion_history_${Date.now()}.json`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  showToast('Exported conversion history to JSON');
}

// ================= Modal Dialog System =================
function initModalEvents() {
  elements.btnCloseModal.addEventListener('click', () => elements.currencyModal.close());

  elements.currencyModal.addEventListener('click', (e) => {
    if (e.target === elements.currencyModal) {
      elements.currencyModal.close();
    }
  });

  elements.currencySearchInput.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    renderCurrencyModalList(q);
  });
}

function openCurrencyModal(targetType) {
  state.activeModalTarget = targetType;
  elements.currencySearchInput.value = '';
  renderCurrencyModalList('');
  elements.currencyModal.showModal();
  elements.currencySearchInput.focus();
}

function renderCurrencyModalList(filterQuery = '') {
  elements.currencyListContainer.innerHTML = '';

  const filtered = state.currencies.filter(c => {
    if (!filterQuery) return true;
    return c.code.toLowerCase().includes(filterQuery) ||
           c.name.toLowerCase().includes(filterQuery) ||
           c.country.toLowerCase().includes(filterQuery);
  });

  if (filtered.length === 0) {
    elements.currencyListContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-muted);">No matching currencies found.</div>';
    return;
  }

  filtered.forEach(c => {
    const isSelected = (state.activeModalTarget === 'from' && state.fromCurrency === c.code) ||
                       (state.activeModalTarget === 'to' && state.toCurrency === c.code) ||
                       (state.activeModalTarget === 'batchBase' && state.batchBaseCurrency === c.code);

    const div = document.createElement('div');
    div.className = `currency-option-item ${isSelected ? 'selected' : ''}`;
    div.innerHTML = `
      <div class="option-left">
        <span class="option-flag">${c.flag}</span>
        <div class="option-info">
          <span class="option-code">${c.code}</span>
          <span class="option-name">${c.name} &bull; ${c.country}</span>
        </div>
      </div>
      <span class="option-symbol">${c.symbol}</span>
    `;

    div.addEventListener('click', () => {
      if (state.activeModalTarget === 'from') {
        if (state.toCurrency === c.code) {
          state.toCurrency = state.fromCurrency;
        }
        state.fromCurrency = c.code;
        runConversion();
      } else if (state.activeModalTarget === 'to') {
        if (state.fromCurrency === c.code) {
          state.fromCurrency = state.toCurrency;
        }
        state.toCurrency = c.code;
        runConversion();
      } else if (state.activeModalTarget === 'batchBase') {
        state.batchBaseCurrency = c.code;
        renderBatchCurrencyChips();
        runBatchConvert();
      }

      updateSelectedCurrencyUI();
      renderFavoritesBar();
      elements.currencyModal.close();

      const activeTab = document.querySelector('.tab-panel.active').id;
      if (activeTab === 'chartsTab') loadHistoricalChart();
      if (activeTab === 'analyticsTab') loadAnalytics();
    });

    elements.currencyListContainer.appendChild(div);
  });
}
