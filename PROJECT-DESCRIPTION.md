# Quantum Garden

## Summary

**Quantum Garden** is an interactive generative art installation where digital plants exist in quantum superposition until observed. Built with Three.js, Next.js, and real quantum circuits executed on IonQ hardware, the garden evolves continuously on its own—germinating seeds, aging plants, and cycling through lifecycles whether anyone is watching or not. Visitors don't control the garden; they witness it. Hovering over a plant collapses its quantum state, revealing traits determined by authentic quantum measurement outcomes, while entangled plants instantly mirror correlated properties across the garden. The experience is calm, contemplative, and designed to make quantum physics tangible through watercolor-rendered visuals and implicit observation mechanics.

---

## Project Content

### A Living Quantum Art Installation

Quantum Garden is a web-based generative environment that bridges quantum computing and contemplative interaction design. Plants grow, bloom, and fade in a shared persistent garden powered by real quantum circuits—every visitor sees the same evolving world, arriving as an observer rather than an agent.

### How It Works

The garden renders 200+ plants across a watercolor-style Three.js canvas. Each plant is defined by a quantum circuit encoding multiple possible forms, colors, and growth behaviors. These circuits were executed on IonQ quantum hardware, producing probabilistic outcomes stored in a pre-computed pool of 500 authentic quantum results.

Plants begin as invisible dormant seeds and germinate over time through a server-side evolution system running every 15 seconds to 1 minute. Germination probability depends on multiple factors—proximity to observed neighbors, clustering prevention, age weighting, and occasional "wave events" where 3–5 spatially distributed plants sprout together. The key principle: **the garden continues to evolve whether anyone is watching or not.**

### The Observation Mechanic

There are no buttons, no instructions, and no explicit interaction. Observation happens implicitly through dwell time—when your cursor rests on a plant for approximately 1.5 seconds, its quantum state collapses. The plant's traits (glyph pattern, color palette, growth rate) are instantly revealed from its assigned quantum measurement outcome. A burst of colored celebration rings expands outward as visual feedback.

Some plants are quantum-entangled. Observing one instantly reveals correlated traits in its partner(s) elsewhere in the garden, visualized through dashed purple connection lines and traveling quantum correlation wave particles. This creates genuine moments of surprise and non-local connection.

### Quantum Circuits

Five circuit types drive the garden's quantum diversity:

- **Superposition** — A single Hadamard gate creates equal probability across outcomes
- **Bell Pair** — Two entangled qubits with directly correlated measurements
- **GHZ State** — Three or more qubits in all-or-nothing entanglement
- **Interference** — Phase rotations that cancel or amplify specific outcomes
- **Variational** — Parameterized multi-layer circuits creating unique quantum fingerprints

After observation, a calm educational panel slides in with an ASCII circuit diagram and explanation of the quantum concept that determined the plant's traits. It's dismissible and never intrusive—teaching through interaction, not instruction.

### Visual Design

The rendering system uses a custom watercolor aesthetic built on Three.js with instanced meshes supporting 1000+ plants at 60fps. Over 50 hand-crafted plant variants span six categories: ground cover, grasses, flowers, shrubs, trees, and ethereal geometric forms—including tulips, roses, wisteria, ferns, mandalas, and abstract quantum-inspired shapes. Each variant cycles through lifecycle keyframes (bud, sprout, bloom, fade) with smooth GPU-accelerated shader animations.

An adaptive quality system with four tiers (ultra, high, medium, low) automatically adjusts rendering based on measured FPS, gracefully degrading on older hardware while maintaining smooth performance. Features include frustum culling, pixel ratio adaptation, bloom toggle, and geometry reduction—all invisible to the user.

### Architecture

| Layer      | Technology                                          |
| ---------- | --------------------------------------------------- |
| Frontend   | Next.js 16, React 19, Three.js, TypeScript, Zustand |
| API        | tRPC, Prisma ORM                                    |
| Quantum    | Python FastAPI, Qiskit, qiskit-ionq                 |
| Database   | PostgreSQL (Vercel Postgres / Neon)                 |
| Deployment | Vercel (serverless) with cron-based evolution       |

The web client is purely a viewer—it polls every 5 seconds to pick up new germinations and state changes. All evolution logic runs server-side, ensuring every visitor shares the same garden timeline. Plant state, quantum records, entanglement groups, and observation events are persisted in PostgreSQL.

### Philosophy

Quantum Garden is less a game and more an interactive art installation with real quantum physics woven in. It encourages reflection on probability, irreversibility, and the limits of human intervention. You cannot speed up the garden, direct its growth, or undo an observation. You can only be present—and in that presence, collapse possibility into reality.
