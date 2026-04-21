# InterviewIQ / PrepZona Project Learning Guide

This guide is written so you can explain the project confidently in front of an external examiner or interviewer.

Important note:
- The actual product name used in the code is `PrepZona`.
- The top-level folder is `Interview`.
- The `frontend` folder has git history.
- The `backend` folder does not have git history inside this workspace, so the backend timeline below is reconstructed from file creation and modification timestamps.
- Because of that, the timeline is a best-effort reconstruction, not a courtroom-level exact audit.

## 1. One-line explanation of the project

This project is an AI-powered mock interview platform where a user can sign in, choose a role and interview type, upload a resume, answer spoken interview questions, get AI-generated feedback, save session recordings, and view performance analytics over time.

## 2. Tech stack

Frontend:
- React
- Vite
- React Router
- Tailwind CSS
- Framer Motion
- Recharts

Backend:
- FastAPI
- SQLAlchemy
- SQLite
- JWT authentication
- OpenRouter for LLM-based question generation and evaluation
- `edge-tts` for text-to-speech audio of interview questions

Browser APIs:
- Speech Recognition API for voice-to-text
- MediaDevices API for camera and microphone access
- MediaRecorder API for session recording

## 3. What problem this project solves

A normal interview prep app usually gives only static questions. This project tries to simulate a more realistic flow:

1. The user chooses a role, experience level, interview type, and optional focus topics.
2. The app asks questions related to that context.
3. The user answers by speaking.
4. The answer is captured through speech recognition.
5. The app evaluates the whole session.
6. The user gets feedback, strengths, improvement points, and performance charts.

The stronger idea you can say in an interview is:

"I wanted to build not just a question bank, but a guided interview experience with personalization, voice input, audio output, saved reports, and analytics."

## 4. Current high-level architecture

### Frontend flow

`frontend/src/main.jsx`
- Entry point that mounts the React app.

`frontend/src/App.jsx`
- Defines routing.
- Wraps the app with `ThemeProvider` and `AuthProvider`.
- Protects interview pages using `ProtectedRoute`.

Current main screens:
- `/` -> `Dashboard`
- `/login` -> `Login`
- `/home` -> `Home`
- `/interview` -> `Interview`
- `/feedback` -> `Feedback`
- `/stats` -> `Stats`

### Backend flow

`backend/main.py`
- Creates the FastAPI app.
- Enables CORS.
- Initializes the database.
- Registers routers:
  - `/auth`
  - `/api`
  - `/stats`
- Serves generated audio files and saved recording files as static assets.

## 5. Database design

The database models live in `backend/database.py`.

Main tables:

`users`
- Stores account details.
- Supports both normal email/password login and Google login.

`resumes`
- Stores multiple resumes per user.
- Saves extracted text from uploaded resume files.

`interview_sessions`
- Stores one completed interview session.
- Includes role, interview type, score summary, topics, and created date.

`answers`
- Stores each question-answer pair for a session.
- Stores score, feedback, strengths, and improvements.

`reviews`
- Stores one latest review per user.

Good viva line:

"I kept the schema normalized around user -> sessions -> answers, because analytics and history become much easier when each answer is stored separately instead of saving one big JSON blob."

## 6. End-to-end feature flow

### A. Authentication

Frontend:
- `frontend/src/components/Login.jsx`
- `frontend/src/context/AuthContext.jsx`
- `frontend/src/services/ApiService.js`

Backend:
- `backend/routers/auth.py`
- `backend/services/auth_service.py`

How it works:
1. User logs in with email/password or Google.
2. Backend verifies credentials or Google token.
3. Backend returns JWT token and basic user object.
4. Frontend stores token in `localStorage`.
5. `AuthContext` uses `/auth/me` to restore session on reload.

### B. Resume upload

Frontend:
- `frontend/src/components/Home.jsx`

Backend:
- `backend/routers/auth.py`
- `backend/database.py`

How it works:
1. User uploads PDF or TXT resume.
2. Frontend extracts text from the file.
3. PDF parsing is done in the browser using `pdf.js` loaded from CDN.
4. Extracted text is sent to `/auth/resume`.
5. Backend stores the resume text in the `resumes` table.

Good viva line:

"I chose to extract the PDF text on the frontend so the backend only stores clean text and I avoid handling PDF parsing complexity server-side."

### C. Interview question generation

Frontend:
- `frontend/src/components/Interview.jsx`

Backend:
- `backend/routers/interview.py`
- `backend/services/llm_interview_service.py`
- `backend/services/prompt_service.py`
- `backend/services/interview_engine.py`
- `backend/services/openrouter_service.py`
- `backend/services/question_fetcher.py`

How it works:
1. Frontend sends role, experience, notes, interview type, resume text, and asked questions.
2. Backend tries LLM-based question generation first.
3. If LLM is unavailable or fails, backend falls back to a rule-based question engine.
4. Backend can also generate an audio file for the question using TTS.
5. Frontend plays the question audio, then starts listening for the user's answer.

