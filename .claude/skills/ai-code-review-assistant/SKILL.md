---
name: ai-code-review-assistant
description: "Build an AI-powered code review and architecture assistant that analyzes code for bugs, security vulnerabilities, performance issues, and suggests fixes with diff previews. Use this skill whenever the user wants to work on the code review project, mentions code analysis, code review tool, security scanning, Monaco editor, diff viewer, code quality, or wants to build/extend/debug any part of this application. Also trigger when the user mentions structured outputs, Zod schemas for AI, or Groq in the context of this project."
---

# AI Code Review & Architecture Assistant

## What You're Building

A Next.js application where users paste or upload code and get instant AI-powered reviews covering bugs, security vulnerabilities, performance bottlenecks, and architectural suggestions. The tool supports multiple languages, generates fix suggestions with side-by-side diff previews, and shows code complexity scoring.

## Architecture Overview

```
app/
├── layout.tsx
├── page.tsx                      # Code input + review display
├── api/
│   ├── review/route.ts           # AI code review endpoint
│   └── fix/route.ts              # Generate fix suggestions
├── components/
│   ├── code-editor.tsx           # Monaco Editor wrapper
│   ├── review-panel.tsx          # Review results display
│   ├── issue-card.tsx            # Individual issue with severity
│   ├── diff-viewer.tsx           # Side-by-side fix preview
│   ├── complexity-score.tsx      # Visual complexity gauge
│   ├── language-selector.tsx     # Language detection/selection
│   └── review-history.tsx        # Past reviews
├── lib/
│   ├── ai.ts                    # AI SDK config
│   ├── schemas.ts               # Zod schemas for review structure
│   ├── complexity.ts            # Cyclomatic complexity calculator
│   └── languages.ts             # Language configs
└── types/
    └── review.ts
```

## Tech Stack & Setup

```bash
npx create-next-app@latest code-review --typescript --tailwind --eslint --app
cd code-review

# Core AI
npm install ai @ai-sdk/google zod

# Code editor
npm install @monaco-editor/react monaco-editor

# Syntax highlighting for diffs
npm install shiki diff

# UI
npm install framer-motion lucide-react
npx shadcn@latest init
npx shadcn@latest add button card tabs badge separator accordion alert
```

### Environment Variables

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key   # Or use Groq for ultra-fast reviews
# GROQ_API_KEY=your_groq_key                   # Optional: faster inference
```

## Core Implementation Strategy

### 1. Structured Review Schema

The AI must return structured, type-safe review data — not free-form text. This is what makes this project impressive.

```typescript
// lib/schemas.ts
import { z } from "zod";

const IssueSchema = z.object({
  id: z.string(),
  type: z.enum(["bug", "security", "performance", "style", "architecture"]),
  severity: z.enum(["critical", "high", "medium", "low", "info"]),
  title: z.string(),
  description: z.string(),
  lineStart: z.number(),
  lineEnd: z.number(),
  suggestion: z.string().describe("The suggested fix as code"),
  explanation: z.string().describe("Why this fix is better"),
});

export const ReviewSchema = z.object({
  summary: z.string().describe("2-3 sentence overall assessment"),
  overallScore: z.number().min(0).max(100),
  issues: z.array(IssueSchema),
  strengths: z.array(z.string()).describe("What the code does well"),
  complexityScore: z.object({
    cyclomatic: z.number(),
    cognitive: z.number(),
    linesOfCode: z.number(),
    rating: z.enum(["simple", "moderate", "complex", "very-complex"]),
  }),
  architectureSuggestions: z.array(z.object({
    title: z.string(),
    description: z.string(),
    priority: z.enum(["high", "medium", "low"]),
  })),
});
```

### 2. AI Review Endpoint

```typescript
// app/api/review/route.ts
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { ReviewSchema } from "@/lib/schemas";

export async function POST(req: Request) {
  const { code, language } = await req.json();

  const { object: review } = await generateObject({
    model: google("gemini-2.5-flash"),
    schema: ReviewSchema,
    prompt: `You are a senior software engineer conducting a thorough code review.

Language: ${language}
Code:
\`\`\`${language}
${code}
\`\`\`

Review this code for:
1. Bugs and logical errors
2. Security vulnerabilities (injection, XSS, auth issues, exposed secrets)
3. Performance problems (unnecessary re-renders, N+1 queries, memory leaks)
4. Code style and best practices
5. Architecture and design patterns

Be specific about line numbers. For each issue, provide a concrete fix.`,
  });

  return Response.json(review);
}
```

### 3. Monaco Editor Integration

```typescript
// components/code-editor.tsx
"use client";
import Editor from "@monaco-editor/react";
import { useState } from "react";

export function CodeEditor({ onReview }) {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("typescript");

  // Add decorations to highlight issues on lines
  const highlightIssues = (editor, issues) => {
    const decorations = issues.map(issue => ({
      range: new monaco.Range(issue.lineStart, 1, issue.lineEnd, 1),
      options: {
        isWholeLine: true,
        className: severityToClass(issue.severity),
        glyphMarginClassName: "issue-glyph",
        hoverMessage: { value: `**${issue.title}**\n${issue.description}` },
      },
    }));
    editor.deltaDecorations([], decorations);
  };

  return (
    <Editor
      height="500px"
      language={language}
      value={code}
      onChange={setCode}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: "on",
        glyphMargin: true,
      }}
    />
  );
}
```

### 4. Side-by-Side Diff Viewer

```typescript
// components/diff-viewer.tsx
import { DiffEditor } from "@monaco-editor/react";

export function DiffViewer({ original, modified, language }) {
  return (
    <DiffEditor
      height="300px"
      language={language}
      original={original}
      modified={modified}
      theme="vs-dark"
      options={{ readOnly: true, renderSideBySide: true }}
    />
  );
}
```

## Implementation Phases

### Phase 1: Core Review (Week 1)
- Monaco Editor with language selection
- AI review endpoint with structured Zod schema
- Review results panel with severity badges
- Line highlighting in editor for flagged issues
- Basic complexity scoring

### Phase 2: Fix Suggestions (Week 2)
- "Apply Fix" button for each issue
- Side-by-side diff viewer showing before/after
- One-click apply all suggested fixes
- Review history (localStorage or Supabase)
- Multiple language support (JS, TS, Python, Go, Rust)

### Phase 3: Polish (Week 3)
- Code complexity trend tracking (over multiple reviews)
- Shareable review links
- Dark/light editor themes
- Keyboard shortcuts (Cmd+Enter to review)
- Export review as markdown report
- Mobile-responsive layout

## Free Resources

| Resource | Purpose | Free Tier |
|----------|---------|-----------|
| Google Gemini API | Code analysis | ~1M tokens/day |
| Groq (optional) | Ultra-fast reviews | Free tier |
| Monaco Editor | Code editing | Open source (MIT) |
| Vercel | Hosting | 100GB bandwidth |
| shadcn/ui | UI components | Open source |

## Resume Talking Points

- **Structured AI outputs**: Using `generateObject()` with Zod ensures type-safe, predictable AI responses — a production-grade pattern.
- **Monaco Editor**: Embedding the VS Code editor engine shows you can integrate complex third-party libraries.
- **Developer tooling**: Interviewers who try this and find it useful will remember your project.
- **Multi-language analysis**: Shows the AI prompt engineering required to handle different language paradigms.
