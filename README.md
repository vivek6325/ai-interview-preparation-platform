# 🚀 PrepAI - AI-Powered Mock Interview & Career Analytics Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org)
[![React Version](https://img.shields.io/badge/React-19.x-blue.svg)](https://react.dev)
[![Express](https://img.shields.io/badge/Express-5.x-lightgrey.svg)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen.svg)](https://www.mongodb.com/atlas)
[![Vite](https://img.shields.io/badge/Vite-8.x-purple.svg)](https://vitejs.dev)

> **PrepAI** is a production-grade, full-stack AI Career Coach and Mock Interview Platform built on the MERN stack (MongoDB, Express, React, Node.js 22) and Google Gemini AI. It empowers software engineers, developers, and candidates to practice real-time voice and text mock interviews, receive STAR-framework aligned evaluation scorecards, detect skill weaknesses, and track multi-dimensional career progress.

---

## ✨ Key Features

- **🎙️ Real-Time Voice Interviewer**:
  - Native Web Speech API integration (`SpeechRecognition` & `SpeechSynthesis`).
  - Auto-reads interview questions aloud with voice, pitch, and speed rate controls.
  - Generates live transcript with real-time editing before submission.
  - Tracks speaking duration, words spoken, and average words per answer.

- **🤖 AI Question & Evaluation Pipeline**:
  - Uses Google Gemini 3.6 Flash / 1.5 Pro to formulate customized, role-tailored interview questions.
  - Grades answers out of 10 with itemized STAR strengths, improvement areas, and suggestions.
  - Generates comprehensive overall scorecard reports and hiring recommendations.

- **📄 ESM PDF Resume Parser**:
  - Modern ESM PDF parser running natively on Node.js 22.
  - Extracts skills, experience level, and technologies to customize mock questions dynamically.

- **📊 SaaS AI Career Coach & Visual Analytics**:
  - **Multi-Dimensional Skill Radar**: Evaluates Communication, Technical Knowledge, Problem Solving, Confidence, Behavioral, and Coding.
  - **Score Timeline & Rolling Average**: Line & area SVG graph tracking score progression over time.
  - **Difficulty & Type Distributions**: Doughnut & bar charts breaking down practice focus.
  - **Practice Activity Heatmap**: Calendar density grid tracking practice consistency.
  - **Weakness Detection Engine**: Automatically identifies top 5 weaknesses, top 5 strengths, repeated mistakes, and urgency level.
  - **Personalized 4-Week Practice Roadmap**: Formulates phase-by-phase daily and weekly goals.
  - **Milestones & Streaks**: Active streak tracking, achievement badges, and AI readiness index.

- **📂 Enhanced Practice Vault & Report Exports**:
  - Multi-criteria search, filters (date range, type, difficulty, score range, status, topic), sorting, pagination, and quick report previews.
  - Export report capabilities in **CSV** and **PDF** formats.

- **🔒 Enterprise Security & Performance**:
  - Helmet HTTP security headers, CORS domain whitelisting, Express rate limiting, gzip compression.
  - Input sanitization, Request timing headers (`X-Response-Time`), MongoDB connection pooling (`maxPoolSize: 10`), compound indexes.
  - React route code-splitting (`React.lazy` / `Suspense`), Error Boundary, 404 handler, and graceful process shutdown.

---

## 🏗️ Architecture Overview

```
 ┌───────────────────────────────────────────────────────────┐
 │                   React 19 Frontend (Vite)                │
 │  (Voice Engine, SVG Radar/Timeline Charts, SaaS Dashboard)│
 └─────────────────────────────┬─────────────────────────────┘
                               │ HTTPS / JSON API
 ┌─────────────────────────────▼─────────────────────────────┐
 │                Express 5 Node.js 22 Backend               │
 │  (Helmet, Cors, RateLimiter, Compression, ErrorHandlers)  │
 └──────┬──────────────────────┬──────────────────────┬──────┘
        │                      │                      │
 ┌──────▼──────┐        ┌──────▼──────┐        ┌──────▼──────┐
 │   MongoDB   │        ┌  Gemini AI  │        │  PDF Parser │
 │ (Atlas/Pool)│        │   Engine    │        │ (Node 22 ESM│
 └─────────────┘        └─────────────┘        └─────────────┘
```

---

## 📁 Repository Folder Structure

```
.
├── backend/
│   ├── server.js                        # Express server entry point with security & graceful shutdown
│   └── src/
│       ├── config/
│       │   ├── db.js                    # MongoDB connection pooling & health check
│       │   └── env.js                   # Environment variable validation & abstraction
│       ├── controllers/
│       │   ├── aiController.js          # AI question generation & resume parsing
│       │   ├── analyticsController.js   # Analytics & export HTTP controller
│       │   ├── authController.js        # Authentication & JWT issue
│       │   └── interviewController.js   # Session management
│       ├── middleware/
│       │   ├── authMiddleware.js        # JWT Bearer token authentication
│       │   ├── errorHandler.js          # 404 & global error handling
│       │   └── security.js              # Helmet, CORS, Rate Limiters, Timers
│       ├── models/
│       │   ├── Interview.js             # Mongoose schema with compound indexes
│       │   └── User.js                  # Mongoose user auth schema
│       ├── routes/                      # Express domain route modules
│       └── services/
│           ├── aiService.js             # Gemini integration & prompt builder
│           ├── analyticsService.js      # Core analytics & practice plan engine
│           └── ai/pdfParser.js          # ESM PDF text extraction
├── src/
│   ├── components/
│   │   ├── analytics/                   # SVG Skill Radar, Timeline, Heatmap, Weakness components
│   │   ├── interview/                   # VoiceRecorder, MicrophoneButton, VoiceControls, TranscriptBox
│   │   ├── ErrorBoundary/               # React Error Boundary fallback
│   │   ├── Loading/                     # Global loading spinner
│   │   └── Navbar/                      # Navigation bar
│   ├── hooks/                           # Custom React hooks (useSpeechRecognition, useSpeechSynthesis)
│   ├── pages/                           # Dashboard, History, InterviewSession, Results, Login
│   ├── services/                        # Client API & analytics services
│   └── styles/                          # Global CSS tokens
├── DEPLOYMENT.md                        # Production deployment guide
├── INTERVIEW_GUIDE.md                   # Software Engineering demo script
├── render.yaml                          # Render backend deployment manifest
└── vercel.json                          # Vercel SPA routing configuration
```

---

## 🛠️ Installation & Local Setup

### Prerequisites
- **Node.js**: v22.x or higher
- **npm**: v10.x or higher
- **MongoDB**: Local MongoDB instance or MongoDB Atlas URI
- **Gemini API Key**: Free key from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-username/ai-interview-platform.git
cd ai-interview-platform

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

### 2. Configure Environment Variables

Create `.env` inside `backend/`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ai_interview_platform
JWT_SECRET=your_super_secret_jwt_key_here
GEMINI_API_KEY=your_google_gemini_api_key_here
CLIENT_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

Create `.env` inside root (`/`):

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Development Servers

In terminal 1 (Backend):
```bash
cd backend
npm run dev
```

In terminal 2 (Frontend):
```bash
npm run dev
```

Open `http://localhost:5173` in Google Chrome or Microsoft Edge.

---

## 🌐 API Endpoint Summary

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status, DB connection, uptime | No |
| `POST` | `/api/auth/register` | User account registration | No |
| `POST` | `/api/auth/login` | User login & JWT issuance | No |
| `GET` | `/api/interviews` | Fetch all user interview records | Yes |
| `POST` | `/api/interviews` | Create a new pending interview session | Yes |
| `PATCH` | `/api/interviews/:id` | Update interview answers & evaluation | Yes |
| `POST` | `/api/ai/generate` | Generate AI questions via Gemini | Yes |
| `POST` | `/api/ai/evaluate` | Evaluate single answer response | Yes |
| `POST` | `/api/ai/upload-resume` | Parse PDF resume & extract skills | Yes |
| `GET` | `/api/analytics` | Full AI Career Coach analytics payload | Yes |
| `GET` | `/api/analytics/history` | Filtered history with pagination | Yes |
| `GET` | `/api/analytics/export` | Export analytics as CSV or PDF payload | Yes |

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👤 Author

**Vivek Aripalli**  
- Portfolio / GitHub: [vivek6325](https://github.com/vivek6325)  
- Role: Full Stack Engineer & Software Architect
