# InterviewIQ / PrepZona PPT Content

This file contains concise content you can paste into the 7-slide presentation template.

## Slide 1: Project Title

**InterviewIQ (PrepZona): An AI-Powered Mock Interview Platform with Personalized Feedback and Performance Analytics**

- Presented by: `Your Name / Group Members`
- Roll No: `Your Roll Number(s)`
- Course / Department: `Your Department`
- Guided by: `Faculty Name`

Short contribution lines for group slide:
- Member 1: Built authentication, backend APIs, and interview workflow
- Member 2: Developed frontend UI and integrated services
- Member 3: Worked on database design, analytics, and testing

## Slide 2: Abstract

- InterviewIQ is an AI-powered mock interview platform designed to simulate a realistic interview experience.
- Users can log in, choose role and interview type, upload resumes, answer spoken questions, and receive AI-assisted feedback.
- The system combines FastAPI, React, SQLite, JWT authentication, speech recognition, and text-to-speech support.
- It also stores completed sessions and presents analytics such as scores, trends, and performance history.
- The goal is to make interview preparation more interactive, personalized, and data-driven.

## Slide 3: Related Works

- Traditional interview-preparation platforms mainly provide static question banks and limited personalization.
- Resume-based screening tools focus only on profile analysis and do not simulate real interview interaction.
- AI chat systems can generate questions, but they often lack structured session tracking and analytics.
- InterviewIQ improves on these approaches by combining resume-aware question generation, speech-based answering, evaluation, and progress tracking in one platform.

## Slide 4: Our Methodology

- Followed a modular full-stack development approach using React for frontend and FastAPI for backend.
- Designed JWT-based authentication for secure login and session management.
- Implemented resume upload and text extraction to personalize interview context.
- Built AI-assisted question generation and evaluation with fallback rule-based logic for reliability.
- Integrated browser speech recognition, media recording, and text-to-speech for an interactive interview flow.
- Stored session results in a normalized database for analytics, history, and review.

## Slide 5: System Workflow Diagram

Use this simple workflow in the diagram slide:

`User -> Login / Setup -> Resume Upload -> Interview Engine -> AI / Rule-Based Question Generation -> Speech Answer Capture -> Session Evaluation -> Feedback & Analytics`

Short explanation bullets:
- User signs in and selects role, experience level, and interview type.
- Resume text and user context are sent to the backend.
- Backend generates questions using AI, with fallback logic if needed.
- User answers through voice input; session can also be recorded.
- Final answers are evaluated and saved for feedback and analytics.

## Slide 6: Results

- Successfully developed a working AI-based mock interview platform.
- Implemented secure authentication with support for normal login and Google login.
- Enabled resume-guided question generation and spoken answer capture.
- Added fallback question and scoring engines to keep the system usable even if AI services fail.
- Generated feedback reports and analytics such as average score, best score, streak, and session history.
- Created a scalable project structure with clear separation between frontend, backend, and services.

## Slide 7: References

Use these references in short academic format:

1. React Documentation, [https://react.dev](https://react.dev)
2. FastAPI Documentation, [https://fastapi.tiangolo.com](https://fastapi.tiangolo.com)
3. SQLAlchemy Documentation, [https://www.sqlalchemy.org](https://www.sqlalchemy.org)
4. Tailwind CSS Documentation, [https://tailwindcss.com](https://tailwindcss.com)
5. OpenRouter Documentation, [https://openrouter.ai/docs](https://openrouter.ai/docs)
6. Recharts Documentation, [https://recharts.org](https://recharts.org)

## Suggested Final Project Title Options

Choose one of these depending on how formal you want the PPT to sound:

1. InterviewIQ: An AI-Powered Mock Interview Platform with Personalized Feedback
2. PrepZona: Smart Interview Preparation System Using AI and Speech Recognition
3. InterviewIQ (PrepZona): Intelligent Mock Interview Platform with Resume-Based Evaluation

## Very Short Viva Closing Line

"InterviewIQ is designed to make interview preparation more realistic by combining AI-generated questions, spoken responses, automated evaluation, and performance analytics in one unified platform."
