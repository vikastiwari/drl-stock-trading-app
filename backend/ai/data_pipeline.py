import yfinance as yf
import pandas as pd
from typing import List

class DataPipeline:
    """
    Handles asynchronous/synchronous data ingestion from Yahoo Finance.
    In a real production app, this would use Alpaca WebSockets for live ticks,
    but we use yfinance here for reliable historical and paper-trading data.
    """
    
    def __init__(self, tickers: List[str]):
        self.tickers = tickers

    def fetch_historical_data(self, period: str = "1mo", interval: str = "1d") -> pd.DataFrame:
        """
        Fetches OHLCV data for the initialized tickers.
        """
        try:
            # yfinance returns a multi-index dataframe if multiple tickers are passed
            data = yf.download(self.tickers, period=period, interval=interval, progress=False)
            
            if data.empty:
                raise ValueError("No data returned from Yahoo Finance.")
                
            return data
            
        except Exception as e:
            # In production, we'd log this properly
            print(f"Error fetching data: {e}")
            raise

    def get_latest_prices(self) -> dict:
        """
        Retrieves the most recent close prices to construct the current state.
        """
        data = self.fetch_historical_data(period="1d", interval="1m")
        latest = data['Close'].iloc[-1]
        
        # Format as a dictionary { 'AAPL': 150.0, 'MSFT': 300.0 }
        if len(self.tickers) == 1:
            return {self.tickers[0]: float(latest)}
        
        return latest.to_dict()
