# PrepZona / InterviewIQ External Viva Q&A

This sheet is written so you can answer confidently in front of externals.

How to use it:
- First learn the short answer.
- Then remember the keywords line.
- Use the detailed answer only if they ask a follow-up.

---

## 1. Project overview

### Q1. What is your project?

Short answer:

My project is an AI-powered mock interview platform called PrepZona. It lets a user log in, choose a role and interview type, upload a resume, answer questions by voice, get AI-based feedback, save recordings, and track performance over time.

Keywords:

AI interview, resume-based, voice input, feedback, analytics.

Detailed answer:

The main goal was to create a realistic interview workflow instead of a static question bank. I combined React on the frontend and FastAPI on the backend, added authentication, resume-aware personalization, LLM-based question generation, fallback logic, session saving, and analytics so the product feels complete and not just like a demo.

### Q2. What problem does your project solve?

Short answer:

Most interview prep tools give static questions. My project simulates an actual interview flow with personalization, live voice interaction, feedback, and long-term tracking.

Keywords:

Static tools, realistic flow, personalization, guided practice.

Detailed answer:

I wanted to solve the gap between reading interview questions and actually experiencing an interview. So I made the app ask contextual questions, listen to answers, evaluate performance, save sessions, and show analytics. That makes practice more active and measurable.

### Q3. What makes your project different from a basic question-answer app?

Short answer:

The difference is the full workflow. It has authentication, resume-based personalization, AI plus fallback logic, speech recognition, question audio, recording upload, structured feedback, and analytics.

Keywords:

End-to-end workflow, not just questions.

Detailed answer:

Instead of stopping at question display, the app handles setup, live interview flow, answer capture, evaluation, persistence, and progress tracking. That full loop is what makes it stronger than a simple CRUD or static quiz app.

### Q4. Why did you name it PrepZona?

Short answer:

I wanted a name that sounds like a dedicated preparation zone for interviews. It matches the idea of a focused practice environment.

Keywords:

Preparation zone, focused environment.

---

## 2. Tech stack

### Q5. What technologies did you use?

Short answer:

I used React, Vite, Tailwind CSS, Framer Motion, and Recharts on the frontend. On the backend I used FastAPI, SQLAlchemy, SQLite, JWT authentication, OpenRouter for LLM calls, and edge-tts for question audio.

Keywords:

React, FastAPI, SQLAlchemy, SQLite, JWT, OpenRouter.

### Q6. Why did you choose React?

Short answer:

I chose React because the project has multiple stateful screens, reusable components, and browser APIs like speech recognition and media recording. React made that modular and easier to manage.

Keywords:

Stateful screens, modular UI, reusable components.

### Q7. Why did you choose FastAPI?

Short answer:

FastAPI gave me fast API development, clean routing, request validation, and a nice separation between routers and services. It is a good fit for an AI-backed application.

Keywords:

Fast APIs, validation, clean backend structure.

### Q8. Why did you use SQLite?

Short answer:

For this stage, SQLite was enough because it is lightweight, simple to demo, and quick to integrate with SQLAlchemy. I also kept the schema structured so it can later move to PostgreSQL.

Keywords:

Lightweight, demo-friendly, migration-ready.

### Q9. Why did you use SQLAlchemy instead of raw SQL?

Short answer:

SQLAlchemy helped me model relationships cleanly between users, sessions, answers, resumes, and reviews. It also made the backend more maintainable and readable.

Keywords:

ORM, relationships, maintainability.

---

## 3. Architecture

### Q10. Explain the high-level architecture.

Short answer:

The frontend handles user interaction, speech input, recording, and rendering. The backend handles authentication, question generation, evaluation, storage, audio generation, and analytics APIs.

Keywords:

Frontend for UX, backend for logic and persistence.

Detailed answer:

The React app collects role, experience, interview type, topics, and resume text, then calls backend APIs. The FastAPI backend decides the question path, either LLM or fallback, evaluates answers, stores sessions, saves recordings, and returns analytics data. Static audio and recording files are also served by the backend.

### Q11. Why did you separate routers and services?

Short answer:

I separated them to keep responsibilities clean. Routers handle HTTP request-response logic, and services handle business logic like prompt creation, JWT, LLM calls, scoring, and voice generation.

