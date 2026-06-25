# Component Structure: DRL Stock Trading App

This document outlines the React component hierarchy and Litestar backend structure.

## 1. Directory Structure

### Frontend (`frontend/src/`)
```
src/
├── components/
│   ├── TopNav.tsx           # Glassmorphic nav with Global Modals
│   ├── DashboardLayout.tsx  # Dynamic grid layout supporting Tear Sheets
│   ├── GlobalModal.tsx      # Zustand-controlled UI popups (Settings, Alerts)
│   ├── PortfolioChart.tsx   # TradingView Lightweight Charts canvas
│   └── NewsSentimentWidget.tsx # Live rendering of Gemini Sentiment
├── App.tsx                  # Main layout and WebSocket orchestrator
├── store.tsx                # Zustand Global State
└── main.tsx                 # React entry point
```

### Backend (`backend/`)
```
backend/
├── ai/
│   ├── inference.py         # DRLPortfolioEngine definition
│   └── train_ppo.py         # Training script for PPO Model
├── api/
│   ├── execution.py         # AlpacaExecutionEngine (Paper/Live Trading)
│   ├── market_data.py       # ResilientMarketDataFetcher (yfinance multi-threading)
│   └── sentiment.py         # AlternativeSentimentEngine (Gemini/Alpaca)
└── app.py                   # Litestar App, WebSocket listener, and Lifecycle
```

## 2. Key Architectural Components

### `backend/app.py`
- **Responsibility**: Houses the Litestar application lifecycle and the `@websocket_listener`.
- **Logic**: Implements a `while True` loop that feeds data into the model, triggering the LLM sentiment extraction, generating state predictions, executing real trades via Alpaca, and pushing execution logs over WebSocket.

### `DashboardLayout.tsx` (Frontend)
- **Responsibility**: 12-column responsive CSS grid organizing multiple visual components.
- **Logic**: Handles maximized/fullscreen states for widgets, and renders the Asset Tear Sheet (sparklines) and Sentiment panels.

### `NewsSentimentWidget.tsx` (Frontend)
- **Responsibility**: Displays live sentiment score and AI reasoning.
- **Logic**: Receives a `payload` prop from the main WebSocket loop and gracefully animates new headlines into view.

### `GlobalModal.tsx` (Frontend)
- **Responsibility**: Centralized popup UI.
- **Logic**: Connected to Zustand store, renders real forms for Trading Preferences, System Alerts, and Profile management without duplicating overlay code.
