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
          width: 64,
          height: 64,
          borderRadius: 3,
          bgcolor: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
        }}
      >
        <AutoAwesomeIcon sx={{ color: '#fff', fontSize: 32 }} />
      </Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
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
          maxWidth: 520,
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
              color: 'text.secondary',
              border: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              '& .MuiChip-label': {
                display: 'block',
                whiteSpace: 'normal',
                lineHeight: 1.5,
                py: 0.5,
              },
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.06)',
                color: 'text.primary',
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
