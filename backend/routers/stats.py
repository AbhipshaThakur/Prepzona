import json
import os
import shutil
from datetime import date, datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy.orm import Session

from config.settings import RECORDINGS_DIR as ENV_RECORDINGS_DIR
from database import Answer, InterviewSession, Review, User, get_db
from routers.auth import get_current_user

router = APIRouter(prefix="/stats")

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
RECORDINGS_DIR = ENV_RECORDINGS_DIR or os.path.join(BASE_DIR, "recordings")
os.makedirs(RECORDINGS_DIR, exist_ok=True)


def get_recording_url(session_id: int) -> Optional[str]:
    prefix = f"session-{session_id}."
    for file_name in os.listdir(RECORDINGS_DIR):
        if file_name.startswith(prefix):
            return f"/recordings/{file_name}"
    return None


def get_latest_reviews(db: Session, limit: int = 30) -> List[Review]:
    rows = db.query(Review).order_by(Review.created_at.desc(), Review.id.desc()).all()
    unique_rows: List[Review] = []
    seen_user_ids = set()

    for row in rows:
        if row.user_id in seen_user_ids:
            continue
        seen_user_ids.add(row.user_id)
        unique_rows.append(row)
        if len(unique_rows) >= limit:
            break

    return unique_rows


def get_practice_dates(sessions: List[InterviewSession]) -> List[date]:
    return sorted({session.created_at.date() for session in sessions})


def calculate_streak(practice_dates: List[date]) -> int:
    if not practice_dates:
        return 0

    streak = 1
    for index in range(len(practice_dates) - 1, 0, -1):
        if practice_dates[index] - practice_dates[index - 1] == timedelta(days=1):
            streak += 1
        else:
            break

    return streak


class AnswerIn(BaseModel):
    question: str
    answer: str
    score: float
    feedback: str
    strengths: Optional[List[str]] = []
    improvements: Optional[List[str]] = []


class SessionIn(BaseModel):
    role: str
    interview_type: str = "technical"
    topics: str = ""
    answers: List[AnswerIn]


class ReviewIn(BaseModel):
    rating: int
    text: str


