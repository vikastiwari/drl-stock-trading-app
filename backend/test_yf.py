import asyncio
from backend.api.market_data import ResilientMarketDataFetcher
from backend.api.sentiment import AlternativeSentimentEngine

async def main():
    print("Testing market data fetcher...")
    fetcher = ResilientMarketDataFetcher(["AAPL"])
    try:
        df = fetcher.get_latest_market_state()
        print("Market Data Shape:", df.shape)
    except Exception as e:
        print("Market Data Error:", e)

    print("Testing sentiment engine...")
    sentiment = AlternativeSentimentEngine()
    try:
        res = sentiment.compute_ticker_sentiment("AAPL")
        print("Sentiment Data:", res)
    except Exception as e:
        print("Sentiment Error:", e)

if __name__ == "__main__":
    asyncio.run(main())
