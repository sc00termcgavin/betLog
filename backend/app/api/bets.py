# app/api/bets.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import models, schemas, database

router = APIRouter()

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=list[schemas.Bet])
def get_bets(db: Session = Depends(get_db)):
    return db.query(models.Bet).all()

@router.post("/", response_model=schemas.Bet)
def create_bet(bet: schemas.BetCreate, db: Session = Depends(get_db)):
    # Calculate decimal odds (simple: odds already decimal)
    decimal = bet.odds
    payout = bet.stake * decimal if bet.result == "win" else 0
    netPnL = payout - bet.stake
    # For now, cumulativePnL = netPnL (you can make it running later)
    cumulativePnL = netPnL

    new_bet = models.Bet(
        date=bet.date,
        sportsbook=bet.sportsbook,
        league=bet.league,
        market=bet.market,
        pick=bet.pick,
        odds=bet.odds,
        stake=bet.stake,
        result=bet.result,
        bonus=0.0,
        decimal=decimal,
        payout=payout,
        netPnL=netPnL,
        cumulativePnL=cumulativePnL,
    )
    db.add(new_bet)
    db.commit()
    db.refresh(new_bet)
    return new_bet