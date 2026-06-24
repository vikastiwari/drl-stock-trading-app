# Component Structure: DRL Stock Trading App

This document outlines the React component hierarchy and Web Worker offloading architecture.

## 1. Directory Structure (Frontend)
```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx
│   │   ├── Topbar.jsx
│   │   └── MainLayout.jsx
│   ├── dashboard/
│   │   ├── SciChartWidget.jsx (WebGL Canvas)
│   │   ├── OrderEntryPanel.jsx
│   │   └── PositionsTable.jsx
│   ├── ai/
│   │   ├── DRLInsightsPanel.jsx
│   │   └── AutoTradeToggle.jsx
│   ├── telemetry/
│   │   └── LatencyHistogramPanel.jsx
│   └── shared/
│       ├── NeonButton.jsx
│       └── LivePriceTicker.jsx
├── workers/
│   └── WebTransportWorker.js (Handles QUIC Datagrams & SharedArrayBuffer)
├── store/
│   ├── usePortfolioStore.js (Zustand)
│   └── useAIStore.js (Zustand)
└── api/
    └── restClient.js
```

## 2. Key Architectural Components

### `WebTransportWorker.js`
- **Responsibility**: Establishes the HTTP/3 QUIC connection to the Rust backend.
- **Logic**: Ingests unreliable datagrams (price ticks), deserializes the binary payload, and writes it directly into a `SharedArrayBuffer`. 
- **Benefit**: Completely unblocks the main React UI thread from network serialization overhead.

### `SciChartWidget`
- **Responsibility**: Wraps `scichart` to render real-time WebAssembly-accelerated candlestick data.
- **Logic**: Hooks into the browser's native `requestAnimationFrame`. On each frame, it reads the latest values from the `SharedArrayBuffer` and paints the WebGL context directly, achieving 60fps under extreme load.

### `LatencyHistogramPanel`
- **Responsibility**: Renders the microsecond latency metrics queried from GreptimeDB.
- **State**: Fetches OpenTelemetry aggregates via reliable WebTransport streams.

### `usePortfolioStore` (Zustand)
- Stores `cashBalance`, `equity`, and `positions`.
- Exposes actions like `fetchPortfolio()` and `updateBalance(newBalance)`. Updates are received via reliable WebTransport multiplexed streams.
