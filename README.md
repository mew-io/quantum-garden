# Quantum Garden

A slow-evolving generative environment where plants exist in quantum superposition until observed.

Each plant is defined by a quantum circuit encoding multiple possible forms, colors, and growth behaviors. These circuits are executed on real quantum hardware, producing probabilistic outcomes that exist independently of any observer.

When you encounter a plant, you don't trigger quantum computation—you witness and stabilize a result that was already resolved. The garden proceeds forward in time, with visitors arriving as observers rather than agents.

Some plants are entangled. Observing one can reveal correlated traits in others elsewhere in the garden, even if they haven't been encountered yet.

The experience is calm, contemplative, and slow. It encourages reflection on the irreversibility of time, probability, and the limits of human intervention.

**The garden continues to evolve, whether anyone is watching or not.**

---

## Project Status

**Current Phase**: Implementing user-facing quantum simulation experience

### What's Working ✓

- Three.js rendering with efficient instanced plants (1000 plant capacity)
- 36 plant variants across 6 categories, all using smooth vector rendering with lifecycle animations
- Dual rendering modes: 64x64 pixel grids and smooth vector line rendering
- Vector plants with progressive drawing transitions (brush stroke effects)
- Lifecycle-based visual behaviors: GPU-accelerated shader animations for young/mature/old plants
- Smart germination system: proximity bonuses, clustering prevention, age weighting, wave patterns
- Evolution event notifications: subtle toasts for germination and entanglement events
- Enhanced observation feedback: plant-colored celebration rings and entanglement wave particles
- Entanglement visualization (correlated trait reveals with quantum correlation waves)
- Mobile-responsive with touch controls
- Time-travel system: scrub through garden evolution history (press T key)
  - View historical plant states at any point in time
  - Event markers show germinations and observations
  - Auto-play mode to watch garden evolve at 10x speed
- Post-observation context panel: educational quantum circuit explanations
  - ASCII circuit diagrams for superposition, Bell pair, GHZ state, interference, variational
  - Calm, dismissible UI with "Don't show again" option
- Enhanced debug system (press backtick key):
  - Three-tab interface (Overview, Logs, Plants)
  - Live log messages with category filtering
  - System state indicators and garden statistics

### Coming Soon 🎯

- Performance optimizations for large gardens
- Sound effects (optional audio feedback)

---

## 🌱 Evolution System

The garden evolves continuously through server-side evolution. Plants begin as dormant seeds and germinate over time, **whether anyone is watching or not**. The client is just a viewer—like visitors to a gallery exhibit.

**Architecture**:

- Evolution runs **server-side** via periodic cron jobs or workers
- The web client polls every 5 seconds to pick up new germinations
- All visitors see the same garden state at the same time

**How It Works**:

- The system checks dormant plants every 15 seconds (or 1 minute on Vercel)
- Each check evaluates germination probability based on multiple factors
- Germinated plants become visible and begin their lifecycle animations

**Germination Factors**:

| Factor                 | Effect                                     |
| ---------------------- | ------------------------------------------ |
| Base probability       | 15% chance per check                       |
| Observed neighbor      | 2x bonus if within 200px of observed plant |
| Clustering prevention  | 0% if 3+ germinated plants within 150px    |
| Age weighting          | Up to 2.5x bonus for older dormant plants  |
| Guaranteed germination | 100% after 15 minutes of dormancy          |

**Wave Events** (5% chance):

When the garden has 5+ dormant plants, a "wave" event may trigger 3-5 spatially distributed plants to germinate together. Waves create visually pleasing patterns spread across the garden.

**Running the Evolution Worker**:

```bash
# Single evolution check (for testing)
pnpm evolve

# Continuous evolution (15-second interval, for local dev)
pnpm evolve:watch
```

See [src/server/evolution.ts](apps/web/src/server/evolution.ts) for the core evolution logic.

---

## ✅ Quantum Integration Status

**Real quantum execution is fully active.** Plants reveal traits from a pre-computed pool of 500 authentic quantum results generated from IonQ simulator.

**Current State**:

- ✅ Quantum pool with 500 pre-computed results (100 per circuit type)
- ✅ Generated from IonQ simulator with error mitigation disabled for authenticity
- ✅ Deterministic pool selection based on plant ID hash
- ✅ Instant trait revelation (<50ms observation latency)
- ✅ No waiting states or async job management needed
- ✅ Graceful degradation to mock traits if pool unavailable
- The UX is instant and seamless with authentic quantum data

**Quantum Integration Flow**: Pool Generation (One-Time) → Plant Creation → Observation → Instant Pool Selection → Trait Revelation

**Coordination Required**: Changes to the quantum service (`apps/quantum/`) require explicit coordination. The Qiskit circuit code and IonQ client are fully operational.

---

