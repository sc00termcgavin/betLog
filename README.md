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