Keywords:

Separation of concerns, maintainability.

### Q12. What are the main backend routers?

Short answer:

There are three main routers: `auth`, `interview`, and `stats`. `auth` handles login and resumes, `interview` handles question generation and evaluation, and `stats` handles session saving, recordings, reviews, and analytics.

Keywords:

Auth, interview, stats.

### Q13. What are the main frontend screens?

Short answer:

The main screens are Dashboard, Login, Home, Interview, Feedback, and Stats. Together they cover discovery, authentication, interview setup, live interview, final review, and progress tracking.

Keywords:

Dashboard, setup, interview, feedback, analytics.

---

## 4. Database design

### Q14. What tables are in your database?

Short answer:

My main tables are `users`, `resumes`, `interview_sessions`, `answers`, and `reviews`.

Keywords:

Users, resumes, sessions, answers, reviews.

### Q15. Why did you separate `interview_sessions` and `answers`?

Short answer:

I separated them because one session contains multiple answers. That normalized design makes analytics, history, and detailed feedback much easier.

Keywords:

One-to-many, normalized schema, easier analytics.

Detailed answer:

If I stored the whole session in one big JSON blob, charting and per-question analysis would be harder. By storing each answer separately, I can calculate scores, history, and drilldowns in a cleaner way.

### Q16. What is stored in `interview_sessions`?

Short answer:

It stores the user ID, role, interview type, total score, average score, question count, topics, feedback summary, and timestamp.

Keywords:

Session-level summary data.

### Q17. What is stored in `answers`?

Short answer:

Each answer row stores the question, user answer, score, feedback, strengths, improvements, and creation time for one question in a session.

Keywords:

Per-question detailed evaluation.

### Q18. Why did you store resumes as text?

Short answer:

I store resume text because the AI and personalization logic need clean text, not just a raw file. That makes question generation faster and easier later.

Keywords:

Store useful text, not just file blob.

---

## 5. Authentication and user management

### Q19. How does authentication work?

Short answer:

I support email-password login and Google login. After authentication, the backend returns a JWT token, and the frontend stores it in localStorage to keep the session active.

Keywords:

JWT, email-password, Google OAuth.

### Q20. How is the JWT used?

Short answer:

The token is sent in the `Authorization` header for protected routes. The backend decodes it to identify the current user before allowing resume, session, or stats operations.

Keywords:

Bearer token, protected routes, current user.

### Q21. How is Google login implemented?

Short answer:

The frontend requests a Google access token using Google's client library. The backend then verifies it with Google's userinfo endpoint and either links or creates the user.

Keywords:

Frontend token, backend verification, user link/create.

### Q22. What does `AuthContext` do?

Short answer:

`AuthContext` keeps the logged-in user globally available. It restores the session on reload by calling `/auth/me` if a token is already stored.

Keywords:

Global auth state, session restore.

---

## 6. Resume upload and setup flow

### Q23. What happens on the Home page?

Short answer:

The Home page collects role, experience, interview type, focus topics, and optional resume text. That information is passed into the interview session so the questions become personalized.

Keywords:

Role, experience, type, topics, resume.

### Q24. How does resume upload work?

Short answer:

The user uploads a PDF or text file. The frontend extracts the text, then sends the clean text to the backend to store against the logged-in user.

Keywords:

Frontend extraction, backend storage.

### Q25. Why did you parse the PDF on the frontend?

Short answer:

I did PDF parsing on the frontend to reduce backend complexity and store only the useful resume text. That also keeps the server focused on core application logic.

Keywords:

Less backend complexity, store text only.

### Q26. How does the user choose interview type?

Short answer:

The user selects either technical or HR round. That choice changes the style of question generation, the prompt design, and the fallback engine behavior.

Keywords:

Technical vs HR, different interview behavior.

---

## 7. Interview flow

### Q27. What is the full interview flow?

Short answer:

The user starts from Home, enters the Interview page, receives a generated question, listens to the question audio, answers by voice, repeats for five questions, then gets evaluated feedback and analytics.

Keywords:

Setup, ask, listen, answer, evaluate, save.

### Q28. Why did you keep the interview to 5 questions?

Short answer:

I chose five questions because it is long enough to show meaningful evaluation and short enough for a practical user session. It balances realism with usability.

