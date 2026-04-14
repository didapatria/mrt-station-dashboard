# MRT Jakarta - Station Management Dashboard

Full-stack web application for managing MRT Jakarta stations and train schedules. Built with modern web technologies focusing on clean architecture, type safety, and great developer experience.

## Tech Stack

### Frontend
- **React 19** + TypeScript (Vite)
- **Tailwind CSS** + **Shadcn UI** - Styling & UI components
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
- **Zod** - Request validation

### Infrastructure
- **Docker** + **docker-compose** - Containerization

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

- **Authentication** - Register/Login with JWT tokens
- **Dashboard** - Overview with statistics, hourly schedule chart, export CSV
- **Station Management** - CRUD operations with search, filter, and pagination
- **Schedule Management** - Train schedule CRUD with station relations and pagination
- **API Documentation** - Interactive Swagger UI at `/api/docs`
- **Dark Mode** - Toggle between light and dark themes
- **Toast Notifications** - Real-time feedback for all actions
- **Export CSV** - Download station and schedule data as CSV files
- **Profile Page** - User account information and tech stack overview
- **Responsive Design** - Mobile-first with sidebar navigation
- **Animations** - Smooth page transitions and list animations (Framer Motion)
- **Form Validation** - Client & server-side with Zod schemas
- **Server State Caching** - Automatic caching and background refetching (TanStack Query)
- **Interactive Station Map** - Leaflet-powered map with route visualization and station markers
- **Role-Based Access** - Admin vs Operator UI with conditional CRUD actions
- **CI/CD** - GitHub Actions pipeline with lint, type check, test, and build
- **Testing** - Vitest + React Testing Library + Supertest + Playwright
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
docker exec mrt-backend npx prisma migrate deploy --schema=src/prisma/schema.prisma

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

## Database Schema

```
users          stations              schedules
├── id         ├── id                ├── id
├── name       ├── name              ├── train_number
├── email      ├── code (unique)     ├── departure_station_id → stations.id
├── password   ├── location          ├── arrival_station_id → stations.id
├── role       ├── latitude          ├── departure_time
├── created_at ├── longitude         ├── arrival_time
└── updated_at ├── status            ├── day_type
               ├── order             ├── status
               ├── created_at        ├── created_at
               └── updated_at        └── updated_at
```

## License

MIT
