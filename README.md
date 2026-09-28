# ⚡ AI Form Builder

<div align="center">

  <p align="center">
    <strong>Create, customize, and deploy dynamic forms in seconds using natural language prompts powered by Google Gemini AI.</strong>
  </p>

  <p align="center">
    <a href="#-key-features">Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-architecture--redis-caching">Architecture</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-api-reference">API Reference</a> •
    <a href="#-environment-variables">Environment Variables</a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Node.js-v20+-68a063?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/TypeScript-5.5+-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/React-19+-61dafb?style=for-the-badge&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/PostgreSQL-Neon-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Redis-ioredis-dc382d?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
    <img src="https://img.shields.io/badge/Gemini_AI-2.0-8e75c2?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" />
  </p>
</div>

---

## 🚀 Overview

**AI Form Builder** is a modern, full-stack SaaS platform designed to eliminate manual form design. Describe what kind of form you need in plain English (e.g., *"A 3-step customer onboarding survey for a fintech app"*), and the AI will generate questions, field types, smart validation rules, placeholders, and themes.

The app provides an intuitive drag-and-drop visual builder, instant publishing via public shareable URLs, submission management, CSV exports, and real-time response analytics.

---

## ✨ Key Features

### 🤖 AI-Powered Capabilities
- **Natural Language Form Generation**: Generate full questionnaires with appropriate field types and layout blocks.
- **Smart Validation Generator**: Automatically suggests regex patterns, length boundaries, and tailored error messages for fields.
- **Question Enhancer**: Refines wording and adds helpful placeholder suggestions.
- **Form Summarization**: Analyzes estimated completion time, target audience, and optimization suggestions.
- **Daily Rate Limiting**: Redis-backed limit (5 AI form generations per day per user).

### 🛠️ Form Builder & Management
- **Drag-and-Drop Canvas**: Powered by `@dnd-kit` for seamless question reordering.
- **19+ Supported Field Types**: Text, Email, Phone, Number, Dropdown, Radio, Checkbox, Date, Rating, File, Yes/No, Address, URL, Password, Section, Heading, Paragraph, and Image blocks.
- **Visual Theming**: Pre-built themes (`minimal`, `modern`, `corporate`, `gradient`, `dark`, `glassmorphism`) and customizable brand colors.
- **Draft & Publish Workflow**: Unique slug-based public URLs for live response collection.
- **Form Duplication & Archival**: Duplicate or archive forms with a single click.

### 📊 Analytics & Response Management
- **Interactive Analytics Dashboard**: Conversion rates, drop-off rates, average completion times, device breakdowns, and response heatmaps (built with Recharts).
- **Universal Inbox**: Search and review individual responses across all forms.
- **CSV Data Export**: One-click download of collected submissions for external analysis.
- **Multi-layer Redis Caching**: Sub-millisecond reads for public forms and heavy aggregation dashboards.

---

## 💻 Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Lucide Icons
- **Drag & Drop**: `@dnd-kit/core`, `@dnd-kit/sortable`
- **Charts & Graphs**: Recharts
- **Forms & Validation**: `react-hook-form`
- **Routing**: `react-router-dom`
- **Notifications**: Sonner

### Backend
- **Runtime**: Node.js + TypeScript (executed with `tsx`)
- **Web Framework**: Express.js
- **Database**: PostgreSQL (with JSONB support for dynamic schemas)
- **In-Memory Cache & Rate Limiting**: Redis (`ioredis`)
- **AI Engine**: Google Gemini API (`@google/genai`)
- **Authentication**: JWT & `bcryptjs`

---

## ⚡ Architecture & Redis Caching

The backend incorporates caching and rate-limiting patterns using Redis:

```
[ Respondent / User ] ───► [ Express API ]
                                │
       ┌────────────────────────┴────────────────────────┐
       ▼                                                 ▼
[ Redis Cache & Limiter ]                     [ PostgreSQL (Neon) ]
 ├── cache:form:slug:<slug>  (1 hr TTL)        ├── Users Table
 ├── cache:analytics:form:<id> (2 min TTL)     ├── Forms Table (JSONB)
 ├── cache:insights:user:<id>  (2 min TTL)     └── Responses Table (JSONB)
 └── ratelimit:ai_form:<userId>:<date> (5/day)
```

1. **Public Form Cache**: Responses to `GET /api/public/forms/:slug` are served directly from Redis, bypassing database queries for viral forms.
2. **AI Rate Limiting**: `POST /api/ai/generate-form` enforces a sliding daily budget of 5 form generations per user.
3. **Analytics Aggregation Cache**: Complex analytics metrics are cached for 2 minutes and invalidated on new response submissions.
4. **Graceful Fallback**: If Redis is offline or unavailable, the backend gracefully falls back to Postgres.

---

