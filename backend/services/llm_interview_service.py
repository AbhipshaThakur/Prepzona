import re
from typing import Any, List

from services.interview_engine import (
    evaluate_answer as evaluate_rule_answer,
    generate_question as generate_rule_question,
    similar_question,
)
from services.openrouter_service import call_openrouter, llm_enabled, parse_json_response
from services.prompt_service import build_question_prompt


def _clean_text(value: Any, default: str = "") -> str:
    if value is None:
        return default
    return " ".join(str(value).strip().split())


META_PHRASES = (
    "we need to ask",
    "ask about",
    "the candidate",
    "they previously",
    "let's ask",
    "question number",
    "current stage",
    "stage goal",
    "preferred question styles",
    "exactly one question",
    "natural continuation",
    "interviewer notes",
    "previous saved sessions",
)

QUESTION_STARTERS = (
    "tell me",
    "walk me through",
    "describe",
    "how would",
    "what would",
    "what part",
    "what checks",
    "what did",
    "how do",
    "why did",
    "if you",
    "imagine",
    "pick one",
    "which",
    "can you",
)


def _word_count(text: str) -> int:
    return len(_clean_text(text).split())


def _looks_like_meta(text: str) -> bool:
    lowered = _clean_text(text).lower()
    return any(phrase in lowered for phrase in META_PHRASES)


def _normalize_candidate_question(text: str) -> str:
    question = _clean_text(text)
    if ":" in question[:18]:
        prefix, suffix = question.split(":", 1)
        if prefix.lower().strip() in {"question", "next question", "interviewer"}:
            question = suffix.strip()
    return question.strip("\"'` ")


def _clean_question(raw_question: str) -> str:
    cleaned = _clean_text(raw_question)
    if not cleaned:
        raise Exception("LLM question was empty.")

    candidates: list[str] = []

    quoted = re.findall(r"\"([^\"]+\?)\"", cleaned)
    candidates.extend(quoted)

    for line in str(raw_question or "").splitlines():
        stripped = _normalize_candidate_question(line)
        if stripped:
            candidates.append(stripped)

    sentence_parts = re.split(r"(?<=[?.!])\s+", cleaned)
    candidates.extend(sentence_parts)

    if cleaned:
        candidates.append(cleaned)

    valid_candidates = []
    seen = set()
    for item in candidates:
        candidate = _normalize_candidate_question(item)
        key = candidate.lower()
        if not candidate or key in seen:
            continue
        seen.add(key)

        if len(candidate) < 12 or _looks_like_meta(candidate):
            continue
        if _word_count(candidate) > 50:
            continue
        lowered = candidate.lower()
        if candidate.endswith("?") or lowered.startswith(QUESTION_STARTERS):
            valid_candidates.append(candidate)

    if valid_candidates:
        return valid_candidates[-1]

    raise Exception("LLM output did not contain a valid interview question under 50 words.")


def _normalize_list(value: Any, fallback: List[str], limit: int = 3) -> List[str]:
    if isinstance(value, list):
        candidates = [_clean_text(item) for item in value]
    elif isinstance(value, str):
        candidates = [_clean_text(value)]
    else:
        candidates = []

    cleaned = []
    seen = set()
    for item in candidates:
        key = item.lower()
        if not item or key in seen:
            continue
        seen.add(key)
        cleaned.append(item)

    if cleaned:
        return cleaned[:limit]
    return fallback[:limit]


def _normalize_score(value: Any, fallback: int) -> int:
    try:
        score = int(round(float(value)))
    except (TypeError, ValueError):
        score = fallback
    return max(1, min(10, score))


def _normalize_evaluation_result(
    payload: Any,
    role: str,
    question: str,
    answer: str,
    interview_type: str,
) -> dict:
    fallback = evaluate_rule_answer(role, question, answer, interview_type)
    payload = payload if isinstance(payload, dict) else {}

    return {
        "question": question,
        "answer": answer,
        "score": _normalize_score(payload.get("score"), fallback["score"]),
        "feedback": _clean_text(payload.get("feedback"), fallback["feedback"]),
        "strengths": _normalize_list(payload.get("strengths"), fallback["strengths"]),
        "improvements": _normalize_list(payload.get("improvements"), fallback["improvements"]),
        "sample_answer": _clean_text(
            payload.get("sample_answer") or payload.get("ideal_answer_hint"),
            fallback["sample_answer"],
        ),
        "follow_up_question": _clean_text(
            payload.get("follow_up_question"),
            fallback["follow_up_question"] or "",
        ),
        "source": "llm",
    }


def _build_answer_evaluation_messages(
    role: str,
    question: str,
    answer: str,
    interview_type: str,
) -> list[dict]:
    system = f"""You are a strict but helpful interviewer evaluating a {interview_type} interview answer for a {role} candidate.

Return ONLY valid JSON with this exact shape:
{{
  "score": 1-10,
  "feedback": "2-4 sentences grounded in the actual answer.",
  "strengths": ["specific strength", "specific strength"],
  "improvements": ["specific improvement", "specific improvement"],
  "sample_answer": "Write a stronger example answer tailored to this question.",
  "follow_up_question": "Ask one natural next question based on what the candidate said."
}}

Scoring rules:
- 1-3: weak, vague, or incorrect
- 4-6: partially correct but shallow
- 7-8: good and practical
- 9-10: excellent, clear, and experience-backed

Never add markdown fences or commentary outside the JSON."""

    user = f"""QUESTION:
{question}

CANDIDATE ANSWER:
{answer}

Evaluate this answer honestly."""

    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]


