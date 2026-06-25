import numpy as np
import pandas as pd
try:
    import gymnasium as gym
    from gymnasium import spaces
    HAS_GYM = True
except ImportError:
    HAS_GYM = False

class InstitutionalPortfolioEnv:
    """
    A custom Gym Environment for Institutional Portfolio Optimization.
    Incorporates Sharpe Ratio rewards, transaction penalties, and drawdown penalties.
    """
    def __init__(self, 
                 df: pd.DataFrame, 
                 asset_universe: list[str], 
                 initial_capital: float = 100000.0, 
                 transaction_fee_percent: float = 0.001):
        
        self.df = df
        self.asset_universe = asset_universe
        self.initial_capital = initial_capital
        self.transaction_fee_percent = transaction_fee_percent
        
        self.num_assets = len(asset_universe)
        
        # State space: [Cash balance, Portfolio Value, weights (num_assets)]
        # + [Prices (num_assets), MACD (num_assets), RSI (num_assets), BB (num_assets), Sentiment (num_assets)]
        # This is a simplified representation for demonstration.
        state_dim = 2 + self.num_assets + (self.num_assets * 5)
        
        if HAS_GYM:
            # Action space is a continuous vector representing the target portfolio weights.
            # We use Softmax later to ensure they sum to 1.0
            self.action_space = spaces.Box(low=-1, high=1, shape=(self.num_assets,), dtype=np.float32)
            self.observation_space = spaces.Box(low=-np.inf, high=np.inf, shape=(state_dim,), dtype=np.float32)
            
        self.current_step = 0
        self.portfolio_value = self.initial_capital
        self.current_weights = np.zeros(self.num_assets)
        self.portfolio_history = []
        self.peak_portfolio_value = self.initial_capital

    def reset(self, seed=None, options=None):
        self.current_step = 0
        self.portfolio_value = self.initial_capital
        self.current_weights = np.zeros(self.num_assets)
        self.portfolio_history = [self.portfolio_value]
        self.peak_portfolio_value = self.initial_capital
        
        return self._get_observation(), {}

    def step(self, action: np.ndarray):
        """
        Executes a portfolio reallocation.
        Calculates risk-adjusted reward based on Sharpe Ratio and penalizes turnover.
        """
        # 1. Action Normalization (Softmax)
        exp_actions = np.exp(action)
        target_weights = exp_actions / np.sum(exp_actions)
        
        # 2. Turnover Penalty (Transaction Costs)
        # Calculate how much the weights changed to approximate trading volume
        turnover = np.sum(np.abs(target_weights - self.current_weights))
        transaction_cost = turnover * self.portfolio_value * self.transaction_fee_percent
        
        # Update weights
        self.current_weights = target_weights
        
        # 3. Simulate Market Step
        self.current_step += 1
        done = self.current_step >= len(self.df) - 1
        
        if not done:
            # Simple simulation: assume price changes apply to current weights
            # In a real env, you would calculate exact shares and update prices
            step_return = np.random.normal(0.0005, 0.01) # Mock market return for step
            
            # Update Portfolio Value
            self.portfolio_value = (self.portfolio_value - transaction_cost) * (1 + step_return)
            self.portfolio_history.append(self.portfolio_value)
            
            # Update Peak Value for Drawdown calculation
            if self.portfolio_value > self.peak_portfolio_value:
                self.peak_portfolio_value = self.portfolio_value
                
            drawdown = (self.peak_portfolio_value - self.portfolio_value) / self.peak_portfolio_value
            
            # 4. Reward Engineering (Risk Aversion)
            returns = np.diff(self.portfolio_history) / self.portfolio_history[:-1]
            if len(returns) > 5:
                # Sharpe Ratio proxy
                volatility = np.std(returns) + 1e-6
                sharpe_reward = np.mean(returns) / volatility
            else:
                sharpe_reward = step_return
                
            # Combine components into final reward
            reward = sharpe_reward
            
            # Heavy penalty for significant drawdown (>5%)
            if drawdown > 0.05:
                reward -= (drawdown * 10) 
                
        else:
            reward = 0.0

        return self._get_observation(), reward, done, False, {}

    def _get_observation(self) -> np.ndarray:
        """
        Constructs the state vector incorporating advanced technicals and sentiment.
        """
        obs = [self.portfolio_value, self.initial_capital]
        obs.extend(self.current_weights.tolist())
        
        # Mocking technical indicators for the current step
        prices = np.random.uniform(100, 300, self.num_assets).tolist()
        macd = np.random.uniform(-2, 2, self.num_assets).tolist()
        rsi = np.random.uniform(30, 70, self.num_assets).tolist()
        bb = np.random.uniform(0.8, 1.2, self.num_assets).tolist()
        sentiment = np.random.uniform(-1.0, 1.0, self.num_assets).tolist()
        
        obs.extend(prices)
        obs.extend(macd)
        obs.extend(rsi)
        obs.extend(bb)
        obs.extend(sentiment)
        
        return np.array(obs, dtype=np.float32)

if not HAS_GYM:
    print("Gymnasium not installed. InstitutionalPortfolioEnv serves as architectural reference.")
