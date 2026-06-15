#  QuickSites Studio — Core Portal & Infinite Workspace

An opinionated full-stack dashboard and canvas engine that connects local or remote data stores to a local LLM-based widget compiler. Use it to explore collections, visualize telemetry, and synthesize dashboard widgets from natural language.

---

##  Key Architectural Features

| Component | Description | Operational Core |
| :--- | :--- | :--- |
| **Intelligent Query Agent** | Natural language English-to-MongoDB query compiler with real-time payload mapping. | `ollama` + `qwen2.5-coder:1.5b` |
| **Telemetry Vector Engine** | Dependency-free, highly responsive SVG line graph that dynamically scales to any schema footprint. | React Native SVG + Tailwind CSS |
| **Infinite Workspace Canvas** | Draggable, resizable canvas board with absolute pixel locking. | React Workspace Hooks |
| **AI Widget Compiler** | Autonomous layout blueprint generator that turns prompts into functional dashboard widgets. | Low-temperature LLM Inference |
| **Persistent Config Layer** | Centralized database connection pooling to optimize network transaction latency. | MongoDB Connection Pool |
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

---

## 🛠️ Installation & Environment Initialization

### 1. Prerequisite Infrastructure
Ensure your machine has the following background processes running natively:

- **MongoDB Server:** Local instance or remote cluster URI string.
- **Ollama Node:** Installed and serving models locally. Pull the optimized coder footprint:

Bash

```
  ollama run qwen2.5-coder:1.5b
```

### 2. Backend API Portal Configuration

1. Navigate to the server root:

Bash

```
   cd server
```

1. Install dependency architectures:

Bash

```
   npm install
```

1. Initialize the development environment on port `5000`:

Bash

```
   npm run dev
```

### 3. Frontend Interface Setup

1. Navigate to the client directory:

Bash

```
   cd client
```

1. Install client dependencies:

Bash

```
   npm install
```

1. Fire up the Vite compiler on port `5173`:

Bash

```
   npm run dev
```

1. Open your browser and point it to: `http://localhost:5173`

##  API Route Reference Blueprint

###  Database Explorer Routes (`/api/onboarding`)

- `POST /collections` — Enumerates all system collections while filtering out internal cluster noise.
- `POST /browse` — Retrieves data rows from the targeted collection array to map telemetry profiles.

###  Intelligent AI Agent Routes (`/api/chat`)

- `POST /query` — Translates plain English user entries into valid MongoDB syntax queries and evaluates them against the active collection scope.

###  Canvas Workspace Routes (`/api/pinboard`)

- `POST /layout` — Pulls saved absolute x/y coordinates and widget specifications from `qss_pinboard_metadata`.
- `POST /save` — Performs bulk upserts of active workspace card states to preserve coordinates across sessions.
- `POST /generate` — Feeds a prompt to the local coder instance to manufacture structured widget properties.

##  Telemetry & Optimization Tuning

> 
> ###  Schema-Adaptive Vector Calculations
> The real-time SVG line graph utilizes a reflexive parsing hook inside `App.jsx`. It evaluates the structure of whatever collection drops in by running text-field fallback logic for label strings and indexing the first active numerical properties for vertex point projection. No hardcoded field assumptions are required.
JavaScript

```
// Change data capture constraints inside App.jsx to manually override visualization paths:
let extractedLabel = row.department || row.name || row.label || `Idx_${i + 1}`;
let extractedValue = row.value || row.count || row.idleMinutes || 0;
```

##  System Diagnostics & Troubleshooting

- **SyntaxError: Unexpected token '

JavaScript

```
  app.use('/api/pinboard', pinboardRouter);
```

- **Port Allocation Failures:**
If port `5000` or `5173` hangs during rapid live-reloads, flush the socket pipeline manually:

Bash

```
  npx kill-port 5000
  npx kill-port 5173
```

- **AI Generation Timeouts:**
Verify that the Ollama service is listening on its default localhost gateway address: `http://127.0.0.1:11434`.

### 🔒 Operational Matrix Status: `OPTIMAL / ONLINE`
