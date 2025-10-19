import os
import json
import tempfile
import datetime
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileRequired, FileAllowed
from wtforms import SelectField
from wtforms.validators import DataRequired
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
app.config["SECRET_KEY"] = os.getenv(
    "FLASK_SECRET_KEY", "dev-secret-key-please-change-in-prod"
)
app.config["WTF_CSRF_ENABLED"] = False  # Disable CSRF for API usage

# Allow CORS for Vercel frontend + local dev
CORS(
    app,
    origins=[
        "https://pelican-scholar.vercel.app",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
)


# -------------------- Form Definition ------------------
class SummarizeFileForm(FlaskForm):
    file = FileField(
        "File",
        validators=[
            FileRequired(),
            FileAllowed(
                ["pdf", "docx", "txt"], "Only PDF, DOCX, or TXT files allowed."
            ),
        ],
    )
    summary_length = SelectField(
        "Summary Length",
        choices=[("short", "Short"), ("medium", "Medium"), ("long", "Long")],
        default="medium",
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


def summarize_with_transformers(text: str, max_length: int = 600) -> str:
    """Improved summarization with adjustable length"""
    try:
        summarizer = pipeline("summarization")

        words = text.split()
        if len(words) <= 800:
            return summarizer(
                text, max_length=max_length, min_length=150, do_sample=False
            )[0]["summary_text"]

        chunk_size = 600
        chunks = [
            " ".join(words[i : i + chunk_size])
            for i in range(0, len(words), chunk_size)
        ]

        summaries = []
        for chunk in chunks:
            if len(chunk.split()) > 100:
                summary = summarizer(
                    chunk, max_length=200, min_length=80, do_sample=False
                )[0]["summary_text"]
                summaries.append(summary)
            else:
                summaries.append(chunk)

        combined = " ".join(summaries)
        if len(combined.split()) > 300:
            return summarizer(
                combined, max_length=max_length, min_length=150, do_sample=False
            )[0]["summary_text"]
        return combined
    except Exception as e:
        return f"Error in transformer summarization: {str(e)}"


def summarize_text(text: str) -> str:
    """Main summarization function with fallback options"""
    try:
        result = client.summarization(
            text,
            model="Falconsai/text_summarization",
        )
        return result
    except Exception as e:
        print(f"Hugging Face API failed, falling back to local model: {e}")
        return summarize_with_transformers(text, max_length=600)


# -------------------- API endpoints ------------------


@app.route("/api/summarize", methods=["POST"])
def summarize_file():
    form = SummarizeFileForm()

    if not form.validate_on_submit():
        errors = {field.name: field.errors for field in form if field.errors}
        return jsonify({"error": "Validation failed", "details": errors}), 400

    uploaded_file = form.file.data
    summary_length = form.summary_length.data

    try:
        length_map = {"short": 300, "medium": 600, "long": 900}
        max_length = length_map.get(summary_length, 600)

        ext = Path(uploaded_file.filename).suffix.lower()
        tmpdir = tempfile.mkdtemp()
        file_path = Path(tmpdir) / uploaded_file.filename
        uploaded_file.save(file_path)

        if ext == ".pdf":
            text = read_pdf_text(str(file_path))
        elif ext == ".docx":
            text = read_docx_text(str(file_path))
        else:
            text = read_text_file(str(file_path))

        if not text.strip():
            return jsonify({"error": "No text found in the file"}), 400

        chunks = chunck_text(text)
        chunk_summaries = [
            summarize_with_transformers(chunk, max_length=400) for chunk in chunks
        ]
        combined_summary = "\n\n".join(chunk_summaries)
        final_summary = summarize_with_transformers(
            combined_summary, max_length=max_length
        )

        os.remove(file_path)
        os.rmdir(tmpdir)

        return jsonify(
            {
                "filename": uploaded_file.filename,
                "final_summary": final_summary,
                "text_length": len(text),
                "summary_length": len(final_summary.split()),
                "summary_type": summary_length,
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/", methods=["GET"])
def index():
    return "Pelican Scholar API is running! Use POST /api/summarize to summarize files."


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "API is running"})


@app.route("/api/notes", methods=["GET"])
def get_all_notes():
    return jsonify({"message": "Notes endpoint - implement your logic here"})


@app.route("/api/notes", methods=["POST"])
def create_note():
    data = request.get_json()
    return jsonify(data)


@app.route("/api/notes/<int:id>", methods=["PUT"])
def update_note(id):
    data = request.get_json()
    return jsonify(data)


@app.route("/api/notes/<int:id>", methods=["DELETE"])
def delete_note(id):
    return jsonify({"message": "Note deleted"})


# -------------------- Run server ----------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))

