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
    new_bet = models.Bet(**bet.dict())
    db.add(new_bet)
    db.commit()
    db.refresh(new_bet)
    return new_bet