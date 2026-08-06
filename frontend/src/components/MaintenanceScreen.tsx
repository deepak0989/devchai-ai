import { Box, Button, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useAppSettings } from '../lib/settings';
import BrandLogo from './BrandLogo';

export default function MaintenanceScreen({ message }: { message: string }) {
  const { logout } = useAuth();
  const { branding } = useAppSettings();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(180deg, #0a0f0c 0%, #0d130f 100%)'
            : 'linear-gradient(180deg, #f0fdfa 0%, #f5f5f4 100%)',
        p: 3,
      }}
    >
      <Box
        sx={{
          maxWidth: 480,
          width: '100%',
          textAlign: 'center',
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 5,
          p: { xs: 4, md: 6 },
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 24px 60px rgba(0,0,0,0.5)'
              : '0 24px 60px rgba(15,23,42,0.08)',
        }}
      >
        <Box sx={{ mx: 'auto', mb: 2.5, display: 'flex', justifyContent: 'center' }}>
          <BrandLogo size={72} sx={{ borderRadius: '50%' }} />
        </Box>
        <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.04em', mb: 0.5 }}>
          {branding.appName} is under maintenance
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
