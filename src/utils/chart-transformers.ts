import {
  SimulationResult,
  PairResult,
  HistogramBin,
  SamplePair,
  EffectSizeAnalysis
} from '../types/simulation.types';

// Chart.js data format interfaces
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
  // Chart.js specific properties
  yAxisID?: string;
  xAxisID?: string;
  type?: string;
  order?: number;
  stack?: string;
  hidden?: boolean;
  [key: string]: any; // Allow additional Chart.js properties
}

// Statistical color palette
const STATISTICAL_COLORS = {
  primary: '#8884d8',
  secondary: '#82ca9d',
  accent: '#ffc658',
  warning: '#ff7300',
  error: '#ff4d4f',
  success: '#00c49f',
  info: '#0088fe',
  neutral: '#888888'
};

const SIGNIFICANCE_COLORS = {
  significant: '#ff4d4f',
  notSignificant: '#52c41a',
  borderline: '#faad14'
};

export class ChartDataTransformer {
  /**
   * Transform p-value histogram data for Chart.js
   */
  static transformPValueHistogram(
    histogramData: HistogramBin[],
    title: string = 'P-Value Distribution'
  ): ChartData {
    const labels = histogramData.map(bin =>
      `${bin.bin_start.toFixed(2)}-${bin.bin_end.toFixed(2)}`
    );

    const data = histogramData.map(bin => bin.count);
    const backgroundColors = histogramData.map(bin =>
      bin.significant ? SIGNIFICANCE_COLORS.significant : SIGNIFICANCE_COLORS.notSignificant
    );

    return {
      labels,
      datasets: [{
        label: title,
        data,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors,
        borderWidth: 1,
      }]
    };
  }

  /**
   * Transform effect size data for box plot visualization
   */
  static transformEffectSizeBoxPlot(
    pairResults: PairResult[],
    title: string = 'Effect Size Distribution'
  ): ChartData {
    const labels = pairResults.map(result => result.pair_name);
    const datasets: ChartDataset[] = [];

    pairResults.forEach((result, index) => {
      const effectSizes = result.individual_results.map(r => r.effect_size);

      // Calculate quartiles for box plot
      const sorted = [...effectSizes].sort((a, b) => a - b);
      const q1 = sorted[Math.floor(sorted.length * 0.25)];
      const median = sorted[Math.floor(sorted.length * 0.5)];
      const q3 = sorted[Math.floor(sorted.length * 0.75)];
      const min = sorted[0];
      const max = sorted[sorted.length - 1];

      // For Chart.js box plot, we need to structure the data differently
      // This is a simplified version - you might want to use a box plot library
      datasets.push({
        label: result.pair_name,
        data: [min, q1, median, q3, max],
        backgroundColor: this.getColorForIndex(index),
        borderColor: this.getColorForIndex(index),
        borderWidth: 2,
      });
    });

    return {
      labels: ['Min', 'Q1', 'Median', 'Q3', 'Max'],
      datasets
    };
  }

  /**
   * Transform confidence interval data for error bar chart
   */
  static transformConfidenceIntervals(
    pairResults: PairResult[],
    title: string = 'Confidence Intervals'
  ): ChartData {
    const labels = pairResults.map(result => result.pair_name);
    const means = pairResults.map(result => result.aggregated_stats.mean_effect_size);
    const ciLower = pairResults.map(result =>
      result.aggregated_stats.mean_effect_size - result.aggregated_stats.effect_size_ci[0]
    );
    const ciUpper = pairResults.map(result =>
      result.aggregated_stats.effect_size_ci[1] - result.aggregated_stats.mean_effect_size
    );

    return {
      labels,
      datasets: [{
        label: 'Effect Size',
        data: means,
        backgroundColor: STATISTICAL_COLORS.primary,
        borderColor: STATISTICAL_COLORS.primary,
        borderWidth: 2,
        // Error bars would need a custom plugin or library
      }]
    };
  }

