# NautilusTrader Orchestration Dashboard

## Prerequisites

- Node.js & pnpm
- Python 3.10+ & uv (pip install uv)
- Docker (for Redis)

## Setup

1. **Install Dependencies**
   ```bash
   pnpm install
   # Python setup
   cd python_engine
   uv venv
   source .venv/bin/activate
   uv pip install -r pyproject.toml
   cd ..
   ```

2. **Database**
   ```bash
   # Ensure .env has DATABASE_URL="file:./dev.db"
   pnpm exec prisma db push
   pnpm exec tsx prisma/seed.ts
   ```

3. **Infrastructure**
   ```bash
   docker-compose up -d
   ```

## Running the App

You need two terminals:

1. **Frontend & API**
   ```bash
   pnpm dev
   ```

2. **Python Engine**
   ```bash
   cd python_engine
   uv run uvicorn main:app --reload --port 8000
   ```

## Usage

1. Go to `http://localhost:3000`.
2. Navigate to "Deploy Strategy".
3. Click "Configure & Run" on a card.
4. Watch the live monitoring page update with simulated trades and equity curve.
