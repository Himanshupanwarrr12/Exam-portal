# 🎓 Exam Portal - Online Examination System

A premium, full-stack, secure Online Examination System designed for educational institutions and organizations. The system features a distinct division of access roles (Admins and Students) with administrative dashboards, exam curation tools, and a robust interactive exam-taking engine equipped with real-time state persistence and auto-submission capabilities.

Built using **React** and **TailwindCSS** on the frontend, and **Express**, **Prisma**, and **PostgreSQL** on the backend.

---

## 🌟 Key Features

### 🔑 Authentication & Split-Screen Experience
*   **Dual Roles:** Supported roles are `ADMIN` and `STUDENT` mapped within a single PostgreSQL database.
*   **Secure JWT Auth:** State-maintained secure authentication utilizing JSON Web Tokens with client-side Redux store state persistence.
*   **Encrypted Passwords:** Secure user password storage powered by `bcryptjs` hashing.
*   **Split-Screen Layout:** Responsive layout splitting authentication (Login & Register) into a visual student illustration sidebar (light sea-blue background) and a centered form container on desktop, collapsing cleanly to form-only on mobile devices.

### 🛡️ Admin Dashboard & Workspace
*   **Enlarged Typography Scale:** Redesigned page headings, stat cards, and tables with increased typography size scales for high legibility.
*   **Soft Tinted Background Wash:** App canvas uses a gentle light-blue background (`#f0f7ff`) with crisp border slate cards to pop elements clearly.
*   **Exam Curation Workspace:** The Question page utilizes an inline card builder workspace rather than popup modals, allowing admins to add/edit MCQs in a single, focused side-by-side desktop layout (stacks on mobile).
*   **Inline Key Mapping:** MCQ choices A, B, C, D directly integrate radio check selectors to map correct answers inside the options grid.
*   **Student Registry:** List all registered students, review exam history, and monitor scores across all exams.

### 📝 Student Panel & Exam Engine
*   **Student Dashboard:** Track personal stats, completed exams, and recent performance.
*   **Exams Portal:** Filter and access available tests currently within their active time window.
*   **Real-time Exam Engine:**
    *   **Auto-save Progress:** Student selections are immediately synced (`upsert` operations) to the server to prevent data loss on browser crash/refresh.
    *   **Time-limit Engine:** Client-side timer synced with server-side validation.
    *   **Auto-submission:** Automatically packages and submits the exam when the timer expires.
    *   **Access Guards:** Prevents starting multiple concurrent attempts for the same exam.
*   **Instant Grading:** Automated server-side grading comparing student responses to the question answer keys immediately upon submission.

### 🛡️ Exam Publish & Question-Guard Workflow
*   **Zero-Question Exam Prevention:** Exams with no questions are automatically filtered out from student listings at the database level (`questions: { some: {} }`).
*   **Attempt Guard:** The server rejects attempts on zero-question exams with a direct `400` error as a secondary layer of defense.
*   **Admin Warnings & Redirection:**
    *   Creating a new exam redirects admins directly to the question manager with a temporary contextual warning banner.
    *   Exams list pages display an amber `⚠ No questions` warning pill for unconfigured exams, linking directly to the question editor.

### ⚡ Performance Optimization
*   **Collapsed Redundant Checks:** Reduced sequential Prisma database queries into single, consolidated queries for questions lookup.
*   **Parallelized Database Lookups:** Concurrent query orchestration using `Promise.all` for exam metrics queries, reducing average page load latencies by ~250ms.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React.js (Vite) | Single Page Application framework |
| | Redux Toolkit | Global state management for Auth and exam flow |
| | TailwindCSS | Modern utility-first styling |
| | React Router DOM | Client-side routing and protected routes |
| | Axios | HTTP client for backend REST API communication |
| **Backend** | Node.js / Express | Fast, unopinionated REST API web server |
| | Prisma ORM (v7) | Next-generation SQL toolkit and query builder |
| | PostgreSQL | Enterprise-grade relational database |
| | JSON Web Tokens | Stateless authorization mechanism |

---

## 📂 Project Structure

The project is structured into a clean monorepo architecture divided into frontend client and backend server:

