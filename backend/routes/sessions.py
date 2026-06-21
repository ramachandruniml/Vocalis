import uuid
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from auth import get_current_user
from database import get_db
from llm_feedback import generate_interview_questions

router = APIRouter()


class SegmentInput(BaseModel):
    transcript: str
    confidence: float
    wpm: float
    fillerRate: float
    fillerWords: list[str] = []
    uniqueWordRatio: float
    feedback: str


class CreateSessionRequest(BaseModel):
    segments: list[SegmentInput] = Field(..., min_length=1)


class InterviewQuestionRequest(BaseModel):
    jobType: str = Field(..., min_length=2, max_length=120)
    experienceLevel: str = Field("mid-level", min_length=2, max_length=80)
    focusAreas: list[str] = Field(default_factory=list, max_length=8)
    count: int = Field(8, ge=3, le=12)

@router.post("/sessions")
async def create_session(payload: CreateSessionRequest, current_user=Depends(get_current_user)):
    db = get_db()
    segs = payload.segments

    avg_confidence  = sum(s.confidence  for s in segs) / len(segs)
    avg_wpm         = sum(s.wpm         for s in segs) / len(segs)
    avg_filler_rate = sum(s.fillerRate  for s in segs) / len(segs)
    total_words     = sum(int(s.wpm * (len(s.transcript.split()) / max(s.wpm, 1))) for s in segs)
    # simpler total_words: count transcript tokens directly
    total_words     = sum(len(s.transcript.split()) for s in segs)

    session_id = str(uuid.uuid4())
    session = await db.session.create({
        "id": session_id,
        "userId": current_user.id,
        "avgConfidence": avg_confidence,
        "segmentCount": len(segs),
        "totalWords": total_words,
        "avgWpm": avg_wpm,
        "avgFillerRate": avg_filler_rate,
    })

    for s in segs:
        await db.segment.create({
            "id": str(uuid.uuid4()),
            "sessionId": session_id,
            "transcript": s.transcript,
            "confidence": s.confidence,
            "wpm": s.wpm,
            "fillerRate": s.fillerRate,
            "fillerWords": s.fillerWords,
            "uniqueWordRatio": s.uniqueWordRatio,
            "feedback": s.feedback,
        })

    return {"id": session_id}


@router.get("/sessions")
async def get_sessions(current_user=Depends(get_current_user)):
    db = get_db()
    sessions = await db.session.find_many(
        where={"userId": current_user.id},
        order={"createdAt": "desc"},
        take=20,
        include={"segments": True},
    )
    return {"sessions": [s.to_dict(include={"segments": True}) for s in sessions]}

@router.get("/sessions/{session_id}")
async def get_session(session_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    session = await db.session.find_unique(
        where={"id": session_id},
        include={"segments": True},
    )
    if not session or session.userId != current_user.id:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Session not found")
    return session.to_dict(include={"segments": True})

@router.post("/interview/questions")
async def get_interview_questions(
    payload: InterviewQuestionRequest,
    current_user=Depends(get_current_user),
):
    questions = await generate_interview_questions(
        job_type=payload.jobType,
        experience_level=payload.experienceLevel,
        focus_areas=payload.focusAreas,
        count=payload.count,
    )
    return {
        "jobType": payload.jobType,
        "experienceLevel": payload.experienceLevel,
        "questions": questions,
    }
