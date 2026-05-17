# MRT Jakarta - Station Management Dashboard

<p align="left">
  <a href="https://github.com/didapatria/mrt-station-dashboard/actions/workflows/ci.yml">
    <img src="https://github.com/didapatria/mrt-station-dashboard/actions/workflows/ci.yml/badge.svg" alt="CI" />
  </a>
  <a href="https://didapatria.github.io/mrt-station-dashboard/">
    <img src="https://img.shields.io/badge/E2E%20Report-GitHub%20Pages-0969da?logo=github&logoColor=white" alt="E2E Report" />
  </a>
  <img src="https://img.shields.io/badge/version-2.12.0-blue" />
</p>

<p align="left">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-000000?logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/Playwright-45ba4b?logo=playwright&logoColor=white" />
</p>

Full-stack web application for managing MRT Jakarta stations and train schedules. Built with modern web technologies focusing on clean architecture, type safety, and great developer experience. Features a cohesive **Operations Terminal** design system — Bebas Neue display type, JetBrains Mono data labels, LED status indicators, and an editorial card layout.

## Live Deployment

| Service | URL |
|---------|-----|
| Frontend | [mrt-station-dashboard.vercel.app](https://mrt-station-dashboard.vercel.app/) |
| Backend API | [mrt-station-backend.fly.dev](https://mrt-station-backend.fly.dev/) |
| API Docs | [mrt-station-backend.fly.dev/api/docs](https://mrt-station-backend.fly.dev/api/docs) |
| E2E Report | [didapatria.github.io/mrt-station-dashboard](https://didapatria.github.io/mrt-station-dashboard/) |

## Highlights

- 🚉 Full-stack enterprise dashboard — 14 pages, 40+ features, 120+ commits
- 🎨 **Operations Terminal** design system — Bebas Neue + JetBrains Mono + Sora, LED status dots, editorial cards
- 🔐 JWT Authentication + Google OAuth + Spatie-style 5-table RBAC
- 🗺 Interactive map with Leaflet (station markers + location picker)
- 🧪 106 E2E Playwright tests — screenshots on every test, report on [GitHub Pages](https://didapatria.github.io/mrt-station-dashboard/)
- 📦 Dockerized with GitHub Actions CI/CD (lint, typecheck, unit, E2E, deploy)
- 🌐 Internationalization (EN/ID) + PWA + Real-time SSE notifications

## Tech Stack

### Frontend
- **React 19** + TypeScript (Vite 8)
- **Tailwind CSS** + **Shadcn UI** - Styling & UI components
- **Sora** + **Bebas Neue** + **JetBrains Mono** - Operations Terminal design system
- **Zustand** - Client state management
- **TanStack Query** - Server state management
- **React Hook Form** + **Zod** - Form handling & validation
- **Leaflet** + **React-Leaflet** - Interactive maps
- **Framer Motion** - Smooth animations
- **React Router v7** - Client-side routing
- **Axios** - HTTP client
- **Recharts** - Charts and data visualization
- **react-i18next** - Internationalization (EN/ID)
- **jsPDF** - PDF report generation
- **react-joyride** - Onboarding tour
- **Vitest** + **React Testing Library** - Testing

### Backend
- **Node.js** + **Express.js** + TypeScript
- **Prisma ORM** - Type-safe database access
- **PostgreSQL** - Relational database
- **JWT** - Authentication
- **Google OAuth** - Social login (google-auth-library + @react-oauth/google)
- **Zod** - Request validation

### Infrastructure
- **Docker** + **docker-compose** - Containerization
- **Fly.io** - Backend deployment (free tier, auto-stop/start)
- **Supabase** - Managed PostgreSQL (free tier)
- **Vercel** - Frontend deployment (free tier)

## Key Libraries

### Shadcn UI
Shadcn is an open-source framework providing pre-built, accessible, and customizable UI components for rapid web application development. It offers a streamlined approach to construct modern user interfaces.

### Tailwind CSS
CSS Framework that provides atomic CSS classes to help you style components e.g. flex, pt-4, text-center and rotate-90 that can be composed to build any design, directly in your markup.

### Zustand
Zustand is a small, fast and scalable bearbones state-management solution using simplified flux principles. Has a comfy api based on hooks, isn't boilerplatey or opinionated. Zustand is often used as an alternative to other state management libraries, such as Redux and MobX, because of its simplicity and small size. It is particularly well-suited for small to medium-sized applications, where the complexity of larger state management libraries is not required.

### TanStack Query
TanStack Query, previously known as React Query, is a powerful library for fetching, caching, synchronizing, and updating server state in your React applications. It simplifies the process of handling asynchronous data, reducing boilerplate code and improving the user experience by providing features like automatic retries, background updates, and optimistic updates. It essentially helps you manage data fetching and caching in a declarative and efficient way.

### Zod
Zod is a TypeScript-first schema declaration and validation library. I'm using the term "schema" to broadly refer to any data type, from a simple string to a complex nested object. Zod is designed to be as developer-friendly as possible. The goal is to eliminate duplicate type declarations. With Zod, you declare a validator once and Zod will automatically infer the static TypeScript type. It's easy to compose simpler types into complex data structures.

### React Hook Form
React hook form is an opensource form library for react. Performant, flexible and extensible forms with easy-to-use validation.

### Framer Motion
Framer Motion is a popular open-source motion library for React that allows developers to create sophisticated animations and interactions with ease. It is designed to be simple to use yet powerful, providing a rich set of tools to animate elements in a declarative way. It powers the amazing animations and interactions in Framer, the web builder for creative pros. Zero code, maximum speed.

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend    │────▶│  PostgreSQL  │
│  React+Vite  │     │  Express.js  │     │   Database   │
│  Port: 5173  │     │  Port: 3000  │     │  Port: 5432  │
└──────────────┘     └──────────────┘     └──────────────┘
```

### Frontend Architecture
```
src/
├── components/ui/  # Reusable UI components (Shadcn-style)
├── pages/          # Route page components
├── hooks/          # TanStack Query hooks (server state)
├── store/          # Zustand stores (client state: auth, theme)
├── services/       # API service layer (axios)
├── layouts/        # Auth & Dashboard layouts
├── lib/            # Utility functions
└── types/          # TypeScript type definitions
```

### Backend Architecture
```
src/
├── controllers/    # Request handlers (thin layer)
├── services/       # Business logic & database operations
├── middlewares/    # Auth, validation, error handling
├── routes/         # Express route definitions
├── validators/     # Zod schemas for request validation
├── types/          # TypeScript type definitions
└── prisma/         # Schema, migrations, seed data
```

### Data Flow
```
React Page → TanStack Query Hook → API Service (axios) → Express Route → Controller → Service → Prisma → PostgreSQL
```

## Features

- **Authentication** - Register/Login with JWT tokens + Google OAuth
- **Dashboard** - Overview with statistics, hourly schedule chart, export CSV
- **Station Management** - CRUD with map location picker, search, filter, pagination
- **Schedule Management** - Train schedule CRUD with native time picker and station relations
- **Feedback System** - Star rating + category form, stored in DB, admin-viewable
- **API Documentation** - Interactive Swagger UI at `/api/docs`
- **Dark Mode** - Toggle between light and dark themes
- **Toast Notifications** - Real-time feedback for all actions
- **Export CSV** - Download station and schedule data as CSV files
- **Profile Page** - User account information and tech stack overview
- **Responsive Design** - Mobile-first with sidebar navigation
- **Animations** - Smooth page transitions, list animations (Framer Motion), transit-line nav indicator spring animation
- **Design System** - Deep blue-black dark mode, blue-white light mode, transit-line sidebar indicator (CSS `::before`), table row left accent reveal, custom scrollbar
- **Form Validation** - Client & server-side with Zod schemas
- **Server State Caching** - Automatic caching and background refetching (TanStack Query)
- **Interactive Station Map** - Leaflet-powered map with route visualization, station markers, and location picker
- **Role-Based Access Control** - Spatie-style 5-table RBAC (`roles`, `permissions`, `model_has_roles`, `model_has_permissions`, `role_has_permissions`), `GET /api/permissions/me` returns user permissions on login, stored in Zustand, no hardcoded frontend config
- **CI/CD** - GitHub Actions pipeline with lint, type check, test, and build
- **Unit Testing** - Vitest + React Testing Library + Supertest
- **E2E Testing** - Playwright (106 tests across 20 spec files, including mobile viewport, UI design, and full-page UI screenshot capture)
- **Real-time Notifications** - Server-Sent Events with notification center
- **i18n** - English and Indonesian language support
- **Route Planner** - Find schedules between stations
- **Station Comparison** - Side-by-side station compare
- **Activity/Audit Log** - Track all data changes with CSV export
- **User Management** - Admin CRUD with role assignment
- **PDF Export** - Generate dashboard reports with jsPDF
- **PWA** - Installable progressive web app
- **Change Password** - Secure password update with validation
- **Onboarding Tour** - Guided tour for new users
- **Keyboard Shortcuts** - Cmd+K search, ? for shortcuts help
- **Settings Page** - Language, theme, notification preferences
- **Changelog** - Version history and release notes
- **Docker** - Full containerization with docker-compose

## Getting Started

### Prerequisites
- Node.js 22+
- PostgreSQL 16+
- Docker & Docker Compose (optional)

### Option 1: Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# Run database migrations
docker exec mrt-backend npx prisma migrate deploy --schema=prisma/schema.prisma

# Seed database
docker exec mrt-backend node dist/prisma/seed.js

# Open http://localhost
```

### Option 2: Local Development

```bash
# Backend
cd backend
cp .env.example .env  # Edit DATABASE_URL if needed
npm install
npx prisma generate --schema=src/prisma/schema.prisma
npx prisma migrate dev --schema=src/prisma/schema.prisma
npm run seed
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev

# Open http://localhost:5173
```

### Demo Credentials
```
Admin:    admin@mrtjakarta.co.id / admin123
Operator: operator@mrtjakarta.co.id / operator123
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/google` | Login/Register with Google OAuth |
| GET | `/api/auth/profile` | Get current user profile |

### Stations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stations` | List all stations |
| GET | `/api/stations/:id` | Get station by ID |
| POST | `/api/stations` | Create station |
| PUT | `/api/stations/:id` | Update station |
| DELETE | `/api/stations/:id` | Delete station |

### Schedules
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/schedules` | List all schedules |
| GET | `/api/schedules/:id` | Get schedule by ID |
| POST | `/api/schedules` | Create schedule |
| PUT | `/api/schedules/:id` | Update schedule |
| DELETE | `/api/schedules/:id` | Delete schedule |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Dashboard statistics |
| GET | `/api/dashboard/stations-summary` | Station status summary |
| GET | `/api/dashboard/schedules-by-hour` | Hourly schedule distribution |

### Users (Admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users (with search, role filter) |
| PATCH | `/api/users/:id/role` | Update user role |
| DELETE | `/api/users/:id` | Delete user |

### Permissions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/permissions/me` | Get current user's permissions (authenticated) |
| GET | `/api/permissions` | List all permissions with role assignments (admin only) |

### Feedback
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/feedback` | Submit feedback (authenticated) |
| GET | `/api/feedback` | List feedback (admin only) |

### Activity Logs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/activity-logs` | List activity logs (with entity filter) |

### Export
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/export/stations` | Export stations as CSV |
| GET | `/api/export/schedules` | Export schedules as CSV |

### Documentation
| URL | Description |
|-----|-------------|
| `/api/docs` | Swagger UI (interactive API docs) |
| `/api/docs.json` | OpenAPI JSON spec |

## UI Screenshots

Every Playwright test captures a screenshot (`screenshot: "on"`). After each CI run, the full HTML report — including all screenshots for every passing and failing test — is automatically deployed to **[GitHub Pages](https://didapatria.github.io/mrt-station-dashboard/)**.

Browse the report to see live UI screenshots of every page in the application.

## E2E Testing (Playwright)

### Prerequisites
Both backend and frontend must be running:
```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

### Running Tests
```bash
# Run all tests (headless)
npm run e2e

# Run with browser visible
npm run e2e:headed

# Run with Playwright UI (interactive)
npm run e2e:ui

# Run a specific test file
npx playwright test e2e/stations.spec.ts

# Run tests matching a name
npx playwright test -g "should create"

# Debug mode (step through tests)
npx playwright test --debug

# Show HTML report from last run
npm run e2e:report
```

### Test Coverage (106 tests)
| Spec File | Tests | What's Tested |
|-----------|-------|---------------|
| `auth.spec.ts` | 13 | Login, register, Google OAuth, validation, auth guard, 404 |
| `dashboard.spec.ts` | 3 | Stats, charts, tabs, export buttons, operator RBAC |
| `stations.spec.ts` | 3 | List, search, sort, pagination, detail, CRUD, map picker |
| `schedules.spec.ts` | 2 | List, search, timeline, CRUD, time picker |
| `feedback.spec.ts` | 4 | Star rating, submit, disabled state, bug category, operator submit |
| `permissions.spec.ts` | 6 | API /me (admin+operator), /all (admin+403), Access Management page |
| `users.spec.ts` | 4 | List, search, RBAC, access management matrix |
| `map.spec.ts` | 2 | Leaflet map, sidebar search |
| `route-planner.spec.ts` | 3 | Station selection, results, all 13 stations, operator access |
| `station-compare.spec.ts` | 2 | Side-by-side comparison, 13 stations in dropdown |
| `activity-log.spec.ts` | 3 | Entries, entity filter, CSV export |
| `settings.spec.ts` | 2 | Language/theme toggle |
| `profile.spec.ts` | 5 | Profile info, password validation, permissions card, operator perms, tech stack tabs |
| `changelog.spec.ts` | 4 | Version display, Latest badge, commit hash links, content per version |
| `navigation.spec.ts` | 4 | Sidebar routing, admin menu, logout |
| `ux-auth.spec.ts` | 4 | Password toggle, tab order, validation UX |
| `ux.spec.ts` | 8 | Forms, breadcrumbs, empty states, sidebar |
| `mobile.spec.ts` | 15 | Viewport overflow, sidebar toggle, nav, auth, map, profile, changelog — Pixel 7 |
| `ux-design.spec.ts` | 6 | Auth panel branding, rail line SVG, mobile hidden check, dashboard banner, stat cards |
| `ui-screenshots.spec.ts` | 13 | Full-page UI screenshots of all 13 pages (Dashboard→404) — appear in GitHub Pages report |

> **UI Screenshots**: Every test captures a screenshot (`screenshot: "on"`). `ui-screenshots.spec.ts` additionally saves full-page PNGs to `playwright-report/screenshots/`. After CI passes, the full HTML report with all screenshots is deployed to **[GitHub Pages](https://didapatria.github.io/mrt-station-dashboard/)**.

## Database Schema

```
users          stations          schedules          activity_logs       feedbacks
├── id         ├── id            ├── id             ├── id              ├── id
├── name       ├── name          ├── train_number   ├── user_id         ├── user_id
├── email      ├── code          ├── departure_stn  ├── action          ├── rating (1-5)
├── password   ├── location      ├── arrival_stn    ├── entity          ├── category
├── role*      ├── latitude      ├── departure_time ├── entity_id       ├── message
├── created_at ├── longitude     ├── arrival_time   ├── details         └── created_at
└── updated_at ├── status        ├── day_type       └── created_at
               ├── order         ├── status
               ├── created_at    ├── created_at
               └── updated_at    └── updated_at

RBAC (Spatie-style 5-table)
roles                permissions            model_has_roles        model_has_permissions  role_has_permissions
├── id               ├── id                ├── user_id → users    ├── user_id → users    ├── role_id → roles
├── name (unique)    ├── name (unique)     └── role_id → roles    └── permission_id      └── permission_id
└── label            ├── label                                         → permissions          → permissions
                     └── group

* role enum kept on users for backward compat; model_has_roles is source of truth for RBAC
```

## Deployment (Free Stack)

**Supabase** (PostgreSQL) + **Fly.io** (backend) + **Vercel** (frontend) — all free tiers, no sleep on backend.

### 1. Database — Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → Database → Connection string → URI**
3. Copy the connection string (use Transaction pooler for production):
   ```
   postgresql://postgres.[ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
   ```

### 2. Backend — Fly.io

```bash
# Install flyctl
brew install flyctl

# Login
flyctl auth login

# Deploy from backend/ directory
cd backend
flyctl launch --no-deploy   # creates fly.toml (already included)
flyctl secrets set \
  DATABASE_URL="postgresql://..." \
  JWT_SECRET="your-secret" \
  CORS_ORIGIN="https://your-app.vercel.app" \
  GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"

# Deploy (migrations run automatically on container start)
flyctl deploy
```

Free tier: 3 shared VMs, 256MB RAM, no sleep (auto-stop/start on traffic).

### 3. Frontend — Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from frontend/ directory
cd frontend
vercel --prod
# Set env vars when prompted:
#   VITE_API_URL = https://mrt-station-backend.fly.dev/api
#   VITE_GOOGLE_CLIENT_ID = your-client-id.apps.googleusercontent.com
```

Or connect GitHub repo in [vercel.com](https://vercel.com) dashboard:
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Add same env vars above

`vercel.json` handles SPA routing (included in repo).

### CI/CD
GitHub Actions runs on every push to `main`:
- Frontend: lint, type check, unit tests (Vitest + RTL), build
- Backend: unit tests (Supertest), build
- E2E: Playwright (106 tests across 20 spec files, `screenshot: "on"` + `video: "retain-on-failure"`) against local services + postgres — HTML report with screenshots deployed to **[GitHub Pages](https://didapatria.github.io/mrt-station-dashboard/)**
- Docker: `docker compose build` validation

## License

MIT
