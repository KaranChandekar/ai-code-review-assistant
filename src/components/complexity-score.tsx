"use client";

import { motion } from "framer-motion";

interface ComplexityScoreProps {
  cyclomatic: number;
  cognitive: number;
  linesOfCode: number;
  rating: "simple" | "moderate" | "complex" | "very-complex";
}

const ratingConfig = {
  simple: { label: "Simple", color: "text-emerald-500", bg: "bg-emerald-500", percent: 25 },
  moderate: { label: "Moderate", color: "text-yellow-500", bg: "bg-yellow-500", percent: 50 },
  complex: { label: "Complex", color: "text-orange-500", bg: "bg-orange-500", percent: 75 },
  "very-complex": { label: "Very Complex", color: "text-red-500", bg: "bg-red-500", percent: 95 },
};

export function ComplexityScore({ cyclomatic, cognitive, linesOfCode, rating }: ComplexityScoreProps) {
  const config = ratingConfig[rating];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Complexity</span>
        <span className={`text-sm font-semibold ${config.color}`}>{config.label}</span>
      </div>

      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${config.percent}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${config.bg}`}
        />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-md bg-muted/50 p-2">
          <div className="text-lg font-bold tabular-nums">{cyclomatic}</div>
          <div className="text-xs text-muted-foreground">Cyclomatic</div>
        </div>
        <div className="rounded-md bg-muted/50 p-2">
          <div className="text-lg font-bold tabular-nums">{cognitive}</div>
          <div className="text-xs text-muted-foreground">Cognitive</div>
        </div>
        <div className="rounded-md bg-muted/50 p-2">
          <div className="text-lg font-bold tabular-nums">{linesOfCode}</div>
          <div className="text-xs text-muted-foreground">Lines</div>
        </div>
      </div>
    </div>
  );
}
