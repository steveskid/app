# LLM Chat Application

A production-ready, modular LLM chat application with a ChatGPT-like dark-mode interface. Supports multiple AI providers: OpenAI, Anthropic, Groq, and Ollama.

## Architecture

```
React + Vite + TailwindCSS (Frontend, port 5173)
       │  fetch / SSE streaming
       ▼
Express + TypeScript (Backend API Gateway, port 3001)
       │
       ▼
Provider Abstraction Layer
  ┌─────────┬──────────┬──────┬────────┐
  │ OpenAI  │Anthropic │ Groq │ Ollama │
  └─────────┴──────────┴──────┴────────┘
```

## Prerequisites

- Node.js 18+
- npm 9+
- (Optional) Ollama running locally for local models

## Setup

1. **Clone and configure environment**

   ```bash
   cp .env.example backend/.env
   # Edit backend/.env with your API keys
   ```

2. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**

   ```bash
   cd frontend
   npm install
   ```

## Running in Development

**Backend** (from `backend/` directory):
```bash
npm run dev
```

**Frontend** (from `frontend/` directory):
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Building for Production

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Serve the dist/ folder with any static file server
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/chat` | Send a chat message (supports SSE streaming) |
| `GET` | `/api/models` | List all available models |
| `GET` | `/api/history` | Get all chat sessions |
| `GET` | `/api/history/:sessionId` | Get a specific chat session |
| `DELETE` | `/api/history/:sessionId` | Delete a chat session |
| `GET` | `/health` | Health check |

## Environment Variables

See `.env.example` for all available configuration options.

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |
| `OPENAI_API_KEY` | OpenAI API key | — |
| `OPENAI_BASE_URL` | OpenAI base URL (override for proxies) | `https://api.openai.com/v1` |
| `ANTHROPIC_API_KEY` | Anthropic API key | — |
| `GROQ_API_KEY` | Groq API key | — |
| `OLLAMA_BASE_URL` | Ollama server URL | `http://localhost:11434` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in ms | `60000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `60` |
| `LOG_LEVEL` | Winston log level | `info` |

## Supported Providers & Models

### OpenAI
- `gpt-4o`
- `gpt-4o-mini`
- `gpt-4-turbo`
- `gpt-3.5-turbo`

### Anthropic
- `claude-sonnet-4-20250514`
- `claude-3-5-haiku-20241022`
- `claude-3-opus-20240229`

### Groq
- `llama-3.3-70b-versatile`
- `llama-3.1-8b-instant`
- `mixtral-8x7b-32768`
- `gemma2-9b-it`

### Ollama (local)
- Any model you have pulled locally (auto-detected)