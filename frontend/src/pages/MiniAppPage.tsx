import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import BrandLogo from '../components/BrandLogo';
import { api, MiniAppDetail } from '../api/client';
import { useAppSettings } from '../lib/settings';

export default function MiniAppPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { branding } = useAppSettings();
  const [app, setApp] = useState<MiniAppDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .getPublicMiniApp(id)
      .then(({ app: data }) => setApp(data))
      .catch(() => setError('This mini-app does not exist or is no longer public.'));
  }, [id]);

  useEffect(() => {
    document.title = app ? `${app.name} · ${branding.appName}` : branding.appName;
  }, [app, branding.appName]);

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#0f172a',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: { xs: 1.5, sm: 2.5 },
          py: 1.5,
          borderBottom: 1,
          borderColor: 'rgba(255,255,255,0.1)',
          bgcolor: '#0f172a',
          flexShrink: 0,
        }}
      >
        <BrandLogo size={28} />
        <Typography
          variant="subtitle2"
          fontWeight={700}
          noWrap
          sx={{ color: '#e2e8f0', flex: 1 }}
        >
          {app?.name ?? 'Mini-app'}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: '#94a3b8', display: { xs: 'none', sm: 'block' } }}
        >
          Built with {branding.appName}
        </Typography>
        <Button
          size="small"
          variant="outlined"
          onClick={() => navigate('/login')}
          sx={{
            color: '#e2e8f0',
            borderColor: 'rgba(255,255,255,0.25)',
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: 2.5,
            '&:hover': { borderColor: 'rgba(255,255,255,0.5)', bgcolor: 'rgba(255,255,255,0.06)' },
          }}
        >
          Try {branding.appName}
        </Button>
      </Box>

      <Box sx={{ flex: 1, position: 'relative', bgcolor: '#ffffff', minHeight: 0 }}>
        {error ? (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              p: 3,
            }}
          >
            <Typography variant="h6" fontWeight={700} sx={{ color: '#1f2937' }}>
              App not found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              {error}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/login')}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2.5 }}
            >
              Go to {branding.appName}
            </Button>
          </Box>
        ) : !app ? (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Box
            component="iframe"
            srcDoc={app.html}
            sandbox="allow-scripts"
            title={app.name}
            sx={{ width: '100%', height: '100%', border: 'none', display: 'block', bgcolor: '#ffffff' }}
          />
        )}
      </Box>
    </Box>
  );
}
