# Deployment Notes

## Before You Publish

1. Rotate the OpenRouter API key currently present in `backend/.env` if this workspace has ever been shared.
2. Use a strong `SECRET_KEY` in production.
3. Do not commit `.env` files or database/audio/recording artifacts.

## Current Recommended First Deployment

- Backend: Render web service
- Frontend: Render static site
- Storage: Render persistent disk mounted at `/var/data`

This repository now includes `render.yaml` plus `.env.example` files for both apps.

## Required Production Environment Variables

### Backend

- `OPENROUTER_API_KEY`
- `MODEL_NAME`
- `SECRET_KEY`
- `DATABASE_PATH`
- `AUDIO_DIR`
- `RECORDINGS_DIR`
- `CORS_ALLOWED_ORIGINS`
- `APP_BASE_URL`

### Frontend

- `VITE_API_BASE_URL`
- `VITE_GOOGLE_CLIENT_ID` if Google login is used

## Important Runtime Notes

- SQLite, generated audio, and uploaded recordings now depend on writable storage paths. Use a persistent disk in production.
- `CORS_ALLOWED_ORIGINS` should be the exact deployed frontend origin, not `*`.
- If you later outgrow single-instance SQLite hosting, move the backend to Postgres and object storage.
