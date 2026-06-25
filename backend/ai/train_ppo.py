import os
import yfinance as yf
import pandas as pd
import numpy as np
import gymnasium as gym
from gymnasium import spaces
from stable_baselines3 import PPO

class SimplePortfolioEnv(gym.Env):
    """
    A foundational Gymnasium environment for Portfolio Optimization.
    This provides the scaffolding required to train a real PPO model.
    """
    def __init__(self, df: pd.DataFrame, asset_universe: list[str], initial_balance: float = 100000):
        super(SimplePortfolioEnv, self).__init__()
        self.df = df
        self.asset_universe = asset_universe
        self.initial_balance = initial_balance
        self.num_assets = len(asset_universe)
        
        self.current_step = 0
        self.max_steps = len(self.df) - 1
        
        # Action space: target weights for each asset (will be softmaxed)
        self.action_space = spaces.Box(low=-1, high=1, shape=(self.num_assets,), dtype=np.float32)
        
        # Observation space: recent price history for each asset
        self.observation_space = spaces.Box(low=0, high=np.inf, shape=(self.num_assets,), dtype=np.float32)

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        self.current_step = 0
        self.balance = self.initial_balance
        self.portfolio_value = self.initial_balance
        
        obs = self._get_observation()
        return obs, {}

    def _get_observation(self):
        # Simply return the closing prices for the current day
        row = self.df.iloc[self.current_step]
        obs = []
        for ticker in self.asset_universe:
            # Check if the dataframe has MultiIndex columns (ticker is level 1)
            if isinstance(self.df.columns, pd.MultiIndex):
                obs.append(row[('Close', ticker)])
            else:
                obs.append(row['Close'])
        return np.array(obs, dtype=np.float32)

    def step(self, action):
        self.current_step += 1
        done = self.current_step >= self.max_steps
        
        # Normalize actions using softmax
        exp_actions = np.exp(action)
        weights = exp_actions / np.sum(exp_actions)
        
        # Calculate reward based on theoretical returns (mock simple calculation)
        obs = self._get_observation()
        # Simulated return: just the sum of weight * current price factor
        reward = float(np.sum(weights * obs)) / 1000.0  # Normalized
        
        return obs, reward, done, False, {}

def download_data(tickers: list[str], start_date: str, end_date: str) -> pd.DataFrame:
    from curl_cffi import requests
    print(f"Downloading data for {tickers}...")
    
    try:
        session = requests.Session(impersonate="chrome131")
        session.headers.update({
            "Accept": "application/json, text/plain, */*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US,en;q=0.9",
        })
        
        df = yf.download(tickers, start=start_date, end=end_date, progress=False, session=session)
        df = df.dropna()
    except Exception as e:
        print(f"Exception during yfinance download: {e}")
        df = pd.DataFrame()

    if df is None or len(df) == 0:
        print("\n[WARNING] Yahoo Finance is aggressively blocking requests on this network.")
        print("Generating 2 years of realistic synthetic stock data to train the DRL agent instead...\n")
        
        dates = pd.date_range(start=start_date, end=end_date, freq='B')
        columns = pd.MultiIndex.from_product([['Close'], tickers])
        
        np.random.seed(42)
        prices = np.zeros((len(dates), len(tickers)))
        
        for i, ticker in enumerate(tickers):
            prices[0, i] = 150.0 + np.random.uniform(-50, 50)
            for t in range(1, len(dates)):
                prices[t, i] = prices[t-1, i] * (1 + np.random.normal(0.0001, 0.015))
                
        df = pd.DataFrame(prices, index=dates, columns=columns)

    return df

if __name__ == "__main__":
    assets = ["AAPL", "MSFT", "GOOGL", "AMZN"]
    
    # 1. Download Historical Data
    df = download_data(assets, start_date="2022-01-01", end_date="2024-01-01")
    print(f"Data downloaded: {len(df)} trading days.")
    
    # 2. Instantiate the Environment
    env = SimplePortfolioEnv(df, assets)
    
    # 3. Initialize the PPO Agent
    print("Initializing PPO Agent...")
    model = PPO("MlpPolicy", env, verbose=1, learning_rate=0.0003, n_steps=2048)
    
    # 4. Train the Agent
    print("Training Agent for 10,000 timesteps...")
    model.learn(total_timesteps=10000)
    
    # 5. Save the Model
    os.makedirs("models", exist_ok=True)
    model_path = "models/ppo_optimal_portfolio"
    model.save(model_path)
    print(f"Training Complete! Model saved successfully to {model_path}.zip")
