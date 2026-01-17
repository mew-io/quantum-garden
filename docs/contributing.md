# Contributing Guide

Thank you for your interest in contributing to Quantum Garden! This guide will help you get started.

---

## Code of Conduct

Be kind, respectful, and constructive. We're building something calm and contemplative—let's keep our collaboration the same way.

---

## Getting Started

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [pnpm 9+](https://pnpm.io/)
- [Python 3.11+](https://www.python.org/)
- [uv](https://github.com/astral-sh/uv)
- [Docker](https://www.docker.com/)

### Setup

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/quantum-garden.git
cd quantum-garden

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your values

# Start database
docker compose up -d

# Run migrations
pnpm db:push

# Start development
pnpm dev
```

---

## Development Workflow

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation changes
- `refactor/description` - Code refactoring

### Commit Messages

Write clear, descriptive commit messages:

```
Add observation region dwell tracking

- Implement dwell timer per eligible plant
- Reset dwell on alignment break
- Fire observation event on completion
```

### Pull Requests

1. Create a feature branch from `main`
2. Make your changes
3. Ensure all checks pass (lint, types, tests)
4. Submit a PR with a clear description
5. Address any review feedback

---

## Code Quality

### TypeScript

- Enable strict mode
- Use explicit types for function parameters and returns
- Prefer `interface` over `type` for object shapes
- Use `const` assertions for literals

### Python

- Follow PEP 8 style
- Use type hints throughout
- Run ruff for linting and formatting
- Run mypy for type checking

### Testing

- Write tests for new functionality
- Maintain existing test coverage
- Tests should be deterministic and fast

---

## Running Checks

Before submitting a PR, ensure all checks pass:

```bash
# TypeScript/JavaScript
pnpm lint        # ESLint
pnpm typecheck   # TypeScript
pnpm format:check # Prettier

# Python (in apps/quantum)
uv run ruff check src/
uv run ruff format --check src/
uv run mypy src/
uv run pytest
```

---

## Architecture Guidelines

### Frontend

- Keep components focused and small
- Use Zustand for shared state
- Avoid prop drilling—use stores or context
- PixiJS rendering happens in dedicated components

### API

- Use tRPC procedures for all API calls
- Validate input with Zod schemas
- Keep procedures focused on single operations
- Handle errors gracefully

### Quantum Service

- Circuits are pure functions of their inputs
- Store circuit definitions as JSON for reproducibility
- Trait mapping is deterministic given measurements
- Never expose IonQ credentials in responses

---

## Documentation

- Update docs when changing functionality
- Use clear, concise language
- Include code examples where helpful
- Keep the README current

---

## Security

- **Never commit secrets** to the repository
- All API keys go in `.env` (gitignored)
- Pre-commit hooks scan for leaked secrets
- Report security issues privately to maintainers

---

## Questions?

Open an issue for:

- Bug reports
- Feature requests
- Questions about the codebase

We appreciate all contributions, big or small!
