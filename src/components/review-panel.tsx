"use client";

import { motion } from "framer-motion";
import { ScoreBadge } from "@/components/score-badge";
import { ComplexityScore } from "@/components/complexity-score";
import { IssueCard } from "@/components/issue-card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, AlertTriangle, Lightbulb } from "lucide-react";
import type { Review } from "@/lib/schemas";

interface ReviewPanelProps {
  review: Review;
  code: string;
  language: string;
  onApplyFix: (fixedCode: string) => void;
}

export function ReviewPanel({ review, code, language, onApplyFix }: ReviewPanelProps) {
  const criticalCount = review.issues.filter((i) => i.severity === "critical" || i.severity === "high").length;
  const sortedIssues = [...review.issues].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Review Results</h2>
          <p className="text-sm text-muted-foreground">{review.summary}</p>
        </div>
        <ScoreBadge score={review.overallScore} />
      </div>

      <Separator />

      {/* Complexity */}
      <ComplexityScore
        cyclomatic={review.complexityScore.cyclomatic}
        cognitive={review.complexityScore.cognitive}
        linesOfCode={review.complexityScore.linesOfCode}
        rating={review.complexityScore.rating}
      />

      <Separator />

      {/* Strengths */}
      {review.strengths.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            Strengths
          </h3>
          <ul className="space-y-1">
            {review.strengths.map((s, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">+</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Separator />

      {/* Issues */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          Issues
          {criticalCount > 0 && (
            <span className="text-xs text-red-500 font-normal">
              ({criticalCount} critical/high)
            </span>
          )}
        </h3>
        {sortedIssues.length === 0 ? (
          <p className="text-sm text-muted-foreground">No issues found. Great code!</p>
        ) : (
          <div className="space-y-2">
            {sortedIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                code={code}
                language={language}
                onApplyFix={onApplyFix}
              />
            ))}
          </div>
        )}
      </div>

      {/* Architecture Suggestions */}
      {review.architectureSuggestions.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-blue-500" />
              Architecture Suggestions
            </h3>
            {review.architectureSuggestions.map((suggestion, i) => (
              <div key={i} className="rounded-lg border border-border p-3 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{suggestion.title}</span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      suggestion.priority === "high"
                        ? "bg-red-500/10 text-red-500"
                        : suggestion.priority === "medium"
                        ? "bg-yellow-500/10 text-yellow-500"
                        : "bg-blue-500/10 text-blue-500"
                    }`}
                  >
                    {suggestion.priority}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{suggestion.description}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}
