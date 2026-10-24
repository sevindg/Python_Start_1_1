import { RunResult } from '../types';

declare global {
  interface Window {
    Sk?: {
      configure: (config: {
        output: (text: string) => void;
        read?: (x: string) => string;
        __future__?: unknown;
      }) => void;
      python3?: unknown;
      misceval: {
        asyncToPromise: (fn: () => unknown) => Promise<unknown>;
      };
      importMainWithBody: (name: string, dumpJS: boolean, body: string, canSuspend: boolean) => unknown;
    };
  }
}

// Fallback interpreter for environments without Skulpt or before CDN loads
function fallbackExecutePython(code: string): RunResult {
  const startTime = performance.now();
  const rawLines = code.split('\n');
  const outputLines: string[] = [];
  const variables: Record<string, unknown> = {};

  // Check for indentation error on top-level statements
  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Check leading spaces: if line has leading spaces at top-level
    const leadingSpaces = line.search(/\S/);
    if (leadingSpaces > 0) {
      return {
        output: '',
        error: `IndentationError: unexpected indent (line ${i + 1})`,
        executionTimeMs: Math.round(performance.now() - startTime)
      };
    }

    // Check for Python 2 print syntax without parens: print "..."
    if (/^print\s+["']/.test(trimmed)) {
      return {
        output: '',
        error: `SyntaxError: Missing parentheses in call to 'print'. Did you mean print(...)? (line ${i + 1})`,
        executionTimeMs: Math.round(performance.now() - startTime)
      };
    }

    // Variable assignment: var_name = expression
    const assignMatch = trimmed.match(/^([a-zA-Z_]\w*)\s*=\s*(.+)$/);
    if (assignMatch) {
      const varName = assignMatch[1];
      const expr = assignMatch[2].trim();

      // String literal with double or single quotes
      if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
        variables[varName] = expr.slice(1, -1);
        continue;
      }

      // Number literal
      if (!isNaN(Number(expr))) {
        variables[varName] = Number(expr);
        continue;
      }

      // Variable reference
      if (expr in variables) {
        variables[varName] = variables[expr];
        continue;
      }
    }

    // Print statement: print(...)
    const printMatch = trimmed.match(/^print\((.*)\)$/s);
    if (printMatch) {
      const inner = printMatch[1].trim();

      // If empty print()
      if (!inner) {
        outputLines.push('');
        continue;
      }

      // Check if it's unquoted words, e.g. print(How do you do?)
      // Valid if it's quoted string, or numbers, or defined variables, or concatenation
      const isQuotedDouble = inner.startsWith('"') && inner.endsWith('"');
      const isQuotedSingle = inner.startsWith("'") && inner.endsWith("'");

      if (isQuotedDouble || isQuotedSingle) {
        outputLines.push(inner.slice(1, -1));
        continue;
      }

      // Check for concatenation or expression, e.g. A + b or a + b
      if (inner.includes('+')) {
        const parts = inner.split('+').map((p) => p.trim());
        let res = '';
        let hasError = false;
        let errMessage = '';

        for (const p of parts) {
          if ((p.startsWith('"') && p.endsWith('"')) || (p.startsWith("'") && p.endsWith("'"))) {
            res += p.slice(1, -1);
          } else if (p in variables) {
            res += String(variables[p]);
          } else {
            hasError = true;
            // Check if variable differs by case
            const lowerKey = Object.keys(variables).find((k) => k.toLowerCase() === p.toLowerCase());
            const hint = lowerKey ? `. Did you mean: '${lowerKey}'?` : '';
            errMessage = `NameError: name '${p}' is not defined${hint} (line ${i + 1})`;
            break;
          }
        }

        if (hasError) {
          return {
            output: outputLines.join('\n'),
            error: errMessage,
            executionTimeMs: Math.round(performance.now() - startTime)
          };
        }

        outputLines.push(res);
        continue;
      }

      // Single variable lookup
      if (inner in variables) {
        outputLines.push(String(variables[inner]));
        continue;
      }

      // Number lookup
      if (!isNaN(Number(inner))) {
        outputLines.push(inner);
        continue;
      }

      // If unquoted identifier(s)
      if (/^[a-zA-Z_]\w*$/.test(inner)) {
        const lowerKey = Object.keys(variables).find((k) => k.toLowerCase() === inner.toLowerCase());
        const hint = lowerKey ? `. Did you mean: '${lowerKey}'?` : '';
        return {
          output: outputLines.join('\n'),
          error: `NameError: name '${inner}' is not defined${hint} (line ${i + 1})`,
          executionTimeMs: Math.round(performance.now() - startTime)
        };
      }

      // Unquoted phrase like `How do you do?`
      return {
        output: outputLines.join('\n'),
        error: `SyntaxError: invalid syntax (line ${i + 1})\n(Кажется, текст забыли обернуть в кавычки!)`,
        executionTimeMs: Math.round(performance.now() - startTime)
      };
    }

    // Unrecognized line
    return {
      output: outputLines.join('\n'),
      error: `SyntaxError: invalid syntax at line ${i + 1}: '${trimmed}'`,
      executionTimeMs: Math.round(performance.now() - startTime)
    };
  }

  return {
    output: outputLines.join('\n'),
    error: null,
    executionTimeMs: Math.round(performance.now() - startTime)
  };
}

export async function runPythonCode(code: string): Promise<RunResult> {
  const startTime = performance.now();

  // If Skulpt is loaded in window
  if (typeof window !== 'undefined' && window.Sk && window.Sk.misceval) {
    try {
      let outputBuffer = '';
      window.Sk.configure({
        output: (text: string) => {
          outputBuffer += text;
        },
        read: (x: string) => {
          if (
            window.Sk &&
            (window.Sk as unknown as { builtinFiles?: { files: Record<string, string> } }).builtinFiles?.files?.[x] !== undefined
          ) {
            return (window.Sk as unknown as { builtinFiles: { files: Record<string, string> } }).builtinFiles.files[x];
          }
          throw new Error("File not found: '" + x + "'");
        },
        __future__: window.Sk.python3
      });

      await window.Sk.misceval.asyncToPromise(() => {
        return window.Sk!.importMainWithBody('<stdin>', false, code, true);
      });

      // Trim trailing newline commonly added by Python print
      const cleanOutput = outputBuffer.replace(/\n$/, '');

      return {
        output: cleanOutput,
        error: null,
        executionTimeMs: Math.round(performance.now() - startTime)
      };
    } catch (err: unknown) {
      let errStr = String(err);
      if (err instanceof Error) {
        errStr = err.message || err.toString();
      }

      // Clean up internal Skulpt error formatting if present
      errStr = errStr.replace(/<unknown>:\d+:\d+: /g, '');

      return {
        output: '',
        error: errStr,
        executionTimeMs: Math.round(performance.now() - startTime)
      };
    }
  }

  // Fallback to our reliable custom runner
  return fallbackExecutePython(code);
}
