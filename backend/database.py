import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker, relationship, selectinload
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, JSON, func
from datetime import datetime
import uuid

# Database URL
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./vocalis.db")
# If a full async URL is provided use it, otherwise convert common sync URLs.
if DATABASE_URL.startswith("postgresql://"):
    ASYNC_DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
else:
    ASYNC_DATABASE_URL = DATABASE_URL

# Engine and sessionmaker will be created on demand in connect_db()
engine = None
AsyncSessionLocal = None

Base = declarative_base()

# Define SQLAlchemy models
class User(Base):
    __tablename__ = "user"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    firebaseUid = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    displayName = Column(String, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "firebaseUid": self.firebaseUid,
            "email": self.email,
            "displayName": self.displayName,
            "createdAt": self.createdAt.isoformat() if self.createdAt else None,
        }

class Session(Base):
    __tablename__ = "session"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    userId = Column(String, ForeignKey("user.id"), nullable=False)
    avgConfidence = Column(Float, nullable=False)
    segmentCount = Column(Integer, nullable=False)
    totalWords = Column(Integer, nullable=False)
    avgWpm = Column(Float, nullable=False)
    avgFillerRate = Column(Float, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow)

    segments = relationship("Segment", back_populates="session", lazy="selectin")

    def to_dict(self, include: dict | None = None):
        data = {
            "id": self.id,
            "userId": self.userId,
            "avgConfidence": self.avgConfidence,
            "segmentCount": self.segmentCount,
            "totalWords": self.totalWords,
            "avgWpm": self.avgWpm,
            "avgFillerRate": self.avgFillerRate,
            "createdAt": self.createdAt.isoformat() if self.createdAt else None,
        }
        if include and include.get("segments"):
            data["segments"] = [segment.to_dict() for segment in self.segments]
        return data

class Segment(Base):
    __tablename__ = "segment"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    sessionId = Column(String, ForeignKey("session.id"), nullable=False)
    transcript = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    wpm = Column(Float, nullable=False)
    fillerRate = Column(Float, nullable=False)
    fillerWords = Column(JSON, nullable=True, default=list)
    uniqueWordRatio = Column(Float, nullable=False)
    feedback = Column(String, nullable=True)

    session = relationship("Session", back_populates="segments")

    def to_dict(self):
        return {
            "id": self.id,
            "sessionId": self.sessionId,
            "transcript": self.transcript,
            "confidence": self.confidence,
            "wpm": self.wpm,
            "fillerRate": self.fillerRate,
            "fillerWords": self.fillerWords or [],
            "uniqueWordRatio": self.uniqueWordRatio,
            "feedback": self.feedback,
        }

class DB:
    """Wrapper class to mimic Prisma API with SQLAlchemy"""
    
    def __init__(self):
        # Expose both capitalized and lowercase attributes to match usage across the codebase
        self.User = UserService()
        self.Session = SessionService()
        self.Segment = SegmentService()

        # Lowercase aliases used in other modules
        self.user = self.User
        self.session = self.Session
        self.segment = self.Segment

class UserService:
    async def find_unique(self, where: dict, **kwargs):
        async with AsyncSessionLocal() as session:
            from sqlalchemy import select
            query = select(User)
            for key, value in where.items():
                query = query.where(getattr(User, key) == value)
            result = await session.execute(query)
            return result.scalar_one_or_none()
    
    async def create(self, data: dict):
        async with AsyncSessionLocal() as session:
            user = User(**data)
            session.add(user)
            await session.commit()
            await session.refresh(user)
            return user

class SessionService:
    async def find_unique(self, where: dict, **kwargs):
        async with AsyncSessionLocal() as session:
            from sqlalchemy import select
            query = select(Session)
            if kwargs.get("include") and kwargs["include"].get("segments"):
                query = query.options(selectinload(Session.segments))
            for key, value in where.items():
                query = query.where(getattr(Session, key) == value)
            result = await session.execute(query)
            return result.scalar_one_or_none()
    
    async def find_many(self, where: dict = None, **kwargs):
        async with AsyncSessionLocal() as session:
            from sqlalchemy import select
            query = select(Session)
            if kwargs.get("include") and kwargs["include"].get("segments"):
                query = query.options(selectinload(Session.segments))
            if where:
                for key, value in where.items():
                    query = query.where(getattr(Session, key) == value)
            order = kwargs.get("order")
            if order:
                for key, direction in order.items():
                    column = getattr(Session, key)
                    query = query.order_by(column.desc() if direction == "desc" else column)
            take = kwargs.get("take")
            if isinstance(take, int):
                query = query.limit(take)
            result = await session.execute(query)
            return result.scalars().all()
    
    async def create(self, data: dict):
        async with AsyncSessionLocal() as session:
            session_obj = Session(**data)
            session.add(session_obj)
            await session.commit()
            await session.refresh(session_obj)
            return session_obj

class SegmentService:
    async def create(self, data: dict):
        async with AsyncSessionLocal() as session:
            segment = Segment(**data)
            session.add(segment)
            await session.commit()
            await session.refresh(segment)
            return segment

# Global db instance
db = DB()

async def connect_db():
    """Initialize database tables (lazy - only creates if needed)"""
    global engine, AsyncSessionLocal
    if engine is None:
        effective_url = ASYNC_DATABASE_URL
        # If the URL targets Postgres async driver but asyncpg is missing, fall back to sqlite for local dev
        if "asyncpg" in (effective_url or "") or (effective_url or "").startswith("postgresql"):
            try:
                import asyncpg  # type: ignore
            except Exception:
                print("Warning: 'asyncpg' not installed or failed to import; falling back to sqlite for local development.")
                effective_url = "sqlite+aiosqlite:///./vocalis.db"

        engine = create_async_engine(effective_url, echo=False, future=True)
        AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
        except Exception as e:
            # If table creation fails, log and continue; connection may be unavailable locally
            print(f"Warning: could not create tables: {e}")

async def disconnect_db():
    """Close database connection"""
    try:
        await engine.dispose()
    except Exception as e:
        print(f"Warning: Error disconnecting from database: {e}")

def get_db() -> DB:
    return db
