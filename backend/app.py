import asyncio
import random
from typing import AsyncGenerator
from litestar import Litestar, get
from litestar.response import ServerSentEvent

# Mock AI Portfolio Generation
async def generate_portfolio_updates() -> AsyncGenerator[str, None]:
    """Simulates the DRL agent outputting portfolio weights and current valuation."""
    while True:
        # Simulate network delay/inference time
        await asyncio.sleep(1.0)
        
        portfolio_value = round(random.uniform(10000, 10500), 2)
        target_weights = {
            "AAPL": round(random.uniform(0.1, 0.4), 2),
            "MSFT": round(random.uniform(0.1, 0.4), 2),
            "CASH": round(random.uniform(0.2, 0.8), 2)
        }
        
        # We will eventually use msgspec for serialization here
        payload = f'{{"portfolio_value": {portfolio_value}, "target_weights": {target_weights}}}'
        yield payload

@get("/api/stream/portfolio")
async def stream_portfolio() -> ServerSentEvent:
    """
    Server-Sent Events (SSE) endpoint to stream portfolio updates to the React UI.
    This replaces the old WebSocket architecture, completely eliminating TCP HoL blocking.
    """
    return ServerSentEvent(generate_portfolio_updates())

@get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok", "architecture": "litestar_sse_enabled"}

app = Litestar(route_handlers=[stream_portfolio, health_check])
