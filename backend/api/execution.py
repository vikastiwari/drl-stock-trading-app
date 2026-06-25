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
        if not self.enabled:
            return ["[SYSTEM] Auto-Trading is DISABLED. Running in Simulation mode."]
        if not self.client:
            return ["[SYSTEM] Auto-Trading is DISABLED. Missing or Invalid API Keys."]
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
            sell_orders = []
            buy_orders = []
            
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
                    
                    if side == OrderSide.SELL:
                        sell_orders.append((req, current_price))
                    else:
                        buy_orders.append((req, current_price))
                        
            # Execute sells first to free up buying power
            import time
            from datetime import datetime
            
            def log_event(msg: str):
                ts = datetime.now().strftime('%H:%M:%S')
                execution_logs.append(f"[{ts}] {msg}")

            for req, price in sell_orders:
                try:
                    self.client.submit_order(req)
                    log_event(f"[ALPACA] SOLD {req.qty} shares of {req.symbol} @ ~${round(price, 2)}")
                except Exception as e:
                    log_event(f"[ALPACA ERROR] {req.symbol} SELL: {str(e)}")
            
            if sell_orders:
                time.sleep(2) # Allow Alpaca matching engine a moment to release buying power
                
            # Execute buys
            for req, price in buy_orders:
                try:
                    self.client.submit_order(req)
                    log_event(f"[ALPACA] BOUGHT {req.qty} shares of {req.symbol} @ ~${round(price, 2)}")
                except Exception as e:
                    # Capture specific insufficient buying power errors neatly
                    err_msg = str(e)
                    if "insufficient buying power" in err_msg:
                        log_event(f"[ALPACA WARNING] Skipping {req.symbol} BUY: Pending SELL orders have not settled.")
                    else:
                        log_event(f"[ALPACA ERROR] {req.symbol} BUY: {err_msg}")
                    
            return execution_logs
            
        except Exception as e:
            print(f"Alpaca Execution Error: {str(e)}")
            return [f"[ALPACA ERROR] {str(e)}"]
