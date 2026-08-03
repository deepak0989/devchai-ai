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
        borderColor: 'divider',
        borderRadius: 3,
        bgcolor: 'background.paper',
        '&:focus-within': {
          borderColor: 'rgba(255,255,255,0.25)',
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
          py: 0.5,
          fontSize: '0.95rem',
          '& textarea::-webkit-scrollbar': { display: 'none' },
        }}
        inputProps={{ 'aria-label': placeholder, autoFocus: true }}
      />
      {streaming ? (
        <IconButton
          onClick={onStop}
          color="error"
          aria-label="Stop generating"
          sx={{ flexShrink: 0, mb: 0.25 }}
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
            '&:hover': { bgcolor: 'primary.dark' },
            '&.Mui-disabled': {
              bgcolor: 'rgba(255,255,255,0.12)',
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
