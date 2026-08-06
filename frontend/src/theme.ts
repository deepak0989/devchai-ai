import { createTheme } from '@mui/material/styles';

const baseComponents = {
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
} as const;

export const lightTheme = createTheme({
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
    ...baseComponents,
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
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00e676',
      light: '#69f0ae',
      dark: '#00c853',
      contrastText: '#04120b',
    },
    secondary: { main: '#22d3ee' },
    background: {
      default: '#0a0f0c',
      paper: '#111814',
    },
    text: {
      primary: '#d1fae5',
      secondary: '#93a8a0',
    },
    divider: 'rgba(209, 250, 229, 0.12)',
    action: {
      hover: 'rgba(0, 230, 118, 0.08)',
      selected: 'rgba(0, 230, 118, 0.14)',
      active: '#00e676',
    },
  },
  shape: {
    borderRadius: 18,
  },
  typography: {
    fontFamily:
      '"JetBrains Mono", "Fira Code", Consolas, "Courier New", monospace',
    body1: { lineHeight: 1.6 },
    body2: { lineHeight: 1.5 },
  },
  components: {
    ...baseComponents,
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          backgroundColor: '#0a0f0c',
        },
        body: {
          margin: 0,
          backgroundColor: '#0a0f0c',
          color: '#d1fae5',
          scrollbarColor: '#1f2b24 transparent',
          '&::-webkit-scrollbar': { width: 8, height: 8 },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#1f2b24',
            borderRadius: 999,
            '&:hover': { backgroundColor: '#2a3b31' },
          },
          '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
          '&::selection': { backgroundColor: 'rgba(0, 230, 118, 0.3)' },
        },
      },
    },
  },
});

export default lightTheme;
