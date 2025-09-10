// Main exports for StatDash Charts module

// Types
export * from './types/chart.types';

// Base components
export { ChartContainer, useChartInteractions } from './base/ChartContainer';

// Statistical charts
export { default as PValueChart } from './statistical/PValueChart';

// Utilities
export * from './utils/chart-utils';

// Re-export chart transformers (keeping existing functionality)
export {
  transformPValueHistogram,
  transformEffectSizeBoxPlot,
  transformConfidenceIntervals,
  transformPowerAnalysis,
  transformSignificanceMatrix,
  transformPairComparison,
  transformSimulationProgress,
  transformStatisticalSummary
} from '../../utils/chart-transformers';