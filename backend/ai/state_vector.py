import numpy as np
import random
from typing import Dict, List

class StateVectorBuilder:
    """
    Constructs the Markov Decision Process (MDP) state vector for the DRL Agent.
    Combines numerical price data with FinGPT sentiment data.
    """
    
    def __init__(self, tickers: List[str]):
        self.tickers = tickers
        
    def _mock_fingpt_sentiment(self, ticker: str) -> float:
        """
        Mocks the inference output of FinGPT analyzing financial news for a ticker.
        Returns a continuous float between -1.0 (extremely bearish) and 1.0 (extremely bullish).
        """
        # In Phase 3, this will call a real API or local Triton inference server
        return random.uniform(-1.0, 1.0)
        
    def build_state(self, current_prices: Dict[str, float], cash_balance: float) -> np.ndarray:
        """
        Creates the 1D state array.
        Format: [ Cash, Price_1, Price_2, ..., Price_N, Sentiment_1, Sentiment_2, ..., Sentiment_N ]
        """
        state = [cash_balance]
        
        # Append Prices
        for ticker in self.tickers:
            price = current_prices.get(ticker, 0.0)
            state.append(price)
            
        # Append Sentiment
        for ticker in self.tickers:
            sentiment = self._mock_fingpt_sentiment(ticker)
            state.append(sentiment)
            
        return np.array(state, dtype=np.float32)
