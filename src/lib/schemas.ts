import { z } from "zod";

export const IssueSchema = z.object({
  id: z.string(),
  type: z.enum(["bug", "security", "performance", "style", "architecture"]),
  severity: z.enum(["critical", "high", "medium", "low", "info"]),
  title: z.string(),
  description: z.string(),
  lineStart: z.number(),
  lineEnd: z.number(),
  suggestion: z.string().describe("The suggested fix as code"),
  explanation: z.string().describe("Why this fix is better"),
});

export const ReviewSchema = z.object({
  summary: z.string().describe("2-3 sentence overall assessment"),
  overallScore: z.number().min(0).max(100),
  issues: z.array(IssueSchema),
  strengths: z.array(z.string()).describe("What the code does well"),
  complexityScore: z.object({
    cyclomatic: z.number(),
    cognitive: z.number(),
    linesOfCode: z.number(),
    rating: z.enum(["simple", "moderate", "complex", "very-complex"]),
  }),
  architectureSuggestions: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      priority: z.enum(["high", "medium", "low"]),
    })
  ),
});

export type Issue = z.infer<typeof IssueSchema>;
export type Review = z.infer<typeof ReviewSchema>;
