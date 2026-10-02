from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .models import (
    CurrencyInfo,
    ConvertRequest,
    ConvertResponse,
    BatchConvertRequest,
    BatchConvertResponse,
    BatchItemResult,
    HistoricalResponse,
    AnalyticsResponse
)
from .rates_service import rates_service, CURRENCIES_METADATA
from .analytics import generate_currency_analytics

app = FastAPI(
    title="Currency Conversion & Analytics Engine",
    description="Python microservice providing real-time exchange rates, cross-currency conversions, historical trends, and market volatility analytics.",
    version="1.0.0"
)

# Enable CORS for local gateway & frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "service": "Currency Conversion & Analytics Microservice",
        "status": "operational",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/api/health")
async def health_check():
    rates = await rates_service.get_all_usd_rates()
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "source": rates_service._rates_source,
        "supported_currencies_count": len(CURRENCIES_METADATA),
        "cached_rates_count": len(rates)
    }

@app.get("/api/currencies", response_model=List[CurrencyInfo])
def get_currencies():
    """Returns list of supported currencies with symbols, flags, and names."""
    return rates_service.get_supported_currencies()

@app.post("/api/convert", response_model=ConvertResponse)
async def convert_currency(payload: ConvertRequest):
    """Convert amount from one currency to another with optional fee percentage."""
    from_curr = payload.from_currency.upper()
    to_curr = payload.to_currency.upper()

    if from_curr not in CURRENCIES_METADATA:
        raise HTTPException(status_code=400, detail=f"Unsupported currency: {from_curr}")
    if to_curr not in CURRENCIES_METADATA:
        raise HTTPException(status_code=400, detail=f"Unsupported currency: {to_curr}")

    rate = await rates_service.get_exchange_rate(from_curr, to_curr)
    inverse_rate = round(1.0 / rate, 6) if rate > 0 else 0.0

    raw_converted = payload.amount * rate
    fee_amount = round(raw_converted * (payload.fee_percent / 100.0), 4)
    total_amount = round(raw_converted - fee_amount, 4)

    return ConvertResponse(
        from_currency=from_curr,
        to_currency=to_curr,
        original_amount=round(payload.amount, 4),
        converted_amount=round(raw_converted, 4),
        exchange_rate=rate,
        inverse_rate=inverse_rate,
        fee_percent=payload.fee_percent,
        fee_amount=fee_amount,
        total_amount=total_amount,
        timestamp=datetime.now().isoformat()
    )

@app.post("/api/batch-convert", response_model=BatchConvertResponse)
async def batch_convert(payload: BatchConvertRequest):
    """Convert an amount from a single base currency into multiple target currencies."""
    from_curr = payload.from_currency.upper()
    if from_curr not in CURRENCIES_METADATA:
        raise HTTPException(status_code=400, detail=f"Unsupported base currency: {from_curr}")

    results = {}
    for target in payload.to_currencies:
        target_code = target.upper()
        if target_code not in CURRENCIES_METADATA:
            continue

        rate = await rates_service.get_exchange_rate(from_curr, target_code)
        raw_converted = payload.amount * rate
        fee_amt = round(raw_converted * (payload.fee_percent / 100.0), 4)
        total_amt = round(raw_converted - fee_amt, 4)
        meta = CURRENCIES_METADATA[target_code]

        results[target_code] = BatchItemResult(
            rate=rate,
            converted_amount=round(raw_converted, 4),
            fee_amount=fee_amt,
            total_amount=total_amt,
            symbol=meta["symbol"]
        )

    return BatchConvertResponse(
        from_currency=from_curr,
        original_amount=round(payload.amount, 4),
        fee_percent=payload.fee_percent,
        results=results,
        timestamp=datetime.now().isoformat()
    )

@app.get("/api/historical", response_model=HistoricalResponse)
async def get_historical(
    from_curr: str = Query("USD", alias="from"),
    to_curr: str = Query("EUR", alias="to"),
    timeframe: str = Query("30d", pattern="^(7d|30d|90d|1y)$")
):
    """Returns historical rate data points and trend stats for interactive charts."""
    f = from_curr.upper()
    t = to_curr.upper()

    if f not in CURRENCIES_METADATA or t not in CURRENCIES_METADATA:
        raise HTTPException(status_code=400, detail="Invalid currency pair")

    points, stats = await rates_service.fetch_historical_series(f, t, timeframe)

    return HistoricalResponse(
        from_currency=f,
        to_currency=t,
        timeframe=timeframe,
        data_points=points,
        stats=stats
    )

@app.get("/api/analytics", response_model=AnalyticsResponse)
async def get_analytics(
    from_curr: str = Query("USD", alias="from"),
    to_curr: str = Query("EUR", alias="to")
):
    """Returns volatility metrics, trend analysis, and conversion advisory insights."""
    f = from_curr.upper()
    t = to_curr.upper()

    if f not in CURRENCIES_METADATA or t not in CURRENCIES_METADATA:
        raise HTTPException(status_code=400, detail="Invalid currency pair")

    return await generate_currency_analytics(f, t)

# In-memory history and favorites for serverless / standalone mode
HISTORY_RECORDS = []
FAVORITE_PAIRS = [
    {"from": "USD", "to": "EUR"},
    {"from": "GBP", "to": "USD"},
    {"from": "USD", "to": "JPY"},
    {"from": "USD", "to": "INR"},
    {"from": "USD", "to": "CAD"},
    {"from": "EUR", "to": "GBP"}
]

@app.get("/api/history")
def get_history():
    return HISTORY_RECORDS

@app.delete("/api/history")
def clear_history():
    global HISTORY_RECORDS
    HISTORY_RECORDS = []
    return {"message": "Conversion history cleared successfully"}

@app.get("/api/favorites")
def get_favorites():
    return FAVORITE_PAIRS

@app.post("/api/favorites")
def toggle_favorite(payload: dict):
    from_curr = payload.get("from", "").upper()
    to_curr = payload.get("to", "").upper()
    if not from_curr or not to_curr:
        raise HTTPException(status_code=400, detail="Both from and to currency codes are required")

    global FAVORITE_PAIRS
    exists_idx = next((i for i, f in enumerate(FAVORITE_PAIRS) if f["from"] == from_curr and f["to"] == to_curr), -1)
    if exists_idx >= 0:
        FAVORITE_PAIRS.pop(exists_idx)
        return {"action": "removed", "favorites": FAVORITE_PAIRS}
    else:
        FAVORITE_PAIRS.append({"from": from_curr, "to": to_curr})
        return {"action": "added", "favorites": FAVORITE_PAIRS}
