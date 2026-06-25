# UI/UX Design Strategy: DRL Stock Trading App

This document outlines the design philosophy and component specifications for our premium retail dashboard.

## 1. Design Philosophy & Aesthetic
We are building a 10/10 enterprise-grade portfolio project optimized for the retail trader.
- **Aesthetic**: Premium, glassmorphic dark-mode dashboard with instant context-switching and deep glowing aesthetics.
- **Color Palette**: Deep slate grays (`slate-900`, `slate-800`) form the base, highlighted by vivid cyan and purple glows (`bg-cyan-900/30 blur-[120px]`). 
- **Typography**: Inter (sans-serif) for all UI elements, prioritizing readability and modern tech aesthetics.

## 2. Core Layout
The application features a responsive, 12-column CSS Grid layout.
- **TopNav**: The master navigation bar containing the brand logo, Notifications bell, Settings, and Admin profile dropdowns, handled by `GlobalModal`.
- **Main Dashboard**:
  - **Portfolio Chart**: The primary TradingView Lightweight Chart canvas rendering real-time portfolio value.
  - **News Sentiment**: The AI Reasoning Panel, detailing Gemini's analysis of live Alpaca headlines.
  - **Asset Tear Sheet**: A multi-chart view displaying individualized allocations and sparklines for tracked assets (AAPL, MSFT, GOOGL, AMZN).

## 3. Global Modal Architecture
- **State Management**: Zustand handles a centralized `GlobalModal` state, preventing Z-index stacking issues.
- **Themes**: Live theme switching between Dark, Light, AMOLED, and Cyberpunk.
- **Alerts**: Real forms to configure portfolio drawdown triggers.

## 4. Micro-Animations & Feedback
- **Chart Updates**: `lightweight-charts` natively handles cubic-bezier easing for crosshair and line updates.
- **Pulse Effects**: Background decorative blobs pulse gently, keeping the UI feeling alive even when the market is slow.
- **List Transitions**: Framer Motion powers `AnimatePresence` on incoming news items so they slide in fluidly.
