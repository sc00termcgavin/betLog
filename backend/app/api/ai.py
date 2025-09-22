# app/api/ai.py
from fastapi import APIRouter
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from openai import OpenAI

# Load .env
load_dotenv()

router = APIRouter()

# OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class AIRequest(BaseModel):
    prompt: str

@router.post("/ai")
async def ask_ai(request: AIRequest):
    try:
        response = client.chat.completions.create(
            model="gpt-4.1-mini",  # safe & cheap, can swap with gpt-4.1 if needed
            messages=[{"role": "user", "content": request.prompt}]
        )
        return {"reply": response.choices[0].message.content}
    except Exception as e:
        return {"error": str(e)}