import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, ARRAY, func
from datetime import datetime
import uuid

# Database URL
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/vocalis")
# Convert to async URL for SQLAlchemy
ASYNC_DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

# Create async engine
engine = create_async_engine(ASYNC_DATABASE_URL, echo=False, future=True)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()

# Define SQLAlchemy models
class User(Base):
    __tablename__ = "user"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    firebaseUid = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    displayName = Column(String, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow)

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

class Segment(Base):
    __tablename__ = "segment"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    sessionId = Column(String, ForeignKey("session.id"), nullable=False)
    transcript = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    wpm = Column(Float, nullable=False)
    fillerRate = Column(Float, nullable=False)
    fillerWords = Column(ARRAY(String), nullable=True, default=[])
    uniqueWordRatio = Column(Float, nullable=False)
    feedback = Column(String, nullable=True)

class DB:
    """Wrapper class to mimic Prisma API with SQLAlchemy"""
    
    def __init__(self):
        self.User = UserService()
        self.Session = SessionService()
        self.Segment = SegmentService()

class UserService:
    async def find_unique(self, where: dict):
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
    async def find_unique(self, where: dict):
        async with AsyncSessionLocal() as session:
            from sqlalchemy import select
            query = select(Session)
            for key, value in where.items():
                query = query.where(getattr(Session, key) == value)
            result = await session.execute(query)
            return result.scalar_one_or_none()
    
    async def find_many(self, where: dict = None, **kwargs):
        async with AsyncSessionLocal() as session:
            from sqlalchemy import select
            query = select(Session)
            if where:
                for key, value in where.items():
                    query = query.where(getattr(Session, key) == value)
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
    # Don't actually connect here - let connections be lazy
    # Tables will be created on first database operation
    pass

async def disconnect_db():
    """Close database connection"""
    try:
        await engine.dispose()
    except Exception as e:
        print(f"Warning: Error disconnecting from database: {e}")

def get_db() -> DB:
    return db