<div align="center">

# ⚡ ChatFrame

### AI-Powered Multi-Tenant Customer Support SaaS

**Real tickets. Real AI. Real conversations.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0+-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Redis](https://img.shields.io/badge/Redis-7.0+-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.7+-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io)

---

*A production-grade, multi-tenant customer support platform with embeddable AI chat widget, real-time inbox, RBAC, and full SaaS onboarding — built from the ground up.*

</div>

---

## 🗺️ Table of Contents

- [What is ChatFrame?](#-what-is-chatframe)
- [Architecture Overview](#-architecture-overview)
- [Tech Stack](#-tech-stack)
- [Feature Map](#-feature-map)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Multi-Tenant System](#-multi-tenant-system)
- [Auth & RBAC](#-auth--rbac)
- [Onboarding Flow](#-onboarding-flow)
- [Widget System](#-widget-system)
- [AI Engine](#-ai-engine)
- [Real-Time (Socket.io)](#-real-time-socketio)
- [Redis Architecture](#-redis-architecture)
- [Database Models](#-database-models)
- [Folder Structure](#-folder-structure)

---

## 🧠 What is ChatFrame?

ChatFrame is a **multi-tenant SaaS customer support platform**. Companies sign up, configure an AI assistant, and embed a chat widget on their website. Customers chat with the AI. When the AI can't help, it escalates to a human agent — live, in real time.

```
Company configures AI + widget
         ↓
Customer visits company's website
         ↓
Widget loads → Customer chats
         ↓
AI responds using company's FAQs + system prompt
         ↓
If AI confidence is low → Auto-escalate
         ↓
Human agent sees ticket instantly in Inbox
         ↓
Agent replies in real time via Socket.io
```

Every company is completely **isolated** — data, agents, configs, tickets, and conversations never cross tenant boundaries.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT WEBSITES                       │
│         <script src="cdn.chatframe.io/widget.js"        │
│                  data-key="cf_live_xxxx">               │
└──────────────────────┬──────────────────────────────────┘
                       │  Public Widget API
┌──────────────────────▼──────────────────────────────────┐
│                  CHATFRAME BACKEND                       │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Auth/RBAC  │  │  Widget API  │  │  Dashboard API│  │
│  │  JWT + Redis│  │  /api/widget │  │  /api/*       │  │
│  └─────────────┘  └──────┬───────┘  └───────────────┘  │
│                          │                              │
│  ┌───────────────────────▼──────────────────────────┐  │
│  │               SERVICES LAYER                     │  │
│  │  AI Engine │ Ticket Pipeline │ Escalation System │  │
│  └───────────────────────┬──────────────────────────┘  │
│                          │                              │
│  ┌──────────┐  ┌─────────▼──────┐  ┌───────────────┐  │
│  │  Redis   │  │    MongoDB     │  │   Socket.io   │  │
│  │  Cache   │  │  chatframe DB  │  │  Tenant Rooms │  │
│  │  Rate    │  │  Shared Coll.  │  │  Ticket Rooms │  │
│  │  Sessions│  │  tenantId:all  │  │  Live Chat    │  │
│  └──────────┘  └────────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## ⚙️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Runtime** | Node.js 18+ | Server |
| **Framework** | Express.js | HTTP + routing |
| **Database** | MongoDB + Mongoose | Primary data store |
| **Cache** | Redis (ioredis) | Sessions, rate limiting, presence |
| **Auth** | JWT + bcryptjs | Access + refresh tokens |
| **Real-time** | Socket.io | Live chat, typing, notifications |
| **AI** | Google Gemini API | Customer support AI responses |
| **Validation** | express-validator | Request validation |
| **Security** | helmet, cors | HTTP hardening |

---

## 🗂️ Feature Map

### ✅ Phase 1 — Auth & Onboarding
- [x] Multi-step company onboarding (4 steps)
- [x] Multi-step agent onboarding (2 steps)
- [x] JWT access + refresh tokens
- [x] bcrypt password hashing
- [x] Email uniqueness validation
- [x] Redis-backed onboarding sessions (stateless until final step)
- [x] Tenant creation with unique `tenantId` + `inviteCode`
- [x] Role-based access control (company_admin / support_agent / super_admin)
- [x] Token blacklisting on logout
- [x] Auth middleware + role middleware
- [x] Redis rate limiting on auth + onboarding routes
- [x] Global error handler with normalized error types

### ✅ Phase 2 — Dashboard Backend
- [x] Dashboard overview analytics (aggregation pipelines)
- [x] Ticket management system (CRUD, filtering, pagination)
- [x] Ticket status lifecycle: open → escalated → in_progress → resolved → closed
- [x] Inbox / conversation system with message threading
- [x] Analytics: volume trends, agent performance, busiest hours, CSAT trends
- [x] Knowledge base (FAQ) with full-text search
- [x] AI Config per tenant (system prompt, tone, thresholds)
- [x] AI Insights (confidence tracking, escalation analysis, learning suggestions)
- [x] Widget Config with embed script generation
- [x] Team management with live online/offline presence
- [x] Notifications system with unread counts
- [x] CSAT collection and scoring
- [x] Organization settings
- [x] Profile management + password change
- [x] Billing (plan + usage tracking)

### ✅ Phase 3 — Widget + AI Engine
- [x] Embeddable script tag system (`<script data-key="cf_live_xxx">`)
- [x] Tenant-aware widget config endpoint (public, safe)
- [x] Gemini-powered AI support responses
- [x] FAQ-aware AI context injection
- [x] Tenant system prompt + response tone control
- [x] AI confidence scoring
- [x] Auto-escalation engine (confidence threshold, keywords, frustration detection)
- [x] Real ticket creation from widget conversations
- [x] Widget visitor tracking
- [x] Live agent takeover via Socket.io
- [x] Typing indicators (AI + agent)
- [x] Widget rate limiting (anti-abuse)
- [x] Widget security (key validation, tenant verification)
- [x] Out-of-hours detection

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 7.0+ (local or Atlas)
- Redis 7.0+ (local or cloud)
- Google Gemini API key

### Installation

```bash
# Clone and install
git clone https://github.com/yourorg/chatframe.git
cd chatframe/backend
npm install

# Configure environment
cp .env.example .env
# → Edit .env with your values (see Environment Variables section)

# Start development server
npm run dev
```

### Verify it's running
```bash
curl http://localhost:5000/api/health
```
```json
{
  "success": true,
  "message": "ChatFrame API is running",
  "environment": "development"
}
```

---

## 🔐 Environment Variables

```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB
MONGO_URI=mongodb://localhost:27017/chatframe

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRES_IN=30d

# Bcrypt
BCRYPT_SALT_ROUNDS=12

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=20

# AI
GEMINI_API_KEY=your_gemini_api_key
```

---

## 📡 API Reference

All authenticated routes require:
```
Authorization: Bearer <accessToken>
```

All responses follow the envelope:
```json
{
  "success": true,
  "message": "Human-readable message",
  "data": { }
}
```

---

### 🔑 Auth

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/api/auth/login` | ❌ | Login (any role) |
| `GET` | `/api/auth/me` | ✅ | Get current user profile |
| `POST` | `/api/auth/logout` | ✅ | Logout + blacklist token |

---

### 🏢 Company Onboarding

| Step | Method | Route | Body |
|------|--------|-------|------|
| 1 | `POST` | `/api/onboard/company/step-1` | `firstName, lastName, email, password, confirmPassword` |
| 2 | `POST` | `/api/onboard/company/step-2` | `sessionId, companyName, companyWebsite, companyLogo` |
| 3 | `POST` | `/api/onboard/company/step-3` | `sessionId, industryType, countryRegion` |
| 4 | `POST` | `/api/onboard/company/step-4` | `sessionId, supportHoursOpen, supportHoursClose, outOfHoursMessage` |

> Step 4 is the only step that writes to MongoDB. Steps 1–3 accumulate in Redis under a `sessionId`.

---

### 🙋 Agent Onboarding

| Step | Method | Route | Body |
|------|--------|-------|------|
| 1 | `POST` | `/api/onboard/agent/step-1` | `firstName, lastName, email, password, confirmPassword` |
| 2 | `POST` | `/api/onboard/agent/step-2` | `sessionId, inviteCode` |

---

### 📊 Dashboard

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/dashboard/overview` | ✅ | Full analytics summary, trends, recent activity |

---

### 🎫 Tickets

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/tickets` | ✅ | List tickets with filters + pagination |
| `POST` | `/api/tickets` | ✅ | Create a ticket |
| `GET` | `/api/tickets/status-breakdown` | ✅ | Count by status |
| `GET` | `/api/tickets/:id` | ✅ | Get single ticket |
| `PATCH` | `/api/tickets/:id` | ✅ | Update ticket (status, priority, assignedTo) |

Query params for `GET /api/tickets`:
```
?page=1&limit=20&status=open&priority=high&search=billing&channel=live_chat&sortBy=createdAt&sortOrder=desc
```

---

### 💬 Inbox

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/inbox/conversations` | ✅ | Active conversations with last message |
| `GET` | `/api/inbox/:ticketId` | ✅ | Full message thread for a ticket |
| `POST` | `/api/inbox/:ticketId/send` | ✅ | Send message as agent |

---

### 📈 Analytics

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/analytics/overview` | ✅ | Full analytics (volume, CSAT, AI vs human, agent performance, busiest hours) |

Query: `?range=7d` or `30d` or `90d`

---

### 📚 Knowledge Base

| Method | Route | Role | Description |
|--------|-------|------|-------------|
| `GET` | `/api/faqs` | ✅ All | List FAQs with search + categories |
| `POST` | `/api/faqs` | 🔒 Admin | Create FAQ |
| `PATCH` | `/api/faqs/:id` | 🔒 Admin | Edit FAQ |
| `DELETE` | `/api/faqs/:id` | 🔒 Admin | Soft-delete FAQ |

---

### 🤖 AI Config

| Method | Route | Role | Description |
|--------|-------|------|-------------|
| `GET` | `/api/ai-config` | ✅ All | Get tenant AI settings |
| `PATCH` | `/api/ai-config` | 🔒 Admin | Update AI settings |

Fields: `isEnabled, autoEscalation, suggestedReplies, confidenceThreshold, responseTone, systemPrompt, escalationKeywords, maxAiRepliesPerTicket`

---

### 💡 AI Insights

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/ai-insights` | ✅ | AI reply stats, confidence, escalations, top FAQs, learning suggestions |

---

### 🪟 Widget Config

| Method | Route | Role | Description |
|--------|-------|------|-------------|
| `GET` | `/api/widget-config` | ✅ All | Get config + embed script |
| `PATCH` | `/api/widget-config` | 🔒 Admin | Update widget appearance |

---

### 👥 Team

| Method | Route | Role | Description |
|--------|-------|------|-------------|
| `GET` | `/api/team` | 🔒 Admin | All agents with tickets + CSAT + online status |
| `GET` | `/api/team/invite-code` | 🔒 Admin | Get shareable invite code |

---

### 🔔 Notifications

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/notifications` | ✅ | Notifications with unread count |
| `PATCH` | `/api/notifications/mark-read` | ✅ | Mark read (by IDs or all) |

---

### ⭐ CSAT

| Method | Route | Role | Description |
|--------|-------|------|-------------|
| `GET` | `/api/csat` | 🔒 Admin | All CSAT responses + summary |
| `POST` | `/api/csat` | ✅ | Submit CSAT rating |

---

### 🏢 Organization

| Method | Route | Role | Description |
|--------|-------|------|-------------|
| `GET` | `/api/organization` | 🔒 Admin | Tenant + support config |
| `PATCH` | `/api/organization` | 🔒 Admin | Update company settings + support hours |

---

### 👤 Profile & Billing

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/profile` | ✅ | Current user profile |
| `PATCH` | `/api/profile` | ✅ | Update name |
| `PATCH` | `/api/profile/password` | ✅ | Change password |
| `GET` | `/api/billing` | 🔒 Admin | Plan, usage, payment history |

---

### 🌐 Public Widget API

These endpoints are **public** — no JWT required. They are protected by widget key validation instead.

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/widget/config/:widgetKey` | Load widget config (color, messages, AI state) |
| `POST` | `/api/widget/message` | Send customer message → AI response |
| `POST` | `/api/widget/escalate` | Manually escalate to human agent |
| `GET` | `/api/widget/conversation/:id` | Resume existing conversation |

---

## 🏢 Multi-Tenant System

ChatFrame uses **one database** (`chatframe`) with **shared collections**. Every document carries a `tenantId` — never separate databases or collections per company.

```
tenantId format:   cf_nike_a82x91
inviteCode format: CF-92KDL2A3
widgetKey format:  cf_live_abcd1234
```

### Tenant isolation in code
```js
// Every service query is always scoped:
Ticket.find({ tenantId: req.user.tenantId, ...filters })

// Never:
Ticket.find({ ...filters }) // ← this would be a security violation
```

---

## 🔐 Auth & RBAC

### Roles

| Role | Description | Capabilities |
|------|-------------|--------------|
| `company_admin` | Created at company onboarding | Full dashboard access, manage agents, configure AI/widget |
| `support_agent` | Joins via invite code | Inbox, tickets, own profile |
| `super_admin` | Platform-level (future) | Cross-tenant access |

### Usage in routes
```js
// Protect by auth only
router.get('/tickets', authMiddleware, handler);

// Protect by role
router.patch('/ai-config', authMiddleware, roleMiddleware('company_admin'), handler);

// Tenant isolation guard
router.get('/resource/:tenantId', authMiddleware, tenantGuard, handler);
```

### Token flow
```
Login → accessToken (7d) + refreshToken (30d)
Logout → token blacklisted in Redis
All requests → Authorization: Bearer <accessToken>
```

---

## 🧭 Onboarding Flow

### Company (4 steps, DB write only on step 4)

```
Step 1 → Redis session created with account data
Step 2 → Company identity appended to Redis session
Step 3 → Company details appended to Redis session
Step 4 → DB writes: User + Tenant + SupportConfig
       → Redis session deleted
       → JWT issued
       → company_admin role assigned
```

### Agent (2 steps)

```
Step 1 → Redis session created with account data
Step 2 → Invite code validated → Tenant found
       → DB write: User with tenantId + role=support_agent
       → Redis session deleted
       → JWT issued
```

---

## 🌐 Widget System

### How it works

1. Company copies embed script from Dashboard → Widget Config
2. Script is pasted on their website
3. Widget loads, fetches config using `widgetKey`
4. Customer opens widget, starts chat
5. Messages hit `/api/widget/message`
6. Gemini AI generates a response using FAQs + system prompt
7. If confidence < threshold → auto-escalate
8. Ticket created → appears in Inbox + Tickets instantly

### Embed script
```html
<script
  src="https://cdn.chatframe.io/widget.js"
  data-key="cf_live_abcd1234"
  defer
></script>
```

### Widget security
- Every public request validated against `widgetKey`
- Tenant resolved from key — never from user input
- Rate limited per IP (Redis-backed)
- Dashboard APIs completely separated from widget APIs

---

## 🤖 AI Engine

### Gemini integration
- Model: `gemini-pro`
- Context includes: system prompt + FAQ list + conversation history + response tone
- Every response scored with a confidence value (0.0 – 1.0)

### Prompt structure
```
[System Prompt from AI Config]

Company FAQs:
Q: How do I reset my password?
A: Go to settings → security → reset password.
... (all active FAQs)

Conversation history:
Customer: ...
AI: ...

Customer: [current message]
Respond in a [tone] tone. Max [N] words.
```

### Confidence scoring
Scores are calculated from:
- Gemini response certainty signals
- Keyword matching against FAQ content
- Escalation keyword detection
- Message repetition / frustration detection

### Auto-escalation triggers
| Trigger | Action |
|---------|--------|
| Confidence < threshold | Escalate to human |
| Escalation keywords detected | Escalate immediately |
| AI disabled | Skip AI, escalate directly |
| Out-of-hours | Notify + create ticket |
| Max AI replies reached | Escalate |

---

## ⚡ Real-Time (Socket.io)

### Connection
```js
const socket = io('http://localhost:5000', {
  auth: { token: 'Bearer <accessToken>' }
});
```

### Rooms
```
tenant:<tenantId>     → All agents in a company (broadcasts)
user:<userId>         → Personal notifications
ticket:<ticketId>     → Live conversation room
```

### Events

**Client → Server**
```
ticket:join       { ticketId }     Join conversation room
ticket:leave      { ticketId }     Leave room
typing:start      { ticketId }     Broadcasting typing indicator
typing:stop       { ticketId }     Stop typing indicator
heartbeat                          Keep online presence alive (every 60s)
```

**Server → Client**
```
message:new       { ticketId, message }    New message in conversation
agent:online      { userId }               Agent came online
agent:offline     { userId }               Agent went offline
typing:start      { userId, ticketId }     Someone is typing
typing:stop       { userId, ticketId }     Stopped typing
ticket:escalated  { ticket }               Ticket escalated (notify agents)
notification:new  { notification }         New notification
```

---

## 🗄️ Redis Architecture

| Key Pattern | TTL | Purpose |
|-------------|-----|---------|
| `onboard:session:<uuid>` | 30 min | Multi-step onboarding form state |
| `auth:blacklist:<token>` | 7 days | Logout token invalidation |
| `user:session:<userId>` | 7 days | Fast socket auth + session cache |
| `online:<tenantId>:<userId>` | 5 min | Agent online presence (refreshed by heartbeat) |
| `rl:auth:<ip>:<route>` | 15 min | Auth route rate limiting |
| `rl:onboard:<ip>:<route>` | 1 hour | Onboarding rate limiting |
| `rl:widget:<ip>` | 1 min | Widget API rate limiting |

> Rate limiters fail **open** — if Redis is unavailable, requests pass through rather than blocking users.

---

## 🗃️ Database Models

| Model | Collection | Key Fields |
|-------|-----------|------------|
| `User` | `users` | `tenantId, role, email, password(hidden)` |
| `Tenant` | `tenants` | `tenantId, inviteCode, companyName, plan` |
| `SupportConfig` | `supportconfigs` | `tenantId, supportHours, outOfHoursMessage` |
| `Ticket` | `tickets` | `tenantId, ticketNumber, status, priority, assignedTo` |
| `Message` | `messages` | `tenantId, ticketId, senderType, isAiGenerated, aiConfidence` |
| `FAQ` | `faqs` | `tenantId, question, answer, category, aiUsageCount` |
| `Notification` | `notifications` | `tenantId, userId, type, isRead` |
| `CSAT` | `csats` | `tenantId, ticketId, rating, isNegative` |
| `AIConfig` | `aiconfigs` | `tenantId, isEnabled, systemPrompt, confidenceThreshold` |
| `WidgetConfig` | `widgetconfigs` | `tenantId, widgetKey, primaryColor, welcomeMessage` |

---

## 📁 Folder Structure

```
backend/
└── src/
    ├── config/
    │   ├── db.js                    MongoDB connection
    │   └── redis.js                 Redis client (ioredis)
    │
    ├── models/
    │   ├── User.js                  Users (all roles)
    │   ├── Tenant.js                Company workspaces
    │   ├── SupportConfig.js         Support hours per tenant
    │   ├── Ticket.js                Support tickets
    │   ├── Message.js               Conversation messages
    │   ├── FAQ.js                   Knowledge base
    │   ├── Notification.js          In-app notifications
    │   ├── CSAT.js                  Customer satisfaction scores
    │   ├── AIConfig.js              Per-tenant AI settings
    │   └── WidgetConfig.js          Per-tenant widget settings
    │
    ├── services/
    │   ├── authService.js           User creation, login logic
    │   ├── tenantService.js         Tenant creation, invite codes
    │   ├── redisService.js          Session cache, blacklist, presence
    │   ├── dashboardService.js      Analytics aggregations
    │   ├── ticketService.js         Ticket CRUD + lifecycle
    │   ├── inboxService.js          Conversations + messaging
    │   ├── analyticsService.js      Charts + performance data
    │   ├── aiInsightsService.js     AI usage analysis
    │   ├── widgetService.js         Widget config + embed script
    │   ├── teamService.js           Agent listing + presence
    │   └── aiService.js             Gemini AI engine + escalation
    │
    ├── controllers/                 One per domain (thin, delegates to services)
    │
    ├── routes/
    │   ├── index.js                 Route registry
    │   ├── authRoutes.js            /api/auth/*
    │   ├── dashboardRoutes.js       All dashboard routes
    │   ├── widgetRoutes.js          Public widget API
    │   └── onboarding/
    │       ├── companyRoutes.js     /api/onboard/company/*
    │       └── agentRoutes.js       /api/onboard/agent/*
    │
    ├── middleware/
    │   ├── authMiddleware.js        JWT verification
    │   ├── roleMiddleware.js        RBAC + tenant guard
    │   ├── rateLimiter.js           Redis-backed rate limiting
    │   ├── widgetAuth.js            Widget key validation
    │   ├── validate.js              express-validator handler
    │   └── errorHandler.js         Global error handler
    │
    ├── utils/
    │   ├── jwt.js                   Token sign/verify
    │   ├── AppError.js              Operational error class
    │   ├── asyncHandler.js          Async try/catch wrapper
    │   ├── apiResponse.js           Standardized JSON envelope
    │   └── tenantUtils.js           tenantId + inviteCode generators
    │
    ├── validators/
    │   └── onboardingValidators.js  All validation rule sets
    │
    ├── sockets/
    │   └── index.js                 Socket.io init, auth, rooms, events
    │
    ├── app.js                       Express app (middleware, routes)
    └── server.js                    Entry point (boot, graceful shutdown)
```

---

## 🛡️ Security Practices

- Passwords hashed with bcrypt (12 salt rounds)
- JWT tokens signed with separate access/refresh secrets
- Password field excluded from all DB queries by default (`select: false`)
- Token blacklisting on logout (Redis)
- Helmet.js HTTP headers hardening
- CORS restricted to configured origins
- Rate limiting on all public-facing routes
- Widget API completely isolated from dashboard API
- Every query scoped to `tenantId` — zero cross-tenant data leakage
- Global error handler never exposes stack traces in production

---

<div align="center">

Built with 🔥 for real SaaS infrastructure.

**ChatFrame** — Not a demo. A platform.

</div>