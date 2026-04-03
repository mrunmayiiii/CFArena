# 🚀 CF Duel – Competitive Programming Battle Platform

A full-stack web application that allows users to compete in real-time coding duels using problems inspired by Codeforces. The platform supports authentication, match creation, live tracking, per-question scoring, and a dynamic leaderboard.

---

## 📌 Features

### 🔐 Authentication

* JWT-based authentication system
* Google OAuth login support
* Secure route protection
* Session handling after login

### ⚔️ Duel System

* Create or join coding matches
* Multiple players per match
* Questions assigned per match
* Real-time match tracking

### 🧠 Problem System

* Fetch problems via backend API
* Each problem has a unique ID
* Problems tracked individually per player

### 📊 Scoring System

* Per-question tracking for each player
* Status:

  * ✅ Solved
  * — Not attempted
* Solving one question does NOT affect others
* Leaderboard updates dynamically

### 🔴 Live Question Logic

* Only current question shows **"LIVE"**
* Previous questions:

  * Either "Solved" or "Open"
  * No "LIVE" tag

### 📈 Leaderboard

* Displays:

  * Player names
  * Questions solved
  * Score comparison
* Visual indicators (e.g., red/green bars)

### 🎨 Frontend UI

* Clean dashboard interface
* Dynamic components (React/Vue)
* Toast notifications
* Responsive design

### ☁️ Deployment

* Frontend: Vercel
* Backend: Render
* Database: MongoDB Atlas

---

## 🏗️ Tech Stack

### Frontend

* Vue.js / React (depending on your build)
* HTML, CSS, JavaScript
* Axios for API calls

### Backend

* Spring Boot (Java)
* REST APIs
* JWT Authentication
* OAuth integration

### Database

* MongoDB Atlas

### Deployment

* Vercel (Frontend)
* Render (Backend)

---

## 📂 Project Structure

```
CF-Duel/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── App.vue / App.js
│
├── backend/
│   ├── controller/
│   ├── service/
│   ├── model/
│   ├── repository/
│   └── config/
│
├── database/
│   └── schemas
│
└── README.md
```

---

## ⚙️ Setup Instructions

### 🔧 Prerequisites

* Node.js
* Java (JDK 17+)
* MongoDB Atlas account
* Git

---

### 🖥️ Backend Setup

```bash
cd backend
```

1. Configure `application.properties`:

```
spring.data.mongodb.uri=YOUR_MONGO_URI
jwt.secret=YOUR_SECRET_KEY
```

2. Run backend:

```bash
mvn spring-boot:run
```

---

### 🌐 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Authentication Flow

1. User logs in via:

   * Email/Password OR Google OAuth
2. Backend generates JWT
3. JWT stored in frontend (localStorage)
4. All protected routes require token

---

## 🔄 API Endpoints

### 🔐 Auth

```
POST /auth/login
POST /auth/register
GET  /auth/oauth/google
```

### 🧠 Problems

```
GET /getProblems/{matchId}
```

### ⚔️ Match

```
POST /match/create
POST /match/join
GET  /match/{matchId}
```

### 📊 Submission

```
POST /submit
```

---

## 🧮 Scoring Logic

* Each player has:

```json
{
  "playerId": "user1",
  "questions": {
    "Q1": "Solved",
    "Q2": "-",
    "Q3": "-"
  }
}
```

* Rules:

  * Solving Q1 → Only Q1 becomes "Solved"
  * Other questions remain `—`
  * No auto-fill or propagation

---

## 🧪 Testing (Postman)

### Steps:

1. Login → get JWT
2. Add token in headers:

```
Authorization: Bearer <token>
```

3. Test endpoints:

   * Create match
   * Join match
   * Fetch problems
   * Submit solution

---

## 🚀 Deployment

### Frontend (Vercel)

* Connect GitHub repo
* Auto-deploy on push

### Backend (Render)

* Keep service running
* Use environment variables for secrets

---


## 👩‍💻 Author

Developed as part of a competitive coding platform project to improve real-time problem solving and system design skills.

---

⭐ If you like this project, give it a star!