Very important viva point:

"I designed the backend to degrade gracefully. Even if OpenRouter is unavailable, the interview still works because there is a fallback question engine and fallback evaluation logic."

### D. Speech input and recording

Frontend:
- `frontend/src/hooks/useSpeechRecognition.js`
- `frontend/src/components/Interview.jsx`

How it works:
1. Browser speech recognition captures the user's answer.
2. There is a silence timer so the answer auto-finalizes after the user stops speaking.
3. Camera and microphone access are requested.
4. `MediaRecorder` stores the session video/audio locally in memory during the interview.
5. After the session, the recording is uploaded to the backend.

### E. Session evaluation

Frontend:
- `frontend/src/components/Interview.jsx`
- `frontend/src/components/Feedback.jsx`

Backend:
- `backend/routers/interview.py`
- `backend/services/llm_interview_service.py`
- `backend/services/interview_engine.py`

How it works:
1. After 5 questions, frontend sends all question-answer pairs to `/api/session/evaluate`.
2. Backend tries LLM-based batch evaluation first.
3. If that fails, backend uses a rule-based scoring engine.
4. Frontend receives scored results and renders the feedback screen.

How the rule-based engine works:
- Looks at clarity
- Checks relevance to the question
- Looks for metrics or outcomes
- Checks whether the user showed ownership
- Checks whether technical depth exists

Good viva line:

"The fallback evaluator is heuristic-based. It is not trying to replace an LLM fully, but it gives stable scoring and useful feedback even when the AI service is down."

### F. Saving session and analytics

Frontend:
- `frontend/src/components/Interview.jsx`
- `frontend/src/components/Stats.jsx`

Backend:
- `backend/routers/stats.py`

How it works:
1. Frontend saves the evaluated session to `/stats/session`.
2. Backend creates an `interview_sessions` row.
3. Backend creates multiple `answers` rows linked to that session.
4. If there is a recording, frontend uploads it to `/stats/session/{id}/video`.
5. Stats page loads summaries and chart-ready data from `/stats/me`.

Analytics shown:
- Total sessions
- Average score
- Best score
- Streak
- Score over time
- Score by role
- Interview type distribution
- Session history with answer details

## 7. The most important files and what to say about each

### Frontend core

`frontend/src/App.jsx`
- Central router.
- Combines theme, auth, and route protection.

`frontend/src/components/Dashboard.jsx`
- Marketing and landing page.
- Shows the polished surface of the product.
- Uses many reusable visual components.

`frontend/src/components/Login.jsx`
- Handles both email/password login and Google login.

`frontend/src/components/Home.jsx`
- The interview setup page.
- Collects role, experience, interview type, topics, and resume.

`frontend/src/components/Interview.jsx`
- The heart of the product.
- Loads questions, plays question audio, listens to user speech, records the session, and finishes evaluation.

`frontend/src/components/Feedback.jsx`
- Displays final performance summary.
- Breaks down strengths, improvements, and question-by-question review.

`frontend/src/components/Stats.jsx`
- Shows long-term analytics and session history.

`frontend/src/context/AuthContext.jsx`
- Keeps authentication state globally available.

`frontend/src/hooks/useSpeechRecognition.js`
- Custom hook for browser speech recognition with silence detection and auto-finalization.

`frontend/src/services/ApiService.js`
- Central API wrapper for frontend-backend communication.

### Backend core

`backend/main.py`
- Backend entry point.

`backend/database.py`
- SQLAlchemy models, DB initialization, and DB session management.

`backend/routers/auth.py`
- Registration, login, Google auth, `/me`, and resume APIs.

`backend/routers/interview.py`
- Question generation and answer/session evaluation APIs.

`backend/routers/stats.py`
- Session saving, recording upload, stats, and reviews.

`backend/services/auth_service.py`
- Password hashing and JWT creation/validation.

`backend/services/interview_engine.py`
- Rule-based fallback for question generation and scoring.

`backend/services/llm_interview_service.py`
- Wraps LLM calls and normalizes responses.

`backend/services/openrouter_service.py`
- Handles actual OpenRouter request sending and JSON response parsing.

`backend/services/prompt_service.py`
- Builds the prompt used to ask better interview questions.

`backend/services/question_fetcher.py`
- Pulls public interview-question context from GitHub-style sources to ground prompts.

`backend/services/voice_service.py`
- Converts generated question text into audio using `edge-tts`.

## 8. Serial development timeline: what was built first, then next

This is the most likely order based on:
- frontend git history
- file creation timestamps
- current code structure

### Phase 1: Core prototype foundation around March 2, 2026

Likely earliest backend files:
- `backend/main.py`
- `backend/config/settings.py`
- `backend/routers/interview.py`
- `backend/services/prompt_service.py`
- `backend/services/voice_service.py`
- `backend/models/schemas.py`
- `backend/requirements.txt`

