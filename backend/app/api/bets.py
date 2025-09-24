# app/api/bets.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas, database
from app.utils import recalc_all_bets, calc_fields, calc_arbitrage_profit  # pylint: disable=E0401


router = APIRouter()

# --- DB session dependency ---
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --------------------------------
# --- GET /bets/ ---
# --------------------------------
@router.get("/", response_model=list[schemas.Bet])
def get_bets(db: Session = Depends(get_db)):
    """Return all bets in ascending order (oldest first)."""
    return db.query(models.Bet).order_by(models.Bet.id.asc()).all()


# --------------------------------
# --- POST /bets/ ---
# --------------------------------
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
        is_arbitrage=bet.is_arbitrage,
        arb_group_id=bet.arb_group_id,
    )
    db.add(new_bet)
    db.commit()
    db.refresh(new_bet)

    # 🔄 Recalculate all bets (keeps cumulativePnL accurate)
    recalc_all_bets()

    # ✅ if part of an arb group, recalc guaranteed profit for all legs
    if new_bet.is_arbitrage and new_bet.arb_group_id:
        group_bets = db.query(models.Bet).filter(
            models.Bet.arb_group_id == new_bet.arb_group_id
        ).all()
        gp = calc_arbitrage_profit(group_bets)
        for b in group_bets:
            b.guaranteed_profit = gp
        db.commit()
        db.refresh(new_bet)

    return new_bet

# --------------------------------
# --- PUT /bets/{bet_id} ---
# --------------------------------
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
    bet.is_arbitrage = bet_update.is_arbitrage
    bet.arb_group_id = bet_update.arb_group_id

    db.commit()

    # 🔄 recalc everything so cumulativePnL stays correct
    recalc_all_bets()

    # ✅ if part of an arb group, recalc guaranteed profit
    if bet.is_arbitrage and bet.arb_group_id:
        group_bets = db.query(models.Bet).filter(
            models.Bet.arb_group_id == bet.arb_group_id
        ).all()
        gp = calc_arbitrage_profit(group_bets)
        for b in group_bets:
            b.guaranteed_profit = gp
        db.commit()
        db.refresh(bet)

    db.refresh(bet)
    return bet




# --------------------------------
# --- DELETE /bets/{bet_id} ---
# --------------------------------

@router.delete("/{bet_id}", response_model=schemas.Bet)
def delete_bet(bet_id: int, db: Session = Depends(get_db)):
    """Delete a bet by ID and recalc all PnL."""
    bet = db.query(models.Bet).filter(models.Bet.id == bet_id).first()
    if not bet:
        raise HTTPException(status_code=404, detail="Bet not found")

    arb_group_id = bet.arb_group_id
    db.delete(bet)
    db.commit()

    # 🔄 Recalculate after deletion
    recalc_all_bets()
    if arb_group_id:
        group_bets = db.query(models.Bet).filter(
            models.Bet.arb_group_id == arb_group_id
        ).all()
        gp = calc_arbitrage_profit(group_bets) if group_bets else None
        for b in group_bets:
            b.guaranteed_profit = gp
        db.commit()

    return bet






# @router.put("/{bet_id}", response_model=schemas.Bet)
# def update_bet(bet_id: int, bet_update: schemas.BetCreate, db: Session = Depends(get_db)):
#     """Update an existing bet and recalc all PnL."""
#     bet = db.query(models.Bet).filter(models.Bet.id == bet_id).first()
#     if not bet:
#         raise HTTPException(status_code=404, detail="Bet not found")

#     # Update fields
#     bet.date = bet_update.date
#     bet.sportsbook = bet_update.sportsbook
#     bet.league = bet_update.league
#     bet.market = bet_update.market
#     bet.pick = bet_update.pick
#     bet.odds = bet_update.odds
#     bet.stake = bet_update.stake
#     bet.result = bet_update.result
#     bet.bonus = bet_update.bonus
#     bet.is_arbitrage = bet_update.is_arbitrage
#     bet.arb_group_id = bet_update.arb_group_id

#     db.commit()

#     # 🔄 recalc everything so cumulativePnL stays correct
#     recalc_all_bets()

#     # ✅ if part of an arb group, recalc guaranteed profit
#     if bet.is_arbitrage and bet.arb_group_id:
#         group_bets = db.query(models.Bet).filter(
#             models.Bet.arb_group_id == bet.arb_group_id
#         ).all()
#         gp = calc_arbitrage_profit(group_bets)
#         for b in group_bets:
#             b.guaranteed_profit = gp
#         db.commit()
#         db.refresh(bet)

#     db.refresh(bet)
#     return bet




# --------------------------------
# --- POST /bets/recalc ---
# --------------------------------
@router.post("/recalc")
def recalc_bets():
    """Manually trigger a recalculation of all bets."""
    result = recalc_all_bets()
    return result

