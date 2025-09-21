# app/main.py
from fastapi import FastAPI
from app.api import bets
from app.database import Base, engine
from fastapi.middleware.cors import CORSMiddleware

# create tables if not using Alembic yet
Base.metadata.create_all(bind=engine)

app = FastAPI(title="BetLog API")

# Allow frontend (React) to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # frontend dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(bets.router, prefix="/bets", tags=["bets"])

@app.get("/")
def root():
    return {"message": "Welcome to BetLog API"}