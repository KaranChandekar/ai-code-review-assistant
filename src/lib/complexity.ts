export interface ComplexityResult {
  cyclomatic: number;
  cognitive: number;
  linesOfCode: number;
  rating: "simple" | "moderate" | "complex" | "very-complex";
}

export function calculateComplexity(code: string): ComplexityResult {
  const lines = code.split("\n");
  const linesOfCode = lines.filter((l) => l.trim().length > 0 && !l.trim().startsWith("//") && !l.trim().startsWith("#")).length;

  // Cyclomatic complexity: count decision points
  const decisionPatterns = [
    /\bif\b/g,
    /\belse\s+if\b/g,
    /\bwhile\b/g,
    /\bfor\b/g,
    /\bcase\b/g,
    /\bcatch\b/g,
    /\b\?\?/g,
    /\?\./g,
    /&&/g,
    /\|\|/g,
    /\?[^?.:]/g,
  ];

  let cyclomatic = 1;
  for (const pattern of decisionPatterns) {
    const matches = code.match(pattern);
    if (matches) cyclomatic += matches.length;
  }

  // Cognitive complexity: nesting depth increases cognitive load
  let cognitive = 0;
  let nestingDepth = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (/\{/.test(trimmed)) nestingDepth++;
    if (/\}/.test(trimmed)) nestingDepth = Math.max(0, nestingDepth - 1);

    if (/\b(if|else if|while|for|switch)\b/.test(trimmed)) {
      cognitive += 1 + nestingDepth;
    }
    if (/\b(break|continue|goto)\b/.test(trimmed)) {
      cognitive += 1;
    }
  }

  let rating: ComplexityResult["rating"];
  if (cyclomatic <= 5) rating = "simple";
  else if (cyclomatic <= 10) rating = "moderate";
  else if (cyclomatic <= 20) rating = "complex";
  else rating = "very-complex";

  return { cyclomatic, cognitive, linesOfCode, rating };
}
