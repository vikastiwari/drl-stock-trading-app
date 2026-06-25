import os
from alpaca.trading.client import TradingClient
from alpaca.trading.requests import MarketOrderRequest
from alpaca.trading.enums import OrderSide, TimeInForce

class AlpacaExecutionEngine:
    def __init__(self, api_key: str = None, secret_key: str = None, paper: bool = True):
        self.api_key = api_key or os.environ.get("APCA_API_KEY_ID")
        self.secret_key = secret_key or os.environ.get("APCA_API_SECRET_KEY")
        
        self.enabled = bool(self.api_key and self.secret_key)
        if self.enabled:
            try:
                self.client = TradingClient(self.api_key, self.secret_key, paper=paper)
            except Exception as e:
                print(f"Alpaca Initialization Error: {e}")
                self.client = None
                self.enabled = False
        else:
            self.client = None

    def rebalance_portfolio(self, target_weights: dict, current_prices: dict) -> list[str]:
        """
        Calculates required position changes to reach target_weights, and executes them as fractional market orders.
        Returns a list of execution summary strings.
        """
        if not self.enabled or not self.client:
            return []

        try:
            account = self.client.get_account()
            equity = float(account.equity)
            
            # Fetch current positions
            positions = self.client.get_all_positions()
            current_positions_dollars = {p.symbol: float(p.market_value) for p in positions}
            
            # We also need to consider symbols in target_weights that we don't hold yet
            all_symbols = set(target_weights.keys()).union(set(current_positions_dollars.keys()))
            
            execution_logs = []
            
            for symbol in all_symbols:
                target_weight = target_weights.get(symbol, 0.0)
                
                target_dollars = equity * target_weight
                current_dollars = current_positions_dollars.get(symbol, 0.0)
                
                diff_dollars = target_dollars - current_dollars
                
                if abs(diff_dollars) > 10.0:  # Minimum trade threshold to avoid micro-transactions
                    current_price = current_prices.get(symbol)
                    
                    if not current_price:
                        continue
                        
                    qty_diff = diff_dollars / current_price
                    qty = round(abs(qty_diff), 4) # Fractional 4 decimal places
                    
                    if qty < 0.0001:
                        continue
                        
                    side = OrderSide.BUY if diff_dollars > 0 else OrderSide.SELL
                    
                    req = MarketOrderRequest(
                        symbol=symbol,
                        qty=qty,
                        side=side,
                        time_in_force=TimeInForce.DAY
                    )
                    
                    self.client.submit_order(req)
                    action_str = "BOUGHT" if side == OrderSide.BUY else "SOLD"
                    execution_logs.append(f"[ALPACA] {action_str} {qty} shares of {symbol} @ ~${round(current_price, 2)}")
                    
            return execution_logs
            
        except Exception as e:
            print(f"Alpaca Execution Error: {str(e)}")
            return [f"[ALPACA ERROR] {str(e)}"]
