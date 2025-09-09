use rand::Rng;
use rand_distr::{Distribution, Normal};
use serde::{Deserialize, Serialize};
use statrs::distribution::{StudentsT, ContinuousCDF};
use std::f64::consts::LN_2;

#[derive(Debug, Serialize, Deserialize)]
pub struct SimulationParams {
    pub group1_mean: f64,
    pub group1_std: f64,
    pub group2_mean: f64,
    pub group2_std: f64,
    pub sample_size_per_group: usize,
    pub num_simulations: usize,
    pub hypothesized_effect_size: f64,
    pub alpha_level: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SimulationResult {
    pub p_value: f64,
    pub effect_size: f64,
    pub confidence_interval: (f64, f64),
    pub s_value: f64,
    pub significant: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AggregatedResults {
    pub individual_results: Vec<SimulationResult>,
    pub p_value_histogram: Vec<HistogramBin>,
    pub significant_count: usize,
    pub total_count: usize,
    pub mean_effect_size: f64,
    pub effect_size_ci: (f64, f64),
    pub ci_coverage: f64,
    pub mean_ci_width: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HistogramBin {
    pub bin_start: f64,
    pub bin_end: f64,
    pub count: usize,
    pub significant: bool,
}

/// Generate random samples for two groups
pub fn generate_samples(
    group1_mean: f64,
    group1_std: f64,
    group2_mean: f64,
    group2_std: f64,
    n: usize,
) -> Result<(Vec<f64>, Vec<f64>), String> {
    if group1_std <= 0.0 || group2_std <= 0.0 {
        return Err("Standard deviations must be positive".to_string());
    }
    if n == 0 {
        return Err("Sample size must be positive".to_string());
    }

    let mut rng = rand::thread_rng();
    
    let normal1 = Normal::new(group1_mean, group1_std)
        .map_err(|e| format!("Error creating normal distribution for group 1: {}", e))?;
    let normal2 = Normal::new(group2_mean, group2_std)
        .map_err(|e| format!("Error creating normal distribution for group 2: {}", e))?;

    let group1: Vec<f64> = (0..n).map(|_| normal1.sample(&mut rng)).collect();
    let group2: Vec<f64> = (0..n).map(|_| normal2.sample(&mut rng)).collect();

    Ok((group1, group2))
}

/// Perform two-sample t-test (assuming equal variances)
pub fn t_test(group1: &[f64], group2: &[f64]) -> Result<(f64, f64, f64), String> {
    if group1.is_empty() || group2.is_empty() {
        return Err("Groups cannot be empty".to_string());
    }

    let n1 = group1.len() as f64;
    let n2 = group2.len() as f64;
    
    // Calculate means
    let mean1 = group1.iter().sum::<f64>() / n1;
    let mean2 = group2.iter().sum::<f64>() / n2;
    
    // Calculate variances
    let var1 = group1.iter().map(|x| (x - mean1).powi(2)).sum::<f64>() / (n1 - 1.0);
    let var2 = group2.iter().map(|x| (x - mean2).powi(2)).sum::<f64>() / (n2 - 1.0);
    
    // Pooled standard error
    let pooled_se = ((var1 / n1) + (var2 / n2)).sqrt();
    
    if pooled_se == 0.0 {
        return Err("Pooled standard error is zero".to_string());
    }
    
    // t-statistic
    let t_stat = (mean1 - mean2) / pooled_se;
    
    // Degrees of freedom (Welch's formula for unequal variances, simplified for equal n)
    let df = n1 + n2 - 2.0;
    
    // Calculate p-value (two-tailed)
    let t_dist = StudentsT::new(0.0, 1.0, df)
        .map_err(|e| format!("Error creating t-distribution: {}", e))?;
    let p_value = 2.0 * (1.0 - t_dist.cdf(t_stat.abs()));
    
    // Effect size (Cohen's d)
    let pooled_std = ((var1 + var2) / 2.0).sqrt();
    let effect_size = (mean1 - mean2) / pooled_std;
    
    Ok((t_stat, p_value, effect_size))
}

/// Calculate confidence interval for effect size
pub fn calculate_confidence_interval(
    effect_size: f64,
    n1: usize,
    n2: usize,
    confidence_level: f64,
) -> Result<(f64, f64), String> {
    if confidence_level <= 0.0 || confidence_level >= 1.0 {
        return Err("Confidence level must be between 0 and 1".to_string());
    }
    
    let df = (n1 + n2 - 2) as f64;
    let alpha = 1.0 - confidence_level;
    
    // Standard error of effect size (approximate)
    let n1_f = n1 as f64;
    let n2_f = n2 as f64;
    let se = ((n1_f + n2_f) / (n1_f * n2_f) + (effect_size.powi(2) / (2.0 * (n1_f + n2_f)))).sqrt();
    
    // t-critical value
    let t_dist = StudentsT::new(0.0, 1.0, df)
        .map_err(|e| format!("Error creating t-distribution: {}", e))?;
    let t_crit = t_dist.inverse_cdf(1.0 - alpha / 2.0);
    
    let margin_of_error = t_crit * se;
    let ci_lower = effect_size - margin_of_error;
    let ci_upper = effect_size + margin_of_error;
    
    Ok((ci_lower, ci_upper))
}

/// Calculate S-value (Shannon information against null hypothesis)
pub fn calculate_s_value(p_value: f64) -> f64 {
    if p_value <= 0.0 {
        return f64::INFINITY;
    }
    if p_value >= 1.0 {
        return 0.0;
    }
    -p_value.log2()
}

/// Create histogram bins for p-values
pub fn create_p_value_histogram(p_values: &[f64], alpha: f64, num_bins: usize) -> Vec<HistogramBin> {
    let mut histogram = Vec::new();
    let bin_width = 1.0 / num_bins as f64;
    
    for i in 0..num_bins {
        let bin_start = i as f64 * bin_width;
        let bin_end = (i + 1) as f64 * bin_width;
        let count = p_values.iter()
            .filter(|&&p| p >= bin_start && p < bin_end)
            .count();
        
        // Special handling for the last bin to include 1.0
        let count = if i == num_bins - 1 {
            p_values.iter()
                .filter(|&&p| p >= bin_start && p <= bin_end)
                .count()
        } else {
            count
        };
        
        let significant = bin_end <= alpha;
        
        histogram.push(HistogramBin {
            bin_start,
            bin_end,
            count,
            significant,
        });
    }
    
    histogram
}

/// Run complete simulation
pub fn run_simulation(params: SimulationParams) -> Result<AggregatedResults, String> {
    // Validate parameters
    if params.group1_std <= 0.0 || params.group2_std <= 0.0 {
        return Err("Standard deviations must be positive".to_string());
    }
    if params.sample_size_per_group == 0 {
        return Err("Sample size must be positive".to_string());
    }
    if params.num_simulations == 0 {
        return Err("Number of simulations must be positive".to_string());
    }
    if params.alpha_level <= 0.0 || params.alpha_level >= 1.0 {
        return Err("Alpha level must be between 0 and 1".to_string());
    }

    let mut results = Vec::new();
    let mut p_values = Vec::new();
    let mut effect_sizes = Vec::new();
    let mut ci_widths = Vec::new();
    let mut coverage_count = 0;
    
    // True effect size for coverage calculation
    let true_effect_size = (params.group1_mean - params.group2_mean) / 
        ((params.group1_std.powi(2) + params.group2_std.powi(2)) / 2.0).sqrt();

    for _ in 0..params.num_simulations {
        // Generate samples
        let (group1, group2) = generate_samples(
            params.group1_mean,
            params.group1_std,
            params.group2_mean,
            params.group2_std,
            params.sample_size_per_group,
        )?;

        // Perform t-test
        let (_, p_value, effect_size) = t_test(&group1, &group2)?;

        // Calculate confidence interval
        let confidence_interval = calculate_confidence_interval(
            effect_size,
            params.sample_size_per_group,
            params.sample_size_per_group,
            0.95, // 95% CI
        )?;

        // Calculate S-value
        let s_value = calculate_s_value(p_value);

        // Check significance
        let significant = p_value < params.alpha_level;

        // Check CI coverage of true effect
        if true_effect_size >= confidence_interval.0 && true_effect_size <= confidence_interval.1 {
            coverage_count += 1;
        }

        let ci_width = confidence_interval.1 - confidence_interval.0;
        ci_widths.push(ci_width);

        results.push(SimulationResult {
            p_value,
            effect_size,
            confidence_interval,
            s_value,
            significant,
        });

        p_values.push(p_value);
        effect_sizes.push(effect_size);
    }

    // Calculate aggregated statistics
    let significant_count = results.iter().filter(|r| r.significant).count();
    let mean_effect_size = effect_sizes.iter().sum::<f64>() / effect_sizes.len() as f64;
    let mean_ci_width = ci_widths.iter().sum::<f64>() / ci_widths.len() as f64;
    let ci_coverage = coverage_count as f64 / params.num_simulations as f64;

    // Calculate overall effect size CI (using all simulated effect sizes)
    effect_sizes.sort_by(|a, b| a.partial_cmp(b).unwrap());
    let lower_idx = (0.025 * effect_sizes.len() as f64) as usize;
    let upper_idx = (0.975 * effect_sizes.len() as f64) as usize;
    let effect_size_ci = (
        effect_sizes[lower_idx],
        effect_sizes[upper_idx.min(effect_sizes.len() - 1)],
    );

    // Create histogram
    let p_value_histogram = create_p_value_histogram(&p_values, params.alpha_level, 20);

    Ok(AggregatedResults {
        individual_results: results,
        p_value_histogram,
        significant_count,
        total_count: params.num_simulations,
        mean_effect_size,
        effect_size_ci,
        ci_coverage,
        mean_ci_width,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_samples() {
        let (group1, group2) = generate_samples(0.0, 1.0, 1.0, 1.0, 100).unwrap();
        assert_eq!(group1.len(), 100);
        assert_eq!(group2.len(), 100);
    }

    #[test]
    fn test_t_test() {
        let group1 = vec![1.0, 2.0, 3.0, 4.0, 5.0];
        let group2 = vec![2.0, 3.0, 4.0, 5.0, 6.0];
        let (_t_stat, p_value, _effect_size) = t_test(&group1, &group2).unwrap();
        assert!(p_value > 0.0);
        assert!(p_value < 1.0);
    }

    #[test]
    fn test_s_value() {
        assert_eq!(calculate_s_value(0.5), 1.0);
        assert_eq!(calculate_s_value(0.25), 2.0);
        assert_eq!(calculate_s_value(0.05), -0.05_f64.log2());
    }
}

/// Export simulation results to CSV format
pub fn export_to_csv(results: &AggregatedResults) -> Result<String, String> {
    let mut csv_content = String::new();
    
    // CSV header
    csv_content.push_str("simulation_id,p_value,effect_size,ci_lower,ci_upper,s_value,significant\n");
    
    // Add each simulation result
    for (index, result) in results.individual_results.iter().enumerate() {
        csv_content.push_str(&format!(
            "{},{},{},{},{},{},{}\n",
            index + 1,
            result.p_value,
            result.effect_size,
            result.confidence_interval.0,
            result.confidence_interval.1,
            result.s_value,
            result.significant
        ));
    }
    
    Ok(csv_content)
}