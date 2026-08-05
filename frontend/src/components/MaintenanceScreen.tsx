import { Box, Button, Typography } from '@mui/material';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import { useAuth } from '../context/AuthContext';

export default function MaintenanceScreen({ message }: { message: string }) {
  const { logout } = useAuth();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #f0fdfa 0%, #f5f5f4 100%)',
        p: 3,
      }}
    >
      <Box
        sx={{
          maxWidth: 480,
          width: '100%',
          textAlign: 'center',
          bgcolor: '#ffffff',
          border: 1,
          borderColor: 'rgba(17,24,39,0.08)',
          borderRadius: 5,
          p: { xs: 4, md: 6 },
          boxShadow: '0 24px 60px rgba(15,23,42,0.08)',
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            mx: 'auto',
            mb: 3,
            bgcolor: 'rgba(245,158,11,0.14)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BuildCircleIcon sx={{ fontSize: 44, color: '#d97706' }} />
        </Box>
        <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.04em', mb: 1 }}>
          Under maintenance
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
          {message}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
          We are making improvements and will be back online shortly.
        </Typography>
        <Button
          variant="outlined"
          color="inherit"
          onClick={() => logout()}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 3 }}
        >
          Sign out
        </Button>
      </Box>
    </Box>
  );
}
