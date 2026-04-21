"""
question_fetcher.py — fetches real interview questions from public APIs
to give the AI grounding in what real interviewers actually ask.

Place in: backend/services/question_fetcher.py
"""

import requests
import random
from functools import lru_cache


# ── GitHub Jobs / Stack Overflow-style public question APIs ─────
# We use the free Open Trivia DB for general CS, and scrape
# a curated GitHub repo's raw JSON for role-specific questions.

ROLE_QUESTION_SOURCES = {
    # GitHub raw JSONs from public interview question repos
    "react":       "https://raw.githubusercontent.com/sudheerj/reactjs-interview-questions/master/README.md",
    "javascript":  "https://raw.githubusercontent.com/sudheerj/javascript-interview-questions/master/README.md",
    "python":      "https://raw.githubusercontent.com/learning-zone/python-basics/master/interview-questions.md",
    "sql":         "https://raw.githubusercontent.com/learning-zone/sql-interview-questions/master/README.md",
    "system design": "https://raw.githubusercontent.com/checkcheckzz/system-design-interview/master/README.md",
}

@lru_cache(maxsize=32)
def fetch_questions_for_role(role: str, count: int = 10) -> list[str]:
    """
    Fetch real interview questions from public GitHub repos.
    Returns a list of question strings relevant to the role.
    Cached so we don't hit the network on every request.
    """
    role_lower = role.lower()

    # Find the best matching source
    source_url = None
    for keyword, url in ROLE_QUESTION_SOURCES.items():
        if keyword in role_lower:
            source_url = url
            break

    if not source_url:
        return []

    try:
        resp = requests.get(source_url, timeout=8)
        if resp.status_code != 200:
            return []

        text = resp.text
        # Extract lines that look like questions (end with ?)
        lines = text.split("\n")
        questions = []
        for line in lines:
            line = line.strip()
            # Remove markdown formatting
            line = line.lstrip("#").lstrip("*").lstrip("-").lstrip("0123456789.").strip()
            if line.endswith("?") and 20 < len(line) < 200:
                questions.append(line)

        # Deduplicate and shuffle
        questions = list(dict.fromkeys(questions))
        random.shuffle(questions)
        return questions[:count]

    except Exception:
        return []


def get_question_context(role: str, interview_type: str) -> str:
    """
    Returns a string of real questions to inject into the AI prompt
    as grounding context — so the AI knows what real interviewers ask.
    """
    if interview_type == "hr":
        # HR questions are universal — use hardcoded real ones
        hr_questions = [
            "Tell me about a time you handled a conflict with a colleague.",
            "Describe a situation where you had to meet a tight deadline.",
            "Where do you see yourself in 5 years?",
            "What's your biggest professional weakness and how are you addressing it?",
            "Tell me about a project you're most proud of.",
            "How do you handle feedback and criticism?",
            "Describe a time you showed leadership without a formal title.",
            "Why do you want to work here?",
            "How do you prioritise when you have multiple urgent tasks?",
            "Tell me about a time you failed and what you learned.",
        ]
        random.shuffle(hr_questions)
        sample = hr_questions[:5]
    else:
        sample = fetch_questions_for_role(role)

    if not sample:
        return ""

    lines = "\n".join(f"- {q}" for q in sample)
    return (
        f"\n\nREAL INTERVIEW QUESTIONS (for inspiration only — do NOT copy verbatim, "
        f"generate your own variation based on the candidate's context):\n{lines}"
    )