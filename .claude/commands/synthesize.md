# Synthesize: Session Review & Documentation Update

**This command MUST run as a sub-agent.** Spawn a general-purpose agent using the Task tool with the following prompt:

---

## Sub-Agent Prompt

````
You are entering **synthesis mode**. Your goal is to review the work completed in the parent session, ensure findings are properly documented, and plan next steps in TASKS.md.

**This is a sub-agent task** — you have your own context and task list. Work autonomously to complete the synthesis.

---

## CRITICAL: Use Extended Thinking

**You MUST use extended thinking (ultrathink) throughout this synthesis process.** This is analytical work that requires:

- Comprehensive review of session activities
- Understanding of project architecture and goals
- Strategic prioritization of next steps

Take the time to think deeply. This is not a task to rush through.

---

## Phase 1: Session Review

### Step 1: Gather Session Log

First, check for the session log:

```bash
cat SESSION.md 2>/dev/null || echo "No session log found"
```

The session log (`SESSION.md`) contains notes from the current development session. If it exists and has content, this is the primary source for what was accomplished.

### Step 2: Gather Project Context

Read these materials to understand current project state:

**Core Documentation:**
- `README.md` — Project overview and quick start
- `docs/architecture.md` — System design and technology stack
- `docs/observation-system.md` — Core observation mechanics
- `docs/quantum-circuits.md` — Quantum circuit design
- `docs/contributing.md` — Development guidelines
- `TASKS.md` — Current task tracking (create if missing)

**Project Context:**
- `docs/context/application.md` — Original project proposal
- `docs/context/rfp.md` — Original RFP

### Step 3: Analyze Recent Changes

Run these commands to understand what changed:

```bash
git status
git diff --stat HEAD~5..HEAD
git log --oneline -10
```

### Step 4: Deep Analysis (Extended Thinking Required)

Using extended thinking, analyze the session:

1. **Work Inventory**: What was attempted? What was completed?

2. **Code Changes**:
   - What new features were implemented?
   - What bugs were fixed?
   - What refactoring occurred?

3. **Gap Analysis**:
   - What work was done but not documented?
   - What tasks were started but not finished?
   - What tests need to be added?

4. **Quality Assessment**:
   - Do all changes pass linting and type-checking?
   - Are there any obvious issues or tech debt introduced?

---

## Phase 2: Documentation Updates

### Priority Documents

Update these documents to reflect current state:

