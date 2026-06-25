import asyncio
import os
from backend.api.market_data import ResilientMarketDataFetcher
from backend.ai.inference import DRLPortfolioEngine
from backend.api.sentiment import AlternativeSentimentEngine
from backend.api.execution import AlpacaExecutionEngine

async def main():
    print("Initializing...")
    market_streamer = ResilientMarketDataFetcher(["AAPL", "MSFT", "GOOGL", "AMZN"])
    drl_agent = DRLPortfolioEngine(["AAPL", "MSFT", "GOOGL", "AMZN"])
    sentiment_engine = AlternativeSentimentEngine()
    execution_engine = AlpacaExecutionEngine()

    print("Fetching market data...")
    market_state_df = await asyncio.to_thread(market_streamer.get_latest_market_state)
    current_prices = await asyncio.to_thread(market_streamer.get_latest_prices)
    print("Prices:", current_prices)

    print("Computing weights...")
    target_allocations = await asyncio.to_thread(drl_agent.compute_optimal_weights, market_state_df)
    print("Weights:", target_allocations)

    print("Computing sentiment...")
    sentiment_payload = await asyncio.to_thread(sentiment_engine.compute_ticker_sentiment, "AAPL")
    print("Sentiment:", sentiment_payload.keys() if isinstance(sentiment_payload, dict) else sentiment_payload)

    print("All success!")

if __name__ == "__main__":
    asyncio.run(main())
