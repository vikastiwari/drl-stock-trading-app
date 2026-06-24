import torch
import torch.nn as nn
import torch.nn.functional as F

class MockDRLAgent(nn.Module):
    """
    A mock PyTorch neural network that simulates our trained PPO / FinRL agent.
    It takes our 5-dimensional State Vector and outputs 3 portfolio weights that sum to 1.0.
    """
    def __init__(self, state_dim: int = 5, action_dim: int = 3):
        super(MockDRLAgent, self).__init__()
        # A simple linear layer representing the policy network
        self.fc1 = nn.Linear(state_dim, 64)
        self.fc2 = nn.Linear(64, action_dim)

    def forward(self, state: torch.Tensor) -> torch.Tensor:
        """
        Executes inference.
        Applies softmax to ensure the output weights (Cash, AAPL, MSFT) sum to exactly 1.0 (100%).
        """
        x = F.relu(self.fc1(state))
        logits = self.fc2(x)
        # Softmax over the action dimension ensures sum == 1.0
        weights = F.softmax(logits, dim=-1)
        return weights
