import React, { createContext, useContext, useEffect, useState } from 'react';
import { ConfigProvider } from 'antd';
import { ThemeType, getThemeConfig } from '../theme';

// Theme context type
interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

// Create theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider props
interface ThemeProviderProps {
  children: React.ReactNode;
}

// Theme provider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Get initial theme from localStorage or default to 'light'
  const [theme, setThemeState] = useState<ThemeType>(() => {
    const savedTheme = localStorage.getItem('statdash-theme');
    if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'auto') {
      return savedTheme;
    }
    return 'light';
  });

  // Determine if current theme is dark
  const isDark = theme === 'dark' ||
    (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Theme setter with localStorage persistence
  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    localStorage.setItem('statdash-theme', newTheme);
  };

  // Toggle between light and dark themes
  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
  };

  // Handle system theme changes when theme is set to 'auto'
  useEffect(() => {
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleChange = () => {
        // Force re-render by updating state
        setThemeState('auto');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  // Set data-theme attribute for CSS custom properties
  useEffect(() => {
    const themeAttribute = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', themeAttribute);

    // Also set on body for broader compatibility
    document.body.setAttribute('data-theme', themeAttribute);

    return () => {
      document.documentElement.removeAttribute('data-theme');
      document.body.removeAttribute('data-theme');
    };
  }, [isDark]);

  // Get theme configuration
  const themeConfig = getThemeConfig(isDark ? 'dark' : 'light');

  // Context value
  const contextValue: ThemeContextType = {
    theme,
    setTheme,
    isDark,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <ConfigProvider theme={themeConfig}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

// Hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Export theme context for advanced usage
export { ThemeContext };