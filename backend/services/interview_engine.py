import re
from difflib import SequenceMatcher

from services.prompt_service import build_interview_plan


COMMON_WORDS = {
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "how", "i",
    "in", "is", "it", "my", "of", "on", "or", "our", "the", "their", "there",
    "this", "to", "was", "we", "with", "you", "your",
}

ACTION_PHRASES = [
    "i built", "i created", "i designed", "i implemented", "i led", "i handled",
    "i owned", "i fixed", "i improved", "i wrote", "i tested", "i debugged",
    "i analyzed", "i delivered", "i coordinated", "i proposed", "i decided",
]

RESULT_WORDS = [
    "result", "outcome", "impact", "improved", "reduced", "increased", "saved",
    "learned", "delivered", "launched", "shipped", "faster", "better",
]

STRUCTURE_WORDS = [
    "first", "then", "next", "finally", "because", "therefore", "after", "before",
    "during", "so that",
]

TECH_WORDS = {
    "api", "backend", "cache", "component", "css", "database", "debug", "deploy",
    "docker", "endpoint", "frontend", "integration", "javascript", "latency",
    "microservice", "monitoring", "node", "performance", "postgres", "python",
    "query", "react", "redis", "scalable", "schema", "server", "sql", "system",
    "test", "testing", "typescript", "ui", "ux",
}

KNOWN_SKILLS = [
    "react", "next", "node", "express", "python", "django", "flask", "fastapi",
    "sql", "mysql", "postgres", "mongodb", "redis", "aws", "docker", "kubernetes",
    "javascript", "typescript", "java", "spring", "pandas", "numpy", "power bi",
    "tableau", "excel", "machine learning", "nlp", "data analysis", "rest api",
]


def normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]+", " ", (text or "").lower())).strip()


def extract_words(text: str) -> list[str]:
    return re.findall(r"[a-z0-9+#./-]+", (text or "").lower())


def title_case_phrase(text: str) -> str:
    return " ".join(word.capitalize() for word in extract_words(text)[:6])


def extract_note_terms(notes: str) -> list[str]:
    terms = []
    for chunk in re.split(r"[,/\n|]+", notes or ""):
        clean = chunk.strip()
        if clean and clean.lower() not in COMMON_WORDS:
            terms.append(clean)

    unique = []
    seen = set()
    for term in terms:
        key = term.lower()
        if key in seen:
            continue
        seen.add(key)
        unique.append(term)
    return unique[:4]


def extract_focus_terms(role: str, notes: str, resume_text: str) -> list[str]:
    focus_terms = []

    focus_terms.extend(extract_note_terms(notes))

    role_words = [
        word for word in re.findall(r"[a-zA-Z0-9+#.-]+", role or "")
        if word.lower() not in COMMON_WORDS and len(word) > 2
    ]
    focus_terms.extend(role_words[:4])

    resume_lower = (resume_text or "").lower()
    for skill in KNOWN_SKILLS:
        if skill in resume_lower:
            focus_terms.append(skill)

    unique = []
    seen = set()
    for item in focus_terms:
        key = item.lower()
        if key in seen:
            continue
        seen.add(key)
        unique.append(item)
    return unique[:6]


def similar_question(candidate: str, asked_questions: list[str]) -> bool:
    normalized_candidate = normalize_text(candidate)
    for asked in asked_questions:
        normalized_asked = normalize_text(asked)
        if not normalized_asked:
            continue
        if normalized_candidate == normalized_asked:
            return True
        if normalized_candidate in normalized_asked or normalized_asked in normalized_candidate:
            return True
        if SequenceMatcher(None, normalized_candidate, normalized_asked).ratio() > 0.84:
            return True
    return False


def derive_resume_question(role: str, focus_terms: list[str], resume_text: str) -> str | None:
    if not resume_text.strip():
        return None
    if focus_terms:
        joined = " and ".join(focus_terms[:2])
        return (
            f"I noticed {joined} in your background. Tell me about a project where you used it "
            f"and what impact your work had."
        )
    return f"Tell me about the strongest project on your resume and what you personally owned in that work."


