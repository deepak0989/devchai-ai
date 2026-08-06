import { FormEvent, useMemo } from 'react';
import { Box, IconButton, InputBase, ListItemButton, ListItemText, Paper, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import MicIcon from '@mui/icons-material/Mic';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { DevCommand } from '../lib/devCommands';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  streaming: boolean;
  disabled: boolean;
  placeholder: string;
  micSupported: boolean;
  micActive: boolean;
  onMicToggle: () => void;
  commands: DevCommand[];
  onCommandSelect: (command: DevCommand) => void;
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  onStop,
  streaming,
  disabled,
  placeholder,
  micSupported,
  micActive,
  onMicToggle,
  commands,
  onCommandSelect,
}: ChatInputProps) {
  const slashMatch = useMemo(() => {
    if (!value.startsWith('/')) return null;
    const match = /^\/([a-zA-Z]*)\s*$/.exec(value);
    if (!match) return null;
    return match[1].toLowerCase();
  }, [value]);

  const filteredCommands = useMemo(() => {
    if (slashMatch === null) return [];
    const query = slashMatch.trim();
    const filtered = commands.filter((command) => command.name.startsWith(query));
    return filtered.slice(0, 6);
  }, [commands, slashMatch]);

  const paletteOpen = slashMatch !== null && !streaming;

  function selectCommand(command: DevCommand) {
    onCommandSelect(command);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      if (paletteOpen && filteredCommands.length > 0) {
        event.preventDefault();
        selectCommand(filteredCommands[0]);
        return;
      }
      event.preventDefault();
      if (!streaming && value.trim()) onSend();
    }
    if (event.key === 'Escape' && paletteOpen) {
      event.preventDefault();
      if (value === '/') onChange('');
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!streaming && value.trim()) onSend();
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {paletteOpen && filteredCommands.length > 0 && (
        <Paper
          elevation={6}
          sx={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            right: 0,
            mb: 1,
            maxHeight: 320,
            overflowY: 'auto',
            borderRadius: 3,
            border: 1,
            borderColor: 'divider',
            zIndex: 20,
          }}
        >
          <Typography variant="caption" sx={{ display: 'block', px: 2, pt: 1.25, pb: 0.5, color: 'text.secondary', fontWeight: 700, letterSpacing: 1 }}>
            DEV COMMANDS
          </Typography>
          {filteredCommands.map((command) => (
            <ListItemButton key={command.name} onClick={() => selectCommand(command)} sx={{ py: 1, borderRadius: 2, mx: 0.5 }}>
              <AutoAwesomeIcon fontSize="small" sx={{ mr: 1.5, color: 'primary.main', flexShrink: 0 }} />
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" fontWeight={700} sx={{ color: 'primary.main' }}>
                      /{command.name}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>{command.label}</Typography>
                  </Box>
                }
                secondary={command.description}
                primaryTypographyProps={{ component: 'div' }}
              />
            </ListItemButton>
          ))}
        </Paper>
      )}

      <Paper
        component="form"
        onSubmit={handleSubmit}
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1,
          px: 1.5,
          py: 1,
          border: 1,
          borderColor: 'divider',
          borderRadius: 4,
          bgcolor: 'background.paper',
          boxShadow: '0 18px 40px rgba(15, 23, 42, 0.04)',
          '&:focus-within': {
            borderColor: 'rgba(16,163,127,0.35)',
            boxShadow: '0 0 0 4px rgba(16,163,127,0.08)',
          },
        }}
      >
        <InputBase
          multiline
          maxRows={8}
          fullWidth
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          sx={{
            px: 0.5,
            py: 0.75,
            fontSize: '0.97rem',
            color: 'text.primary',
            '& textarea::-webkit-scrollbar': { display: 'none' },
          }}
          inputProps={{ 'aria-label': placeholder, autoFocus: true }}
        />
        {micSupported && (
          <IconButton
            onClick={onMicToggle}
            aria-label={micActive ? 'Stop voice input' : 'Start voice input'}
            sx={{
              flexShrink: 0,
              mb: 0.25,
              color: micActive ? '#fff' : 'text.primary',
              bgcolor: micActive ? 'rgba(239, 68, 68, 0.9)' : 'action.hover',
              animation: micActive ? 'pulse 1.4s ease-in-out infinite' : 'none',
              '@keyframes pulse': {
                '0%, 100%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.5)' },
                '50%': { boxShadow: '0 0 0 8px rgba(239, 68, 68, 0)' },
              },
              '&:hover': {
                bgcolor: micActive ? 'rgba(239, 68, 68, 1)' : 'rgba(16,163,127,0.1)',
              },
            }}
          >
            {micActive ? <StopCircleIcon /> : <MicIcon />}
          </IconButton>
        )}
        {streaming ? (
          <IconButton
            onClick={onStop}
            color="error"
            aria-label="Stop generating"
            sx={{
              flexShrink: 0,
              mb: 0.25,
              bgcolor: 'rgba(239, 68, 68, 0.08)',
              '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.12)' },
            }}
          >
            <StopCircleIcon />
          </IconButton>
        ) : (
          <IconButton
            type="submit"
            disabled={disabled || !value.trim()}
            color="primary"
            aria-label="Send message"
            sx={{
              flexShrink: 0,
              mb: 0.25,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              borderRadius: 2,
              '&:hover': { bgcolor: 'primary.dark' },
              '&.Mui-disabled': {
                bgcolor: 'rgba(17,24,39,0.08)',
                color: 'text.disabled',
              },
            }}
          >
            <SendIcon sx={{ fontSize: 20 }} />
          </IconButton>
        )}
      </Paper>
    </Box>
  );
}
