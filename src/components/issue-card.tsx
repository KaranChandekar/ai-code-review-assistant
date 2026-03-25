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
  critical: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
  high: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
  low: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  info: "bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/30",
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
    <div className="rounded-xl border border-border bg-card overflow-hidden transition-colors hover:border-border/80">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-muted/30 transition-colors"
      >
        <span className="text-base">{typeIcons[issue.type]}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{issue.title}</span>
            <Badge
              variant="outline"
              className={`text-[10px] font-bold uppercase tracking-wider ${severityColors[issue.severity]}`}
            >
              {issue.severity}
            </Badge>
            <span className="text-[11px] text-muted-foreground font-mono">
              L{issue.lineStart}
              {issue.lineEnd !== issue.lineStart ? `-${issue.lineEnd}` : ""}
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
            <div className="px-3.5 pb-3.5 space-y-3 border-t border-border pt-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {issue.description}
              </p>

              {issue.suggestion && (
                <div className="rounded-lg bg-muted/30 border border-border p-3">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-2">
                    Suggested fix
                  </p>
                  <pre className="text-xs overflow-x-auto whitespace-pre-wrap font-mono text-foreground/80">
                    <code>{issue.suggestion}</code>
                  </pre>
                </div>
              )}

              {issue.explanation && (
                <p className="text-xs text-muted-foreground italic leading-relaxed">
                  {issue.explanation}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGenerateFix}
                  disabled={loading}
                  className="text-xs"
                >
                  {loading ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Wrench className="h-3 w-3 mr-1" />
                  )}
                  {fixedCode ? "Regenerate" : "Generate Fix"}
                </Button>
                {fixedCode && (
                  <Button
                    size="sm"
                    onClick={() => onApplyFix(fixedCode)}
                    className="text-xs bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 hover:from-violet-500 hover:to-indigo-500"
                  >
                    Apply Fix
                  </Button>
                )}
              </div>

              {fixedCode && (
                <div className="pt-1">
                  <DiffViewer original={code} modified={fixedCode} language={language} />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
