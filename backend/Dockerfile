
# Use an official Python base image
FROM python:3.10-slim

# Set working directory inside the container
WORKDIR /app

# Install system dependencies (ffmpeg for audio extraction, git for huggingface)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    git \
    tk \
    && rm -rf /var/lib/apt/lists/*

# Copy project files into the container
COPY . /app

# Upgrade pip and install dependencies
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
    huggingface_hub \
    tk \
    pillow

# (Optional) If summarization model requires additional dependencies
# RUN pip install accelerate

# Ensure the .env file can be read (you’ll mount it at runtime)
ENV PYTHONUNBUFFERED=1

# Default command (you can override with docker run arguments)
ENTRYPOINT ["python", "main.py"]
