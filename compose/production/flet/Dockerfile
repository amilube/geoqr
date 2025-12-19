# Flet Production Dockerfile
# This Dockerfile is used for building production Android releases

FROM python:3.13-slim-bookworm AS base

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    ANDROID_HOME=/opt/android-sdk \
    ANDROID_SDK_ROOT=/opt/android-sdk

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Basic utilities
    git \
    curl \
    wget \
    unzip \
    # Build dependencies
    build-essential \
    # Java (required for Android builds)
    openjdk-17-jdk \
    # Clean up
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Android SDK command line tools
RUN mkdir -p ${ANDROID_HOME}/cmdline-tools && \
    cd ${ANDROID_HOME}/cmdline-tools && \
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip && \
    unzip commandlinetools-linux-11076708_latest.zip && \
    rm commandlinetools-linux-11076708_latest.zip && \
    mv cmdline-tools latest

# Set up Android SDK paths
ENV PATH="${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools:${PATH}"

# Accept Android SDK licenses and install required components
RUN yes | sdkmanager --licenses && \
    sdkmanager \
    "platform-tools" \
    "platforms;android-34" \
    "build-tools;34.0.0" \
    "ndk;25.2.9519653"

# Set working directory
WORKDIR /app

# Install Flet and dependencies
COPY flet_app/requirements.txt /app/flet_requirements.txt
RUN pip install --no-cache-dir -r /app/flet_requirements.txt

# Copy application code
COPY flet_app /app/flet_app

# Create build scripts
COPY compose/production/flet/build_apk /build_apk
COPY compose/production/flet/build_aab /build_aab
RUN chmod +x /build_apk /build_aab

# Set the default command to build AAB
CMD ["/build_aab"]
