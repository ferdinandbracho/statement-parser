# Development Dockerfile for SentidoFinanciero

# Use Python 3.11 slim base image (more stable with current dependencies)
FROM python:3.11-slim as base

# Set working directory
WORKDIR /app

# Install system dependencies including OCR requirements
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    tesseract-ocr \
    tesseract-ocr-spa \
    tesseract-ocr-eng \
    libtesseract-dev \
    libopencv-dev \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# Verify Tesseract installation and available languages
RUN tesseract --version && tesseract --list-langs

# Install uv for package management
RUN pip install --no-cache-dir uv

# Copy project files
COPY . .

# Development stage
FROM base as development

# Install dependencies first (without the package itself)
RUN uv pip install --system --no-cache-dir -e ".[dev]"

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Create uploads directory with proper permissions
RUN mkdir -p /app/uploads && chmod 777 /app/uploads

# Default command for development
CMD ["uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]
