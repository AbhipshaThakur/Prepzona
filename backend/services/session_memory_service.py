import json
import re
from collections import Counter
from typing import Any, Optional

from sqlalchemy.orm import Session

from database import Answer, InterviewSession


def _clean_text(value: Any, limit: int = 220) -> str:
    text = " ".join(str(value or "").strip().split())
    return text[:limit]


def _load_json_list(value: Any) -> list[str]:
    if not value:
        return []
    if isinstance(value, list):
        items = value
    else:
        try:
            items = json.loads(value)
        except (TypeError, ValueError, json.JSONDecodeError):
            return []
    return [_clean_text(item, limit=120) for item in items if _clean_text(item, limit=120)]


def _split_topics(value: str) -> list[str]:
    parts = re.split(r"[,/\n|]+", value or "")
    return [_clean_text(part, limit=60) for part in parts if _clean_text(part, limit=60)]


def _top_unique(items: list[str], limit: int = 4) -> list[str]:
    counter = Counter(item for item in items if item)
    ordered = sorted(counter.items(), key=lambda row: (-row[1], row[0].lower()))
    return [item for item, _ in ordered[:limit]]


def _summarize_answer(answer: Optional[str]) -> str:
    return _clean_text(answer or "", limit=180)


def build_session_memory(
    db: Session,
    user_id: Optional[int],
    role: str,
    interview_type: str,
    session_limit: int = 4,
    answer_limit: int = 12,
) -> dict:
    empty = {
        "topics": [],
        "strengths": [],
        "improvements": [],
        "best_example": None,
        "weak_example": None,
        "summary_text": "",
    }
    if not user_id:
        return empty

    sessions = (
        db.query(InterviewSession)
        .filter(
            InterviewSession.user_id == user_id,
            InterviewSession.role == role,
            InterviewSession.interview_type == interview_type,
        )
        .order_by(InterviewSession.created_at.desc(), InterviewSession.id.desc())
        .limit(session_limit)
        .all()
    )
    if not sessions:
        return empty

    session_ids = [session.id for session in sessions]
    answers = (
        db.query(Answer)
        .filter(Answer.session_id.in_(session_ids))
        .order_by(Answer.created_at.desc(), Answer.id.desc())
        .limit(answer_limit)
        .all()
    )

    topics: list[str] = []
    strengths: list[str] = []
    improvements: list[str] = []
    best_example = None
    weak_example = None

    for session in sessions:
        topics.extend(_split_topics(session.topics))

    for answer in answers:
        strengths.extend(_load_json_list(answer.strengths))
        improvements.extend(_load_json_list(answer.improvements))

        if best_example is None and (answer.score or 0) >= 8:
            best_example = {
                "question": _clean_text(answer.question, limit=150),
                "answer": _summarize_answer(answer.answer),
                "score": round(float(answer.score or 0), 1),
            }
        if weak_example is None and (answer.score or 0) <= 6:
            weak_example = {
                "question": _clean_text(answer.question, limit=150),
                "answer": _summarize_answer(answer.answer),
                "score": round(float(answer.score or 0), 1),
            }

    avg_score = round(sum(float(session.avg_score or 0) for session in sessions) / max(len(sessions), 1), 1)
    top_topics = _top_unique(topics)
    top_strengths = _top_unique(strengths)
    top_improvements = _top_unique(improvements)

    parts = [
        f"PREVIOUS SAVED SESSIONS: {len(sessions)} prior {interview_type} session(s) for this role.",
        f"Recent average score: {avg_score}/10.",
    ]
    if top_topics:
        parts.append("Topics practised before: " + ", ".join(top_topics) + ".")
    if top_strengths:
        parts.append("Recurring strengths: " + ", ".join(top_strengths) + ".")
    if top_improvements:
        parts.append("Recurring gaps to target next: " + ", ".join(top_improvements) + ".")
    if best_example:
        parts.append(
            "Strong prior example to build from: "
            f"Q: {best_example['question']} | Candidate answer snapshot: {best_example['answer']}."
        )
    if weak_example:
        parts.append(
            "Weak prior example to revisit from a fresh angle: "
            f"Q: {weak_example['question']} | Candidate answer snapshot: {weak_example['answer']}."
        )
    parts.append(
        "Personalize the next question using this history: deepen one strength or revisit one weak area, "
        "but never repeat an older question verbatim."
    )

    return {
        "topics": top_topics,
        "strengths": top_strengths,
        "improvements": top_improvements,
        "best_example": best_example,
        "weak_example": weak_example,
        "summary_text": "\n".join(parts),
    }
