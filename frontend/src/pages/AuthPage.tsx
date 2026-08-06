import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DataObjectIcon from '@mui/icons-material/DataObject';
import AppShortcutIcon from '@mui/icons-material/AppShortcut';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import KeyboardCommandKeyIcon from '@mui/icons-material/KeyboardCommandKey';
import MicIcon from '@mui/icons-material/Mic';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeModeProvider';
import { useAppSettings } from '../lib/settings';
import { darkBackground, lightBackground } from '../theme';
import BrandLogo from '../components/BrandLogo';
import MatrixRain from '../components/MatrixRain';

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
    icon: <AutoAwesomeIcon sx={{ fontSize: 19, color: '#a855f7' }} />,
    title: '4 top AI models',
    description: 'GPT-4o mini, Claude 3.5 Sonnet, Gemini 2.0 Flash & DeepSeek',
  },
  {
    icon: <AppShortcutIcon sx={{ fontSize: 19, color: '#10a37f' }} />,
    title: 'Mini-app generator',
    description: 'Ask for an app or tool — play with the live preview right in chat',
  },
  {
    icon: <DataObjectIcon sx={{ fontSize: 19, color: '#3b82f6' }} />,
    title: 'Code-first markdown',
    description: 'Syntax-highlighted code blocks with one-click copy',
  },
  {
    icon: <RocketLaunchIcon sx={{ fontSize: 19, color: '#f59e0b' }} />,
    title: 'Run code instantly',
    description: 'Execute Python & JavaScript right in the chat',
  },
  {
    icon: <KeyboardCommandKeyIcon sx={{ fontSize: 19, color: '#8b5cf6' }} />,
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
  const { mode, toggleMode } = useThemeMode();
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
        '@supports (min-height: 100dvh)': {
          minHeight: '100dvh',
        },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: (theme) =>
          theme.palette.mode === 'dark' ? darkBackground : lightBackground,
        backgroundAttachment: 'fixed',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {mode === 'dark' && <MatrixRain />}

      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          width: 560,
          height: 560,
          borderRadius: '50%',
          top: -180,
          left: -140,
          background: 'radial-gradient(circle, rgba(16,163,127,0.16), transparent 70%)',
          pointerEvents: 'none',
          animation: 'blobFloat 24s ease-in-out infinite',
          '@keyframes blobFloat': {
            '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
            '33%': { transform: 'translate(50px, 30px) scale(1.1)' },
            '66%': { transform: 'translate(-30px, -20px) scale(0.94)' },
          },
        }}
      />
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          width: 620,
          height: 620,
          borderRadius: '50%',
          bottom: -220,
          right: -160,
          background: 'radial-gradient(circle, rgba(59,130,246,0.14), transparent 70%)',
          pointerEvents: 'none',
          animation: 'blobFloat 28s ease-in-out infinite reverse',
          '@keyframes blobFloat': {
            '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
            '33%': { transform: 'translate(50px, 30px) scale(1.1)' },
            '66%': { transform: 'translate(-30px, -20px) scale(0.94)' },
          },
        }}
      />
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          width: 480,
          height: 480,
          borderRadius: '50%',
          top: '42%',
          left: '8%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.11), transparent 70%)',
          pointerEvents: 'none',
          animation: 'blobFloat 32s ease-in-out infinite',
          '@keyframes blobFloat': {
            '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
            '33%': { transform: 'translate(50px, 30px) scale(1.1)' },
            '66%': { transform: 'translate(-30px, -20px) scale(0.94)' },
          },
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 2, sm: 3.5 },
          py: { xs: 2, sm: 2.5 },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
          <BrandLogo
            size={40}
            sx={{
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 8px 20px rgba(0,230,118,0.25)'
                  : '0 8px 20px rgba(16,163,127,0.22)',
            }}
          />
          <Box sx={{ display: { xs: 'none', sm: 'block' }, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.15 }} noWrap>
              {branding.appName}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ letterSpacing: 0.5, fontWeight: 600 }}
              noWrap
            >
              {branding.tagline}
            </Typography>
          </Box>
        </Box>
        <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          <IconButton
            onClick={toggleMode}
            aria-label="Toggle theme"
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              border: 1,
              borderColor: 'divider',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(17,24,20,0.6)' : 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 6px 18px rgba(15,23,42,0.10)',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            {mode === 'dark' ? (
              <LightModeIcon sx={{ color: 'primary.main' }} />
            ) : (
              <DarkModeIcon sx={{ color: '#f59e0b' }} />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      <Container
        maxWidth="lg"
        sx={{ position: 'relative', zIndex: 2, px: { xs: 2, sm: 4 } }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.05fr 0.95fr' },
            gap: { xs: 3, sm: 5, md: 5, lg: 7 },
            alignItems: 'center',
            pt: { xs: 12, sm: 14, md: 0 },
            pb: { xs: 10, md: 0 },
            '@keyframes heroFadeUp': {
              from: { opacity: 0, transform: 'translateY(18px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
            animation: 'heroFadeUp 0.55s ease-out',
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 1.5,
                py: 0.75,
                mb: { md: 2, lg: 2.5 },
                borderRadius: 999,
                border: 1,
                borderColor: 'divider',
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(17,24,20,0.6)'
                    : 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(6px)',
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  flexShrink: 0,
                  '@keyframes pulseDot': {
                    '0%': { boxShadow: '0 0 0 0 rgba(16,163,127,0.45)' },
                    '70%': { boxShadow: '0 0 0 9px rgba(16,163,127,0)' },
                    '100%': { boxShadow: '0 0 0 0 rgba(16,163,127,0)' },
                  },
                  animation: 'pulseDot 2.2s ease-out infinite',
                }}
              />
              Your AI developer workspace
            </Box>

            <Typography
              variant="h2"
              fontWeight={800}
              sx={{
                mb: 1.5,
                letterSpacing: '-0.045em',
                lineHeight: 1.12,
                fontSize: 'clamp(2rem, 2.6vw + 1.3rem, 3.6rem)',
              }}
            >
              Code, debug and
              <Box
                component="span"
                sx={{
                  background: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'linear-gradient(90deg, #00e676, #22d3ee, #a78bfa, #00e676)'
                      : 'linear-gradient(90deg, #10a37f, #3b82f6, #8b5cf6, #10a37f)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  '@keyframes gradientShift': {
                    '0%': { backgroundPosition: '0% center' },
                    '100%': { backgroundPosition: '200% center' },
                  },
                  animation: 'gradientShift 6s linear infinite',
                }}
              >
                {' '}ship faster.
              </Box>
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                mb: { xs: 3, md: 3, lg: 4 },
                maxWidth: 460,
                fontSize: { xs: '0.95rem', md: '1.05rem' },
              }}
            >
              The best AI models, a developer-first experience, and voice — all in one
              place. No setup, no cards. Just sign in and start building.
            </Typography>

            <Box
              component="ul"
              sx={{
                listStyle: 'none',
                p: 0,
                m: 0,
                maxWidth: 520,
                display: { xs: 'none', md: 'block' },
              }}
            >
              {FEATURES.map((feature) => (
                <Box
                  component="li"
                  key={feature.title}
                  sx={{
                    display: 'flex',
                    gap: 2,
                    mb: 1.75,
                    p: { md: 1.5, lg: 1.75 },
                    borderRadius: 3,
                    border: 1,
                    borderColor: 'divider',
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(17,24,20,0.6)'
                        : 'rgba(255,255,255,0.7)',
                    backdropFilter: 'blur(6px)',
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: (theme) =>
                        theme.palette.mode === 'dark'
                          ? '0 14px 30px rgba(0,0,0,0.35)'
                          : '0 14px 30px rgba(15,23,42,0.10)',
                    },
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
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle2" fontWeight={700}>{feature.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{feature.description}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          <Box
            sx={{
              p: { xs: 2.5, sm: 4.5 },
              borderRadius: 5,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(17,24,20,0.72)'
                  : 'rgba(255,255,255,0.78)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 30px 70px rgba(0,0,0,0.5)'
                  : '0 30px 70px rgba(15,23,42,0.12)',
              border: 1,
              borderColor: 'divider',
              maxWidth: 440,
              mx: 'auto',
              width: '100%',
            }}
          >
            <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1, mb: 2.5 }}>
              <BrandLogo size={34} />
              <Typography variant="h6" fontWeight={800} noWrap>{branding.appName}</Typography>
            </Box>

            <Typography
              variant="h4"
              fontWeight={800}
              sx={{ mb: 0.75, letterSpacing: '-0.04em', fontSize: { xs: '1.9rem', sm: '2.1rem' } }}
            >
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
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.04)'
                    : 'rgba(255,255,255,0.6)',
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

      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 5,
          textAlign: 'center',
          pb: 1.75,
          pointerEvents: 'none',
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.75, fontWeight: 600 }}>
          © {new Date().getFullYear()} {branding.appName} · Built for developers
        </Typography>
      </Box>
    </Box>
  );
}
