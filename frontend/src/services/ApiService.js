const BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"

const authH = () => {
  const token = localStorage.getItem("token")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || ""
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.detail || data?.message || "Request failed"
    throw new Error(message)
  }

  return data
}

const post = (url, data, auth = false) =>
  fetch(`${BASE}${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(auth ? authH() : {}) },
    body: JSON.stringify(data),
  }).then(parseResponse)

const get = (url, auth = false) =>
  fetch(`${BASE}${url}`, { headers: auth ? authH() : {} }).then(parseResponse)

const del = (url, auth = false) =>
  fetch(`${BASE}${url}`, { method: "DELETE", headers: auth ? authH() : {} }).then(parseResponse)

const postForm = (url, formData, auth = false) =>
  fetch(`${BASE}${url}`, {
    method: "POST",
    headers: auth ? authH() : {},
    body: formData,
  }).then(parseResponse)

// Auth
export const registerUser       = d  => post("/auth/register", d)
export const loginUser          = d  => post("/auth/login", d)
export const googleAuth         = t  => post("/auth/google", { access_token: t })
export const getMe              = () => get("/auth/me", true)

// Resume management
export const addResume          = d  => post("/auth/resume", d, true)
export const deleteResume       = id => del(`/auth/resume/${id}`, true)
export const getResumeText      = id => get(`/auth/resume/${id}/text`, true)

// Interview
export const getQuestion        = d  => post("/api/question", d, true)
export const evaluateSession    = d  => post("/api/session/evaluate", d)

// Stats
export const saveSession        = d  => post("/stats/session", d, true)
export const getMyStats         = () => get("/stats/me", true)
export const saveSessionRecording = (sessionId, file) => {
  const formData = new FormData()
  formData.append("video", file, file.name || "session-recording.webm")
  return postForm(`/stats/session/${sessionId}/video`, formData, true)
}

// Reviews
export const postReview         = d  => post("/stats/review", d, true)
export const getReviews         = () => get("/stats/reviews")
