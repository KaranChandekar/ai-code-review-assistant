"use client";

import Editor, { type Monaco } from "@monaco-editor/react";
import { useRef, useCallback } from "react";
import type { editor } from "monaco-editor";
import type { Issue } from "@/lib/schemas";

interface CodeEditorProps {
  code: string;
  language: string;
  issues?: Issue[];
  onChange: (value: string) => void;
}

const severityToClassName: Record<string, string> = {
  critical: "issue-line-critical",
  high: "issue-line-high",
  medium: "issue-line-medium",
  low: "issue-line-low",
  info: "issue-line-info",
};

export function CodeEditor({ code, language, issues, onChange }: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<editor.IEditorDecorationsCollection | null>(null);

  const applyDecorations = useCallback(
    (editorInstance: editor.IStandaloneCodeEditor, issueList: Issue[]) => {
      if (decorationsRef.current) {
        decorationsRef.current.clear();
      }

      const decorations: editor.IModelDeltaDecoration[] = issueList.map((issue) => ({
        range: {
          startLineNumber: issue.lineStart,
          startColumn: 1,
          endLineNumber: issue.lineEnd,
          endColumn: 1,
        },
        options: {
          isWholeLine: true,
          className: severityToClassName[issue.severity] || "issue-line-info",
          glyphMarginClassName: `issue-glyph-${issue.severity}`,
          glyphMarginHoverMessage: { value: `**${issue.title}**\n\n${issue.description}` },
          overviewRuler: {
            color:
              issue.severity === "critical"
                ? "#ef4444"
                : issue.severity === "high"
                ? "#f97316"
                : issue.severity === "medium"
                ? "#eab308"
                : "#3b82f6",
            position: 1,
          },
        },
      }));

      decorationsRef.current = editorInstance.createDecorationsCollection(decorations);
    },
    []
  );

  const handleEditorMount = (editorInstance: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editorInstance;

    // Inject custom CSS for glyph margin and line highlights
    const styleEl = document.createElement("style");
    styleEl.textContent = `
      .issue-line-critical { background: rgba(239, 68, 68, 0.08) !important; }
      .issue-line-high { background: rgba(249, 115, 22, 0.08) !important; }
      .issue-line-medium { background: rgba(234, 179, 8, 0.06) !important; }
      .issue-line-low { background: rgba(59, 130, 246, 0.05) !important; }
      .issue-line-info { background: rgba(107, 114, 128, 0.04) !important; }
      .issue-glyph-critical,
      .issue-glyph-high,
      .issue-glyph-medium,
      .issue-glyph-low,
      .issue-glyph-info {
        width: 8px !important;
        height: 8px !important;
        border-radius: 50%;
        margin-left: 4px;
        margin-top: 6px;
      }
      .issue-glyph-critical { background: #ef4444 !important; }
      .issue-glyph-high { background: #f97316 !important; }
      .issue-glyph-medium { background: #eab308 !important; }
      .issue-glyph-low { background: #3b82f6 !important; }
      .issue-glyph-info { background: #6b7280 !important; }
    `;
    document.head.appendChild(styleEl);

    // Add keyboard shortcut for Cmd+Enter
    editorInstance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      document.getElementById("review-btn")?.click();
    });

    if (issues && issues.length > 0) {
      applyDecorations(editorInstance, issues);
    }
  };

  // Re-apply decorations when issues change
  if (editorRef.current && issues) {
    applyDecorations(editorRef.current, issues);
  }

  return (
    <div className="rounded-lg overflow-hidden border border-border">
      <Editor
        height="500px"
        language={language}
        value={code}
        onChange={(v) => onChange(v || "")}
        theme="vs-dark"
        onMount={handleEditorMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          glyphMargin: true,
          folding: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: "on",
          padding: { top: 12 },
        }}
      />
    </div>
  );
}
