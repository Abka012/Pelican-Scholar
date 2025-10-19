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

# -------------------- Copy requirements and install dependencies --------------------
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip setuptools wheel \
    && pip install --no-cache-dir -r requirements.txt

# -------------------- Copy application files --------------------
COPY . /app

# -------------------- Expose port --------------------
EXPOSE 8000

# -------------------- Command to run --------------------
CMD ["python", "assistant.py"]
