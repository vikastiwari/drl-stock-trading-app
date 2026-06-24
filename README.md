# Deep Reinforcement Learning (DRL) Stock Trading App

A world-class, fully autonomous AI trading application designed specifically for **Individual Retail Traders**. 

This application moves beyond basic heuristic algorithms and high-frequency trading (HFT) by deploying state-of-the-art Sequence-Modeling Reinforcement Learning directly into a modern, consumer-facing tech stack.

## Architecture Highlights
- **Intelligence**: Proximal Policy Optimization (PPO) and Decision Transformers using `FinRL-X` and PyTorch.
- **Backend**: `Litestar` (Python) delivering ultra-low serialization overhead with `msgspec`.
- **Streaming**: Unidirectional Server-Sent Events (SSE) for perfectly fluid, HoL-blocking-free portfolio updates.
- **Frontend**: React 18 + Vite with `TradingView Lightweight Charts` rendering 60fps Wasm-free canvas data.
- **Database**: PostgreSQL powered by `Supabase` for native Row Level Security (RLS).

## Documentation
- [Roadmap](docs/ROADMAP.md) - The 4-Phase execution plan to build the product.
- [Architecture Blueprint](docs/ARCHITECTURE.md) - Detailed breakdown of the Litestar/SSE/React architecture with system diagrams.
- [UI/UX Design](docs/UI_UX_DESIGN.md) - Component and styling guidelines for the premium FinTech dashboard.

## Development Setup

### Backend (Python/Litestar)
1. Initialize the virtual environment: `python3 -m venv venv`
2. Activate it: `source venv/bin/activate` (or `venv\Scripts\activate` on Windows)
3. Install dependencies: `pip install -r backend/requirements.txt`
4. Run the API: `litestar run --app backend.app:app`

*(Frontend initialization is currently in progress).*
