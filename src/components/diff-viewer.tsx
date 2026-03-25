"use client";

import { DiffEditor } from "@monaco-editor/react";
import { useTheme } from "@/components/theme-provider";

interface DiffViewerProps {
  original: string;
  modified: string;
  language: string;
}

export function DiffViewer({ original, modified, language }: DiffViewerProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="rounded-lg overflow-hidden border border-border">
      <div
        className={`flex items-center justify-between px-3 py-1.5 border-b ${
          isDark
            ? "bg-[#252526] border-[#3c3c3c]"
            : "bg-[#f3f3f3] border-[#e0e0e0]"
        }`}
      >
        <span
          className={`text-[10px] uppercase tracking-wider font-bold ${
            isDark ? "text-[#808080]" : "text-[#666]"
          }`}
        >
          Diff Preview
        </span>
        <div className="flex gap-3 text-[10px] font-mono">
          <span className="text-red-500 dark:text-red-400">Original</span>
          <span className="text-emerald-600 dark:text-emerald-400">Fixed</span>
        </div>
      </div>
      <DiffEditor
        height="280px"
        language={language}
        original={original}
        modified={modified}
        theme={isDark ? "vs-dark" : "light"}
        options={{
          readOnly: true,
          renderSideBySide: true,
          minimap: { enabled: false },
          fontSize: 12,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          fontFamily: "var(--font-geist-mono), 'Fira Code', Menlo, monospace",
        }}
      />
    </div>
  );
}
