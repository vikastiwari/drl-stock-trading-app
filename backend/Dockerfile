FROM python:3.11-slim

WORKDIR /app

# System dependencies for curl_cffi and scientific packages
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Install requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose Litestar port
EXPOSE 8000

# Run the Litestar ASGI app
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
