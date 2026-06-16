from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from auth import get_current_user
from database import get_db
from llm_feedback import generate_interview_questions

router = APIRouter()

class InterviewQuestionRequest(BaseModel):
    jobType: str = Field(..., min_length=2, max_length=120)
    experienceLevel: str = Field("mid-level", min_length=2, max_length=80)
    focusAreas: list[str] = Field(default_factory=list, max_length=8)
    count: int = Field(8, ge=3, le=12)

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
