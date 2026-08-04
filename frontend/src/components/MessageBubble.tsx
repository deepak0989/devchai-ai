import { useState } from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import TypingLoader from './TypingLoader';

interface MessageBubbleProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    error?: boolean;
  };
}

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
          <AutoAwesomeIcon sx={{ color: '#fff', fontSize: 18 }} />
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
          <AutoAwesomeIcon sx={{ color: '#fff', fontSize: 18 }} />
        </Box>
      )}

      <Box
        sx={{
          maxWidth: { xs: '100%', sm: '78%' },
          display: 'flex',
          flexDirection: 'column',
          alignItems: isUser ? 'flex-end' : 'flex-start',
        }}
      >
        <Box
          sx={{
            px: isUser ? 2.2 : 2.2,
            py: isUser ? 1.4 : 1.4,
            borderRadius: isUser ? '18px 18px 6px 18px' : '18px 18px 18px 6px',
            bgcolor: isUser ? '#1f2937' : '#ffffff',
            color: isUser ? '#f9fafb' : 'text.primary',
            boxShadow: isUser ? 'none' : '0 1px 2px rgba(17,24,39,0.06)',
            border: isUser ? 'none' : 1,
            borderColor: 'divider',
            ...(message.error && !isUser
              ? { color: 'error.main', bgcolor: 'rgba(244,67,54,0.06)', borderColor: 'rgba(244,67,54,0.15)' }
              : {}),
          }}
        >
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
