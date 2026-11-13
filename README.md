# Sweety – Blood Glucose Tracker

A small web app where a person with diabetes records up to 4 blood glucose readings a day and views daily and monthly reports.

**Stack:** React (Vite), Node.js + Express, PostgreSQL

## Features
- Sign up and log in (bcrypt password hashing, JWT)
- Add, view, edit and delete glucose readings (4 slots a day)
- Validation: 40–600 mg/dL, one reading per slot per date, max 4 per day, no future dates
- Reports: daily, month-to-date and previous month (highest, lowest, average, count)
- Every user sees only their own readings

## Prerequisites
- Node.js 20+
- PostgreSQL 14+

## Setup

### 1. Database
Create an empty database:
```
psql -U postgres -c "CREATE DATABASE sweety;"
```

### 2. Server
```
cd server
npm install
cp .env.example .env
```
Open `.env` and set `DATABASE_URL` (use a password without special characters like `@` or `#`) and `JWT_SECRET`.

Create the tables and load the demo data:
```
npm run db:setup
npm run seed
```
Start the server (http://localhost:5000):
```
npm run dev
```

### 3. Client
In a second terminal:
```
cd client
npm install
npm run dev
```
Open http://localhost:5173.

## Demo account
| Email | Password |
|---|---|
| demo@sweety.app | demo1234 |

The seed script adds about 45 days of sample readings, so all three reports show data.

## Tests
```
cd server
npm test
```

## Environment variables
| Variable | Purpose |
|---|---|
| PORT | Server port (default 5000) |
| DATABASE_URL | PostgreSQL connection string |
| JWT_SECRET | Secret used to sign login tokens |
| JWT_EXPIRES_IN | Token lifetime, for example `1d` |

## API overview
| Method | Path | Purpose |
|---|---|---|
| POST | /api/auth/register | Create an account |
| POST | /api/auth/login | Log in, returns a token |
| GET | /api/auth/me | Current user |
| GET, POST | /api/readings | List and add readings |
| GET, PUT, DELETE | /api/readings/:id | One reading |
| GET | /api/readings/summary?today=YYYY-MM-DD | Dashboard totals |
| GET | /api/reports?date=YYYY-MM-DD | Daily, month-to-date and previous month reports |

## Notes
**Assumptions**
- "Today" for the future-date rule is the server's local date.
- Glucose values are whole numbers only.
- The report date picker cannot go past today.
- The login token is kept in localStorage for simplicity.

**What I would improve with more time**
- Store the token in an httpOnly cookie and add refresh tokens
- Add rate limiting on login
- Pagination on the readings list
- Frontend tests for the reading form
- Docker Compose for one-command setup