# PrepAI | AI-Powered Interview Preparation Platform 🚀

[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

An advanced, responsive, and feature-rich simulator designed to help candidates prepare for technical and behavioral job interviews. Using an integrated evaluation engine, PrepAI provides real-time question generation, structured STAR-framework answer assessment, interactive progress analytics, and downloadable performance reports.

---

## 🌟 Key Features

*   **Real-Time Interview Flow:** A timed, immersive simulator that mimics real-world technical and behavioral interview formats.
*   **AI-Generated Assessments:** Dynamic question categorization mapping to Software Engineering, Frontend, Backend, and HR/Behavioral paths.
*   **Smart Feedback Engine:** Comprehensive answer evaluation analyzing response length, logical transition structures, and technical key terms with feedback on strengths and improvements.
*   **Interactive Analytics Dashboard:** Deep metrics charting historical mock scores, categories mastered, and overall progression indicators.
*   **Exportable Reports:** One-click functionality to export grading summaries and review records for offline study.
*   **Dual-Database Hybrid Architecture:** Automatic, seamless client/server data synchronizations allowing full app operation even when the database is offline.

---

## 🛠️ Tech Stack

### Frontend
*   **Core:** React (v19)
*   **Styling:** Premium Custom Vanilla CSS (Glassmorphism design language, customized dynamic dark themes, micro-animations, responsive layout grids)
*   **Routing:** React Router (v7)
*   **Build Utility:** Vite

### Backend
*   **Server Framework:** Express (Node.js)
*   **Database:** MongoDB via Mongoose ODM
*   **AI Logic:** Built-in semantic NLP parser (analyzing length, STAR structure, and category keyword matching)

---

## 📂 Folder Structure

```text
ai-interview-preparation-platform/
├── backend/                       # Express Node Server
│   ├── src/
│   │   ├── config/                # DB Connectors & Constants
│   │   ├── controllers/           # API Logic (Evaluation Engine & CRUDs)
│   │   ├── middleware/            # Request interceptors
│   │   ├── models/                # MongoDB Mongoose Schemas (Interview & Question)
│   │   ├── routes/                # API Endpoints
│   │   └── utils/                 # General helpers
│   ├── .env                       # Backend Environment Settings
│   ├── server.js                  # App startup script
│   └── package.json
├── public/                        # Static Assets (Favicon, SVGs)
├── src/                           # React Frontend Source
│   ├── assets/                    # Graphical icons and components
│   ├── components/                # Reusable UI Components (Navbar, Features, Toast, ProtectedRoute)
│   ├── constants/                 # Action limits & route strings
│   ├── pages/                     # Routed views (Dashboard, History, Home, Interview, Login, Results)
│   ├── services/                  # API fetch clients & client-side fallbacks
│   ├── styles/                    # Global visual stylesheets
│   ├── utils/                     # Formatting helpers & document export
│   ├── App.jsx                    # Routing configuration
│   └── main.jsx                   # React mounting script
├── index.html                     # Entry HTML document (with SEO optimized header)
├── vite.config.js                 # Vite compiler settings
└── package.json
```

---

## 🔌 Environment Variables

### Backend (`/backend/.env`)
Create a `.env` file in the `/backend` folder with:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai_interview_platform
```

### Frontend (Root Workspace Environment)
You can optionally create a `.env` file in the root directory for production hosting:
```env
VITE_API_URL=https://your-backend-service-url.com/api
```
*(If left empty, the client automatically defaults to `http://localhost:5000/api` for local execution).*

---

## ⚙️ Installation & Running Locally

### 1. Start the Backend Server
```bash
cd backend
npm install
npm run dev
```
*The server will startup and listen on `http://localhost:5000` with the health check available at `/api/health`.*

### 2. Start the Frontend Application
In a separate terminal shell from the root workspace directory:
```bash
npm install
npm run dev
```
*Vite will compile and launch the application on `http://localhost:5173`.*

---

## 📸 Screenshots Section

| Dashboard View | Simulator View |
|:---:|:---:|
| ![Dashboard Placeholder](https://via.placeholder.com/600x350/1e1e24/ffffff?text=Dashboard+Analytics) | ![Simulator Placeholder](https://via.placeholder.com/600x350/1e1e24/ffffff?text=Interview+Simulator) |

| Results Report | History Log |
|:---:|:---:|
| ![Results Placeholder](https://via.placeholder.com/600x350/1e1e24/ffffff?text=Evaluation+Report) | ![History Placeholder](https://via.placeholder.com/600x350/1e1e24/ffffff?text=History+List) |

---

## 🔮 Future Improvements

1.  **AI Voice Interviews:** Integration of the Web Speech API (Speech-to-Text and Text-to-Speech) for fully conversational mock reviews.
2.  **Webcam & Facial Expression Analysis:** Real-time sentiment estimation to assess candidate posture, confidence levels, and eye-contact.
3.  **Dynamic AI Interactivity:** An interactive avatar host that responds conversationally using large language model (LLM) agents.

---

## 👤 Author

**Vivek Aripalli**
*   GitHub: [@vivekaripalli](https://github.com/vivekaripalli)
*   LinkedIn: [Vivek Aripalli](https://linkedin.com/in/vivekaripalli)
