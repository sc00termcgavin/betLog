# app/api/arbitrage.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app import models, schemas, database

# File creates and lists arbitrage groups.
# Provides a way to link bets to groups and a summary of performance.

router = APIRouter(prefix="/arbs", tags=["arbitrage"])

# --- DB session dependency ---
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

#--------------------------------
# --- Endpoints ---
#--------------------------------
@router.post("/groups", response_model=schemas.ArbGroup)
def create_group(payload: schemas.ArbGroupCreate, db: Session = Depends(get_db)):
    """
    Create a new arbitrage group.
    Example: group of bets across sportsbooks that guarantee profit.
    """
    group = models.ArbGroup(
        description=payload.description,
        guaranteed_profit=payload.guaranteed_profit
    )
    db.add(group)
    db.commit()
    db.refresh(group)
    return group


@router.get("/groups", response_model=List[schemas.ArbGroup])
def list_groups(db: Session = Depends(get_db)):
    """
    List all arbitrage groups.
    Useful for selecting an existing group when entering bets.
    """
    return db.query(models.ArbGroup).all()


@router.get("/groups/{group_id}", response_model=schemas.ArbGroupWithBets)
def get_group(group_id: int, db: Session = Depends(get_db)):
    """
    Get a single arbitrage group and all its linked bets.
    Includes:
    - group info
    - list of bets in that group
    - realized profit (sum of netPnL so far)
    - guaranteed profit (if specified)
    """
    group = db.get(models.ArbGroup, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    bets = db.query(models.Bet).filter(models.Bet.arb_group_id == group_id).all()
    realized = sum(float(b.netPnL or 0) for b in bets)

    return {
        "group": group,
        "bets": bets,
        "realized_profit": realized,
        "guaranteed_profit": float(group.guaranteed_profit or 0) if group.guaranteed_profit else None,
    }


@router.get("/summary")
def summary(db: Session = Depends(get_db)):
    """
    Summarize arbitrage performance across all groups.
    Groups by arb_group_id and returns:
    - group id
    - number of bets ("legs") in the group
    - total realized profit (sum of netPnL so far)
    """
    rows = (
        db.query(
            models.Bet.arb_group_id,
            func.sum(func.coalesce(models.Bet.netPnL, 0)).label("realized_profit"),
            func.count(models.Bet.id).label("legs")  # pylint: disable=not-callable
        )
        .filter(models.Bet.is_arbitrage == True)
        .group_by(models.Bet.arb_group_id)
        .all()
    )
    return [
        {
            "arb_group_id": r.arb_group_id,
            "legs": r.legs,
            "realized_profit": float(r.realized_profit or 0),
        }
        for r in rows
    ]