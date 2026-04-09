"""
Coqui XTTS v2 TTS Server for Easy English Reader.

Provides a local HTTP API that the Chrome extension calls to generate speech.
Supports voice cloning from a reference audio file.

Usage:
    python server.py                          # default voice
    python server.py --speaker voice.wav      # clone a voice from a sample

API:
    POST /tts  {"text": "hello", "language": "en"}  -> audio/wav
    GET  /voices                                     -> available speakers
    GET  /health                                     -> server status
"""

import argparse
import io
import sys
import tempfile
import wave

from flask import Flask, jsonify, request, send_file
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

tts_model = None
speaker_wav = None
default_language = "en"


def load_model():
    global tts_model
    print("Loading XTTS v2 model (first run downloads ~1.8GB)...")
    from TTS.api import TTS

    tts_model = TTS("tts_models/multilingual/multi-dataset/xtts_v2")

    if hasattr(tts_model.synthesizer, "cuda"):
        try:
            tts_model.to("cuda")
            print("Using GPU for inference")
        except Exception:
            print("GPU not available, using CPU (slower)")

    print("Model loaded and ready")


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "model": "xtts_v2",
        "speaker": speaker_wav or "default",
    })


@app.route("/voices", methods=["GET"])
def voices():
    if tts_model is None:
        return jsonify({"voices": []})

    speakers = []
    if hasattr(tts_model.synthesizer, "tts_model"):
        model = tts_model.synthesizer.tts_model
        if hasattr(model, "speaker_manager") and model.speaker_manager:
            speakers = list(model.speaker_manager.name_to_id.keys())

    return jsonify({
        "voices": speakers,
        "custom_speaker": speaker_wav is not None,
    })


@app.route("/tts", methods=["POST"])
def synthesize():
    if tts_model is None:
        return jsonify({"error": "Model not loaded"}), 503

    data = request.get_json(silent=True) or {}
    text = data.get("text", "").strip()
    language = data.get("language", default_language)

    if not text:
        return jsonify({"error": "No text provided"}), 400

    if len(text) > 5000:
        return jsonify({"error": "Text too long (max 5000 chars)"}), 400

    try:
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp_path = tmp.name

        if speaker_wav:
            tts_model.tts_to_file(
                text=text,
                speaker_wav=speaker_wav,
                language=language,
                file_path=tmp_path,
            )
        else:
            tts_model.tts_to_file(
                text=text,
                language=language,
                file_path=tmp_path,
            )

        return send_file(tmp_path, mimetype="audio/wav")

    except Exception as e:
        return jsonify({"error": str(e)}), 500


def main():
    global speaker_wav, default_language

    parser = argparse.ArgumentParser(description="Coqui XTTS v2 TTS Server")
    parser.add_argument("--port", type=int, default=5100, help="Server port (default: 5100)")
    parser.add_argument("--host", default="127.0.0.1", help="Server host (default: 127.0.0.1)")
    parser.add_argument("--speaker", type=str, help="Path to speaker reference WAV file for voice cloning")
    parser.add_argument("--language", default="en", help="Default language (default: en)")
    args = parser.parse_args()

    speaker_wav = args.speaker
    default_language = args.language

    if speaker_wav:
        print(f"Voice cloning from: {speaker_wav}")

    load_model()

    print(f"\nTTS server running at http://{args.host}:{args.port}")
    print(f"Extension should connect to: http://localhost:{args.port}")
    app.run(host=args.host, port=args.port, threaded=True)


if __name__ == "__main__":
    main()
