from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import AIChatRequest, AIChatResponse
from ..services.ai_service import process_ai_chat
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/ai", tags=["AI Assistant"])

@router.post("/chat", response_model=AIChatResponse)
def ai_chat(payload: AIChatRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    res = process_ai_chat(db, payload.message, current_user)
    return res