Likely earliest frontend files:
- `frontend/src/App.jsx`
- `frontend/src/main.jsx`
- `frontend/src/components/Interview.jsx`
- `frontend/src/services/ApiService.js`
- `frontend/src/App.css`
- `frontend/src/components/Intro.jsx`
- `frontend/src/components/Result.jsx`
- `frontend/src/components/Summary.jsx`

What this phase means:
- You first built the basic interview loop.
- The initial version was simpler.
- It focused on starting an interview, asking questions, collecting answers, and showing a result.

You can say:

"My first goal was to get the interview loop working end-to-end before polishing the product. So I started with the core interaction: ask a question, capture an answer, and return a result."

### Phase 2: Setup page and usable frontend flow around March 13 to March 15, 2026

Evidence:
- `frontend/src/components/Home.jsx` appears before the first frontend commit.
- Frontend git has one initial commit on March 15, 2026.

What was added:
- Role selection
- Experience input
- Topic input
- Better startup experience before entering the interview

You can say:

"Once the core flow worked, I added a proper setup screen so the interview could be personalized by role, experience, and topics."

### Phase 3: Productization with dashboard, login, and analytics around March 16 to March 25, 2026

Frontend evidence:
- `Dashboard.jsx` created March 16, 2026
- `Login.jsx` created March 16, 2026
- `Stats.jsx` created March 16, 2026
- `AuthContext.jsx` created March 24, 2026
- `Feedback.jsx` created March 25, 2026

Backend evidence:
- `routers/auth.py` created March 17, 2026
- `database.py` created March 24, 2026
- `routers/stats.py` created March 24, 2026
- `services/auth_service.py` created March 24, 2026

What changed in this phase:
- It stopped being only a demo.
- User accounts were added.
- Sessions could be stored.
- Analytics page was added.
- Reviews were added.
- Feedback became much more detailed.

You can say:

"The second major phase was turning the prototype into a real product. That meant authentication, database storage, session history, and analytics."

### Phase 4: Better evaluation and fallback logic around April 4, 2026

Evidence:
- `backend/services/interview_engine.py` shows later creation/modification.

What changed:
- Stronger rule-based fallback for:
  - question generation
  - answer evaluation
  - follow-up question generation
- This improved reliability when LLM output was unavailable or weak.

You can say:

"I realized a production-like experience should not completely fail when the LLM fails, so I added a rule-based fallback engine."

### Phase 5: Stronger AI integration and grounding around April 11 to April 12, 2026

Evidence:
- `backend/services/question_fetcher.py`
- `backend/services/openrouter_service.py`
- `backend/services/llm_interview_service.py`

What changed:
- Better OpenRouter integration
- Prompt engineering improvements
- Structured JSON parsing for evaluation
- Public interview-question grounding for better prompt context

You can say:

"In the latest phase, I improved the AI layer by adding more structured prompt handling, OpenRouter response normalization, and fallback-safe JSON parsing."

### Phase 6: Major frontend polish and landing-page redesign in the current uncommitted work

Evidence:
- Large uncommitted frontend changes from `git diff --stat HEAD`
- Many new UI components such as:
  - `Dashboard.jsx`
  - `CoachScrollStack.jsx`
  - `FlowingMenu.jsx`
  - `PrepHighlights.jsx`
  - `PracticeIconCloud.jsx`
  - `ReviewsMarquee.jsx`
  - `ResumeLanyard.jsx`
  - several `ui/*` components

What changed:
- Product presentation became much stronger.
- The app now has a polished landing page and richer UI system.
- The interview flow also became more advanced:
  - saved resumes
  - recording uploads
  - session save status
  - question source tracking
  - better speech recognition behavior

You can say:

"The final phase was polish and usability. I upgraded the landing page, cleaned up the interview experience, and made the product feel more complete and demo-ready."

## 9. Best honest answer to "Which file did you create first?"

Say this exactly if needed:

"Based on the available evidence, the earliest core files are the backend foundation files like `main.py`, `config/settings.py`, `routers/interview.py`, `services/prompt_service.py`, `services/voice_service.py`, and the earliest frontend app shell files like `src/App.jsx` and `src/components/Interview.jsx`, all around March 2, 2026. The first committed frontend snapshot was on March 15, 2026. So the project started as a core interview prototype first, then expanded into auth, feedback, analytics, and polish."

That answer is strong because it is:
- specific
- technically grounded
- honest about evidence limits

## 10. How the current app differs from the original prototype

Original prototype:
- Simpler `App.jsx`
- Direct `Home -> Interview` flow
- Smaller API wrapper
- Simpler speech hook
- Simple result and summary screens

Current app:
- Router-based multi-page architecture
- Authentication and protected routes
- Resume management
- LLM plus fallback engine
- Session saving and recording uploads
- Analytics dashboard
- Rich landing page and reusable UI system

This is a very good evolution story to tell.

