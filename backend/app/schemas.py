# app/schemas.py
from pydantic import BaseModel
from datetime import date

class BetBase(BaseModel):
    date: date
    sportsbook: str
    league: str
    market: str
    pick: str
    odds: float
    stake: float
    result: str
    bonus: float = 0.0
    decimal: float
    payout: float
    netPnL: float
    cumulativePnL: float

class BetCreate(BetBase):
    pass

class Bet(BetBase):
    id: int

    class Config:
        orm_mode = True