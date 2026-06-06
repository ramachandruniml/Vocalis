from fastapi import Depends, HTTPException, Header
from firebase_admin_setup import verify_firebase_token
from database import get_db

async def get_current_user(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid auth header")
    token = authorization.split("Bearer ")[1]
    try:
        decoded = verify_firebase_token(token)
        uid = decoded["uid"]
        email = decoded.get("email", "")

        # Auto-create user in PostgreSQL on first login
        db = get_db()
        user = await db.user.find_unique(where={"firebaseUid": uid})
        if not user:
            user = await db.user.create(data={
                "firebaseUid": uid,
                "email": email,
                "displayName": decoded.get("name", ""),
            })
        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid or expired token")