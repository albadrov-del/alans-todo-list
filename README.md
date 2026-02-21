# Alan's To Do List

A full-stack to-do list application with user authentication, built with Node.js, Express, and PostgreSQL.

[![CI](https://github.com/albadrov-del/alans-todo-list/actions/workflows/ci.yml/badge.svg)](https://github.com/albadrov-del/alans-todo-list/actions/workflows/ci.yml)

---

## Features

- **Secure authentication** — register, log in, and log out with JWT tokens stored in httpOnly cookies
- **Private lists** — each user sees only their own to-do panels; no one can access another user's data
- **Rich text editing** — powered by Quill.js with bold, italic, bullet points, and more
- **Full CRUD** — create, edit, rename, and delete to-do list panels
- **56 automated tests** — API tests (Jest) and browser tests (Playwright) run on every push

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express |
| Database | PostgreSQL 17 |
| Authentication | JWT (httpOnly cookies) + bcrypt |
| Frontend | Vanilla JS + Quill.js |
| API Tests | Jest + Supertest — 35 tests |
| Browser Tests | Playwright (Chromium) — 21 tests |
| CI/CD | GitHub Actions |

---

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 17

### Setup

```bash
git clone https://github.com/albadrov-del/alans-todo-list.git
cd alans-todo-list
npm install
cp .env.example .env
```

Edit `.env` with your database credentials, then create the tables:

```bash
psql -U postgres -f setup.sql
```

Start the app:

```bash
npm start
```

Open **http://localhost:3000**

---

## Running Tests

The app server does not need to be running — the test tools start their own environment automatically.

```bash
npm test              # 35 API tests (Jest + Supertest)
npm run test:e2e      # 21 browser tests (Playwright)
npm run test:all      # all 56 tests
```

Each run automatically saves a timestamped PDF report.

---

## CI/CD

Every push to `main` triggers a full automated test run on GitHub Actions:

1. A fresh PostgreSQL database is created in the cloud
2. All 35 API tests run
3. All 21 browser tests run in a headless Chromium browser
4. All 56 tests must pass — failing code cannot be merged to `main`

---

## Project Structure

```
├── public/          # Frontend — HTML, CSS, JavaScript
├── routes/          # Express API routes (auth + panels)
├── middleware/      # JWT authentication middleware
├── tests/           # Jest + Supertest API tests
├── e2e/             # Playwright browser tests
├── reports/         # PDF report generators
├── .github/
│   └── workflows/
│       └── ci.yml   # GitHub Actions CI pipeline
├── app.js           # Express app
├── server.js        # Entry point
├── db.js            # PostgreSQL connection pool
└── setup.sql        # Database schema
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```
DATABASE_URL=postgresql://postgres:PASSWORD@localhost:PORT/alans_todo
TEST_DATABASE_URL=postgresql://postgres:PASSWORD@localhost:PORT/alans_todo_test
JWT_SECRET=your-secret-key
PORT=3000
```
