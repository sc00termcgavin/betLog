# # # app/api/bets.py
# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from app import models, schemas, database
# from app.utils import recalc_all_bets

# router = APIRouter()

# # --- DB session dependency ---
# def get_db():
#     db = database.SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

# # --- Odds helpers ---
# def to_decimal(odds: float) -> float:
#     """
#     Accepts either American or decimal odds and returns decimal odds >= 1.0.
#     Rules:
#       - If odds <= -100 (e.g., -170, -950) → 1 + 100/abs(odds)
#       - If odds >= 100  (e.g., +120, +250) → 1 + odds/100
#       - Otherwise treat as decimal (e.g., 1.80, 2.1)
#     """
#     if odds <= -100:
#         return 1.0 + (100.0 / abs(odds))
#     if odds >= 100:
#         return 1.0 + (odds / 100.0)
#     # assume it's already decimal odds (e.g., 1.80, 2.10)
#     return float(odds)

# def calc_fields(stake: float, american_or_decimal: float, result: str):
#     dec = to_decimal(american_or_decimal)
#     r = (result or "").lower()

#     if r == "win":
#         payout = round(stake * dec, 2)                 # total returned (includes stake)
#         net    = round(stake * (dec - 1.0), 2)         # profit
#     elif r == "push":
#         payout = round(stake, 2)                        # stake returned
#         net    = 0.0
#     else:  # loss
#         payout = 0.0
#         net    = -round(stake, 2)

#     return round(dec, 4), payout, net

# # --- Routes ---
# @router.get("/", response_model=list[schemas.Bet])
# def get_bets(db: Session = Depends(get_db)):
#     # Return in insertion order so cumulative makes sense visually
#     return db.query(models.Bet).order_by(models.Bet.id.asc()).all()

# @router.post("/", response_model=schemas.Bet)
# def create_bet(bet: schemas.BetCreate, db: Session = Depends(get_db)):
#     decimal, payout, net = calc_fields(bet.stake, bet.odds, bet.result, bet.bonus)

#     # cumulativePnL = previous cumulative + this net
#     last = db.query(models.Bet).order_by(models.Bet.id.desc()).first()
#     cumulative = round((last.cumulativePnL if last else 0.0) + net, 2)

#     new_bet = models.Bet(
#         date=bet.date,
#         sportsbook=bet.sportsbook,
#         league=bet.league,
#         market=bet.market,
#         pick=bet.pick,
#         odds=bet.odds,          # store exactly what user entered
#         stake=bet.stake,
#         result=bet.result,
#         bonus=0.0,
#         decimal=decimal,        # computed decimal multiplier
#         payout=payout,          # total return
#         netPnL=net,             # profit/loss
#         cumulativePnL=cumulative,
#     )
#     db.add(new_bet)
#     db.commit()
#     db.refresh(new_bet)

#     # 🔄 Recalculate all bets to keep cumulativePnL consistent
#     recalc_all_bets()

#     # Refresh this bet after recalc so we return correct values
#     db.refresh(new_bet)
#     return new_bet

# @router.post("/recalc")
# def recalc_bets():
#     """Recalculate payout/netPnL/cumulativePnL for all bets."""
#     result = recalc_all_bets()
#     return result

# @router.delete("/{bet_id}", response_model=schemas.Bet)
# def delete_bet(bet_id: int, db: Session = Depends(get_db)):
#     bet = db.query(models.Bet).filter(models.Bet.id == bet_id).first()
#     if not bet:
#         raise HTTPException(status_code=404, detail="Bet not found")
#     db.delete(bet)
#     db.commit()
#     recalc_all_bets()
#     return bet
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