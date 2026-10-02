/**
 * CurrencyFlow API Client
 * Interfaces with Node.js Express Gateway
 */
const API = {
  baseUrl: '/api',

  async request(endpoint, options = {}) {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });

    if (!res.ok) {
      let errMsg = `Request failed (${res.status})`;
      try {
        const errObj = await res.json();
        errMsg = errObj.error || errObj.details || errMsg;
      } catch {}
      throw new Error(errMsg);
    }

    return await res.json();
  },

  async getHealth() {
    return this.request('/health');
  },

  async getCurrencies() {
    return this.request('/currencies');
  },

  async convert(fromCurrency, toCurrency, amount, feePercent = 0.0, recordHistory = true) {
    return this.request('/convert', {
      method: 'POST',
      body: JSON.stringify({
        from_currency: fromCurrency,
        to_currency: toCurrency,
        amount: parseFloat(amount),
        fee_percent: parseFloat(feePercent),
        record_history: recordHistory
      })
    });
  },

  async batchConvert(fromCurrency, toCurrencies, amount, feePercent = 0.0) {
    return this.request('/batch-convert', {
      method: 'POST',
      body: JSON.stringify({
        from_currency: fromCurrency,
        to_currencies: toCurrencies,
        amount: parseFloat(amount),
        fee_percent: parseFloat(feePercent)
      })
    });
  },

  async getHistorical(fromCurrency, toCurrency, timeframe = '30d') {
    return this.request(`/historical?from=${encodeURIComponent(fromCurrency)}&to=${encodeURIComponent(toCurrency)}&timeframe=${encodeURIComponent(timeframe)}`);
  },

  async getAnalytics(fromCurrency, toCurrency) {
    return this.request(`/analytics?from=${encodeURIComponent(fromCurrency)}&to=${encodeURIComponent(toCurrency)}`);
  },

  async getHistory() {
    return this.request('/history');
  },

  async clearHistory() {
    return this.request('/history', { method: 'DELETE' });
  },

  async deleteHistoryItem(id) {
    return this.request(`/history/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  async getFavorites() {
    return this.request('/favorites');
  },

  async toggleFavorite(fromCurrency, toCurrency) {
    return this.request('/favorites', {
      method: 'POST',
      body: JSON.stringify({ from: fromCurrency, to: toCurrency })
    });
  }
};
