"use client";

import { motion } from "framer-motion";

interface ScoreBadgeProps {
  score: number;
}

function getScoreColor(score: number) {
  if (score >= 80) return { text: "text-emerald-500 dark:text-emerald-400" };
  if (score >= 60) return { text: "text-yellow-600 dark:text-yellow-400" };
  if (score >= 40) return { text: "text-orange-500 dark:text-orange-400" };
  return { text: "text-red-500 dark:text-red-400" };
}

function getScoreLabel(score: number) {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Needs Work";
  return "Poor";
}

export function ScoreBadge({ score }: ScoreBadgeProps) {
  const colors = getScoreColor(score);
  const circumference = 2 * Math.PI * 28;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className="flex flex-col items-center gap-1"
    >
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/50" />
          <motion.circle
            cx="32" cy="32" r="28"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            className={`stroke-current ${colors.text}`}
            style={{ strokeDasharray: circumference }}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xl font-bold tabular-nums ${colors.text}`}>{score}</span>
        </div>
      </div>
      <span className={`text-xs font-semibold ${colors.text}`}>{getScoreLabel(score)}</span>
    </motion.div>
  );
}