def describe_experience(experience: str) -> str:
    if experience == "0":
        return "fresher level"
    if experience in {"8", "10", "15"}:
        return f"{experience}+ years of experience"
    if experience == "1":
        return "1 year of experience"
    return f"{experience} years of experience"


def pick_follow_up_anchor(question: str, answer: str) -> str:
    question_terms = [
        term for term in re.findall(r"[A-Za-z0-9+#.-]+", question or "")
        if term.lower() not in COMMON_WORDS and len(term) > 2
    ]
    answer_terms = [
        term for term in re.findall(r"[A-Za-z0-9+#./-]+", answer or "")
        if term.lower() not in COMMON_WORDS and len(term) > 2
    ]

    for term in answer_terms:
        if term.lower() in TECH_WORDS:
            return term
    for term in question_terms:
        if term.lower() not in COMMON_WORDS:
            return term
    return "that work"


def pick_session_memory_anchor(session_memory: dict | None, prefer: str = "weak") -> str:
    session_memory = session_memory or {}
    examples = []
    if prefer == "weak":
        examples.extend([session_memory.get("weak_example"), session_memory.get("best_example")])
    else:
        examples.extend([session_memory.get("best_example"), session_memory.get("weak_example")])

    for example in examples:
        if not isinstance(example, dict):
            continue
        anchor = pick_follow_up_anchor(example.get("question", ""), example.get("answer", ""))
        if anchor and anchor != "that work":
            return anchor

    topics = session_memory.get("topics") or []
    if topics:
        return topics[0]
    return ""


def should_follow_up(previous_answer: str, interview_type: str, question_number: int) -> bool:
    words = extract_words(previous_answer)
    word_count = len(words)
    answer_lower = (previous_answer or "").lower()
    has_metric = bool(re.search(r"\b\d+(\.\d+)?(%|x|ms|s|sec|seconds|minutes|hours|users|records|rows)\b", answer_lower))
    has_action = any(phrase in answer_lower for phrase in ACTION_PHRASES)
    has_result = any(word in answer_lower for word in RESULT_WORDS)
    has_structure = any(word in answer_lower for word in STRUCTURE_WORDS)
    tech_hits = sum(1 for word in words if word in TECH_WORDS)

    if word_count < 18:
        return True
    if question_number >= 5:
        return False
    if interview_type.lower() == "hr":
        return not (has_action and has_result and word_count >= 35)
    return tech_hits < 3 or not has_structure or not has_metric


