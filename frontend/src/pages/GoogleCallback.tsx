import { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function GoogleCallback() {
  const { finalizeGoogleSignIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await finalizeGoogleSignIn();
        if (!cancelled) navigate('/', { replace: true });
      } catch {
        if (!cancelled) navigate('/login', { replace: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [finalizeGoogleSignIn, navigate]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">
        Signing you in...
      </Typography>
    </Box>
  );
}