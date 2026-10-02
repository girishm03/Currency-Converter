import math
from typing import List, Dict
from .models import AnalyticsResponse, HistoricalDataPoint
from .rates_service import rates_service

def calculate_volatility(points: List[HistoricalDataPoint]) -> float:
    """Calculates annualized volatility percentage from data points."""
    if len(points) < 2:
        return 0.0

    returns = []
    for i in range(1, len(points)):
        prev = points[i - 1].rate
        curr = points[i].rate
        if prev > 0:
            returns.append((curr - prev) / prev)

    if not returns:
        return 0.0

    mean_ret = sum(returns) / len(returns)
    variance = sum((r - mean_ret) ** 2 for r in returns) / len(returns)
    std_dev = math.sqrt(variance)

    # Annualize assuming ~252 trading days
    annualized_vol = std_dev * math.sqrt(252) * 100
    return round(annualized_vol, 2)

async def generate_currency_analytics(from_curr: str, to_curr: str) -> AnalyticsResponse:
    """Generate in-depth statistical insights and advisory recommendations."""
    from_curr = from_curr.upper()
    to_curr = to_curr.upper()

    current_rate = await rates_service.get_exchange_rate(from_curr, to_curr)
    points, stats = await rates_service.fetch_historical_series(from_curr, to_curr, timeframe="30d")

    volatility = calculate_volatility(points)

    if volatility < 5.0:
        vol_rating = "Low"
    elif volatility < 12.0:
        vol_rating = "Moderate"
    else:
        vol_rating = "High"

    pct_change = stats.change_percent

    # Formulate intelligent financial advisory insight
    if pct_change >= 2.0:
        summary = f"{from_curr} is in a strong uptrend against {to_curr} (+{pct_change}% in 30 days). Strong conversion power for holders of {from_curr}."
    elif pct_change <= -2.0:
        summary = f"{from_curr} has weakened against {to_curr} ({pct_change}% in 30 days). Favorable window if converting {to_curr} into {from_curr}."
    else:
        summary = f"{from_curr}/{to_curr} is trading within a stable consolidation band with {vol_rating.lower()} volatility ({volatility}%). Reliable pricing with low slippage risk."

    best_point = max(points, key=lambda p: p.rate) if points else None

    return AnalyticsResponse(
        from_currency=from_curr,
        to_currency=to_curr,
        current_rate=current_rate,
        volatility_score=volatility,
        volatility_rating=vol_rating,
        percentage_change_30d=pct_change,
        summary=summary,
        best_rate_date=best_point.date if best_point else None
    )
