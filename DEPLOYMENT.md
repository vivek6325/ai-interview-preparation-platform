# 🚀 Production Deployment Guide

This guide walks through deploying the **AI Interview Preparation Platform** to production using **Vercel** (Frontend), **Render** (Backend Node.js API), and **MongoDB Atlas** (Cloud Database).

---

## 1. MongoDB Atlas Database Setup

1. Log into [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Cluster (M0 Free Tier or Dedicated M10+).
3. Under **Database Access**, create a database user with read/write permissions.
4. Under **Network Access**, add IP whitelist `0.0.0.0/0` to allow connections from Render/Vercel.
5. Copy the MongoDB Connection String:
   ```
   mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/ai_interview_platform?retryWrites=true&w=majority
   ```

---

## 2. Backend Deployment on Render

1. Log into [Render](https://render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository (`ai-interview-preparation-platform`).
4. Set the following settings:
   - **Name**: `ai-interview-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add the following **Environment Variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGODB_URI`: `<Your MongoDB Atlas URI>`
   - `JWT_SECRET`: `<Generate a random 32+ character string>`
   - `GEMINI_API_KEY`: `<Your Google Gemini API Key>`
   - `CLIENT_URL`: `https://your-app-name.vercel.app`
   - `ALLOWED_ORIGINS`: `https://your-app-name.vercel.app`
6. Click **Create Web Service**. Note the deployed URL (e.g. `https://ai-interview-backend.onrender.com`).

---

## 3. Frontend Deployment on Vercel

1. Log into [Vercel](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository (`ai-interview-preparation-platform`).
4. Set the Framework Preset to **Vite**.
5. Set **Root Directory** to `./`.
6. Add Environment Variable:
   - `VITE_API_URL`: `https://ai-interview-backend.onrender.com/api`
7. Click **Deploy**.

Vercel will build the frontend using `vercel.json` SPA routing rewrites.

---

## 4. Production Post-Deployment Verification Checklist

- [ ] Open `https://ai-interview-backend.onrender.com/api/health` and verify `status: "success"` and `database.isConnected: true`.
- [ ] Open `https://your-app-name.vercel.app` and register a new user account.
- [ ] Test uploading a PDF resume to ensure Node 22 ESM PDF parsing works cleanly.
- [ ] Conduct a Voice Mock Interview session to verify Web Speech API recognition and Text-To-Speech.
- [ ] Check the SaaS Dashboard to verify SVG Radar Chart and score progress timeline.
- [ ] Export a CSV report from the History view.
