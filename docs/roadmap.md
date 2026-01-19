# Quantum Garden — Project Roadmap & Budget Justification

This document outlines the development timeline, milestones, and budget allocation for the Quantum Garden project.

---

## Executive Summary

| Category                 | Amount     | Purpose                                      |
| ------------------------ | ---------- | -------------------------------------------- |
| **Development Funding**  | $4,000 USD | Stipends, infrastructure                     |
| **IonQ Compute Credits** | $5,000     | Quantum circuit execution on Aria hardware   |
| **Total**                | $9,000     | Complete project delivery + 1 year operation |

---

## Timeline Overview

```
Jan 15          Feb 9           Feb 23          Mar 2
  │               │               │               │
  ▼               ▼               ▼               ▼
┌─────────────┬─────────────┬─────────────┬─────────────────────────┐
│   Phase 1   │   Phase 2   │   Phase 3   │        Phase 4          │
│  Foundation │ Integration │   Polish    │      Maintenance        │
│   3 weeks   │   2 weeks   │   1 week    │    minimal upkeep       │
└─────────────┴─────────────┴─────────────┴─────────────────────────┘
```

---

## Phase 1: Foundation (Jan 15 – Feb 8)

**Duration**: 3.5 weeks
**Checkpoint**: Feb 9

### Deliverables

- [ ] Core web application with garden visualization
- [ ] Plant rendering system (WebGL/PixiJS)
- [ ] Observation and state persistence mechanics
- [ ] Quantum circuit library (Qiskit) with trait encoding
- [ ] Mock quantum execution for development
- [ ] Database schema and API layer

### Success Criteria

- Garden renders with procedurally varied plants
- Observation system correctly persists state
- Quantum circuits execute successfully on IonQ simulator
- All code passes linting, type-checking, and tests

### IonQ Usage: $300 (Development/Validation)

| Activity                            | Shots | Tasks | Cost      |
| ----------------------------------- | ----- | ----- | --------- |
| Circuit validation on real hardware | 5,000 | 5     | $152      |
| Entanglement correlation tests      | 3,000 | 5     | $92       |
| **Phase 1 Subtotal**                | 8,000 | 10    | **~$300** |

---

## Phase 2: Quantum Integration (Feb 9 – Feb 22)

**Duration**: 2 weeks
**Checkpoint**: Feb 23 (Initial Delivery)

### Deliverables

- [ ] Live IonQ hardware integration
- [ ] Batch quantum job scheduling system
- [ ] Initial garden population (200+ plants from real quantum data)
- [ ] Entanglement visualization and correlation display

### Success Criteria

- Plants generated from real IonQ Aria measurement outcomes
- Entangled plant correlations observable in garden
- System handles concurrent observers gracefully
- Quantum job queue processes reliably

### IonQ Usage: $3,500 (Garden Population)

| Activity                                | Shots   | Tasks | Cost        |
| --------------------------------------- | ------- | ----- | ----------- |
| Plant genome batch (200 plants)         | 100,000 | 200   | $3,060      |
| Entanglement group circuits (15 groups) | 15,000  | 15    | $455        |
| **Phase 2 Subtotal**                    | 115,000 | 215   | **~$3,500** |

This generates the full garden population upfront. Plants are pre-computed and stored, so no ongoing quantum execution is required for the garden to function.

---

## Phase 3: Polish (Feb 23 – Mar 2)

**Duration**: 1 week
**Checkpoint**: Mar 2 (Final Milestone)

### Deliverables

- [ ] UI/UX refinements based on testing
- [ ] Open source packaging and licensing
- [ ] Deployment to production infrastructure

### Success Criteria

- Public URL accessible worldwide
- All Qollab program requirements satisfied
- Garden operational with 200+ quantum-generated plants

### IonQ Usage: $200 (Buffer)

| Activity                    | Shots | Tasks | Cost      |
| --------------------------- | ----- | ----- | --------- |
| Additional plants if needed | 5,000 | 5     | $152      |
| Edge case testing           | 2,000 | 2     | $61       |
| **Phase 3 Subtotal**        | 7,000 | 7     | **~$200** |

---

## Phase 4: Maintenance (Mar 3 – Dec 31)

**Duration**: 10 months
**Effort**: Minimal

### Approach

The garden is designed to be **self-sustaining after launch**. All quantum data is pre-computed during Phase 2, so the garden can run indefinitely without additional quantum execution.

