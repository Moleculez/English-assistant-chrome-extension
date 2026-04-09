"""
Coqui TTS Server for Easy English Reader.

Uses VITS by default (no reference audio needed).
If --speaker is provided, uses XTTS v2 for voice cloning.

Usage:
    python server.py                          # VITS default voice
    python server.py --speaker voice.wav      # XTTS v2 voice cloning

API:
    POST /tts  {"text": "hello", "language": "en"}  -> audio/wav
    GET  /health                                     -> server status
"""

import argparse
import os
import tempfile

os.environ["COQUI_TOS_AGREED"] = "1"

# Ensure espeak-ng is in PATH on Windows
espeak_paths = [
    r"C:\Program Files\eSpeak NG",
    r"C:\Program Files (x86)\eSpeak NG",
]
for p in espeak_paths:
    if os.path.isdir(p) and p not in os.environ.get("PATH", ""):
        os.environ["PATH"] = os.environ["PATH"] + os.pathsep + p

from flask import Flask, jsonify, request, send_file
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

tts_model = None
speaker_wav = None
model_name = ""


def load_model(use_xtts: bool):
    global tts_model, model_name
    from TTS.api import TTS

    if use_xtts:
        model_name = "xtts_v2"
        print("Loading XTTS v2 (voice cloning, ~1.8GB)...")
        tts_model = TTS("tts_models/multilingual/multi-dataset/xtts_v2")
    else:
        model_name = "vits"
        print("Loading VITS (default voice, ~100MB)...")
        tts_model = TTS("tts_models/en/ljspeech/vits")

    if hasattr(tts_model, "to"):
        try:
            tts_model.to("cuda")
            print("Using GPU")
        except Exception:
            print("Using CPU")

    print("Model ready")


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "model": model_name,
        "speaker": speaker_wav or "default",
    })


@app.route("/tts", methods=["POST"])
def synthesize():
    if tts_model is None:
        return jsonify({"error": "Model not loaded"}), 503

    data = request.get_json(silent=True) or {}
    text = data.get("text", "").strip()
    language = data.get("language", "en")

    if not text:
        return jsonify({"error": "No text provided"}), 400
    if len(text) > 5000:
        return jsonify({"error": "Text too long (max 5000 chars)"}), 400

    try:
        tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
        tmp_path = tmp.name
        tmp.close()

        if speaker_wav and model_name == "xtts_v2":
            tts_model.tts_to_file(
                text=text,
                speaker_wav=speaker_wav,
                language=language,
                file_path=tmp_path,
            )
        else:
            tts_model.tts_to_file(text=text, file_path=tmp_path)

        return send_file(tmp_path, mimetype="audio/wav")
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def main():
    global speaker_wav

    parser = argparse.ArgumentParser(description="Coqui TTS Server")
    parser.add_argument("--port", type=int, default=5100)
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--speaker", type=str, help="WAV file for XTTS v2 voice cloning")
    args = parser.parse_args()

    speaker_wav = args.speaker
    use_xtts = speaker_wav is not None

    if speaker_wav:
        print(f"Voice cloning from: {speaker_wav}")

    load_model(use_xtts)

    print(f"\nServer: http://{args.host}:{args.port}")
    app.run(host=args.host, port=args.port, threaded=True)


if __name__ == "__main__":
    main()
