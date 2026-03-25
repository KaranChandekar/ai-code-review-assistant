"use client";

import { DiffEditor } from "@monaco-editor/react";

interface DiffViewerProps {
  original: string;
  modified: string;
  language: string;
}

export function DiffViewer({ original, modified, language }: DiffViewerProps) {
  return (
    <div className="rounded-md overflow-hidden border border-border">
      <DiffEditor
        height="300px"
        language={language}
        original={original}
        modified={modified}
        theme="vs-dark"
        options={{
          readOnly: true,
          renderSideBySide: true,
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
}
