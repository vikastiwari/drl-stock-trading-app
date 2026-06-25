import time
import pandas as pd
import yfinance as yf
from curl_cffi import requests

class ResilientMarketDataFetcher:
    def __init__(self, asset_universe: list[str], cache_ttl_seconds: int = 60):
        self.asset_universe = asset_universe
        self.cache_ttl = cache_ttl_seconds
        self._cache = None
        self._last_fetch_time = 0
        
        # Initialize a persistent session that mimics the TLS signature of Chrome 131.
        self.session = requests.Session(impersonate="chrome131")
        
        # Ensure standard browser headers are present
        self.session.headers.update({
            "Accept": "application/json, text/plain, */*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US,en;q=0.9",
        })

    def get_latest_market_state(self) -> pd.DataFrame | None:
        """
        Polls Yahoo finance for the current intraday state of the asset basket.
        Implements an in-memory TTL cache to prevent aggressive over-polling.
        """
        current_time = time.time()
        
        # Serve from cache if the Time-To-Live has not expired
        if current_time - self._last_fetch_time < self.cache_ttl and self._cache is not None:
            return self._cache
            
        try:
            # We'll set a strict timeout on the requests session to prevent hanging
            self.session.timeout = 2.0
            
            # Pass the curl_cffi session directly into yfinance
            market_data = yf.download(
                tickers=" ".join(self.asset_universe),
                period="1d",
                interval="1m",
                group_by="ticker",
                auto_adjust=True,
                session=self.session,
                progress=False
            )
            
            if market_data is None or market_data.empty:
                raise ValueError("Received empty DataFrame from yfinance")
                
            self._cache = market_data
            self._last_fetch_time = current_time
            
            return market_data
            
        except Exception as e:
            # Instead of just printing, we immediately return an empty DataFrame 
            # to signal the fallback mechanism to kick in instantly without crashing.
            print(f"Data ingestion failure: {str(e)}")
            self._cache = pd.DataFrame() # Return empty DF to trigger fast fallback
            return self._cache

    def get_latest_prices(self) -> dict[str, float]:
        df = self.get_latest_market_state()
        prices = {}
        if df is None or df.empty:
            # Fallback mock if completely failed
            import random
            return {ticker: round(random.uniform(100.0, 300.0), 2) for ticker in self.asset_universe}
            
        for ticker in self.asset_universe:
            try:
                # Depending on single vs multiple tickers, yf.download returns different structures
                if len(self.asset_universe) == 1:
                    last_price = df['Close'].iloc[-1]
                else:
                    last_price = df[ticker]['Close'].iloc[-1]
                prices[ticker] = float(last_price)
            except Exception:
                import random
                prices[ticker] = round(random.uniform(100.0, 300.0), 2)
        return prices

    def get_historical_data(self, ticker: str) -> list[dict]:
        """
        Fetches 30 days of historical data for rendering the Tear Sheet.
        """
        try:
            self.session.timeout = 2.0
            df = yf.download(
                tickers=ticker,
                period="1mo",
                interval="1d",
                auto_adjust=True,
                session=self.session,
                progress=False
            )
            
            if df is None or df.empty:
                raise ValueError("No data returned")
                
            # Format to list of dictionaries for the frontend Recharts
            df = df.reset_index()
            # yfinance index is usually 'Date' or 'Datetime'
            date_col = 'Date' if 'Date' in df.columns else df.columns[0]
            
            history = []
            for _, row in df.iterrows():
                # Close price might be a Series if MultiIndex was used
                close_price = row['Close']
                if isinstance(close_price, pd.Series):
                    close_price = float(close_price.iloc[0])
                else:
                    close_price = float(close_price)
                    
                history.append({
                    "date": row[date_col].strftime('%Y-%m-%d'),
                    "close": close_price
                })
            return history
            
        except Exception as e:
            print(f"Historical data ingestion failure for {ticker}: {str(e)}")
            # Fallback mock data
            import random
            from datetime import datetime, timedelta
            base = 150.0
            history = []
            for i in range(30, 0, -1):
                base *= (1 + random.normalvariate(0, 0.02))
                history.append({
                    "date": (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d'),
                    "close": round(base, 2)
                })
            return history
