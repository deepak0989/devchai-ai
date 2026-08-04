import { Box, Chip, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

interface EmptyStateProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

export default function EmptyState({ suggestions, onSuggestionClick }: EmptyStateProps) {
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
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: 4,
          bgcolor: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
          boxShadow: '0 18px 38px rgba(16,163,127,0.2)',
        }}
      >
        <AutoAwesomeIcon sx={{ color: '#fff', fontSize: 34 }} />
      </Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1, letterSpacing: '-0.04em' }}>
        How can I help you today?
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Ask DevChat AI anything about coding, debugging, or technology.
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
              borderColor: 'rgba(17,24,39,0.08)',
              bgcolor: '#ffffff',
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
    </Box>
  );
}
