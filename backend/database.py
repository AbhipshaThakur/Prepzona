from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os
import sqlite3
import shutil

from config.settings import DATABASE_PATH as ENV_DATABASE_PATH

BASE_DIR              = os.path.dirname(__file__)
PRIMARY_DATABASE_PATH = os.path.join(BASE_DIR, "prepzona.db")
RUNTIME_DATABASE_PATH = os.path.join(BASE_DIR, "prepzona.runtime.db")


def is_sqlite_usable(path: str) -> bool:
    try:
        conn = sqlite3.connect(f"file:{path}?mode=ro", uri=True)
        rows = conn.execute("PRAGMA table_info(users)").fetchall()
        conn.close()
        return bool(rows)
    except sqlite3.Error:
        return False


def resolve_database_path() -> str:
    if ENV_DATABASE_PATH:
        resolved = os.path.abspath(ENV_DATABASE_PATH)
        os.makedirs(os.path.dirname(resolved), exist_ok=True)
        return resolved
    if is_sqlite_usable(PRIMARY_DATABASE_PATH):
        return PRIMARY_DATABASE_PATH
    if is_sqlite_usable(RUNTIME_DATABASE_PATH):
        return RUNTIME_DATABASE_PATH
    if os.path.exists(PRIMARY_DATABASE_PATH):
        shutil.copy2(PRIMARY_DATABASE_PATH, RUNTIME_DATABASE_PATH)
        return RUNTIME_DATABASE_PATH
    return PRIMARY_DATABASE_PATH


DATABASE_PATH = resolve_database_path()
DATABASE_URL  = f"sqlite:///{DATABASE_PATH}"

engine       = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base         = declarative_base()


class User(Base):
    __tablename__ = "users"
    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String, nullable=False)
    email         = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=True)
    avatar        = Column(String, default="")
    google_id     = Column(String, unique=True, nullable=True)
    created_at    = Column(DateTime, default=datetime.utcnow)
    sessions      = relationship("InterviewSession", back_populates="user")
    reviews       = relationship("Review",           back_populates="user")
    resumes       = relationship("Resume",           back_populates="user")


class Resume(Base):
    __tablename__ = "resumes"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"))
    name       = Column(String,  nullable=False)
    text       = Column(Text,    nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user       = relationship("User", back_populates="resumes")


class InterviewSession(Base):
    __tablename__  = "interview_sessions"
    id             = Column(Integer, primary_key=True, index=True)
    user_id        = Column(Integer, ForeignKey("users.id"))
    role           = Column(String)
    interview_type = Column(String, default="technical")
    total_score    = Column(Float,  default=0)
    avg_score      = Column(Float,  default=0)
    questions      = Column(Integer, default=0)
    feedback       = Column(Text,   default="")
    topics         = Column(String, default="")
    created_at     = Column(DateTime, default=datetime.utcnow)
    user           = relationship("User",    back_populates="sessions")
    answers        = relationship("Answer",  back_populates="session")


class Answer(Base):
    __tablename__ = "answers"
    id            = Column(Integer, primary_key=True, index=True)
    session_id    = Column(Integer, ForeignKey("interview_sessions.id"))
    question      = Column(Text)
    answer        = Column(Text)
    score         = Column(Float,  default=0)
    feedback      = Column(Text,   default="")
    strengths     = Column(Text,   default="")
    improvements  = Column(Text,   default="")
    created_at    = Column(DateTime, default=datetime.utcnow)
    session       = relationship("InterviewSession", back_populates="answers")


class Review(Base):
    __tablename__ = "reviews"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), unique=True)
    rating     = Column(Integer, default=5)
    text       = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    user       = relationship("User", back_populates="reviews")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)
    _normalize_reviews_table()


def _normalize_reviews_table():
    conn = sqlite3.connect(DATABASE_PATH)
    try:
        rows = conn.execute(
            """
            SELECT id, user_id
            FROM reviews
            WHERE user_id IS NOT NULL
            ORDER BY user_id, datetime(created_at) DESC, id DESC
            """
        ).fetchall()
        seen_user_ids = set()
        duplicate_ids = []
        for review_id, user_id in rows:
            if user_id in seen_user_ids:
                duplicate_ids.append((review_id,))
                continue
            seen_user_ids.add(user_id)
        if duplicate_ids:
            conn.executemany("DELETE FROM reviews WHERE id = ?", duplicate_ids)
        conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS ux_reviews_user_id ON reviews(user_id)")
        conn.commit()
    finally:
        conn.close()
