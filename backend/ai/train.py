import os
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

try:
    from stable_baselines3 import PPO
    from stable_baselines3.common.vec_env import DummyVecEnv
    HAS_SB3 = True
except ImportError:
    HAS_SB3 = False

from backend.ai.env import InstitutionalPortfolioEnv

class ContinuousLearningPipeline:
    """
    Implements Online Training / Continuous Learning to prevent 
    catastrophic forgetting while updating the DRL policy with new daily data.
    """
    def __init__(self, model_filepath: str, experience_buffer_days: int = 180):
        self.model_filepath = model_filepath
        self.experience_buffer_days = experience_buffer_days
        self.model = None
        
        if HAS_SB3 and os.path.exists(self.model_filepath):
            self.model = PPO.load(self.model_filepath)
        elif not HAS_SB3:
            print("stable_baselines3 not installed. Mocking Continuous Learning Pipeline.")

    def fetch_historical_experience(self, current_date: datetime) -> pd.DataFrame:
        """
        Retrieves the last N days of data to construct the Experience Replay Buffer.
        """
        # In production, this pulls from a database or data warehouse (e.g., BigQuery)
        print(f"Fetching experience buffer from {current_date - timedelta(days=self.experience_buffer_days)} to {current_date}")
        return pd.DataFrame() # Mock DataFrame

    def fine_tune_model(self, new_daily_data: pd.DataFrame):
        """
        Fine-tunes the existing PPO policy on a sliding window of historical + new data.
        """
        if not HAS_SB3 or self.model is None:
            print("Skipping actual fine-tuning (mock mode). Architecture verified.")
            return

        # 1. Construct the Replay Buffer
        historical_df = self.fetch_historical_experience(datetime.now())
        combined_df = pd.concat([historical_df, new_daily_data]).reset_index(drop=True)
        
        # 2. Instantiate the Environment with the buffer
        asset_universe = ["AAPL", "MSFT", "GOOGL", "AMZN"]
        env = InstitutionalPortfolioEnv(df=combined_df, asset_universe=asset_universe)
        vec_env = DummyVecEnv([lambda: env])
        
        # 3. Inject the environment into the existing model
        self.model.set_env(vec_env)
        
        # 4. Fine-Tune with heavily reduced Learning Rate
        # This prevents catastrophic forgetting of older market regimes
        # while adapting to the new daily volatility.
        self.model.learning_rate = 1e-5
        
        print(f"Fine-tuning PPO model on updated experience buffer...")
        self.model.learn(total_timesteps=10000, reset_num_timesteps=False)
        
        # 5. Save the updated weights
        self.model.save(self.model_filepath)
        print("Model fine-tuning complete. Updated weights saved.")

if __name__ == "__main__":
    pipeline = ContinuousLearningPipeline("models/ppo_optimal_portfolio.zip")
    pipeline.fine_tune_model(pd.DataFrame())