## 11. Likely external viva questions and strong answers

### Q1. Why did you choose React for the frontend?

Answer:

"I chose React because the app has multiple stateful screens, reusable UI components, and browser APIs like speech recognition and media capture. React made it easier to split the interface into modular parts like Home, Interview, Feedback, and Stats."

### Q2. Why did you choose FastAPI for the backend?

Answer:

"FastAPI gave me quick API development, built-in request validation with Pydantic, and a clean structure for routing and service separation. It also fits well for an AI-backed application where I need JSON APIs and quick iteration."

### Q3. Why did you use SQLite?

Answer:

"For this project stage, SQLite was enough because it is lightweight, file-based, and easy to demo locally. It let me focus on the product logic first. The schema is structured in a way that can later be migrated to PostgreSQL if needed."

### Q4. Why did you separate routers and services?

Answer:

"I did that to keep responsibilities clean. Routers handle HTTP requests and responses, while services handle business logic like JWT creation, prompt building, LLM calls, scoring, and voice generation. That makes the code easier to scale and debug."

### Q5. How do you handle failure if the AI API is down?

Answer:

"I built fallback logic. If OpenRouter fails, the backend uses a rule-based question and evaluation engine, so the interview experience still works instead of completely breaking."

### Q6. How are answers evaluated?

Answer:

"There are two layers. The first layer is LLM-based evaluation for more natural feedback. The second layer is heuristic fallback scoring that checks clarity, relevance, structure, specificity, and technical depth. This makes the system more reliable."

### Q7. How is speech handled?

Answer:

"On the frontend, I use the browser Speech Recognition API to convert speech to text. I wrapped it in a custom hook that also handles silence detection and answer finalization. That improves usability because the user does not need to click stop at the exact right moment."

### Q8. How is question audio generated?

Answer:

"The backend uses `edge-tts` to convert the generated question text into an audio file, then exposes that file through a static route. The frontend receives the path and plays it before opening the mic."

### Q9. Why did you save recordings separately from answer data?

Answer:

"Structured answer data and binary video data have different storage concerns. I kept answer content in the database and recordings as files, then linked them by session ID. That keeps the data model cleaner."

### Q10. How does personalization happen?

Answer:

"Personalization happens through role, experience level, focus topics, previous answers, and optionally resume text. Those inputs influence question generation, so the interview feels more targeted than a generic question set."

### Q11. What is the hardest part of this project?

Answer:

"The hardest part was making the flow reliable across multiple moving parts: browser voice input, question audio playback, media recording, AI generation, fallback handling, and session persistence. The complexity was not only in one algorithm, but in coordinating the whole user experience."

### Q12. What did you improve most recently?

Answer:

"The latest improvements were the stronger LLM integration, better fallback evaluation, resume-aware questions, recording upload support, and a more polished landing page and UI system."

## 12. What you should say to prove you really built it

If someone challenges you, talk in this level of detail:

1. Mention the exact user flow from login to stats.
2. Mention the model names and APIs involved.
3. Explain where JWT is created and decoded.
4. Explain how the `answers` table differs from `interview_sessions`.
5. Explain how fallback scoring works.
6. Explain why resume text is stored instead of raw files only.
7. Explain how the frontend waits for question audio before listening.
8. Explain how recording upload is linked to a saved session.

If you can explain those naturally, it will be obvious you worked on the project.

## 13. Short speaking script for the external

"This project is an AI interview preparation platform called PrepZona. I built the frontend in React and the backend in FastAPI. The user can log in, choose a role and interview type, upload a resume, answer AI-generated interview questions through voice, and receive structured feedback plus analytics. I used JWT auth, SQLite with SQLAlchemy, OpenRouter for LLM-based question generation and evaluation, and a fallback rule-based engine so the system still works when AI calls fail. I also added session recording upload and a stats dashboard so the project is not just a demo, but a full interview practice workflow."

## 14. Honest limitations you can mention if asked

These are good to mention because they make you sound real and technically aware:

- SQLite is fine for demo scale but not ideal for high concurrency.
- Browser speech recognition quality depends on browser support and microphone quality.
- The heuristic fallback is useful but less intelligent than a strong LLM.
- Public grounding from fetched question sources is lightweight and could be expanded.
- Frontend bundle size is currently large and can be improved with code splitting.

## 15. Verification notes from this workspace

What I verified directly:
- Frontend production build succeeds with `npm run build`.
- Backend imports successfully with `venv\\Scripts\\python.exe -c "import main"`.

One note:
- A `compileall` run tried to write `.pyc` files and hit a permission issue in `__pycache__`, but the backend import itself succeeded.

## 16. Final memory trick for revision

Remember the project in this order:

1. Core interview prototype
2. Setup screen
3. Auth and database
4. Feedback and analytics
5. Fallback AI engine
6. Resume personalization
7. Recording uploads
8. Landing-page polish

If you can narrate those 8 steps clearly, you will sound like the real builder of the project.

