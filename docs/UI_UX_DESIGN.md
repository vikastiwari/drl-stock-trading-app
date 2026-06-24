# UI/UX Design Strategy: DRL Stock Trading App

This document outlines the design philosophy and screen specifications, heavily optimized for high-frequency WebGL rendering.

## 1. Design Philosophy & Dynamic Theming
We are building a 10/10 enterprise-grade portfolio project. 
- **Aesthetic**: Premium, glassmorphic financial dashboard with instant context-switching.
- **Dynamic Themes**: The user can toggle between three highly curated themes without any rendering delay:
  1. **"Midnight Exchange" (Dark Mode - Default)**: Deep blacks (`#0a0a0a`), slate grays (`#1a1a1a`). Easy on the eyes for extended trading sessions.
  2. **"Institutional Day" (Light Mode)**: Crisp whites (`#ffffff`), off-white backgrounds (`#f4f5f7`), and sharply contrasting text for bright environments.
  3. **"Quant Terminal" (High Contrast)**: Pitch black background (`#000000`) with pure phosphor green text (`#00ff00`) and borders, mimicking old-school Bloomberg or Unix terminals.
- **Semantic Colors**: Regardless of theme, vibrant neons dictate action (Neon Green `#00ff9d` for profit/buy, Neon Red `#ff3366` for loss/sell, Electric Blue `#00b8ff` for AI insights).
- **Typography**: Inter or Roboto Mono for numbers, ensuring tabular lining so prices don't jitter when updating rapidly.

## 2. Core Layout
The application features a single-page dashboard layout.
- **Top Navbar**: Logo, Search bar (for tickers), Total Portfolio Value, Available Cash, and Auto-Trade Toggle.
- **Left Sidebar**: Watchlist (list of active tickers with mini-sparkline charts).
- **Main Content Area**:
  - **Top**: Main Candlestick Chart (**SciChart.js** WebGL Canvas).
  - **Bottom Left**: AI Insights & DRL Signal Panel.
  - **Bottom Center**: Telemetry & Latency Profiling Dashboard.
  - **Bottom Right**: Order Execution Panel (Buy/Sell).
- **Right Sidebar**: Current Positions and Recent Transaction History.

## 3. The "AI Insights" Panel
This panel displays the internal state of the Decision Transformer:
- **Current State**: The normalized state vector (RSI, MACD, etc.) passed to the model.
- **Recommended Action**: A clear signal (e.g., "STRONG BUY", "HOLD", "SELL").
- **Confidence Score**: A visual gauge (0-100%) indicating the LLM-adapted model's confidence.
- **Auto-Trade Toggle**: A master switch that allows the DRL agent to bypass manual confirmation and place trades autonomously via the LMAX Disruptor.

## 4. Hardware Telemetry Dashboard (The "Wow Factor")
To demonstrate "mechanical sympathy", this dedicated panel visualizes the system's exact speed:
- **Tick-to-Trade Latency Histogram**: A live graph showing p50, p95, and p99 latency in *microseconds*.
- **Data Source**: Driven by OpenTelemetry traces captured using CPU `RDTSC` instructions and queried from GreptimeDB.

## 5. Micro-Animations & Feedback
- **Price Ticks**: When a price updates, it flashes briefly (green/red).
- **Order Execution**: A satisfying toast notification when an order is filled.
- **Skeleton Loaders**: Sleek skeleton loaders occupy the layout while the Rust backend establishes the QUIC connection.
