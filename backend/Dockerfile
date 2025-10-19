# Use slim Python
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy project files
COPY . /app

# Upgrade pip
RUN pip install --upgrade pip

# Install Python dependencies
RUN pip install \
    python-dotenv \
    PyPDF2 \
    python-docx \
    openai-whisper \
    transformers \
    torch \
    requests \
    huggingface_hub

# Set env variable for unbuffered output
ENV PYTHONUNBUFFERED=1

# Default entrypoint
ENTRYPOINT ["python", "assistant.py"]
