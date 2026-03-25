"use client";

import { motion } from "framer-motion";

interface ScoreBadgeProps {
  score: number;
}

function getScoreColor(score: number) {
  if (score >= 80) return { bg: "bg-emerald-500/10", text: "text-emerald-500", ring: "ring-emerald-500/30" };
  if (score >= 60) return { bg: "bg-yellow-500/10", text: "text-yellow-500", ring: "ring-yellow-500/30" };
  if (score >= 40) return { bg: "bg-orange-500/10", text: "text-orange-500", ring: "ring-orange-500/30" };
  return { bg: "bg-red-500/10", text: "text-red-500", ring: "ring-red-500/30" };
}

function getScoreLabel(score: number) {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Needs Work";
  return "Poor";
}

export function ScoreBadge({ score }: ScoreBadgeProps) {
  const colors = getScoreColor(score);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 ring-1 ${colors.bg} ${colors.ring}`}
    >
      <span className={`text-2xl font-bold tabular-nums ${colors.text}`}>{score}</span>
      <span className={`text-sm font-medium ${colors.text}`}>{getScoreLabel(score)}</span>
    </motion.div>
  );
}