def build_question_bank(
    role: str,
    interview_type: str,
    experience: str,
    notes: str,
    resume_text: str,
    question_number: int = 1,
    session_memory: dict | None = None,
) -> list[str]:
    session_memory = session_memory or {}
    focus_terms = extract_focus_terms(role, notes, resume_text)
    note_terms = extract_note_terms(notes)
    resume_question = derive_resume_question(role, focus_terms, resume_text)
    focus_phrase = ", ".join((note_terms or focus_terms)[:2]) if (note_terms or focus_terms) else role
    experience_phrase = describe_experience(experience)
    candidate_level = "early-career" if experience == "0" else experience_phrase
    stage = build_interview_plan(interview_type.lower(), question_number)["stage"]
    weak_anchor = pick_session_memory_anchor(session_memory, prefer="weak")
    strong_anchor = pick_session_memory_anchor(session_memory, prefer="strong")
    memory_topics = session_memory.get("topics") or []
    memory_focus = ", ".join(memory_topics[:2]) if memory_topics else ""

    if interview_type.lower() == "hr":
        bank = []
        if stage == "opening":
            bank.extend([
                f"Tell me about yourself and why your background as a {candidate_level} {role} candidate fits this role.",
                f"Why does this {role} opportunity make sense for you at your current level of {candidate_level}?",
                f"What kind of impact are you ready to make in your next {role} role given your {candidate_level} background?",
            ])
            if strong_anchor:
                bank.append(
                    f"What experience best shows your strength in {strong_anchor}, and what did you personally contribute in that situation?"
                )
        elif stage == "behavior":
            bank.extend([
                f"Describe a time you handled disagreement with a teammate or stakeholder.",
                f"Tell me about feedback you received and how you applied it.",
                f"Tell me about a situation where clear communication changed the outcome of a project or task.",
            ])
            if weak_anchor:
                bank.append(
                    f"Tell me about a real situation where you had to handle {weak_anchor} with a teammate or stakeholder. What did you do?"
                )
        elif stage == "ownership":
            bank.extend([
                f"Tell me about a challenging situation where you had to stay calm under pressure.",
                f"What is one mistake you made recently, and what changed in your approach after that?",
                f"Describe a time you had to prioritise competing tasks with limited time.",
            ])
            if memory_focus:
                bank.append(
                    f"In work related to {memory_focus}, tell me about a moment where you had to take ownership without waiting for instructions."
                )
        elif stage == "judgment":
            bank.extend([
                f"Imagine two urgent priorities land on your desk at once. How would you decide what to handle first and how would you communicate it?",
                f"Tell me about a time you had to make a difficult judgment call with incomplete information.",
                f"Describe a time you influenced someone without having formal authority.",
            ])
            if weak_anchor:
                bank.append(
                    f"If you faced another situation involving {weak_anchor} tomorrow, what would you do first and why?"
                )
        else:
            bank.extend([
                f"What strength would you bring first in a {role} interview process?",
                f"Why should we hire you for this {role} position over similar candidates?",
                f"What have you learned most about how you work over the last few projects or experiences?",
            ])
            if strong_anchor:
                bank.append(
                    f"Looking back at your work around {strong_anchor}, what would you do even better in your next role?"
                )

        if resume_question:
            bank.insert(1, resume_question)
        if notes.strip():
            bank.insert(2, f"You chose {focus_phrase} as a focus area. Tell me about a real situation where that strength mattered.")
        if experience != "0":
            bank.insert(3, f"Looking at your {experience_phrase}, which part of your background best prepares you for this {role} round?")
        return bank

    technical_bank = []
    if stage == "opening":
        technical_bank.extend([
            f"Walk me through the {role} project that best represents your current level of {candidate_level}, and tell me the hardest problem you solved in it.",
            f"For this {role} round, which technical decision from your {candidate_level} background are you most confident discussing?",
            f"What part of your recent work best shows that you can perform as a {role} today?",
        ])
        if strong_anchor:
            technical_bank.append(
                f"Let's start with {strong_anchor}. Tell me about a project where you owned that area end to end and what mattered most technically."
            )
    elif stage == "implementation":
        technical_bank.extend([
            f"Tell me about a bug or production issue you debugged. How did you find the root cause?",
            f"Pick one feature you built recently and explain how it works under the hood from request to result.",
            f"Tell me about a time you had to inspect logs, metrics, or failing behaviour to understand what was really going wrong.",
        ])
        if weak_anchor:
            technical_bank.append(
                f"Walk me through the last time you had to debug or improve something around {weak_anchor}. What exactly did you check first?"
            )
    elif stage == "tradeoffs":
        technical_bank.extend([
            f"Tell me about a design or implementation trade-off you had to make recently.",
            f"If your current solution suddenly had 10x more load, what would you check first?",
            f"Imagine you had to redesign one part of your current stack for better scale or reliability. What would you change and why?",
        ])
        if memory_focus:
            technical_bank.append(
                f"In work related to {memory_focus}, what was the hardest engineering trade-off you had to make, and why did you choose that path?"
            )
    elif stage == "quality":
        technical_bank.extend([
            f"How do you test your work before you ship it in a {role} role?",
            f"Describe a performance bottleneck you fixed. What changed after your solution?",
            f"What checks, monitoring, or safeguards do you rely on to make sure a change is safe in production?",
        ])
        if weak_anchor:
            technical_bank.append(
                f"How would you validate that your work around {weak_anchor} is reliable before release?"
            )
    else:
        technical_bank.extend([
            f"What part of {focus_phrase} are you strongest at, and how have you proved it in real work?",
            f"Looking back at a project you built, what would you redesign today and why?",
            f"What did your last major technical challenge teach you about how you engineer systems or features?",
        ])
        if strong_anchor:
            technical_bank.append(
                f"Now that you've had more time to reflect, what would you improve in the way you handled {strong_anchor}?"
            )

    if notes.strip():
        technical_bank.insert(
            1,
            f"You selected {focus_phrase}. Walk me through a real project where you used it and what you personally owned.",
        )
    if experience == "0":
        technical_bank.insert(
            1,
            f"As a fresher, tell me about a project or internship where you applied {focus_phrase} in practice.",
        )
    else:
        technical_bank.insert(
            2,
            f"Across your experience {experience_phrase}, which project best shows your readiness for a {role} interview?",
        )
    if resume_question:
        technical_bank.insert(1, resume_question)
    return technical_bank


