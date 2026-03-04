# Quantum Garden - Project Application

_This is the original application submitted to Qollab's quantum computing experiments program._

---

## Project Description

Quantum Garden is a slow-evolving generative environment where plants exist in unresolved quantum states until they are encountered by a visitor. Each plant is defined by a quantum circuit encoding multiple possible forms, colors, and growth behaviors. These circuits are executed asynchronously on real quantum hardware in advance, producing probabilistic outcomes that exist independently of any observer.

When a user encounters a plant, they do not trigger quantum computation. Instead, their observation reveals and stabilizes a precomputed quantum result that was already resolved by the system. The garden proceeds deterministically forward in time, with visitors arriving as witnesses rather than agents. Observation fixes appearance and records state, but does not alter the underlying quantum data.

Some plants are entangled at the time of generation. Observing one plant can reveal correlated traits in others elsewhere in the garden, even if they have not yet been encountered. The experience is intentionally calm, contemplative, and slow, encouraging reflection on the irreversibility of time, probability, and the limits of human intervention.

The garden continues to evolve, whether anyone is watching or not.

---

## Educational Value

Quantum Garden introduces core quantum concepts through metaphor and experience rather than instruction. Visitors encounter superposition, probability, measurement, and entanglement as observable phenomena embedded in the environment, not as abstract explanations or tutorials.

The project helps demystify quantum computing by showing what real quantum output looks like when integrated into a creative system. Users learn that quantum processes are probabilistic yet irreversible, and that quantum computation does not behave like an interactive or reactive game mechanic. Instead, it unfolds independently of human presence.

By framing visitors as observers rather than controllers, the project gently challenges common misconceptions about quantum systems while remaining accessible to non-experts. Patterns, correlations, and rarity emerge naturally over time, encouraging curiosity and reflection rather than a focus on mastery.

For the community, the project serves as a clear example of how real quantum hardware can meaningfully inform creative work without simulation or spectacle. Its open source implementation and transparent mapping from qubits to visual traits make it approachable for developers, artists, and educators interested in remixing or extending the idea.

---

## Technical Approach

Plant genomes are defined as quantum circuits using Qiskit. These circuits encode multiple potential traits and entanglement relationships across plants. Circuits are executed asynchronously on IonQ hardware in scheduled batches, rather than in response to user interaction.

Measurement results and probability distributions are stored as immutable quantum records. Each plant references a fixed quantum outcome, allowing deterministic replay while preserving a genuinely quantum origin. Entangled plants share circuits, enabling correlated traits to be expressed across distance and time.

A lightweight backend manages persistence, state coordination, and the execution of scheduled quantum jobs. The frontend is a web-based experience built using Canvas or WebGL to visualize unresolved and resolved plant states. All visible variation originates from real quantum computation, never simulation.

---

## Budget

The project is scoped to fit within Qollab's standard support range, with flexibility to adjust based on findings during early experimentation.

**Funding request**: Up to $5,000 USD

Funding will primarily support:

- Design and implementation of the web-based garden experience
- Integration of quantum outputs into visual and interactive systems
- Backend development for persistence, scheduling, and data management
- Documentation, accessibility considerations, and open source packaging

The focus is on building a polished, maintainable, and well-documented public artifact rather than maximizing feature count.

**Compute request**: Up to $15,000 in IonQ compute credits

IonQ credits will be used to:

- Execute batches of quantum circuits defining plant genomes and entanglement groups
- Explore multiple circuit configurations to balance expressiveness and reliability
- Generate probability distributions and measurement data for long-lived replay
- Support limited iteration during development without relying on simulation

Quantum workloads are asynchronous, bounded, and planned in advance, allowing for the predictable use of compute credits while ensuring that all visible behavior is grounded in real quantum execution.

---

## Team

### Justin Pincar — Developer

Justin Pincar is a software engineer and technology leader with extensive experience building scalable systems and open source products. He is the co founder and CTO of Achievable, where he leads engineering and product development. Previously at Google, Justin open sourced AdWhirl, growing it from early experimentation to infrastructure supporting over a billion ad impressions per day. His background spans distributed systems, rapid prototyping, and developer focused platforms. Justin brings a pragmatic, technically grounded approach to applying real quantum computation within creative, publicly accessible projects.

LinkedIn: https://www.linkedin.com/in/justinpincar/

### Amber Wang — Creative

Amber Wang is a data scientist and AI entrepreneur focused on growth, SEO, and data driven storytelling. She is the co-founder of PressRoom AI, where she helps companies expand their search presence and scale revenue using AI powered strategies. Amber also co-founded Cerebral Valley, one of the earliest global AI communities with a focus on empowering women in the field. Previously, she worked as a research analyst at Cushman and Wakefield, analyzing large datasets for global financial institutions and producing data driven insights.

LinkedIn: https://www.linkedin.com/in/amber-wang-/

---

## Project Philosophy

Quantum Garden is intentionally designed to be quiet, durable, and long-lived, favoring persistence and gradual change over novelty-driven interaction. The project treats current quantum hardware constraints as a creative foundation rather than a limitation, aligning technical reality with philosophical intent.

While the initial implementation is web-based and publicly accessible, the experience is structured in a way that could naturally translate to a future gallery or installation context, such as a continuously running display or a shared public environment. This is considered as a possibility rather than a requirement, and the project is scoped first and foremost to succeed as an open, accessible, online experience.
