# Project Roadmap: DRL Stock Trading App

This document outlines the step-by-step execution plan for the Deep Reinforcement Learning (DRL) Stock Trading Application.

## Phase 1: Foundation and Scaffold (Week 1)
- **Goal**: Initialize the project structure, establish CI/CD, and set up the fundamental backend and frontend skeletons.
- **Tasks**:
  - Initialize Git repository `drl-stock-trading-app`.
  - Scaffold React + Vite frontend with TailwindCSS.
  - Scaffold FastAPI backend with PostgreSQL and Redis.
  - Set up Docker Compose for local development (Postgres, Redis, Backend, Frontend).
  - Port over base UI components from `ai-studio-dashboard` to maintain a 10/10 visual aesthetic.

## Phase 2: Core Market Data & Paper Trading Engine (Week 2)
- **Goal**: Connect to live market data and implement virtual wallet capabilities.
- **Tasks**:
  - Integrate Alpaca Paper Trading API (or Finnhub) for real-time WebSocket market data.
  - Implement a `MarketDataService` in FastAPI to broadcast prices to the frontend via WebSockets.
  - Implement `OrderService` for virtual order matching (Buy/Sell/Hold) with latency simulation.
  - Create the Database Schema: `Users`, `Portfolios`, `Transactions`, `Positions`.
  - Frontend: Build the main Dashboard with a live charting library (e.g., Lightweight Charts).

## Phase 3: DRL Agent Integration (Week 3)
- **Goal**: Introduce the AI "Brain" using PyTorch and FinRL.
- **Tasks**:
  - Create a Python training pipeline using `yfinance` for historical OHLCV data.
  - Train an initial A2C or PPO agent using the FinRL framework.
  - Export the trained model to ONNX or load it via PyTorch in a FastAPI background worker.
  - Implement the `DRLSignalService` to evaluate live market data against the model and generate real-time trade signals.
  - Frontend: Create the "AI Insights" panel, displaying the agent's confidence scores and recommended actions.

## Phase 4: Auto-Trading & Polish (Week 4)
- **Goal**: Close the loop by allowing the DRL agent to trade autonomously, and finalize the UI/UX.
- **Tasks**:
  - Implement the "Auto-Trade" toggle. When active, the system automatically executes the DRL signals against the virtual wallet.
  - Add real-time PnL (Profit and Loss) graphs and trade history tables.
  - Final UI Polish: Dark mode, glassmorphism, micro-animations for trade executions.
  - Write comprehensive unit/integration tests (pytest, vitest).
  - Finalize README.md and record a video demonstration for the portfolio.
