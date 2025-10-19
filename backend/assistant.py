import os
import sys
import argparse
import subprocess
import json
import tempfile
import datetime
from pathlib import Path
import re
from typing import List, Dict, Any
import requests
import PyPDF2
import docx
import whisper
from transformers import pipeline
import tkinter as tk
from tkinter import filedialog
from dotenv import load_dotenv
from huggingface_hub import InferenceClient

HEADLESS = os.environ.get("DISPLAY") is None or os.environ.get("RENDER") == "true"

load_dotenv()

client = InferenceClient(provider="hf-inference", api_key=os.getenv("HF_TOKEN"))

# ----------------------------------- Utility functions -------------------------------------------------


def ensure_ffmpeg_avaliable():
    try:
        subprocess.run(
            ["ffmpeg", "-version"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=True,
        )
    except Exception as e:
        raise RuntimeError("ffmpeg not found") from e


def extract_audio(video_path: str, out_audio: str):
    ensure_ffmpeg_avaliable()
    cmd = [
        "ffmpeg",
        "-y",
        "-i",
        str(video_path),
        "-vn",
        "acodec",
        "pm_s16le",
        "-ar",
        "16000",
        "-ac",
        "1",
        str(out_audio),
    ]
    subprocess.run(
        cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True
    )
    return out_audio


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
    paragraphs = re.split(r"\n\s*\n", text)
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


def format_timestap(seconds: float) -> str:
    ms = int((seconds - int(seconds)) * 1000)
    s = int(seconds) % 60
    m = (int(seconds) // 60) % 60
    h = int(seconds) // 3600
    return f"{h}:{m:02d}:{s:02d}.{ms:03d}"


# --------------------------------------------- Transcription ----------------------------------------------------


def transcribe_locally(audio_path: str, model: str = "small") -> Dict[str, Any]:
    wmodel = whisper.load_model(model)
    results = wmodel.transcribe(audio_path)
    return {"text": results.get("text", ""), "raw": results}


# --------------------------------------------- Summarization ----------------------------------------------------

"""def summarize_with_gemini(text: str, system_prompt: str = None, model: str = "gemini-2.5-flash") -> str: 
    api_key = os.getenv("GEMINI_API_KEY")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    prompt = system_prompt or "You are an assistant that summarizes text clearly and concisely."
    body = {
        "contents": [
            {"parts": [{"text": f"{prompt}\n\nText to summarize:\n{text}"}]}
        ]
    }
    resp = requests.post(url, headers=headers, json=body)
    if resp.status_code != 200:
        raise RuntimeError(f"Gemini API error {resp.status_code}: {resp.text}")
    
    data = resp.json()
    try:
        return data["candidates"][0]["content"]["parts"][0]["text"].strip()
    except Exception:
        return json.dumps(data, indent=2)"""


def summarize_text(text: str) -> str:
    result = client.summarization(
        text,
        model="Falconsai/text_summarization",
    )
    return result


def summarize_with_transformers(text: str) -> str:
    summerizer = pipeline("summerization")
    chuncks = chunck_text(text, max_chars=1500)
    results = [
        summerizer(c, max_length=150, min_length=40, do_sample=False)[0]["summary_text"]
        for c in chuncks
    ]
    return " ".join(results)


# ------------------------------------------------ Processing Logic -------------------------------------------------


def process_document(path: str) -> Dict[str, Any]:
    ext = Path(path).suffix.lower()
    if ext == ".pdf":
        text = read_pdf_text(path)
    elif ext == ".docx":
        text = read_docx_text(path)
    else:
        text = read_text_file(path)

    chuncks = chunck_text(text)
    summaries = []
    for c in chuncks:
        s = summarize_text(c)
        summaries.append(s)

    combined = "\n\n".join(summaries)
    final = summarize_text(combined)

    return {"type": "document", "input": path, "final_summary": final}


def process_video(path: str, lang: str = "en") -> Dict[str, Any]:
    tmpdir = tempfile.mkdtemp(prefix="vid_")
    audio = os.path.join(tmpdir, "audio.wav")
    extract_audio(path, audio)

    trans = transcribe_locally(audio)
    text = trans["text"]
    chuncks = chunck_text(text)
    summaries = []
    for c in chuncks:
        s = summarize_text(c)
        summaries.append(s)

    combined = "\n\n".join(summaries)
    final = summarize_text(combined)
    return {"type": "video", "input": path, "transcript": text, "final_summary": final}


# ------------------------------------------------- CLI -------------------------------------------------------------


def select_file():
    if HEADLESS:
        print("Running in headless mode — GUI file picker disabled.")
        return None  # User must pass --input instead

    # Otherwise use tkinter for local selection
    root = tk.Tk()
    root.withdraw()
    file_path = filedialog.askopenfilename(
        title="Select a video or document",
        filetypes=[
            ("All Supported", "*.mp4 *.mkv *.mov *.pdf *.txt *.docx"),
            ("Videos", "*.mp4 *.mkv *.mov"),
            ("Documents", "*.pdf *.txt *.docx"),
        ],
    )
    return file_path


def main():
    parser = argparse.ArgumentParser(
        description="AI assistant that summarizes videos or documents."
    )
    parser.add_argument("--input", "-i", help="Input file path")
    parser.add_argument("--type", "-t", choices=["video", "document"])
    parser.add_argument("--lang", default="en", help="Language for Transcription")
    parser.add_argument("--outdir", default="outputs", help="Output folder")
    args = parser.parse_args()

    if not args.input:
        if HEADLESS:
            # Default file in repo for headless deployment
            args.input = "samples/sample.pdf"
            args.type = "document"
            print(f"Headless mode: using default input file: {args.input}")
        else:
            args.input = select_file()
            if not args.input:
                print("No file selected. Exiting.")
                sys.exit(1)

    if not args.type:
        ext = Path(args.input).suffix.lower()
        if ext in [".mp4", ".mkv", ".mov"]:
            args.type = "video"
        else:
            args.type = "document"

    Path(args.outdir).mkdir(parents=True, exist_ok=True)
    ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    out_path = Path(args.outdir) / f"{Path(args.input).stem}_{ts}_summary.json"

    try:
        if args.type == "video":
            extracted_text = process_video(args.input, lang=args.lang)
            result = {"final_summary": summarize_text(extracted_text)}
        else:
            extracted_text = process_document(args.input)
            result = {"final_summary": summarize_text(extracted_text)}
    except Exception as e:
        print("Error: ", e)
        sys.exit(1)

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print("\n=== FINAL SUMMARY ===\n")
    print(result["final_summary"])
    print(f"\nSaved to: {out_path}")


if __name__ == "__main__":
    main()