@router.post("/session")
def save_session(body: SessionIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if not body.answers:
        raise HTTPException(status_code=400, detail="No answers")

    scores = [answer.score for answer in body.answers]
    avg = round(sum(scores) / len(scores), 2)
    total = round(sum(scores), 2)

    session = InterviewSession(
        user_id=user.id,
        role=body.role,
        interview_type=body.interview_type,
        total_score=total,
        avg_score=avg,
        questions=len(body.answers),
        feedback=" | ".join(answer.feedback for answer in body.answers),
        topics=body.topics,
    )

    db.add(session)
    db.flush()

    for answer in body.answers:
        db.add(
            Answer(
                session_id=session.id,
                question=answer.question,
                answer=answer.answer,
                score=answer.score,
                feedback=answer.feedback,
                strengths=json.dumps(answer.strengths or []),
                improvements=json.dumps(answer.improvements or []),
            )
        )

    db.commit()
    db.refresh(session)
    return {"message": "Saved", "session_id": session.id}


@router.post("/session/{session_id}/video")
def upload_session_video(
    session_id: int,
    video: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == user.id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if not (video.content_type or "").startswith("video/"):
        raise HTTPException(status_code=400, detail="Only video uploads are supported")

    ext = os.path.splitext(video.filename or "")[-1] or ".webm"
    prefix = f"session-{session_id}."
    for existing in os.listdir(RECORDINGS_DIR):
        if existing.startswith(prefix):
            os.remove(os.path.join(RECORDINGS_DIR, existing))

    file_name = f"session-{session_id}{ext}"
    file_path = os.path.join(RECORDINGS_DIR, file_name)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(video.file, buffer)

    return {"message": "Video saved", "file_url": f"/recordings/{file_name}"}


@router.get("/me")
def my_stats(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    sessions = (
        db.query(InterviewSession)
        .filter(InterviewSession.user_id == user.id)
        .order_by(InterviewSession.created_at)
        .all()
    )

    if not sessions:
        return {
            "sessions": [],
            "summary": {
                "total_sessions": 0,
                "overall_avg": 0,
                "best_score": 0,
                "streak": 0,
                "active_days": 0,
            },
            "charts": {"line": [], "bar": [], "pie": [], "radar": []},
        }

    practice_dates = get_practice_dates(sessions)
    streak = calculate_streak(practice_dates)
    active_days = len(practice_dates)

    line = [
        {"name": f"S{i + 1}", "score": round(session.avg_score, 1), "date": session.created_at.strftime("%d %b")}
        for i, session in enumerate(sessions)
    ]

    role_map = {}
    for session in sessions:
        role_map.setdefault(session.role, []).append(session.avg_score)
    bar = [{"role": role[:10], "avg": round(sum(scores) / len(scores), 1)} for role, scores in role_map.items()]

    type_map = {}
    for session in sessions:
        type_map[session.interview_type] = type_map.get(session.interview_type, 0) + 1
    pie = [{"name": interview_type.title(), "value": count} for interview_type, count in type_map.items()]

    avg_all = round(sum(session.avg_score for session in sessions) / len(sessions), 1)
    radar = [
        {"topic": "Technical", "score": round(max(session.avg_score for session in sessions), 1)},
        {"topic": "Communication", "score": avg_all},
        {"topic": "Problem Solving", "score": avg_all},
        {"topic": "Confidence", "score": round(min(session.avg_score for session in sessions), 1)},
        {"topic": "Clarity", "score": avg_all},
    ]

    sessions_data = []
    for session in reversed(sessions):
        answers = db.query(Answer).filter(Answer.session_id == session.id).all()
        sessions_data.append(
            {
                "id": session.id,
                "role": session.role,
                "type": session.interview_type,
                "score": round(session.avg_score, 1),
                "questions": session.questions,
                "date": session.created_at.strftime("%d %b %Y"),
                "video_url": get_recording_url(session.id),
                "answers": [
                    {
                        "question": answer.question,
                        "answer": answer.answer,
                        "score": answer.score,
                        "feedback": answer.feedback,
                        "strengths": json.loads(answer.strengths or "[]"),
                        "improvements": json.loads(answer.improvements or "[]"),
                    }
                    for answer in answers
                ],
            }
        )

    return {
        "sessions": sessions_data,
        "summary": {
            "total_sessions": len(sessions),
            "overall_avg": round(sum(session.avg_score for session in sessions) / len(sessions), 1),
            "best_score": round(max(session.avg_score for session in sessions), 1),
            "streak": streak,
            "active_days": active_days,
        },
        "charts": {"line": line, "bar": bar, "pie": pie, "radar": radar},
    }


@router.post("/review")
def post_review(body: ReviewIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    review_text = body.text.strip()
    if not review_text:
        raise HTTPException(status_code=400, detail="Review text is required")

    existing_reviews = (
        db.query(Review)
        .filter(Review.user_id == user.id)
        .order_by(Review.created_at.desc(), Review.id.desc())
        .all()
    )

    if existing_reviews:
        primary = existing_reviews[0]
        primary.rating = body.rating
        primary.text = review_text
        primary.created_at = datetime.utcnow()
        db.commit()
        return {"message": "Updated"}

    db.add(Review(user_id=user.id, rating=body.rating, text=review_text))
    db.commit()
    return {"message": "Saved"}


@router.get("/reviews")
def get_reviews(db: Session = Depends(get_db)):
    rows = get_latest_reviews(db)
    return [
        {
            "id": row.id,
            "name": row.user.name,
            "email": (row.user.email[:4] + "...@" + row.user.email.split("@")[-1] if "@" in row.user.email else row.user.email),
            "rating": row.rating,
            "text": row.text,
            "date": row.created_at.strftime("%b %d, %Y"),
            "avatar": row.user.name[:2].upper(),
        }
        for row in rows
    ]