  /**
   * Transform power analysis data
   */
  static transformPowerAnalysis(
    pairResults: PairResult[],
    title: string = 'Statistical Power Analysis'
  ): ChartData {
    const labels = pairResults.map(result => result.pair_name);
    const powerValues = pairResults.map(result =>
      result.significance_analysis.by_threshold[0.05]?.percentage || 0
    );

    return {
      labels,
      datasets: [{
        label: 'Statistical Power (%)',
        data: powerValues,
        backgroundColor: powerValues.map(power =>
          power >= 80 ? STATISTICAL_COLORS.success :
          power >= 60 ? STATISTICAL_COLORS.warning :
          STATISTICAL_COLORS.error
        ),
        borderColor: STATISTICAL_COLORS.primary,
        borderWidth: 1,
      }]
    };
  }

  /**
   * Transform significance correlation matrix
   */
  static transformSignificanceMatrix(
    pairResults: PairResult[],
    title: string = 'Significance Correlation Matrix'
  ): ChartData {
    // This would create a heatmap-style visualization
    // For now, return a simplified bar chart
    const labels = pairResults.map(result => result.pair_name);
    const significanceRates = pairResults.map(result =>
      result.significance_analysis.by_threshold[0.05]?.percentage || 0
    );

    return {
      labels,
      datasets: [{
        label: 'Significance Rate (%)',
        data: significanceRates,
        backgroundColor: significanceRates.map(rate =>
          rate > 50 ? SIGNIFICANCE_COLORS.significant : SIGNIFICANCE_COLORS.notSignificant
        ),
        borderColor: STATISTICAL_COLORS.primary,
        borderWidth: 1,
      }]
    };
  }

  /**
   * Transform sample pair comparison data
   */
  static transformPairComparison(
    pairResults: PairResult[],
    title: string = 'Pair-wise Effect Size Comparison'
  ): ChartData {
    const labels = pairResults.map(result => result.pair_name);
    const effectSizes = pairResults.map(result => result.aggregated_stats.mean_effect_size);

    return {
      labels,
      datasets: [{
        label: 'Mean Effect Size',
        data: effectSizes,
        backgroundColor: effectSizes.map((size, index) => this.getColorForIndex(index)),
        borderColor: STATISTICAL_COLORS.primary,
        borderWidth: 2,
      }]
    };
  }

  /**
   * Transform simulation results for time series visualization
   */
  static transformSimulationProgress(
    results: SimulationResult[],
    title: string = 'Simulation Results Over Time'
  ): ChartData {
    const labels = results.map((_, index) => `Sim ${index + 1}`);
    const pValues = results.map(result => result.p_value);
    const effectSizes = results.map(result => result.effect_size);

    return {
      labels,
      datasets: [
        {
          label: 'P-Values',
          data: pValues,
          backgroundColor: 'rgba(136, 132, 216, 0.2)',
          borderColor: STATISTICAL_COLORS.primary,
          borderWidth: 1,
          yAxisID: 'pValueAxis',
          pointRadius: 2,
          pointHoverRadius: 4,
        },
        {
          label: 'Effect Sizes',
          data: effectSizes,
          backgroundColor: 'rgba(130, 202, 157, 0.2)',
          borderColor: STATISTICAL_COLORS.secondary,
          borderWidth: 1,
          yAxisID: 'effectSizeAxis',
          pointRadius: 2,
          pointHoverRadius: 4,
        }
      ]
    };
  }

