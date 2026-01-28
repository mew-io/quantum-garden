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
- 41 plant variants (32 raster + 9 vector) across 6 categories with lifecycle animations
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
