# CF Duel (CFArena) - Project Overview & Workflow

## 🎯 Scope and Concept
**CF Duel (CFArena)** is a full-stack, real-time multiplayer competitive programming battle platform. Its main purpose is to allow developers to create or join "duels" to solve programming problems (inspired by Codeforces) simultaneously, while competing against friends in a real-time leaderboard setting.

## 🏗️ Technology Stack
* **Frontend**: Built using **React 19** and configured with **Vite** (located in the `myapp/` folder). It uses `react-router-dom` for client-side routing, `axios` for HTTP requests, and `@react-oauth/google` for handling Google OAuth flows.
* **Backend**: Powered by **Java 17+** with **Spring Boot** (located in the `Backend/` folder). It's built with standard MVC layers (`controller`, `service`, `repository`, `model`) and follows a microservice-like RESTful architecture.
* **Database**: **MongoDB Atlas** is the designated cloud NoSQL database, with data models tracked and persisted using Spring Data MongoDB (via `mongod` URIs in `application.properties`).
* **Security**: Handled via stateless **JWT (JSON Web Tokens)** coupled with an OAuth2 strategy. 

---

## 🔄 End-to-End Workflow

Here is how a user experiences and navigates the platform from start to finish:

### 1. Authentication & Onboarding
* **Login/Registration**: The user arrives on the frontend side and chooses to authenticate either by standard Email & Password registration or through **Google OAuth** login. 
* **Token Issuance**: The frontend sends the credentials to backend endpoints (`/auth/login`, `/auth/register`, or `/auth/oauth/google`). The `AuthController` validates the user and issues a **JWT Token**.
* **Session Management**: The frontend stores the JWT in local storage. All subsequent requests to guarded routes (like joining matches or submitting code) will contain this token in the header (`Authorization: Bearer <token>`).

### 2. The Matchmaking Process
* **Host a Match**: A player creates a room via `POST /match/create` provided by the `MatchController`. This provisions a new room in MongoDB, returning a unique `matchId`.
* **Join a Match**: The host shares the `matchId` with competitors. Competitors send a `POST /match/join` request to enter the room.
* **Problem Assignment**: Once the match is ready, the `GetProblems.java` controller fetches questions and assigns a unique problem track to that given `matchId`.

### 3. Live Duelling (The Competition)
* **Fetching Tracks**: Users retrieve the assigned match questions via `GET /getProblems/{matchId}`.
* **Solving Workflow**: Players individually track their questions. Only one question flashes a **"LIVE"** tag at a time. The rest remain "Not Attempted" (—).
* **Independent Tracking**: If player A solves Question 1, it updates dynamically for player A to `✅ Solved`, without affecting Question 1 for Player B. Players must solve sequentially; solving one does not unlock or propagate to others unexpectedly.

### 4. Real-time Leaderboard Updates
* **Submission Endpoints**: Whenever a player passes test cases (via submission logic handled by backend user/match updates), their record is updated using things like the `UserController`.
* **Scoring**: The platform calculates comparative scores, formatting the payload into a leaderboard view displaying each player’s name, their relative standing visually (represented by dynamic UI bars), and exactly which questions they've cleared.

---

## 📍 Current Project State
The repository reflects a very solid prototype/MVP containing all the necessary foundational code:
* Frontend files are fully scaffolded to run natively through `npm run dev` in the `myapp` directory.
* The Spring Boot application features controllers handling auth, rating/rate-limiting configs, match creation, and testing logic. 
* By injecting environment variables for your `spring.data.mongodb.uri` and `jwt.secret`, the environment is ready for testing via local development and subsequent deployment (Frontend on Vercel, Backend on Render).
