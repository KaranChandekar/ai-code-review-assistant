"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DiffViewer } from "@/components/diff-viewer";
import { ChevronDown, ChevronUp, Wrench, Loader2 } from "lucide-react";
import type { Issue } from "@/lib/schemas";

interface IssueCardProps {
  issue: Issue;
  code: string;
  language: string;
  onApplyFix: (fixedCode: string) => void;
}

const severityColors: Record<string, string> = {
  critical: "bg-red-500/10 text-red-500 border-red-500/30",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/30",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  low: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  info: "bg-gray-500/10 text-gray-400 border-gray-500/30",
};

const typeIcons: Record<string, string> = {
  bug: "🐛",
  security: "🔒",
  performance: "⚡",
  style: "✨",
  architecture: "🏗️",
};

export function IssueCard({ issue, code, language, onApplyFix }: IssueCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [fixedCode, setFixedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateFix = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, issue }),
      });
      const data = await res.json();
      if (data.fixedCode) {
        setFixedCode(data.fixedCode);
      }
    } catch {
      console.error("Failed to generate fix");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-border bg-card overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors"
      >
        <span className="text-lg">{typeIcons[issue.type]}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{issue.title}</span>
            <Badge variant="outline" className={`text-xs ${severityColors[issue.severity]}`}>
              {issue.severity}
            </Badge>
            <span className="text-xs text-muted-foreground">
              L{issue.lineStart}{issue.lineEnd !== issue.lineStart ? `-${issue.lineEnd}` : ""}
            </span>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
              <p className="text-sm text-muted-foreground">{issue.description}</p>

              {issue.suggestion && (
                <div className="rounded-md bg-muted/50 p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Suggested fix:</p>
                  <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                    <code>{issue.suggestion}</code>
                  </pre>
                </div>
              )}

              {issue.explanation && (
                <p className="text-xs text-muted-foreground italic">{issue.explanation}</p>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGenerateFix}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Wrench className="h-3 w-3 mr-1" />
                  )}
                  {fixedCode ? "Regenerate Fix" : "Generate Fix"}
                </Button>
                {fixedCode && (
                  <Button size="sm" onClick={() => onApplyFix(fixedCode)}>
                    Apply Fix
                  </Button>
                )}
              </div>

              {fixedCode && (
                <DiffViewer original={code} modified={fixedCode} language={language} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
