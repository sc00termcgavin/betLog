# app/main.py
from fastapi import FastAPI
from app.api import bets
from app.database import Base, engine

# create tables if not using Alembic yet
Base.metadata.create_all(bind=engine)

app = FastAPI(title="BetLog API")

app.include_router(bets.router, prefix="/bets", tags=["bets"])

@app.get("/")
def root():
    return {"message": "Welcome to BetLog API"}