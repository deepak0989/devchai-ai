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
          py: 2,
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
          }}
        >
          <AutoAwesomeIcon sx={{ color: '#fff', fontSize: 18 }} />
        </Box>
      )}

      <Box
        sx={{
          maxWidth: { xs: '85%', sm: '75%' },
          display: 'flex',
          flexDirection: 'column',
          alignItems: isUser ? 'flex-end' : 'flex-start',
        }}
      >
        <Box
          sx={{
            px: isUser ? 2 : 0,
            py: isUser ? 1.25 : 0,
            borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
            bgcolor: isUser ? 'rgba(255,255,255,0.1)' : 'transparent',
            ...(message.error && !isUser
              ? { color: 'error.main', bgcolor: 'rgba(244,67,54,0.08)', px: 2, py: 1.25 }
              : {}),
          }}
        >
          <Typography
            component="div"
            sx={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontSize: '0.95rem',
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
