// Chart utility functions for StatDash

import { ChartData, ChartDataset, CHART_COLORS, SIGNIFICANCE_COLORS, BLUEPRINT_COLORS } from '../types/chart.types';

/**
 * Generate a color palette for chart datasets
 */
export const generateColorPalette = (count: number): string[] => {
  const baseColors = [
    CHART_COLORS.primary,
    CHART_COLORS.secondary,
    CHART_COLORS.accent,
    CHART_COLORS.warning,
    CHART_COLORS.error,
    CHART_COLORS.success,
    CHART_COLORS.info,
    CHART_COLORS.neutral
  ];

  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }

  // Generate additional colors if needed
  const colors = [...baseColors];
  for (let i = baseColors.length; i < count; i++) {
    const hue = (i * 137.5) % 360; // Golden angle approximation
    colors.push(`hsl(${hue}, 70%, 50%)`);
  }

  return colors;
};

/**
 * Generate blueprint-style gray color palette
 */
export const generateBlueprintGrayPalette = (count: number): string[] => {
  if (count <= BLUEPRINT_COLORS.grays.length) {
    return BLUEPRINT_COLORS.grays.slice(0, count);
  }

  // Extend with darker grays if needed
  const colors = [...BLUEPRINT_COLORS.grays];
  for (let i = BLUEPRINT_COLORS.grays.length; i < count; i++) {
    const intensity = Math.max(0, 100 - (i * 10));
    colors.push(`rgb(${intensity}, ${intensity}, ${intensity})`);
  }

  return colors;
};

/**
 * Get blueprint-style significance colors
 */
export const getBlueprintSignificanceColor = (pValue: number): string => {
  return pValue <= 0.05 ? BLUEPRINT_COLORS.significant : BLUEPRINT_COLORS.notSignificant;
};

/**
 * Create a significance-based color mapping
 */
export const getSignificanceColor = (pValue: number, alpha: number = 0.05): string => {
  return pValue < alpha ? SIGNIFICANCE_COLORS.significant : SIGNIFICANCE_COLORS.notSignificant;
};

/**
 * Format statistical values for display
 */
export const formatStatisticalValue = (
  value: number,
  type: 'p-value' | 'effect-size' | 'percentage' | 'count',
  decimals: number = 3
): string => {
  switch (type) {
    case 'p-value':
      if (value < 0.001) return '< 0.001';
      return value.toFixed(Math.min(decimals, 4));
    case 'effect-size':
      return value.toFixed(decimals);
    case 'percentage':
      return `${(value * 100).toFixed(decimals)}%`;
    case 'count':
      return value.toLocaleString();
    default:
      return value.toFixed(decimals);
  }
};

/**
 * Calculate optimal bin size for histograms
 */
export const calculateOptimalBins = (data: number[], method: 'sturges' | 'scott' | 'fd' = 'sturges'): number => {
  const n = data.length;
  if (n === 0) return 10;

  switch (method) {
    case 'sturges':
      return Math.ceil(Math.log2(n) + 1);
    case 'scott': {
      const std = Math.sqrt(data.reduce((sum, val) => sum + Math.pow(val - data.reduce((a, b) => a + b) / n, 2), 0) / n);
      const scottBinWidth = 3.5 * std / Math.pow(n, 1/3);
      const scottRange = Math.max(...data) - Math.min(...data);
      return Math.ceil(scottRange / scottBinWidth);
    }
    case 'fd': {
      // Freedman-Diaconis rule
      const sorted = [...data].sort((a, b) => a - b);
      const q75 = sorted[Math.floor(n * 0.75)];
      const q25 = sorted[Math.floor(n * 0.25)];
      const iqr = q75 - q25;
      const fdBinWidth = 2 * iqr / Math.pow(n, 1/3);
      const fdRange = Math.max(...data) - Math.min(...data);
      return Math.ceil(fdRange / fdBinWidth);
    }
    default:
      return 10;
  }
};

/**
 * Debounce function for chart interactions
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Create tooltip content for statistical data
 */
export const createStatisticalTooltip = (
  label: string,
  value: number,
  stats?: {
    pValue?: number;
    effectSize?: number;
    confidenceInterval?: [number, number];
    significance?: boolean;
  }
): string => {
  let tooltip = `${label}: ${formatStatisticalValue(value, 'count')}`;

  if (stats) {
    if (stats.pValue !== undefined) {
      tooltip += `\nP-value: ${formatStatisticalValue(stats.pValue, 'p-value')}`;
    }
    if (stats.effectSize !== undefined) {
      tooltip += `\nEffect Size: ${formatStatisticalValue(stats.effectSize, 'effect-size')}`;
    }
    if (stats.confidenceInterval) {
      const [lower, upper] = stats.confidenceInterval;
      tooltip += `\n95% CI: [${formatStatisticalValue(lower, 'effect-size')}, ${formatStatisticalValue(upper, 'effect-size')}]`;
    }
    if (stats.significance !== undefined) {
      tooltip += `\nSignificant: ${stats.significance ? 'Yes' : 'No'}`;
    }
  }

  return tooltip;
};

/**
 * Validate chart data structure
 */
export const validateChartData = (data: ChartData): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data) {
    errors.push('Chart data is null or undefined');
    return { valid: false, errors };
  }

  if (!Array.isArray(data.datasets)) {
    errors.push('Datasets must be an array');
  } else if (data.datasets.length === 0) {
    errors.push('At least one dataset is required');
  } else {
    data.datasets.forEach((dataset, index) => {
      if (!dataset.label) {
        errors.push(`Dataset ${index} is missing a label`);
      }
      if (!Array.isArray(dataset.data)) {
        errors.push(`Dataset ${index} data must be an array`);
      }
    });
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Export chart data to CSV format
 */
export const exportChartDataToCSV = (data: ChartData, filename: string = 'chart-data'): void => {
  if (!data.datasets || data.datasets.length === 0) return;

  const headers = ['Label', ...data.datasets.map(ds => ds.label)];
  const rows: string[][] = [headers];

  // Assuming all datasets have the same length
  const maxLength = Math.max(...data.datasets.map(ds => ds.data.length));

  for (let i = 0; i < maxLength; i++) {
    const row = [
      data.labels?.[i] || `Row ${i + 1}`,
      ...data.datasets.map(ds => ds.data[i]?.toString() || '')
    ];
    rows.push(row);
  }

  const csvContent = rows.map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};