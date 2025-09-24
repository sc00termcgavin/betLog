# app/api/bets.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas, database
from app.utils import recalc_all_bets, calc_fields

router = APIRouter()

# --- DB session dependency ---
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- Routes ---

@router.get("/", response_model=list[schemas.Bet])
def get_bets(db: Session = Depends(get_db)):
    """Return all bets in ascending order (oldest first)."""
    return db.query(models.Bet).order_by(models.Bet.id.asc()).all()


@router.post("/", response_model=schemas.Bet)
def create_bet(bet: schemas.BetCreate, db: Session = Depends(get_db)):
    """Insert a new bet, then recalc PnL across all bets."""
    decimal, payout, net = calc_fields(bet.stake, bet.odds, bet.result, bet.bonus)

    new_bet = models.Bet(
        date=bet.date,
        sportsbook=bet.sportsbook,
        league=bet.league,
        market=bet.market,
        pick=bet.pick,
        odds=bet.odds,
        stake=bet.stake,
        result=bet.result,
        bonus=bet.bonus,
        decimal=decimal,
        payout=payout,
        netPnL=net,
        cumulativePnL=0.0,  # temporary, fixed by recalc
    )
    db.add(new_bet)
    db.commit()
    db.refresh(new_bet)

    # 🔄 Recalculate all bets (keeps cumulativePnL accurate)
    recalc_all_bets()

    # Refresh this bet with updated cumulativePnL
    db.refresh(new_bet)
    return new_bet


@router.delete("/{bet_id}", response_model=schemas.Bet)
def delete_bet(bet_id: int, db: Session = Depends(get_db)):
    """Delete a bet by ID and recalc all PnL."""
    bet = db.query(models.Bet).filter(models.Bet.id == bet_id).first()
    if not bet:
        raise HTTPException(status_code=404, detail="Bet not found")

    db.delete(bet)
    db.commit()

    # 🔄 Recalculate after deletion
    recalc_all_bets()
    return bet


@router.post("/recalc")
def recalc_bets():
    """Manually trigger a recalculation of all bets."""
    result = recalc_all_bets()
    return result

@router.put("/{bet_id}", response_model=schemas.Bet)
def update_bet(bet_id: int, bet_update: schemas.BetCreate, db: Session = Depends(get_db)):
    """Update an existing bet and recalc all PnL."""
    bet = db.query(models.Bet).filter(models.Bet.id == bet_id).first()
    if not bet:
        raise HTTPException(status_code=404, detail="Bet not found")

    # Update fields
    bet.date = bet_update.date
    bet.sportsbook = bet_update.sportsbook
    bet.league = bet_update.league
    bet.market = bet_update.market
    bet.pick = bet_update.pick
    bet.odds = bet_update.odds
    bet.stake = bet_update.stake
    bet.result = bet_update.result
    bet.bonus = bet_update.bonus

    db.commit()

    # 🔄 recalc everything so cumulativePnL stays correct
    from app.utils import recalc_all_bets
    recalc_all_bets()

    db.refresh(bet)
    return bet