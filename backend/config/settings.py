import os
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))
OPENROUTER_API_KEY          = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_URL              = "https://openrouter.ai/api/v1/chat/completions"
MODEL_NAME                  = os.getenv("MODEL_NAME", "openrouter/free")
SECRET_KEY                  = os.getenv("SECRET_KEY", "prepzona-super-secret-change-in-prod")
ALGORITHM                   = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7
DATABASE_PATH               = os.getenv("DATABASE_PATH", "").strip()
AUDIO_DIR                   = os.getenv("AUDIO_DIR", "").strip()
RECORDINGS_DIR              = os.getenv("RECORDINGS_DIR", "").strip()
APP_BASE_URL                = os.getenv("APP_BASE_URL", "http://localhost:8000").strip()


def parse_cors_origins(value: str) -> list[str]:
    origins = [item.strip() for item in (value or "").split(",") if item.strip()]
    return origins or ["http://localhost:5173", "http://127.0.0.1:5173"]


CORS_ALLOWED_ORIGINS = parse_cors_origins(os.getenv("CORS_ALLOWED_ORIGINS", ""))
