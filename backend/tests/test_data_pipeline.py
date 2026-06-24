import pytest
import numpy as np
from backend.ai.data_pipeline import DataPipeline
from backend.ai.state_vector import StateVectorBuilder

@pytest.fixture
def tickers():
    return ["AAPL", "MSFT"]

def test_state_vector_builder_shape(tickers):
    """
    Tests that the mathematical shape of the state vector matches FinRL requirements.
    State size = 1 (cash) + 2 (prices) + 2 (sentiments) = 5
    """
    builder = StateVectorBuilder(tickers)
    mock_prices = {"AAPL": 150.0, "MSFT": 300.0}
    cash = 10000.0
    
    state = builder.build_state(mock_prices, cash)
    
    assert isinstance(state, np.ndarray), "State must be a numpy array"
    assert state.shape == (5,), f"Expected shape (5,), got {state.shape}"
    assert state[0] == 10000.0, "First element must be cash balance"

@pytest.mark.asyncio
async def test_data_pipeline_fetch(tickers):
    """
    Integration test verifying data pipeline successfully processes OHLCV columns.
    We mock the yfinance API to avoid live rate limits and JSON decoding errors.
    """
    import pandas as pd
    from unittest.mock import patch
    
    # Create a mock DataFrame that mimics yfinance output
    mock_df = pd.DataFrame({
        'Close': [150.0, 151.0, 152.0],
        'Volume': [1000, 2000, 3000]
    })
    
    with patch('backend.ai.data_pipeline.yf.download', return_value=mock_df):
        pipeline = DataPipeline(tickers)
        df = pipeline.fetch_historical_data(period="5d", interval="1d")
        
        assert not df.empty, "Dataframe should not be empty"
        # Ensure it fetched 'Close' prices
        assert 'Close' in df.columns, "Dataframe is missing 'Close' column"
