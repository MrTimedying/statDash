// Material UI Theme Provider for Phase 1.5
import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { useUIStore } from '../stores/ui.store';

// Create Material UI theme based on our design system
const createAppTheme = (mode: 'light' | 'dark' = 'light') => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#1976d2', // Blue
        light: '#42a5f5',
        dark: '#1565c0',
      },
      secondary: {
        main: '#dc004e', // Pink
        light: '#ff5983',
        dark: '#9a0036',
      },
      success: {
        main: '#2e7d32', // Green
        light: '#4caf50',
        dark: '#1b5e20',
      },
      warning: {
        main: '#ed6c02', // Orange
        light: '#ff9800',
        dark: '#e65100',
      },
      error: {
        main: '#d32f2f', // Red
        light: '#f44336',
        dark: '#c62828',
      },
      info: {
        main: '#0288d1', // Light Blue
        light: '#03dac6',
        dark: '#01579b',
      },
      background: {
        default: mode === 'light' ? '#fafafa' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
    },
    typography: {
      fontFamily: '"Rubik", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      // Condensed typography scale following GRAPHICS_FOUNDATION.md
      h1: {
        fontSize: '1.5rem', // 24px - page titles
        fontWeight: 600,
        lineHeight: 1.2,
      },
      h2: {
        fontSize: '1rem', // 16px - section headers
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h3: {
        fontSize: '0.875rem', // 14px - component headers
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h4: {
        fontSize: '0.8125rem', // 13px
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '0.75rem', // 12px
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h6: {
        fontSize: '0.6875rem', // 11px
        fontWeight: 600,
        lineHeight: 1.4,
      },
      body1: {
        fontSize: '0.75rem', // 12px - primary content
        lineHeight: 1.4,
      },
      body2: {
        fontSize: '0.6875rem', // 11px - secondary content
        lineHeight: 1.4,
      },
      subtitle1: {
        fontSize: '0.8125rem', // 13px
        fontWeight: 500,
        lineHeight: 1.4,
      },
      subtitle2: {
        fontSize: '0.75rem', // 12px
        fontWeight: 500,
        lineHeight: 1.4,
      },
      caption: {
        fontSize: '0.625rem', // 10px - labels, metadata
        lineHeight: 1.3,
      },
      overline: {
        fontSize: '0.5625rem', // 9px - fine print
        fontWeight: 500,
        lineHeight: 1.3,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      },
      button: {
        textTransform: 'none',
        fontWeight: 500,
        fontSize: '0.75rem', // 12px
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 4, // Tighter border radius
            padding: '4px 8px', // Reduced padding
            fontSize: '0.75rem', // 12px
            fontWeight: 500,
            textTransform: 'none',
            boxShadow: 'none',
            minHeight: '28px', // Smaller minimum height
            '&:hover': {
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.12)',
            },
          },
          contained: {
            '&:hover': {
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            },
          },
          sizeSmall: {
            padding: '2px 6px',
            fontSize: '0.6875rem', // 11px
            minHeight: '24px',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 6, // Tighter radius
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.06)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 6,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 4,
              fontSize: '0.75rem', // 12px
              '& .MuiOutlinedInput-input': {
                padding: '6px 8px', // Tighter padding
              },
            },
            '& .MuiInputLabel-root': {
              fontSize: '0.75rem', // 12px
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            fontSize: '0.6875rem', // 11px
            height: '20px', // Smaller height
          },
          sizeSmall: {
            fontSize: '0.625rem', // 10px
            height: '18px',
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            minHeight: '32px', // Smaller tabs
          },
        },
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            borderRadius: 4,
            '&:before': {
              display: 'none',
            },
            '&.Mui-expanded': {
              margin: 0,
            },
          },
        },
      },
      MuiAccordionSummary: {
        styleOverrides: {
          root: {
            minHeight: '32px',
            padding: '0 8px',
            '&.Mui-expanded': {
              minHeight: '32px',
            },
          },
        },
      },
      MuiAccordionDetails: {
        styleOverrides: {
          root: {
            padding: '8px',
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            '& .MuiSwitch-switchBase': {
              padding: 4,
            },
            '& .MuiSwitch-thumb': {
              width: 12,
              height: 12,
            },
            '& .MuiSwitch-track': {
              borderRadius: 6,
            },
          },
          sizeSmall: {
            '& .MuiSwitch-thumb': {
              width: 10,
              height: 10,
            },
            '& .MuiSwitch-switchBase': {
              padding: 3,
            },
          },
        },
      },
    },
    spacing: 8, // 8px base unit
  });
};

interface MaterialThemeProviderProps {
  children: React.ReactNode;
}

export const MaterialThemeProvider: React.FC<MaterialThemeProviderProps> = ({ children }) => {
  const { theme } = useUIStore();

  const muiTheme = React.useMemo(() => {
    return createAppTheme(theme === 'dark' ? 'dark' : 'light');
  }, [theme]);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};