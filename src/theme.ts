import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4f9cff',
    },
    secondary: {
      main: '#ff3d8a',
    },
    success: {
      main: '#10b981',
    },
    warning: {
      main: '#fbbf24',
    },
    error: {
      main: '#f97316',
    },
    info: {
      main: '#67e8f9',
    },
    background: {
      default: '#0a0e1a',
      paper: '#111827',
    },
    text: {
      primary: 'rgba(255,255,255,0.95)',
      secondary: 'rgba(255,255,255,0.6)',
    },
    divider: 'rgba(255,255,255,0.08)',
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    h1: { letterSpacing: '-0.02em' },
    h2: { letterSpacing: '-0.02em' },
    h3: { letterSpacing: '-0.01em' },
    h4: { letterSpacing: '-0.01em' },
    h5: { letterSpacing: '-0.01em' },
    h6: { letterSpacing: '-0.005em' },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: `
            radial-gradient(ellipse 80% 60% at 10% 90%, rgba(79,156,255,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 90% 10%, rgba(255,61,138,0.06) 0%, transparent 50%)
          `,
          backgroundAttachment: 'fixed',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(17,24,39,0.7)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 12,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(10,14,26,0.8)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
        containedPrimary: {
          boxShadow: '0 0 20px rgba(79,156,255,0.3)',
          '&:hover': {
            boxShadow: '0 0 24px rgba(79,156,255,0.4)',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(17,24,39,0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(17,24,39,0.9)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.06)',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(17,24,39,0.9)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'rgba(17,24,39,0.95)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8,
          fontSize: 12,
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: 'rgba(79,156,255,0.15)',
            '&:hover': {
              backgroundColor: 'rgba(79,156,255,0.25)',
            },
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(255,255,255,0.06)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomColor: 'rgba(255,255,255,0.06)',
        },
        head: {
          backgroundColor: 'rgba(17,24,39,0.9)',
          borderBottomColor: 'rgba(255,255,255,0.08)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: 'rgba(255,255,255,0.5)',
          '&.Mui-selected': {
            color: '#4f9cff',
          },
        },
      },
    },
  },
});

export default theme;