def build_follow_up(previous_question: str, previous_answer: str, interview_type: str) -> str | None:
    answer_lower = (previous_answer or "").lower()
    word_count = len(extract_words(previous_answer))
    has_metric = bool(re.search(r"\b\d+(\.\d+)?(%|x|ms|s|sec|seconds|minutes|hours|users|records|rows)\b", answer_lower))
    has_result = any(word in answer_lower for word in RESULT_WORDS)
    has_action = any(phrase in answer_lower for phrase in ACTION_PHRASES)
    has_structure = any(word in answer_lower for word in STRUCTURE_WORDS)
    technical_hits = sum(1 for word in extract_words(previous_answer) if word in TECH_WORDS)
    anchor = pick_follow_up_anchor(previous_question, previous_answer)

    if word_count < 18:
        return f"Can you make that more specific with one concrete example of how you used {anchor} in real work?"
    if interview_type.lower() == "hr":
        if not has_action:
            return "What exactly did you do personally in that situation?"
        if not has_result:
            return "What was the final outcome, and what did you learn from it?"
        if not has_metric:
            return "How did you know your approach worked, and what changed because of it?"
        return "If that situation happened again today, what would you do differently?"

    if technical_hits < 3:
        return f"What exact tools, technologies, or implementation steps did you use around {anchor}?"
    if not has_metric:
        return f"How did you measure whether your work on {anchor} was actually successful?"
    if not has_structure:
        return "Can you walk me through your approach step by step from problem to solution?"
    return "What trade-offs did you consider, and why was that the right choice?"


def build_sample_answer(
    role: str,
    question: str,
    answer: str,
    interview_type: str = "technical",
) -> str:
    anchor = pick_follow_up_anchor(question, answer)
    anchor_phrase = title_case_phrase(anchor) or "that project"

    if interview_type.lower() == "hr":
        return (
            f"A stronger answer could be: In one situation relevant to my {role} background, "
            f"I was responsible for a specific problem involving {anchor_phrase}. "
            "I explained the context, the exact action I took personally, and the result that followed. "
            "For example, I coordinated the response, made the key decision, and improved the outcome in a measurable way. "
            "I would close by sharing what I learned and what I would repeat next time."
        )

    return (
        f"A stronger answer could be: In one {role} project, I used {anchor_phrase} to solve a real problem. "
        "My responsibility was to identify the issue, implement the fix myself, and verify the result. "
        "For example, I can explain the stack I used, the exact change I made, and a measurable outcome such as faster performance, fewer failures, or smoother delivery. "
        "I would finish by stating the trade-off I considered and why that approach was the right decision."
    )


