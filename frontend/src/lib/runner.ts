export interface RunResult {
  output: string;
  error?: string;
  version: string;
}

export const RUNNER_VERSION = 'v3.1';

function safeStringify(value: unknown, seen = new WeakSet<object>()): string {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value);
  }
  if (typeof value === 'function') return '[Function]';
  if (typeof value === 'symbol') return value.toString();

  if (typeof Element !== 'undefined' && value instanceof Element) {
    return `<${value.tagName.toLowerCase()}${value.id ? `#${value.id}` : ''}>`;
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? 'Invalid Date' : value.toISOString();
  }
  if (value instanceof RegExp) {
    return value.toString();
  }

  const obj = value as object;

  if (Array.isArray(value)) {
    if (seen.has(value)) return '[Circular]';
    seen.add(value);
    const parts = value.map((item) => safeStringify(item, seen));
    seen.delete(value);
    return `[${parts.join(', ')}]`;
  }

  if (seen.has(obj)) return '[Circular]';
  seen.add(obj);
  try {
    const keys = Object.keys(obj);
    if (keys.length === 0) {
      const name = Object.getPrototypeOf(obj)?.constructor?.name;
      return name && name !== 'Object' ? `${name} {}` : '{}';
    }
    const parts = keys.map((key) => {
      const keyValue = (obj as Record<string, unknown>)[key];
      if (typeof keyValue === 'function') {
        return `${key}: [Function]`;
      }
      return `${key}: ${safeStringify(keyValue, seen)}`;
    });
    return `{ ${parts.join(', ')} }`;
  } catch {
    const name = value?.constructor?.name;
    return name && name !== 'Object' ? `${name} (unserializable)` : String(value);
  } finally {
    seen.delete(obj);
  }
}

function formatValue(value: unknown): string {
  if (typeof value === 'string') return value;
  return safeStringify(value);
}

export async function runJavaScript(code: string): Promise<RunResult> {
  const logs: string[] = [];
  const pushLog = (...args: unknown[]) => logs.push(args.map(formatValue).join(' '));

  const sandboxConsole = {
    log: (...args: unknown[]) => pushLog(...args),
    info: (...args: unknown[]) => pushLog(...args),
    warn: (...args: unknown[]) => pushLog('warn:', ...args),
    error: (...args: unknown[]) => pushLog('error:', ...args),
    debug: (...args: unknown[]) => pushLog(...args),
    table: (data: unknown) => {
      if (!Array.isArray(data) || data.length === 0) {
        pushLog(data);
        return;
      }
      const rows = data.map((row) =>
        row !== null && typeof row === 'object' ? (row as Record<string, unknown>) : null
      );
      const keys = Array.from(
        new Set(rows.flatMap((row) => (row ? Object.keys(row) : [])))
      );
      if (keys.length === 0) {
        pushLog(data);
        return;
      }
      logs.push(keys.join('\t'));
      for (const row of rows) {
        if (!row) {
          logs.push('null');
          continue;
        }
        logs.push(keys.map((key) => (key in row ? formatValue(row[key]) : '')).join('\t'));
      }
    },
  };

  try {
    const fn = new Function(
      'console',
      `"use strict";\n${code}\n`
    );
    const result = await fn(sandboxConsole);
    if (result !== undefined) {
      pushLog(result);
    }
    return { output: logs.join('\n') || '(no output)', version: RUNNER_VERSION };
  } catch (err) {
    return {
      output: logs.join('\n'),
      error: err instanceof Error ? err.message : String(err),
      version: RUNNER_VERSION,
    };
  }
}

interface PyodideLike {
  runPython: (code: string) => unknown;
  setStdout: (options: { batched: (text: string) => void }) => void;
  loadPackagesFromImports: (code: string) => Promise<void>;
}

let pyodidePromise: Promise<PyodideLike> | null = null;

async function loadPyodide(): Promise<PyodideLike> {
  const win = window as unknown as {
    loadPyodide?: (options: { indexURL: string }) => Promise<PyodideLike>;
  };

  if (!win.loadPyodide) {
    await new Promise<void>((resolve, reject) => {
      const existing = document.getElementById('pyodide-loader');
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('Failed to load Pyodide')));
        return;
      }
      const script = document.createElement('script');
      script.id = 'pyodide-loader';
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Pyodide from CDN'));
      document.head.appendChild(script);
    });
  }

  if (!win.loadPyodide) {
    throw new Error('Pyodide failed to initialize');
  }

  return win.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/' });
}

export async function runPython(code: string): Promise<RunResult> {
  try {
    if (!pyodidePromise) {
      pyodidePromise = loadPyodide();
    }
    const pyodide = await pyodidePromise;

    let output = '';
    pyodide.setStdout({ batched: (text) => (output += text + '\n') });

    try {
      await pyodide.loadPackagesFromImports(code);
    } catch {
      // Optional package loading - ignore failures
    }

    const result = pyodide.runPython(code);
    if (result !== undefined && result !== null) {
      output += String(result) + '\n';
    }

    return { output: output.trim() || '(no output)', version: RUNNER_VERSION };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { output: '', error: message.replace(/^PythonError:\s*/, ''), version: RUNNER_VERSION };
  }
}

export function canRunLanguage(language: string | null | undefined): boolean {
  const lang = (language ?? '').toLowerCase();
  return lang === 'python' || lang === 'javascript' || lang === 'js' || lang === 'typescript' || lang === 'ts';
}

export function runCode(language: string | null | undefined, code: string): Promise<RunResult> {
  const lang = (language ?? '').toLowerCase();
  if (lang === 'python' || lang === 'py') {
    return runPython(code);
  }
  return runJavaScript(code);
}

export function languageLabel(language: string | null | undefined): string {
  const lang = (language ?? '').toLowerCase();
  if (lang === 'js' || lang === 'javascript') return 'JavaScript';
  if (lang === 'ts' || lang === 'typescript') return 'TypeScript';
  if (lang === 'py' || lang === 'python') return 'Python';
  return lang || 'code';
}