  /**
   * Transform data for statistical summary dashboard
   */
  static transformStatisticalSummary(
    pairResults: PairResult[],
    title: string = 'Statistical Summary'
  ): {
    totalSimulations: number;
    totalSignificant: number;
    averagePower: number;
    effectSizeRange: [number, number];
    chartData: ChartData;
  } {
    const totalSimulations = pairResults.reduce((sum, result) =>
      sum + result.aggregated_stats.total_count, 0
    );

    const totalSignificant = pairResults.reduce((sum, result) =>
      sum + result.aggregated_stats.significant_count, 0
    );

    const averagePower = pairResults.reduce((sum, result) =>
      sum + (result.significance_analysis.by_threshold[0.05]?.percentage || 0), 0
    ) / pairResults.length;

    const effectSizes = pairResults.map(result => result.aggregated_stats.mean_effect_size);
    const effectSizeRange: [number, number] = [
      Math.min(...effectSizes),
      Math.max(...effectSizes)
    ];

    // Create summary chart
    const chartData: ChartData = {
      labels: ['Total Simulations', 'Significant Results', 'Average Power'],
      datasets: [{
        label: 'Statistical Summary',
        data: [totalSimulations, totalSignificant, averagePower],
        backgroundColor: [
          STATISTICAL_COLORS.primary,
          SIGNIFICANCE_COLORS.significant,
          STATISTICAL_COLORS.success
        ],
        borderColor: STATISTICAL_COLORS.primary,
        borderWidth: 1,
      }]
    };

    return {
      totalSimulations,
      totalSignificant,
      averagePower,
      effectSizeRange,
      chartData
    };
  }

  /**
   * Get color for index (cycling through palette)
   */
  private static getColorForIndex(index: number): string {
    const colors = [
      STATISTICAL_COLORS.primary,
      STATISTICAL_COLORS.secondary,
      STATISTICAL_COLORS.accent,
      STATISTICAL_COLORS.warning,
      STATISTICAL_COLORS.error,
      STATISTICAL_COLORS.success,
      STATISTICAL_COLORS.info,
      STATISTICAL_COLORS.neutral
    ];
    return colors[index % colors.length];
  }

  /**
   * Create color gradient for continuous data
   */
  static createColorGradient(
    values: number[],
    minColor: string = '#e6f7ff',
    maxColor: string = '#1890ff'
  ): string[] {
    const min = Math.min(...values);
    const max = Math.max(...values);

    return values.map(value => {
      const ratio = (value - min) / (max - min);
      // Simple interpolation - you might want to use a proper color library
      return ratio > 0.5 ? maxColor : minColor;
    });
  }

  /**
   * Format tooltip data for statistical context
   */
  static formatTooltipData(
    dataset: ChartDataset,
    dataIndex: number,
    statisticalContext?: {
      pValue?: number;
      effectSize?: number;
      confidenceInterval?: [number, number];
      significance?: boolean;
    }
  ): string {
    let tooltip = `${dataset.label}: ${dataset.data[dataIndex].toFixed(3)}`;

    if (statisticalContext) {
      if (statisticalContext.pValue !== undefined) {
        tooltip += `\nP-value: ${statisticalContext.pValue.toFixed(4)}`;
      }
      if (statisticalContext.effectSize !== undefined) {
        tooltip += `\nEffect Size: ${statisticalContext.effectSize.toFixed(3)}`;
      }
      if (statisticalContext.confidenceInterval) {
        const [lower, upper] = statisticalContext.confidenceInterval;
        tooltip += `\n95% CI: [${lower.toFixed(3)}, ${upper.toFixed(3)}]`;
      }
      if (statisticalContext.significance !== undefined) {
        tooltip += `\nSignificant: ${statisticalContext.significance ? 'Yes' : 'No'}`;
      }
    }

    return tooltip;
  }
}

// Export utility functions for common transformations
export const transformPValueHistogram = ChartDataTransformer.transformPValueHistogram;
export const transformEffectSizeBoxPlot = ChartDataTransformer.transformEffectSizeBoxPlot;
export const transformConfidenceIntervals = ChartDataTransformer.transformConfidenceIntervals;
export const transformPowerAnalysis = ChartDataTransformer.transformPowerAnalysis;
export const transformSignificanceMatrix = ChartDataTransformer.transformSignificanceMatrix;
export const transformPairComparison = ChartDataTransformer.transformPairComparison;
export const transformSimulationProgress = ChartDataTransformer.transformSimulationProgress;
export const transformStatisticalSummary = ChartDataTransformer.transformStatisticalSummary;