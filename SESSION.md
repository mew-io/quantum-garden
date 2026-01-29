# Session Log

**Session Started**: 2026-01-28
**Session ID**: autowork-2026-01-28-001
**Previous Synthesis**: 7677fb1

---

## Loop 1: Add Performance Monitoring to Debug Panel (#90) - COMPLETED

See synthesis commit 7677fb1 and archive for details.

---

## Loop 2: Server-Side Evolution System

**Started**: 2026-01-28
**Objective**: Move evolution from client-side to server-side

### Rationale

The garden should evolve whether anyone is watching or not. The client is "just a view" - like a gallery exhibit. All visitors should see the same thing at the same time.

### Work Done

1. **Added GardenState model to Prisma schema** (`prisma/schema.prisma:108-114`)
   - `lastEvolutionCheck` timestamp
   - `evolutionVersion` counter for tracking

2. **Created server-side evolution module** (`src/server/evolution.ts`)
   - Core evolution logic extracted from client
   - `runEvolutionCheck()` - main entry point
   - `getEvolutionState()` - for status queries
   - Exported `EVOLUTION_CONFIG` constants

3. **Created Vercel Cron API route** (`src/app/api/cron/evolve/route.ts`)
   - Supports Vercel cron header authentication
   - Also accepts `Authorization: Bearer` for external cron services
   - Works in development without secret

4. **Created vercel.json** (`apps/web/vercel.json`)
   - Configured cron to run every minute (Vercel Pro minimum)

5. **Created standalone worker script** (`scripts/evolve-garden.ts`)
   - `pnpm evolve` - single run
   - `pnpm evolve:watch` - continuous 15-second interval

6. **Disabled client-side evolution** (`garden-scene.tsx`)
   - Removed `useEvolutionSystem` and `useEvolution` hooks
   - Client now just polls plants every 5 seconds via `usePlants`

7. **Updated README.md**
   - New Evolution System section explaining server-side architecture
   - New Deployment section with Vercel, external cron, and worker instructions

### Key Files Modified

- `apps/web/prisma/schema.prisma` - Added GardenState model
- `apps/web/src/server/evolution.ts` - NEW: Core evolution logic
- `apps/web/src/app/api/cron/evolve/route.ts` - NEW: Cron endpoint
- `apps/web/vercel.json` - NEW: Cron configuration
- `apps/web/scripts/evolve-garden.ts` - Standalone worker
- `apps/web/src/components/garden/three/garden-scene.tsx` - Removed client evolution
- `apps/web/package.json` - Added evolve scripts
- `README.md` - Updated docs

### Bug Fix

Fixed issue where observed-but-not-germinated plants were excluded from evolution eligibility. Changed filter from `if (plant.observed) return false` to only check `if (plant.germinatedAt) return false`. Germination and observation are separate concepts:

- Germination: When lifecycle starts (seed → growing)
- Observation: When quantum state collapses (traits determined)

### Testing

```bash
$ pnpm evolve
[2026-01-29T03:27:54.337Z] Running garden evolution...
  State: v0, 13 dormant, 15 germinated
  Result: 1/13 plants germinated (40ms)
    - cmksv89d...
```

Verified multiple runs germinate plants successfully.
