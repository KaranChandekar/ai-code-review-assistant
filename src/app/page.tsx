"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CodeEditor } from "@/components/code-editor";
import { ReviewPanel } from "@/components/review-panel";
import { LanguageSelector } from "@/components/language-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { detectLanguage } from "@/lib/languages";
import {
  Loader2,
  Sparkles,
  Upload,
  RotateCcw,
  Code2,
  Shield,
  Zap,
  GitBranch,
} from "lucide-react";
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
    input.accept =
      ".ts,.tsx,.js,.jsx,.py,.go,.rs,.java,.cs,.cpp,.hpp,.rb,.php,.swift,.kt";
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
      <header className="sticky top-0 z-20 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/20">
              <Code2 className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
              AI Code Review
            </h1>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <LanguageSelector value={language} onChange={setLanguage} />
            <Button
              variant="outline"
              size="sm"
              onClick={handleFileUpload}
              className="hidden sm:inline-flex"
            >
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              Upload
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={handleFileUpload}
              className="sm:hidden"
            >
              <Upload className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
            <div className="w-px h-5 bg-border" />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Left: Editor */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Paste your code or upload a file. Press{" "}
                <kbd className="inline-flex items-center rounded-md border border-border bg-muted/80 px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground">
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
              className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/25 border-0 transition-all duration-200 hover:shadow-violet-500/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:shadow-none disabled:hover:scale-100"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing your code...
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
          <div className="lg:overflow-y-auto lg:max-h-[calc(100vh-8rem)] lg:pr-1 scrollbar-thin">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-600 dark:text-red-400"
                >
                  {error}
                </motion.div>
              )}
              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full min-h-[400px] text-center"
                >
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 blur-xl opacity-30 animate-pulse" />
                    <div className="relative rounded-full bg-card border border-border p-5">
                      <Loader2 className="h-8 w-8 text-violet-500 dark:text-violet-400 animate-spin" />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold mt-5 mb-1">
                    Analyzing your code
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Checking for bugs, security vulnerabilities, performance
                    issues, and architecture suggestions...
                  </p>
                </motion.div>
              )}
              {review && !error && !loading && (
                <motion.div key="review">
                  <ReviewPanel
                    review={review}
                    code={code}
                    language={language}
                    onApplyFix={handleApplyFix}
                  />
                </motion.div>
              )}
              {!review && !error && !loading && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-4"
                >
                  <div className="relative mb-6">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 blur-2xl opacity-20" />
                    <div className="relative rounded-2xl bg-card border border-border p-5">
                      <Sparkles className="h-8 w-8 text-violet-500 dark:text-violet-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    Ready to Review
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm mb-8">
                    Paste your code in the editor and click &quot;Review
                    Code&quot; to get an AI-powered analysis.
                  </p>
                  <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
                    {[
                      { icon: Shield, label: "Security", color: "text-red-500 dark:text-red-400" },
                      { icon: Zap, label: "Performance", color: "text-amber-500 dark:text-amber-400" },
                      { icon: GitBranch, label: "Architecture", color: "text-blue-500 dark:text-blue-400" },
                    ].map(({ icon: Icon, label, color }) => (
                      <div
                        key={label}
                        className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card/50 p-3"
                      >
                        <Icon className={`h-4 w-4 ${color}`} />
                        <span className="text-xs text-muted-foreground">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