## 17. File-Wise External Questions And Answers

This section is designed for viva style questioning where the external opens a file name and asks, "What is this file doing?" or "Why did you create this file?"

The best way to answer:
- Start with one line: what the file does.
- Then explain why it is needed.
- Then explain one implementation detail from inside it.

### `frontend/src/App.jsx`

Likely question:
- What is the role of `App.jsx` in your project?

Answer:

"`App.jsx` is the routing entry point of my frontend. It wraps the app with `ThemeProvider` and `AuthProvider`, and defines the main routes like Dashboard, Login, Home, Interview, Feedback, and Stats. I also used a `ProtectedRoute` here so unauthenticated users cannot directly access interview pages."

Why this sounds strong:
- It shows routing knowledge.
- It shows auth flow understanding.
- It shows you know global providers.

### `frontend/src/main.jsx`

Likely question:
- Why do you need `main.jsx`?

Answer:

"`main.jsx` is the frontend bootstrap file. Its role is to mount the React app into the DOM. I kept it minimal because all app-level logic like routing, auth, and theme is handled in `App.jsx`."

### `frontend/src/components/Dashboard.jsx`

Likely question:
- What is `Dashboard.jsx` doing?
- Is it only UI or does it have business importance too?

Answer:

"`Dashboard.jsx` is the landing page and product presentation layer. It explains the use cases, features, resume intelligence, feedback preview, and directs the user into the app flow. It is mainly a UI and product communication file, but it is important because it gives the first impression and makes the project feel like a complete product instead of a raw demo."

Strong extra line:

"I split the landing page into reusable animated sections so it stays maintainable even though the UI is rich."

### `frontend/src/components/Login.jsx`

Likely question:
- Explain `Login.jsx`.

Answer:

"`Login.jsx` handles both sign-in and registration UI. It also supports Google login. It collects the user's credentials, calls the backend auth APIs, receives the JWT token, and then updates the global auth state through `AuthContext`."

Important technical point:

"For Google login, the frontend gets the access token first, and the backend verifies it with Google's userinfo endpoint."

### `frontend/src/components/Home.jsx`

Likely question:
- What is the purpose of `Home.jsx`?

Answer:

"`Home.jsx` is the interview setup screen. Here the user chooses the role, experience level, interview type, focus topics, and optional resume. I made this page important because this setup data is what personalizes the interview instead of asking generic questions."

Strong follow-up line:

"This file also handles resume upload, text extraction, saved resume selection, and then passes the prepared state into the Interview page."

### `frontend/src/components/Interview.jsx`

Likely question:
- Which is the most important frontend file?
- Explain `Interview.jsx`.

Answer:

"`Interview.jsx` is the core working file of the whole project. It loads interview questions, plays question audio, starts browser speech recognition, records the session, collects answers, triggers evaluation, and finally saves the session. I would call this the orchestration layer of the interview flow."

Strong follow-up line:

"The complexity here is timing. I had to make sure the audio finishes first, then the mic starts, then the answer is finalized properly, then the next question is generated."

### `frontend/src/components/Feedback.jsx`

Likely question:
- What happens in `Feedback.jsx`?

Answer:

"`Feedback.jsx` shows the post-interview report. It calculates the average score, shows the best and worst answers, displays strengths and improvements, and gives a question-wise breakdown. I designed it so the user gets both a summary view and a detailed review view."

### `frontend/src/components/Stats.jsx`

Likely question:
- Why did you create `Stats.jsx`?

Answer:

"`Stats.jsx` is for long-term performance tracking. It loads saved sessions from the backend and visualizes them using charts. I included line, bar, pie, and radar charts because each one answers a different question about progress."

Strong chart explanation:

"The line chart shows improvement over time, the bar chart compares roles, the pie chart shows interview type distribution, and the radar chart gives a competency style breakdown."

### `frontend/src/context/AuthContext.jsx`

Likely question:
- What is the purpose of `AuthContext.jsx`?

Answer:

"`AuthContext.jsx` manages global authentication state. It stores the current user, exposes login and logout functions, and restores the session on page reload by checking the stored token and calling `/auth/me`."

### `frontend/src/hooks/useSpeechRecognition.js`

Likely question:
- Why did you create a custom hook for speech recognition?

Answer:

"I created `useSpeechRecognition.js` to wrap the browser Speech Recognition API in a reusable and controlled way. It manages continuous listening, interim transcripts, silence timers, final answer emission, and restart behavior."

Strong follow-up line:

"I kept this logic separate because speech control can get messy inside a UI component, so moving it into a hook made the Interview page cleaner."

### `frontend/src/services/ApiService.js`

Likely question:
- What is the need for `ApiService.js`?

Answer:

"`ApiService.js` is the centralized API layer of the frontend. It wraps GET, POST, DELETE, and form-data uploads, handles auth headers, and standardizes response parsing. This reduced duplication across Login, Home, Interview, and Stats."

