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