import pytest
import torch
from backend.ai.model import MockDRLAgent

def test_mock_drl_agent_output_sum():
    """
    Tests that the Mock DRL Agent successfully receives a 5D state array 
    and outputs exactly 3 portfolio weights (Cash, AAPL, MSFT) that sum to 1.0 (100%).
    """
    # Create a dummy state vector representing [Cash, Price_AAPL, Price_MSFT, Sentiment_AAPL, Sentiment_MSFT]
    dummy_state = torch.tensor([10000.0, 150.0, 300.0, 0.5, -0.2], dtype=torch.float32)
    
    # Initialize the mock agent
    agent = MockDRLAgent()
    agent.eval()
    
    # Run inference
    with torch.no_grad():
        weights = agent(dummy_state)
        
    assert weights.shape == (3,), f"Expected 3 portfolio weights, got {weights.shape}"
    
    # Check that weights sum to exactly 1.0 (allowing for minor floating point rounding errors)
    weight_sum = weights.sum().item()
    assert pytest.approx(weight_sum, 0.0001) == 1.0, f"Weights must sum to 1.0, but got {weight_sum}"
    
    # Check that all weights are positive (no short selling in this basic retail account)
    for weight in weights:
        assert weight.item() >= 0.0, f"Weight cannot be negative, got {weight.item()}"
