// Statistical Simulation Web Worker
// Handles heavy computations without blocking the main UI thread

import * as jStat from 'jstat';

// Worker message types
export interface WorkerMessage {
  type: 'RUN_SIMULATION' | 'CALCULATE_POWER' | 'TRANSFORM_DATA' | 'INITIALIZE';
  payload: any;
  messageId?: string;
}

export interface WorkerResponse {
  type: 'SUCCESS' | 'ERROR' | 'PROGRESS';
  result?: any;
  error?: string;
  messageId?: string;
  progress?: {
    completed: number;
    total: number;
    currentPair?: string;
  };
}

// Statistical utility functions (same as in main thread)
class WorkerStatisticalUtils {
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
}

// Simulation runner class for worker
class WorkerSimulationRunner {
  static async runSimulation(params: {
    group1_mean: number;
    group1_std: number;
    group2_mean: number;
    group2_std: number;
    sample_size_per_group: number;
    num_simulations: number;
    alpha_level: number;
  }, onProgress?: (completed: number, total: number) => void): Promise<any> {
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
        () => WorkerStatisticalUtils.normalRandom(group1_mean, group1_std));
      const group2 = Array.from({length: sample_size_per_group},
        () => WorkerStatisticalUtils.normalRandom(group2_mean, group2_std));

      // Perform proper t-test using jStat
      const test_result = WorkerStatisticalUtils.twoSampleTTest(group1, group2);

      // Calculate S-value
      const s_value = WorkerStatisticalUtils.calculateSValue(test_result.p_value);

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

      // Report progress
      if (onProgress && (i + 1) % 100 === 0) {
        onProgress(i + 1, num_simulations);
      }

      // Yield control occasionally to prevent blocking
      if (i % 1000 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    // Calculate aggregated statistics using jStat
    const significant_count = results.filter(r => r.significant).length;
    const mean_effect_size = (jStat as any).mean(effect_sizes);
    const mean_ci_width = this.calculateMeanCIWidth(confidence_intervals);
    const ci_coverage = this.calculateCICoverage(true_effect_size, confidence_intervals);

    // Calculate effect size CI using jStat
    const sorted_effect_sizes = [...effect_sizes].sort((a, b) => a - b);
    const lower_idx = Math.floor(0.025 * sorted_effect_sizes.length);
    const upper_idx = Math.floor(0.975 * sorted_effect_sizes.length);
    const effect_size_ci: [number, number] = [
      sorted_effect_sizes[lower_idx],
      sorted_effect_sizes[Math.min(upper_idx, sorted_effect_sizes.length - 1)]
    ];

    return {
      individual_results: results,
      significant_count,
      total_count: num_simulations,
      mean_effect_size,
      effect_size_ci,
      ci_coverage,
      mean_ci_width
    };
  }

  private static calculateCICoverage(
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

  private static calculateMeanCIWidth(confidence_intervals: Array<[number, number]>): number {
    const widths = confidence_intervals.map(([lower, upper]) => upper - lower);
    return (jStat as any).mean(widths);
  }
}

// Message handler
self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type, payload, messageId } = e.data;

  try {
    let result: any;

    switch (type) {
      case 'INITIALIZE':
        // Initialize worker
        result = { status: 'initialized', version: '1.0.0' };
        break;

      case 'RUN_SIMULATION':
        result = await WorkerSimulationRunner.runSimulation(payload, (completed, total) => {
          // Send progress updates
          self.postMessage({
            type: 'PROGRESS',
            progress: { completed, total },
            messageId
          } as WorkerResponse);
        });
        break;

      case 'CALCULATE_POWER':
        // Calculate statistical power
        result = { power: 0.8, message: 'Power calculation not yet implemented' };
        break;

      case 'TRANSFORM_DATA':
        // Transform chart data
        result = { transformed: true, message: 'Data transformation not yet implemented' };
        break;

      default:
        throw new Error(`Unknown message type: ${type}`);
    }

    // Send success response
    self.postMessage({
      type: 'SUCCESS',
      result,
      messageId
    } as WorkerResponse);

  } catch (error) {
    // Send error response
    self.postMessage({
      type: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      messageId
    } as WorkerResponse);
  }
};

// Export for type checking (not actually used in worker)
export {};