Keywords:

Balanced length, practical session size.

### Q29. What does the Interview page handle?

Short answer:

The Interview page is the core of the app. It loads questions, plays question audio, starts speech recognition, records the session, collects answers, sends evaluation requests, and finally saves the results.

Keywords:

Main orchestration screen.

### Q30. How do you avoid repeating questions?

Short answer:

The frontend sends already-asked questions, and the backend merges them with saved question history for the same user, role, and interview type. Then both the LLM path and fallback path avoid similar questions.

Keywords:

Asked questions list, saved history, duplicate prevention.

---

## 8. AI question generation

### Q31. How are questions generated?

Short answer:

The backend first tries LLM-based generation using OpenRouter. If that fails or returns a bad question, it uses a rule-based fallback engine.

Keywords:

LLM first, fallback second.

### Q32. What is the role of `prompt_service.py`?

Short answer:

`prompt_service.py` builds the actual system prompt for question generation. It combines role, experience, interview type, resume text, notes, previous answer context, prior session memory, and the interview stage.

Keywords:

Prompt building, context assembly.

### Q33. What is the role of `question_fetcher.py`?

Short answer:

It fetches public interview-question examples from role-relevant sources and uses them as grounding context. The prompt uses them for inspiration, but the final question is still generated dynamically.

Keywords:

Grounding, inspiration, not direct copying.

### Q34. Why did you add public question grounding?

Short answer:

I added grounding so the AI asks questions that feel closer to real interview patterns. It improves realism without hardcoding static questions.

Keywords:

Realistic patterns, better prompt quality.

### Q35. What is the role of `openrouter_service.py`?

Short answer:

That service is the integration layer with OpenRouter. It sends the prompt, handles headers and payload, and extracts the final text response.

Keywords:

API integration layer.

### Q36. What is the role of `llm_interview_service.py`?

Short answer:

`llm_interview_service.py` sits above the raw OpenRouter call. It cleans LLM outputs, normalizes JSON evaluation responses, enforces question quality rules, and safely falls back when needed.

Keywords:

Normalization, validation, safe fallback.

### Q37. How did you stop the LLM from leaking prompt text?

Short answer:

I tightened the prompt to ask for only one short interviewer-style question, and I also added a backend cleaner that rejects meta text like planning notes or long outputs. If the result is invalid, the system falls back automatically.

Keywords:

Prompt constraint, response cleaning, automatic fallback.

### Q38. Why did you limit questions to under 50 words?

Short answer:

A short question sounds more realistic, is easier to understand in voice mode, and avoids prompt leakage or over-explanation. It improves both UX and reliability.

Keywords:

Realism, clarity, safer output.

---

## 9. Personalization

### Q39. How is personalization done?

Short answer:

Personalization uses role, experience, interview type, focus topics, resume text, previous answer, and saved session history. That makes the next question feel targeted instead of generic.

Keywords:

Role, experience, resume, previous answer, history.

### Q40. What is `session_memory_service.py` used for?

Short answer:

It summarizes previous saved sessions for the same role and interview type. It extracts strong patterns, weak patterns, recurring topics, and example answers so the next question can build on past performance.

Keywords:

Past sessions, strengths, weaknesses, memory summary.

### Q41. Why did you use previous sessions in question generation?

Short answer:

I wanted the system to feel like a real interviewer who remembers earlier rounds. It can revisit weak areas from a new angle or deepen a strong area without repeating the same question.

Keywords:

Cross-session memory, realistic continuity.

### Q42. How does experience level affect question generation?

Short answer:

For freshers, the system focuses more on fundamentals, projects, and learning. For experienced users, it shifts toward practical work, debugging, architecture, trade-offs, and leadership.

Keywords:

Fresher vs experienced, difficulty adaptation.

---

## 10. Fallback engine

### Q43. Why did you build a fallback engine?

Short answer:

I built it so the product does not fail when the LLM is unavailable, too slow, or returns weak output. Reliability was important because I wanted the interview flow to continue gracefully.

Keywords:

Reliability, graceful degradation.

### Q44. What does `interview_engine.py` do?

Short answer:

It provides rule-based question generation, follow-up logic, and answer evaluation. It also checks for repeated questions and creates useful fallback feedback.

