// Enhanced simulation types for multi-pair support

export interface SamplePair {
  id: string;
  name: string;
  description?: string;
  group1: PopulationParams;
  group2: PopulationParams;
  sample_size_per_group: number;
  enabled: boolean;
  color_scheme?: string;
}

export interface PopulationParams {
  mean: number;
  std: number;
  distribution_type?: 'normal' | 'uniform' | 'exponential';
}

export interface MultiPairSimulationParams {
  pairs: SamplePair[];
  global_settings: GlobalSimulationSettings;
  ui_preferences: UIPreferences;
}

export interface GlobalSimulationSettings {
  num_simulations: number;
  significance_levels: number[];
  confidence_level: number;
  random_seed?: number;
  test_type: 'welch' | 'pooled' | 'mann_whitney';
}

export interface UIPreferences {
  theme: 'light' | 'dark' | 'auto';
  decimal_places: number;
  chart_animations: boolean;
  color_blind_safe: boolean;
}

// Session management for persistence
export interface SimulationSession {
  id: string;
  name: string;
  description?: string;
  parameters: MultiPairSimulationParams;
  results: MultiPairResults | null;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
}

// Enhanced results structure
export interface MultiPairResults {
  pairs_results: PairResult[];
  cross_pair_analysis: CrossPairAnalysis;
  global_statistics: GlobalStatistics;
  execution_metadata: ExecutionMetadata;
}

export interface PairResult {
  pair_id: string;
  pair_name: string;
  individual_results: SimulationResult[];
  aggregated_stats: AggregatedStats;
  significance_analysis: SignificanceAnalysis;
  effect_size_analysis: EffectSizeAnalysis;
}

export interface CrossPairAnalysis {
  effect_size_comparison: EffectSizeComparison[];
  power_analysis: PowerAnalysis[];
  significance_correlation: SignificanceCorrelation;
  recommendations: AnalysisRecommendation[];
}

export interface SignificanceAnalysis {
  by_threshold: Record<number, SignificanceResult>;
  threshold_sensitivity: ThresholdSensitivity;
}

export interface SignificanceResult {
  threshold: number;
  significant_count: number;
  percentage: number;
  confidence_interval: [number, number];
}

export interface EffectSizeComparison {
  pair1_id: string;
  pair2_id: string;
  effect_size_difference: number;
  statistical_significance: boolean;
  practical_significance: 'negligible' | 'small' | 'medium' | 'large';
}

export interface PowerAnalysis {
  pair_id: string;
  statistical_power: number;
  required_sample_size: number;
  effect_size: number;
  confidence_level: number;
}

export interface SignificanceCorrelation {
  correlation_matrix: Record<string, Record<string, number>>;
  overall_consistency: number;
  threshold_stability: Record<number, number>;
}

export interface AnalysisRecommendation {
  type: 'sample_size' | 'significance_level' | 'effect_size' | 'methodology';
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  actionable: boolean;
  suggested_action?: string;
}

export interface GlobalStatistics {
  total_simulations: number;
  total_pairs: number;
  overall_significance_rate: number;
  average_effect_size: number;
  effect_size_variability: number;
  execution_time_ms: number;
}

export interface ExecutionMetadata {
  timestamp: Date;
  duration_ms: number;
  parameters: MultiPairSimulationParams;
  version: string;
  performance_metrics: PerformanceMetrics;
}

export interface PerformanceMetrics {
  memory_usage_mb: number;
  cpu_usage_percent: number;
  simulations_per_second: number;
  average_pair_duration_ms: number;
}

// Legacy types for backward compatibility
export interface SimulationParams {
  group1_mean: number;
  group1_std: number;
  group2_mean: number;
  group2_std: number;
  sample_size_per_group: number;
  num_simulations: number;
  hypothesized_effect_size: number;
  alpha_level: number;
}

export interface SimulationResult {
  p_value: number;
  effect_size: number;
  confidence_interval: [number, number];
  s_value: number;
  significant: boolean;
}

export interface AggregatedResults {
  individual_results: SimulationResult[];
  p_value_histogram: HistogramBin[];
  significant_count: number;
  total_count: number;
  mean_effect_size: number;
  effect_size_ci: [number, number];
  ci_coverage: number;
  mean_ci_width: number;
}

export interface HistogramBin {
  bin_start: number;
  bin_end: number;
  count: number;
  significant: boolean;
}

export interface AggregatedStats {
  significant_count: number;
  total_count: number;
  mean_effect_size: number;
  effect_size_ci: [number, number];
  ci_coverage: number;
  mean_ci_width: number;
  p_value_histogram: HistogramBin[];
}

