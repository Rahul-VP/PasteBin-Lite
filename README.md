# Pastebin-Lite (MERN)

A production-ready “Pastebin-Lite” application built with:

- Backend: Node.js + Express (JavaScript)
- Database: MongoDB (MongoDB Atlas recommended)
- Frontend: React (JavaScript)

It supports pastes with optional expiration (`ttl_seconds`) and/or view limits (`max_views`).

## Monorepo layout

- `backend/` Express API (Render-friendly)
- `frontend/` React UI (Vercel-friendly)

## Backend API

### Health check

- `GET /api/healthz` → `{ "ok": true }` (HTTP 200) when MongoDB is reachable.

### Create paste

- `POST /api/pastes`

Body:

```json
{
  "content": "string",
  "ttl_seconds": 60,
  "max_views": 5
}
```

Response:

```json
{
  "id": "...",
  "url": "https://<frontend-domain>/p/<id>"
}
```

### Fetch paste (API)

- `GET /api/pastes/:id`

Returns:

```json
{
  "content": "string",
  "remaining_views": 4,
  "expires_at": "ISO-8601 timestamp or null"
}
```

Notes:
- Each successful API fetch increments `views_used` by 1 using an **atomic** MongoDB operation.
- A paste is unavailable (HTTP 404) if missing, expired, or view limit exceeded.

## Deterministic time for tests

If `TEST_MODE=1` is set on the backend:

- The backend reads request header `x-test-now-ms` (milliseconds since epoch)
- That value is used as the “current time” **only for expiry logic**
- If the header is missing or invalid, it falls back to real system time

## MongoDB persistence

MongoDB is the **only** persistence layer.

Collection: `pastes`

Stored fields:
- `_id`
- `content`
- `created_at`
- `expires_at` (nullable)
- `max_views` (nullable)
- `views_used` (number, default 0)

TTL enforcement is handled in **application logic** (not relying on a TTL index).

## Running locally

### 1) Backend

From `backend/`:

- Create `.env` (copy from `.env.example`) and set:
  - `MONGODB_URI`
  - `FRONTEND_ORIGIN` (used to build the shareable URL)

Install + run:

- `npm install`
- `npm run dev`

Backend defaults to `PORT=3001`.

### 2) Frontend

From `frontend/`:

- Create `.env` (copy from `.env.example`) and set `VITE_API_BASE_URL` to your backend origin.

Install + run:

- `npm install`
- `npm run dev`

## Deployment

### Backend on Render

Set Render environment variables:

- `MONGODB_URI`
- `MONGODB_DB_NAME` (optional)
- `FRONTEND_ORIGIN` (your Vercel frontend origin)
- `TEST_MODE` (optional)

Start command:

- `npm start`

### Frontend on Vercel

Set Vercel environment variables:

- `VITE_API_BASE_URL` (build-time, for the create UI)
- `API_BASE_URL` (runtime, used by the `/p/:id` HTML route)

`/p/:id` on Vercel is implemented via `frontend/vercel.json` rewrite to a serverless function (`/api/paste-view-ssr`) that server-renders a React view using `react-dom/server`.

## Design decisions

- **Atomic view counting**: `GET /api/pastes/:id` uses `findOneAndUpdate` with constraints in the query, preventing race conditions and negative remaining views.
- **Safe rendering**: Paste content is rendered as plain text (`<pre>{content}</pre>`). React escapes content by default, preventing XSS.
- **No hardcoded localhost URLs**: API base URLs and frontend origin are configured via environment variables.