Keywords:

Rule-based questioning and scoring.

### Q45. How does the fallback question generator work?

Short answer:

It uses the role, interview type, experience, notes, resume text, interview stage, and session memory to choose a question from a dynamic question bank. It can also ask follow-ups based on the previous answer.

Keywords:

Dynamic question bank, stage-based, context-aware.

### Q46. How does the fallback evaluator score answers?

Short answer:

It checks clarity, relevance, specificity, structure, and depth. For technical answers it looks for technical substance, and for HR answers it looks for ownership and outcome.

Keywords:

Clarity, relevance, specificity, structure, depth.

### Q47. Why is the fallback evaluator heuristic-based?

Short answer:

The fallback is meant to be stable and predictable, not as smart as a strong LLM. Its job is to keep the system useful even when AI calls fail.

Keywords:

Stable backup, not full AI replacement.

---

## 11. Speech, audio, and recording

### Q48. How is speech input handled?

Short answer:

I use the browser Speech Recognition API through a custom hook. It listens continuously, collects interim and final transcripts, and finalizes the answer after a silence delay.

Keywords:

Speech Recognition API, custom hook, silence detection.

### Q49. Why did you build a custom speech hook?

Short answer:

The custom hook made it easier to manage silence timers, restart behavior, transcript updates, and final answer emission in one reusable place.

Keywords:

Reusability, clean speech control.

### Q50. How is question audio generated?

Short answer:

The backend uses `edge-tts` to convert the generated question into an MP3 file. That file is saved on the server and served through a static `/audio` route.

Keywords:

Text-to-speech, MP3, static route.

### Q51. Why did you add audio output for questions?

Short answer:

It makes the interview feel more natural and conversational. It also supports a more realistic hands-free flow before the mic opens for the user's answer.

Keywords:

More realistic, smoother voice experience.

### Q52. How do you handle recording?

Short answer:

The frontend uses `MediaDevices` to access camera and microphone and `MediaRecorder` to capture the session. After evaluation, the recording is uploaded to the backend and linked to the saved session ID.

Keywords:

MediaDevices, MediaRecorder, session-linked upload.

### Q53. Why did you store recordings as files instead of in the database?

Short answer:

Video files are binary and large, while scores and feedback are structured data. Keeping recordings as files and metadata in the database is cleaner and more scalable.

Keywords:

Binary files separate from structured data.

---

## 12. Evaluation and feedback

### Q54. How is the session evaluated?

Short answer:

After the fifth answer, the frontend sends the full list of question-answer pairs to the backend. The backend tries LLM-based batch evaluation first, and if that fails it uses the rule-based evaluator.

Keywords:

Batch evaluation, LLM first, fallback second.

### Q55. What does the feedback screen show?

Short answer:

It shows average score, performance label, best and worst answers, strengths, improvement areas, question-by-question feedback, sample answers, and follow-up questions.

Keywords:

Summary plus per-question breakdown.

### Q56. Why did you include sample answers?

Short answer:

A score alone is not enough. Sample answers make the feedback educational by showing what a stronger response could look like.

Keywords:

Educational feedback, not score only.

### Q57. Why did you include follow-up questions in feedback?

Short answer:

That helps users continue practicing in the same context. It makes the system feel more like a coach after the interview is complete.

Keywords:

Continued practice, contextual improvement.

---

## 13. Analytics and stats

### Q58. What does the Stats page do?

Short answer:

The Stats page visualizes long-term performance. It shows total sessions, average score, best score, active days, score over time, score by role, interview type distribution, radar skills, and detailed session history.

Keywords:

Analytics dashboard, charts, session history.

### Q59. Why did you use Recharts?

Short answer:

Recharts made it easy to create multiple readable chart types directly in React. It helped me present progress data in a way that is both simple and visually clear.

Keywords:

React-friendly charting, readable analytics.

### Q60. What charts are included and why?

Short answer:

I used a line chart for score over time, bar chart for score by role, pie chart for interview type distribution, and radar chart for skill breakdown. Each chart answers a different performance question.

Keywords:

Trend, comparison, distribution, competency view.

### Q61. How is session history shown?

Short answer:

The stats API returns all saved sessions plus their answers. The frontend lets the user expand a session to view each question, answer, score, feedback, and saved recording link.

