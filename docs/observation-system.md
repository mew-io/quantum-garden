# Quantum Garden Observation System

This document specifies how observation is implemented in Quantum Garden. It is written for developers and designers working together. The goal is to make observation calm, inevitable, and non interactive, while still triggering real quantum measurement.

The system must work identically for a web experience and a future gallery installation, with only input signals changing, not logic.

---

## Design goals

- No explicit user interaction such as clicking, tapping, or selecting
- Observation feels implied and environmental, not triggered
- Visual calm is preserved at all times
- Observation events are rare, deliberate, and irreversible
- Quantum behavior affects state only, never visual style

The viewer witnesses observation. They do not perform it.

---

## Core concept

Observation occurs only when three conditions align over time:

1. A plant glyph exists inside an invisible observation region
2. The user's cursor/touch overlaps that region
3. The cursor dwells on the plant for the required duration

No single condition alone can cause observation.

---

## System components

### 1. Plants

Plants are abstract pixel glyphs rendered on a white background.

Relevant properties per plant:

- plant_id
- position (x, y)
- observed (boolean)
- quantum_circuit_id
- visual_state (superposed or collapsed)

Unobserved plants render multiple faint pixel configurations. Observed plants render a single fully opaque configuration.

---

### 2. Observation regions

Observation regions define where observation is possible.

These regions are never rendered.

Properties:

- region_id
- center (x, y)
- radius
- active (boolean)
- lifetime

Rules:

- Only one active region per scene at a time
- Regions are large relative to plant glyphs
- Regions either remain fixed for their lifetime or drift very slowly
- Regions deactivate or relocate after an observation event

Recommended defaults:

- Radius: 80 to 200 pixels (web scale)
- Active region count: 1
- Lifetime: 30 to 120 seconds

A plant inside a region becomes eligible for observation but nothing happens yet.

---

### 3. Cursor tracking

Observation is driven by the user's cursor (mouse on desktop, touch on mobile).

The cursor position is converted from screen coordinates to garden world coordinates each frame and fed into the observation system.

When the cursor leaves the canvas, position resets to offscreen so no accidental observations occur.

---

## Alignment logic

Alignment determines when observation _may_ occur.

### Cursor to region alignment

Alignment begins when the cursor overlaps an active observation region.

Rules:

- Cursor overlapping a plant outside a region does nothing
- Plant inside a region without cursor does nothing
- Alignment is spatial only

Alignment is a prerequisite, not a trigger.

### Plant exposure requirement

Because plants are larger than a single point, observation also requires full plant exposure.

A plant is considered _exposed_ only when:

- The cursor overlaps any part of the plant _and_
- The entire plant bounding box is contained within the active observation region

This ensures that observation feels holistic rather than partial.

If any portion of the plant exits the region, exposure is lost and dwell resets.

---

## Observation trigger

When all alignment conditions are met, a dwell timer begins. The cursor must remain on the plant for the configured dwell duration before observation triggers.

Conditions required:

- Plant is unobserved
- Entire plant bounding box is contained within the active region
- Cursor overlaps any portion of the plant
- Cursor overlaps the active region

Dwell behavior:

- Dwell timer runs per eligible plant
- If any condition breaks (cursor moves away), dwell resets to zero
- Default duration: 1.5 seconds
- No partial progress retention

---

## Observation event

When dwell duration completes, an observation event is triggered.

Event payload:

- plant_id
- region_id
- timestamp

This event is sent to the backend to perform quantum measurement.

---

## Quantum execution

> **Current Implementation Status**: Real quantum hardware integration is deferred. The system currently uses pseudorandom trait generation that simulates quantum measurement outcomes. When quantum integration is enabled, the architecture supports real hardware execution without changes to the observation UX.

### Pre-computed trait resolution

Plant traits are pre-computed at seeding time using pseudorandom generation. The observation event does not perform real-time computation—it reveals traits that already exist.

This means:

- Trait values are determined when plants are created
- Observation is purely a UX transition, not a computation trigger
- No real-time updates or broadcasts are needed
- The collapsed state is already stored; observation marks it as revealed

### Backend responsibilities

- Verify plant is still unobserved
- Mark the plant as observed in the database
- Return the pre-computed collapsed visual state

### Future quantum integration

When quantum hardware integration is enabled:

- The quantum circuit will be executed at plant creation time (not observation time)
- Measurement results will be stored as pre-computed traits
- The observation UX remains unchanged—it reveals, not computes

The quantum result maps directly to pixel level decisions in the glyph.

---

## Post observation behavior

Observation does not stop, pause, or otherwise affect a plant's underlying growth or lifecycle.

Observation only stabilizes how the plant is _visualized_.

### Visual effect of observation

- The plant continues to grow, age, and evolve according to its normal lifecycle rules
- Superposition is removed from the rendering layer only
- A single resolved visual configuration is selected and remains fixed
- Subsequent growth stages inherit this fixed visual interpretation

In other words, observation collapses _interpretation_, not _process_.

There is no freezing, halting, or special animation.

### System behavior after observation

- The observation region deactivates or relocates
- The system enforces a global cooldown before another observation can occur

Recommended cooldown:

- 10 to 30 seconds

Only one observation may complete at a time.

---

## Web implementation notes

- Region placement may be deterministic or seeded
- All alignment and dwell logic runs client side
- Backend only handles measurement and persistence
- Clients update silently on broadcast

No UI elements or instructions are shown.

---

## Gallery adaptation

The same logic applies unchanged.

Optional adaptations:

- Region placement may favor occupied areas
- Observation rate remains capped

No explicit interaction is introduced.

---

## Non negotiable constraints

- Observation regions are never visualized
- The system must tolerate long periods of inactivity
- Visual style never changes during measurement

---

## Design mantra

Observation is not something the viewer does. It is something that occasionally happens in their presence.

This document defines the complete observation system. Any deviation should be evaluated against calm, restraint, and inevitability.
