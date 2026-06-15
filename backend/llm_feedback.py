import os
import json
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

llm = None

def get_llm():
    global llm
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return None
    if llm is None:
        llm = ChatOpenAI(
            model=os.environ.get("OPENAI_MODEL", "gpt-4o"),
            temperature=0.7,
            api_key=api_key,
        )
    return llm

PROMPT = ChatPromptTemplate.from_template("""
You are a rigorous technical interviewer at a top-tier tech company.

Candidate response: {transcript}
Words per minute: {wpm}
Filler word rate: {filler_rate}
Vocabulary richness: {unique_word_ratio}
Filler words used: {filler_words}

Respond with:
1. One sharp behavioral follow-up question
2. One sentence of direct coaching on their delivery

Be concise (under 80 words). Be direct, not encouraging.
""")

async def get_llm_feedback(transcript: str, features: dict) -> str:
    model = get_llm()
    if model is None:
        return "Add more specific examples, keep your answer structured, and reduce filler words in the next response."
    chain = PROMPT | model
    response = await chain.ainvoke({
        "transcript": transcript,
        **features,
    })
    return response.content

QUESTION_PROMPT = ChatPromptTemplate.from_template("""
You are an expert interview coach. Generate interview practice questions for this role.

Role: {job_type}
Experience level: {experience_level}
Focus areas: {focus_areas}

Return only a JSON array of exactly {count} strings. Mix behavioral, role-specific, situational, and problem-solving questions. Do not include markdown.
""")

FALLBACK_QUESTIONS = [
    "Tell me about yourself and why this role is a strong fit for you.",
    "Describe a project or responsibility from your background that best matches this job.",
    "Tell me about a time you had to learn something quickly to solve a problem.",
    "Walk me through how you would approach your first 30 days in this role.",
    "Describe a difficult stakeholder, customer, or teammate situation and how you handled it.",
    "What metrics or signals would you use to know you are succeeding in this job?",
    "Tell me about a mistake you made at work and what changed afterward.",
    "Why are you interested in this company, industry, or type of work?",
]

async def generate_interview_questions(
    job_type: str,
    experience_level: str = "mid-level",
    focus_areas: list[str] | None = None,
    count: int = 8,
) -> list[str]:
    focus = focus_areas or []
    model = get_llm()
    if model is None:
        role = job_type.strip() or "this role"
        return [
            question.replace("this role", role).replace("this job", role)
            for question in FALLBACK_QUESTIONS[:count]
        ]

    chain = QUESTION_PROMPT | model
    response = await chain.ainvoke({
        "job_type": job_type,
        "experience_level": experience_level,
        "focus_areas": ", ".join(focus) if focus else "general interview readiness",
        "count": count,
    })

    try:
        parsed = json.loads(response.content)
    except json.JSONDecodeError:
        parsed = []

    questions = [q.strip() for q in parsed if isinstance(q, str) and q.strip()]
    return questions[:count] or FALLBACK_QUESTIONS[:count]
