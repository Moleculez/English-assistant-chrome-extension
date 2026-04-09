# Easy English Reader

Chrome extension that helps ESL users understand difficult English text while reading web pages and PDFs.

## Features

- **Text Simplification** - Select text on any webpage and get an easy-to-understand version
- **Floating Popup** - Small icon appears near your selection for quick access
- **Context-Aware** - Uses surrounding text to accurately interpret pronouns and references
- **Glossary** - Difficult terms explained with simple definitions
- **CEFR Levels** - Adjustable difficulty: A2 (Easy), B1 (Medium), B2 (Precise)
- **Text-to-Speech** - Listen to the simplified text for pronunciation practice
- **Dark Mode** - Automatic theme matching with system preferences
- **PDF Support** - Works with PDF documents via right-click context menu
- **Keyboard Shortcut** - Ctrl+Shift+E to simplify selected text instantly
- **Multi-Provider** - Supports OpenRouter, Ollama (local), and custom OpenAI-compatible endpoints

## Tech Stack

- Chrome Manifest V3
- React 19 + TypeScript
- Tailwind CSS + shadcn/ui
- Vite + @crxjs/vite-plugin

## Getting Started

```bash
# Install dependencies
npm install

# Development (with HMR)
npm run dev

# Build for production
npm run build
```

Load the extension in Chrome:
1. Navigate to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `dist/` folder

## Configuration

1. Click the extension icon or go to the options page
2. Choose your LLM provider (OpenRouter, Ollama, or custom endpoint)
3. Enter your API key
4. Select your preferred model and reading level

## Architecture

```
src/
  background/     # Service worker - API calls, message routing
  content/        # Content script - text selection, floating popup
  sidepanel/      # Side panel UI - results display
  options/        # Settings page - provider configuration
  lib/            # Shared modules - LLM providers, storage, TTS, theme
  ui/             # shadcn/ui components
```

## License

MIT
