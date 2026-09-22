# JobTrack — Intelligent Job Application Tracker & Browser Extension

[![JavaScript](https://img.shields.io/badge/Language-Pure%20JavaScript-F7DF1E.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Stack](https://img.shields.io/badge/Stack-MERN%20(Mongo%20%7C%20Express%20%7C%20React%20%7C%20Node)-6366f1.svg)](https://react.dev)
[![Extension](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-10b981.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**JobTrack** is a modern full-stack SaaS ecosystem built with the **MERN stack** (MongoDB, Express.js, React.js, Node.js) and a **Manifest V3 Chrome Extension** designed to streamline, organize, and accelerate the job application process for job seekers, students, and software engineers.

---

## 1. Problem Statement

Active job seekers submit dozens or hundreds of applications across multiple job platforms: **LinkedIn, Indeed, Naukri, Greenhouse, Lever, Glassdoor, Wellfound, and direct career portals**. After numerous submissions, candidates frequently lose track of:
* Which companies and roles they applied for
* Submission dates and job posting URLs
* Which tailored resume version was submitted
* Stage in the recruitment pipeline (Applied, Assessment, Interview, Offer, Rejection)
* Scheduled interview rounds, meet links, and interviewer details
* Actionable follow-up reminders and recruiter touchpoints
* Job descriptions and required skill alignments

**JobTrack solves this** through an automated 1-second capture Chrome Extension connected in real time to an Express & MongoDB backend, paired with an interactive React dashboard.

---

## 2. Architecture & Data Flow

```
+-------------------------------------------------------------------------+
|                              JOB PORTALS                                |
|   (LinkedIn  *  Indeed  *  Naukri  *  Greenhouse  *  Lever  *  Career)   |
+-------------------------------------------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                  MANIFEST V3 CHROME BROWSER EXTENSION                   |
|   * Content Script Scrapers (parsers/linkedin.js, indeed.js, etc.)      |
|   * Live Extraction & Confirmation Popup                               |
|   * Chrome Storage Auth & Token Sync                                   |
+-------------------------------------------------------------------------+
                                     |
                                     | Authenticated REST API (JWT)
                                     v
+-------------------------------------------------------------------------+
|                     EXPRESS.JS + NODE.JS BACKEND                        |
|   * JWT Authentication & Password Hashing (bcrypt)                      |
|   * Company Deduplication & Auto-Logo Discovery                        |
|   * Immutable Event Timeline Engine                                    |
|   * Multer Resume Storage & Technical Skill Parser                      |
|   * AI Career Copilot Service (JD Parsing, Summaries, Skill Matching)  |
|   * Rate Limiting, Helmet Security, & Input Sanitization               |
+-------------------------------------------------------------------------+
          |                                            |
          v                                            v
+-------------------+                        +--------------------+
|      MONGODB      |                        |  REACT WEB CLIENT  |
|  * Users          |                        |  * KPI Dashboard   |
|  * Applications   |                        |  * Kanban Board    |
|  * Events History | <--------------------> |  * Resume Vault    |
|  * Resumes        |                        |  * Interviews & Cal|
|  * Interviews     |                        |  * Reminders List  |
|  * Reminders      |                        |  * Analytics Charts|
|  * Companies      |                        |  * AI Matcher UI   |
+-------------------+                        +--------------------+
```

---

## 3. Key Features

### 🧩 Manifest V3 Chrome Extension
* **Modular Site Parsers**: Tailored DOM scrapers for `LinkedIn`, `Indeed`, `Naukri`, `Greenhouse`, `Lever`, plus a robust `generic.js` Schema.org JSON-LD parser.
* **Instant Extraction**: Automatically detects role title, company name, location, salary, job URL, and raw job descriptions.
* **1-Click Tracking**: Choose pipeline status and linked resume version directly from the popup.
* **Direct JWT Sync**: Integrates with the Express backend using secure JWT Bearer authorization.

### 📊 Modern React Dashboard
* **Pipeline KPIs**: Total applications, submissions this week/month, scheduled interviews, and offer rates.
* **Dynamic Applications Table**: Full multi-filter support (by Status, Source, Job Type, and Resume used) with instant search.
* **Drag-and-Drop Kanban Board**: Visual columns for `Saved`, `Applied`, `Assessment`, `Interview`, `Offer`, `Rejected` with optimistic status updates.
* **Immutable Milestone Timeline**: Chronological history tracking every status change, assessment receipt, and interview scheduled.
* **Resume Vault**: Version management (e.g., *SWE Resume v2*, *ML Engineer Resume*), local/Cloudinary storage, and auto-extracted technical skill tags.
* **Interview Scheduler**: Track rounds, dates, times, video meeting links, interviewers, and preparation notes.
* **Actionable Reminders**: Checklist with overdue alerts for recruiter follow-ups and take-home deadlines.
* **Factual Analytics**: Applications cadence over time, source conversion breakdown, and pipeline distribution.
* **AI Career Copilot**: Structured JD analysis, executive summaries, and informational resume-to-job matching percentages.

---

## 4. Tech Stack (Strict Pure JavaScript)

* **Backend**: Node.js, Express.js, Mongoose (MongoDB), JWT, Bcrypt.js, Multer, Helmet, Cors, Express-Rate-Limit.
* **Frontend**: React 18, Vite, Lucide React, Canvas-Confetti, Custom Vanilla CSS Design System.
* **Extension**: Chrome Manifest V3, Service Workers, Content Scripts, Chrome Storage API.
* **Testing**: Node Test Runner (`node:test`), Supertest.

---

## 5. Folder Structure

```
WebScraper/
├── client/                      # React Frontend (Vite)
│   ├── src/
│   │   ├── components/          # Reusable UI Primitives & Modals
│   │   │   ├── common/          # Modal, Badge, StatCard, EmptyState, Loader
│   │   │   ├── layout/          # Sidebar, Navbar
│   │   │   ├── applications/    # ApplicationTable, FilterPanel, ApplicationModal
│   │   │   ├── kanban/          # KanbanBoard, KanbanColumn, KanbanCard
│   │   │   ├── timeline/        # Timeline, AddEventModal
│   │   │   ├── resumes/         # ResumeUploadModal
│   │   │   ├── interviews/      # InterviewModal
│   │   │   ├── reminders/       # ReminderModal
│   │   │   └── ai/              # AIAssistantModal
│   │   ├── context/             # AuthContext, ToastContext
│   │   ├── pages/               # Dashboard, Applications, Detail, Kanban, Resumes, etc.
│   │   ├── services/            # api.js, domainServices.js
│   │   ├── styles/              # index.css (Design System Tokens)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                      # Node.js + Express Backend API
│   ├── config/                  # db.js, constants.js
│   ├── controllers/             # auth, application, event, resume, interview, reminder, ai, analytics
│   ├── middleware/              # auth.js, errorHandler.js, upload.js
│   ├── models/                  # User, Application, ApplicationEvent, Resume, Interview, Reminder, Company
│   ├── routes/                  # Express REST route endpoints
│   ├── services/                # aiService.js, resumeParser.js, companyService.js
│   ├── test/                    # Automated API & E2E simulation test suites
│   ├── uploads/                 # Local resume file storage
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
├── extension/                   # Manifest V3 Chrome Extension
│   ├── manifest.json
│   ├── background/
│   │   └── service_worker.js    # Lifecycle & storage sync
│   ├── content/
│   │   └── content_script.js    # Injected page scraper orchestrator
│   ├── parsers/                 # linkedin.js, indeed.js, naukri.js, greenhouse.js, lever.js, generic.js
│   ├── popup/                   # popup.html, popup.css, popup.js
│   ├── utils/                   # api.js
│   └── icons/                   # 16, 32, 48, 128 px PNG icons
│
├── test-demo/                   # Mock HTML job pages for offline extension testing
├── README.md
└── .gitignore
```

---

## 6. Local Setup & Installation

### Prerequisites
* Node.js v18+ and npm installed
* MongoDB running locally on port `27017` or a MongoDB Atlas connection string

### 1. Start MongoDB
Ensure MongoDB is running locally:
```bash
# macOS / Linux
mongod --dbpath server/data/db --port 27017
```

### 2. Configure and Start Backend (`server/`)
```bash
cd server
npm install
cp .env.example .env
# Start the backend in development mode
npm start
# Server listens on http://localhost:5001
```

### 3. Start Frontend (`client/`)
```bash
cd ../client
npm install
npm run dev
# Dashboard opens on http://localhost:5173
```

### 4. Load the Chrome Extension
1. Open Google Chrome and navigate to `chrome://extensions`
2. In the top-right corner, turn on **Developer mode**.
3. Click **Load unpacked** in the top-left corner.
4. Select the `extension/` folder from this repository.
5. Pin **JobTrack** to your Chrome toolbar.
6. Open any job posting on LinkedIn, Indeed, or Greenhouse, click the extension icon, and click **Track Application**!

---

## 7. Environment Variables

Create a `server/.env` file with the following variables:

| Variable | Description | Default |
|---|---|---|
| `PORT` | Express server port | `5001` |
| `NODE_ENV` | Environment mode (`development` / `production` / `test`) | `development` |
| `MONGODB_URI` | MongoDB connection URI | `mongodb://127.0.0.1:27017/jobtrack` |
| `JWT_SECRET` | Secret key for signing JWT session tokens | `jobtrack_jwt_secret_key_2026` |
| `JWT_EXPIRE` | JWT token expiration timeframe | `30d` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `GEMINI_API_KEY` | *(Optional)* Google Gemini API key for enhanced JD parsing | *Empty (uses built-in NLP engine)* |

---

## 8. API Specification

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user | Public |
| `POST` | `/api/auth/login` | Log in user and receive JWT | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Bearer |
| `PUT` | `/api/auth/profile` | Update profile settings | Bearer |
| `GET` | `/api/applications` | Query applications with search, filter, and pagination | Bearer |
| `POST` | `/api/applications` | Create application (auto-logs "Application Created" event) | Bearer |
| `GET` | `/api/applications/:id` | Get single application with timeline, interviews & reminders | Bearer |
| `PATCH` | `/api/applications/:id` | Update application (auto-logs "Status Changed" event) | Bearer |
| `DELETE` | `/api/applications/:id` | Cascade delete application and related history | Bearer |
| `GET` | `/api/applications/:id/events` | Chronological event timeline | Bearer |
| `POST` | `/api/applications/:id/events` | Add manual milestone event | Bearer |
| `GET` | `/api/resumes` | List user resumes with usage count | Bearer |
| `POST` | `/api/resumes` | Upload resume file (PDF/DOCX) & parse skills | Bearer |
| `DELETE` | `/api/resumes/:id` | Delete resume | Bearer |
| `GET` | `/api/interviews` | List scheduled & completed interviews | Bearer |
| `POST` | `/api/interviews` | Schedule new interview round | Bearer |
| `PATCH` | `/api/interviews/:id` | Update interview details / status | Bearer |
| `DELETE` | `/api/interviews/:id` | Delete interview | Bearer |
| `GET` | `/api/reminders` | List pending & completed follow-up reminders | Bearer |
| `POST` | `/api/reminders` | Create reminder | Bearer |
| `PATCH` | `/api/reminders/:id` | Toggle reminder completion | Bearer |
| `DELETE` | `/api/reminders/:id` | Delete reminder | Bearer |
| `GET` | `/api/analytics/dashboard` | Aggregated metrics, status distribution, cadence | Bearer |
| `POST` | `/api/ai/parse-jd` | Extract structured tech stack, experience, role from JD | Bearer |
| `POST` | `/api/ai/summarize-jd` | Generate executive JD summary & key qualifications | Bearer |
| `POST` | `/api/ai/match-resume` | Compare resume skills against job description | Bearer |

---

## 9. Running Automated Tests

Run the complete test suite:
```bash
cd server
npm test
```
This executes all 12+ API test suites and E2E simulation suites validating user authentication, application tracking, status transitions, timeline events, interviews, reminders, and AI matching.

---

## 10. Deployment Guide

* **Frontend**: Deploy `client/` to **Vercel** or **Netlify** (`npm run build`).
* **Backend**: Deploy `server/` to **Render** or **Railway** (Node.js web service with environment variables set).
* **Database**: Provision a free cluster on **MongoDB Atlas** and set `MONGODB_URI`.
* **Chrome Extension**: Zip the `extension/` directory and upload to the **Chrome Web Store Developer Dashboard**.
# RoleFlow
