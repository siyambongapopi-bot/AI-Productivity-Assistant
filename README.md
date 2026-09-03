# AI-Productivity-Assistant

A professional AI productivity dashboard that turns messy meeting notes, scattered tasks and open
research questions into structured, actionable output.

## Project Overview

Knowledge workers lose time re-reading meeting notes, deciding what to do next and skimming long
articles. AI-Productivity-Assistant solves that with three focused AI tools inside one clean SaaS
style dashboard: a meeting notes summarizer, a task planner/scheduler and a research assistant.

## Features

- **Meeting Notes Summarizer** — paste or upload notes and get a summary, key discussion points,
  decisions, an action item table (task / owner / priority) and extracted deadlines. Action items
  can be converted into tasks in one click.
- **AI Task Planner** — capture tasks with priority, deadline, estimated duration and notes.
- **Daily Scheduler** — a realistic single-day timetable including breaks.
- **Weekly Scheduler** — a Monday–Friday plan spread across the week.
- **Task Prioritization** — an ordered list with the reasoning behind each position.
- **AI Research Assistant** — overview, key insights, main arguments, recommendations, further
  questions and an honest sources statement.
- **Dashboard** — greeting, productivity stats, quick actions and recent activity.
- **My Tasks / History / Settings / Help** — task management, activity timeline and preferences.
- **AI states** — empty, loading (skeleton + status text), success and friendly error with retry.
- **Responsive design** — persistent collapsible sidebar on desktop, slide-out menu on mobile,
  stacked cards and horizontally scrollable tables.
- **Responsible AI disclaimer** — shown on every AI tool page.

## Tools Used

- React 19 + TypeScript
- TanStack Start (SSR framework) and TanStack Router
- TanStack Query
- Tailwind CSS v4 + shadcn/ui components
- lucide-react icons, sonner toasts, zod validation
- Lovable AI Gateway (Google Gemini model) via server functions
- Vite, ESLint, Prettier, Git / GitHub

## Setup Instructions

```bash
git clone https://github.com/<your-username>/AI-Productivity-Assistant.git
cd AI-Productivity-Assistant
npm install          # or bun install
npm run dev          # starts the dev server on http://localhost:8080
```

Environment variables (server-side only, never committed):

```
LOVABLE_API_KEY=<your AI gateway key>
```

The key is read only inside server functions. It is never bundled into client code and must never
be committed to the repository.

Build for production:

```bash
npm run build
```

## Team Members

- Siyambonga — Developer (individual project)

## Project Structure

```
src/
├── components/
│   ├── AppShell.tsx        # header, sidebar, mobile navigation, page layout
│   ├── AiStates.tsx        # empty / loading / error states, disclaimer, badges
│   └── ui/                 # shadcn/ui primitives
├── lib/
│   ├── ai.server.ts        # AI gateway client (server only)
│   ├── ai.functions.ts     # typed server functions for the three AI tools
│   ├── store.ts            # local task + history storage hooks
│   └── utils.ts
├── routes/
│   ├── __root.tsx          # root layout
│   ├── index.tsx           # Dashboard
│   ├── meeting-summarizer.tsx
│   ├── task-planner.tsx
│   ├── research.tsx
│   ├── tasks.tsx
│   ├── history.tsx
│   ├── settings.tsx
│   └── help.tsx
└── styles.css              # design tokens (colors, radii, shadows)
```

## AI Safety / Responsible AI

- **Uncertainty** — the model is instructed to mark unknown owners, priorities, dates or decisions
  as "Uncertain" rather than guessing.
- **Hallucination control** — prompts forbid inventing people, deadlines, statistics, studies or
  URLs. The research tool has no live web access and states that its answer is based on the text
  you supplied plus general knowledge; it does not fabricate citations.
- **User verification** — a visible disclaimer on every AI page asks users to review outputs before
  relying on them and to verify research independently for academic or professional use.
- **Incorrect information** — every tool exposes a clear error state with a retry action, and all
  output is editable (tasks can be edited or deleted after creation).
- **Privacy** — tasks and history stay in the browser's local storage. Text sent to the AI service
  is used only to produce the response. Secrets stay server-side.
