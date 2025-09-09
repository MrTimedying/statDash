// JavaScript implementation of statistical simulation engine
// Fallback for when Tauri/Rust backend is not available

interface SimulationParams {
  group1_mean: number;
  group1_std: number;
  group2_mean: number;
  group2_std: number;
  sample_size_per_group: number;
  num_simulations: number;
  hypothesized_effect_size: number;
  alpha_level: number;
}

interface SimulationResult {
  p_value: number;
  effect_size: number;
  confidence_interval: [number, number];
  s_value: number;
  significant: boolean;
}

interface AggregatedResults {
  individual_results: SimulationResult[];
  p_value_histogram: HistogramBin[];
  significant_count: number;
  total_count: number;
  mean_effect_size: number;
  effect_size_ci: [number, number];
  ci_coverage: number;
  mean_ci_width: number;
}

interface HistogramBin {
  bin_start: number;
  bin_end: number;
  count: number;
  significant: boolean;
}

// Box-Muller transform for normal random number generation
function normalRandom(mean: number = 0, std: number = 1): number {
  let u = 0, v = 0;
  while(u === 0) u = Math.random(); // Converting [0,1) to (0,1)
  while(v === 0) v = Math.random();
  
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * std + mean;
}

// Generate random samples for two groups
function generateSamples(
  group1_mean: number,
  group1_std: number,
  group2_mean: number,
  group2_std: number,
  n: number
): { group1: number[], group2: number[] } {
  if (group1_std <= 0 || group2_std <= 0) {
    throw new Error("Standard deviations must be positive");
  }
  if (n <= 0) {
    throw new Error("Sample size must be positive");
  }

  const group1: number[] = [];
  const group2: number[] = [];
  
  for (let i = 0; i < n; i++) {
    group1.push(normalRandom(group1_mean, group1_std));
    group2.push(normalRandom(group2_mean, group2_std));
  }
  
  return { group1, group2 };
}

// Two-sample t-test implementation
function tTest(group1: number[], group2: number[]): { t_stat: number, p_value: number, effect_size: number } {
  if (group1.length === 0 || group2.length === 0) {
    throw new Error("Groups cannot be empty");
  }

  const n1 = group1.length;
  const n2 = group2.length;
  
  // Calculate means
  const mean1 = group1.reduce((sum, x) => sum + x, 0) / n1;
  const mean2 = group2.reduce((sum, x) => sum + x, 0) / n2;
  
  // Calculate variances
  const var1 = group1.reduce((sum, x) => sum + Math.pow(x - mean1, 2), 0) / (n1 - 1);
  const var2 = group2.reduce((sum, x) => sum + Math.pow(x - mean2, 2), 0) / (n2 - 1);
  
  // Pooled standard error
  const pooled_se = Math.sqrt((var1 / n1) + (var2 / n2));
  
  if (pooled_se === 0) {
    throw new Error("Pooled standard error is zero");
  }
  
  // t-statistic
  const t_stat = (mean1 - mean2) / pooled_se;
  
  // Degrees of freedom
  const df = n1 + n2 - 2;
  
  // Calculate p-value using approximation for t-distribution
  const p_value = 2 * (1 - tCDF(Math.abs(t_stat), df));
  
  // Effect size (Cohen's d)
  const pooled_std = Math.sqrt((var1 + var2) / 2);
  const effect_size = (mean1 - mean2) / pooled_std;
  
  return { t_stat, p_value, effect_size };
}

// Approximation of t-distribution CDF using normal approximation for large df
function tCDF(t: number, df: number): number {
  if (df > 30) {
    // For large degrees of freedom, t-distribution approaches normal
    return normalCDF(t);
  }
  
  // Simple approximation for smaller df
  const correction = 1 + (t * t) / (4 * df);
  return normalCDF(t / Math.sqrt(correction));
}

// Standard normal CDF approximation
function normalCDF(x: number): number {
  return 0.5 * (1 + erf(x / Math.sqrt(2)));
}

// Error function approximation
function erf(x: number): number {
  // Abramowitz and Stegun approximation
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}

// Calculate confidence interval for effect size
function calculateConfidenceInterval(
  effect_size: number,
  n1: number,
  n2: number,
  confidence_level: number = 0.95
): [number, number] {
  if (confidence_level <= 0 || confidence_level >= 1) {
    throw new Error("Confidence level must be between 0 and 1");
  }
  
  const df = n1 + n2 - 2;
  const alpha = 1 - confidence_level;
  
  // Standard error of effect size (approximate)
  const se = Math.sqrt((n1 + n2) / (n1 * n2) + (effect_size * effect_size) / (2 * (n1 + n2)));
  
  // t-critical value (approximation)
  const t_crit = tInverseCDF(1 - alpha / 2, df);
  
  const margin_of_error = t_crit * se;
  const ci_lower = effect_size - margin_of_error;
  const ci_upper = effect_size + margin_of_error;
  
  return [ci_lower, ci_upper];
}

// Inverse t-distribution (approximation)
function tInverseCDF(p: number, df: number): number {
  if (df > 30) {
    return normalInverseCDF(p);
  }
  
  // Simple approximation
  const z = normalInverseCDF(p);
  const correction = 1 + (z * z) / (4 * df);
  return z * Math.sqrt(correction);
}

