---

## ⚙️ Setup Instructions

### 1. Backend (FastAPI)

**Environment setup (with pyenv + virtualenv):**
```bash
cd backend
pip install -r requirements.txt
```

**Run the API**
```bash
uvicorn app.main:app --reload
```


### 2. Frontend (React + Vite)

**install Dependencies**

```bash
cd frontend
npm install
```

**Run dev server:**
```bash
npm run dev
```


🗄️ Database
	•	Default dev DB is SQLite (backend/betlog.db).
	•	For production, you can switch to Postgres by updating database.py + Alembic config.



AI Assistant

How it works
	1.	You type a prompt/question into the textarea.
Example:
	•	“Write Python code for calculating payout with American odds.”
	•	“Explain how expected value works in betting.”
	•	“Generate SQL to query all bets with profit > 100.”
	2.	Your React frontend (AIDemo.jsx) sends that prompt to your backend via /ai.
	3.	FastAPI backend (ai.py) forwards it to OpenAI (GPT-4.1-mini) using your API key.
	4.	OpenAI generates a response (text, code, explanation).
	5.	The response comes back to your React app → rendered in your “Ask BetLog AI” panel (with code highlighting if applicable).



Backend

FastAPI bootstraps the app, auto-creates SQLite tables from SQLAlchemy models, wires routers, and enables the Vite dev origin to call the API (backend/app/main.py:8-25).
Bet and ArbGroup models capture individual wagers plus optional arbitrage grouping, including derived metrics like decimal odds, payout, and cumulative PnL (backend/app/models.py:18-43).
Core calculations convert American/decimal odds, handle bonus bets and open wagers, recompute payouts and running PnL for every bet after any mutation, and estimate group-wide arbitrage profit (backend/app/utils.py:9-121).
The /bets endpoints support CRUD, recalc all bets after each change, and when a bet is marked as part of an arbitrage group they recompute the shared guaranteed profit for that group (backend/app/api/bets.py:21-143).
Arbitrage routes let you create/list groups, fetch a group with its legs and realized profit, and return a summary aggregated by group ID (backend/app/api/arbitrage.py:25-101).
/ai proxies prompts to OpenAI’s Chat Completions API (model gpt-4.1-mini) using an env-provided API key, returning either the reply text or the error (backend/app/api/ai.py:19-28).

Frontend

The top-level React component loads bets on mount, keeps them in state, and renders the entry form, editable table, and AI helper panel (frontend/src/App.jsx:8-42).
Axios helpers centralize HTTP calls to the FastAPI backend for bets CRUD and AI requests (frontend/src/api.js:4-13).
BetForm is a controlled form that casts numeric fields appropriately, supports marking wagers as bonus or arbitrage legs, and resets after posting a new bet (frontend/src/components/BetForm.jsx:5-198).
BetTable surfaces portfolio KPIs (total PnL, stake, win %, ROI), lists bets with color-coded status, lets you inline-edit records (including arbitrage flags/group IDs), delete bets, and renders arbitrage group cards underneath (frontend/src/components/BetTable.jsx:547-777).
ArbSummaryCard derives stake, profit, and payout per leg, then reports aggregate stake and net profit percentage for each arbitrage group (frontend/src/components/ArbSummaryCard.jsx:80-155).
AIDemo posts free-form prompts to /ai, stores the reply, and highlights any code block returned by the model (frontend/src/components/AIDemo.jsx:6-55).