# AI Code Review Assistant

A Next.js 15 application where users paste or upload code and get instant, structured AI-powered reviews covering bugs, security vulnerabilities, performance bottlenecks, and architecture suggestions — with side-by-side diff previews for suggested fixes.

## Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 16** (App Router) | Full-stack React framework with TypeScript (strict mode) |
| **Vercel AI SDK** + **Google Gemini** (`gemini-2.5-flash`) | Structured AI code analysis via `generateObject()` |
| **Monaco Editor** (`@monaco-editor/react`) | VS Code editor engine for code input and diff views |
| **Zod** | Type-safe schema validation for AI structured outputs |
| **shadcn/ui** + **Tailwind CSS** | Component library and utility-first styling |
| **Framer Motion** | Animations and transitions |
| **Lucide React** | Icon library |

## Getting Started

### Prerequisites

- Node.js 18+
- A Google Gemini API key ([get one here](https://aistudio.google.com/apikey))

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your GOOGLE_GENERATIVE_AI_API_KEY

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                 # Root layout with fonts, theme provider, and anti-flash script
│   ├── page.tsx                   # Main page — editor + review panel side-by-side
│   ├── globals.css                # Tailwind config, CSS variables for light/dark themes
│   └── api/
│       ├── review/route.ts        # POST — sends code to Gemini, returns structured review
│       └── fix/route.ts           # POST — generates a complete fixed version of the code
│
├── components/
│   ├── code-editor.tsx            # Monaco Editor wrapper with glyph decorations for issues
│   ├── review-panel.tsx           # Full review results layout (score, complexity, issues, suggestions)
│   ├── issue-card.tsx             # Expandable issue card with severity badge, fix generation, diff
│   ├── diff-viewer.tsx            # Monaco DiffEditor for side-by-side original vs. fixed code
│   ├── complexity-score.tsx       # Visual complexity gauge (cyclomatic, cognitive, LOC)
│   ├── score-badge.tsx            # Animated circular SVG score ring (0–100)
│   ├── language-selector.tsx      # Language dropdown with 12 languages
│   ├── theme-provider.tsx         # Light/dark/system theme context with localStorage persistence
│   ├── theme-toggle.tsx           # Theme cycle button (Sun → Moon → Monitor)
│   └── ui/                        # shadcn/ui primitives (button, card, badge, accordion, etc.)
│
├── lib/
│   ├── ai.ts                     # AI model configuration (Google Gemini)
│   ├── schemas.ts                # Zod schemas for ReviewSchema and IssueSchema
│   ├── complexity.ts             # Client-side cyclomatic/cognitive complexity calculator
│   ├── languages.ts              # Language configs, file extensions, and auto-detection
│   └── utils.ts                  # Tailwind class merge utility (cn)
│
└── types/                         # (reserved for additional TypeScript types)
```

## Application Flow

### 1. Code Input

Users interact with the app through the main page (`page.tsx`), which presents a two-panel layout:

- **Left panel** — A Monaco Editor instance where users can:
  - Paste code directly
  - Upload a file via the toolbar (supports `.ts`, `.js`, `.py`, `.go`, `.rs`, `.java`, `.cs`, `.cpp`, `.rb`, `.php`, `.swift`, `.kt`)
  - Select a language manually or rely on auto-detection (`lib/languages.ts`)
  - Use `Cmd+Enter` keyboard shortcut to trigger a review

- **Right panel** — Review results (initially shows a "Ready to Review" empty state)

### 2. AI Review (`POST /api/review`)

When the user clicks **"Review Code"**:

1. The client sends `{ code, language }` to `/api/review/route.ts`
2. The route uses Vercel AI SDK's `generateObject()` with a Zod schema (`ReviewSchema`) to get **structured, type-safe output** from Google Gemini — not free-form text
3. The AI analyzes the code for:
   - Bugs and logical errors
   - Security vulnerabilities (injection, XSS, exposed secrets)
   - Performance problems (memory leaks, N+1 queries)
   - Code style and best practices
   - Architecture and design patterns
4. The response includes:
   - `summary` — 2-3 sentence assessment
   - `overallScore` — 0–100 quality score
   - `issues[]` — each with type, severity, line numbers, description, suggested fix, and explanation
   - `strengths[]` — what the code does well
   - `complexityScore` — cyclomatic, cognitive, LOC, and rating
   - `architectureSuggestions[]` — high-level design improvements

### 3. Review Display

The `ReviewPanel` renders the structured response:

- **Score Badge** — Animated circular SVG ring showing the overall quality score with color coding (green/yellow/orange/red)
- **Complexity Score** — Gradient progress bar with cyclomatic, cognitive, and LOC metrics
- **Strengths** — Green-tinted card listing positive aspects
- **Issues** — Sorted by severity (critical first), each rendered as an expandable `IssueCard` with:
  - Type icon (bug, security, performance, style, architecture)
  - Severity badge (critical/high/medium/low/info)
  - Line number reference
  - Description and suggested fix code
- **Architecture Suggestions** — Priority-tagged design improvement cards

### 4. Fix Generation (`POST /api/fix`)

When a user expands an issue and clicks **"Generate Fix"**:

1. The client sends `{ code, language, issue }` to `/api/fix/route.ts`
2. Gemini generates the **complete code** with only that specific fix applied
3. A **Monaco DiffEditor** renders showing the original vs. fixed code side-by-side
4. Clicking **"Apply Fix"** replaces the editor content with the fixed version and clears the review

### 5. Editor Decorations

When a review is active, the Monaco Editor highlights flagged lines:

- Colored left border per severity (red for critical, orange for high, yellow for medium, blue for low)
- Glyph margin dots for quick visual scanning
- Hover messages showing the issue title and description
- Overview ruler markers for scrollbar navigation

## Theme System

The app supports **light**, **dark**, and **system** (follows OS preference) themes:

- A blocking `<script>` in the layout reads `localStorage` before React hydrates, preventing flash of wrong theme
- `ThemeProvider` manages state via React Context and syncs with `localStorage`
- Monaco editors dynamically switch between `vs-dark` and `light` themes
- All UI colors use CSS custom properties with `:root` (light) and `.dark` variants

Toggle themes via the Sun/Moon/Monitor button in the header toolbar.

## Supported Languages

TypeScript, JavaScript, Python, Go, Rust, Java, C#, C++, Ruby, PHP, Swift, Kotlin

Auto-detection works on paste by matching common syntax patterns (imports, keywords, preprocessor directives).

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Yes | Google Gemini API key for code analysis |

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```
