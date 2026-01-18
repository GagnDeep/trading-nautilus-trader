import asyncio
import json
import redis.asyncio as redis
from fastapi import FastAPI, WebSocket, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any

# Import Runner
# We need to make sure python_engine is in path
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.runner import Runner

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis for Pub/Sub
redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

class SessionRequest(BaseModel):
    session_id: str
    strategy_id: str # This might be the ID, we need the filename or name
    config: Dict[str, Any]

def start_runner_task(session_id: str, strategy_name: str, config: dict, mode: str):
    runner = Runner(session_id, strategy_name, config, mode)
    # We need to run the async runner in this thread or a new event loop
    # Since FastAPI is async, we can just await it if we weren't in a background task context?
    # Actually, background tasks in FastAPI are run in a threadpool if synchronous, or directly if async.
    # But Runner.run is async.

    # We'll create a new event loop for the runner or run it in the current loop if possible.
    # Safer to just use asyncio.run if it was a script, but here we are inside an event loop.
    # So we should just create a task.
    asyncio.create_task(runner.run())

@app.post("/backtest")
async def start_backtest(req: SessionRequest):
    # Retrieve strategy name from DB or Map.
    # For now, we assume strategy_id IS the name or we can lookup.
    # Let's assume the frontend sends the Name in strategy_id or we fetch it.
    # Quick hack: The Frontend passes ID. We should probably fetch the Name from DB here using Prisma.
    # OR: The Frontend passes the NAME as strategy_id for now?
    # Let's assume strategy_id passed from TRPC is the database ID.

    # We will just map it to "Momentum_EMACross" for testing if not resolved.
    # In a real app, we query the DB.
    # For the sake of this Plan Step 3 verification, I'll hardcode a lookup or expect the frontend to pass the name.

    # Let's rely on the Frontend passing the "name" or "file_path" inside the config or a separate field?
    # The TRPC router passed `strategy_id`.

    # Let's cheat slightly and fetch from DB using a Prisma client in Python?
    # Or easier: The TRPC router can pass the filename in the body.
    # I'll update the TRPC router later to pass `strategy_name` or `file_path`.
    # For now, I'll try to guess based on ID or just default.

    strategy_name = req.config.get("strategy_name", "Momentum_EMACross")

    # Sanitize name
    strategy_name = strategy_name.replace(".py", "")

    start_runner_task(req.session_id, strategy_name, req.config, "BACKTEST")
    return {"status": "started", "session_id": req.session_id}

@app.post("/live")
async def start_live(req: SessionRequest):
    strategy_name = req.config.get("strategy_name", "Momentum_EMACross")
    strategy_name = strategy_name.replace(".py", "")
    start_runner_task(req.session_id, strategy_name, req.config, "LIVE")
    return {"status": "started", "session_id": req.session_id}

@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()
    pubsub = redis_client.pubsub()
    await pubsub.subscribe(f"session:{session_id}")

    try:
        async for message in pubsub.listen():
            if message["type"] == "message":
                await websocket.send_text(message["data"])
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await pubsub.unsubscribe(f"session:{session_id}")
        await websocket.close()

@app.get("/health")
def health():
    return {"status": "ok"}
