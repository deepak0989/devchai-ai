export interface AgentFile {
  path: string;
  content: string;
}

export interface AgentProject {
  id: string;
  name: string;
  createdAt: string;
  raw: string;
}

const STORAGE_KEY = 'devchat_agent_projects';

export function parseAgentFiles(text: string): AgentFile[] {
  const files: AgentFile[] = [];
  const marker = /###\s*FILE:\s*([^\r\n]+)/g;
  let match: RegExpExecArray | null;
  let cursor = 0;
  let pendingPath: string | null = null;

  while ((match = marker.exec(text)) !== null) {
    if (pendingPath !== null) {
      files.push({
        path: pendingPath,
        content: text.slice(cursor, match.index).replace(/\r/g, '').trimEnd(),
      });
    }
    pendingPath = match[1].trim();
    cursor = marker.lastIndex;
  }

  if (pendingPath !== null) {
    files.push({
      path: pendingPath,
      content: text.slice(cursor).replace(/\r/g, '').trimEnd(),
    });
  }

  return files;
}

export function loadAgentProjects(): AgentProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AgentProject[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveAgentProject(project: AgentProject): AgentProject[] {
  const projects = loadAgentProjects();
  const index = projects.findIndex((p) => p.id === project.id);
  if (index >= 0) {
    projects[index] = project;
  } else {
    projects.unshift(project);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  return projects;
}

export function deleteAgentProject(id: string): AgentProject[] {
  const projects = loadAgentProjects().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  return projects;
}

export function buildContinuePrompt(existing: string): string {
  const files = parseAgentFiles(existing);
  const paths = files.length > 0 ? files.map((f) => f.path).join(', ') : 'none yet';
  return `Continue generating this project exactly where you stopped.
Files that were already generated (do NOT regenerate them): ${paths}

Output only the remaining files, starting from the first one not yet emitted, using the exact format:

### FILE: relative/path/file.name
<complete file content>`;
}
