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
    # SSL certificates for pip
    ca-certificates \
    # Build dependencies
    build-essential \
    # Clean up
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && update-ca-certificates

# Set working directory
WORKDIR /app

# Upgrade pip and install certificates (with SSL workaround for build environments)
RUN pip install --upgrade --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host files.pythonhosted.org pip setuptools certifi

# Install Flet and dependencies
COPY flet_app/requirements.txt /app/flet_requirements.txt
RUN pip install --no-cache-dir --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host files.pythonhosted.org -r /app/flet_requirements.txt

# Install development tools
RUN pip install --no-cache-dir --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host files.pythonhosted.org \
    pytest \
    pytest-cov \
    black \
    ruff \
    mypy

# Copy application code
COPY flet_app /app/flet_app

# Create entrypoint script
COPY compose/local/flet/start /start
RUN chmod +x /start

# Expose Flet web port
EXPOSE 8550

# Set the entrypoint
ENTRYPOINT ["/start"]
