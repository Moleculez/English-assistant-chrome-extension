# Easy English Reader

[![CI](https://github.com/Moleculez/English-assistant-chrome-extension/actions/workflows/ci.yml/badge.svg)](https://github.com/Moleculez/English-assistant-chrome-extension/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/Moleculez/English-assistant-chrome-extension)](https://github.com/Moleculez/English-assistant-chrome-extension/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A Chrome extension that helps ESL (English as a Second Language) users understand difficult English text while reading web pages and PDFs. Select any text, and get an AI-powered simplified version with explanations and vocabulary — right in your browser.

## Features

- **Streaming Simplification** — Text appears token by token as the AI generates it, no waiting
- **Floating Popup + Tooltip** — A small icon and tooltip appear near your selection for quick access
- **Context-Aware** — Uses surrounding text to accurately interpret pronouns, idioms, and references
- **Glossary with Highlights** — Difficult terms highlighted in the simplified text with hover definitions
- **CEFR Levels** — Adjustable difficulty: A2 (Easy), B1 (Medium), B2 (Precise)
- **Text-to-Speech** — Browser voices or [Coqui XTTS v2](#coqui-tts-voice-cloning) for high-quality speech with voice cloning
- **Dark Mode** — Automatic theme matching with system preferences
- **PDF Support** — Works with PDF documents via right-click context menu
- **Keyboard Shortcut** — `Ctrl+Shift+E` (Mac: `Cmd+Shift+E`) to simplify instantly
- **Multi-Provider** — Supports OpenRouter, Ollama (local), and any OpenAI-compatible endpoint
- **Session History** — Browse and restore recent analyses
- **Privacy First** — No backend server. Your API key stays in your browser.

## Install

### From Release (recommended)

1. Download the latest `.zip` from [Releases](https://github.com/Moleculez/English-assistant-chrome-extension/releases/latest)
2. Unzip to a folder
3. Open `chrome://extensions` and enable **Developer mode**
4. Click **Load unpacked** and select the unzipped folder

### From Source

```bash
git clone https://github.com/Moleculez/English-assistant-chrome-extension.git
cd English-assistant-chrome-extension
npm install
npm run build
```

Then load `dist/` as an unpacked extension in Chrome.

## Setup

1. Click the extension icon to open the side panel
2. Click the **Settings** gear icon
3. Choose your LLM provider:

| Provider | Setup |
|----------|-------|
| **OpenRouter** | Get an API key at [openrouter.ai/keys](https://openrouter.ai/keys), paste it in settings |
| **Ollama** | Install [Ollama](https://ollama.com), run a model, set `OLLAMA_ORIGINS=*` (see below) |
| **Custom** | Enter any OpenAI-compatible endpoint URL and optional API key |

4. Select a model and your preferred CEFR reading level

### Ollama Setup

Ollama requires allowing Chrome extension origins:

```bash
# Windows
setx OLLAMA_ORIGINS "*"

# Mac/Linux
export OLLAMA_ORIGINS="*"
```

Then restart Ollama.

## Usage

1. **Select text** on any webpage
2. **Click the purple button** that appears near your selection (or right-click → "Simplify in Easy English", or press `Ctrl+Shift+E`)
3. **Read the result** in the side panel — simplified text streams in live, with explanation and glossary

## Text-to-Speech

### Browser TTS (default)

Uses your browser's built-in speech synthesis. Select a voice in Settings → Preferences → TTS.

### Coqui TTS (voice cloning)

For high-quality, natural-sounding speech with optional voice cloning using XTTS v2.

**Prerequisites**: Python 3.10+, [espeak-ng](https://github.com/espeak-ng/espeak-ng/releases)

```bash
cd tts-server
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install PyTorch (with CUDA for GPU acceleration)
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu121

# Install dependencies
pip install -r requirements.txt
```

**Run with default voice** (VITS model, ~100MB download):
```bash
python server.py
```

**Run with voice cloning** (XTTS v2, ~1.8GB download, needs a 6+ second WAV sample):
```bash
python server.py --speaker your_voice.wav
```

The server runs at `http://localhost:5100`. Then in extension settings, switch TTS engine to **Coqui XTTS v2**.

**Voice cloning tips:**
- Use a clean WAV recording (16kHz+, mono)
- 10–30 seconds of natural speech works best
- Quiet environment, no background noise or music

## Development

```bash
npm install       # Install dependencies
npm run dev       # Development server with HMR
npm run build     # Production build
npm run pack      # Build + zip for distribution
```

### Release

```bash
npm run version:patch   # Bump version (patch/minor/major)
git add -A && git commit -m "release: vX.Y.Z"
git tag vX.Y.Z && git push origin master vX.Y.Z
```

GitHub Actions automatically builds and creates a release with the `.zip` attached.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Production build to `dist/` |
| `npm run pack` | Build + create release `.zip` |
| `npm run release` | Bump patch + pack |
| `npm run version:patch` | Bump patch version (0.1.0 → 0.1.1) |
| `npm run version:minor` | Bump minor version (0.1.0 → 0.2.0) |
| `npm run version:major` | Bump major version (0.1.0 → 1.0.0) |
| `npm run icons` | Regenerate PNG icons from SVG |

## Architecture

```
├── src/
│   ├── background/     # Service worker — message routing, context menu, shortcuts
│   ├── content/        # Content script — text selection, floating popup, tooltip
│   ├── sidepanel/      # Side panel UI — streaming display, history
│   ├── options/        # Options page — provider config, preferences
│   ├── lib/
│   │   ├── llm/        # LLM providers (OpenRouter, Ollama, Custom) + streaming
│   │   ├── messages/   # Chrome message passing types and utilities
│   │   ├── storage/    # Chrome storage wrappers (settings, history)
│   │   ├── pdf/        # PDF detection and context extraction
│   │   └── theme/      # Dark/light mode utilities
│   └── ui/             # shadcn/ui components + theme provider
└── tts-server/         # Coqui TTS server (Python, optional)
```

## Tech Stack

- **Extension**: Chrome Manifest V3
- **UI**: React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Build**: Vite + @crxjs/vite-plugin
- **LLM**: Streaming via SSE/NDJSON for all providers
- **TTS**: Web Speech API + optional Coqui XTTS v2 server
- **Validation**: Zod for LLM response parsing

## License

[MIT](LICENSE)
