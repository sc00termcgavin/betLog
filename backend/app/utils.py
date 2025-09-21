# backend/app/utils.py
# app/utils.py
from app.database import SessionLocal
from app import models

# --- Odds Conversion ---
def to_decimal(odds: float) -> float:
    """
    Convert odds to decimal:
    - American odds (e.g., -170, +200)
    - Decimal odds (e.g., 1.91, 2.10)
    """
    if odds <= -100:   # negative American
        return 1.0 + (100.0 / abs(odds))
    if odds >= 100:    # positive American
        return 1.0 + (odds / 100.0)
    return float(odds)  # assume already decimal


# --- Calculation for a single bet ---

def calc_fields(stake: float, odds: float, result: str, bonus: float = 0.0):
    """
    Given stake, odds, result, and optional bonus:
      - Bonus bets: loss = no effect, win = profit only
      - Regular bets: normal payout rules
      - open bets: dont update payout or netPnL
    Returns (decimal_odds, payout, netPnL)
    """
    dec = to_decimal(odds)
    r = (result or "").lower()

    if r == "open":
        payout = 0.0
        net = 0.0

    elif bonus > 0:  # Bonus bet rules
        if r == "win":
            payout = round(stake * (dec - 1.0), 2)   # only winnings
            net = payout
        else:  # loss or push
            payout = 0.0
            net = 0.0

    else:  # Regular cash bet rules
        if r == "win":
            payout = round(stake * dec, 2)
            net = round(stake * (dec - 1.0), 2)
        elif r == "push":
            payout = round(stake, 2)
            net = 0.0
        else:  # loss
            payout = 0.0
            net = -round(stake, 2)

    return round(dec, 4), payout, net


# --- Recalc for all bets in DB ---

def recalc_all_bets():
    """
    Recalculate decimal, payout, netPnL, cumulativePnL for all bets.
    Ensures cumulativePnL stays consistent after inserts/deletes.
    """
    
    db = SessionLocal()
    try:
        bets = db.query(models.Bet).order_by(models.Bet.id.asc()).all()
        cumulative = 0.0
        for b in bets:
            dec, payout, net = calc_fields(b.stake, b.odds, b.result, b.bonus)

            # Only settled bets affect cumulative
            if (b.result or "").lower() != "open":
                cumulative = round(cumulative + net, 2)

            b.decimal = dec
            b.payout = payout
            b.netPnL = net
            b.cumulativePnL = cumulative

        db.commit()
        return {"status": "success", "bets_updated": len(bets)}
    finally:
        db.close()