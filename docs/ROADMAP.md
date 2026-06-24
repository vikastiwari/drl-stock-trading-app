# Product Roadmap

## Completed Phases
- [x] Phase 1: Prototype Development (Litestar + React setup, mock SSE stream).
- [x] Phase 2: Professional UI Upgrade (12-column Grid Dashboard, Theme Engine).

## Current Objective: Institutional Backend Upgrade

### Phase 3: Data Integrity & AI Sentiment
- Override standard Python TLS signatures using `curl_cffi` to prevent Yahoo Finance throttling.
- Integrate Alpaca News API for real-time financial headline scraping.
- Implement `google-genai` Structured Outputs (Pydantic) for deterministic sentiment scoring.

### Phase 4: Reinforcement Learning Core
- Migrate from SSE to Litestar Bidirectional WebSockets (`@websocket_listener`).
- Setup `stable-baselines3` dependency tree using the `uv` package manager to avoid pip resolution loops.
- Implement `DRLPortfolioEngine` class to load PyTorch `.zip` models and normalize action spaces via Softmax.

### Phase 5: Production Deployment
- Finalize `react-grid-layout` installation inside WSL.
- Set up Docker containerization for both services.
- Deploy to Vercel (Frontend) and Render/Heroku (Backend).