Keywords:

Expandable history, detailed drilldown.

---

## 14. Landing page and UI system

### Q62. Why is your landing page so componentized?

Short answer:

I broke the landing page into reusable visual components so the UI stays maintainable and easier to polish. It also makes the product feel more complete during demos.

Keywords:

Reusable UI, maintainability, polished demo.

### Q63. What is the role of `Dashboard.jsx`?

Short answer:

`Dashboard.jsx` is the landing and product presentation page. It combines reusable UI blocks to explain the app, show features, and direct users into the actual interview flow.

Keywords:

Landing page, feature presentation, entry point.

### Q64. What kind of reusable UI components did you build?

Short answer:

I used reusable components for animated headings, buttons, cards, menu sections, glow effects, scroll progress, previews, and feature sections. That keeps the frontend more modular than one huge landing file.

Keywords:

Reusable presentation system.

### Q65. Why did you also add dark and light theme support?

Short answer:

Theme support improves user experience and shows stronger frontend polish. It also forced me to design components more carefully so they work across visual modes.

Keywords:

UX, polish, reusable styling.

---

## 15. API and frontend-backend communication

### Q66. What does `ApiService.js` do?

Short answer:

It is the frontend API wrapper. It centralizes GET, POST, DELETE, form-data uploads, auth headers, and response parsing so API calls stay clean across components.

Keywords:

Central API layer, cleaner frontend.

### Q67. Why did you centralize API calls?

Short answer:

Centralizing API logic reduces duplication and makes changes easier. If I change the base URL, headers, or error parsing, I only update one place.

Keywords:

Less duplication, easier maintenance.

---

## 16. Deployment and production thinking

### Q68. How would you deploy this project?

Short answer:

I prepared it for a split deployment: frontend as a static site and backend as a Python web service. I also added env-based config for database path, recordings path, audio path, CORS origins, and API base URL.

Keywords:

Static frontend, backend service, env-driven config.

### Q69. What production issues did you consider?

Short answer:

I considered secret handling, CORS, persistent storage for SQLite and recordings, fallback reliability, and deployment configuration. I also separated environment settings into example files for safer setup.

Keywords:

Secrets, CORS, persistence, deployment safety.

### Q70. Why is SQLite a limitation in production?

Short answer:

SQLite is simple and fine for demo scale, but it is not ideal for higher concurrency or multi-instance deployment. For larger scale I would move to PostgreSQL.

Keywords:

Good for demo, not best for scale.

---

## 17. Ownership and design decisions

### Q71. What was the hardest part of the project?

Short answer:

The hardest part was coordinating many moving parts at once: AI generation, fallback logic, speech recognition, TTS audio, recording, storage, and frontend timing. The complexity was in the overall flow, not just one algorithm.

Keywords:

System coordination, not just one feature.

### Q72. What design decision are you most proud of?

Short answer:

I am most proud of the graceful fallback design. Even if the LLM fails, the interview still continues with a rule-based engine, so the product remains usable.

Keywords:

Graceful degradation, reliability.

### Q73. What did you improve most recently?

Short answer:

My recent improvements were better interviewer prompts, shorter cleaner question outputs, session-memory personalization, stronger fallback behavior, and deployment hardening.

Keywords:

Prompt quality, personalization, reliability, deploy readiness.

### Q74. If I ask how I know you built this yourself, what would you say?

Short answer:

I can explain the flow from login to stats in detail, including where JWT is created, how resume text is extracted, how questions are generated, how fallback scoring works, how recordings are linked to sessions, and how charts are built from saved answer data.

Keywords:

Can explain implementation, not just features.

---

## 18. Honest limitations and future work

### Q75. What are the current limitations?

Short answer:

The main limitations are SQLite for scale, browser-dependent speech recognition quality, heuristic fallback being less intelligent than an LLM, and a large frontend bundle that can still be optimized.

Keywords:

Scale, browser dependency, fallback limits, bundle size.

### Q76. What improvements would you make next?

Short answer:

Next I would move storage to PostgreSQL and object storage, improve bundle splitting, add admin analytics, support more languages, and make feedback even more personalized with richer session memory.

Keywords:

Postgres, object storage, code splitting, richer personalization.

### Q77. Would you call this project complete?

