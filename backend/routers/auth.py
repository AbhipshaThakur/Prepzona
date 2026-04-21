from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db, User, Resume
from services.auth_service import hash_password, verify_password, create_access_token, decode_token
import httpx

router = APIRouter(prefix="/auth")
bearer = HTTPBearer(auto_error=False)


# Models
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class GoogleAuthRequest(BaseModel):
    access_token: str


class ResumeAddRequest(BaseModel):
    name: str
    text: str


# Auth dependency
def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(bearer),
    db: Session = Depends(get_db)
) -> User:
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token(creds.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    subject = payload.get("sub")
    try:
        user_id = int(subject)
    except (TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid token subject")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def _user_response(user: User, token: str):
    return {
        "token": token,
        "user": {
            "id":    user.id,
            "name":  user.name,
            "email": user.email,
        }
    }


# Routes
@router.post("/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    user = User(name=req.name, email=req.email, password_hash=hash_password(req.password))
    db.add(user); db.commit(); db.refresh(user)
    token = create_access_token({"sub": user.id, "email": user.email})
    return _user_response(user, token)


@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not user.password_hash or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": user.id, "email": user.email})
    return _user_response(user, token)


@router.post("/google")
async def google_login(req: GoogleAuthRequest, db: Session = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {req.access_token}"}
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=400, detail="Invalid Google token")
    info      = resp.json()
    google_id = info.get("sub")
    email     = info.get("email")
    name      = info.get("name", email.split("@")[0] if email else "User")
    if not google_id or not email:
        raise HTTPException(status_code=400, detail="Incomplete Google profile")
    user = db.query(User).filter(User.google_id == google_id).first()
    if not user:
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.google_id = google_id; db.commit()
        else:
            user = User(name=name, email=email, google_id=google_id)
            db.add(user); db.commit(); db.refresh(user)
    token = create_access_token({"sub": user.id, "email": user.email})
    return _user_response(user, token)


@router.get("/me")
def me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resumes = db.query(Resume).filter(Resume.user_id == user.id).order_by(Resume.created_at.desc()).all()
    return {
        "id":      user.id,
        "name":    user.name,
        "email":   user.email,
        "resumes": [{"id": r.id, "name": r.name, "created_at": r.created_at.strftime("%d %b %Y")} for r in resumes],
    }


# Resume management
@router.post("/resume")
def add_resume(body: ResumeAddRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    resume = Resume(user_id=user.id, name=body.name, text=body.text[:25000])
    db.add(resume); db.commit(); db.refresh(resume)
    return {"id": resume.id, "name": resume.name, "created_at": resume.created_at.strftime("%d %b %Y")}


@router.delete("/resume/{resume_id}")
def delete_resume(resume_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    r = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == user.id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Resume not found")
    db.delete(r); db.commit()
    return {"message": "Deleted"}


@router.get("/resume/{resume_id}/text")
def get_resume_text(resume_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    r = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == user.id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Resume not found")
    return {"text": r.text}
