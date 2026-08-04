import { Box } from '@mui/material';
import { keyframes } from '@emotion/react';

const bounce = keyframes`
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
`;

export default function TypingLoader() {
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