- Garden remains publicly accessible
- Hosting costs covered by infrastructure budget
- No active development required
- Optional: periodic small quantum batches if credits remain

### IonQ Usage: $1,000 (Reserved)

Credits held in reserve for:

- Occasional new plant generation (quarterly batches)
- Bug fixes requiring re-execution
- Community requests

| Activity                            | Shots  | Tasks | Cost        |
| ----------------------------------- | ------ | ----- | ----------- |
| Quarterly refresh (~25 plants each) | 25,000 | 100   | $780        |
| Buffer for fixes                    | 5,000  | 10    | $153        |
| **Phase 4 Subtotal**                | 30,000 | 110   | **~$1,000** |

---

## IonQ Credit Summary

### Total Credit Request: $5,000

| Phase     | Purpose                        | Credits    |
| --------- | ------------------------------ | ---------- |
| Phase 1   | Development & validation       | $300       |
| Phase 2   | Garden population (200 plants) | $3,500     |
| Phase 3   | Buffer                         | $200       |
| Phase 4   | Reserved for maintenance       | $1,000     |
| **Total** |                                | **$5,000** |

### Pricing Basis (IonQ Aria via AWS Braket)

| Component | Rate  |
| --------- | ----- |
| Per task  | $0.30 |
| Per shot  | $0.03 |

**Example calculation**: 1 plant requiring 500 shots
= $0.30 (task) + $15.00 (500 × $0.03)
= **$15.30 per plant genome**

### Why These Credits Are Necessary

1. **Real quantum data is the core premise** — The garden's philosophical foundation requires genuine quantum randomness, not pseudorandom simulation. Each plant's traits must originate from actual quantum measurement.

2. **Entanglement requires hardware** — Correlated plant behaviors across the garden rely on entangled qubit measurements that cannot be simulated classically without losing their quantum character.

3. **Pre-computation model** — By generating all quantum data upfront, the garden can operate for years without ongoing quantum costs. Credits fund initial population, not continuous operation.

---

## Development Funding Allocation: $4,000

| Category                 | Amount | Description                        |
| ------------------------ | ------ | ---------------------------------- |
| **Engineering Stipends** | $2,000 | 2 developers × $1,000              |
| **Design Stipend**       | $1,000 | Designer stipend                   |
| **Infrastructure**       | $1,000 | Hosting, database, domain (1 year) |

---

## Risk Mitigation

### Quantum Credit Overrun

- **Mitigation**: Pre-computed batches stored for replay; 200 plants generated upfront is sufficient for a complete garden
- **Fallback**: Reserved credits provide buffer for unexpected needs

### Hardware Availability

- **Mitigation**: Architecture supports graceful degradation to cached quantum data
- **Fallback**: Garden continues indefinitely with existing plants

### Timeline Slippage

- **Mitigation**: Mock quantum execution enables parallel development
- **Fallback**: Core deliverable (Phase 2) has 1-week buffer before final milestone

---

## Success Metrics

| Metric                             | Target          |
| ---------------------------------- | --------------- |
| Quantum-generated plants at launch | 200+            |
| Public uptime                      | 99%             |
| Project delivery                   | On time (Mar 2) |

---

## Appendix: IonQ Pricing Reference

### Current Rates (AWS Braket, as of January 2026)

| System             | Per Task | Per Shot |
| ------------------ | -------- | -------- |
| IonQ Aria (25 AQ)  | $0.30    | $0.03    |
| IonQ Forte (36 AQ) | $0.30    | $0.08    |

### Why Aria (not Forte)

| Spec               | Aria   | Forte  |
| ------------------ | ------ | ------ |
| Qubits             | 25     | 36     |
| 1-qubit gate error | ~0.06% | ~0.03% |
| 2-qubit gate error | ~0.6%  | ~0.35% |
| Per-shot cost      | $0.03  | $0.08  |

Forte offers more qubits and ~2× better gate fidelity, but costs ~2.7× more per shot. For Quantum Garden, Aria is sufficient — plant trait circuits don't require 36 qubits or extreme fidelity. We're generating probabilistic trait distributions, not running deep quantum algorithms. The cost savings allow more plants within budget.

### Why AWS Braket

- Most cost-effective access to IonQ hardware
- Transparent per-shot pricing enables accurate budget forecasting
- Qiskit integration via qiskit-ionq provider

---

_Last updated: January 2026_
