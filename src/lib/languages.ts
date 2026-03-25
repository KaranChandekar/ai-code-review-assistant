export interface LanguageConfig {
  id: string;
  label: string;
  monacoId: string;
  extensions: string[];
}

export const LANGUAGES: LanguageConfig[] = [
  { id: "typescript", label: "TypeScript", monacoId: "typescript", extensions: [".ts", ".tsx"] },
  { id: "javascript", label: "JavaScript", monacoId: "javascript", extensions: [".js", ".jsx"] },
  { id: "python", label: "Python", monacoId: "python", extensions: [".py"] },
  { id: "go", label: "Go", monacoId: "go", extensions: [".go"] },
  { id: "rust", label: "Rust", monacoId: "rust", extensions: [".rs"] },
  { id: "java", label: "Java", monacoId: "java", extensions: [".java"] },
  { id: "csharp", label: "C#", monacoId: "csharp", extensions: [".cs"] },
  { id: "cpp", label: "C++", monacoId: "cpp", extensions: [".cpp", ".hpp", ".cc"] },
  { id: "ruby", label: "Ruby", monacoId: "ruby", extensions: [".rb"] },
  { id: "php", label: "PHP", monacoId: "php", extensions: [".php"] },
  { id: "swift", label: "Swift", monacoId: "swift", extensions: [".swift"] },
  { id: "kotlin", label: "Kotlin", monacoId: "kotlin", extensions: [".kt"] },
];

export function detectLanguage(code: string): string {
  if (/^import\s+\w+\s+from\s+["']|^export\s+(default\s+)?/m.test(code)) return "typescript";
  if (/^(def |class |import |from |print\()/m.test(code)) return "python";
  if (/^package\s+\w+/m.test(code) && /func\s+/m.test(code)) return "go";
  if (/^(fn |use |mod |pub |impl |struct |enum )/m.test(code)) return "rust";
  if (/^(public\s+class|import\s+java\.)/m.test(code)) return "java";
  if (/^(using\s+System|namespace\s+)/m.test(code)) return "csharp";
  if (/^#include\s+[<"]/m.test(code)) return "cpp";
  if (/^(require\s+['"]|const\s+\w+\s*=\s*require)/m.test(code)) return "javascript";
  return "typescript";
}