export interface EffectSizeAnalysis {
  mean: number;
  median: number;
  standard_deviation: number;
  confidence_interval: [number, number];
  interpretation: 'negligible' | 'small' | 'medium' | 'large';
  practical_significance: string;
}

export interface ThresholdSensitivity {
  optimal_threshold: number;
  sensitivity_curve: Array<{ threshold: number; sensitivity: number }>;
  type1_error_rate: number;
  type2_error_rate: number;
}

// Utility types
export type ThemeType = 'light' | 'dark' | 'auto';
export type EffectSizeCategory = 'negligible' | 'small' | 'medium' | 'large';
export type SignificanceLevel = 0.001 | 0.01 | 0.05 | 0.10;
export type TestType = 'welch' | 'pooled' | 'mann_whitney';
// Simulation Studies - Enhanced analytical units
export interface SimulationStudy {
  id: string;
  name: string;
  description?: string;
  pairs: SamplePair[];
  parameters: StudyParameters;
  results?: StudyResults;
  metadata: StudyMetadata;
  status: StudyStatus;
  created_at: Date;
  updated_at: Date;
}

export interface StudyParameters {
  global_settings: GlobalSimulationSettings;
  ui_preferences: UIPreferences;
  analysis_settings: AnalysisSettings;
}

export interface AnalysisSettings {
  effect_size_thresholds: EffectSizeThresholds;
  power_analysis_settings: PowerAnalysisSettings;
  reporting_preferences: ReportingPreferences;
}

export interface EffectSizeThresholds {
  negligible: number;
  small: number;
  medium: number;
  large: number;
}

export interface PowerAnalysisSettings {
  target_power: number;
  alpha_levels: number[];
  alternative: 'two-sided' | 'one-sided';
}

export interface ReportingPreferences {
  decimal_places: number;
  include_confidence_intervals: boolean;
  include_effect_sizes: boolean;
  export_formats: string[];
  chart_animations: boolean;
  color_blind_safe: boolean;
  theme: 'light' | 'dark' | 'auto';
}

export interface StudyResults {
  execution_id: string;
  multi_pair_results: MultiPairResults;
  study_insights: StudyInsights;
  parameter_history: ParameterChange[];
  execution_timestamp: Date;
}

export interface StudyInsights {
  key_findings: string[];
  recommendations: AnalysisRecommendation[];
  statistical_summary: StatisticalSummary;
  data_quality_metrics: DataQualityMetrics;
}

export interface StatisticalSummary {
  total_pairs_analyzed: number;
  overall_power: number;
  effect_size_distribution: EffectSizeDistribution;
  significance_patterns: SignificancePatterns;
}

export interface EffectSizeDistribution {
  mean: number;
  median: number;
  range: [number, number];
  categories: Record<EffectSizeCategory, number>;
}

export interface SignificancePatterns {
  consistent_threshold: number;
  variability_across_pairs: number;
  power_curve: Array<{ sample_size: number; power: number }>;
}

export interface DataQualityMetrics {
  normality_tests: Record<string, boolean>;
  variance_homogeneity: boolean;
  sample_size_adequacy: boolean;
  effect_size_reliability: number;
}

export interface ParameterChange {
  timestamp: Date;
  parameter_type: 'pair' | 'global_setting' | 'analysis_setting';
  parameter_name: string;
  old_value: any;
  new_value: any;
  reason?: string;
}

export interface StudyMetadata {
  version: string;
  author?: string;
  tags: string[];
  notes: string[];
  parent_study_id?: string; // For study branching
  study_template?: string;
}

export interface StudyTemplate {
  id: string;
  name: string;
  description: string;
  category: StudyCategory;
  default_parameters: StudyParameters;
  use_cases: string[];
}

export type StudyStatus = 'draft' | 'configuring' | 'running' | 'completed' | 'archived' | 'error';
export type StudyCategory = 'exploratory' | 'confirmatory' | 'comparative' | 'methodological' | 'educational';

// Study management types
export interface StudyCollection {
  id: string;
  name: string;
  description?: string;
  studies: SimulationStudy[];
  created_at: Date;
  updated_at: Date;
}

export interface StudyComparison {
  id: string;
  name: string;
  study_ids: string[];
  comparison_type: 'parameter_sensitivity' | 'method_comparison' | 'power_analysis';
  results: ComparisonResults;
}

export interface ComparisonResults {
  parameter_differences: ParameterDifference[];
  result_differences: ResultDifference[];
  insights: string[];
}

export interface ParameterDifference {
  parameter: string;
  values: Record<string, any>;
  impact_on_results: string;
}

export interface ResultDifference {
  metric: string;
  values: Record<string, number>;
  statistical_significance: boolean;
  practical_significance: string;
}
export type DistributionType = 'normal' | 'uniform' | 'exponential';