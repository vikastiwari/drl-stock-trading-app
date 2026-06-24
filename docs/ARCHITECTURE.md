# System Architecture: DRL Stock Trading App

This application is built exclusively for Retail AI Trading, utilizing state-of-the-art Python and React ecosystems.

## Core Components

### 1. Python Litestar Backend
- **Framework**: `Litestar` (Chosen for `msgspec` JSON serialization speed and enterprise plugins).
- **Responsibility**: In-memory PyTorch inference, Alpaca/Yahoo data ingestion, and orchestrating Server-Sent Events (SSE).
- **Streaming**: Unidirectional SSE (`/api/stream/portfolio`) pushes portfolio weights and prices to the client without TCP Head-of-Line blocking.

### 2. DRL & AI Engine
- **Framework**: `FinRL-X` and `PyTorch`
- **Agent**: Proximal Policy Optimization (PPO) or Elastic Decision Transformers (EDT).
- **State Vector**: Combines technical indicators, Zero-Shot Time-Series Foundation Models (e.g. TimesFM), and FinGPT financial news sentiment.
- **Inference**: Loaded globally in Litestar's `on_startup` hook.

### 3. PostgreSQL Database (Supabase)
- **Role**: Relational store for users, portfolio history, and raw OHLCV ticks.
- **Features**: Row Level Security (RLS) and built-in authentication ensuring tenant isolation.

### 4. React Vite Frontend
- **Framework**: React 18, Vite, TailwindCSS, Framer Motion.
- **Charting**: `TradingView Lightweight Charts` utilizing HTML5 Canvas for stutter-free 60fps rendering of large datasets.
- **Data Fetching**: Native `EventSource` API connecting to Litestar's SSE endpoints.

## System Diagram

```mermaid
graph TD
    subgraph Frontend [React + Vite SPA]
        UI[Glassmorphic UI]
        Chart[TradingView Charts]
    end

    subgraph Streaming [Litestar API Gateway]
        SSE[Server-Sent Events]
        REST[Litestar REST Router]
    end

    subgraph Data [Supabase]
        PG[(PostgreSQL + RLS)]
        Auth[Auth & JWT]
    end

    subgraph Intelligence [AI Inference Layer]
        Model[PyTorch Model]
        FinRL[FinRL-X Engine]
    end

    UI -->|HTTPS Requests| REST
    REST -->|Auth/Data| Auth
    REST -->|Read/Write| PG
    UI <--|Unidirectional SSE Stream| SSE
    SSE <--|Portfolio Weights| Model
    REST -->|Sync State| FinRL
```