### `frontend/src/services/AudioPlayer.js`

Likely question:
- Why separate audio playing into its own service?

Answer:

"I separated question audio playback into `AudioPlayer.js` so playback control stays reusable and clean. That made it easier for the Interview page to just trigger play and stop without mixing audio logic with UI logic."

### `frontend/src/theme/ThemeProvider.jsx`

Likely question:
- Why do you need a separate theme provider?

Answer:

"`ThemeProvider.jsx` manages global theme state for dark and light mode. I separated it so all components can stay consistent in styling without duplicating theme logic."

### `backend/main.py`

Likely question:
- What is the role of `main.py` in your backend?

Answer:

"`main.py` is the FastAPI entry point. It creates the app, enables CORS, initializes the database, registers routers, creates audio and recording directories, and serves those directories as static routes."

Strong follow-up line:

"So this file is not business logic heavy, but it wires the whole backend together."

### `backend/config/settings.py`

Likely question:
- Why did you make `settings.py`?

Answer:

"`settings.py` centralizes environment-based configuration like API keys, model name, secret key, CORS origins, database path, and file storage paths. I kept it separate so deployment becomes cleaner and I avoid scattering config values across files."

### `backend/database.py`

Likely question:
- Explain `database.py`.

Answer:

"`database.py` defines the SQLAlchemy models and database session management. It includes the main tables like users, resumes, interview sessions, answers, and reviews. It also handles database initialization."

Strong schema line:

"I structured it as user -> sessions -> answers because per-answer storage makes analytics and detailed feedback much easier."

### `backend/routers/auth.py`

Likely question:
- What APIs are present in `auth.py`?

Answer:

"`auth.py` contains registration, login, Google auth, current user lookup, and resume-related APIs. So it handles both identity and the user's resume data."

Strong follow-up line:

"I kept resume APIs here because resumes are tied directly to the authenticated user profile."

### `backend/routers/interview.py`

Likely question:
- What is the purpose of `interview.py`?

Answer:

"`interview.py` exposes the core interview APIs. It handles next-question generation, single answer evaluation, and full session evaluation. It also merges current-session and saved-session history so the next question avoids repetition."

### `backend/routers/stats.py`

Likely question:
- Explain `stats.py`.

Answer:

"`stats.py` handles persistence and analytics. It saves completed sessions, saves uploaded video recordings, stores reviews, and returns chart-ready performance data for the Stats page."

Strong follow-up line:

"This file is where the project shifts from being only an interview bot into a trackable product."

### `backend/services/auth_service.py`

Likely question:
- Why separate auth logic into `auth_service.py`?

Answer:

"I moved password hashing and JWT creation-validation into `auth_service.py` so router files stay clean. This file is responsible for bcrypt hashing and token creation/decoding."

### `backend/services/prompt_service.py`

Likely question:
- What is the job of `prompt_service.py`?

Answer:

"`prompt_service.py` builds the interviewer prompt for question generation. It combines role, interview type, experience, notes, resume text, previous answer context, and session memory into one structured prompt so the LLM behaves like a realistic interviewer."

Strong follow-up line:

"I also used this file to control the interview arc, like opening questions, technical depth, quality round, and closing style."

### `backend/services/openrouter_service.py`

Likely question:
- Why is `openrouter_service.py` separate?

Answer:

"`openrouter_service.py` is the raw integration layer with OpenRouter. It sends the request, adds the required headers, handles timeouts, and extracts the LLM response text. I separated it so the rest of the code does not depend on HTTP request details directly."

### `backend/services/llm_interview_service.py`

Likely question:
- What extra role does `llm_interview_service.py` have if you already have `openrouter_service.py`?

Answer:

"`openrouter_service.py` only talks to OpenRouter, but `llm_interview_service.py` handles interview-specific LLM behavior. It cleans bad outputs, validates question quality, normalizes JSON evaluations, and safely falls back if the LLM output is weak or unusable."

Strong follow-up line:

"So this file is like the safe interface between the raw LLM and my application logic."

### `backend/services/interview_engine.py`

Likely question:
- Why did you create `interview_engine.py`?

Answer:

"I created `interview_engine.py` as the rule-based fallback engine. It can generate questions, ask follow-ups, avoid repeated questions, and evaluate answers even if the LLM is unavailable."

Strong reliability line:

"This file is one of the most important engineering decisions in the project because it prevents total failure when the AI API is down."

### `backend/services/question_fetcher.py`

Likely question:
- What is the purpose of `question_fetcher.py`?

Answer:

"`question_fetcher.py` fetches public interview-question examples from role-specific sources. I use that as grounding context so the prompt stays closer to real-world interview patterns."

Important clarification:

"It does not blindly copy questions. It only gives inspiration context to improve realism."

### `backend/services/session_memory_service.py`

Likely question:
- Why did you add `session_memory_service.py`?

Answer:

