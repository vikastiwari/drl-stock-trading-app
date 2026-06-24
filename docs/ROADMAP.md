# Project Roadmap: DRL Stock Trading App (Enterprise Grade)

This document outlines the step-by-step execution plan for the Deep Reinforcement Learning (DRL) Stock Trading Application, prioritizing institutional-grade performance.

## Phase 1: Core Systems & IPC Backbone (Week 1)
- **Goal**: Establish the zero-latency foundation using Rust and Aeron.
- **Tasks**:
  - Scaffold the Rust data ingestion service.
  - Implement the **LMAX Disruptor** pattern for the central ring buffer.
  - Integrate **Aeron** for IPC shared memory transport.
  - Deploy **GreptimeDB** via Docker Compose and establish the OpenTelemetry pipeline.

## Phase 2: High-Frequency Transport & WebAssembly UI (Week 2)
- **Goal**: Connect the Rust backend to the React frontend using WebTransport and WebGL.
- **Tasks**:
  - Implement an HTTP/3 WebTransport server in Rust (e.g., using `wtransport` or `quinn`).
  - Scaffold the React + Vite frontend.
  - Implement a dedicated Web Worker to deserialize WebTransport datagrams into a `SharedArrayBuffer`.
  - Integrate **SciChart.js** to render 60fps charts reading directly from the SharedArrayBuffer.
  - Build the Telemetry Dashboard utilizing hardware CPU timestamp counters (`RDTSC`).

## Phase 3: Generative DRL Agent Training (Week 3)
- **Goal**: Train the Decision Transformer using FinRL and LoRA.
- **Tasks**:
  - Source historical OHLCV data and extract technical indicators.
  - Configure a GPT-2 model using Hugging Face and apply Low-Rank Adaptation (LoRA).
  - Train the Decision Transformer (FinRL-DT) using offline trajectories.
  - Implement the **Differential Sharpe Ratio** reward function to penalize drawdowns.
  - Export the trained model to ONNX.

## Phase 4: Triton Inference Integration & Polish (Week 4)
- **Goal**: Achieve microsecond inference and complete the auto-trading loop.
- **Tasks**:
  - Deploy the **NVIDIA Triton Inference Server**.
  - Compile the ONNX model to a **TensorRT** engine.
  - Connect the Rust LMAX Disruptor directly to Triton using CUDA shared memory or gRPC for ultra-low latency inference.
  - Finalize the React UI components: AI Insights Panel, Portfolio Manager, and Auto-Trade Toggle.
  - Write mechanical sympathy tests and record the final portfolio demonstration.
