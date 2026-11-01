# =============================================================================
# Multi-Stage Dockerfile for AdaptiveLearn AI (Full-Stack Unified Container)
# Deploys both Vite React 19 Frontend & Python FastAPI Backend on Render / Cloud
# =============================================================================

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY neural/frontend/package*.json ./
RUN npm install

COPY neural/frontend/ ./
RUN npm run build

# Stage 2: Python Backend with Embedded Frontend Assets
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=10000 \
    LOKY_MAX_CPU_COUNT=4

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY neural/backend/requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY neural/backend/ ./

# Copy compiled frontend dist from Stage 1 directly into backend working dir
COPY --from=frontend-builder /app/frontend/dist ./dist

EXPOSE 10000

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-10000}"]
