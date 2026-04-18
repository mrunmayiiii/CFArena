# 🛠️ Postman API Testing Guide

This document lists all active backend API routes in your project and explains how to test them sequentially using Postman.

All backend APIs are hosted at: `http://localhost:8080`

---

## 1️⃣ Authentication (`/auth`)

These are **public** routes, meaning you do not need an Authorization header to test them.

### `POST /auth/register`
Creates a brand new user in the MongoDB database.
* **Headers:** `Content-Type: application/json`
* **Body (JSON):**
  ```json
  {
    "name": "John Doe",
    "email": "johndoe@example.com",
    "password": "securepassword123",
    "cfHandle": "tourist"
  }
  ```

### `POST /auth/login`
Logs in a user and returns a JSON Web Token (JWT).
* **Headers:** `Content-Type: application/json`
* **Body (JSON):**
  ```json
  {
    "email": "johndoe@example.com",
    "password": "securepassword123"
  }
  ```
> [!IMPORTANT]
> **Capture the Token**: When you hit the `/auth/login` endpoint, it will return a JWT token string. You must copy this token. For all subsequent requests listed below, you must go to the **Authorization** tab in Postman, select **Bearer Token**, and paste this token!

---

## 2️⃣ User Management (`/user`)
*Requires Bearer Token from Login*

### `GET /user/me`
Fetches the currently authenticated user's details.
* **Headers:** `Authorization: Bearer <your_jwt_token>`

### `POST /user/add-cf`
Updates or binds a Codeforces handle to your profile.
* **Headers:** `Authorization: Bearer <your_jwt_token>`, `Content-Type: application/json`
* **Body (JSON):** *(Check your backend DTO for exact shape, usually involves `{ "cfHandle": "newHandle" }`)*

---

## 3️⃣ Matchmaking (`/api/match`)
*Requires Bearer Token from Login. Use these to simulate a duel.*

### `POST /api/match/create`
Generates a new match room. The response will return a unique `matchId`.
* **Headers:** `Authorization: Bearer <your_jwt_token>`
* **Body:** Depending on `MatchSetupRequest`, usually it expects difficulty or duration (you can pass an empty JSON `{}` if defaults are used).

### `POST /api/match/join`
Allows another user to join the created match. (You will need to login with a *different* user account to properly simulate this).
* **Body (JSON):**
  ```json
  {
    "matchId": "id_returned_from_create_endpoint"
  }
  ```

### `POST /api/match/start`
Triggers the match to begin, transitioning the state from waiting to active.
* **Body (JSON):**
  ```json
  {
    "matchId": "your_match_id"
  }
  ```

### `GET /api/match/status`
Retrieves the current leaderboard and problem statuses for everyone in the match.
* **Params:** `?matchId=your_match_id`

---

## 4️⃣ Codeforces Fetching (`/getProblems`)

### `GET /getProblems/{u1}/{u2}`
Fetches Codeforces problems suited for the duel between two CF handles (e.g., handles like `tourist` and `Benq`).
* **URL Example:** `http://localhost:8080/getProblems/tourist/Benq`
