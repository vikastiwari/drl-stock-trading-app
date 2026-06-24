import asyncio
from typing import Dict, Any
from litestar import Litestar, WebSocket, get
from litestar.handlers.websocket_handlers import websocket_listener
from litestar.config.cors import CORSConfig

from backend.api.market_data import ResilientMarketDataFetcher
from backend.ai.inference import DRLPortfolioEngine
from backend.api.sentiment import AlternativeSentimentEngine

# Instantiate the core architecture services globally
active_universe = ["AAPL", "MSFT", "GOOGL", "AMZN"]
market_streamer = ResilientMarketDataFetcher(asset_universe=active_universe)
drl_agent = DRLPortfolioEngine(model_filepath="models/ppo_optimal_portfolio.zip", asset_universe=active_universe)
sentiment_engine = AlternativeSentimentEngine()

@websocket_listener("/ws/terminal-feed")
async def terminal_feed_handler(data: Dict[str, Any], socket: WebSocket) -> None:
    """
    Establishes a bidirectional WebSocket connection.
    The client pushes configuration data (e.g., {"target_asset": "AAPL"}).
    The server continuously pushes a synthesized payload of DRL allocations and sentiment.
    """
    focus_asset = data.get("target_asset", "AAPL")
    
    try:
        # Initiate an indefinite loop to continuously stream data to the terminal
        while True:
            # 1. Acquire the current market state
            # Offloaded to thread pool if the underlying library is synchronous.
            market_state_df = await asyncio.to_thread(market_streamer.get_latest_market_state)
            current_prices = await asyncio.to_thread(market_streamer.get_latest_prices)
            
            # 2. Compute the optimal portfolio allocation via the DRL agent
            target_allocations = await asyncio.to_thread(drl_agent.compute_optimal_weights, market_state_df)
            
            # 3. Assess the current sentiment for the user's focus asset
            sentiment_payload = await asyncio.to_thread(sentiment_engine.compute_ticker_sentiment, focus_asset)
            
            # Calculate theoretical portfolio value
            portfolio_value = 10000.0 + sum(current_prices.values()) * 10
            
            # 4. Construct the comprehensive update payload
            terminal_update = {
                "event_type": "TERMINAL_STATE_UPDATE",
                "portfolio_value": round(portfolio_value, 2),
                "portfolio_allocations": target_allocations,
                "asset_sentiment": sentiment_payload
            }
            
            # Broadcast the serialized JSON payload back to the React UI
            await socket.send_json(terminal_update)
            
            # Throttle the iteration to respect reasonable API limits
            await asyncio.sleep(5) 
            
    except Exception as e:
        print(f"WebSocket connection terminated unexpectedly: {str(e)}")

@get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok", "architecture": "litestar_websocket_pytorch"}

# Initialize the Litestar ASGI application
cors_config = CORSConfig(allow_origins=["*"])
app = Litestar(
    route_handlers=[terminal_feed_handler, health_check],
    cors_config=cors_config,
    debug=True
)
