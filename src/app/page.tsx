"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CodeEditor } from "@/components/code-editor";
import { ReviewPanel } from "@/components/review-panel";
import { LanguageSelector } from "@/components/language-selector";
import { Button } from "@/components/ui/button";
import { detectLanguage } from "@/lib/languages";
import { Loader2, Sparkles, Upload, RotateCcw } from "lucide-react";
import type { Review } from "@/lib/schemas";

const SAMPLE_CODE = `function processUsers(users: any[]) {
  let result = [];
  for (let i = 0; i <= users.length; i++) {
    const user = users[i];
    if (user.role == "admin") {
      result.push({
        name: user.name,
        email: user.email,
        password: user.password,
        token: generateToken(user.id + "secret_key_123"),
      });
    }
    // Fetch user details synchronously
    const details = fetch("/api/users/" + user.id);
    result.push({ ...user, details: details });
  }
  return result;
}`;

export default function Home() {
  const [code, setCode] = useState(SAMPLE_CODE);
  const [language, setLanguage] = useState("typescript");
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCodeChange = useCallback(
    (value: string) => {
      setCode(value);
      if (value.length > 50 && value !== code) {
        const detected = detectLanguage(value);
        if (detected !== language) {
          setLanguage(detected);
        }
      }
    },
    [code, language]
  );

  const handleReview = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate review");
      }
      const data: Review = await res.json();
      setReview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFix = (fixedCode: string) => {
    setCode(fixedCode);
    setReview(null);
  };

  const handleFileUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".ts,.tsx,.js,.jsx,.py,.go,.rs,.java,.cs,.cpp,.hpp,.rb,.php,.swift,.kt";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        setCode(text);
        setReview(null);
        const ext = file.name.split(".").pop() || "";
        const langMap: Record<string, string> = {
          ts: "typescript", tsx: "typescript", js: "javascript", jsx: "javascript",
          py: "python", go: "go", rs: "rust", java: "java", cs: "csharp",
          cpp: "cpp", hpp: "cpp", rb: "ruby", php: "php", swift: "swift", kt: "kotlin",
        };
        if (langMap[ext]) setLanguage(langMap[ext]);
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleReset = () => {
    setCode("");
    setReview(null);
    setError(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">AI Code Review</h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector value={language} onChange={setLanguage} />
            <Button variant="outline" size="sm" onClick={handleFileUpload}>
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              Upload
            </Button>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Clear
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
          {/* Left: Editor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Paste your code or upload a file. Press{" "}
                <kbd className="inline-flex items-center rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-mono">
                  Cmd+Enter
                </kbd>{" "}
                to review.
              </p>
            </div>
            <CodeEditor
              code={code}
              language={language}
              issues={review?.issues}
              onChange={handleCodeChange}
            />
            <Button
              id="review-btn"
              onClick={handleReview}
              disabled={loading || !code.trim()}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Review Code
                </>
              )}
            </Button>
          </div>

          {/* Right: Review Panel */}
          <div className="lg:overflow-y-auto lg:max-h-[calc(100vh-8rem)]">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500"
                >
                  {error}
                </motion.div>
              )}
              {review && !error && (
                <ReviewPanel
                  review={review}
                  code={code}
                  language={language}
                  onApplyFix={handleApplyFix}
                />
              )}
              {!review && !error && !loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full min-h-[400px] text-center"
                >
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <Sparkles className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">Ready to Review</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Paste your code in the editor and click &quot;Review Code&quot; to get an AI-powered
                    analysis of bugs, security issues, and performance bottlenecks.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
