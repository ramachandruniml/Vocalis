import os
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

llm = ChatOpenAI(
    model="gpt-4o",
    temperature=0.7,
    api_key=os.environ["OPENAI_API_KEY"],
)

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
    chain = PROMPT | llm
    response = await chain.ainvoke({
        "transcript": transcript,
        **features,
    })
    return response.content