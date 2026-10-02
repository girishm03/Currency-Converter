# CurrencyFlow 🌐💱
### Modern Fullstack Currency Converter & Financial Market Analytics Engine
*Powered by Python (FastAPI), Node.js (Express), and Vanilla Modern Web Technologies*

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fgirishm03%2FCurrency-Converter)
[![Python 3.12](https://img.shields.io/badge/Python-3.12-blue.svg?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Node.js 20](https://img.shields.io/badge/Node.js-v20+-339933.svg?logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Vercel Ready](https://img.shields.io/badge/Vercel-Deployable-black.svg?logo=vercel&logoColor=white)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📖 Overview

**CurrencyFlow** is an enterprise-grade, real-time currency conversion and financial analytics platform. Built with a modular microservices architecture, it pairs high-speed asynchronous **Python (FastAPI)** calculations with a responsive **Node.js (Express)** gateway and a modern, glassmorphic UI.

The platform is designed to run seamlessly in **two environments**:
1. **Cloud Serverless (Vercel)**: 1-click cloud deployment using Vercel Serverless Functions (`api/index.py`) and static edge delivery (`public/`).
2. **Local Fullstack (Desktop & Server)**: Concurrent local execution (`npm run dev` or [`run.bat`](file:///f:/Currency%20Converter/run.bat)) linking the Python FastAPI microservice on port `8000` with the Node.js API Gateway on port `3000`.

---

## 🏛️ System Architecture

```
                                  CLOUD (Vercel)
               ┌──────────────────────────────────────────────────┐
               │                  User Browser                    │
               │   (Responsive Glassmorphic Dark/Light Web UI)   │
               └─────────┬──────────────────────────────▲─────────┘
                         │                              │
         Static Assets   │                              │  /api/* (Rewrites)
         (HTML/CSS/JS)   ▼                              ▼
               ┌────────────────────┐         ┌───────────────────┐
               │    Vercel Edge     │         │ Vercel Serverless │
               │   Static CDN       │         │   (api/index.py)  │
               │    (/public)       │         │  (FastAPI Engine) │
               └────────────────────┘         └───────────────────┘

─────────────────────────────────────────────────────────────────────────────

                               LOCAL FULLSTACK
               ┌──────────────────────────────────────────────────┐
               │                  User Browser                    │
               │          http://localhost:3000 (UI)              │
               └──────────────────────▲───────────────────────────┘
                                      │ HTTP
                                      ▼
               ┌──────────────────────────────────────────────────┐
               │             Node.js Express Gateway              │
               │             (Port 3000 / node_gateway)           │
               │   - Serves Static Assets                         │
               │   - Persists History & Favorites to JSON         │
               │   - Aggregated Health Checks & Proxy             │
               └──────────────────────▲───────────────────────────┘
                                      │ JSON REST
                                      ▼
               ┌──────────────────────────────────────────────────┐
               │             Python FastAPI Engine                │
               │           (Port 8000 / python_service)           │
               │   - Real-time Cross-Currency Calculations        │
               │   - Live Exchange Rate API + Fallback Cache      │
               │   - Annualized Volatility Standard Deviation     │
               │   - Timeseries Historical Curve Generator        │
               └──────────────────────────────────────────────────┘
```

---

## ✨ Features & Capabilities

- ⚡ **Real-Time Cross-Currency Conversion**: Instant conversion across 30+ major world currencies with live market rates and resilient fallback caching.
- 🖥️ **Fullscreen Windows & Ultrawide Mode**: Fluid design with a 1-click Fullscreen toggle button (<kbd>F11</kbd> / UI trigger) and a dual-column desktop layout featuring a live ticker and quick conversion tiers.
- 📱 **Mobile-First Experience**: Fixed frosted-glass bottom navigation bar, touch-friendly tap targets, horizontal chip scrolling, and bottom-sheet currency selection modals.
- 🎬 **Micro-Animations & Visual Feedback**:
  - **Rolling Counter Animation**: Smoothly counts numbers from previous to new values.
  - **3D Spring Currency Swap**: 360° spring flip with luminous cyan glow.
  - **Luminous Recalculation Pulse**: Neon-emerald flash feedback on output updates.
  - **Animated Historical Canvas Chart**: Smooth bezier curves drawn via `requestAnimationFrame`.
  - **Toast Countdown Progress Bar**: Animated auto-dismiss visual timer.
- 🌐 **Multi-Currency Batch Matrix**: Simultaneously convert a single base amount into 10+ target currencies with customized target selection.
- 📈 **Historical Trends & Analytics**: Interactive canvas chart with 7D, 30D, 90D, and 1Y timeframes, displaying period Low, High, Average, and Net Movement.
- 🧠 **Market Volatility & Advisory Hub**: Computes annualized volatility (log return standard deviation), trend indicators (bullish/bearish), and conversion advice.
- 💸 **Fee & Commission Simulator**: Simulate interbank (0%), low-cost (0.5%), bank standard (1.5%), retail/airport (3%), or custom spreads with gross vs net breakdowns.
- 🕒 **Persistent History & Favorites**: Searchable conversion log with 1-click re-apply, CSV/JSON export, and favorite pair pills.

---

## 🚀 Quick Start Guide

### Option 1: 1-Click Deploy to Vercel (Recommended for Cloud)

Click the button below to deploy your own instance to Vercel for free:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fgirishm03%2FCurrency-Converter)

#### Manual Vercel Deployment via CLI:
```bash
npm install -g vercel
vercel
```

---

### Option 2: Run Locally (Windows / macOS / Linux)

#### Prerequisites
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org))
- **Python**: v3.10 or higher ([Download Python](https://python.org))
- **Git**

#### 1. Clone the Repository
```bash
git clone https://github.com/girishm03/Currency-Converter.git
cd Currency-Converter
```

#### 2. Install Dependencies
```bash
# Install Node dependencies
npm run install:all

# Set up Python virtual environment
python -m venv .venv

# Activate virtual environment:
# Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# Windows (CMD):
.\.venv\Scripts\activate.bat
# macOS / Linux:
source .venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

#### 3. Start the Application
- **Windows (1-Click)**: Double-click [`run.bat`](file:///f:/Currency%20Converter/run.bat)
- **Terminal (All Platforms)**:
```bash
npm run dev
```

Both services will start concurrently:
- 🌐 **Web Interface & Gateway**: [http://localhost:3000](http://localhost:3000)
- ⚙️ **Python FastAPI Engine**: [http://127.0.0.1:8000](http://127.0.0.1:8000) (Interactive Swagger Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs))

---

## 🧪 Testing

Execute the automated test suites for both Python and Node.js:

```bash
# Run both test suites
npm test

# Or individually:
npm run test:python
npm run test:node
```

---

## 📁 Repository Structure

```
Currency-Converter/
├── api/
│   └── index.py             # Vercel serverless entrypoint for FastAPI
├── public/                  # Static web app assets (Vercel & Gateway)
│   ├── index.html           # Semantic accessible UI
│   ├── css/
│   │   └── style.css        # Glassmorphism, animations, responsive design
│   └── js/
│       ├── api.js           # API gateway client
│       ├── chart.js         # Canvas charting engine
│       └── app.js           # Main application state & controller
├── python_service/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI application & endpoints
│   │   ├── rates_service.py # Live rates, caching & historical models
│   │   ├── analytics.py     # Volatility & market advisory calculations
│   │   └── models.py        # Pydantic data schemas
│   ├── tests/
│   │   └── test_api.py      # Microservice unit tests
│   └── requirements.txt     # Python service dependencies
├── node_gateway/
│   ├── src/
│   │   ├── server.js        # Express gateway & API proxy
│   │   └── data/
│   │       ├── favorites.json
│   │       └── history.json
│   ├── tests/
│   │   └── gateway.test.js  # Node.js tests
│   └── package.json
├── .gitignore               # Clean git exclusions
├── package.json             # Root monorepo script orchestrator
├── requirements.txt         # Root Python dependencies for Vercel
├── run.bat                  # 1-click Windows launcher
├── vercel.json              # Vercel deployment configuration
└── README.md                # Documentation
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Comprehensive health check of gateway and Python engine |
| `GET` | `/api/currencies` | Returns metadata (symbols, flags, names) for 30+ currencies |
| `POST` | `/api/convert` | Converts an amount between two currencies with optional fee % |
| `POST` | `/api/batch-convert`| Converts an amount into multiple target currencies simultaneously |
| `GET` | `/api/historical` | Timeseries historical rate series (`7d`, `30d`, `90d`, `1y`) |
| `GET` | `/api/analytics` | Statistical volatility score, trajectory %, and financial advice |
| `GET` | `/api/history` | Fetches saved conversion history records |
| `DELETE`| `/api/history` | Clears conversion history |
| `GET` | `/api/favorites` | Retrieves saved favorite currency pairs |
| `POST`| `/api/favorites` | Adds or toggles a favorite currency pair |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/girishm03/Currency-Converter/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
