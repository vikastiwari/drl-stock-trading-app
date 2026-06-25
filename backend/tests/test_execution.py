import pytest
from unittest.mock import MagicMock
from backend.api.execution import AlpacaExecutionEngine

def test_engine_initialization_no_keys():
    import os
    if "APCA_API_KEY_ID" in os.environ: del os.environ["APCA_API_KEY_ID"]
    if "APCA_API_SECRET_KEY" in os.environ: del os.environ["APCA_API_SECRET_KEY"]
    engine = AlpacaExecutionEngine(api_key=None, secret_key=None)
    assert engine.enabled is False
    assert engine.client is None

def test_engine_initialization_with_keys(mock_alpaca_client):
    engine = AlpacaExecutionEngine(api_key="test", secret_key="test")
    assert engine.enabled is True
    assert engine.client is not None

def test_rebalance_disabled(mock_alpaca_client):
    engine = AlpacaExecutionEngine(api_key="test", secret_key="test")
    engine.enabled = False
    
    weights = {"AAPL": 0.5, "MSFT": 0.5}
    prices = {"AAPL": 150.0, "MSFT": 250.0}
    
    logs = engine.rebalance_portfolio(weights, prices)
    assert len(logs) == 1
    assert "DISABLED" in logs[0]

def test_rebalance_execution(mock_alpaca_client):
    engine = AlpacaExecutionEngine(api_key="test", secret_key="test")
    engine.enabled = True
    
    # Mock positions
    mock_position1 = MagicMock()
    mock_position1.symbol = "AAPL"
    mock_position1.market_value = "1000.00"
    
    mock_position2 = MagicMock()
    mock_position2.symbol = "MSFT"
    mock_position2.market_value = "1000.00"
    
    engine.client.get_all_positions.return_value = [mock_position1, mock_position2]
    
    # Mock account
    mock_account = MagicMock()
    mock_account.equity = "5000.00"
    engine.client.get_account.return_value = mock_account
    
    # Target: AAPL 50% ($2500), MSFT 50% ($2500)
    # Current: AAPL $1000, MSFT $1000
    # Needs to buy $1500 of both.
    weights = {"AAPL": 0.5, "MSFT": 0.5}
    prices = {"AAPL": 150.0, "MSFT": 250.0}
    
    logs = engine.rebalance_portfolio(weights, prices)
    assert len(logs) == 2
    logs_joined = " ".join(logs)
    assert "BOUGHT 10.0 shares of AAPL" in logs_joined
    assert "BOUGHT 6.0 shares of MSFT" in logs_joined
