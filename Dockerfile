# ==========================================
# STAGE 1: Frontend Build
# ==========================================
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .
RUN npm run build

# ==========================================
# STAGE 2: Backend & Production Server
# ==========================================
FROM python:3.12-slim

WORKDIR /app

# Install uv package manager
RUN pip install uv

# Copy and install dependencies
COPY requirements.txt .
RUN uv pip install --system -r requirements.txt curl_cffi alpaca-py google-genai yfinance "stable-baselines3[extra]>=2.0.0a1"

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose Litestar port
EXPOSE 8000

# Set environment variables for production
ENV PYTHONPATH=/app
ENV PORT=8000
ENV HOST=0.0.0.0

# Start Litestar ASGI server with uvicorn
CMD ["uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "8000"]
