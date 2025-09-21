# app/schemas.py
from pydantic import BaseModel
from datetime import date

# Shared properties
class BetBase(BaseModel):
    date: date
    sportsbook: str
    league: str
    market: str
    pick: str
    odds: float
    stake: float
    result: str

# For creating a bet (frontend only needs these fields)
class BetCreate(BetBase):
    pass

# For returning a bet from the DB (includes calculated fields + ID)
class Bet(BetBase):
    id: int
    bonus: float
    decimal: float
    payout: float
    netPnL: float
    cumulativePnL: float

    class Config:
        from_attributes = True  # ✅ for Pydantic v2