# Quantum Garden - Quantum Service

Python service for quantum circuit generation and IonQ execution.

## Setup

```bash
# Install uv if not already installed
curl -LsSf https://astral.sh/uv/install.sh | sh

# Create virtual environment and install dependencies
uv sync

# For development dependencies
uv sync --extra dev
```

## Running

```bash
# Development server
uv run uvicorn src.main:app --reload --port 8000

# Or directly
uv run python -m src.main
```

## Environment Variables

Copy `.env.example` to `.env` in the project root and set:

- `IONQ_API_KEY` - Your IonQ API key from https://cloud.ionq.com/settings/keys
- `IONQ_USE_SIMULATOR` - Set to "true" for development (saves compute credits)

## API Endpoints

- `GET /health` - Health check
- `POST /circuits/generate` - Generate a plant genome circuit
- `POST /circuits/execute` - Submit circuit to IonQ
- `GET /jobs/{job_id}` - Check job status
- `POST /measure` - Perform measurement and return traits

## Testing

```bash
uv run pytest
```

## Linting

```bash
uv run ruff check src/
uv run ruff format src/
uv run mypy src/
```
