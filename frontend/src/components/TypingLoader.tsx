import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { keyframes } from '@emotion/react';

const bounce = keyframes`
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
`;

const blink = keyframes`
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
`;

export default function TypingLoader() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (isDark) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, py: 0.5 }}>
        <Box
          sx={{
            width: 10,
            height: 18,
            borderRadius: 1,
            bgcolor: 'primary.main',
            boxShadow: '0 0 12px rgba(0,230,118,0.85), 0 0 26px rgba(0,230,118,0.4)',
            animation: `${blink} 1s step-end infinite`,
          }}
        />
        <Box
          component="span"
          sx={{
            color: 'primary.main',
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: 3,
            textShadow: '0 0 8px rgba(0,230,118,0.6)',
          }}
        >
          THINKING_
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', py: 0.5 }}>
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            animation: `${bounce} 1.2s infinite ease-in-out`,
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </Box>
  );
}
