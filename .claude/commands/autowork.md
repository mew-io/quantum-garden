# Autowork: Autonomous Development Loop

You are entering **autonomous development mode**. Your goal is to work continuously on tasks from TASKS.md, implementing features and fixing issues, until a human interrupts you.

---

## CRITICAL: Re-Read After Context Compaction

**IMPORTANT**: You will likely compact context multiple times during this session. After EVERY context compaction, you MUST:

1. Re-read this file: `.claude/commands/autowork.md`
2. Re-read `README.md` for project context
3. Re-read `TASKS.md` for current priorities and progress
4. Re-read the session log: `SESSION.md`
5. **Check synthesis status** — Look for "Synthesis commit" in SESSION.md
6. Continue from where you left off based on the session log

**WARNING**: If SESSION.md shows completed work WITHOUT a recent "Synthesis commit" entry, you must run `/synthesize` BEFORE starting new work. Undocumented progress will be lost.

---

## The Development Loop

Execute this loop continuously until interrupted:

### Phase 1: Orient (Start of Each Loop)

1. **Read the current state**:
   - `README.md` — Project overview and architecture
   - `TASKS.md` — Current sprint, backlog, and implementation status
   - `SESSION.md` — What's been done this session (if it exists)
   - `docs/architecture.md` — System design context

2. **Select the highest-priority task** based on:
   - **First**: Any tasks marked "In Progress" that need completion
   - **Second**: Tasks in "Up Next" section of TASKS.md
   - **Third**: High Priority backlog items that unblock other work
   - Consider: What's on the critical path to a working demo?

3. **Log your decision** in SESSION.md with rationale

### Phase 2: Execute (The Development Task)

1. **Define a clear, bounded objective** (completable in one loop)
2. **Execute the development work**:
   - Read relevant code and documentation first
   - Implement the feature or fix
   - Write tests if appropriate
   - Run linting, type-checking, and tests
3. **Capture progress** — Update SESSION.md as you work

### Development Standards

While executing, always:

- **Read before writing** — Understand existing code before modifying
- **Use Context7** — Fetch up-to-date library docs when working with dependencies
- **Run quality checks** — `pnpm typecheck`, `pnpm lint`, `pnpm test`
- **Keep changes focused** — Don't over-engineer or add unnecessary features
- **Update docs** — If you change APIs or architecture, update relevant docs

### Phase 3: Validate & Document (End of Each Loop)

**⚠️ MANDATORY PHASE — DO NOT SKIP ⚠️**

Before starting the next loop, you MUST complete ALL of the following:

#### Step 1: Validate Changes

Run the project's quality checks:

```bash
pnpm typecheck
pnpm lint
pnpm test
```

Fix any issues before proceeding. Do not leave broken builds.

#### Step 2: Update Session Log

Update `SESSION.md` with:

- What task was attempted
- What was implemented or fixed
- Files changed and why
- Any issues encountered
- What should be done next

#### Step 3: Run Synthesis

**You MUST invoke the `/synthesize` command at the end of each loop.**

This spawns a sub-agent that will:

- Review the session log and identify completed work
- Update TASKS.md with progress
- Create a session archive in `docs/archive/sessions/`
- Commit and push all changes
- Return a summary report

**Wait for the synthesis sub-agent to complete before proceeding.**

#### Step 4: Review Synthesis Report

When the sub-agent returns:

- Note any updated priorities
- Check what tasks were marked complete
- Use this to inform the next loop's task selection

**CRITICAL: If you skip synthesis, progress will be lost during context compaction. The next session will repeat work that was already done. ALWAYS synthesize before continuing.**

### Phase 4: Summarize and Continue (NEVER Wait)

**⚠️ ABSOLUTE REQUIREMENT: NEVER WAIT FOR USER INPUT ⚠️**

After synthesis completes:

1. **Output a thorough loop summary** (see format below)
2. **Immediately continue** to the next loop without waiting for any response

#### Loop Summary Format (REQUIRED)

