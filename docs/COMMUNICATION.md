# Communication Strategy: DRL Stock Trading App

This document details the data exchange protocols between the Frontend, Backend, and External Data Providers.

## 1. REST API Endpoints (FastAPI)

### Authentication & User Management
- `POST /api/auth/register` - Create a new paper trading account.
- `POST /api/auth/login` - Authenticate and receive JWT.

### Portfolio Management
- `GET /api/portfolio` - Get current cash, equity, and holding positions.
- `GET /api/transactions` - Get history of all paper trades.

### Order Management
- `POST /api/orders` - Submit a manual trade.
  - **Payload**: `{ "symbol": "AAPL", "qty": 10, "side": "BUY", "type": "MARKET" }`
  - **Response**: `{ "status": "FILLED", "fill_price": 150.25, "timestamp": "..." }`

## 2. WebSocket Channels (Real-Time Streams)

### `/ws/market/{symbol}`
- **Purpose**: Streams real-time price updates for a specific ticker to update the Chart and LivePriceTicker.
- **Message Format**: 
  ```json
  {
    "type": "TICK",
    "symbol": "AAPL",
    "price": 150.25,
    "timestamp": 1718000000
  }
  ```

### `/ws/portfolio`
- **Purpose**: Pushes instant updates when a trade is executed (either manually or by the DRL auto-trader).
- **Message Format**:
  ```json
  {
    "type": "PORTFOLIO_UPDATE",
    "cash_balance": 98500.00,
    "equity": 100500.00
  }
  ```

### `/ws/ai-signals`
- **Purpose**: Streams the continuous DRL model evaluation.
- **Message Format**:
  ```json
  {
    "type": "DRL_SIGNAL",
    "symbol": "AAPL",
    "recommended_action": "BUY",
    "confidence": 0.85,
    "state_vector": {"rsi": 30, "macd": -0.5}
  }
  ```

## 3. External API Polling / WebSockets
- The **FastAPI Backend** acts as a proxy. It will open a single secure WebSocket connection to the **Alpaca API** (or Finnhub).
- It will ingest the raw Alpaca stream, normalize it, and broadcast it to our Redis Pub/Sub topic `market.prices`.
- The FastAPI WebSocket routes will subscribe to Redis and forward the data to the connected React clients. This prevents exposing API keys to the frontend and allows us to scale horizontally.
