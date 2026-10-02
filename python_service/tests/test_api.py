import asyncio
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.rates_service import rates_service
from app.analytics import generate_currency_analytics

async def run_tests():
    print("Testing rates_service.get_supported_currencies()...")
    currencies = rates_service.get_supported_currencies()
    assert len(currencies) >= 30, f"Expected at least 30 currencies, got {len(currencies)}"
    print(f"Pass: {len(currencies)} currencies loaded.")

    print("Testing rates_service.get_exchange_rate('USD', 'EUR')...")
    rate = await rates_service.get_exchange_rate("USD", "EUR")
    assert rate > 0, f"Invalid rate: {rate}"
    print(f"Pass: USD->EUR = {rate}")

    print("Testing rates_service.fetch_historical_series('USD', 'EUR', '30d')...")
    points, stats = await rates_service.fetch_historical_series("USD", "EUR", "30d")
    assert len(points) >= 5, f"Expected data points, got {len(points)}"
    assert stats.min_rate <= stats.max_rate
    print(f"Pass: {len(points)} historical points, trend = {stats.trend}")

    print("Testing generate_currency_analytics('USD', 'EUR')...")
    analytics = await generate_currency_analytics("USD", "EUR")
    assert analytics.volatility_rating in ["Low", "Moderate", "High"]
    print(f"Pass: Volatility = {analytics.volatility_score}% ({analytics.volatility_rating})")
    print("ALL TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(run_tests())