## Quick Start

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [pnpm 9+](https://pnpm.io/)
- [Python 3.11+](https://www.python.org/)
- [uv](https://github.com/astral-sh/uv) (Python package manager)
- [Docker](https://www.docker.com/) (for PostgreSQL)

### Setup

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/quantum-garden.git
cd quantum-garden

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Start the database
docker compose up -d

# Run database migrations
pnpm db:push

# Start development servers
pnpm dev
```

### Development URLs

| Service         | URL                            | Port  |
| --------------- | ------------------------------ | ----- |
| Web App         | http://localhost:14923         | 14923 |
| Sprite Sandbox  | http://localhost:14923/sandbox | 14923 |
| Quantum Service | http://localhost:18742         | 18742 |
| PostgreSQL      | localhost:13318                | 13318 |

We use nonstandard high ports to avoid conflicts with other services you may be running.

---

## Project Structure

```
quantum-garden/
├── apps/
│   ├── web/              # Next.js frontend + API
│   └── quantum/          # Python quantum service (Qiskit + IonQ)
├── packages/
│   └── shared/           # Shared TypeScript types
└── docs/                 # Documentation
```

See [docs/architecture.md](docs/architecture.md) for detailed system design.

---

## Infrastructure Requirements

### Database

**PostgreSQL 14+** is required. The application uses Prisma ORM.

| Provider                         | Notes                                                            |
| -------------------------------- | ---------------------------------------------------------------- |
| [Neon](https://neon.tech)        | Serverless Postgres, free tier available, recommended for Vercel |
| [Supabase](https://supabase.com) | Free tier available                                              |
| [Railway](https://railway.app)   | Simple setup, auto-managed                                       |
| [Render](https://render.com)     | Free tier available                                              |
| Self-hosted                      | Docker: `docker compose up -d` (dev only)                        |

### Environment Variables

| Variable              | Required   | Description                                                |
| --------------------- | ---------- | ---------------------------------------------------------- |
| `DATABASE_URL`        | ✅         | PostgreSQL connection string                               |
| `CRON_SECRET`         | Production | Secret for evolution cron endpoint authentication          |
| `QUANTUM_SERVICE_URL` | Optional   | Quantum service URL (defaults to `http://localhost:18742`) |

### Evolution Worker

The garden evolves server-side. You need **one** of these:

| Method                 | Best For                          | Interval   |
| ---------------------- | --------------------------------- | ---------- |
| Vercel Cron (built-in) | Vercel Pro deployments            | 1 minute   |
| External cron service  | Vercel Hobby, or faster intervals | Any        |
| Long-running worker    | Heroku, Railway, Render, VPS      | 15 seconds |

See [Deployment](#deployment) for setup instructions.

---

## Deployment

### Vercel (Recommended)

The app is configured for Vercel with automatic cron-based evolution.

1. **Deploy to Vercel**:

   ```bash
   vercel
   ```

2. **Configure Environment Variables**:
   - `DATABASE_URL` - PostgreSQL connection string
   - `CRON_SECRET` - Secret for cron endpoint authentication

3. **Evolution Cron**:
   - Vercel cron runs `/api/cron/evolve` every minute (minimum interval on Pro plan)
   - Configured in `apps/web/vercel.json`
   - Hobby plan: 1-day minimum interval (use external cron service instead)

### Alternative: External Cron Service

For more frequent evolution (15-second intervals) or on Vercel Hobby:

1. Use a service like [cron-job.org](https://cron-job.org), [Upstash QStash](https://upstash.com/qstash), or GitHub Actions
2. Call the evolution endpoint:
   ```bash
   curl -X POST https://your-app.vercel.app/api/cron/evolve \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

### Alternative: Long-Running Worker

For platforms that support persistent processes (Heroku, Railway, Render, VPS):

```bash
# Start continuous evolution worker
pnpm evolve:watch
```

This runs evolution checks every 15 seconds. Use a process manager like PM2:

```bash
pm2 start "pnpm evolve:watch" --name evolution-worker
```

---

## Technology

- **Frontend**: Next.js 16, React 19, Three.js, TypeScript
- **API**: tRPC, Prisma ORM
- **Quantum**: Qiskit, qiskit-ionq, FastAPI
- **Database**: PostgreSQL

---

## Documentation

- [Architecture Overview](docs/architecture.md)
- [Observation System](docs/observation-system.md)
- [Quantum Circuits](docs/quantum-circuits.md)
- [Debugging Guide](docs/debugging.md) — Debug panel, logging, and troubleshooting
- [Sprite Sandbox](docs/sandbox.md) — Visual development tool for plant patterns
- [Contributing Guide](docs/contributing.md)

---

## Contributing

We welcome contributions! Please read our [Contributing Guide](docs/contributing.md) before submitting a pull request.

All code must pass linting and type-checking before merge. We use pre-commit hooks to catch issues early.

---

## Acknowledgments

This project is supported by [Qollab](https://qollab.xyz) through their quantum computing experiments program, with compute credits provided by IonQ.

See [docs/context/](docs/context/) for the original RFP and project proposal.

---

## License

MIT License. See [LICENSE](LICENSE) for details.

# quantum-garden
