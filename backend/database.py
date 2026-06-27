import os
import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, JSON, String
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, relationship, selectinload, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./vocalis.db")
if DATABASE_URL.startswith("postgresql://"):
    ASYNC_DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
else:
    ASYNC_DATABASE_URL = DATABASE_URL

engine = None
AsyncSessionLocal = None
Base = declarative_base()


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
    def __init__(self):
        self.user = UserService()
        self.session = SessionService()
        self.segment = SegmentService()


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
            if kwargs.get("include", {}).get("segments"):
                query = query.options(selectinload(Session.segments))
            for key, value in where.items():
                query = query.where(getattr(Session, key) == value)
            result = await session.execute(query)
            return result.scalar_one_or_none()

    async def find_many(self, where: dict | None = None, **kwargs):
        async with AsyncSessionLocal() as session:
            from sqlalchemy import select

            query = select(Session)
            if kwargs.get("include", {}).get("segments"):
                query = query.options(selectinload(Session.segments))
            if where:
                for key, value in where.items():
                    query = query.where(getattr(Session, key) == value)
            for key, direction in kwargs.get("order", {}).items():
                column = getattr(Session, key)
                query = query.order_by(column.desc() if direction == "desc" else column)
            if isinstance(kwargs.get("take"), int):
                query = query.limit(kwargs["take"])
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


db = DB()


async def connect_db():
    global engine, AsyncSessionLocal
    if engine is not None:
        return

    is_pg = ASYNC_DATABASE_URL.startswith("postgresql")

    if is_pg:
        engine = create_async_engine(
            ASYNC_DATABASE_URL,
            echo=False,
            future=True,
            connect_args={
                "statement_cache_size": 0,
            },
            pool_pre_ping=True,
        )
    else:
        engine = create_async_engine(
            ASYNC_DATABASE_URL,
            echo=False,
            future=True,
        )

    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
async def disconnect_db():
    if engine:
        await engine.dispose()


def get_db() -> DB:
    return db
