import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#10a37f',
      light: '#d7f5ec',
      dark: '#0b8f6c',
    },
    secondary: { main: '#6b7cff' },
    background: {
      default: '#f5f5f4',
      paper: '#ffffff',
    },
    text: {
      primary: '#111827',
      secondary: '#6b7280',
    },
    divider: 'rgba(17, 24, 39, 0.08)',
  },
  shape: {
    borderRadius: 18,
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    body1: { lineHeight: 1.6 },
    body2: { lineHeight: 1.5 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          backgroundColor: '#f5f5f4',
        },
        body: {
          margin: 0,
          backgroundColor: '#f5f5f4',
          color: '#111827',
          scrollbarColor: '#d4d4d8 transparent',
          '&::-webkit-scrollbar': { width: 8, height: 8 },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#d4d4d8',
            borderRadius: 999,
          },
          '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          fontWeight: 600,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { fontSize: 12 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          boxShadow: 'none',
        },
      },
    },
  },
});

export default theme;
