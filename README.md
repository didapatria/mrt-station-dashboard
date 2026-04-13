# MRT Jakarta - Station Management Dashboard

Full-stack web application for managing MRT Jakarta stations and train schedules. Built with modern web technologies focusing on clean architecture, type safety, and great developer experience.

## Tech Stack

### Frontend
- **React 19** + TypeScript (Vite)
- **Zustand** - Lightweight state management
- **Tailwind CSS** + **Shadcn UI** - Styling & UI components
- **React Hook Form** + **Zod** - Form handling & validation
- **Framer Motion** - Smooth animations
- **React Router v7** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Node.js** + **Express.js** + TypeScript
- **Prisma ORM** - Type-safe database access
- **PostgreSQL** - Relational database
- **JWT** - Authentication
- **Zod** - Request validation

### Infrastructure
- **Docker** + **docker-compose** - Containerization

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend    │────▶│  PostgreSQL   │
│  React+Vite  │     │  Express.js  │     │   Database    │
│  Port: 5173  │     │  Port: 3000  │     │  Port: 5432   │
└──────────────┘     └──────────────┘     └──────────────┘
```

### Frontend Architecture
```
src/
├── components/ui/  # Reusable UI components (Shadcn-style)
├── pages/          # Route page components
├── store/          # Zustand stores (auth, station, schedule)
├── services/       # API service layer (axios)
├── hooks/          # Custom React hooks
├── layouts/        # Auth & Dashboard layouts
├── lib/            # Utility functions
└── types/          # TypeScript type definitions
```

### Backend Architecture
```
src/
├── controllers/    # Request handlers (thin layer)
├── services/       # Business logic & database operations
├── middlewares/     # Auth, validation, error handling
├── routes/         # Express route definitions
├── validators/     # Zod schemas for request validation
├── types/          # TypeScript type definitions
└── prisma/         # Schema, migrations, seed data
```

## Features

- **Authentication** - Register/Login with JWT tokens
- **Dashboard** - Overview with station & schedule statistics
- **Station Management** - CRUD operations with search & filter
- **Schedule Management** - Train schedule CRUD with station relations
- **Responsive Design** - Mobile-first with sidebar navigation
- **Animations** - Smooth page transitions and list animations
- **Form Validation** - Client & server-side with Zod schemas

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
