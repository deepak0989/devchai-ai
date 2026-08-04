import { FormEvent } from 'react';
import { IconButton, InputBase, Paper } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import StopCircleIcon from '@mui/icons-material/StopCircle';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  streaming: boolean;
  disabled: boolean;
  placeholder: string;
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  onStop,
  streaming,
  disabled,
  placeholder,
}: ChatInputProps) {
  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!streaming && value.trim()) onSend();
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!streaming && value.trim()) onSend();
  }

  return (
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
        borderColor: 'rgba(17,24,39,0.08)',
        borderRadius: 4,
        bgcolor: '#ffffff',
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
            color: '#fff',
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
  );
}
