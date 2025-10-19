import os
import json
import tempfile
import datetime
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS
import PyPDF2
import docx
import whisper
from transformers import pipeline
from dotenv import load_dotenv
from huggingface_hub import InferenceClient

# -------------------- Load environment --------------
load_dotenv()
client = InferenceClient(provider="hf-inference", api_key=os.getenv("HF_TOKEN"))

# -------------------- Flask app ----------------------
app = Flask(__name__)

# Allow CORS for Vercel frontend + local dev
CORS(
    app,
    origins=[
        "https://pelican-scholar.vercel.app",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
)

# -------------------- Utility functions ------------------


def read_pdf_text(path: str) -> str:
    text = ""
    with open(path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        for page in reader.pages:
            text += page.extract_text() or ""
    return text


def read_docx_text(path: str) -> str:
    doc = docx.Document(path)
    return "\n".join(p.text for p in doc.paragraphs if p.text.strip())


def read_text_file(path: str) -> str:
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()


def chunck_text(text: str, max_chars: int = 3000):
    text = text.strip()
    paragraphs = text.split("\n\n")
    chuncks, current = [], ""
    for p in paragraphs:
        if len(current) + len(p) < max_chars:
            current += ("\n\n" if current else "") + p
        else:
            chuncks.append(current)
            current = p
    if current:
        chuncks.append(current)
    return chuncks


def summarize_text(text: str) -> str:
    try:
        result = client.summarization(
            text,
            model="Falconsai/text_summarization",
        )
        return result
    except Exception as e:
        return f"Error summarizing: {str(e)}"


# -------------------- API endpoints ------------------


@app.route("/api/summarize", methods=["POST"])
def summarize_file():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        uploaded_file = request.files["file"]
        if uploaded_file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        ext = Path(uploaded_file.filename).suffix.lower()
        tmpdir = tempfile.mkdtemp()
        file_path = Path(tmpdir) / uploaded_file.filename
        uploaded_file.save(file_path)

        # Read file content
        if ext == ".pdf":
            text = read_pdf_text(file_path)
        elif ext == ".docx":
            text = read_docx_text(file_path)
        else:
            text = read_text_file(file_path)

        if not text.strip():
            return jsonify({"error": "No text found in the file"}), 400

        chuncks = chunck_text(text)
        summaries = [summarize_text(c) for c in chuncks]
        final_summary = summarize_text("\n\n".join(summaries))

        return jsonify(
            {
                "filename": uploaded_file.filename,
                "final_summary": final_summary,
                "text_length": len(text),
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -------------------- Root & Health endpoints ------------------


@app.route("/", methods=["GET"])
def index():
    return "Pelican Scholar API is running! Use POST /api/summarize to summarize files."


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "API is running"})


# --------------------- Notes endpoints -------------------


@app.route("/api/notes", methods=["GET"])
def get_all_notes():
    # Return your notes data
    return jsonify(data)


@app.route("/api/notes", methods=["POST"])
def create_note():
    data = request.get_json()
    # Create and return new note
    return jsonify(data)


@app.route("/api/notes/<int:id>", methods=["PUT"])
def update_note(id):
    data = request.get_json()
    # Update and return note
    return jsonify(data)


@app.route("/api/notes/<int:id>", methods=["DELETE"])
def delete_note(id):
    # Delete note
    return jsonify({"message": "Note deleted"})


# -------------------- Run server ----------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
