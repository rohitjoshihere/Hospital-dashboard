# Medical Doctor Dashboard

A full-stack system for managing patients, media uploads, and role-based access for doctors and admins.

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Backend    | Node.js + Express + TypeScript          |
| ORM        | Prisma (PostgreSQL)                     |
| Queue      | BullMQ + Redis                          |
| Auth       | JWT (jsonwebtoken) + bcrypt             |
| Upload     | multer (disk storage)                   |
| Thumbnails | sharp (images), fluent-ffmpeg (videos)  |
| Logging    | Winston (structured JSON)               |
| Frontend   | React + Vite + TypeScript               |
| DevOps     | Docker Compose                          |

---

## Project Structure

```
medical-dashboard/
├── backend/
│   ├── src/
│   │   ├── config/         # env config, Winston logger
│   │   ├── middleware/      # verifyToken, requireRole, requestLogger, errorHandler
│   │   ├── routes/          # auth, patient, media routes
│   │   ├── controllers/     # request handlers
│   │   ├── services/        # DB queries (Prisma), media enqueue logic
│   │   ├── queues/          # BullMQ queue definition
│   │   ├── workers/         # BullMQ worker (image + video processing)
│   │   └── app.ts           # Express app setup
│   ├── prisma/
│   │   └── schema.prisma
│   ├── server.ts            # API entrypoint
│   ├── worker.ts            # Worker entrypoint (separate process)
│   ├── entrypoint.sh        # Runs prisma migrate deploy before server start
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/             # axios client with JWT injection
│   │   ├── components/      # PatientList, PatientCard, SearchBar, MediaUpload, MediaStatus
│   │   ├── pages/           # Login, Dashboard
│   │   └── context/         # AuthContext (JWT + role)
│   ├── nginx.conf           # SPA routing + /api proxy
│   └── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

## Getting Started

### Prerequisites

- Docker + Docker Compose

### Run with Docker

```bash
git clone <repo-url>
cd medical-dashboard
cp .env.example .env        # edit JWT_SECRET and passwords as needed
docker compose up --build
```

| Service  | URL                    |
|----------|------------------------|
| Frontend | http://localhost:5173  |
| API      | http://localhost:3001  |

### Database Initialization (First Time Only)

If you are running this for the first time or on a fresh pull, you must initialize the database and seed it with default users:

```bash
# 1. Sync the schema (creates tables)
docker compose exec api npx prisma db push

# 2. Seed the data (default users & patients)
docker compose exec api npm run seed
```

### Run locally (without Docker)

**Backend:**

```bash
cd backend
npm install
# create a .env file with DATABASE_URL, REDIS_URL, JWT_SECRET, UPLOAD_DIR, PORT
npx prisma migrate dev
npx ts-node server.ts
```

**Worker (separate terminal):**

```bash
cd backend
npx ts-node worker.ts
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

---

## API Reference

### Auth (public)

| Method | Endpoint               | Body                                      |
|--------|------------------------|-------------------------------------------|
| POST   | /api/auth/register     | `{ name, email, password, role? }`        |
| POST   | /api/auth/login        | `{ email, password }` → `{ token, user }` |

**Default Credentials (after seeding):**
- **ADMIN**: `admin@hospital.com` / `admin123`
- **DOCTOR**: `doctor@hospital.com` / `doctor123`

### Patients (JWT required)

| Method | Endpoint            | Access        | Notes                                      |
|--------|---------------------|---------------|--------------------------------------------|
| GET    | /api/patients       | ADMIN, DOCTOR | `?q=&tags=&from=&to=&page=&limit=&sortBy=&sortOrder=` |
| POST   | /api/patients       | ADMIN only    | `{ name, dob?, assignedDoctorId, tags[] }` |
| GET    | /api/patients/:id   | ADMIN, DOCTOR | DOCTOR only if assignedDoctorId matches    |
| PUT    | /api/patients/:id   | ADMIN only    |                                            |
| DELETE | /api/patients/:id   | ADMIN only    |                                            |

### Media (JWT required)

| Method | Endpoint                      | Notes                                  |
|--------|-------------------------------|----------------------------------------|
| POST   | /api/patients/:id/media       | multipart `file` field — returns 202   |
| GET    | /api/media/:id/status         | `{ id, status, thumbPath, metadata }`  |

**Paginated response format:**
```json
{ "data": [...], "page": 1, "limit": 20, "total": 100 }
```

---

## Environment Variables

| Variable          | Description                        | Default              |
|-------------------|------------------------------------|----------------------|
| `DATABASE_URL`    | PostgreSQL connection string       | required             |
| `REDIS_URL`       | Redis connection string            | required             |
| `JWT_SECRET`      | Secret for signing JWTs            | required             |
| `UPLOAD_DIR`      | Directory for uploaded files       | `./uploads`          |
| `PORT`            | API server port                    | `3001`               |
| `NODE_ENV`        | `development` or `production`      | `development`        |
| `POSTGRES_DB`     | Database name (Docker)             | `medicaldashboard`   |
| `POSTGRES_USER`   | DB user (Docker)                   | `postgres`           |
| `POSTGRES_PASSWORD` | DB password (Docker)             | `postgres`           |

---

## Design Decisions & Trade-offs

**1. Why PostgreSQL + Prisma**

PostgreSQL provides relational integrity for the doctor↔patient↔media relationships. Prisma gives type-safe queries generated from the schema, and migrations are version-controlled. The `@@index` directives on `name`, `createdAt`, and `assignedDoctorId` enable O(log n) lookups for all common query patterns.

**2. Why BullMQ over direct processing**

The API returns `202 Accepted` immediately after enqueueing. Heavy work — `sharp` resizing and `ffmpeg` frame extraction — runs in a separate worker process. This eliminates request timeout risk and keeps the API responsive regardless of file size or processing time. The worker retries failed jobs with exponential backoff (3 attempts).

**3. Why the same Docker image for api + worker**

A single `Dockerfile` builds one image. The `api` service runs `ts-node server.ts` and the `worker` service runs `ts-node worker.ts` — different `command` values at runtime. This is DRY, reduces CI build time, and guarantees both processes run identical code.

**4. Search indexing strategy**

Prisma `@@index` on `name`, `createdAt`, and `assignedDoctorId` enables efficient lookups:
- Name search uses `contains` with `mode: 'insensitive'` (ILIKE), which is acceptable for up to ~100k rows with a B-tree index.
- For datasets exceeding 1M rows, consider a `pg_trgm` GIN index: `CREATE INDEX ON "Patient" USING GIN (name gin_trgm_ops)`.
- Date range and doctor-scoped queries use their respective indexes directly.

**5. RBAC at the service layer, not just middleware**

The `requireRole` middleware is the first line of defence, but the DB query itself always appends `WHERE assignedDoctorId = req.user.id` for DOCTOR-role requests. This means even if middleware is misconfigured or bypassed, a DOCTOR can never read another doctor's patients at the database level.

**6. Status polling instead of WebSockets**

The frontend polls `GET /api/media/:id/status` every 2 seconds and stops when status is `COMPLETED` or `FAILED`. This is simpler to implement, debug, and scale at this stage. When real-time push is needed, the natural upgrade path is Server-Sent Events (SSE) — a single persistent HTTP connection per client — or WebSockets for bidirectional communication.
