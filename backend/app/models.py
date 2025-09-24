# app/models.py
from sqlalchemy import Column, Integer, String, Float, Numeric, Boolean, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from app.database import Base


class ArbGroup(Base):
    __tablename__ = "arb_groups"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    description = Column(Text, nullable=True)
    guaranteed_profit = Column(Numeric(10, 2), nullable=True)

    bets = relationship("Bet", back_populates="arb_group", passive_deletes=True)


class Bet(Base):

    __tablename__ = "bets"


    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, server_default=func.now(), nullable=False)
    sportsbook = Column(String, nullable=False)
    league = Column(String, nullable=False)
    market = Column(String, nullable=False)
    pick = Column(String, nullable=False)
    odds = Column(Float, nullable=False)
    stake = Column(Numeric(10, 2), nullable=False)
    bonus = Column(Numeric(10, 2), nullable=True)
    result = Column(String, nullable=True)   # "Win" | "Loss" | "Push" | "Pending"
    decimal = Column(Numeric(10, 2), nullable=True)
    payout = Column(Numeric(10, 2), nullable=True)
    netPnL = Column(Numeric(10, 2), nullable=True)
    cumulativePnL = Column(Numeric(10, 2), nullable=True)

    # NEW arbitrage fields
    is_arbitrage = Column(Boolean, nullable=False, default=False)
    arb_group_id = Column(Integer, ForeignKey("arb_groups.id", ondelete="SET NULL"), nullable=True)
    guaranteed_profit = Column(Numeric(10, 2), nullable=True)

    arb_group = relationship("ArbGroup", back_populates="bets")