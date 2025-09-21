# backend/app/recalc_pnl.py
from app.database import SessionLocal
from app import models

def to_decimal(odds: float) -> float:
    if odds <= -100:
        return 1.0 + (100.0 / abs(odds))
    if odds >= 100:
        return 1.0 + (odds / 100.0)
    return float(odds)

def main():
    db = SessionLocal()
    try:
        bets = db.query(models.Bet).order_by(models.Bet.id.asc()).all()
        cumulative = 0.0
        for b in bets:
            dec = to_decimal(b.odds)
            if (b.result or "").lower() == "win":
                payout = round(b.stake * dec, 2)
                net = round(b.stake * (dec - 1.0), 2)
            elif (b.result or "").lower() == "push":
                payout = round(b.stake, 2)
                net = 0.0
            else:
                payout = 0.0
                net = -round(b.stake, 2)

            cumulative = round(cumulative + net, 2)

            b.decimal = round(dec, 4)
            b.payout = payout
            b.netPnL = net
            b.cumulativePnL = cumulative

        db.commit()
        print("✅ Recalculation complete.")
    finally:
        db.close()

if __name__ == "__main__":
    main()