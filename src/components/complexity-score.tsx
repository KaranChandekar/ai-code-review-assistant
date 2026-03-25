"use client";

import { motion } from "framer-motion";

interface ComplexityScoreProps {
  cyclomatic: number;
  cognitive: number;
  linesOfCode: number;
  rating: "simple" | "moderate" | "complex" | "very-complex";
}

const ratingConfig = {
  simple: { label: "Simple", color: "text-emerald-600 dark:text-emerald-400", bg: "from-emerald-500 to-green-400", percent: 25 },
  moderate: { label: "Moderate", color: "text-yellow-600 dark:text-yellow-400", bg: "from-yellow-500 to-amber-400", percent: 50 },
  complex: { label: "Complex", color: "text-orange-600 dark:text-orange-400", bg: "from-orange-500 to-amber-500", percent: 75 },
  "very-complex": { label: "Very Complex", color: "text-red-600 dark:text-red-400", bg: "from-red-500 to-rose-500", percent: 95 },
};

export function ComplexityScore({ cyclomatic, cognitive, linesOfCode, rating }: ComplexityScoreProps) {
  const config = ratingConfig[rating];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">Complexity</span>
        <span className={`text-sm font-bold ${config.color}`}>{config.label}</span>
      </div>

      <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${config.percent}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full bg-gradient-to-r ${config.bg}`}
        />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { value: cyclomatic, label: "Cyclomatic" },
          { value: cognitive, label: "Cognitive" },
          { value: linesOfCode, label: "Lines" },
        ].map(({ value, label }) => (
          <div key={label} className="rounded-lg border border-border bg-card/50 p-2.5">
            <div className="text-lg font-bold tabular-nums">{value}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
