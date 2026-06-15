from dotenv import load_dotenv
load_dotenv()

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from .database import connect_db, disconnect_db
from .firebase_admin_setup import init_firebase
from .routes.sessions import router as sessions_router
from .websocket_handler import interview_socket

limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_firebase()
    await connect_db()
    yield
    await disconnect_db()

app = FastAPI(lifespan=lifespan)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sessions_router, prefix="/api", tags=["sessions"])
app.add_api_websocket_route("/ws/interview", interview_socket)

@app.get("/health")
async def health():
    return {"status": "ok"}