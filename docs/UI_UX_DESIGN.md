# UI/UX Design Strategy: DRL Stock Trading App

This document outlines the design philosophy and component specifications for our premium retail dashboard.

## 1. Design Philosophy & Aesthetic
We are building a 10/10 enterprise-grade portfolio project optimized for the retail trader.
- **Aesthetic**: Premium, glassmorphic dark-mode dashboard with instant context-switching and deep glowing aesthetics.
- **Color Palette**: Deep slate grays (`slate-900`, `slate-800`) form the base, highlighted by vivid cyan and purple glows (`bg-cyan-900/30 blur-[120px]`). 
- **Typography**: Inter (sans-serif) for all UI elements, prioritizing readability and modern tech aesthetics.

## 2. Dynamic Theme Engine
We built a highly robust dynamic theme engine utilizing Tailwind CSS classes, CSS Variables, and Zustand for global state persistence. 
- **Dark Mode**: The default state, utilizing deep slate grays and neon glows.
- **Light Mode**: Clean, high-contrast whitespace for bright environments.
- **AMOLED**: True `#000000` blacks to save battery on OLED displays and provide infinite contrast.
- **Cyberpunk**: High-octane neon yellows, pinks, and cyans for a highly stylized "hacker" aesthetic.
- The theme toggle is accessible directly from the `TopNav` through our `GlobalModal` component, which hot-swaps the root CSS variable classes instantly without page reloads.

## 3. Core Layout & Charting (Graphs)
The application features a responsive, 12-column CSS Grid layout optimized for massive data visualization.
- **TopNav**: The master navigation bar containing the brand logo, Notifications bell, Settings, and Admin profile dropdowns, handled by `GlobalModal`.
- **Main Dashboard**:
  - **Portfolio Chart (TradingView)**: The primary visualization canvas powered by `lightweight-charts`. It renders the real-time PnL (Profit and Loss) curves of the portfolio with hardware-accelerated canvas rendering, maintaining 60FPS even with thousands of data points.
  - **Asset Tear Sheet (Sparklines)**: A multi-chart view displaying individualized allocations and mini-graphs (sparklines) for tracked assets (AAPL, MSFT, GOOGL, AMZN). This uses `recharts` to provide instant visual feedback on individual stock performance.
  
## 4. AI Sentiment Integration (Gemini)
We implemented a multi-agent reasoning architecture powered by **Google Gemini 1.5 Flash**.
- **The News Sentiment Panel**: A dedicated UI widget detailing Gemini's analysis of live Alpaca headlines.
- **Structured Output Parsing**: The backend forces Gemini to return strict Pydantic JSON schemas, which the frontend renders beautifully with progress bars for Fundamental, Technical, and Macro scores.
- **Live Streaming**: The sentiment analysis runs as part of the backend execution loop, and the results are pushed over the Bidirectional WebSocket, causing the frontend UI to gracefully slide in new news items using `Framer Motion` animations.

## 5. Global Modal Architecture
- **State Management**: Zustand handles a centralized `GlobalModal` state, preventing Z-index stacking issues.
- **Alerts**: Real forms to configure portfolio drawdown triggers.

## 6. Micro-Animations & Feedback
- **Chart Updates**: `lightweight-charts` natively handles cubic-bezier easing for crosshair and line updates.
- **Pulse Effects**: Background decorative blobs pulse gently, keeping the UI feeling alive even when the market is slow.
- **List Transitions**: Framer Motion powers `AnimatePresence` on incoming news items so they slide in fluidly.

## 7. The Ultimate Trading Dashboard
- **Auto-Trading Toggle**: A globally accessible switch allowing users to seamlessly transition between Simulation mode and Live Paper Trading Execution.
- **Terminal CLI**: A Bloomberg-style interactive command-line interface (`root@terminal:~#`) at the bottom of the dashboard that accepts text commands and streams real-time trade execution logs (`[ALPACA] BOUGHT 1.25 shares`) directly from the backend via WebSockets.
- **Event-Driven Backtest Overlay**: A beautiful translucent overlay powered by Framer Motion that instantly charts Async historical streaming backtests comparing the AI (PPO) agent against the Buy & Hold S&P 500 benchmark using `recharts`.
- **Multi-Window Sync**: Utilizing the `BroadcastChannel` API to instantly sync websocket streams across detached multi-monitor pop-out windows.
- **Scrollable Layout**: Updated CSS architecture to fully support `overflow-y-auto` while maintaining background blur consistency across variable heights.
