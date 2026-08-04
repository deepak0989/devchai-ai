# DevChat AI

A ChatGPT-style AI chat application for developers. Built with **React + TypeScript + Material UI**, backed by an **Express (TypeScript) API**, **Supabase** (auth + PostgreSQL storage), and **OpenRouter** (GPT, Claude, Gemini, DeepSeek).

## Features

- Login / Register with JWT authentication (Supabase Auth)
- ChatGPT-style dark UI with message bubbles and streaming responses
- Typing loader / stop button while the model responds
- New chat, chat history sidebar, delete chat
- Model selection: GPT-4o mini, Claude 3.5 Sonnet, Gemini 2.0 Flash, DeepSeek V3
- Messages persisted to Supabase PostgreSQL (chats + messages tables, RLS enabled)
- Responsive design: collapsible drawer sidebar on mobile, permanent on desktop
- Server-Sent Events (SSE) streaming from OpenRouter through the backend

## Architecture

```
┌─────────────┐   HTTP / SSE   ┌──────────────┐   HTTPS stream   ┌──────────────┐
│  React SPA  │ ─────────────▶ │ Express API  │ ───────────────▶ │  OpenRouter  │
│ (Vite, MUI) │ ◀───────────── │  (port 5000) │ ◀─────────────── │              │
└─────────────┘  Bearer JWT    └──────┬───────┘                  └──────────────┘
                                      │
                                      │ service role key
                                      ▼
                              ┌───────────────┐
                              │   Supabase    │
                              │ Auth (JWT) +  │
                              │  PostgreSQL   │
                              └───────────────┘
```

- The browser never talks to Supabase directly — all traffic goes through the Express API, which verifies JWTs server-side and uses the service-role key for storage.
- Chat completions stream from OpenRouter to the backend, which relays them to the frontend as SSE and saves the assistant message on completion.

## Folder Structure

```
DevAI/
├── backend/                     # Express + TypeScript API
│   ├── src/
│   │   ├── index.ts             # Server entry point
│   │   ├── config.ts            # Environment configuration
│   │   ├── db/
│   │   │   └── supabase.ts      # Supabase admin client
│   │   ├── middleware/
│   │   │   └── auth.ts          # JWT verification (requireAuth)
│   │   ├── routes/
│   │   │   ├── auth.ts          # /api/auth/register|login|me
│   │   │   └── chats.ts         # /api/chats CRUD + SSE streaming
│   │   └── services/
│   │       └── openrouter.ts    # OpenRouter streaming client + model registry
│   ├── .env.example
│   └── package.json
├── frontend/                    # React + TypeScript + Material UI
│   ├── src/
│   │   ├── main.tsx             # Entry point
│   │   ├── App.tsx              # Routes + auth guard
│   │   ├── theme.ts             # Dark theme
│   │   ├── types.ts             # Shared types + model catalog
│   │   ├── api/
│   │   │   ├── client.ts        # REST client + token storage
│   │   │   └── chat.ts          # SSE streaming client
│   │   ├── context/
│   │   │   └── AuthContext.tsx  # Auth provider (login/register/logout)
│   │   ├── pages/
│   │   │   ├── AuthPage.tsx     # Login / register
│   │   │   └── ChatPage.tsx     # Layout: sidebar + chat
│   │   └── components/
│   │       ├── Sidebar.tsx      # Chat history, new/delete chat, logout
│   │       ├── ChatWindow.tsx   # Messages, streaming, empty state
│   │       ├── MessageBubble.tsx
│   │       ├── TypingLoader.tsx # Animated dots
│   │       ├── ChatInput.tsx    # Composer + stop/send buttons
│   │       ├── ModelSelector.tsx
│   │       └── EmptyState.tsx   # Hero + suggestion chips
│   ├── .env.example
│   └── package.json
├── database/
│   └── schema.sql               # Supabase Postgres schema + RLS policies
└── README.md
```

## API Endpoints

All endpoints (except `POST /api/auth/register` and `POST /api/auth/login`) require `Authorization: Bearer <JWT>`.

| Method | Endpoint                  | Description                                        |
| ------ | ------------------------- | -------------------------------------------------- |
| GET    | `/api/health`             | Health check                                       |
| POST   | `/api/auth/register`      | Create account, returns user + JWT session         |
| POST   | `/api/auth/login`         | Login, returns user + JWT session                  |
| GET    | `/api/auth/me`            | Current user profile (validates token)             |
| GET    | `/api/chats`              | List current user's chats (newest first)           |
| POST   | `/api/chats`              | Create a chat (`{ title?, model? }`)               |
| DELETE | `/api/chats/:id`          | Delete a chat and its messages                     |
| GET    | `/api/chats/:id/messages` | List messages in a chat                            |
| POST   | `/api/chats/:id/messages` | Send a message, stream reply via SSE (`{ content, model }`) |

The `POST /api/chats/:id/messages` endpoint returns `text/event-stream` frames:

```
data: {"event":"message","delta":"Hello"}
data: {"event":"message","delta":" world"}
data: {"event":"done","message":{...}}
```

## Prerequisites

- **Node.js 18+** and npm
- A **Supabase** project (free tier is fine)
- An **OpenRouter** API key (https://openrouter.ai/settings/keys)

## Setup

### 1. Supabase

1. Create a project at https://supabase.com.
2. Open **SQL Editor** and run the contents of [`database/schema.sql`](database/schema.sql) (creates `chats`, `messages`, RLS policies, and a trigger that keeps `chats.updated_at` fresh).
3. Optional but recommended for quick testing: in **Authentication → Providers → Email**, disable **Confirm email** so accounts activate instantly.
4. Copy your keys from **Project Settings → API**:
   - Project URL → `SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
   - `anon` key → `SUPABASE_ANON_KEY`

### 2. Backend

```bash
cd backend
npm install
copy .env.example .env     # then fill in your keys (see table below)
npm run dev                # http://localhost:5000
```

| Variable                  | Description                                     |
| ------------------------- | ----------------------------------------------- |
| `PORT`                    | Backend port (default `5000`)                   |
| `SUPABASE_URL`            | Supabase project URL                            |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only)       |
| `SUPABASE_ANON_KEY`       | Supabase anon key                               |
| `OPENROUTER_API_KEY`      | OpenRouter API key                              |
| `CLIENT_URL`              | Allowed CORS origin (default `http://localhost:5173`) |

### 3. Frontend

```bash
cd frontend
npm install
copy .env.example .env      # optional; /api proxy works out of the box in dev
npm run dev                 # http://localhost:5173
```

In development the Vite proxy forwards `/api/*` to `http://localhost:5000`, so no CORS issues. For production, set `VITE_API_BASE_URL` to your deployed backend URL (e.g. `https://api.example.com/api`).

## Running

1. Supabase project with `schema.sql` applied.
2. `backend`: `npm run dev`
3. `frontend`: `npm run dev`
4. Open http://localhost:5173, register, and start chatting.

## Production Builds

```bash
cd backend && npm run build && npm start    # serve with PM2 / Docker / Render / Railway
cd frontend && npm run build                # dist/ → deploy to Vercel / Netlify / static host
```

Notes for production:

- Keep the service-role key strictly server-side.
- Set `CLIENT_URL` to your deployed frontend origin (or `*` if the API is public).
- Supabase access tokens expire after 1 hour; for long sessions add a refresh-token flow on the backend (the current setup logs the user out on expiry).
- The OpenRouter key lives only in the backend — never put it in frontend env files.

## License

MIT
