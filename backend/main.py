from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from config.settings import AUDIO_DIR as ENV_AUDIO_DIR, CORS_ALLOWED_ORIGINS, RECORDINGS_DIR as ENV_RECORDINGS_DIR
from database import init_db
from routers.interview import router as interview_router
from routers.auth      import router as auth_router
from routers.stats     import router as stats_router

app = FastAPI(title="PrepZona API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()
app.include_router(auth_router)
app.include_router(interview_router)
app.include_router(stats_router)

BASE_DIR       = os.path.dirname(__file__)
AUDIO_DIR      = ENV_AUDIO_DIR or os.path.join(BASE_DIR, "audio")
RECORDINGS_DIR = ENV_RECORDINGS_DIR or os.path.join(BASE_DIR, "recordings")
os.makedirs(AUDIO_DIR, exist_ok=True)
os.makedirs(RECORDINGS_DIR, exist_ok=True)
app.mount("/audio",      StaticFiles(directory=AUDIO_DIR),      name="audio")
app.mount("/recordings", StaticFiles(directory=RECORDINGS_DIR), name="recordings")


@app.get("/")
def root():
    return {"status": "PrepZona API Running"}
