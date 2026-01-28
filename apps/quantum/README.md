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

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
# Edit .env with your values
```

### IonQ Configuration

**Getting an IonQ API Key** (Free Tier Available):

1. Create an account at [IonQ Cloud](https://cloud.ionq.com/)
2. Navigate to Settings → API Keys: https://cloud.ionq.com/settings/keys
3. Generate a new API key
4. Copy the key to your `.env` file:
   ```bash
   IONQ_API_KEY="your_key_here"
   ```

**Free Tier Includes**:

- 10 minutes of simulator time per month
- Perfect for development and testing
- No credit card required

**Execution Modes**:

- `IONQ_USE_SIMULATOR=true` - Uses IonQ simulator (recommended for development)
  - Provides real quantum results without hardware costs
  - Much faster than hardware execution
  - Counts against free tier minutes

- `IONQ_USE_SIMULATOR=false` - Uses real IonQ quantum hardware
  - Requires compute credits
  - Slower (queuing + execution time)
  - Only use when you need real hardware results

**Mock Mode** (No API Key):

- If `IONQ_API_KEY` is empty, the service uses mock trait generation
- Good for frontend development without quantum dependencies
- Uses deterministic pseudorandom generation seeded from circuit definitions

## API Endpoints

- `GET /health` - Health check with basic configuration status
- `GET /config` - Detailed configuration and execution mode
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
