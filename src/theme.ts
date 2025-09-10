import { theme as antdTheme } from 'antd';

// Light theme configuration
export const lightTheme = {
  token: {
    colorPrimary: '#1890ff',
    colorBgContainer: '#ffffff',
    colorText: '#000000d9',
    colorTextSecondary: '#00000073',
    colorBorder: '#d9d9d9',
    colorBorderSecondary: '#f0f0f0',
    borderRadius: 6,
    // Statistical color scheme
    colorSuccess: '#52c41a', // Significant results
    colorWarning: '#faad14', // Marginal significance
    colorError: '#f5222d',   // Non-significant
    colorInfo: '#1890ff',    // General information
  },
  algorithm: antdTheme.defaultAlgorithm,
};

// Dark theme configuration
export const darkTheme = {
  token: {
    colorPrimary: '#177ddc',
    colorBgContainer: '#1f1f1f', // Lighter than pure black
    colorText: '#ffffffd9',
    colorTextSecondary: '#ffffff73',
    colorBorder: '#434343',
    colorBorderSecondary: '#595959',
    borderRadius: 6,
    // Statistical color scheme for dark mode
    colorSuccess: '#49aa19',
    colorWarning: '#d89614',
    colorError: '#dc4446',
    colorInfo: '#177ddc',
  },
  algorithm: antdTheme.darkAlgorithm,
};

// Theme configuration type
export type ThemeType = 'light' | 'dark' | 'auto';

// Get theme configuration based on type
export const getThemeConfig = (themeType: ThemeType) => {
  if (themeType === 'dark') {
    return darkTheme;
  }
  return lightTheme;
};

// Statistical color palette for charts
export const statisticalColors = {
  significant: '#52c41a',
  marginal: '#faad14',
  nonSignificant: '#f5222d',
  neutral: '#1890ff',
  secondary: '#722ed1',
  tertiary: '#13c2c2',
};

// Effect size color mapping
export const effectSizeColors = {
  large: '#52c41a',
  medium: '#faad14',
  small: '#f5222d',
  negligible: '#d9d9d9',
};

// Significance level colors
export const significanceLevelColors = {
  0.001: '#722ed1',
  0.01: '#1890ff',
  0.05: '#52c41a',
  0.10: '#faad14',
  custom: '#f5222d',
};