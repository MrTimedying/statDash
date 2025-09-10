// Chart-specific types for StatDash visualization components

export interface ChartData {
  labels?: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
  pointRadius?: number;
  pointHoverRadius?: number;
  yAxisID?: string;
  xAxisID?: string;
  type?: string;
  order?: number;
  stack?: string;
  hidden?: boolean;
  [key: string]: any; // Allow additional Chart.js properties
}

export interface ChartConfig {
  // Data mapping
  xAxis?: string;
  yAxis?: string;
  colorBy?: string;
  sizeBy?: string;

  // Visual options
  showLegend: boolean;
  showGrid: boolean;
  interactive: boolean;
  animation: boolean;

  // Statistical options
  showConfidenceIntervals: boolean;
  significanceThreshold: number;
  effectSizeInterpretation: boolean;

  // Styling
  theme: 'light' | 'dark';
  colorScheme: string[];
  fontSize: number;
}

export interface ChartProps {
  chartId?: string;
  width?: number;
  height?: number;
  data?: any;
  config?: Partial<ChartConfig>;
  onDataUpdate?: (data: any) => void;
  onConfigChange?: (config: Partial<ChartConfig>) => void;
}

// Statistical chart specific types
export interface PValueChartProps extends ChartProps {
  significanceThreshold?: number;
  showConfidenceIntervals?: boolean;
}

export interface EffectSizeChartProps extends ChartProps {
  effectSizeThresholds?: {
    negligible: number;
    small: number;
    medium: number;
    large: number;
  };
}

export interface HistogramData {
  bins: Array<{
    bin_start: number;
    bin_end: number;
    count: number;
    significant: boolean;
  }>;
  totalCount: number;
  meanValue?: number;
}

export interface BoxPlotData {
  categories: string[];
  values: Array<{
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
    outliers?: number[];
  }>;
}

// Chart interaction types
export interface ChartInteractionEvent {
  type: 'click' | 'hover' | 'select';
  dataIndex: number;
  datasetIndex: number;
  value: any;
  label: string;
}

export type ChartType = 'histogram' | 'boxplot' | 'scatter' | 'bar' | 'line' | 'heatmap';

// Export common chart colors and themes
export const CHART_COLORS = {
  primary: '#8884d8',
  secondary: '#82ca9d',
  accent: '#ffc658',
  warning: '#ff7300',
  error: '#ff4d4f',
  success: '#00c49f',
  info: '#0088fe',
  neutral: '#888888'
};

export const SIGNIFICANCE_COLORS = {
  significant: '#ff4d4f',
  notSignificant: '#52c41a',
  borderline: '#faad14'
};

export const CHART_THEMES = {
  light: {
    backgroundColor: '#ffffff',
    gridColor: '#f0f0f0',
    textColor: '#333333'
  },
  dark: {
    backgroundColor: '#1f1f1f',
    gridColor: '#333333',
    textColor: '#ffffff'
  }
};