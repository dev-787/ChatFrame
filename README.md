# ChatFrame — AI-Powered Customer Support Platform

ChatFrame is a multi-tenant SaaS platform that lets businesses embed an AI-powered live chat widget on their website, manage support tickets, and monitor customer satisfaction — all from a single dashboard.

---

## Live Demo

| Service | URL |
|---------|-----|
| Frontend (Vercel) | https://chatframe-chi.vercel.app |
| Backend API (Render) | https://chatframe-y2j7.onrender.com |
| API Health Check | https://chatframe-y2j7.onrender.com/api/health |

---

## Tech Stack

**Frontend**
- React 19 + Vite
- React Router v7
- Socket.io-client
- Recharts
- SCSS

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- Redis (ioredis) — onboarding sessions & caching
- Socket.io — real-time inbox & notifications
- Google Gemini 1.5 Flash — AI auto-replies
- JWT authentication

---

## Project Structure

```
ChatFrame/
├── frontend/          # React app (deployed to Vercel)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/  # API + Socket clients
│   │   └── contexts/
│   └── public/
│       └── chatframe-widget.js
│
└── backend/           # Express API (deployed to Render)
    └── src/
        ├── controllers/
        ├── models/
        ├── routes/
        ├── services/
        ├── middleware/
        ├── sockets/
        └── utils/
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Redis instance (Redis Cloud)
- Google Gemini API key

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_uri
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_PASSWORD=your_redis_password
REDIS_DB=0
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=30d
ALLOWED_ORIGINS=http://localhost:5173
BACKEND_URL=http://localhost:5000
BCRYPT_SALT_ROUNDS=12
GEMINI_API_KEY=your_gemini_api_key
AI_AUTO_REPLY_ENABLED=true
AI_CONFIDENCE_THRESHOLD=0.7
```

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

```bash
npm run dev
```

---

## Widget Embed

After creating a widget in the dashboard, embed it on any website:

```html
<script>
  window.ChatFrameConfig = {
    widgetKey: "your_widget_key",
    primaryColor: "#6366f1",
    position: "bottom-right"
  };
  (function(d,s,id){
    var js,fjs=d.getElementsByTagName(s)[0];
    if(d.getElementById(id))return;
    js=d.createElement(s);js.id=id;
    js.src="https://chatframe-y2j7.onrender.com/api/widget/widget.js";
    fjs.parentNode.insertBefore(js,fjs);
  }(document,'script','chatframe-sdk'));
</script>
```

---

## Key Features

- **Multi-tenant** — each company gets an isolated workspace
- **AI auto-replies** — Gemini 1.5 Flash responds to common queries automatically
- **Live inbox** — real-time ticket management via Socket.io
- **Widget builder** — customizable chat widget with color and position options
- **Analytics** — ticket volume, resolution time, CSAT scores
- **Team management** — invite agents via invite code
- **Role-based access** — company admin vs support agent permissions

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | API status |
| GET | `/api/health` | Health check |
| POST | `/api/auth/login` | Login |
| POST | `/api/onboard/company/step-1..4` | Company onboarding |
| POST | `/api/onboard/agent/step-1..2` | Agent onboarding |
| GET | `/api/dashboard/overview` | Dashboard stats |
| GET/POST | `/api/tickets` | Ticket management |
| GET/POST | `/api/inbox/conversations` | Live inbox |
| GET/PATCH | `/api/widget-config` | Widget settings |
| GET | `/api/widget/widget.js` | Embeddable widget script |
| POST | `/api/widget/message` | Widget message handler |