```text
webExam/
├── backend/                  # Express API Server & Database configuration
│   ├── prisma/               # Database Schema, Migrations, and Seeds
│   │   ├── schema.prisma     # Prisma database schema definition
│   │   └── seed.js           # Idempotent database seed script
│   ├── src/
│   │   ├── controllers/      # Route controllers (Auth, Exam, Admin, Attempts)
│   │   ├── lib/              # Shared library initializers (Prisma client)
│   │   ├── middleware/       # JWT auth & admin protection middlewares
│   │   ├── routes/           # REST API endpoints mapping
│   │   └── index.js          # App entry point and route mounting
│   ├── .env.example          # Environment variables template
│   └── package.json
└── frontend/                 # React Single Page Application (Vite)
    ├── src/
    │   ├── api/              # Axios instance configuration
    │   ├── components/       # Shared UI components (Layout, Navbar, Loader)
    │   ├── pages/            # Page Views (Admin, Auth, Student panels)
    │   ├── routes/           # Protected Route Guards (AdminRoute, StudentRoute)
    │   ├── store/            # Redux store configurations and slices
    │   ├── App.jsx           # Main application routing configuration
    │   └── main.jsx          # React DOM entry point
    └── package.json
```

---

## 🚀 Setup & Installation

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18.x or higher recommended)
*   [PostgreSQL](https://www.postgresql.org/) database instance (local instance or hosted cloud server like [Neon.tech](https://neon.tech/))

---

### 1. Backend Configuration & Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure environment variables:**
    Copy the template environment file:
    ```bash
    cp .env.example .env
    ```
    Open `.env` and fill in the required values:
    *   `DATABASE_URL`: Your PostgreSQL connection string.
    *   `JWT_SECRET`: A long random secure string used to sign JWTs.
    *   `PORT`: Port for backend server (default: `5000`).

4.  **Database Migration:**
    Push the schema to your PostgreSQL database and generate the Prisma Client:
    ```bash
    npx prisma migrate dev --name init
    ```

5.  **Seed the Database:**
    Populate the database with pre-configured Admin and Student accounts:
    ```bash
    npm run seed
    ```

6.  **Run the Server:**
    Start the backend Express server in development mode:
    ```bash
    npm run dev
    ```
    The server will run on `http://localhost:5000`.

---

### 2. Frontend Configuration & Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd ../frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure environment variables:**
    Ensure `.env` exists with the following configuration:
    ```env
    VITE_API_BASE_URL=/api
    ```
    *(Vite proxy redirects `/api` to `http://localhost:5000` automatically during development to avoid CORS issues.)*

4.  **Run the Application:**
    Start the Vite development server:
    ```bash
    npm run dev
    ```
    The frontend application will be hosted on `http://localhost:5173`.

---

## 🔑 Test Credentials

Use the following seeded accounts to log in and explore the application:

### 🛡️ Administrator Access
*   **Email:** `admin@examportal.com`
*   **Password:** `Admin@1234`

### 🎓 Student Access
*   **Email:** `student@examportal.com`
*   **Password:** `Student@1234`

---

## 📡 API Endpoints Reference

The backend Express server exposes the following REST APIs:

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Register a new user profile | Public |
| **POST** | `/api/auth/login` | Authenticate user and issue JWT | Public |
| **GET** | `/api/auth/me` | Fetch active user profile from JWT | Authenticated |
| **GET** | `/api/exams` | Get all created exams | Admin |
| **POST** | `/api/exams` | Create a new exam window | Admin |
| **GET** | `/api/exams/available` | List exams currently open for attempts | Student |
| **GET** | `/api/exams/:id` | Get metadata for a specific exam | Authenticated |
| **GET** | `/api/questions` | Get all questions for an exam | Authenticated |
| **POST** | `/api/questions` | Add a question to an exam | Admin |
| **GET** | `/api/admin/stats` | Retrieve global statistics | Admin |
| **GET** | `/api/admin/students` | Get all registered student list | Admin |
| **GET** | `/api/attempts/status/:examId` | Check active attempt status | Student |
| **POST** | `/api/attempts/start` | Initialize an exam attempt | Student |
| **POST** | `/api/attempts/save` | Auto-save/update question answers | Student |
| **POST** | `/api/attempts/submit` | Finalize and grade an exam attempt | Student |
| **GET** | `/api/results/my` | Retrieve student's attempt history | Student |
| **GET** | `/api/results/:attemptId` | Retrieve graded feedback & details | Student / Admin |
