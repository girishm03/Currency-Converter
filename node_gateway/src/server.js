const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:8000';

const DATA_DIR = path.join(__dirname, 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');
const FAVORITES_FILE = path.join(DATA_DIR, 'favorites.json');

// Ensure data directory and files exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(HISTORY_FILE)) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify([]));
}
if (!fs.existsSync(FAVORITES_FILE)) {
  fs.writeFileSync(FAVORITES_FILE, JSON.stringify([
    { from: "USD", to: "EUR" },
    { from: "GBP", to: "USD" },
    { from: "USD", to: "JPY" },
    { from: "USD", to: "INR" }
  ]));
}

function readJSONFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return [];
  }
}

function writeJSONFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

// Middleware
const PUBLIC_DIR = fs.existsSync(path.join(__dirname, '..', '..', 'public'))
  ? path.join(__dirname, '..', '..', 'public')
  : path.join(__dirname, '..', 'public');

app.use(cors());
app.use(express.json());
app.use(express.static(PUBLIC_DIR));

// Helper to call Python microservice
async function forwardToPython(endpoint, options = {}) {
  const url = `${PYTHON_SERVICE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  if (!response.ok) {
    const errorText = await response.text();
    let parsed;
    try { parsed = JSON.parse(errorText); } catch { parsed = { detail: errorText }; }
    const err = new Error(parsed.detail || `Python service returned status ${response.status}`);
    err.status = response.status;
    err.data = parsed;
    throw err;
  }

  return await response.json();
}

// Combined Health Check
app.get('/api/health', async (req, res) => {
  let pythonStatus = { status: 'offline', error: null };
  try {
    const pyHealth = await forwardToPython('/api/health');
    pythonStatus = { status: 'online', ...pyHealth };
  } catch (err) {
    pythonStatus = { status: 'offline', message: err.message };
  }

  res.json({
    status: 'healthy',
    gateway: {
      uptime_seconds: Math.floor(process.uptime()),
      node_version: process.version,
      timestamp: new Date().toISOString()
    },
    python_service: pythonStatus
  });
});

// Proxy: Currencies
app.get('/api/currencies', async (req, res) => {
  try {
    const data = await forwardToPython('/api/currencies');
    res.json(data);
  } catch (err) {
    res.status(err.status || 502).json({ error: 'Failed to retrieve currency list', details: err.message });
  }
});

// Proxy: Single Convert
app.post('/api/convert', async (req, res) => {
  try {
    const data = await forwardToPython('/api/convert', {
      method: 'POST',
      body: JSON.stringify(req.body)
    });

    // Optionally auto-record in conversion history
    if (req.body.record_history !== false) {
      const history = readJSONFile(HISTORY_FILE);
      const record = {
        id: 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        ...data,
        created_at: new Date().toISOString()
      };
      history.unshift(record);
      // Keep most recent 50 conversions
      writeJSONFile(HISTORY_FILE, history.slice(0, 50));
    }

    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ error: 'Conversion failed', details: err.message });
  }
});

// Proxy: Batch Convert
app.post('/api/batch-convert', async (req, res) => {
  try {
    const data = await forwardToPython('/api/batch-convert', {
      method: 'POST',
      body: JSON.stringify(req.body)
    });
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ error: 'Batch conversion failed', details: err.message });
  }
});

// Proxy: Historical Rates
app.get('/api/historical', async (req, res) => {
  try {
    const query = new URLSearchParams(req.query).toString();
    const data = await forwardToPython(`/api/historical?${query}`);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ error: 'Failed to fetch historical series', details: err.message });
  }
});

// Proxy: Currency Analytics
app.get('/api/analytics', async (req, res) => {
  try {
    const query = new URLSearchParams(req.query).toString();
    const data = await forwardToPython(`/api/analytics?${query}`);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ error: 'Failed to fetch currency analytics', details: err.message });
  }
});

// History Routes
app.get('/api/history', (req, res) => {
  const history = readJSONFile(HISTORY_FILE);
  res.json(history);
});

app.delete('/api/history', (req, res) => {
  writeJSONFile(HISTORY_FILE, []);
  res.json({ message: 'Conversion history cleared successfully' });
});

app.delete('/api/history/:id', (req, res) => {
  const history = readJSONFile(HISTORY_FILE);
  const filtered = history.filter(item => item.id !== req.params.id);
  writeJSONFile(HISTORY_FILE, filtered);
  res.json({ message: 'History item removed' });
});

// Favorites Routes
app.get('/api/favorites', (req, res) => {
  const favorites = readJSONFile(FAVORITES_FILE);
  res.json(favorites);
});

app.post('/api/favorites', (req, res) => {
  const { from, to } = req.body;
  if (!from || !to) {
    return res.status(400).json({ error: 'Both from and to currency codes are required' });
  }

  const favorites = readJSONFile(FAVORITES_FILE);
  const existsIndex = favorites.findIndex(f => f.from.toUpperCase() === from.toUpperCase() && f.to.toUpperCase() === to.toUpperCase());

  if (existsIndex >= 0) {
    // Already in favorites - toggle removal
    favorites.splice(existsIndex, 1);
    writeJSONFile(FAVORITES_FILE, favorites);
    return res.json({ action: 'removed', favorites });
  } else {
    // Add to favorites
    favorites.push({ from: from.toUpperCase(), to: to.toUpperCase() });
    writeJSONFile(FAVORITES_FILE, favorites);
    return res.json({ action: 'added', favorites });
  }
});

// Fallback to index.html for SPA behavior
app.get('*', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Start Express Gateway
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Currency Converter Gateway running on http://localhost:${PORT}`);
  console.log(`🔗 Python Microservice configured at ${PYTHON_SERVICE_URL}`);
  console.log(`=======================================================`);
});

module.exports = app;
