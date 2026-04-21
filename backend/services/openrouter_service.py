import json
import requests
from config.settings import APP_BASE_URL, MODEL_NAME, OPENROUTER_API_KEY, OPENROUTER_URL

def llm_enabled() -> bool:
    return bool(OPENROUTER_API_KEY and MODEL_NAME)


def call_openrouter(messages: list, max_tokens: int = 300, temperature: float = 0.7) -> str:
    if not llm_enabled():
        raise Exception("OPENROUTER_API_KEY not set in backend/.env.")

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": APP_BASE_URL,
        "X-Title": "PrepZona",
    }
    payload = {
        "model": MODEL_NAME,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    # Ignore broken system proxy settings so local demos can reach OpenRouter directly.
    session = requests.Session()
    session.trust_env = False
    response = session.post(
        OPENROUTER_URL,
        headers=headers,
        json=payload,
        timeout=60,
    )

    if response.status_code != 200:
        print("OPENROUTER ERROR:", response.status_code, response.text)
        raise Exception(f"OpenRouter error {response.status_code}: {response.text}")

    data = response.json()
    content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
    if not content:
        raise Exception("OpenRouter returned an empty response.")
    return content


def parse_json_response(text: str):
    cleaned = (text or "").strip()
    if cleaned.startswith("```"):
        lines = cleaned.splitlines()
        lines = lines[1:] if lines else []
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        cleaned = "\n".join(lines).strip()

    decoder = json.JSONDecoder()
    for index, char in enumerate(cleaned):
        if char not in "{[":
            continue
        try:
            parsed, _ = decoder.raw_decode(cleaned[index:])
            return parsed
        except json.JSONDecodeError:
            continue

    print("JSON PARSE ERROR:", text)
    raise Exception("Failed to parse AI response as JSON.")