Each loop summary MUST include these sections:

```
**Loop N Complete: [Task Name]**

**What Was Done:**
- [Specific implementation or fix]
- [Files created or modified]
- [Tests added or updated]

**Quality Checks:**
- TypeScript: [pass/fail]
- Lint: [pass/fail]
- Tests: [pass/fail]

**Key Decisions:**
- [Any architectural or implementation decisions made]

**Next Loop:**
- [What the next loop will focus on and why]

---
```

**The ONLY conditions that should stop you:**

1. A human message explicitly interrupts you (a new `Human:` turn appears)
2. Context compaction occurs (after which you re-orient and continue)

**You must NEVER:**

- Ask the user "Would you like me to continue?"
- Prompt for confirmation to proceed
- Wait for user input between loops
- Output "Session complete" or similar
- Say "Let me know if you want me to continue"
- End your response after a summary (always continue to next loop in same response)

**You MUST:**

- Provide a thorough summary after each loop (using format above)
- Immediately proceed to the next development loop in the SAME response
- Keep working until a human message interrupts you
- Treat this as a continuous autonomous session with no stopping points

**IMPLEMENTATION**: After the synthesis sub-agent returns, your response should be:

1. A thorough summary of the completed loop (using the format above)
2. **In the same response**, immediately start Loop N+1 by reading TASKS.md
3. Continue executing the next loop without any pause or wait

---

## Session Log Format

Maintain `SESSION.md` with this structure:

```markdown
# Session Log

**Session Started**: [timestamp]
**Session ID**: autowork-[date]-[sequence]

---

## Loop N: [Task Name]

**Started**: [timestamp]
**Objective**: [what you're trying to accomplish]

### Work Done

[What you implemented, files changed, decisions made]

### Quality Checks

- TypeScript: [pass/fail]
- Lint: [pass/fail]
- Tests: [pass/fail]

### Issues Encountered

[Any problems and how they were resolved]

### Next Priority

[What should be done next and why]

### Synthesis

**Synthesis invoked**: [timestamp]
**Synthesis commit**: [commit hash from sub-agent report]

**Completed**: [timestamp]

---
```

---

## Task Selection Priorities

Based on the Quantum Garden project goals:

1. **Unblock the Demo** — Core functionality needed for a working experience
2. **Critical Path Items** — Tasks that enable other high-priority work
3. **High Priority Backlog** — Important features from TASKS.md
4. **Technical Debt** — If blocking quality or velocity
5. **Polish Items** — Only when core functionality is complete

---

## When Tasks Are Unclear or Blocked

If you cannot proceed with a task:

### Task is Unclear

1. Read related documentation (`docs/`, code comments)
2. Examine similar existing implementations
3. Make a reasonable decision and document your rationale
4. Note the ambiguity in SESSION.md for later review

### Task is Blocked

1. Document what's blocking in SESSION.md
2. Check if a different task can be done instead
3. If truly stuck, add a note and select the next priority task
4. Never wait for user input — keep making progress elsewhere

### No More Tasks

1. Review TASKS.md backlog for overlooked items
2. Check Technical Debt section
3. Look for obvious improvements in existing code
4. Generate new tasks based on project goals
5. Document new tasks before working on them

---

## Rules

1. **Quality first** — All changes must pass typecheck, lint, and tests
2. **Document everything** — If it's not in SESSION.md, it didn't happen
3. **Stay focused** — One bounded task per loop
4. **Always synthesize** — Run /synthesize after every loop
5. **Keep moving** — Never wait for user input; always proceed to next task
6. **Read before writing** — Understand code before modifying it

---

## Starting the Session

Begin by:

1. Reading `README.md` for project context
2. Creating/updating `SESSION.md` with session start
3. Reading `TASKS.md` for current priorities
4. Selecting your first task (highest priority unblocked item)
5. Executing Loop 1

**Remember**: You are working autonomously. Select tasks, implement them, validate quality, synthesize progress, and continue. Keep going until interrupted.
