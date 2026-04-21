import edge_tts
import asyncio
import uuid
import os

from config.settings import AUDIO_DIR as ENV_AUDIO_DIR

AUDIO_DIR = ENV_AUDIO_DIR or os.path.join(os.path.dirname(os.path.dirname(__file__)), "audio")
os.makedirs(AUDIO_DIR, exist_ok=True)
INTERVIEWER_VOICE = "en-US-JennyNeural"


async def generate_audio(text: str, filename: str):
    communicate = edge_tts.Communicate(text, INTERVIEWER_VOICE)
    await communicate.save(filename)


def text_to_voice(text: str):
    try:
        file_id = str(uuid.uuid4())
        file_path = os.path.join(AUDIO_DIR, f"{file_id}.mp3")

        # Use a fresh event loop to avoid "loop already running" error in FastAPI
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            loop.run_until_complete(generate_audio(text, file_path))
        finally:
            loop.close()

        return f"/audio/{file_id}.mp3"

    except Exception as e:
        print("Voice generation error:", e)
        return None
