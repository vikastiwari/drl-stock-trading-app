# Component Structure: DRL Stock Trading App

This document outlines the React component hierarchy and Litestar backend structure.

## 1. Directory Structure

### Frontend (`frontend/src/`)
```
src/
├── components/
│   ├── TopNav.tsx           # Glassmorphic nav with Gemini Search
│   ├── PortfolioChart.tsx   # TradingView Lightweight Charts canvas
│   └── AIReasoningPanel.tsx # Framer-Motion animated AI insights
├── App.tsx                  # Main layout and SSE orchestrator
└── main.tsx                 # React entry point
```

### Backend (`backend/`)
```
backend/
├── ai/
│   ├── model.py             # PyTorch MockDRLAgent definition
│   ├── state_vector.py      # Technical indicator normalization
│   └── data_pipeline.py     # YFinance ingestion
├── api/
│   └── chat.py              # Gemini 1.5 Lite REST route
└── app.py                   # Litestar App, SSE endpoint, and Lifecycle
```

## 2. Key Architectural Components

### `backend/app.py`
- **Responsibility**: Houses the Litestar application lifecycle and the `EventSource` generator.
- **Logic**: Loads the PyTorch model on startup. Implements a `while True` loop that feeds mock or real data into the model, generating state predictions that are JSON-serialized and yielded over SSE.

### `TopNav.tsx` (Frontend)
- **Responsibility**: Master navigation and AI Assistant integration.
- **Logic**: Contains the search bar which triggers a `fetch` to `/api/chat`. The response from Gemini 1.5 Lite is animated into a floating glass panel using `framer-motion`.

### `PortfolioChart.tsx` (Frontend)
- **Responsibility**: Renders high-performance financial charts.
- **Logic**: Uses TradingView's `lightweight-charts` to draw perfectly fluid HTML5 canvas series. It reacts to incoming SSE data from `App.tsx` and updates the series efficiently.

### `AIReasoningPanel.tsx` (Frontend)
- **Responsibility**: Visualizes the internal state and target weights of the FinRL model.
- **Logic**: Maps the target weight dictionary into fluid, color-coded progress bars using Tailwind and Framer Motion layout transitions.
