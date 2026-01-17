# Architecture Overview

This document describes the technical architecture of Quantum Garden.

---

## System Design

Quantum Garden follows a modular architecture with clear separation between frontend visualization, API logic, and quantum computation.

```
┌─────────────────────────────────────────────────────────────────┐
│                     NEXT.JS 16 APP (TypeScript)                 │
│  React 19 + PixiJS 8 + tRPC                                     │
│  ┌─────────────────────────┬─────────────────────────┐          │
│  │       FRONTEND          │       API ROUTES        │          │
│  │  - PixiJS garden canvas │  - tRPC endpoints       │          │
│  │  - Observation system   │  - Prisma queries       │          │
│  │  - Zustand state        │  - Quantum service calls│          │
│  └─────────────────────────┴─────────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   QUANTUM SERVICE (Python)                      │
│  FastAPI + Qiskit + qiskit-ionq                                 │
│  - Quantum circuit generation (plant genomes)                   │
│  - Entanglement group creation                                  │
│  - IonQ job submission & result retrieval                       │
│  - Measurement → trait mapping                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      POSTGRESQL                                 │
│  - Plant state persistence                                      │
│  - Quantum results (immutable records)                          │
│  - Observation events                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend (`apps/web`)

| Technology     | Purpose                            |
| -------------- | ---------------------------------- |
| Next.js 16     | React 19 framework with App Router |
| TypeScript 5.7 | Type safety                        |
| PixiJS 8       | WebGL 2D rendering                 |
| Zustand        | Lightweight state management       |
| tRPC           | Type-safe API client               |

### API Layer (`apps/web/src/server`)

| Technology         | Purpose                   |
| ------------------ | ------------------------- |
| Next.js API Routes | Serverless API endpoints  |
| tRPC               | End-to-end type-safe APIs |
| Prisma             | Type-safe database ORM    |

### Quantum Service (`apps/quantum`)

| Technology  | Purpose                         |
| ----------- | ------------------------------- |
| FastAPI     | Modern async Python API         |
| Qiskit 1.x  | Quantum circuit framework       |
| qiskit-ionq | IonQ provider for real hardware |
| Pydantic    | Data validation                 |

### Infrastructure

| Technology     | Purpose            |
| -------------- | ------------------ |
| PostgreSQL     | Primary database   |
| Docker Compose | Local development  |
| Vercel         | Unified deployment |

---

## Data Flow

### Plant Creation

1. System generates a quantum circuit encoding trait possibilities
2. Circuit is submitted to IonQ (simulator or hardware)
3. Job ID and circuit definition are stored in database
4. Plant record is created with reference to quantum record

### Observation

1. Reticle and region alignment detected on frontend
2. Dwell timer completes after sustained alignment
3. Frontend sends observation request to API
4. API verifies plant is unobserved
5. API calls quantum service to perform measurement
6. Quantum service retrieves/executes quantum job
7. Measurement results are mapped to visual traits
8. Plant record is updated with resolved traits
9. All connected clients receive the update

---

## Key Design Decisions

### Why PixiJS?

PixiJS provides hardware-accelerated 2D rendering with:

- Smooth animations at 60fps
- Pixel-perfect rendering for glyphs
- Efficient batch rendering for many plants
- Cross-browser WebGL support

### Why tRPC?

tRPC offers end-to-end type safety:

- Types flow from server to client automatically
- No code generation or schema files
- Full autocomplete in the IDE
- Runtime validation with Zod

### Why Separate Python Service?

Qiskit and qiskit-ionq are Python-only:

- Direct access to Qiskit's circuit building
- Native IonQ provider integration
- Easier quantum algorithm development
- Clear separation of concerns

### Why PostgreSQL?

PostgreSQL provides:

- ACID compliance for observation events
- JSON support for flexible circuit storage
- Mature ecosystem with Prisma ORM
- Easy deployment on Vercel Postgres or Neon

---

## File Organization

```
quantum-garden/
├── apps/
│   ├── web/                     # Next.js frontend + API
│   │   ├── prisma/              # Database schema
│   │   └── src/
│   │       ├── app/             # Next.js App Router
│   │       ├── components/      # React components
│   │       ├── lib/             # Utilities
│   │       ├── server/          # tRPC routers
│   │       └── stores/          # Zustand stores
│   │
│   └── quantum/                 # Python quantum service
│       └── src/
│           ├── circuits/        # Quantum circuit builders
│           ├── ionq/            # IonQ API client
│           ├── mapping/         # Qubit → trait mapping
│           └── routers/         # FastAPI endpoints
│
├── packages/
│   └── shared/                  # Shared TypeScript types
│
└── docs/                        # Documentation
```

---

## Environment Variables

All sensitive configuration is loaded from environment variables. See `.env.example` for the required variables:

- `DATABASE_URL` - PostgreSQL connection string
- `IONQ_API_KEY` - IonQ API key for quantum execution
- `IONQ_USE_SIMULATOR` - Use simulator instead of real hardware

Never commit actual values to the repository.

---

## Deployment

The project is designed for Vercel deployment:

1. Next.js app deploys as Node.js serverless functions
2. Python service can deploy as Python serverless functions
3. Database via Vercel Postgres or external PostgreSQL
4. Single `vercel deploy` command handles everything

For local development:

1. Start PostgreSQL with `docker compose up -d`
2. Run migrations with `pnpm db:push`
3. Start dev servers with `pnpm dev`
