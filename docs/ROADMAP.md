# Project Roadmap: DRL Retail Trading App

This document outlines the step-by-step execution plan for the Deep Reinforcement Learning (DRL) Stock Trading Application based on the cutting-edge Litestar architecture.

## Phase 1: Infrastructure and Backend Foundation (Week 1)
- [x] Scaffold React + Vite frontend with TailwindCSS
- [x] Set up **Supabase (PostgreSQL)** with Row Level Security (RLS) schemas (Users, Portfolios)
- [x] Initialize **Litestar** backend API
- [x] Integrate database ORM (SQLAlchemy) and Authentication Guard
- [x] Implement Server-Sent Events (**SSE**) for unidirectional streaming

## Phase 2: AI Pipeline and State Vector Engineering (Week 2)
- [x] Implement asynchronous data ingestion from Alpaca/Yahoo Finance
- [x] Integrate **FinGPT** (LLM) for financial news sentiment extraction
- [x] Construct MDP state vectors (Prices + Sentiment + Foundation Models)
- [x] Train the autonomous DRL portfolio manager using **FinRL-X / PPO**
- [x] Export PyTorch `.pth` weights for inference

## Phase 3: Inference Engine and Real-Time Data Streaming (Week 3)
- [x] Utilize Litestar's `on_startup` hook to securely load PyTorch model into memory
- [x] Execute non-blocking PyTorch inference on background threads
- [x] Generate target portfolio weights and push via **SSE** to frontend
- [x] Build virtual execution logic to mock trades based on target weights

## Phase 4: Frontend Application and UX Polish (Week 4)
- [x] Connect React `EventSource` to Litestar SSE endpoint
- [x] Integrate **TradingView Lightweight Charts** for 60fps Wasm-free canvas rendering
- [x] Build AI reasoning dashboard parsing FinGPT sentiment data
- [x] Apply Framer Motion micro-animations for premium FinTech aesthetics
- [x] Complete end-to-end testing of the AI pipeline

## Phase 5: Advanced UX and AI Assistant (Week 5)
- [ ] Build TopNav component with real-time Gemini search integration
- [ ] Configure `google-genai` in Litestar with a smart system prompt
- [ ] Implement System Alerts and Notifications UI
- [ ] Add Application Settings and Theme Toggles
- [ ] Build Admin Profile Menu
- [ ] Deploy to Vercel (Frontend) and Render/Heroku (Backend)
