from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class CurrencyInfo(BaseModel):
    code: str
    name: str
    symbol: str
    flag: str
    country: str

class ConvertRequest(BaseModel):
    from_currency: str = Field(..., example="USD")
    to_currency: str = Field(..., example="EUR")
    amount: float = Field(..., gt=0, example=100.0)
    fee_percent: float = Field(default=0.0, ge=0, le=20.0, example=1.5)

class ConvertResponse(BaseModel):
    from_currency: str
    to_currency: str
    original_amount: float
    converted_amount: float
    exchange_rate: float
    inverse_rate: float
    fee_percent: float
    fee_amount: float
    total_amount: float
    timestamp: str

class BatchConvertRequest(BaseModel):
    from_currency: str = Field(..., example="USD")
    to_currencies: List[str] = Field(..., example=["EUR", "GBP", "JPY", "CAD", "AUD", "INR"])
    amount: float = Field(..., gt=0, example=100.0)
    fee_percent: float = Field(default=0.0, ge=0, le=20.0, example=0.0)

class BatchItemResult(BaseModel):
    rate: float
    converted_amount: float
    fee_amount: float
    total_amount: float
    symbol: str

class BatchConvertResponse(BaseModel):
    from_currency: str
    original_amount: float
    fee_percent: float
    results: Dict[str, BatchItemResult]
    timestamp: str

class HistoricalDataPoint(BaseModel):
    date: str
    rate: float

class HistoricalStats(BaseModel):
    min_rate: float
    max_rate: float
    avg_rate: float
    change_percent: float
    trend: str  # "bullish", "bearish", "stable"
    start_rate: float
    end_rate: float

class HistoricalResponse(BaseModel):
    from_currency: str
    to_currency: str
    timeframe: str
    data_points: List[HistoricalDataPoint]
    stats: HistoricalStats

class AnalyticsResponse(BaseModel):
    from_currency: str
    to_currency: str
    current_rate: float
    volatility_score: float  # std dev percentage
    volatility_rating: str   # Low, Moderate, High
    percentage_change_30d: float
    summary: str
    best_rate_date: Optional[str] = None
