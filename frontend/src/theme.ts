import { createTheme } from '@mui/material/styles';
import { contrastTextFor, darkenHex, isValidHex } from './lib/color';

export const lightBackground =
  'radial-gradient(1200px 600px at 85% -150px, rgba(139, 92, 246, 0.12) 0%, transparent 60%), radial-gradient(1000px 500px at 10% 110%, rgba(14, 165, 233, 0.10) 0%, transparent 60%), linear-gradient(160deg, #eef6ff 0%, #f0ebff 45%, #fdeef5 100%)';

export const darkBackground =
  'radial-gradient(1000px 480px at 15% -120px, rgba(0, 230, 118, 0.09) 0%, transparent 60%), radial-gradient(900px 480px at 85% -120px, rgba(34, 211, 238, 0.08) 0%, transparent 60%), radial-gradient(1100px 500px at 50% 115%, rgba(139, 92, 246, 0.10) 0%, transparent 60%), linear-gradient(180deg, #0a0f0c 0%, #0d1410 100%)';

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
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          fontWeight: 600,
          '&.MuiButton-contained': {
            background: 'linear-gradient(135deg, #10a37f 0%, #3b82f6 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #0e9274 0%, #2f74e0 100%)',
            },
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          backgroundColor: '#f5f5f4',
        },
        body: {
          margin: 0,
          background: lightBackground,
          backgroundAttachment: 'fixed',
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
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          fontWeight: 600,
          '&.MuiButton-contained': {
            background: 'linear-gradient(135deg, #00e676 0%, #00c853 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #00c853 0%, #00b24a 100%)',
            },
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          backgroundColor: '#0a0f0c',
        },
        body: {
          margin: 0,
          background: darkBackground,
          backgroundAttachment: 'fixed',
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

export function createAppTheme(mode: 'light' | 'dark', accent?: string) {
  const base = mode === 'dark' ? darkTheme : lightTheme;
  if (!accent || !isValidHex(accent)) return base;

  const main = accent.trim();
  const dark = darkenHex(main);
  const hover = darkenHex(main, 0.3);

  return createTheme(base, {
    palette: {
      primary: {
        main,
        dark,
        light: mode === 'dark' ? darkenHex(main, -0.55) : '#d7f5ec',
        contrastText: contrastTextFor(main),
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            '&.MuiButton-contained': {
              background: `linear-gradient(135deg, ${main} 0%, ${dark} 100%)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${dark} 0%, ${hover} 100%)`,
              },
            },
          },
        },
      },
    },
  });
}

export default lightTheme;
