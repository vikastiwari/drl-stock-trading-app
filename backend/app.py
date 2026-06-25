import asyncio
from typing import Dict, Any
from litestar import Litestar, WebSocket, get
from litestar.handlers.websocket_handlers import websocket_listener
from litestar.config.cors import CORSConfig

from backend.api.market_data import ResilientMarketDataFetcher
from backend.ai.inference import DRLPortfolioEngine
from backend.api.sentiment import AlternativeSentimentEngine
from backend.api.backtest import AsyncBacktestEngine
from backend.api.chat import chat_with_gemini
from backend.api.execution import AlpacaExecutionEngine

# Instantiate the core architecture services globally
active_universe = ["AAPL", "MSFT", "GOOGL", "AMZN"]
market_streamer = ResilientMarketDataFetcher(asset_universe=active_universe)
drl_agent = DRLPortfolioEngine(model_filepath="models/ppo_optimal_portfolio.zip", asset_universe=active_universe)
sentiment_engine = AlternativeSentimentEngine()

# Initialize execution engine
execution_engine = AlpacaExecutionEngine()

# Global state for simulation to persist across reconnects
simulation_state = {
    "first_run": True,
    "portfolio_value": 500000.0,
    "pnl_dollars": 0.0,
    "pnl_percent": 0.0,
    "current_cash": 0.0,
    "shares_held": {}
}

@websocket_listener("/ws/terminal-feed")
async def terminal_feed_handler(data: Dict[str, Any], socket: WebSocket) -> None:
    """
    Establishes a bidirectional WebSocket connection.
    The client pushes configuration data (e.g., {"target_asset": "AAPL"}).
    The server continuously pushes a synthesized payload of DRL allocations and sentiment.
    """
    focus_asset = data.get("target_asset", "AAPL")
    api_keys = data.get("apiKeys", {})
    auto_trade_enabled = api_keys.get("autoTradeEnabled", False)
    
    execution_engine = AlpacaExecutionEngine(
        api_key=api_keys.get("apcaKey"),
        secret_key=api_keys.get("apcaSecretKey"),
        paper=True
    )
    # Ensure the engine's internal enabled state respects the UI toggle
    execution_engine.enabled = auto_trade_enabled and bool(execution_engine.client)
    
    global simulation_state
    
    try:
        # Initiate an indefinite loop to continuously stream data to the terminal
        while True:
            print("[DEBUG] Loop start")
            # 1. Acquire the current market state
            market_state_df = await asyncio.to_thread(market_streamer.get_latest_market_state)
            current_prices = await asyncio.to_thread(market_streamer.get_latest_prices)
            print(f"[DEBUG] Market data fetched. Prices: {current_prices}")
            
            if not current_prices or market_state_df.empty:
                print("Failed to fetch live market data (likely rate-limited). Using mock data to proceed with Demo...")


            
            # 2. Compute the optimal portfolio allocation via the DRL agent
            target_allocations = await asyncio.to_thread(drl_agent.compute_optimal_weights, market_state_df)
            print(f"[DEBUG] Allocations computed: {target_allocations}")
            
            # 3. Assess the current sentiment for the user's focus asset
            sentiment_payload = await asyncio.to_thread(sentiment_engine.compute_ticker_sentiment, focus_asset)
            print(f"[DEBUG] Sentiment payload generated")
            
            # Phase 8: Simulate Portfolio Value Changes
            if simulation_state["first_run"]:
                # Set initial allocations
                for ticker, weight in target_allocations.items():
                    amount_allocated = 500000.0 * weight
                    simulation_state["shares_held"][ticker] = amount_allocated / current_prices[ticker]
                simulation_state["current_cash"] = 0.0 # fully invested for simulation
                simulation_state["first_run"] = False
            else:
                # Calculate new portfolio value based on held shares and current prices
                new_value = simulation_state["current_cash"]
                for ticker, shares in simulation_state["shares_held"].items():
                    new_value += shares * current_prices[ticker]
                
                simulation_state["portfolio_value"] = new_value
                simulation_state["pnl_dollars"] = new_value - 500000.0
                simulation_state["pnl_percent"] = (simulation_state["pnl_dollars"] / 500000.0) * 100
            
            # 4. Construct the comprehensive update payload
            execution_logs = []
            if auto_trade_enabled:
                print("[DEBUG] Rebalancing portfolio via Alpaca...")
                execution_logs = await asyncio.to_thread(execution_engine.rebalance_portfolio, target_allocations, current_prices)
                print(f"[DEBUG] Rebalance complete. Logs: {len(execution_logs)}")
            else:
                from datetime import datetime
                ts = datetime.now().strftime('%H:%M:%S')
                execution_logs = [f"[{ts}] [SYSTEM] Auto-Trading is DISABLED. Running in Simulation mode."]

            terminal_update = {
                "event_type": "TERMINAL_STATE_UPDATE",
                "portfolio_allocations": target_allocations,
                "portfolio_value": round(simulation_state["portfolio_value"], 2),
                "pnl_dollars": round(simulation_state["pnl_dollars"], 2),
                "pnl_percent": round(simulation_state["pnl_percent"], 2),
                "initial_capital": 500000.0,
                "asset_sentiment": sentiment_payload,
                "execution_logs": execution_logs
            }
            
            # Broadcast the serialized JSON payload back to the React UI
            print("[DEBUG] Sending payload over websocket...")
            await socket.send_json(terminal_update)
            print("[DEBUG] Payload sent successfully. Sleeping 5s.")
            
            # Throttle the iteration to respect reasonable API limits
            await asyncio.sleep(5) 
            
    except Exception as e:
        print(f"WebSocket connection terminated unexpectedly: {str(e)}")

@get("/api/historical/{ticker:str}")
async def get_historical_data(ticker: str) -> dict[str, Any]:
    data = await asyncio.to_thread(market_streamer.get_historical_data, ticker)
    return {"ticker": ticker, "data": data}

@get("/api/vpvr/{ticker:str}")
async def get_vpvr_data(ticker: str) -> dict[str, Any]:
    data = await asyncio.to_thread(market_streamer.get_vpvr, ticker)
    return {"ticker": ticker, "data": data}

@websocket_listener("/ws/backtest")
async def backtest_handler(data: Dict[str, Any], socket: WebSocket) -> None:
    ticker = data.get("ticker", "AAPL")
    period = data.get("period", "1y")
    engine = AsyncBacktestEngine()
    await engine.run_backtest(socket, ticker, period)

@get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok", "architecture": "litestar_websocket_pytorch"}

# Initialize the Litestar ASGI application
cors_config = CORSConfig(allow_origins=["*"])
app = Litestar(
    route_handlers=[terminal_feed_handler, get_historical_data, get_vpvr_data, backtest_handler, health_check, chat_with_gemini],
    cors_config=cors_config,
    debug=True
)