def generate_question(
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
) -> str:
    asked_questions = asked_questions or []

    if previous_question.strip() and previous_answer.strip() and should_follow_up(previous_answer, interview_type, question_number):
        follow_up = build_follow_up(previous_question, previous_answer, interview_type)
        if follow_up and not similar_question(follow_up, asked_questions):
            return follow_up

    for candidate in build_question_bank(
        role,
        interview_type,
        experience,
        notes,
        resume_text,
        question_number=question_number,
        session_memory=session_memory,
    ):
        if not similar_question(candidate, asked_questions):
            return candidate

    if interview_type.lower() == "hr":
        return f"Tell me about a recent situation that best shows how you work as a {role} candidate."
    return f"Tell me about a real technical challenge you solved recently as a {role} candidate."


def evaluate_answer(role: str, question: str, answer: str, interview_type: str = "technical") -> dict:
    answer_lower = (answer or "").lower()
    answer_words = extract_words(answer)
    question_words = [word for word in extract_words(question) if word not in COMMON_WORDS]
    word_count = len(answer_words)

    overlap = len(set(question_words) & set(answer_words))
    has_metric = bool(re.search(r"\b\d+(\.\d+)?(%|x|ms|s|sec|seconds|minutes|hours|users|records|rows)\b", answer_lower))
    has_action = any(phrase in answer_lower for phrase in ACTION_PHRASES)
    has_result = any(word in answer_lower for word in RESULT_WORDS)
    has_structure = any(word in answer_lower for word in STRUCTURE_WORDS)
    tech_hits = sum(1 for word in answer_words if word in TECH_WORDS)
    filler_hits = sum(answer_words.count(word) for word in ["um", "uh", "like", "basically", "actually"])

    clarity = 2 if word_count >= 45 else 1 if word_count >= 22 else 0
    relevance = 2 if overlap >= 2 else 1 if overlap >= 1 else 0
    specificity = 2 if has_metric and has_result else 1 if has_metric or has_result else 0
    structure = 2 if has_action and has_structure else 1 if has_action else 0

    if interview_type.lower() == "hr":
        depth = 2 if has_action and has_result else 1 if has_action or has_result else 0
    else:
        depth = 2 if tech_hits >= 4 else 1 if tech_hits >= 2 else 0

    raw_score = clarity + relevance + specificity + structure + depth
    score = max(1, min(10, raw_score))
    if filler_hits >= 4 and score > 1:
        score -= 1

    strengths = []
    improvements = []

    if clarity == 2:
        strengths.append("Your answer had enough detail to sound complete.")
    else:
        improvements.append("Make the answer fuller by adding a clearer middle and ending.")

    if relevance >= 1:
        strengths.append("You stayed on the question instead of drifting away from the topic.")
    else:
        improvements.append("Address the exact question more directly before adding extra context.")

    if specificity >= 1:
        strengths.append("You used concrete evidence instead of keeping the answer too generic.")
    else:
        improvements.append("Add one specific example, metric, or measurable outcome.")

    if structure >= 1:
        strengths.append("Your answer showed ownership and some structure.")
    else:
        improvements.append("Use a cleaner structure: context, your action, and the result.")

    if interview_type.lower() == "hr":
        if depth >= 1:
            strengths.append("The answer sounds personal and grounded in real experience.")
        else:
            improvements.append("Explain what you personally did and what changed after your action.")
    else:
        if depth >= 1:
            strengths.append("You included technical substance instead of staying high level.")
        else:
            improvements.append("Mention the exact tools, systems, or technical decisions you used.")

    strengths = strengths[:3]
    improvements = improvements[:3]

    if score >= 8:
        feedback = "This answer feels credible and grounded. It has enough detail to sound like real interview evidence."
    elif score >= 6:
        feedback = "This answer is on the right track, but it still needs more specifics or stronger structure to feel interview-ready."
    else:
        feedback = "This answer feels too generic right now. Add a real example, your exact actions, and a clear outcome."

    return {
        "score": score,
        "feedback": feedback,
        "strengths": strengths,
        "improvements": improvements,
        "sample_answer": build_sample_answer(role, question, answer, interview_type),
        "follow_up_question": build_follow_up(question, answer, interview_type),
    }
