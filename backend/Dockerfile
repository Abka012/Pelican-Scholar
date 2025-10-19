# -------------------- Base image --------------------
FROM python:3.11-slim

# -------------------- Set environment --------------------
ENV PYTHONUNBUFFERED=1
ENV LANG=C.UTF-8
ENV PORT=8000

# -------------------- Install system dependencies --------------------
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    build-essential \
    libsndfile1 \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# -------------------- Set working directory --------------------
WORKDIR /app

# -------------------- Copy files --------------------
COPY . /app

# -------------------- Install Python dependencies --------------------
RUN pip install --no-cache-dir --upgrade pip setuptools wheel \
    && pip install --no-cache-dir \
        flask \
        flask-wtf \          # <-- Added this line
        python-dotenv \
        PyPDF2 \
        python-docx \
        transformers \
        torch \
        whisper \
        huggingface-hub \
        requests

# -------------------- Expose port --------------------
EXPOSE 8000

# -------------------- Command to run --------------------
CMD ["python", "assistant.py"]
