"use client";

import { motion } from "framer-motion";
import { ScoreBadge } from "@/components/score-badge";
import { ComplexityScore } from "@/components/complexity-score";
import { IssueCard } from "@/components/issue-card";
import { CheckCircle, AlertTriangle, Lightbulb } from "lucide-react";
import type { Review } from "@/lib/schemas";

interface ReviewPanelProps {
  review: Review;
  code: string;
  language: string;
  onApplyFix: (fixedCode: string) => void;
}

export function ReviewPanel({ review, code, language, onApplyFix }: ReviewPanelProps) {
  const criticalCount = review.issues.filter(
    (i) => i.severity === "critical" || i.severity === "high"
  ).length;
  const sortedIssues = [...review.issues].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Header with Score */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="flex items-start gap-4">
          <div className="flex-1 space-y-2">
            <h2 className="text-base font-bold">Review Results</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {review.summary}
            </p>
          </div>
          <ScoreBadge score={review.overallScore} />
        </div>
      </div>

      {/* Complexity */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <ComplexityScore
          cyclomatic={review.complexityScore.cyclomatic}
          cognitive={review.complexityScore.cognitive}
          linesOfCode={review.complexityScore.linesOfCode}
          rating={review.complexityScore.rating}
        />
      </div>

      {/* Strengths */}
      {review.strengths.length > 0 && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 sm:p-5 space-y-2.5">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
            Strengths
          </h3>
          <ul className="space-y-1.5">
            {review.strengths.map((s, i) => (
              <li
                key={i}
                className="text-sm text-emerald-700 dark:text-emerald-300/80 flex items-start gap-2"
              >
                <span className="text-emerald-400 mt-0.5 shrink-0">+</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Issues */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2 px-1">
          <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
          Issues
          <span className="text-xs text-muted-foreground font-normal">
            ({sortedIssues.length} found)
          </span>
          {criticalCount > 0 && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
              {criticalCount} critical
            </span>
          )}
        </h3>
        {sortedIssues.length === 0 ? (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-400">
            No issues found. Great code!
          </div>
        ) : (
          <div className="space-y-2">
            {sortedIssues.map((issue, i) => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <IssueCard
                  issue={issue}
                  code={code}
                  language={language}
                  onApplyFix={onApplyFix}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Architecture Suggestions */}
      {review.architectureSuggestions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2 px-1">
            <Lightbulb className="h-4 w-4 text-violet-500 dark:text-violet-400" />
            Architecture Suggestions
          </h3>
          <div className="space-y-2">
            {review.architectureSuggestions.map((suggestion, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card p-4 space-y-1.5"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold">{suggestion.title}</span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      suggestion.priority === "high"
                        ? "bg-red-500/10 text-red-400"
                        : suggestion.priority === "medium"
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-blue-500/10 text-blue-400"
                    }`}
                  >
                    {suggestion.priority}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {suggestion.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
