# Debugging Guide

This document covers the debugging tools and techniques available for Quantum Garden development.

---

## Debug Panel

The debug panel provides real-time visibility into the garden's internal state. It's essential for development and testing.

### Accessing the Debug Panel

Press the **backtick key (`)** to toggle the debug panel.

### Panel Tabs

The debug panel has three tabs:

#### Overview Tab

- **System State**: Shows current mode indicators
  - Evolution: Active/Paused (paused during time-travel)
  - Time Travel: On/Off
  - Observation: Region/Click mode
  - Context Panel: Visible when showing quantum circuit info

- **Garden Stats**: Plant counts and states
  - Total plants in garden
  - Germinated vs. dormant plants
  - Observed vs. superposed plants
  - Active notifications

- **Quantum Service**: Connection status
  - Execution mode (MOCK/SIMULATOR/HARDWARE)
  - IonQ API key configuration status
  - Default shot count for quantum circuits

- **Quantum Jobs**: Queue statistics
  - Pending, completed, and failed jobs

- **Controls**: Mode toggles
  - Observation mode switch (Region ↔ Click)

#### Logs Tab

Real-time log message display with filtering capabilities.

**Log Categories:**

- `quantum` (purple): Quantum pool and circuit operations
- `observation` (blue): Observation system events
- `evolution` (green): Garden evolution and germination
- `rendering` (yellow): Three.js and visual rendering
- `system` (gray): General system events

**Log Levels:**

- `debug`: Detailed diagnostic information
- `info`: Normal operational events
- `warn`: Warning conditions
- `error`: Error conditions

Click any log entry with data to expand and view the full JSON payload.

#### Plants Tab

- **Selected Plant Details**: Full information about a selected plant
  - ID, variant, visual state
  - Germination status
  - Entanglement status
  - Resolved traits (if observed)

- **Plant List**: Clickable list of all plants
  - Color indicators: yellow (observed), green (germinated), gray (dormant)

---

## Debug Logger

The `debugLogger` is a centralized logging system that captures logs for display in the debug panel while also outputting to the browser console.

### Usage

```typescript
import { debugLogger } from "@/lib/debug-logger";

// Log to specific categories
debugLogger.quantum.info("Pool loaded successfully", { poolSize: 500 });
debugLogger.observation.debug("Region alignment detected", { plantId: "abc123" });
debugLogger.evolution.info("Plant germinated", { plantId: "def456" });
debugLogger.rendering.warn("Frame rate dropped below 30fps");
debugLogger.system.error("Failed to fetch data", { error: err.message });
```

### Log Entry Structure

```typescript
interface LogEntry {
  id: string; // Unique identifier
  timestamp: Date; // When the log was created
  level: LogLevel; // debug | info | warn | error
  category: LogCategory; // quantum | observation | evolution | rendering | system
  message: string; // Human-readable message
  data?: unknown; // Optional structured data
}
```

### React Hook

Use the `useDebugLogs` hook in React components to access logs:

```typescript
import { useDebugLogs, filterLogs } from "@/lib/debug-logger";

function MyComponent() {
  const logs = useDebugLogs();
  const quantumLogs = filterLogs(logs, { categories: ["quantum"] });
  // ... render logs
}
```

---

## Keyboard Shortcuts

| Key     | Action                  |
| ------- | ----------------------- |
| `` ` `` | Toggle debug panel      |
| `T`     | Toggle time-travel mode |

---

## Observation Modes

### Region Mode (Default)

The observation system uses invisible regions and a drifting reticle. Plants are observed when the reticle aligns with a plant inside an active region.

This is the intended production behavior - observation feels natural and autonomous.

### Click Mode (Debug)

Allows direct clicking on plants to trigger observation. Useful for:

- Testing observation flow
- Debugging trait revelation
- Validating entanglement behavior

Toggle via the debug panel under "Controls".

---

## Common Debugging Scenarios

### Observation Not Triggering

1. Open debug panel (`` ` `` key)
2. Check "Observation" status in System State
3. If in "Click" mode, switch to "Region" mode or use click mode for testing
4. Check the "Logs" tab for observation-related messages
5. Verify plants are in "superposed" state (not already observed)

### Plants Not Appearing

1. Check "Garden Stats" in debug panel for plant counts
2. Look for rendering errors in the Logs tab (yellow/rendering category)
3. Verify plants are germinated (not dormant)
4. Check browser console for Three.js errors

### Quantum Pool Issues

1. Check "Quantum Service" section in debug panel
2. Verify execution mode is "SIMULATOR" or "HARDWARE" (not "MOCK" if expecting real quantum)
3. Look for quantum errors in Logs tab (purple/quantum category)
4. Check that quantum pool file exists: `apps/web/public/quantum-pool.json`

### Time-Travel Problems

1. Press `T` to toggle time-travel mode
2. Check "Time Travel" indicator in System State
3. Verify "Evolution" shows "Paused" during time-travel
4. Check for historical data in the database

### Entanglement Not Working

1. Observe an entangled plant (check "Entangled" status in Plants tab)
2. Watch for "Entangled plants observed" notification
3. Check partner plants in the Plants tab to see if they were also observed
4. Look for related logs in the Logs tab

---

## Console Logging

All debug logs are also output to the browser console with category prefixes:

```
[QUANTUM] Pool loaded successfully
[OBSERVATION] Observation triggered for plant abc123
[EVOLUTION] Germination wave started (3 plants)
```

Use browser DevTools filtering to isolate specific categories:

- Filter by `[QUANTUM]` for quantum-related logs
- Filter by `[OBSERVATION]` for observation system logs
- etc.

---

## Environment Variables

For debugging specific subsystems:

```bash
# In .env.local

# Force mock mode for quantum (no real quantum execution)
IONQ_API_KEY=

# Enable verbose quantum service logging
QUANTUM_DEBUG=true
```

---

## Useful tRPC Queries

Access these via browser DevTools Network tab or React Query Devtools:

- `plants.list` - All plants with current state
- `garden.getStateAtTime` - Historical plant states
- `garden.getEvolutionTimeline` - Event timeline
- `quantum.getConfig` - Quantum service configuration
- `quantum.getJobStats` - Job queue statistics
- `observation.getActiveRegion` - Current observation region

---

## Performance Debugging

### Frame Rate Issues

1. Open debug panel → Logs tab
2. Filter to "rendering" category
3. Look for frame rate warnings
4. Check plant count in Garden Stats (1000+ may cause issues)

### Memory Leaks

1. Open browser DevTools → Memory tab
2. Take heap snapshot before and after extended use
3. Look for increasing Three.js object counts
4. Check for unreleased event listeners

---

## Testing Tips

### Manual Testing Checklist

1. **Observation Flow**
   - [ ] Plants observe correctly in region mode
   - [ ] Click mode works for direct observation
   - [ ] Entangled plants reveal together
   - [ ] Context panel appears with correct circuit info

2. **Evolution System**
   - [ ] Germination occurs over time
   - [ ] Smart germination rules work (proximity, clustering)
   - [ ] Lifecycle animations visible

3. **Time-Travel**
   - [ ] Scrubber shows historical states
   - [ ] Event markers appear for germinations/observations
   - [ ] "Return to Live" restores current state

4. **Debug Panel**
   - [ ] All stats update correctly
   - [ ] Logs appear in real-time
   - [ ] Filters work as expected
   - [ ] Plant selection shows details

---

## Related Documentation

- [Architecture Overview](architecture.md)
- [Observation System](observation-system.md)
- [Quantum Circuits](quantum-circuits.md)
