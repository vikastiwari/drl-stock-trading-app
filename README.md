# Deep Reinforcement Learning (DRL) Stock Trading App

> **Status: Completed 🚀**
> A world-class, fully autonomous AI trading application designed specifically for **Individual Retail Traders**. 

This application moves beyond basic heuristic algorithms and high-frequency trading (HFT) by deploying state-of-the-art Sequence-Modeling Reinforcement Learning directly into a modern, consumer-facing tech stack.

## Architecture Highlights
- **Intelligence**: Proximal Policy Optimization (PPO) using `FinRL-X`, and `Gemini 1.5 Flash` for real-time business query assistance.
- **Backend**: `Litestar` (Python) delivering ultra-low serialization overhead with `msgspec`.
- **Streaming**: Unidirectional Server-Sent Events (SSE) for perfectly fluid, HoL-blocking-free portfolio updates.
- **Frontend**: React 18 + Vite with `TradingView Lightweight Charts` rendering 60fps Wasm-free canvas data.
- **Database**: PostgreSQL powered by `Supabase` for native Row Level Security (RLS).

## Documentation
- [Roadmap](docs/ROADMAP.md) - The 5-Phase execution plan to build the product.
- [Architecture Blueprint](docs/ARCHITECTURE.md) - Detailed breakdown of the Litestar/SSE/React architecture with system diagrams.
- [UI/UX Design](docs/UI_UX_DESIGN.md) - Component and styling guidelines for the premium FinTech dashboard.

## Development Setup

### Backend (Python/Litestar)
1. Initialize the virtual environment: `python3 -m venv venv`
2. Activate it: `source venv/bin/activate` (or `venv\Scripts\activate` on Windows)
3. Install dependencies: `pip install -r backend/requirements.txt`
4. Set your Google API Key: `export GOOGLE_API_KEY="your_api_key_here"`
5. Run the API: `litestar run --app backend.app:app`

### Frontend (React/Vite)
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

## Automated Testing

### Backend Unit Tests (Pytest)
1. Ensure the virtual environment is active.
2. Run `pytest --cov=backend tests/` to execute core business logic tests and generate a coverage report.

### Frontend Component Tests (Vitest)
1. Navigate to the frontend directory.
2. Run `npm run test` to execute React component mounting and state initialization tests.