1. **`TASKS.md`** — Master task tracking document (create if it doesn't exist)
2. **`README.md`** — Update if project setup or structure changed
3. **`docs/architecture.md`** — Update if system design changed

### TASKS.md Structure

If TASKS.md doesn't exist, create it with this structure:

```markdown
# Quantum Garden - Task Tracking

## Current Sprint

### In Progress

- [ ] Task description

### Up Next

- [ ] Task description

## Completed

### [Date] - Session Summary

- [x] Completed task 1
- [x] Completed task 2

## Backlog

### High Priority

- [ ] Task description

### Medium Priority

- [ ] Task description

### Low Priority / Nice to Have

- [ ] Task description

## Technical Debt

- [ ] Item description

## Ideas & Future Exploration

- Item description
```

### Update Checklist

Use the TodoWrite tool to track your progress:

- [ ] Review and update TASKS.md with completed work
- [ ] Move completed tasks to the Completed section with date
- [ ] Add any new tasks discovered during the session
- [ ] Update priorities based on current understanding
- [ ] Update README.md if needed
- [ ] Update architecture docs if system design changed
- [ ] Add any new documentation for new features

---

## Phase 3: Session Archive Creation

**Create a timestamped session summary for the archive.**

After updating the main documentation, create an archive file:

### Archive File Path

`docs/archive/sessions/YYYY-MM-DD-[brief-description].md`

Example: `docs/archive/sessions/2026-01-16-initial-setup.md`

### Archive Content Template

```markdown
# Session Archive: [Brief Description]

**Date**: [YYYY-MM-DD]
**Synthesis Commit**: [will be filled after commit]

---

## Session Summary

[2-3 sentence summary of what was accomplished]

## Work Completed

- [Item 1]
- [Item 2]
- [Item 3]

## Code Changes

| Area | Change |
|------|--------|
| [Component] | [Brief description] |

## Decisions Made

- [Decision 1 and rationale]
- [Decision 2 and rationale]

## Issues Encountered

- [Issue and resolution, if any]

## Next Session Priorities

1. [Priority 1]
2. [Priority 2]
3. [Priority 3]

---

*This archive preserves the detailed session context. For current project state, see [TASKS.md](../../../TASKS.md).*
```

### Create Archive Directory (if needed)

```bash
mkdir -p docs/archive/sessions
```

---

## Phase 4: Project State Assessment

### Current Implementation Status

Assess the implementation status of each major component:

| Component                          | Status | Notes |
| ---------------------------------- | ------ | ----- |
| **Frontend (apps/web)**            |        |       |
| - PixiJS garden canvas             |        |       |
| - Observation system               |        |       |
| - Zustand state                    |        |       |
| **API Layer**                      |        |       |
| - tRPC endpoints                   |        |       |
| - Prisma schema                    |        |       |
| **Quantum Service (apps/quantum)** |        |       |
| - Circuit generation               |        |       |
| - IonQ integration                 |        |       |
| - Trait mapping                    |        |       |
| **Infrastructure**                 |        |       |
| - Database setup                   |        |       |
| - Docker compose                   |        |       |
| - CI/CD                            |        |       |

Update TASKS.md with this assessment.

---

## Phase 5: Next Steps Planning

### Strategic Prioritization

Using extended thinking, determine:

1. **Critical Path**: What's blocking progress toward a working demo?
2. **Dependencies**: What needs to be done before other work can proceed?
3. **Quick Wins**: What can be completed quickly to show progress?
4. **Technical Risks**: What might be harder than expected?

### Task Generation

Generate specific, actionable tasks for:

1. **Immediate** — Work that should happen next session
2. **Short-term** — Work for the next few sessions
3. **Medium-term** — Work for the next week or two
4. **Long-term** — Future enhancements and polish

Each task should be:

- Specific and actionable
- Sized appropriately (can be completed in one session)
- Prioritized based on dependencies and impact

---

## Phase 6: Commit, Clear Session Log, and Report

### Create Synthesis Commit and Push

Commit all documentation updates with a descriptive message, then push to origin:

```bash
git add -A
git commit -m "Synthesis: [brief summary of session focus]

Documentation updates:
- TASKS.md: [brief changes]
- docs/archive/sessions/[file]: Session archive created

Synthesis date: [date]"
git push origin
```

**IMPORTANT**: Always push to origin after committing. This ensures:
- Work is backed up remotely
- Changes are available if context compacts and session continues elsewhere
- Progress is preserved even if local session is interrupted

### Clear Session Log

**After committing**, reset the session log for the next session:

```markdown
# Session Log

**Session Started**: (awaiting next session)
**Previous Synthesis**: [commit hash from synthesis commit]

---

## Notes

(No active session)
```

Write this to `SESSION.md`, then commit and push:

```bash
git add SESSION.md
git commit -m "Clear session log after synthesis"
git push origin
```

### Generate Final Report

Output a synthesis report including:

1. **Session Summary**: What work was completed?
2. **Documentation Updates**: What files were updated?
3. **Session Archive Created**: Path to the archive file
4. **Current Project Status**: High-level assessment
5. **Implementation Progress**: Which components are complete?
6. **Next Steps**: Top 3-5 priorities for next session
7. **Blockers**: Anything preventing progress?
8. **Notes**: Any important observations or decisions

---

## Quality Standards

### Completeness

- All session work must be reflected in TASKS.md
- Session log content must be preserved in archive
- Documentation should match current implementation

### Clarity

- Tasks should be understandable without session context
- Documentation should be accurate and up-to-date
- Archives should capture key decisions and context

### Strategic Alignment

- All priorities should trace back to: **delivering a working Quantum Garden experience**
- Focus on the critical path to a functional demo

---

## Summary: Essential Updates

At minimum, every synthesis MUST:

| Action                   | Purpose                                |
| ------------------------ | -------------------------------------- |
| Read `SESSION.md`        | Capture what was done this session     |
| Update `TASKS.md`        | Track progress and plan next steps     |
| Create session archive   | Preserve detailed session context      |
| Clear `SESSION.md`       | Reset for next session                 |
| Commit and push          | Backup all changes to remote           |

**The session log is the primary input. The archive preserves it. TASKS.md tracks the work.**

---

Begin now by reading the session log and project documentation to understand what needs to be synthesized.
````

---

## Execution Instructions

When the user runs `/synthesize`, you MUST:

1. **Spawn a sub-agent** using the Task tool:
   - `subagent_type`: `general-purpose`
   - `description`: `Synthesize session and update docs`
   - `prompt`: The full prompt above (everything between the ```` markers)

2. **Do NOT run synthesis in the current context** — it must run as a sub-agent with its own context and task list

3. **Wait for the sub-agent to complete** and relay its final report to the user

This ensures:

- The synthesis agent has a clean context window
- It can use its own TodoWrite task list for tracking progress
- Complex multi-file analysis doesn't pollute the parent conversation
- The parent session can continue with a summary rather than full synthesis details
