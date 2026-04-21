from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session
from database import get_db, User, InterviewSession, Answer
from services.auth_service import decode_token
from services.llm_interview_service import (
    evaluate_answer_with_fallback,
    evaluate_session_with_fallback,
    generate_question_with_fallback,
)
from services.session_memory_service import build_session_memory
from services.voice_service import text_to_voice

router = APIRouter(prefix="/api")
bearer = HTTPBearer(auto_error=False)


def get_optional_user(
    creds: HTTPAuthorizationCredentials = Depends(bearer),
    db: Session = Depends(get_db),
) -> Optional[User]:
    if not creds:
        return None
    payload = decode_token(creds.credentials)
    if not payload:
        return None
    try:
        user_id = int(payload.get("sub"))
    except (TypeError, ValueError):
        return None
    return db.query(User).filter(User.id == user_id).first()


def get_saved_question_history(
    db: Session,
    user: Optional[User],
    role: str,
    interview_type: str,
    limit: int = 80,
) -> List[str]:
    if not user:
        return []
    rows = (
        db.query(Answer.question)
        .join(InterviewSession, Answer.session_id == InterviewSession.id)
        .filter(
            InterviewSession.user_id == user.id,
            InterviewSession.role == role,
            InterviewSession.interview_type == interview_type,
        )
        .order_by(Answer.created_at.desc())
        .limit(limit)
        .all()
    )
    return [question for (question,) in rows if question]


def merge_questions(*groups: List[str]) -> List[str]:
    merged = []
    seen   = set()
    for group in groups:
        for question in group or []:
            normalized = " ".join((question or "").lower().split())
            if not normalized or normalized in seen:
                continue
            seen.add(normalized)
            merged.append(question)
    return merged


class QuestionRequest(BaseModel):
    role:              str
    experience:        str = "0"
    notes:             str = ""
    interview_type:    str = "technical"
    resume_text:       Optional[str] = None
    asked_questions:   Optional[List[str]] = None
    previous_question: Optional[str] = None
    previous_answer:   Optional[str] = None
    with_audio:        bool = False


class AnswerRequest(BaseModel):
    role:           str
    question:       str
    answer:         str
    interview_type: str = "technical"


class BulkEvaluateRequest(BaseModel):
    role:           str
    interview_type: str = "technical"
    answers:        List[dict]


@router.post("/question")
def generate_question(
    req: QuestionRequest,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user),
):
    try:
        current_session_questions = req.asked_questions or []
        saved_questions = get_saved_question_history(db, user, req.role, req.interview_type)
        asked_questions = merge_questions(current_session_questions, saved_questions)
        session_memory = build_session_memory(
            db,
            user.id if user else None,
            req.role,
            req.interview_type,
        )
        question_result = generate_question_with_fallback(
            role=req.role,
            interview_type=req.interview_type,
            experience=req.experience,
            notes=req.notes or "",
            resume_text=req.resume_text or "",
            asked_questions=asked_questions,
            previous_question=req.previous_question or "",
            previous_answer=req.previous_answer or "",
            question_number=len(current_session_questions) + 1,
            session_memory=session_memory,
        )
        question  = question_result["question"]
        audio_url = text_to_voice(question) if req.with_audio else None
        return {"question": question, "audio": audio_url, "source": question_result["source"]}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/answer/evaluate")
def evaluate_single(req: AnswerRequest):
    try:
        return evaluate_answer_with_fallback(req.role, req.question, req.answer, req.interview_type)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/session/evaluate")
def evaluate_session(req: BulkEvaluateRequest):
    try:
        results = evaluate_session_with_fallback(req.role, req.interview_type, req.answers)
        source  = "llm" if results and all(item.get("source") == "llm" for item in results) else "fallback"
        return {"results": results, "source": source}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
