import asyncio
import torch
from typing import AsyncGenerator
from litestar import Litestar, get
from litestar.response import ServerSentEvent
from litestar.datastructures import State

from backend.ai.data_pipeline import DataPipeline
from backend.ai.state_vector import StateVectorBuilder
from backend.ai.model import MockDRLAgent

TICKERS = ["AAPL", "MSFT"]
pipeline = DataPipeline(TICKERS)
state_builder = StateVectorBuilder(TICKERS)

# --- Litestar Lifespan Hooks ---
def load_pytorch_model(app: Litestar) -> None:
    """
    Called on Litestar startup. Loads the PyTorch model securely into application memory.
    """
    print("Loading PyTorch Inference Engine...")
    model = MockDRLAgent()
    model.eval() # Set model to evaluation mode
    app.state.model = model
    print("PyTorch Engine Loaded and Ready.")

# --- Real-Time Streaming ---
async def generate_portfolio_updates(app_state: State) -> AsyncGenerator[str, None]:
    """
    Simulates the DRL agent processing live data and outputting portfolio weights.
    """
    model = app_state.model
    cash_balance = 10000.0
    
    while True:
        # 1. Fetch "live" prices (mocked interval to prevent yfinance spam)
        MOCK_MODE = True
        
        if MOCK_MODE:
            # Add some slight randomness so the chart moves dynamically!
            import random
            current_prices = {
                "AAPL": round(random.uniform(145.0, 155.0), 2),
                "MSFT": round(random.uniform(290.0, 310.0), 2)
            }
        else:
            try:
                current_prices = pipeline.get_latest_prices()
            except Exception:
                current_prices = {"AAPL": 150.0, "MSFT": 300.0}

        # 2. Build mathematical state vector
        state_array = state_builder.build_state(current_prices, cash_balance)
        state_tensor = torch.tensor(state_array, dtype=torch.float32)

        # 3. Execute PyTorch inference non-blockingly!
        # We pass it to a background thread to prevent blocking the async event loop.
        weights_tensor = await asyncio.to_thread(model, state_tensor)
        weights = weights_tensor.detach().numpy().tolist()

        target_weights = {
            "CASH": round(weights[0], 2),
            "AAPL": round(weights[1], 2),
            "MSFT": round(weights[2], 2)
        }
        
        # Calculate theoretical portfolio value based on new prices
        # (Assuming equal distribution originally for demo purposes)
        portfolio_value = cash_balance + sum(current_prices.values()) * 10
        
        import json
        payload_dict = {
            "portfolio_value": round(portfolio_value, 2),
            "target_weights": target_weights
        }
        yield json.dumps(payload_dict)
        
        # Wait for next "tick"
        await asyncio.sleep(2.0)

@get("/api/stream/portfolio")
async def stream_portfolio(state: State) -> ServerSentEvent:
    """
    Server-Sent Events (SSE) endpoint to stream AI decisions.
    """
    return ServerSentEvent(generate_portfolio_updates(state))

@get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok", "architecture": "litestar_sse_pytorch"}

app = Litestar(
    route_handlers=[stream_portfolio, health_check],
    on_startup=[load_pytorch_model]
)
