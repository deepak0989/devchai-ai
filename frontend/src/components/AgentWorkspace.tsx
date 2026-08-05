import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { streamAgentGeneration } from '../api/agent';
import {
  AgentFile,
  AgentProject,
  buildContinuePrompt,
  parseAgentFiles,
  saveAgentProject,
} from '../lib/agentStore';
import ModelSelector from './ModelSelector';
import TypingLoader from './TypingLoader';

interface AgentWorkspaceProps {
  project: AgentProject | null;
  onNewProject: () => void;
  onProjectUpdated: (project: AgentProject) => void;
}

function downloadFile(file: AgentFile) {
  const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = file.path.split('/').pop() ?? 'file.txt';
  anchor.click();
  URL.revokeObjectURL(url);
}

function FileViewerDialog({
  file,
  onClose,
}: {
  file: AgentFile | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [file]);

  async function handleCopy() {
    if (!file) return;
    try {
      await navigator.clipboard.writeText(file.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable - ignore
    }
  }

  return (
    <Dialog
      open={file !== null}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { bgcolor: 'background.paper' } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
        <InsertDriveFileIcon fontSize="small" color="primary" />
        <Typography variant="subtitle1" noWrap sx={{ flex: 1 }}>
          {file?.path}
        </Typography>
        <IconButton onClick={handleCopy} size="small" aria-label="Copy file content">
          {copied ? <CheckIcon fontSize="small" color="success" /> : <ContentCopyIcon fontSize="small" />}
        </IconButton>
        <IconButton
          onClick={() => file && downloadFile(file)}
          size="small"
          aria-label="Download file"
        >
          <DownloadIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box
          component="pre"
          sx={{
            m: 0,
            p: 2,
            overflow: 'auto',
            maxHeight: '60vh',
            fontSize: '0.82rem',
            lineHeight: 1.5,
            fontFamily: '"Cascadia Code", "Consolas", monospace',
            bgcolor: 'rgba(0,0,0,0.25)',
            borderRadius: 1,
            whiteSpace: 'pre',
          }}
        >
          {file?.content}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={() => file && downloadFile(file)}
        >
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function AgentWorkspace({
  project,
  onNewProject,
  onProjectUpdated,
}: AgentWorkspaceProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [model, setModel] = useState('anthropic/claude-3.5-sonnet');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<AgentFile | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const streamBoxRef = useRef<HTMLDivElement | null>(null);

  const files = project ? parseAgentFiles(project.raw) : [];

  useEffect(() => {
    streamBoxRef.current?.scrollTo({
      top: streamBoxRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [project?.raw]);

  function stopStreaming() {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
  }

  async function runGeneration(target: AgentProject, prompt: string) {
    setStreaming(true);
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    let full = target.raw;

    try {
      await streamAgentGeneration(
        prompt,
        model,
        {
          onDelta: (delta) => {
            full += delta;
            onProjectUpdated({ ...target, raw: full });
          },
          onDone: () => undefined,
          onError: (message) => {
            setError(message);
          },
        },
        controller.signal
      );
    } catch (err) {
      const isAbort = err instanceof DOMException && err.name === 'AbortError';
      if (!isAbort) {
        setError(err instanceof Error ? err.message : 'Generation failed. Try again.');
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
      saveAgentProject({ ...target, raw: full });
    }
  }

  async function handleGenerate() {
    if (!name.trim() || !description.trim() || streaming) return;

    const newProject: AgentProject = {
      id: crypto.randomUUID(),
      name: name.trim(),
      createdAt: new Date().toISOString(),
      raw: '',
    };
    saveAgentProject(newProject);
    onProjectUpdated(newProject);

    const prompt = `Create a complete project from scratch.

Project name: ${name.trim()}
Description / requirements:
${description.trim()}

Generate the full project: file tree, complete source code for every file, config files (package.json, tsconfig.json, .env.example), and a README.md with setup instructions.`;
    await runGeneration(newProject, prompt);
  }

  async function handleContinue() {
    if (!project || streaming) return;
    await runGeneration(project, buildContinuePrompt(project.raw));
  }

  if (!project) {
    return (
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          justifyContent: 'center',
          p: { xs: 2, sm: 4 },
        }}
      >
        <Box sx={{ maxWidth: 640, width: '100%', py: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AutoAwesomeIcon sx={{ color: '#fff' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Agent Studio
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Describe a project - the agent builds it from scratch
              </Typography>
            </Box>
          </Box>

          <Paper
            elevation={0}
            sx={{ mt: 3, p: 3, border: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
          >
            <TextField
              label="Project name"
              fullWidth
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Todo App with Auth"
              sx={{ mb: 2 }}
            />
            <TextField
              label="Project description"
              fullWidth
              multiline
              minRows={5}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={
                'Describe what you want to build in plain language...\n\ne.g. A React + TypeScript todo app with user authentication, dark theme, and localStorage persistence. Backend with Express and a REST API.'
              }
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: 220 }}>
                <ModelSelector value={model} onChange={setModel} />
              </Box>
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayArrowIcon />}
                disabled={!name.trim() || !description.trim()}
                onClick={handleGenerate}
                sx={{ flexShrink: 0 }}
              >
                Generate Project
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      <Box
        component="header"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.25,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <AutoAwesomeIcon sx={{ color: '#fff', fontSize: 18 }} />
        </Box>
        <Typography variant="subtitle1" fontWeight={600} noWrap sx={{ flex: 1 }}>
          {project.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ModelSelector value={model} onChange={setModel} />
          {streaming ? (
            <Button
              variant="outlined"
              color="error"
              onClick={stopStreaming}
              sx={{ flexShrink: 0 }}
            >
              Stop
            </Button>
          ) : (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={onNewProject}
              sx={{ flexShrink: 0 }}
            >
              New
            </Button>
          )}
          <Button
            variant="contained"
            onClick={handleContinue}
            disabled={streaming}
            sx={{ flexShrink: 0 }}
          >
            Continue
          </Button>
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', px: { xs: 2, sm: 4 }, py: 3 }}>
        <Box sx={{ maxWidth: 860, mx: 'auto' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {project.raw.length === 0 ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
              <TypingLoader />
              <Typography variant="body2" color="text.secondary">
                The agent is building your project...
              </Typography>
            </Box>
          ) : (
            <>
              <Box
                ref={streamBoxRef}
                sx={{
                  mb: 3,
                  p: 2,
                  maxHeight: 320,
                  overflow: 'auto',
                  borderRadius: 2,
                  bgcolor: 'rgba(0,0,0,0.25)',
                  border: 1,
                  borderColor: 'divider',
                  fontFamily: '"Cascadia Code", "Consolas", monospace',
                  fontSize: '0.78rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {project.raw}
                {streaming && <CircularProgress size={14} sx={{ ml: 1, verticalAlign: 'middle' }} />}
              </Box>

              <Typography variant="overline" color="text.secondary">
                Generated Files ({files.length})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {files.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No files detected yet - the agent is still generating...
                  </Typography>
                )}
                {files.map((file) => (
                  <Tooltip key={file.path} title={file.path}>
                    <Chip
                      icon={<InsertDriveFileIcon />}
                      label={file.path}
                      onClick={() => setSelectedFile(file)}
                      sx={{
                        maxWidth: 320,
                        '& .MuiChip-label': {
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        },
                      }}
                    />
                  </Tooltip>
                ))}
              </Box>
            </>
          )}
        </Box>
      </Box>

      <FileViewerDialog file={selectedFile} onClose={() => setSelectedFile(null)} />
    </Box>
  );
}
