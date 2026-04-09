# Coqui XTTS v2 TTS Server

Local text-to-speech server for Easy English Reader. Uses XTTS v2 for high-quality, natural-sounding speech with optional voice cloning.

## Setup

```bash
cd tts-server

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

The first run will download the XTTS v2 model (~1.8GB).

## Usage

```bash
# Start with default voice
python server.py

# Start with a custom cloned voice (needs a 6+ second WAV sample)
python server.py --speaker my_voice.wav

# Custom port
python server.py --port 5200
```

The server runs at `http://localhost:5100` by default.

## Voice Cloning

To clone a voice, provide a clean WAV recording (6-30 seconds):

1. Record yourself or use any audio sample
2. Save as WAV (16kHz or higher, mono)
3. Run: `python server.py --speaker your_recording.wav`

Tips for best results:
- Use a quiet recording environment
- Speak naturally at a normal pace
- 10-30 seconds of speech works best
- Avoid background music or noise

## API

### `POST /tts`
Generate speech from text.

```json
{ "text": "Hello world", "language": "en" }
```
Returns: `audio/wav`

### `GET /health`
Server status check.

### `GET /voices`
List available voices.

## GPU Support

XTTS v2 runs on CPU but is much faster with a CUDA GPU. Install PyTorch with CUDA:

```bash
pip install torch --index-url https://download.pytorch.org/whl/cu121
```

## Configure in Extension

1. Open extension settings
2. Under TTS preferences, the extension will auto-detect the Coqui server at `localhost:5100`
