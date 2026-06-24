# Communication Strategy: DRL Stock Trading App

This document details the ultra-low-latency data exchange protocols between the Frontend, the Rust Backend, and Triton.

## 1. Client-Server Transport (WebTransport HTTP/3)
We utilize WebTransport over QUIC to completely eliminate TCP Head-of-Line blocking.

### Unreliable Datagrams (The Hot Path)
- **Stream**: Market Ticks & Order Book Updates.
- **Protocol**: QUIC Unreliable Datagrams.
- **Payload**: Binary serialized (e.g., Protobuf or custom C-struct packing).
- **Behavior**: If a packet drops, it is ignored. The frontend only cares about the absolute latest price. The Web Worker processes these directly into a `SharedArrayBuffer`.

### Reliable Multiplexed Streams (State Management)
- **Stream**: Portfolio Balances, Trade Execution Confirmations, Authentication.
- **Protocol**: QUIC Reliable Streams (or gRPC-Web fallback).
- **Payload**: JSON or Protobuf.
- **Behavior**: Guaranteed, in-order delivery to ensure the virtual wallet and positions table never desynchronize.

## 2. Internal Inter-Process Communication (IPC)

### Rust Ingestor <-> LMAX Disruptor
- Market data ingested from external APIs is placed onto the Disruptor ring buffer using lock-free, atomic operations.

### LMAX Disruptor <-> Triton Inference Server
- **Transport**: CUDA Shared Memory extensions (preferred) or highly optimized gRPC.
- **Logic**: The Rust backend batches incoming market vectors and writes them directly to GPU memory, signaling Triton to execute the TensorRT Decision Transformer model, yielding sub-millisecond inference times.

### LMAX Disruptor <-> GreptimeDB
- **Transport**: Asynchronous batch writes.
- **Logic**: A background thread consumes OpenTelemetry `RDTSC` timestamps from the Disruptor and writes them directly to GreptimeDB to feed the frontend's Telemetry Dashboard.
