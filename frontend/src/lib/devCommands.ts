export interface DevCommand {
  name: string;
  label: string;
  description: string;
  example: string;
  prompt: string;
}

export const DEV_COMMANDS: DevCommand[] = [
  {
    name: 'explain',
    label: 'Explain',
    description: 'Explain a piece of code step by step',
    example: '/explain <paste code or snippet>',
    prompt:
      'You are a senior developer mentor. Explain the following code step by step: what it does, how it works, key patterns used, and any pitfalls. Use markdown with clear sections and short code examples where helpful.',
  },
  {
    name: 'review',
    label: 'Code review',
    description: 'Review code like a senior engineer',
    example: '/review <paste code or a git diff>',
    prompt:
      'You are a senior code reviewer. Review the following code/diff rigorously. Report: (1) bugs and correctness issues, (2) security concerns, (3) performance problems, (4) style and readability suggestions, (5) missing tests. Be specific and cite the exact lines/parts. Format findings as a checklist with severity tags [High]/[Medium]/[Low].',
  },
  {
    name: 'refactor',
    label: 'Refactor',
    description: 'Improve code quality and structure',
    example: '/refactor <paste code>',
    prompt:
      'You are an expert software architect. Refactor the following code to be cleaner, more maintainable, and more idiomatic. Show the refactored code in full, then briefly explain the key changes and why they improve the code.',
  },
  {
    name: 'tests',
    label: 'Write tests',
    description: 'Generate unit tests for code',
    example: '/tests <paste code>',
    prompt:
      'You are a testing expert. Write thorough unit tests for the following code. Cover happy paths, edge cases, and error paths. Use sensible assertions and structure the tests clearly. First ask which framework if unclear, otherwise use Jest-style (or the framework implied by the code).',
  },
  {
    name: 'debug',
    label: 'Debug error',
    description: 'Fix a bug or error message',
    example: '/debug <paste stack trace or error>',
    prompt:
      'You are an expert debugger. Analyze the following error message or stack trace. Explain the root cause, then give the exact fix with corrected code. Cover likely causes ranked by probability, and suggest how to prevent this class of bug.',
  },
  {
    name: 'docs',
    label: 'Write docs',
    description: 'Generate documentation (README, JSDoc, comments)',
    example: '/docs <paste code or feature description>',
    prompt:
      'You are a technical writer. Create clear, professional documentation for the following. Use markdown with headings, code examples, and usage instructions. Include a "Common gotchas" section where relevant.',
  },
  {
    name: 'regex',
    label: 'Regex helper',
    description: 'Build and explain a regex',
    example: '/regex match emails and URLs',
    prompt:
      'You are a regex expert. Write the requested regular expression(s), explain each part of the pattern piece by piece, and include test examples (matching and non-matching strings). Provide the pattern in a language-appropriate form.',
  },
  {
    name: 'sql',
    label: 'SQL helper',
    description: 'Write or optimize SQL queries',
    example: '/sql join two tables and group by month',
    prompt:
      'You are a database expert. Write or optimize the requested SQL. Include indexes, explain the query plan reasoning, and note edge cases. Use standard SQL unless the context implies a specific dialect.',
  },
  {
    name: 'commit',
    label: 'Commit message',
    description: 'Generate a conventional commit message',
    example: '/commit <describe your changes>',
    prompt:
      'You are a git expert. Write a Conventional Commits style commit message for the changes described: one concise subject line (max 72 chars, imperative mood) followed by a body with bullet points explaining the why and what. Include any relevant type prefixes like feat:, fix:, refactor:, docs:, chore:.',
  },
  {
    name: 'docker',
    label: 'Docker helper',
    description: 'Write Dockerfiles / compose files',
    example: '/docker dockerize a Node.js app with a Postgres sidecar',
    prompt:
      'You are a DevOps expert. Create the requested Docker configuration. Show the complete files (Dockerfile, docker-compose.yml, .dockerignore as needed), explain each layer/step, and list security best practices (non-root user, pinned versions, multi-stage builds).',
  },
];

export function findDevCommand(name: string): DevCommand | null {
  return DEV_COMMANDS.find((command) => command.name === name) ?? null;
}

export function applyDevCommand(command: DevCommand, userText: string): string {
  const detail = userText.trim();
  return `${command.prompt}\n\n---\n\n${detail}`;
}