def _build_session_evaluation_messages(
    role: str,
    interview_type: str,
    answers: list[dict],
) -> list[dict]:
    transcript_parts = []
    for index, item in enumerate(answers, start=1):
        transcript_parts.append(
            f"Question {index}: {item.get('question', '')}\n"
            f"Answer {index}: {item.get('answer', '')}"
        )

    transcript = "\n\n".join(transcript_parts)
    system = f"""You are a senior interviewer evaluating a full {interview_type} interview for a {role} candidate.

Return ONLY valid JSON with this exact shape:
{{
  "results": [
    {{
      "score": 1-10,
      "feedback": "2-4 sentences grounded in the actual answer.",
      "strengths": ["specific strength", "specific strength"],
      "improvements": ["specific improvement", "specific improvement"],
      "sample_answer": "Write a stronger example answer tailored to this question.",
      "follow_up_question": "Ask one natural next question based on what the candidate said."
    }}
  ]
}}

Important rules:
- Return exactly one result per question, in the same order as the transcript.
- Score each answer independently.
- Keep the language practical and specific to what the candidate said.
- Never add markdown fences or commentary outside the JSON."""

    user = f"Evaluate this interview session:\n\n{transcript}"

    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]


def generate_question_with_llm(
    role: str,
    interview_type: str,
    experience: str,
    notes: str,
    resume_text: str,
    asked_questions: list[str],
    previous_question: str = "",
    previous_answer: str = "",
    question_number: int = 1,
    session_memory_text: str = "",
) -> str:
    if not llm_enabled():
        raise Exception("LLM is not configured.")

    messages = build_question_prompt(
        role=role,
        interview_type=interview_type,
        experience=experience,
        notes=notes,
        resume_text=resume_text,
        asked_questions=asked_questions,
        previous_question=previous_question,
        previous_answer=previous_answer,
        question_number=question_number,
        session_memory_text=session_memory_text,
    )
    question = _clean_question(call_openrouter(messages, max_tokens=180, temperature=0.55))

    if similar_question(question, asked_questions or []):
        raise Exception("LLM returned a repeated question.")

    return question


def evaluate_answer_with_llm(
    role: str,
    question: str,
    answer: str,
    interview_type: str = "technical",
) -> dict:
    if not llm_enabled():
        raise Exception("LLM is not configured.")

    messages = _build_answer_evaluation_messages(role, question, answer, interview_type)
    payload = parse_json_response(call_openrouter(messages, max_tokens=650, temperature=0.15))
    return _normalize_evaluation_result(payload, role, question, answer, interview_type)


def evaluate_session_with_llm(
    role: str,
    interview_type: str,
    answers: list[dict],
) -> list[dict]:
    if not llm_enabled():
        raise Exception("LLM is not configured.")
    if not answers:
        return []

    messages = _build_session_evaluation_messages(role, interview_type, answers)
    payload = parse_json_response(
        call_openrouter(
            messages,
            max_tokens=min(2200, 700 + len(answers) * 250),
            temperature=0.15,
        )
    )

    results = payload.get("results") if isinstance(payload, dict) else None
    if not isinstance(results, list) or len(results) != len(answers):
        raise Exception("LLM returned an invalid number of evaluation results.")

    normalized = []
    for source_item, original_item in zip(results, answers):
        normalized.append(
            _normalize_evaluation_result(
                source_item,
                role,
                original_item.get("question", ""),
                original_item.get("answer", ""),
                interview_type,
            )
        )
    return normalized


def generate_question_with_fallback(
    role: str,
    interview_type: str,
    experience: str,
    notes: str,
    resume_text: str,
    asked_questions: list[str],
    previous_question: str = "",
    previous_answer: str = "",
    question_number: int = 1,
    session_memory: dict | None = None,
) -> dict:
    try:
        return {
            "question": generate_question_with_llm(
                role=role,
                interview_type=interview_type,
                experience=experience,
                notes=notes,
                resume_text=resume_text,
                asked_questions=asked_questions,
                previous_question=previous_question,
                previous_answer=previous_answer,
                question_number=question_number,
                session_memory_text=(session_memory or {}).get("summary_text", ""),
            ),
            "source": "llm",
        }
    except Exception as exc:
        print("LLM question fallback:", exc)
        return {
            "question": generate_rule_question(
                role=role,
                interview_type=interview_type,
                experience=experience,
                notes=notes,
                resume_text=resume_text,
                asked_questions=asked_questions,
                previous_question=previous_question,
                previous_answer=previous_answer,
                question_number=question_number,
                session_memory=session_memory,
            ),
            "source": "fallback",
        }


def evaluate_answer_with_fallback(
    role: str,
    question: str,
    answer: str,
    interview_type: str = "technical",
) -> dict:
    try:
        return evaluate_answer_with_llm(role, question, answer, interview_type)
    except Exception as exc:
        print("LLM single-answer fallback:", exc)
        result = evaluate_rule_answer(role, question, answer, interview_type)
        result["question"] = question
        result["answer"] = answer
        result["source"] = "fallback"
        return result


def evaluate_session_with_fallback(
    role: str,
    interview_type: str,
    answers: list[dict],
) -> list[dict]:
    try:
        return evaluate_session_with_llm(role, interview_type, answers)
    except Exception as exc:
        print("LLM session fallback:", exc)
        results = []
        for item in answers:
            result = evaluate_rule_answer(
                role,
                item.get("question", ""),
                item.get("answer", ""),
                interview_type,
            )
            result["question"] = item.get("question", "")
            result["answer"] = item.get("answer", "")
            result["source"] = "fallback"
            results.append(result)
        return results
