# Project Roadmap: DRL Retail Trading App

This document outlines the step-by-step execution plan for the Deep Reinforcement Learning (DRL) Stock Trading Application based on the cutting-edge Litestar architecture.

## Phase 1: Infrastructure and Backend Foundation (Week 1)
- [x] Scaffold React + Vite frontend with TailwindCSS
- [ ] Set up **Supabase (PostgreSQL)** with Row Level Security (RLS) schemas (Users, Portfolios)
- [x] Initialize **Litestar** backend API
- [ ] Integrate database ORM (SQLAlchemy) and Authentication Guard
- [x] Implement Server-Sent Events (**SSE**) for unidirectional streaming

## Phase 2: AI Pipeline and State Vector Engineering (Week 2)
- [ ] Implement asynchronous data ingestion from Alpaca/Yahoo Finance
- [ ] Integrate **FinGPT** (LLM) for financial news sentiment extraction
- [ ] Construct MDP state vectors (Prices + Sentiment + Foundation Models)
- [ ] Train the autonomous DRL portfolio manager using **FinRL-X / PPO**
- [ ] Export PyTorch `.pth` weights for inference

## Phase 3: Inference Engine and Real-Time Data Streaming (Week 3)
- [ ] Utilize Litestar's `on_startup` hook to securely load PyTorch model into memory
- [ ] Execute non-blocking PyTorch inference on background threads
- [ ] Generate target portfolio weights and push via **SSE** to frontend
- [ ] Build virtual execution logic to mock trades based on target weights

## Phase 4: Frontend Application and UX Polish (Week 4)
- [ ] Connect React `EventSource` to Litestar SSE endpoint
- [ ] Integrate **TradingView Lightweight Charts** for 60fps Wasm-free canvas rendering
- [ ] Build AI reasoning dashboard parsing FinGPT sentiment data
- [ ] Apply Framer Motion micro-animations for premium FinTech aesthetics
- [ ] Complete end-to-end testing of the AI pipeline
- [ ] Deploy to Vercel (Frontend) and Render/Heroku (Backend)
