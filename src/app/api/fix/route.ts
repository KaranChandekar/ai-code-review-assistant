import { generateObject } from "ai";
import { reviewModel } from "@/lib/ai";
import { NextResponse } from "next/server";
import { z } from "zod";

const FixSchema = z.object({
  fixedCode: z.string().describe("The complete code with the fix applied"),
  explanation: z.string().describe("Brief explanation of what was changed"),
});

export async function POST(req: Request) {
  try {
    const { code, language, issue } = await req.json();

    if (!code || !issue) {
      return NextResponse.json({ error: "Code and issue are required" }, { status: 400 });
    }

    const { object: fix } = await generateObject({
      model: reviewModel,
      schema: FixSchema,
      prompt: `You are a senior software engineer. Apply a fix to the following code.

Language: ${language}
Original code:
\`\`\`${language}
${code}
\`\`\`

Issue to fix:
- Title: ${issue.title}
- Description: ${issue.description}
- Lines: ${issue.lineStart}-${issue.lineEnd}
- Suggested fix: ${issue.suggestion}

Return the COMPLETE code with ONLY this specific fix applied. Do not change anything else.`,
    });

    return NextResponse.json(fix);
  } catch (error) {
    console.error("Fix error:", error);
    return NextResponse.json(
      { error: "Failed to generate fix" },
      { status: 500 }
    );
  }
}
