from fastapi import APIRouter, Depends
from auth import get_current_user
from database import get_db

router = APIRouter()

@router.get("/sessions")
async def get_sessions(current_user=Depends(get_current_user)):
    db = get_db()
    sessions = await db.session.find_many(
        where={"userId": current_user.id},
        order={"createdAt": "desc"},
        take=20,
        include={"segments": True},
    )
    return {"sessions": [s.dict() for s in sessions]}

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
    return session.dict()