## 📁 Project Structure

```
AI-FORM-BUILDER/
├── Backend/
│   ├── config/
│   │   ├── db.ts               # PostgreSQL pool connection & auto-migrations
│   │   ├── env.ts              # Environment variable validation
│   │   └── redis.ts            # Redis client & cache helper methods
│   ├── controllers/            # Request handlers (Auth, Forms, AI, Responses, Insights)
│   ├── middleware/
│   │   ├── auth.ts             # JWT authentication guard
│   │   ├── errorHandler.ts     # Global centralized error handling
│   │   └── rateLimiter.ts      # Redis-backed AI daily rate limiter
│   ├── repositories/           # PostgreSQL database query layer
│   ├── routes/                 # Express API route declarations
│   ├── services/               # Business logic & AI generation pipelines
│   ├── types/                  # Shared TypeScript interfaces & types
│   ├── utils/                  # Helpers (ApiError, nanoid, CSV builder, seeders)
│   ├── server.ts               # Application entry point
│   ├── app.ts                  # Express application setup
│   └── tsconfig.json           # Backend TypeScript configuration
├── Frontend/
│   ├── src/                    # React UI components, pages, hooks, and store
│   └── package.json
└── README.md
```

---

## 🏁 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or higher
- **PostgreSQL**: PostgreSQL 14+ database (e.g. Neon, Supabase, or local Postgres)
- **Redis** *(Optional, recommended)*: Local Redis instance or Redis Cloud / Upstash
- **Google Gemini API Key**: [Get a Gemini API Key](https://aistudio.google.com/)

---

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/AI-FORM-BUILDER.git
   cd AI-FORM-BUILDER
   ```

2. **Setup Backend:**
   ```bash
   cd Backend
   npm install
   ```

3. **Configure Backend Environment:**
   Create a `.env` file in the `Backend/` directory:
   ```env
   PORT=8000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173

   # PostgreSQL Connection URL
   DATABASE_URL=postgresql://user:password@localhost:5432/aiformbuilder?sslmode=require

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRES_IN=7d

   # Google Gemini AI
   GEMINI_API_KEY=your_gemini_api_key
   GEMINI_MODEL=gemini-2.0-flash

   # Redis Configuration
   REDIS_URL=redis://127.0.0.1:6379
   ```

4. **Seed Demo Data (Optional):**
   Populate your database with sample forms, demo user, and 900+ simulated responses:
   ```bash
   npm run seed
   # Demo credentials: vedavrat.paul@123.dev / Test@1234
   ```

5. **Start the Backend:**
   ```bash
   npm run dev
   # Server runs on http://localhost:8000
   ```

6. **Setup and Start Frontend:**
   In a new terminal:
   ```bash
   cd ../Frontend
   npm install
   npm run dev
   # App runs on http://localhost:5173
   ```

---

## 📡 API Reference

### 🔐 Authentication
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Log in and receive JWT | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes |
| `PUT` | `/api/auth/profile` | Update profile details | Yes |
| `PUT` | `/api/auth/password` | Change account password | Yes |

### 📋 Forms
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/forms` | List user forms (supports `?search=` and `?filter=`) | Yes |
| `POST` | `/api/forms` | Create a new form | Yes |
| `GET` | `/api/forms/:id` | Get form details by ID | Yes |
| `PUT` | `/api/forms/:id` | Update form structure & settings | Yes |
| `DELETE` | `/api/forms/:id` | Delete a form | Yes |
| `POST` | `/api/forms/:id/publish` | Toggle publish / draft state | Yes |
| `POST` | `/api/forms/:id/duplicate`| Clone an existing form | Yes |
| `GET` | `/api/public/forms/:slug` | Fetch public form schema (Cached in Redis) | No |

### 🤖 AI Utilities
| Method | Endpoint | Description | Limit |
|---|---|---|---|
| `POST` | `/api/ai/generate-form` | Generate a full form from prompt | 5 / day |
| `POST` | `/api/ai/generate-validation` | Suggest field validation rules | None |
| `POST` | `/api/ai/improve-question` | Enhance question wording | None |
| `POST` | `/api/ai/form-summary` | Analyze audience & completion time | None |

### 📥 Responses & Analytics
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/public/forms/:slug/respond` | Submit a form response | No |
| `GET` | `/api/forms/:id/responses` | List responses for a form | Yes |
| `GET` | `/api/forms/:id/analytics` | Form analytics & breakdown (Cached) | Yes |
| `GET` | `/api/forms/:id/responses/export` | Export submissions to CSV | Yes |
| `GET` | `/api/insights` | Overview stats across all forms (Cached) | Yes |
| `GET` | `/api/inbox` | Universal response inbox | Yes |

---

## 🛡️ License

This project is licensed under the [MIT License](LICENSE).