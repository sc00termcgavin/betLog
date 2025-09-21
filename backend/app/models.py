# app/models.py
from sqlalchemy import Column, Integer, String, Float, Date
from app.database import Base

class Bet(Base):
    __tablename__ = "bets"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date)
    sportsbook = Column(String, index=True)
    league = Column(String)
    market = Column(String)
    pick = Column(String)
    odds = Column(Float)
    stake = Column(Float)
    result = Column(String)

    # new fields
    bonus = Column(Float, default=0.0)
    decimal = Column(Float)
    payout = Column(Float)
    netPnL = Column(Float)
    cumulativePnL = Column(Float)