Short answer:

I would call it complete as a strong MVP and academic project, but not final. The architecture is solid, and the next step would be scaling and production-level hardening.

Keywords:

Strong MVP, not final product.

---

## 19. Rapid-fire file ownership answers

### Q78. What does `frontend/src/App.jsx` do?

It sets up routing, theme provider, auth provider, and protected routes.

### Q79. What does `frontend/src/components/Home.jsx` do?

It collects interview configuration and handles resume selection and upload.

### Q80. What does `frontend/src/components/Interview.jsx` do?

It manages the live interview, including question loading, audio playback, speech recognition, recording, evaluation, and session save flow.

### Q81. What does `frontend/src/components/Feedback.jsx` do?

It displays final interview results, strengths, improvement areas, and question-by-question analysis.

### Q82. What does `frontend/src/components/Stats.jsx` do?

It renders analytics charts and past session history.

### Q83. What does `frontend/src/components/Login.jsx` do?

It handles sign-in, registration, and Google authentication.

### Q84. What does `frontend/src/context/AuthContext.jsx` do?

It manages current user state, login, logout, and session restoration.

### Q85. What does `frontend/src/hooks/useSpeechRecognition.js` do?

It wraps browser speech recognition with silence detection and final transcript handling.

### Q86. What does `frontend/src/services/ApiService.js` do?

It centralizes frontend API calls and auth headers.

### Q87. What does `backend/main.py` do?

It starts the FastAPI app, configures CORS, initializes the database, registers routers, and serves static audio and recording files.

### Q88. What does `backend/database.py` do?

It defines models, database initialization, and DB session management.

### Q89. What does `backend/routers/auth.py` do?

It handles register, login, Google auth, resume APIs, and `/me`.

### Q90. What does `backend/routers/interview.py` do?

It handles question generation and answer/session evaluation endpoints.

### Q91. What does `backend/routers/stats.py` do?

It handles session saving, video upload, review posting, and analytics retrieval.

### Q92. What does `backend/services/auth_service.py` do?

It handles password hashing and JWT creation/validation.

### Q93. What does `backend/services/prompt_service.py` do?

It builds the interviewer prompt using role, experience, interview type, resume, previous answer, and memory context.

### Q94. What does `backend/services/openrouter_service.py` do?

It sends requests to OpenRouter and parses response content.

### Q95. What does `backend/services/llm_interview_service.py` do?

It validates LLM outputs, cleans bad responses, normalizes JSON evaluation, and coordinates fallback-safe LLM usage.

### Q96. What does `backend/services/interview_engine.py` do?

It provides rule-based question generation, follow-up logic, and answer evaluation.

### Q97. What does `backend/services/question_fetcher.py` do?

It fetches public question examples to ground prompt quality.

### Q98. What does `backend/services/session_memory_service.py` do?

It summarizes saved session history so future questions can be personalized.

### Q99. What does `backend/services/voice_service.py` do?

It converts question text into spoken audio files using `edge-tts`.

---

## 20. Best final closing answer

### Q100. In one strong answer, explain your complete project.

Short answer:

My project, PrepZona, is a full AI mock interview platform built with React and FastAPI. It supports login, resume-based setup, technical and HR interview modes, AI plus fallback question generation, browser voice input, question audio playback, session recording, detailed feedback, saved history, and analytics. I designed it as a realistic interview workflow rather than just a question bank, and I also added reliability features like fallback scoring and deployment-ready configuration.

Keywords:

Full workflow, personalization, reliability, analytics.

---

## 21. 60-second speaking script

This project is an AI-powered interview practice platform called PrepZona. I built the frontend in React and the backend in FastAPI. A user can log in, choose a role and interview type, upload a resume, answer questions by voice, and receive AI-generated feedback with analytics. I used OpenRouter for LLM-based question generation and evaluation, but I also built a fallback rule-based engine so the system still works if the AI call fails. I stored users, resumes, sessions, answers, and reviews in SQLite using SQLAlchemy, and I added audio generation, recording upload, and chart-based performance tracking to make the project feel like a complete product.

---

## 22. 15-second memory trick

Remember the project in this order:

Login -> setup -> resume -> ask question -> play audio -> listen to answer -> record session -> evaluate -> save -> analyze.