"I added `session_memory_service.py` to summarize the user's previous saved sessions for the same role and interview type. It extracts recurring strengths, weak areas, and example answers so future questions feel more personalized."

Strong follow-up line:

"This makes the system feel more like a real interviewer who remembers previous rounds."

### `backend/services/voice_service.py`

Likely question:
- Explain `voice_service.py`.

Answer:

"`voice_service.py` converts generated question text into audio using `edge-tts`. It saves the audio as an MP3 file and returns the path so the frontend can play the question before listening to the answer."

### `render.yaml`

Likely question:
- Why did you add `render.yaml`?

Answer:

"I added `render.yaml` to prepare the project for deployment. It defines the backend as a Python web service, the frontend as a static site, and includes environment configuration and persistent disk settings."

### `DEPLOYMENT.md`

Likely question:
- Why did you create `DEPLOYMENT.md`?

Answer:

"`DEPLOYMENT.md` documents how the project should be deployed safely. I included required environment variables, storage expectations, and limitations like SQLite not being ideal for large scale production."

## 18. How To Answer If The External Opens A Random File

Use this 3-step formula:

1. Say what the file does in one line.
2. Say why that file is needed in the architecture.
3. Mention one technical detail from inside it.

Example:

"This file handles session evaluation. I needed it to separate interview logic from routing logic. Inside it, I normalize LLM JSON responses and fallback safely if the AI call fails."

If you answer in this structure, it becomes very hard for the external to think you did not build the project yourself.

## 19. Smaller File-Wise Viva Questions

This section is for the case where the external opens a smaller reusable component or helper file and asks why it exists.

### `frontend/src/components/PillNav.jsx`

Likely question:
- Why did you create `PillNav.jsx`?

Answer:

"`PillNav.jsx` is the reusable navigation bar for the landing experience. I made it separate so navigation behavior and styling stay reusable instead of mixing them into `Dashboard.jsx`."

### `frontend/src/components/CoachScrollStack.jsx`

Likely question:
- What is `CoachScrollStack.jsx` used for?

Answer:

"This component is part of the landing-page storytelling flow. I used it to visually explain the product in a scroll-based, engaging way. Its role is presentation and product communication, not business logic."

### `frontend/src/components/FlowingMenu.jsx`

Likely question:
- Why make a separate `FlowingMenu.jsx`?

Answer:

"`FlowingMenu.jsx` is a reusable animated menu-style section used to improve the visual flow of the dashboard. I kept it separate so visual effects remain isolated and easier to maintain."

### `frontend/src/components/Sessionstepper.jsx`

Likely question:
- What is the purpose of `Sessionstepper.jsx`?

Answer:

"`Sessionstepper.jsx` explains the interview workflow step by step. I created it to make onboarding easier for first-time users and to visually communicate how the product works."

### `frontend/src/components/PrepHighlights.jsx`

Likely question:
- What does `PrepHighlights.jsx` do?

Answer:

"`PrepHighlights.jsx` highlights the main value propositions of the project. It is a reusable content section for the dashboard that helps explain the product clearly during demo and first use."

### `frontend/src/components/PracticeIconCloud.jsx`

Likely question:
- Why use `PracticeIconCloud.jsx`?

Answer:

"I used `PracticeIconCloud.jsx` as a visual feature component to represent the range of technologies and interview areas the project can support. It improves the communication value of the landing page."

### `frontend/src/components/ReviewsMarquee.jsx`

Likely question:
- Why is `ReviewsMarquee.jsx` separate?

Answer:

"`ReviewsMarquee.jsx` is a reusable review-display component. I separated it because scrolling testimonial UI is a presentation pattern of its own and should not be mixed directly into the dashboard logic."

### `frontend/src/components/ResumeLanyard.jsx`

Likely question:
- What is `ResumeLanyard.jsx` for?

Answer:

"`ResumeLanyard.jsx` is a visual component used to make the resume-intelligence section more expressive. It supports the resume-based feature explanation and improves product presentation."

### `frontend/src/components/Spotlightcard.jsx`

Likely question:
- What is `Spotlightcard.jsx`?

Answer:

"`Spotlightcard.jsx` is a reusable card component used to present use cases or features with a focused visual effect. I made it reusable so multiple dashboard sections can keep a consistent style."

### `frontend/src/components/Feedback.jsx`

Likely follow-up question:
- How did you keep `Feedback.jsx` manageable when it has multiple views?

Answer:

"I divided the feedback logic into tabs like overview, per-question analysis, and action plan. That kept the user experience organized and prevented the screen from becoming one long unreadable report."

### `frontend/src/components/ui/AuroraHeading.jsx`

Likely question:
- Why create `AuroraHeading.jsx`?

Answer:

"`AuroraHeading.jsx` is a reusable heading component for the dashboard hero area. I created it so the typography and animated heading style stay consistent and reusable."

### `frontend/src/components/ui/button.jsx`

Likely question:
- Why do you have a separate `button.jsx`?

