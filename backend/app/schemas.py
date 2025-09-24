# app/schemas.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

#--------------------------------
# --- Arbitrage Group Schemas ---
#--------------------------------
class ArbGroupBase(BaseModel):
    description: Optional[str] = None
    guaranteed_profit: Optional[float] = None


class ArbGroupCreate(ArbGroupBase):
    pass


class ArbGroup(ArbGroupBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True  # for Pydantic v2

#--------------------------------
# --- Bet Schemas ---
#--------------------------------
# Shared properties
class BetBase(BaseModel):
    date: date
    sportsbook: str
    league: str
    market: str
    pick: str
    odds: float
    stake: float
    result: str         # "win", "loss", "push"

    # New arbitrage fields
    is_arbitrage: bool = False
    arb_group_id: Optional[int] = None
    guaranteed_profit: Optional[float] = None

# For creating a bet (frontend only needs these fields)
class BetCreate(BetBase):
    bonus: float = 0.0

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

#--------------------------------
# --- ArbGroup with Bets Schema ---
#--------------------------------
class ArbGroupWithBets(BaseModel):
    """
    Rich response schema for a group + its bets.
    Returned by GET /arbs/groups/{group_id}.
    """
    group: ArbGroup
    bets: List[Bet]
    realized_profit: float
    guaranteed_profit: Optional[float] = None

    class Config:
        from_attributes = True