# 🌐 QuickSites Studio — Core Portal & Infinite Workspace

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
