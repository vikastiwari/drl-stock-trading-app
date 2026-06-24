# Component Structure: DRL Stock Trading App

This document outlines the React component hierarchy and frontend architecture.

## 1. Directory Structure (Frontend)
```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx
│   │   ├── Topbar.jsx
│   │   └── MainLayout.jsx
│   ├── dashboard/
│   │   ├── ChartWidget.jsx
│   │   ├── OrderEntryPanel.jsx
│   │   └── PositionsTable.jsx
│   ├── ai/
│   │   ├── DRLInsightsPanel.jsx
│   │   ├── StateRadarChart.jsx
│   │   └── AutoTradeToggle.jsx
│   └── shared/
│       ├── NeonButton.jsx
│       ├── StatCard.jsx
│       └── LivePriceTicker.jsx
├── store/
│   ├── usePortfolioStore.js (Zustand)
│   ├── useMarketDataStore.js (Zustand)
│   └── useAIStore.js (Zustand)
├── hooks/
│   └── useMarketWebsocket.js
└── api/
    └── restClient.js
```

## 2. Key Components

### `ChartWidget`
- **Responsibility**: Wraps `lightweight-charts` and renders the real-time candlestick data.
- **State**: Listens to `useMarketDataStore` for appending new price ticks.

### `DRLInsightsPanel`
- **Responsibility**: Displays the AI's internal state and recommended action.
- **State**: Consumes data from `useAIStore` which is updated via the `/ws/ai-signals` WebSocket.

### `OrderEntryPanel`
- **Responsibility**: Provides the UI for manual Buy/Sell orders.
- **State**: Submits orders via REST API (`POST /api/orders`), optimistic UI update on `usePortfolioStore`.

### `usePortfolioStore` (Zustand)
- Stores `cashBalance`, `equity`, and `positions`.
- Exposes actions like `fetchPortfolio()` and `updateBalance(newBalance)`.

## 3. Reusability
- We will reuse the glassmorphic container CSS classes, Lucide-React icon patterns, and layout gridding from `ai-studio-dashboard` to ensure a consistent, premium feel without rewriting boilerplate UI code.
