# Monitoring System

Full-stack monitoring dashboard using NestJS (backend) and React + Vite (frontend).

## Features (Initial, Simplified)
- Create and list issue tickets (open, investigating, resolved, closed)
- Update ticket status from the dashboard
- Basic severity field (low, medium, high, critical)
- In-memory storage (no DB yet)
- Manual refresh (no websockets yet for simplicity)

## Tech Stack
Backend: NestJS 10, TypeScript
Frontend: React 18, Vite, TypeScript

## Prerequisites
- Node.js 18+ installed
- PowerShell (Windows) or any shell

## Setup
From the project root (`Monitoring System`):

### 1. Install dependencies
```powershell
cd "backend"; npm install; cd ..
cd "frontend"; npm install; cd ..
```

### 2. Run backend (port 3001)
```powershell
cd backend
npm run start:dev
```
Backend runs at http://localhost:3001 (REST under /api, websockets root).

### 3. Run frontend (port 5173)
Open a new terminal:
```powershell
cd frontend
npm run dev
```
Frontend runs at http://localhost:5173

### 4. View dashboard
Navigate to http://localhost:5173

## API Endpoints
Base: http://localhost:3001/api
- GET /issues -> list issues
- GET /issues/:id -> get single issue
- POST /issues -> create issue (body: { title, description?, severity? })
- PATCH /issues/:id/status -> update status (body: { status })

## Environment Variables (Frontend)
Optional `frontend/.env`:
```
VITE_API_URL=http://localhost:3001/api
```

## Next Steps / Roadmap
- Persistence using a database (PostgreSQL or MongoDB)
- Authentication & roles
- Filters, search, sorting UI
- Issue detail panel & timeline / comments
- Metrics & charts (error rates, SLA, etc.)
- Notifications (email/slack/webhook)
- Websocket or SSE live updates

## Development Notes
Currently issues are stored in-memory; restarting backend resets data.

## License
MIT
