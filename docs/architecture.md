# Architecture Overview

This document describes the technical architecture of Quantum Garden.

---

## System Design

Quantum Garden follows a modular architecture with clear separation between frontend visualization, API logic, and quantum computation.

```
┌─────────────────────────────────────────────────────────────────┐
│                     NEXT.JS 16 APP (TypeScript)                 │
│  React 19 + Three.js + tRPC                                     │
│  ┌─────────────────────────┬─────────────────────────┐          │
│  │       FRONTEND          │       API ROUTES        │          │
│  │  - Three.js canvas      │  - tRPC endpoints       │          │
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
| Three.js       | WebGL rendering with InstancedMesh |
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

### Plant Creation (Pre-computation Strategy)

**Current Implementation** (Mock Traits):

1. System generates a quantum circuit encoding trait possibilities
2. Circuit definition stored in database with placeholder
3. Plant record created with `visualState: "superposed"`
4. Mock traits generated from circuit seed at observation time

**Planned Implementation** (Real Quantum):

1. System generates quantum circuit encoding trait possibilities
2. Circuit submitted to IonQ simulator as background job
3. Job ID and circuit definition stored in database
4. Background worker polls job status
5. When complete, traits computed from quantum measurements
6. Traits stored in database, ready for observation reveal

### Observation (Immediate Trigger)

**Current Implementation** (Debug Mode):

1. User clicks plant (debug mode only)
2. Frontend sends observation request to API
3. API generates mock traits if not pre-computed
4. Plant state updated to `visualState: "collapsed"`
5. Frontend renders collapse transition animation

**Planned Implementation** (Region-Based):

1. Reticle drifts autonomously across canvas
2. Invisible observation region positioned in garden
3. Alignment detection: reticle + region + plant overlap
4. When all conditions met → observation triggers **immediately** (no dwell)
5. Frontend sends observation request to API
6. API verifies plant is unobserved
7. If traits ready: Return traits, collapse visual state
8. If traits pending: Return `waitingForQuantum`, keep superposed
9. Frontend renders collapse transition (1.5s animation)
10. Entangled partners automatically collapse with correlated traits

**Note**: No dwell time required - observation is instantaneous upon alignment.

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
