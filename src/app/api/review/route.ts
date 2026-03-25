import { generateObject } from "ai";
import { reviewModel } from "@/lib/ai";
import { ReviewSchema } from "@/lib/schemas";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { code, language } = await req.json();

    if (!code || typeof code !== "string" || code.trim().length === 0) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    const { object: review } = await generateObject({
      model: reviewModel,
      schema: ReviewSchema,
      prompt: `You are a senior software engineer conducting a thorough code review.

Language: ${language}
Code:
\`\`\`${language}
${code}
\`\`\`

Review this code for:
1. Bugs and logical errors — look for off-by-one errors, null/undefined handling, race conditions, incorrect types
2. Security vulnerabilities — injection, XSS, auth issues, exposed secrets, unsafe deserialization
3. Performance problems — unnecessary re-renders, N+1 queries, memory leaks, inefficient algorithms
4. Code style and best practices — naming, DRY violations, dead code, missing error handling
5. Architecture and design patterns — separation of concerns, coupling, scalability

Be specific about line numbers. For each issue, provide a concrete fix with the corrected code.
Generate unique IDs for each issue (e.g., "issue-1", "issue-2").
The overallScore should be 0-100 where 100 is perfect code.
Include at least 1-2 strengths that highlight what the code does well.`,
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("Review error:", error);
    return NextResponse.json(
      { error: "Failed to generate review. Check your API key." },
      { status: 500 }
    );
  }
}
