# Wordly

## Overview

Wordly is an app for learning foreign languages with sound mnemonics. The system combines personalized learning, game mechanics, and adaptive difficulty, helping users absorb vocabulary faster and retain it, making the learning process more engaging and effective.

## Links

- [Figma UI](https://www.figma.com/design/6BMtZklYEVAf2kwbxYIDjE/UI-Lang-App?t=Kzh8iNwOm6mPpchi-0)
- [Production](https://dev.wordly.quest/)
- [Project Board (Trello)](https://trello.com/b/dC67unaD/teamproject)
- [Video presentation](https://drive.google.com/file/d/1rfbIGFmtWkZnZP73IW8_L7Q3K4Ds-ReK/view)

## Team

- Polina Trybialustava — Team Lead + Frontend + UX/UI
- Evgeniya Yankovich — Backend
- Daniil Tsitavets — Backend + DevOps
- Fiodar Viachorka — Frontend

## Tech stack

- Backend: Java 21 + Spring Boot
- Frontend: React + TypeScript (Vite)
- Database: PostgreSQL 17
- Hosting: AWS (ECS Fargate + CloudFront + RDS)
- CI/CD: GitHub Actions

## Local setup

### Requirements

- Docker + Docker Compose
- Java 21 (to run the backend without Docker)
- Node.js 20+ (to run the frontend without Docker)

Optional: [mise](https://mise.jdx.dev/) — simplifies running via short commands (`brew install mise`).

---

### Option 1 — full stack via Docker Compose

```bash
# Start DB + backend
docker compose up -d

# Or via mise
mise run up
```

| Service     | URL                          |
| ----------- | ---------------------------- |
| Backend API | http://localhost:8080/api/v1 |
| PostgreSQL  | localhost:**5433**           |

Flyway migrations are applied automatically on backend startup.

---

### Option 2 — frontend with a mocked backend

If you don't need the backend, use the mock server (Express, port 4010):

```bash
# Start the mock server
docker compose --profile mock up --build -d mock
# or
mise run mock

# Start the frontend
cd frontend
npm install
npm run dev        # http://localhost:5173
```

By default the frontend points to `http://localhost:4010` in development mode — the mock serves all endpoints with test data.

---

### Option 3 — backend without Docker

```bash
# Start only the DB
docker compose up -d db

# Run the backend (dev profile — Security is disabled, no 401 is returned)
cd backend
./mvnw spring-boot:run
```

Environment variables with defaults (no need to change them for local runs):

| Variable             | Default                                        |
| -------------------- | ---------------------------------------------- |
| `DB_URL`             | `jdbc:postgresql://localhost:5432/wordly`      |
| `DB_USERNAME`        | `postgres`                                     |
| `DB_PASSWORD`        | `yourpassword`                                 |
| `JWT_SECRET`         | `dev-secret-change-in-production-min-32-chars` |
| `OPENROUTER_API_KEY` | — required for the AI chat                     |

---

### Useful commands (mise)

```bash
mise run logs:backend      # backend logs
mise run rebuild:backend   # rebuild and restart the backend
mise run down              # stop all containers
mise run down:volumes      # stop + delete DB data
mise run health            # GET http://localhost:8080/health
```

---

### Tests

```bash
# Backend
cd backend && ./mvnw test

# Frontend
cd frontend && npm test              # single run
cd frontend && npm run test:watch    # watch mode
cd frontend && npm run test:coverage # with coverage
```