Answer:

"I kept a shared `button.jsx` so base button styles stay reusable across pages. This avoids repeating the same styling logic in many components."

### `frontend/src/components/ui/card.jsx`

Likely question:
- What is the role of `card.jsx`?

Answer:

"`card.jsx` is a reusable UI wrapper for card-like layouts. It helps keep the visual structure consistent across Interview, Feedback, Stats, and dashboard sections."

### `frontend/src/components/ui/HeroVideoDialog.jsx`

Likely question:
- Why separate the hero video dialog?

Answer:

"The hero video needed its own interaction logic, so I separated it into `HeroVideoDialog.jsx`. That keeps modal or video behavior modular and prevents the dashboard file from becoming too large."

### `frontend/src/components/ui/Marquee.jsx`

Likely question:
- What is `Marquee.jsx` doing?

Answer:

"`Marquee.jsx` is a reusable scrolling UI helper. I use it where I need a moving presentation strip, such as testimonials or feature highlights."

### `frontend/src/components/ui/NeonCard.jsx`

Likely question:
- Why create `NeonCard.jsx`?

Answer:

"`NeonCard.jsx` is a reusable visual feature card. It is mainly for UI polish and consistency on the landing page."

### `frontend/src/components/ui/PointerGlow.jsx`

Likely question:
- What does `PointerGlow.jsx` do?

Answer:

"`PointerGlow.jsx` adds an interactive glow effect based on pointer movement. I used it to make the landing page feel more dynamic and modern."

### `frontend/src/components/ui/progress.jsx`

Likely question:
- Why is the progress bar a separate component?

Answer:

"The progress bar is reused in the interview flow, so I separated it into its own component. That makes the interview screen cleaner and the progress UI easier to style consistently."

### `frontend/src/components/ui/RainbowButton.jsx`

Likely question:
- What is the purpose of `RainbowButton.jsx`?

Answer:

"`RainbowButton.jsx` is a reusable CTA button component used on the landing page. I separated it so the main call-to-action style is consistent across sections."

### `frontend/src/components/ui/ScrollProgress.jsx`

Likely question:
- Why did you create `ScrollProgress.jsx`?

Answer:

"`ScrollProgress.jsx` visually shows page scroll progress on the landing page. It improves the polished feel of the frontend and gives users orientation during long scrolling sections."

### `frontend/src/components/ui/ThemeToggleFancy.jsx`

Likely question:
- Why make a custom theme toggle?

Answer:

"I made `ThemeToggleFancy.jsx` so dark-light theme switching is both functional and visually aligned with the rest of the app. It is a small but important usability component."

### `frontend/src/components/ui/TiltedCard.jsx`

Likely question:
- What is `TiltedCard.jsx` used for?

Answer:

"`TiltedCard.jsx` is a reusable card with a motion-based visual effect. It helps present demo content in a more engaging way on the landing page."

### `frontend/src/components/ui/TypingText.jsx`

Likely question:
- Why do you need `TypingText.jsx`?

Answer:

"`TypingText.jsx` is a reusable animated text component. I use it where I want a typing effect without repeating that animation logic in multiple sections."

### `frontend/src/hooks/useTheme.js`

Likely question:
- What is the difference between `useTheme.js` and `ThemeProvider.jsx`?

Answer:

"`ThemeProvider.jsx` owns the global theme state, while `useTheme.js` is the hook that components use to access that state easily. I separated them to follow a clean provider-plus-hook pattern."

### `frontend/src/lib/utils.js`

Likely question:
- Why keep a `utils.js` file?

Answer:

"`utils.js` is for shared utility helpers that are not tied to one component. Keeping helpers here reduces duplication and keeps component files more focused on UI logic."

### `backend/requirements.txt`

Likely question:
- Why is `requirements.txt` important?

Answer:

"`requirements.txt` captures the Python dependencies needed to run the backend, such as FastAPI, SQLAlchemy, JWT libraries, requests, and edge-tts. It is important for reproducibility and deployment."

### `backend/.env.example`

Likely question:
- Why did you add `.env.example`?

Answer:

"I added `.env.example` so anyone running or deploying the project knows which environment variables are required without exposing real secrets."

### `frontend/.env.example`

Likely question:
- Why is there a frontend env example too?

Answer:

"The frontend also depends on environment values like API base URL and Google client ID, so I created a separate example file for frontend setup clarity."

### `backend/config/__init__.py`, `backend/models/__init__.py`, `backend/routers/__init__.py`, `backend/services/__init__.py`

Likely question:
- These files look empty. Why are they there?

Answer:

"These `__init__.py` files make Python treat those folders as packages. They are small, but they help maintain clean imports and package structure."

## 20. Best Response If The External Says "This file looks small, why is it separate?"

Answer:

"I separated small files when they represented a reusable responsibility. Even if a file is small, separating it improves readability, reuse, and maintainability. That made the project easier to scale as more features were added."
