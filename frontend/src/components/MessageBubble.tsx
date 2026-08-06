import { ReactNode, useState } from 'react';
import { Box, Chip, CircularProgress, IconButton, Tooltip, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';
import TypingLoader from './TypingLoader';
import { canPreviewLanguage, canRunLanguage, languageLabel, runCode, RunResult } from '../lib/runner';

interface MessageBubbleProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    error?: boolean;
    command?: string;
  };
}

function CodeBlock({
  language,
  code,
  highlighted,
}: {
  language: string;
  code: string;
  highlighted?: ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [preview, setPreview] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable - ignore
    }
  }

  async function handleRun() {
    if (running) return;
    setRunning(true);
    setRunResult(null);
    const result = await runCode(language, code);
    setRunResult(result);
    setRunning(false);
  }

  return (
    <Box
      sx={{
        my: 1.5,
        borderRadius: 2.5,
        overflow: 'hidden',
        border: 1,
        borderColor: 'divider',
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0d1512' : '#f8fafc'),
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: 1.5,
          py: 0.75,
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#131c16' : '#f1f5f9'),
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary', flex: 1 }}>
          {languageLabel(language)}
        </Typography>
        {canRunLanguage(language) && (
          <IconButton size="small" onClick={handleRun} disabled={running} aria-label="Run code" sx={{ color: 'primary.main' }}>
            {running ? <CircularProgress size={14} /> : <PlayArrowIcon fontSize="small" />}
          </IconButton>
        )}
        {canPreviewLanguage(language) && (
          <Tooltip title={preview ? 'Hide preview' : 'Preview'}>
            <IconButton size="small" onClick={() => setPreview((v) => !v)} aria-label="Toggle preview" sx={{ color: 'primary.main' }}>
              {preview ? <CloseIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title={copied ? 'Copied!' : 'Copy code'}>
          <IconButton size="small" onClick={handleCopy} aria-label="Copy code" sx={{ color: 'text.secondary' }}>
            {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>
      {preview ? (
        <Box
          component="iframe"
          title={`${language} preview`}
          srcDoc={code}
          sandbox=""
          sx={{ display: 'block', width: '100%', height: 300, border: 'none', bgcolor: '#ffffff' }}
        />
      ) : (
        <Box
          component="pre"
          sx={{
            m: 0,
            p: 1.5,
            overflowX: 'auto',
            fontSize: '0.85rem',
            lineHeight: 1.6,
            '& code': { fontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace' },
          }}
        >
          <Box component="code" className={`language-${language}`}>
            {highlighted ?? code}
          </Box>
        </Box>
      )}
      {runResult && (
        <Box sx={{ px: 1.5, py: 1, borderTop: 1, borderColor: 'rgba(17,24,39,0.06)', bgcolor: '#0f172a' }}>
          <Typography variant="caption" fontWeight={700} sx={{ color: runResult.error ? '#f87171' : '#6ee7b7' }}>
            {runResult.error ? 'Error' : 'Output'}
            <Box component="span" sx={{ ml: 1, color: 'text.secondary', fontWeight: 500 }}>
              runner {runResult.version}
            </Box>
          </Typography>
          <Box
            component="pre"
            sx={{
              m: 0,
              mt: 0.5,
              maxHeight: 220,
              overflow: 'auto',
              fontSize: '0.8rem',
              lineHeight: 1.55,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: runResult.error ? '#fca5a5' : '#e2e8f0',
              fontFamily: 'Consolas, monospace',
            }}
          >
            {runResult.error ?? runResult.output}
          </Box>
        </Box>
      )}
    </Box>
  );
}

function extractText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    return extractText((node as { props: { children?: ReactNode } }).props.children);
  }
  return '';
}

const markdownStyles = {
  '& p': { m: '0.5rem 0' },
  '& p:first-of-type': { mt: 0 },
  '& p:last-child': { mb: 0 },
  '& ul, & ol': { m: '0.5rem 0', pl: 2.5 },
  '& li': { my: 0.35 },
  '& h1, & h2, & h3, & h4': { mt: 2, mb: 0.75, fontWeight: 700 },
  '& h1': { fontSize: '1.35rem' },
  '& h2': { fontSize: '1.2rem' },
  '& h3': { fontSize: '1.05rem' },
  '& blockquote': {
    m: '0.75rem 0',
    pl: 1.5,
    borderLeft: '3px solid rgba(16,163,127,0.4)',
    color: 'text.secondary',
  },
  '& a': { color: 'primary.main', textDecoration: 'underline' },
  '& table': { borderCollapse: 'collapse', my: 1.5, width: '100%', fontSize: '0.85rem' },
  '& th, & td': { border: '1px solid', borderColor: 'divider', px: 1.5, py: 0.75, textAlign: 'left' },
  '& th': { bgcolor: 'action.hover', fontWeight: 700 },
  '& tr:nth-of-type(even) td': { bgcolor: 'action.hover' },
  '& hr': { border: 'none', borderTop: '1px solid', borderTopColor: 'divider', my: 2 },
  '& code:not(pre code)': {
    fontFamily: 'Consolas, monospace',
    fontSize: '0.83em',
    bgcolor: (theme) =>
      theme.palette.mode === 'dark' ? 'rgba(0,230,118,0.12)' : 'rgba(17,24,39,0.06)',
    px: 0.6,
    py: 0.15,
    borderRadius: 1,
    color: (theme) => (theme.palette.mode === 'dark' ? '#7dffb0' : '#be185d'),
  },
} as const;

export default function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  const isUser = message.role === 'user';
  const isEmptyAssistant = !isUser && message.content.length === 0;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable - ignore
    }
  }

  if (isEmptyAssistant) {
    return (
      <Box
        className="message-row"
        sx={{
          display: 'flex',
          gap: 2,
          py: 2.5,
          alignItems: 'flex-start',
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
            boxShadow: '0 8px 18px rgba(16, 163, 127, 0.22)',
          }}
        >
          <AutoAwesomeIcon sx={{ color: 'primary.contrastText', fontSize: 18 }} />
        </Box>
        <Box sx={{ pt: 0.5 }}>
          <TypingLoader />
        </Box>
      </Box>
    );
  }

  return (
    <Box
      className="message-row"
      sx={{
        display: 'flex',
        gap: 2,
        py: 2,
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        '&:hover .copy-message-btn': { opacity: 1 },
      }}
    >
      {!isUser && (
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
            boxShadow: '0 8px 18px rgba(16, 163, 127, 0.18)',
          }}
        >
          <AutoAwesomeIcon sx={{ color: 'primary.contrastText', fontSize: 18 }} />
        </Box>
      )}

      <Box
        sx={{
          maxWidth: { xs: '100%', sm: '82%' },
          display: 'flex',
          flexDirection: 'column',
          alignItems: isUser ? 'flex-end' : 'flex-start',
          minWidth: 0,
        }}
      >
        {isUser && message.command && (
          <Chip
            label={message.command}
            size="small"
            sx={{
              mb: 0.75,
              bgcolor: 'rgba(139,92,246,0.12)',
              color: '#6d28d9',
              fontWeight: 700,
              height: 22,
            }}
          />
        )}
        <Box
          sx={{
            px: 2.2,
            py: 1.5,
            borderRadius: isUser ? '18px 18px 6px 18px' : '18px 18px 18px 6px',
            bgcolor: isUser ? '#1f2937' : 'background.paper',
            color: isUser ? '#f9fafb' : 'text.primary',
            boxShadow: isUser ? 'none' : '0 1px 2px rgba(17,24,39,0.06)',
            border: isUser ? 'none' : 1,
            borderColor: 'divider',
            ...(message.error && !isUser
              ? { color: 'error.main', bgcolor: 'rgba(244,67,54,0.06)', borderColor: 'rgba(244,67,54,0.15)' }
              : {}),
          }}
        >
          {isUser ? (
            <Typography
              component="div"
              sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontSize: '0.96rem',
                lineHeight: 1.7,
              }}
            >
              {message.content}
            </Typography>
          ) : (
            <Box
              component="div"
              className="markdown-body"
              sx={{
                fontSize: '0.96rem',
                lineHeight: 1.7,
                wordBreak: 'break-word',
                minWidth: 0,
                '& > *:first-of-type': { mt: 0 },
                '& > *:last-child': { mb: 0 },
                ...markdownStyles,
              }}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  pre({ children }) {
                    return <>{children}</>;
                  },
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className ?? '');
                    const code = extractText(children).replace(/\n$/, '');
                    if (match) {
                      return <CodeBlock language={match[1]} code={code} highlighted={children} />;
                    }
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  a({ href, children }) {
                    return (
                      <a href={href} target="_blank" rel="noopener noreferrer">
                        {children as ReactNode}
                      </a>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </Box>
          )}
        </Box>

        {!isUser && message.content.length > 0 && (
          <Tooltip title={copied ? 'Copied!' : 'Copy'}>
            <IconButton
              size="small"
              onClick={handleCopy}
              aria-label="Copy message"
              sx={{
                mt: 0.5,
                ml: -0.5,
                color: 'text.secondary',
                opacity: 0,
                '&:hover': { color: 'text.primary' },
              }}
              className="copy-message-btn"
            >
              {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
}
