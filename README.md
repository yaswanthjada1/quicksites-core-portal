#  QuickSites Studio — Core Portal & Infinite Workspace

An advanced, full-stack database console and absolute-coordinate layout engine. This application bridges local data infrastructure with a localized AI orchestration layer (`ollama` running `qwen2.5-coder:1.5b`), allowing users to explore collections, generate dynamic telemetry visualizations, and compile custom dashboard widgets using natural language directives.

---

## 🚀 Key Architectural Features

| Component | Description | Operational Core |
| :--- | :--- | :--- |
| **Intelligent Query Agent** | Natural language English-to-MongoDB query compiler with real-time payload mapping. | `ollama` + `qwen2.5-coder:1.5b` |
| **Telemetry Vector Engine** | Dependency-free, highly responsive SVG line graph that dynamically scales to any schema footprint. | React Native SVG + Tailwind CSS |
| **Infinite Workspace Canvas** | Draggable, resizable canvas board with absolute pixel locking. | React Workspace Hooks |
| **AI Widget Compiler** | Autonomous layout blueprint generator that turns prompts into functional dashboard widgets. | Low-temperature LLM Inference |
| **Persistent Config Layer** | Centralized database connection pooling to optimize network transaction latency. | MongoDB Connection Pool |

---

## 📂 System Project Structure

```text
├── client/                     # Frontend Viewport Layer (Vite + React)
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── OnboardingWizard.jsx
│   │   │   └── PinBoard.jsx    # Infinite Pixel Canvas Artboard
│   │   ├── App.jsx             # Main Dashboard, SVG Graph, & AI Chat Modals
│   │   └── main.jsx
│   └── public/                 # Static Asset Uncompiled Directory
│
└── server/                     # Backend API Portal (Node.js + Express)
    ├── config/
    │   └── db.js               # Centralized Connection Pool Manager
    ├── routes/
    │   ├── chat.js             # Natural Language Processing & Queries
    │   ├── onboarding.js       # Collection Discovery & Row Streaming
    │   └── pinboard.js         # Canvas State Persistence & Widget Generation
    └── server.js               # Main Core Express Bootstrapper

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

## 🚨 System Diagnostics & Troubleshooting

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