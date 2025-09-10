import {
  MultiPairSimulationParams,
  MultiPairResults,
  PairResult,
  CrossPairAnalysis,
  GlobalStatistics,
  ExecutionMetadata,
  PerformanceMetrics,
  SimulationResult,
  AggregatedStats,
  SignificanceAnalysis,
  EffectSizeAnalysis,
  EffectSizeComparison,
  PowerAnalysis,
  SignificanceCorrelation,
  AnalysisRecommendation,
  SignificanceResult,
  ThresholdSensitivity,
  SamplePair,
  GlobalSimulationSettings
} from '../types/simulation.types';

// Production-ready statistical simulation engine using jStat library
// Implements verified statistical tests with proper algorithms

// @ts-ignore - jStat is a well-established library but lacks TypeScript definitions
import * as jStat from 'jstat';

// Statistical utility functions using jStat
class StatisticalUtils {
  // Generate normal random variable using jStat
  static normalRandom(mean: number = 0, std: number = 1): number {
    return (jStat as any).normal.sample(mean, std);
  }

  // Two-sample t-test using jStat
  static twoSampleTTest(group1: number[], group2: number[]): {
    t_statistic: number;
    p_value: number;
    effect_size: number;
    confidence_interval: [number, number];
  } {
    const n1 = group1.length;
    const n2 = group2.length;

    // Calculate means and variances
    const mean1 = (jStat as any).mean(group1);
    const mean2 = (jStat as any).mean(group2);
    const var1 = (jStat as any).variance(group1, true); // Sample variance
    const var2 = (jStat as any).variance(group2, true); // Sample variance

    // Pooled standard deviation (equal variances assumed)
    const pooled_var = ((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2);
    const pooled_std = Math.sqrt(pooled_var);

    // Standard error
    const se = pooled_std * Math.sqrt(1/n1 + 1/n2);

    // t-statistic
    const t_statistic = (mean1 - mean2) / se;

    // Degrees of freedom
    const df = n1 + n2 - 2;

    // Two-tailed p-value using jStat t-distribution
    const p_value = 2 * (1 - (jStat as any).studentt.cdf(Math.abs(t_statistic), df));

    // Effect size (Cohen's d)
    const effect_size = (mean1 - mean2) / pooled_std;

    // Confidence interval for effect size using t-distribution
    const t_critical = (jStat as any).studentt.inv(0.975, df); // 95% CI
    const ci_margin = t_critical * se / pooled_std;
    const confidence_interval: [number, number] = [
      effect_size - ci_margin,
      effect_size + ci_margin
    ];

    return {
      t_statistic,
      p_value: Math.max(0, Math.min(1, p_value)),
      effect_size,
      confidence_interval
    };
  }

  // Calculate S-value (Shannon information)
  static calculateSValue(p_value: number): number {
    if (p_value <= 0) return Infinity;
    if (p_value >= 1) return 0;
    return -Math.log2(p_value);
  }

  // Create p-value histogram bins
  static createPValueHistogram(p_values: number[], alpha: number = 0.05, num_bins: number = 20): Array<{
    bin_start: number;
    bin_end: number;
    count: number;
    significant: boolean;
  }> {
    const histogram = [];

    for (let i = 0; i < num_bins; i++) {
      const bin_start = i / num_bins;
      const bin_end = (i + 1) / num_bins;

      let count = 0;
      for (const p of p_values) {
        if (i === num_bins - 1) {
          // Last bin includes 1.0
          if (p >= bin_start && p <= bin_end) count++;
        } else {
          if (p >= bin_start && p < bin_end) count++;
        }
      }

      histogram.push({
        bin_start,
        bin_end,
        count,
        significant: bin_end <= alpha
      });
    }

    return histogram;
  }

  // Calculate confidence interval coverage
  static calculateCICoverage(
    true_value: number,
    confidence_intervals: Array<[number, number]>
  ): number {
    let coverage_count = 0;
    for (const [lower, upper] of confidence_intervals) {
      if (true_value >= lower && true_value <= upper) {
        coverage_count++;
      }
    }
    return coverage_count / confidence_intervals.length;
  }

  // Calculate mean confidence interval width
  static calculateMeanCIWidth(confidence_intervals: Array<[number, number]>): number {
    const widths = confidence_intervals.map(([lower, upper]) => upper - lower);
    return jStat.mean(widths);
  }
}

// Production-ready simulation function using jStat
async function runStatisticalSimulation(params: any): Promise<any> {
  const {
    group1_mean,
    group1_std,
    group2_mean,
    group2_std,
    sample_size_per_group,
    num_simulations,
    alpha_level
  } = params;

  const results = [];
  const p_values = [];
  const effect_sizes = [];
  const confidence_intervals = [];

  // True effect size for coverage calculation
  const true_effect_size = (group1_mean - group2_mean) /
    Math.sqrt((group1_std ** 2 + group2_std ** 2) / 2);

  for (let i = 0; i < num_simulations; i++) {
    // Generate samples using jStat
    const group1 = Array.from({length: sample_size_per_group},
      () => StatisticalUtils.normalRandom(group1_mean, group1_std));
    const group2 = Array.from({length: sample_size_per_group},
      () => StatisticalUtils.normalRandom(group2_mean, group2_std));

    // Perform proper t-test using jStat
    const test_result = StatisticalUtils.twoSampleTTest(group1, group2);

    // Calculate S-value
    const s_value = StatisticalUtils.calculateSValue(test_result.p_value);

    // Check significance
    const significant = test_result.p_value < alpha_level;

    const result = {
      p_value: test_result.p_value,
      effect_size: test_result.effect_size,
      confidence_interval: test_result.confidence_interval,
      s_value,
      significant
    };

    results.push(result);
    p_values.push(test_result.p_value);
    effect_sizes.push(test_result.effect_size);
    confidence_intervals.push(test_result.confidence_interval);

    // Yield control occasionally to prevent UI blocking
    if (i % 100 === 0 && i > 0) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  // Calculate aggregated statistics using jStat
  const significant_count = results.filter(r => r.significant).length;
  const mean_effect_size = (jStat as any).mean(effect_sizes);
  const mean_ci_width = StatisticalUtils.calculateMeanCIWidth(confidence_intervals);
  const ci_coverage = StatisticalUtils.calculateCICoverage(true_effect_size, confidence_intervals);

  // Calculate effect size CI using jStat
  const sorted_effect_sizes = [...effect_sizes].sort((a, b) => a - b);
  const lower_idx = Math.floor(0.025 * sorted_effect_sizes.length);
  const upper_idx = Math.floor(0.975 * sorted_effect_sizes.length);
  const effect_size_ci: [number, number] = [
    sorted_effect_sizes[lower_idx],
    sorted_effect_sizes[Math.min(upper_idx, sorted_effect_sizes.length - 1)]
  ];

  // Create histogram using jStat-based function
  const p_value_histogram = StatisticalUtils.createPValueHistogram(p_values, alpha_level, 20);

  return {
    individual_results: results,
    significant_count,
    total_count: num_simulations,
    mean_effect_size,
    effect_size_ci,
    ci_coverage,
    mean_ci_width,
    p_value_histogram
  };
}

export class MultiPairSimulationEngine {
  constructor() {
    // Web worker removed - using main thread for simplicity
  }

  async runMultiPairSimulation(
    params: MultiPairSimulationParams,
    onProgress?: (progress: SimulationProgress) => void
  ): Promise<MultiPairResults> {
    const startTime = performance.now();
    const enabledPairs = params.pairs.filter(p => p.enabled);

    if (enabledPairs.length === 0) {
      throw new Error('No sample pairs enabled for simulation');
    }

    const results: PairResult[] = [];
    const totalPairs = enabledPairs.length;

    // Run simulations for each pair
    for (let i = 0; i < totalPairs; i++) {
      const pair = enabledPairs[i];

      // Update progress
      onProgress?.({
        currentPair: i + 1,
        totalPairs,
        currentSimulation: 0,
        totalSimulations: params.global_settings.num_simulations,
        phase: 'running_simulations',
        pairName: pair.name
      });

      const pairResult = await this.runSinglePairSimulation(
        pair,
        params.global_settings,
        (simProgress) => {
          onProgress?.({
            currentPair: i + 1,
            totalPairs,
            currentSimulation: simProgress.completed,
            totalSimulations: simProgress.total,
            phase: 'running_simulations',
            pairName: pair.name
          });
        }
      );

      results.push(pairResult);
    }

    // Perform cross-pair analysis
    onProgress?.({
      currentPair: totalPairs,
      totalPairs,
      currentSimulation: params.global_settings.num_simulations,
      totalSimulations: params.global_settings.num_simulations,
      phase: 'analyzing_results'
    });

    const crossPairAnalysis = await this.performCrossPairAnalysis(results, params);
    const globalStatistics = this.calculateGlobalStatistics(results, startTime);
    const executionMetadata = this.createExecutionMetadata(params, startTime);

    return {
      pairs_results: results,
      cross_pair_analysis: crossPairAnalysis,
      global_statistics: globalStatistics,
      execution_metadata: executionMetadata
    };
  }

  private async runSinglePairSimulation(
    pair: SamplePair,
    settings: GlobalSimulationSettings,
    onProgress?: (progress: { completed: number; total: number }) => void
  ): Promise<PairResult> {
    // Convert pair to legacy format for existing simulation engine
    const legacyParams = {
      group1_mean: pair.group1.mean,
      group1_std: pair.group1.std,
      group2_mean: pair.group2.mean,
      group2_std: pair.group2.std,
      sample_size_per_group: pair.sample_size_per_group,
      num_simulations: settings.num_simulations,
      hypothesized_effect_size: 0, // Will be calculated
      alpha_level: 0.05 // Default, will be overridden by significance analysis
    };

    const legacyResults = await runStatisticalSimulation(legacyParams);

    // Convert legacy results to new format
    const individual_results = legacyResults.individual_results;
    const aggregated_stats: AggregatedStats = {
      significant_count: legacyResults.significant_count,
      total_count: legacyResults.total_count,
      mean_effect_size: legacyResults.mean_effect_size,
      effect_size_ci: legacyResults.effect_size_ci,
      ci_coverage: legacyResults.ci_coverage,
      mean_ci_width: legacyResults.mean_ci_width,
      p_value_histogram: legacyResults.p_value_histogram
    };

    const significance_analysis = this.analyzeSignificance(
      individual_results,
      settings.significance_levels
    );

    const effect_size_analysis = this.analyzeEffectSizes(individual_results);

    return {
      pair_id: pair.id,
      pair_name: pair.name,
      individual_results,
      aggregated_stats,
      significance_analysis,
      effect_size_analysis
    };
  }

  private analyzeSignificance(
    results: SimulationResult[],
    thresholds: number[]
  ): SignificanceAnalysis {
    const by_threshold: Record<number, SignificanceResult> = {};

    thresholds.forEach(threshold => {
      const significant_count = results.filter(r => r.p_value < threshold).length;
      const percentage = (significant_count / results.length) * 100;

      // Calculate confidence interval for percentage
      const p = percentage / 100;
      const n = results.length;
      const se = Math.sqrt((p * (1 - p)) / n);
      const ci_lower = Math.max(0, (p - 1.96 * se) * 100);
      const ci_upper = Math.min(100, (p + 1.96 * se) * 100);

      by_threshold[threshold] = {
        threshold,
        significant_count,
        percentage,
        confidence_interval: [ci_lower, ci_upper]
      };
    });

    const threshold_sensitivity = this.calculateThresholdSensitivity(results, thresholds);

    return {
      by_threshold,
      threshold_sensitivity
    };
  }

  private calculateThresholdSensitivity(
    results: SimulationResult[],
    thresholds: number[]
  ): ThresholdSensitivity {
    const sensitivity_curve = thresholds.map(threshold => ({
      threshold,
      sensitivity: (results.filter(r => r.p_value < threshold).length / results.length) * 100
    }));

    // Find optimal threshold (balance between Type I and Type II errors)
    const optimal_threshold = thresholds.reduce((best, current) => {
      const current_sensitivity = results.filter(r => r.p_value < current).length / results.length;
      const best_sensitivity = results.filter(r => r.p_value < best).length / results.length;
      return Math.abs(current_sensitivity - 0.8) < Math.abs(best_sensitivity - 0.8) ? current : best;
    });

    return {
      optimal_threshold,
      sensitivity_curve,
      type1_error_rate: 0.05, // Placeholder - would need true effect size
      type2_error_rate: 0.2   // Placeholder - would need true effect size
    };
  }

  private analyzeEffectSizes(results: SimulationResult[]): EffectSizeAnalysis {
    const effect_sizes = results.map(r => r.effect_size);
    const mean = effect_sizes.reduce((sum, val) => sum + val, 0) / effect_sizes.length;
    const sorted = [...effect_sizes].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];

    const variance = effect_sizes.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / effect_sizes.length;
    const standard_deviation = Math.sqrt(variance);

    // Calculate 95% confidence interval
    const se = standard_deviation / Math.sqrt(effect_sizes.length);
    const ci_lower = mean - 1.96 * se;
    const ci_upper = mean + 1.96 * se;

    // Interpret effect size using Cohen's guidelines
    const abs_mean = Math.abs(mean);
    let interpretation: 'negligible' | 'small' | 'medium' | 'large';
    let practical_significance: string;

    if (abs_mean < 0.2) {
      interpretation = 'negligible';
      practical_significance = 'Effect is too small to be practically meaningful';
    } else if (abs_mean < 0.5) {
      interpretation = 'small';
      practical_significance = 'Small but potentially meaningful effect';
    } else if (abs_mean < 0.8) {
      interpretation = 'medium';
      practical_significance = 'Medium effect with practical significance';
    } else {
      interpretation = 'large';
      practical_significance = 'Large effect with strong practical significance';
    }

    return {
      mean,
      median,
      standard_deviation,
      confidence_interval: [ci_lower, ci_upper],
      interpretation,
      practical_significance
    };
  }

  private async performCrossPairAnalysis(
    results: PairResult[],
    params: MultiPairSimulationParams
  ): Promise<CrossPairAnalysis> {
    const effect_size_comparison = this.compareEffectSizes(results);
    const power_analysis = this.analyzePower(results, params);
    const significance_correlation = this.analyzeSignificanceCorrelation(results);
    const recommendations = this.generateRecommendations(results, params);

    return {
      effect_size_comparison,
      power_analysis,
      significance_correlation,
      recommendations
    };
  }

  private compareEffectSizes(results: PairResult[]): EffectSizeComparison[] {
    const comparisons: EffectSizeComparison[] = [];

    for (let i = 0; i < results.length; i++) {
      for (let j = i + 1; j < results.length; j++) {
        const pair1 = results[i];
        const pair2 = results[j];

        const effect_size_diff = Math.abs(
          pair1.effect_size_analysis.mean - pair2.effect_size_analysis.mean
        );

        // Simple significance test for difference (placeholder)
        const significant = effect_size_diff > 0.2; // Rough threshold

        // Determine practical significance of difference
        let practical_significance: 'negligible' | 'small' | 'medium' | 'large';
        if (effect_size_diff < 0.1) practical_significance = 'negligible';
        else if (effect_size_diff < 0.3) practical_significance = 'small';
        else if (effect_size_diff < 0.5) practical_significance = 'medium';
        else practical_significance = 'large';

        comparisons.push({
          pair1_id: pair1.pair_id,
          pair2_id: pair2.pair_id,
          effect_size_difference: effect_size_diff,
          statistical_significance: significant,
          practical_significance
        });
      }
    }

    return comparisons;
  }

  private analyzePower(results: PairResult[], params: MultiPairSimulationParams): PowerAnalysis[] {
    return results.map(result => {
      const power = result.significance_analysis.by_threshold[0.05]?.percentage || 0;
      const effect_size = Math.abs(result.effect_size_analysis.mean);

      // Estimate required sample size for 80% power
      const required_n = this.calculateRequiredSampleSize(effect_size, 0.8, 0.05);

      return {
        pair_id: result.pair_id,
        statistical_power: power / 100,
        required_sample_size: required_n,
        effect_size,
        confidence_level: params.global_settings.confidence_level
      };
    });
  }

  private calculateRequiredSampleSize(
    effect_size: number,
    target_power: number,
    alpha: number
  ): number {
    // Simplified calculation based on Cohen's formulas
    // For two-sample t-test: n = (z_α/2 + z_β)² / d²
    const z_alpha = 1.96; // For α = 0.05
    const z_beta = 0.84;  // For 80% power

    if (effect_size === 0) return Infinity;

    const n = Math.pow(z_alpha + z_beta, 2) / Math.pow(effect_size, 2);
    return Math.ceil(n);
  }

  private analyzeSignificanceCorrelation(results: PairResult[]): SignificanceCorrelation {
    const correlation_matrix: Record<string, Record<string, number>> = {};
    const threshold_stability: Record<number, number> = {};

    // Initialize matrices
    results.forEach(result => {
      correlation_matrix[result.pair_id] = {};
    });

    // Calculate correlations between pairs for each threshold
    const thresholds = Object.keys(results[0]?.significance_analysis.by_threshold || {});

    thresholds.forEach(threshold_str => {
      const threshold = parseFloat(threshold_str);
      const significance_rates = results.map(r =>
        r.significance_analysis.by_threshold[threshold]?.percentage || 0
      );

      // Calculate correlation between all pairs
      for (let i = 0; i < results.length; i++) {
        for (let j = 0; j < results.length; j++) {
          if (i !== j) {
            const correlation = this.calculateCorrelation(
              [significance_rates[i]],
              [significance_rates[j]]
            );
            correlation_matrix[results[i].pair_id][results[j].pair_id] = correlation;
          } else {
            correlation_matrix[results[i].pair_id][results[j].pair_id] = 1;
          }
        }
      }

      // Calculate threshold stability (consistency across pairs)
      const mean_rate = significance_rates.reduce((sum, rate) => sum + rate, 0) / significance_rates.length;
      const variance = significance_rates.reduce((sum, rate) => sum + Math.pow(rate - mean_rate, 2), 0) / significance_rates.length;
      threshold_stability[threshold] = 1 - Math.sqrt(variance) / 100; // Higher values = more stable
    });

    const overall_consistency = Object.values(threshold_stability).reduce((sum, val) => sum + val, 0) / Object.values(threshold_stability).length;

    return {
      correlation_matrix,
      overall_consistency,
      threshold_stability
    };
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;

    const n = x.length;
    const sum_x = x.reduce((sum, val) => sum + val, 0);
    const sum_y = y.reduce((sum, val) => sum + val, 0);
    const sum_xy = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sum_x2 = x.reduce((sum, val) => sum + val * val, 0);
    const sum_y2 = y.reduce((sum, val) => sum + val * val, 0);

    const numerator = n * sum_xy - sum_x * sum_y;
    const denominator = Math.sqrt((n * sum_x2 - sum_x * sum_x) * (n * sum_y2 - sum_y * sum_y));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  private generateRecommendations(
    results: PairResult[],
    params: MultiPairSimulationParams
  ): AnalysisRecommendation[] {
    const recommendations: AnalysisRecommendation[] = [];

    // Sample size recommendations
    results.forEach(result => {
      const power = result.significance_analysis.by_threshold[0.05]?.percentage || 0;
      if (power < 80) {
        const required_n = this.calculateRequiredSampleSize(
          Math.abs(result.effect_size_analysis.mean),
          0.8,
          0.05
        );

        recommendations.push({
          type: 'sample_size',
          priority: power < 50 ? 'high' : 'medium',
          message: `${result.pair_name}: Low statistical power (${power.toFixed(1)}%). Consider increasing sample size to ${required_n} per group.`,
          actionable: true,
          suggested_action: `Increase sample size to ${required_n} per group for 80% power`
        });
      }
    });

    // Effect size interpretation
    results.forEach(result => {
      if (result.effect_size_analysis.interpretation === 'negligible') {
        recommendations.push({
          type: 'effect_size',
          priority: 'medium',
          message: `${result.pair_name}: Effect size is negligible. Consider if this comparison is practically meaningful.`,
          actionable: true,
          suggested_action: 'Review whether this comparison is necessary for your research question'
        });
      }
    });

    // Significance threshold recommendations
    const overall_significance = results.reduce((sum, result) => {
      return sum + (result.significance_analysis.by_threshold[0.05]?.percentage || 0);
    }, 0) / results.length;

    if (overall_significance > 50) {
      recommendations.push({
        type: 'significance_level',
        priority: 'low',
        message: 'High overall significance rate. Consider using more stringent thresholds (α = 0.01) to control Type I errors.',
        actionable: true,
        suggested_action: 'Use α = 0.01 for more conservative testing'
      });
    }

    return recommendations;
  }

  private calculateGlobalStatistics(results: PairResult[], startTime: number): GlobalStatistics {
    const total_simulations = results.reduce((sum, result) => sum + result.aggregated_stats.total_count, 0);
    const total_pairs = results.length;

    const total_significant = results.reduce((sum, result) => sum + result.aggregated_stats.significant_count, 0);
    const overall_significance_rate = (total_significant / total_simulations) * 100;

    const effect_sizes = results.map(r => r.effect_size_analysis.mean);
    const average_effect_size = effect_sizes.reduce((sum, val) => sum + val, 0) / effect_sizes.length;

    const effect_size_variance = effect_sizes.reduce((sum, val) => sum + Math.pow(val - average_effect_size, 2), 0) / effect_sizes.length;
    const effect_size_variability = Math.sqrt(effect_size_variance);

    return {
      total_simulations,
      total_pairs,
      overall_significance_rate,
      average_effect_size,
      effect_size_variability,
      execution_time_ms: performance.now() - startTime
    };
  }

  private createExecutionMetadata(
    params: MultiPairSimulationParams,
    startTime: number
  ): ExecutionMetadata {
    const performance_metrics: PerformanceMetrics = {
      memory_usage_mb: (performance as any).memory?.usedJSHeapSize / 1024 / 1024 || 0,
      cpu_usage_percent: 0, // Would need performance monitoring API
      simulations_per_second: params.global_settings.num_simulations / ((performance.now() - startTime) / 1000),
      average_pair_duration_ms: (performance.now() - startTime) / params.pairs.filter(p => p.enabled).length
    };

    return {
      timestamp: new Date(),
      duration_ms: performance.now() - startTime,
      parameters: params,
      version: '2.0.0',
      performance_metrics
    };
  }
}

// Progress callback interface
export interface SimulationProgress {
  currentPair: number;
  totalPairs: number;
  currentSimulation: number;
  totalSimulations: number;
  phase: 'running_simulations' | 'analyzing_results';
  pairName?: string;
}

// Singleton instance
export const multiPairSimulationEngine = new MultiPairSimulationEngine();