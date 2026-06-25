# Wordly. Roadmap

**Version:** 1.0 | **Date:** 2026-05-28 | **Status:** Draft

**Document audience:** Product · Design · Development

Product roadmap for Wordly. Tied to the course milestones (M1–M4, weeks 1–10) and continuing with v1.1 after the MVP release. Each MVP and post-MVP item links to the corresponding user story in [`user-stories.md`](./user-stories.md).

---

## Course milestones (Weeks 1–10)

### M1: Kickoff (Weeks 1–2)

- [x] Team formed (4 members)
- [x] Team Lead assigned (Polina Trybialustava)
- [x] Project topic chosen and approved — Wordly: word learning with mnemonics and spaced repetition
- [x] Repository created on GitHub
- [x] Team channel set up in MS Teams
- **Checkpoint (end of week 2):** meeting with the supervisor — topic and team confirmed ✅

### M2: Requirements (Weeks 3–4)

- [x] Domain description ([`requirements-en.md` §2](./requirements-en.md#2-domain))
- [x] Target audience analysis ([`requirements-en.md` §3](./requirements-en.md#3-target-audience))
- [x] List of functional requirements ([`user-stories.md`](./user-stories.md))
- [x] Requirements prioritized with MoSCoW (Must / Should / Could / Won't)
- [x] Project roadmap (this document)
- **Checkpoint (end of week 4):** Demo #1 — requirements presentation ✅

### M3: Design (Weeks 5–6)

- [x] Architecture diagram (Spring Boot + React + PostgreSQL)
- [x] Database schema (Flyway migrations `V1–V10`)
- [x] API endpoints description (`openapi.yaml` — 33 endpoints)
- [x] UI/UX mockups in Figma
- [x] Tech stack locked in: Java 21 + Spring Boot 4 (backend), React 19 + TS + Vite (frontend), PostgreSQL 17, Docker, GitHub Actions
- **Checkpoint (end of week 6):** Demo #2 — architecture and design ✅

### M4: MVP development (Weeks 7–10)

- [x] Backend API: authentication (JWT + Google OAuth), content CRUD, learning, recall, AI chat
- [x] Frontend connected to the API — all core screens
- [x] Database seeded with test data (`V2__test_data.sql`)
- [x] Core user stories implemented (see MVP below)
- [x] Admin panel for content management (backend + frontend)
- [x] Code covered with unit tests (at least 50%) — in progress
- **Checkpoint (week 8):** interim status — daily standup with the supervisor
- **Checkpoint (end of week 10):** Demo #3 — MVP

---

## MVP (v1.0, by week 10)

Implemented and verified functionality. Covers **Must Have** in [`user-stories.md`](./user-stories.md), plus Google OAuth and AI Chat from Should Have, delivered early.

### Authentication and profile

- [x] Sign up with email + password (US-001)
- [x] Sign in with email + password (US-002)
- [x] Guest sign-in (US-003)
- [x] Sign out (US-004)
- [x] View and edit profile (US-005)
- [x] Sign in with Google OAuth (US-024)

### Content and navigation

- [x] Browse the list of topics and subtopics (US-006)
- [x] View all words of a topic before starting (US-007)
- [x] View subtopic levels (US-008)

### Learning mechanics

- [x] Level 0: Mnemonics (US-009)
- [x] Level 1: Flashcards (US-010)
- [x] Level 2: Matching (US-011)
- [x] Level 3: Filling Gaps (US-012)
- [x] Level 4: Word Builder (US-013)

### Recall (Spaced Repetition)

- [x] View words due for recall today (US-014)
- [x] Recall session with 1/3/7/14/21/30-day intervals (US-015)

### Daily goal and gamification

- [x] Set the daily goal during onboarding (US-016)
- [x] Change the daily goal in the profile (US-017)
- [x] Gems for completing a level +5 (US-018)
- [x] Gems for completing a topic +15 (US-019)
- [x] Gems for reaching the daily goal +10 (US-020)
- [x] Gems for a recall session (+10 / +5) (US-021)
- [x] Streak update and reset logic (US-028)
- [x] Game of the day (US-032)

### Vocabulary and statistics

- [x] View learned words in the vocabulary (US-022)
- [x] Basic profile statistics (US-023)

### AI practice

- [x] Conversational practice with the AI assistant (US-025)

### Content management (admin infrastructure)

- [x] Admin role and protected `/admin/**` endpoints
- [x] CRUD for topics, subtopics, words
- [x] Bulk word upload (`POST /admin/words/bulk`)
- [x] Paginated user list

---

## v1.1 (after the course)

Refining the MVP to match the BRD and closing out **Should Have** / priority **Could Have** items.

### Polishing existing features

- [ ] Extended word card in the vocabulary: date learned, recall count, usage example (US-029)
- [ ] Migrate guest progress to an account after sign-up (US-035)

### New metrics

- [ ] Recall time metrics: average time, personal best (US-033)
- [ ] "Remembered" % per interval in Stats (US-030)

---

## v1.2+ (in the future)

**Could Have**: second-wave features that boost engagement.

- [ ] Tamagotchi on the home screen (US-031)
- [ ] Contextual Recall mode — sentence with a gap (US-034)

---

## Out of scope (Won't Have)

Not planned for the foreseeable future — requires separate research or shifts the product's positioning.

- [ ] Adaptive word list — excluding familiar words before starting (US-036)
- [ ] Social features — leaderboards, comparison with friends (US-037)
- [ ] Difficulty adaptation — automatic adjustment based on mistakes (US-038)
