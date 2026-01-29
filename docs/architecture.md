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
│  │  - Evolution system     │  - Quantum service calls│          │
│  │  - Zustand state        │                         │          │
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

### Quantum Pool (Pre-computation Strategy)

The garden uses a pre-computed quantum pool for instant trait revelation:

1. **Pool Generation** (one-time setup):
   - Generate 500 quantum circuits (100 per circuit type)
   - Execute on IonQ simulator with error mitigation disabled
   - Store measurement results in database as immutable pool

2. **Trait Selection** (on observation):
   - Hash plant ID to deterministically select pool index
   - Retrieve pre-computed quantum measurements
   - Map measurements to plant traits instantly (<50ms)

This approach provides authentic quantum data with zero latency during observation.

### Evolution System

Plants germinate automatically through the `GardenEvolutionSystem`:

1. System checks dormant plants every 15 seconds
2. Each plant evaluated for germination probability:
   - Base 3% chance per check
   - 2x bonus near observed plants
   - 50% penalty near other sprouts (clustering prevention)
   - 30% chance during cooldown (2 min after nearby germination)
   - 100% guaranteed after 15 minutes dormancy
3. Wave events (5% chance): 3-5 plants germinate together
4. System pauses during time-travel mode

### Observation Flow

The observation system uses dwell-time triggers:

1. Reticle drifts autonomously across canvas
2. When reticle overlaps eligible plant, dwell timer starts
3. After dwell duration (configurable, default 1.5s): observation triggers
4. Frontend sends observation request to API
5. API selects traits from quantum pool based on plant ID hash
6. Plant state updated to `visualState: "collapsed"`
7. Frontend renders celebration animation
8. Entangled partners revealed with correlated traits
9. Event logged to quantum event panel

---

## Key Design Decisions

### Why Three.js?

Three.js provides high-performance WebGL rendering with:

- InstancedMesh for efficient rendering of 1000+ plants
- Smooth animations at 60fps
- Flexible rendering: 64x64 pixel grids and vector line art
- GPU-accelerated shaders for lifecycle animations
- Rich overlay system for visual feedback

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
│   │       ├── components/
│   │       │   └── garden/      # Core garden components
│   │       │       ├── three/   # Three.js rendering
│   │       │       ├── garden-evolution.ts  # Evolution system
│   │       │       └── *.tsx    # UI overlays
│   │       ├── hooks/           # React hooks
│   │       │   ├── use-evolution-system.ts
│   │       │   ├── use-observation.ts
│   │       │   └── use-plants.ts
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
│   └── shared/                  # Shared TypeScript types & constants
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
