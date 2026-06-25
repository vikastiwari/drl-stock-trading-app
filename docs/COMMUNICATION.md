# Communication Strategy: DRL Stock Trading App

This document details the real-time data exchange protocols between the React Frontend, the Litestar Backend, and the PyTorch Engine.

## 1. Client-Server Transport (Bidirectional WebSockets)
We utilize **Bidirectional WebSockets** to provide a fluid, real-time stream of portfolio data to the React client and allow for real-time control (e.g., toggling Auto-Trading).

### Bidirectional Data Streaming (The Hot Path)
- **Endpoint**: `/ws/terminal-feed`
- **Protocol**: WebSocket (WSS in production).
- **Payload**: JSON format.
- **Behavior**: The backend maintains an open connection, listening for configuration changes (like `autoTradeEnabled`), and continuously pushes target weights, portfolio balances, sentiment scores, and execution logs. The React client listens via native WebSocket APIs, triggering state updates without polling overhead.

### Business Queries & LLM Interaction
- **Endpoint**: `/api/chat`
- **Protocol**: Standard REST `POST`.
- **Payload**: JSON.
- **Behavior**: The frontend sends queries to the Gemini 1.5 Lite API. The Litestar backend safely wraps this interaction, maintaining the API Key securely on the server.

## 2. Internal Inter-Process Communication (IPC)

### Litestar <-> PyTorch Inference Engine
- **Strategy**: In-memory execution.
- **Logic**: The PyTorch model is loaded globally into Litestar's `app.state` during the `on_startup` hook.
- **Non-blocking Execution**: To prevent the CPU-bound matrix multiplication from blocking Litestar's async event loop, inferences are dispatched to background threads using `asyncio.to_thread()`.

### Python <-> Database (Supabase)
- **Transport**: PostgreSQL Wire Protocol over TCP.
- **Logic**: ORM (SQLAlchemy) maps Python classes to the Supabase tables, allowing authenticated reads and writes.
