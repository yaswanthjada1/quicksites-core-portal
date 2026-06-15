# 🌐 QuickSites Studio — Core Portal & Infinite Workspace

An opinionated full-stack dashboard and canvas engine that connects local or remote data stores to a local LLM-based widget compiler. Use it to explore collections, visualize telemetry, and synthesize dashboard widgets from natural language.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Features](#features)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Telemetry & Optimization](#telemetry--optimization)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Quick Start

These steps get the full stack running locally (backend + frontend + local LLM).

### Prerequisites

- Node.js (LTS)
- A running MongoDB instance (local or cloud URI)
- Ollama (local model server) with the `qwen2.5-coder:1.5b` model available

Start the Ollama coder footprint (example):

```bash
ollama run qwen2.5-coder:1.5b
```

### Backend (API)

```bash
cd server
npm install
npm run dev   # starts on :5000 by default
```

### Frontend (Client)

```bash
cd client
npm install
npm run dev   # Vite dev server on :5173
```

Open your browser at: http://localhost:5173

---

## Features

- Intelligent natural-language query agent backed by a local LLM (`ollama` + `qwen2.5-coder`).
- Adaptive telemetry graphing that infers labels and numeric fields at runtime.
- Absolute-coordinate canvas (`PinBoard`) with draggable/resizable widgets and persistent layout storage.
- AI-driven widget generator for rapid UI prototyping.

---

## Project Structure

```
client/                     # Frontend (Vite + React)
   ├─ src/
   │  ├─ components/         # UI components (LandingPage, OnboardingWizard, PinBoard)
   │  ├─ App.jsx             # Main app & SVG graph
   │  └─ main.jsx
   └─ public/                # Static assets (favicon.png etc.)

server/                     # Backend (Express)
   ├─ config/                # DB factory and connection helpers
   ├─ routes/                # API routes (chat, onboarding, pinboard)
   └─ server.js              # Express bootstrapper
```

---

## API Reference

### Database Explorer — `/api/onboarding`

- `POST /collections` — Return user collections (filters out system collections and `qss_pinboard_metadata`).
- `POST /browse` — Return first N documents for a target collection (used to infer telemetry fields).

### Intelligent AI Agent — `/api/chat`

- `POST /query` — Translate plain-English queries into actionable MongoDB queries against the active collection.

### Canvas Workspace — `/api/pinboard`

- `POST /layout` — Read layout metadata from the `qss_pinboard_metadata` collection for the target collection.
- `POST /save` — Upsert widget box and active widget coordinates to `qss_pinboard_metadata`.
- `POST /generate` — Send a prompt to the local coder LLM and return a structured widget payload.

---

## Telemetry & Optimization

The SVG line graph in `App.jsx` uses a schema-adaptive parsing hook that chooses the first sensible text label and first numeric field for plotting. Override extraction logic if you need deterministic axes:

```javascript
// Example override inside App.jsx
let extractedLabel = row.department || row.name || row.label || `Idx_${i + 1}`;
let extractedValue = row.value || row.count || row.idleMinutes || 0;
```

---

## Troubleshooting

- Favicon 404: Ensure `client/public/favicon.png` exists and `client/index.html` links to `/favicon.png`.

- SyntaxError when parsing backend responses: Confirm backend routes are running and returning JSON. Example line that mounts pinboard routes in `server/server.js`:

```javascript
app.use('/api/pinboard', pinboardRouter);
```

- Port allocation conflicts: Kill stuck ports and retry:

```bash
npx kill-port 5000
npx kill-port 5173
```

- Ollama/AI timeouts: Confirm Ollama is running and listening (default: `http://127.0.0.1:11434`).

---

## Contributing

Contributions are welcome. Please open issues or PRs and follow repository style.

---

## License

See the `LICENSE` file for license details.
