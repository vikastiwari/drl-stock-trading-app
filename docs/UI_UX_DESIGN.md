# UI/UX Design Strategy: DRL Stock Trading App

This document outlines the design philosophy and screen specifications for the application.

## 1. Design Philosophy
We are building a 10/10 portfolio project. The design must reflect the sophistication of the underlying DRL engine.
- **Aesthetic**: Premium, dark-themed, glassmorphic financial dashboard.
- **Colors**: Deep blacks (`#0a0a0a`), slate grays (`#1a1a1a`), vibrant neons for accents (Neon Green `#00ff9d` for profit/buy, Neon Red `#ff3366` for loss/sell, Electric Blue `#00b8ff` for AI insights).
- **Typography**: Inter or Roboto Mono for numbers, ensuring tabular lining so prices don't jitter when updating rapidly.

## 2. Core Layout
The application features a single-page dashboard layout.
- **Top Navbar**: Logo, Search bar (for tickers), Total Portfolio Value, Available Cash, and Auto-Trade Toggle.
- **Left Sidebar**: Watchlist (list of active tickers with mini-sparkline charts).
- **Main Content Area**:
  - **Top**: Main Candlestick Chart (Lightweight Charts).
  - **Bottom Left**: AI Insights & DRL Signal Panel.
  - **Bottom Right**: Order Execution Panel (Buy/Sell).
- **Right Sidebar**: Current Positions and Recent Transaction History.

## 3. The "AI Insights" Panel
This is the unique selling point of the app. It will display:
- **Current State**: The normalized state vector (RSI, MACD, etc.) that the DRL model is currently "seeing".
- **Recommended Action**: A clear signal (e.g., "STRONG BUY", "HOLD", "SELL").
- **Confidence Score**: A visual gauge (0-100%) indicating the model's confidence in the action.
- **Auto-Trade Toggle**: A master switch that allows the DRL agent to bypass manual confirmation and place trades autonomously.

## 4. Micro-Animations & Feedback
- **Price Ticks**: When a price updates, it should flash briefly (green if higher than previous, red if lower).
- **Order Execution**: A satisfying toast notification and sound effect (optional) when an order is filled.
- **Skeleton Loaders**: While the backend is loading historical data, sleek skeleton loaders will occupy the layout.
