import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Typography,
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import TerminalIcon from '@mui/icons-material/Terminal';
import KeyboardCommandKeyIcon from '@mui/icons-material/KeyboardCommandKey';
import MicIcon from '@mui/icons-material/Mic';
import BoltIcon from '@mui/icons-material/Bolt';
import { useAuth } from '../context/AuthContext';
import { useAppSettings } from '../lib/settings';
import { darkBackground, lightBackground } from '../theme';
import BrandLogo from '../components/BrandLogo';

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 18.9 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.7l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"
      />
    </svg>
  );
}

const FEATURES = [
  {
    icon: <BoltIcon sx={{ fontSize: 19, color: '#10a37f' }} />,
    title: '4 top AI models',
    description: 'GPT-4o mini, Claude 3.5 Sonnet, Gemini 2.0 Flash & DeepSeek',
  },
  {
    icon: <CodeIcon sx={{ fontSize: 19, color: '#3b82f6' }} />,
    title: 'Code-first markdown',
    description: 'Syntax-highlighted code blocks with one-click copy',
  },
  {
    icon: <TerminalIcon sx={{ fontSize: 19, color: '#8b5cf6' }} />,
    title: 'Run code instantly',
    description: 'Execute Python & JavaScript right in the chat',
  },
  {
    icon: <KeyboardCommandKeyIcon sx={{ fontSize: 19, color: '#f59e0b' }} />,
    title: 'Dev slash commands',
    description: '/review, /debug, /tests, /refactor and more',
  },
  {
    icon: <MicIcon sx={{ fontSize: 19, color: '#d97757' }} />,
    title: 'Voice chat',
    description: 'Talk to the AI and hear replies aloud',
  },
];

export default function AuthPage() {
  const { signInWithGoogle } = useAuth();
  const { branding } = useAppSettings();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleGoogleLogin() {
    setError(null);
    setSubmitting(true);

    try {
      await signInWithGoogle();
      // The browser is redirected to Google, then back to /auth/callback
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Google sign-in is not configured yet. See the README.'
      );
      setSubmitting(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        background: (theme) =>
          theme.palette.mode === 'dark' ? darkBackground : lightBackground,
        backgroundAttachment: 'fixed',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          width: 520,
          height: 520,
          borderRadius: '50%',
          top: -160,
          left: -120,
          background: 'radial-gradient(circle, rgba(16,163,127,0.16), transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 560,
          height: 560,
          borderRadius: '50%',
          bottom: -200,
          right: -140,
          background: 'radial-gradient(circle, rgba(59,130,246,0.14), transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.15fr 1fr' },
            gap: { xs: 3, md: 6 },
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <Box sx={{ display: { xs: 'none', md: 'block' }, pr: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box sx={{ boxShadow: '0 18px 38px rgba(16,163,127,0.25)' }}>
                <BrandLogo size={52} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.04em' }}>
                  {branding.appName}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 0.5 }}>
                  {branding.tagline.toUpperCase()}
                </Typography>
              </Box>
            </Box>

            <Typography variant="h2" fontWeight={800} sx={{ mb: 2, letterSpacing: '-0.05em', lineHeight: 1.1 }}>
              Code, debug and
              <Box component="span" sx={{ color: 'primary.main' }}> ship faster.</Box>
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 460, fontSize: '1.05rem' }}>
              The best AI models, a developer-first experience, and voice — all in one
              place. No setup, no cards. Just sign in and start building.
            </Typography>

            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, maxWidth: 500 }}>
              {FEATURES.map((feature) => (
                <Box
                  component="li"
                  key={feature.title}
                  sx={{
                    display: 'flex',
                    gap: 2,
                    mb: 1.75,
                    p: 1.75,
                    borderRadius: 3,
                    border: 1,
                    borderColor: 'divider',
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(17,24,20,0.6)' : 'rgba(255,255,255,0.7)',
                    backdropFilter: 'blur(6px)',
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2.5,
                      bgcolor: 'action.hover',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>{feature.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{feature.description}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          <Box
            sx={{
              p: { xs: 3, sm: 4.5 },
              borderRadius: 5,
              bgcolor: 'background.paper',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 30px 70px rgba(0,0,0,0.5)'
                  : '0 30px 70px rgba(15,23,42,0.10)',
              border: 1,
              borderColor: 'divider',
              maxWidth: 440,
              mx: 'auto',
              width: '100%',
            }}
          >
            <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1, mb: 2 }}>
              <BrandLogo size={34} />
              <Typography variant="h6" fontWeight={800}>{branding.appName}</Typography>
            </Box>

            <Typography variant="h4" fontWeight={800} sx={{ mb: 0.75, letterSpacing: '-0.04em' }}>
              Welcome
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Sign in with your Google account to start chatting.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              variant="outlined"
              fullWidth
              size="large"
              onClick={handleGoogleLogin}
              disabled={submitting}
              startIcon={
                submitting ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <GoogleIcon />
                )
              }
              sx={{
                py: 1.6,
                borderRadius: 3,
                borderColor: 'divider',
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': {
                  borderColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(209,250,229,0.3)' : 'rgba(17,24,39,0.3)',
                  bgcolor: 'action.hover',
                },
              }}
            >
              {submitting ? 'Redirecting to Google...' : 'Continue with Google'}
            </Button>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', textAlign: 'center', mt: 2.5 }}
            >
              A new account is created automatically on your first sign-in.
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