// Inverse normal CDF approximation
function normalInverseCDF(p: number): number {
  if (p <= 0 || p >= 1) {
    throw new Error("Probability must be between 0 and 1");
  }
  
  // Beasley-Springer-Moro algorithm approximation
  if (p < 0.5) {
    return -normalInverseCDF(1 - p);
  }
  
  const c0 = 2.515517;
  const c1 = 0.802853;
  const c2 = 0.010328;
  const d1 = 1.432788;
  const d2 = 0.189269;
  const d3 = 0.001308;
  
  const t = Math.sqrt(-2 * Math.log(1 - p));
  
  return t - ((c2 * t + c1) * t + c0) / (((d3 * t + d2) * t + d1) * t + 1);
}

// Calculate S-value (Shannon information against null hypothesis)
function calculateSValue(p_value: number): number {
  if (p_value <= 0) {
    return Infinity;
  }
  if (p_value >= 1) {
    return 0;
  }
  return -Math.log2(p_value);
}

// Create histogram bins for p-values
function createPValueHistogram(p_values: number[], alpha: number, num_bins: number = 20): HistogramBin[] {
  const histogram: HistogramBin[] = [];
  const bin_width = 1.0 / num_bins;
  
  for (let i = 0; i < num_bins; i++) {
    const bin_start = i * bin_width;
    const bin_end = (i + 1) * bin_width;
    
    let count = 0;
    for (const p of p_values) {
      if (i === num_bins - 1) {
        // Last bin includes 1.0
        if (p >= bin_start && p <= bin_end) count++;
      } else {
        if (p >= bin_start && p < bin_end) count++;
      }
    }
    
    const significant = bin_end <= alpha;
    
    histogram.push({
      bin_start,
      bin_end,
      count,
      significant,
    });
  }
  
  return histogram;
}

// Main simulation function
export async function runStatisticalSimulation(params: SimulationParams): Promise<AggregatedResults> {
  // Validate parameters
  if (params.group1_std <= 0 || params.group2_std <= 0) {
    throw new Error("Standard deviations must be positive");
  }
  if (params.sample_size_per_group <= 0) {
    throw new Error("Sample size must be positive");
  }
  if (params.num_simulations <= 0) {
    throw new Error("Number of simulations must be positive");
  }
  if (params.alpha_level <= 0 || params.alpha_level >= 1) {
    throw new Error("Alpha level must be between 0 and 1");
  }

  const results: SimulationResult[] = [];
  const p_values: number[] = [];
  const effect_sizes: number[] = [];
  const ci_widths: number[] = [];
  let coverage_count = 0;
  
  // True effect size for coverage calculation
  const true_effect_size = (params.group1_mean - params.group2_mean) / 
    Math.sqrt((params.group1_std ** 2 + params.group2_std ** 2) / 2);

  for (let i = 0; i < params.num_simulations; i++) {
    // Generate samples
    const { group1, group2 } = generateSamples(
      params.group1_mean,
      params.group1_std,
      params.group2_mean,
      params.group2_std,
      params.sample_size_per_group
    );

    // Perform t-test
    const { p_value, effect_size } = tTest(group1, group2);

    // Calculate confidence interval
    const confidence_interval = calculateConfidenceInterval(
      effect_size,
      params.sample_size_per_group,
      params.sample_size_per_group,
      0.95
    );

    // Calculate S-value
    const s_value = calculateSValue(p_value);

    // Check significance
    const significant = p_value < params.alpha_level;

    // Check CI coverage of true effect
    if (true_effect_size >= confidence_interval[0] && true_effect_size <= confidence_interval[1]) {
      coverage_count++;
    }

    const ci_width = confidence_interval[1] - confidence_interval[0];
    ci_widths.push(ci_width);

    results.push({
      p_value,
      effect_size,
      confidence_interval,
      s_value,
      significant,
    });

    p_values.push(p_value);
    effect_sizes.push(effect_size);

    // Yield control occasionally to prevent UI blocking
    if (i % 100 === 0 && i > 0) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  // Calculate aggregated statistics
  const significant_count = results.filter(r => r.significant).length;
  const mean_effect_size = effect_sizes.reduce((sum, val) => sum + val, 0) / effect_sizes.length;
  const mean_ci_width = ci_widths.reduce((sum, val) => sum + val, 0) / ci_widths.length;
  const ci_coverage = coverage_count / params.num_simulations;

  // Calculate overall effect size CI (using all simulated effect sizes)
  const sorted_effect_sizes = [...effect_sizes].sort((a, b) => a - b);
  const lower_idx = Math.floor(0.025 * sorted_effect_sizes.length);
  const upper_idx = Math.floor(0.975 * sorted_effect_sizes.length);
  const effect_size_ci: [number, number] = [
    sorted_effect_sizes[lower_idx],
    sorted_effect_sizes[Math.min(upper_idx, sorted_effect_sizes.length - 1)],
  ];

  // Create histogram
  const p_value_histogram = createPValueHistogram(p_values, params.alpha_level, 20);

  return {
    individual_results: results,
    p_value_histogram,
    significant_count,
    total_count: params.num_simulations,
    mean_effect_size,
    effect_size_ci,
    ci_coverage,
    mean_ci_width,
  };
}