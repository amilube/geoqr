# Flet Local Development Dockerfile
# This Dockerfile is used for local development of the Flet Android frontend

FROM python:3.13-slim-bookworm

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Basic utilities
    git \
    curl \
    wget \
    # Build dependencies
    build-essential \
    # Clean up
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install Flet and dependencies
COPY apps/flet_app/requirements.txt /app/flet_requirements.txt
RUN pip install --no-cache-dir -r /app/flet_requirements.txt

# Install development tools
RUN pip install --no-cache-dir \
    pytest \
    pytest-cov \
    black \
    ruff \
    mypy

# Copy application code
COPY apps/flet_app /app/apps/flet_app

# Create entrypoint script
COPY compose/local/flet/start /start
RUN chmod +x /start

# Expose Flet web port
EXPOSE 8550

# Set the entrypoint
ENTRYPOINT ["/start"]
