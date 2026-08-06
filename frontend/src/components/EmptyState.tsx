import { Box, Chip, Stack, Typography } from '@mui/material';
import KeyboardCommandKeyIcon from '@mui/icons-material/KeyboardCommandKey';
import { useAppSettings } from '../lib/settings';
import BrandLogo from './BrandLogo';

interface EmptyStateProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  onCommandClick: (command: string) => void;
}

const COMMAND_HINTS = ['/review', '/debug', '/tests', '/refactor', '/explain'];

export default function EmptyState({ suggestions, onSuggestionClick, onCommandClick }: EmptyStateProps) {
  const { branding } = useAppSettings();

  return (
    <Box
      sx={{
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: 8,
        px: 2,
      }}
    >
      <Box sx={{ mb: 2.5, boxShadow: '0 18px 38px rgba(16,163,127,0.25)' }}>
        <BrandLogo size={76} />
      </Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1, letterSpacing: '-0.04em' }}>
        How can I help you today?
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Ask {branding.appName} anything about coding, debugging, or technology.
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 1.5,
          width: '100%',
          maxWidth: 560,
        }}
      >
        {suggestions.map((suggestion) => (
          <Chip
            key={suggestion}
            label={suggestion}
            onClick={() => onSuggestionClick(suggestion)}
            sx={{
              p: 1.5,
              height: 'auto',
              whiteSpace: 'normal',
              justifyContent: 'flex-start',
              textAlign: 'left',
              color: 'text.primary',
              border: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              borderRadius: 3,
              boxShadow: '0 1px 2px rgba(17,24,39,0.04)',
              '& .MuiChip-label': {
                display: 'block',
                whiteSpace: 'normal',
                lineHeight: 1.5,
                py: 0.5,
              },
              '&:hover': {
                bgcolor: 'rgba(16,163,127,0.04)',
                borderColor: 'rgba(16,163,127,0.2)',
              },
            }}
          />
        ))}
      </Box>

      <Stack
        direction="row"
        spacing={0.75}
        alignItems="center"
        justifyContent="center"
        flexWrap="wrap"
        sx={{ mt: 4 }}
      >
        <KeyboardCommandKeyIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
        <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
          Try a dev command:
        </Typography>
        {COMMAND_HINTS.map((command) => (
          <Chip
            key={command}
            label={command}
            size="small"
            onClick={() => onCommandClick(command)}
            sx={{
              height: 24,
              fontWeight: 700,
              color: 'primary.main',
              bgcolor: 'rgba(16,163,127,0.08)',
              '&:hover': { bgcolor: 'rgba(16,163,127,0.14)' },
            }}
          />
        ))}
      </Stack>
    </Box>
  );
}
