# VIBER

> High-performance multi-model intelligence studio featuring interactive 3D WebGL core visualization and real-time streaming pipeline synthesis.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-black?style=flat-square&logo=three.js)](https://threejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## Overview

**VIBER** is an advanced cognitive workspace designed for orchestrating and synthesizing multi-model intelligence in real time. It combines an interactive WebGL 3D neural visualization core with a structured multi-stage execution pipeline, allowing users to benchmark, parallelize, and synthesize responses across leading model providers.

### Key Capabilities

- **Interactive 3D WebGL Core**: Real-time Three.js neural core featuring orbital telemetry rings, responsive particle aura, and dynamic state reactivity.
- **Direct Streaming Workspace**: Instant single-prompt execution with SSE (Server-Sent Events) streaming and on-the-fly API key injection.
- **Multi-Worker Synthesis Matrix**: 4-stage pipeline (**01. Research → 02. Reasoning → 03. Coding → 04. Synthesis**) executing 3 parallel worker streams per stage consolidated by an executive master model.
- **Multi-Provider Engine**: Unified routing across OpenRouter, Groq, OpenAI, Anthropic, Google Gemini, xAI, Mistral, Cohere, and Together AI.
- **Modern Full-Stack Architecture**: Built with Next.js 16 App Router, React 19, Tailwind CSS v4, Zustand state management, and SQLite/PostgreSQL with Prisma ORM.

---

## Architecture

```
┌────────────────────────────────────────────────────────┐
│                      VIBER CLIENT                      │
│      Next.js 16 App Router + Three.js 3D WebGL Core    │
└───────────────────────────┬────────────────────────────┘
                            │
               SSE / HTTP POST Requests
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                   STREAMING ROUTER                     │
│         /api/stream/chat  &  /api/stream/[stage]       │
└───────────────────────────┬────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
    Worker Model 1     Worker Model 2     Worker Model 3
    (Research / Fast)  (Deep Reasoning)   (Specialized)
         │                  │                  │
         └──────────────────┼──────────────────┘
                            ▼
               Executive Synthesis Master
               (Unified Consensus Output)
```

---

## Getting Started

### Prerequisites

- **Node.js**: `v20.x` or later (tested on Node v24)
- **Package Manager**: `npm`, `pnpm`, or `yarn`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/<your-username>/VIBER.git
   cd VIBER/viber-ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   Add any provider API keys you wish to use (e.g. `OPENROUTER_API_KEY`, `GROQ_API_KEY`, `OPENAI_API_KEY`, or `GOOGLE_API_KEY`). Alternatively, provide your key directly in the UI dock.

4. **Initialize database schema**:
   ```bash
   npx prisma db push
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Supported Providers

| Provider | Environment Variable | Recommended Models |
|---|---|---|
| **OpenRouter** | `OPENROUTER_API_KEY` | `meta-llama/llama-3.3-70b-instruct`, `anthropic/claude-3.5-haiku` |
| **Groq** | `GROQ_API_KEY` | `llama-3.3-70b-versatile`, `llama-3.1-8b-instant` |
| **OpenAI** | `OPENAI_API_KEY` | `gpt-4o`, `gpt-4o-mini` |
| **Anthropic** | `ANTHROPIC_API_KEY` | `claude-3-5-sonnet-latest`, `claude-3-5-haiku-latest` |
| **Google Gemini** | `GOOGLE_API_KEY` | `gemini-2.0-flash`, `gemini-1.5-pro` |
| **xAI** | `XAI_API_KEY` | `grok-2-latest` |
| **Mistral** | `MISTRAL_API_KEY` | `mistral-large-latest`, `mistral-small-latest` |
| **Cohere** | `COHERE_API_KEY` | `command-r-plus`, `command-r` |
| **Together AI** | `TOGETHER_API_KEY` | `meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo` |

---

## Project Structure

```
viber-ai/
├── prisma/
│   └── schema.prisma         # Database schema for users, sessions & logs
├── public/                   # Static branding assets and icons
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── models/       # Dynamic model discovery
│   │   │   └── stream/       # Direct chat & staged SSE streaming endpoints
│   │   ├── layout.tsx        # Root layout, fonts & metadata
│   │   └── page.tsx          # Main application workspace
│   ├── components/
│   │   ├── ui/               # Radix UI foundational components
│   │   ├── ViberAssistantWorkspace.tsx  # Interactive chat and matrix mode
│   │   ├── ViberCoreOrb.tsx             # Interactive 3D WebGL core
│   │   ├── ViberOverviewPanel.tsx       # Matrix telemetry & stage monitor
│   │   ├── ViberPromptDock.tsx          # Execution dock with API key input
│   │   └── ViberSidebarNav.tsx          # Navigation controls
│   └── lib/
│       ├── providers/        # Provider adapter integrations
│       ├── store/            # Zustand client state management
│       ├── auth.ts           # Authentication configuration
│       └── db.ts             # Prisma client instance
├── package.json
└── tsconfig.json
```

---

## Production Build

To build the project for production:

```bash
npm run build
npm run start
```

---

## License

This project is licensed under the [MIT License](LICENSE).