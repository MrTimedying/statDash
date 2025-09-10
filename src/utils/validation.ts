// Zod validation schemas for runtime type checking
import { z } from 'zod';

// Base schemas for statistical parameters
export const PopulationParamsSchema = z.object({
  mean: z.number().finite(),
  std: z.number().positive().finite(),
  distribution_type: z.enum(['normal', 'uniform', 'exponential']).optional().default('normal'),
});

export const SamplePairSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  group1: PopulationParamsSchema,
  group2: PopulationParamsSchema,
  sample_size_per_group: z.number().int().min(2).max(10000),
  enabled: z.boolean().default(true),
  color_scheme: z.string().optional(),
});

export const GlobalSimulationSettingsSchema = z.object({
  num_simulations: z.number().int().min(100).max(100000),
  significance_levels: z.array(z.number().min(0).max(1)).min(1).max(5),
  confidence_level: z.number().min(0.8).max(0.999),
  random_seed: z.number().int().optional(),
  test_type: z.enum(['welch', 'pooled', 'mann_whitney']),
});

export const UIPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']),
  decimal_places: z.number().int().min(1).max(10),
  chart_animations: z.boolean(),
  color_blind_safe: z.boolean(),
});

// Session management schemas
export const SimulationSessionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  parameters: z.object({
    pairs: z.array(SamplePairSchema),
    global_settings: GlobalSimulationSettingsSchema,
    ui_preferences: UIPreferencesSchema,
  }),
  results: z.any().optional(), // Will be validated separately
  created_at: z.date(),
  updated_at: z.date(),
  is_active: z.boolean(),
});

// Results validation schemas
export const SimulationResultSchema = z.object({
  p_value: z.number().min(0).max(1),
  effect_size: z.number().finite(),
  confidence_interval: z.tuple([z.number().finite(), z.number().finite()]),
  s_value: z.number().min(0),
  significant: z.boolean(),
});

export const HistogramBinSchema = z.object({
  bin_start: z.number().finite(),
  bin_end: z.number().finite(),
  count: z.number().int().min(0),
  significant: z.boolean(),
});

export const AggregatedStatsSchema = z.object({
  significant_count: z.number().int().min(0),
  total_count: z.number().int().min(0),
  mean_effect_size: z.number().finite(),
  effect_size_ci: z.tuple([z.number().finite(), z.number().finite()]),
  ci_coverage: z.number().min(0).max(1),
  mean_ci_width: z.number().min(0),
  p_value_histogram: z.array(HistogramBinSchema),
});

export const SignificanceAnalysisSchema = z.object({
  by_threshold: z.record(z.string(), z.object({
    threshold: z.number().min(0).max(1),
    significant_count: z.number().int().min(0),
    percentage: z.number().min(0).max(100),
    confidence_interval: z.tuple([z.number().finite(), z.number().finite()]),
  })),
  threshold_sensitivity: z.object({
    optimal_threshold: z.number().min(0).max(1),
    sensitivity_curve: z.array(z.object({
      threshold: z.number().min(0).max(1),
      sensitivity: z.number().min(0).max(1),
    })),
    type1_error_rate: z.number().min(0).max(1),
    type2_error_rate: z.number().min(0).max(1),
  }),
});

export const EffectSizeAnalysisSchema = z.object({
  mean: z.number().finite(),
  median: z.number().finite(),
  standard_deviation: z.number().min(0),
  confidence_interval: z.tuple([z.number().finite(), z.number().finite()]),
  interpretation: z.enum(['negligible', 'small', 'medium', 'large']),
  practical_significance: z.string(),
});

export const PairResultSchema = z.object({
  pair_id: z.string().uuid(),
  pair_name: z.string().min(1),
  individual_results: z.array(SimulationResultSchema),
  aggregated_stats: AggregatedStatsSchema,
  significance_analysis: SignificanceAnalysisSchema,
  effect_size_analysis: EffectSizeAnalysisSchema,
});

export const CrossPairAnalysisSchema = z.object({
  effect_size_comparison: z.array(z.object({
    pair1_id: z.string().uuid(),
    pair2_id: z.string().uuid(),
    effect_size_difference: z.number().finite(),
    statistical_significance: z.boolean(),
    practical_significance: z.enum(['negligible', 'small', 'medium', 'large']),
  })),
  power_analysis: z.array(z.object({
    pair_id: z.string().uuid(),
    statistical_power: z.number().min(0).max(1),
    required_sample_size: z.number().int().min(1),
    effect_size: z.number().finite(),
    confidence_level: z.number().min(0).max(1),
  })),
  significance_correlation: z.object({
    correlation_matrix: z.record(z.string(), z.record(z.string(), z.number())),
    overall_consistency: z.number().min(0).max(1),
    threshold_stability: z.record(z.string(), z.number()),
  }),
  recommendations: z.array(z.object({
    type: z.enum(['sample_size', 'significance_level', 'effect_size', 'methodology']),
    priority: z.enum(['low', 'medium', 'high', 'critical']),
    message: z.string().min(1),
    actionable: z.boolean(),
    suggested_action: z.string().optional(),
  })),
});

export const GlobalStatisticsSchema = z.object({
  total_simulations: z.number().int().min(0),
  total_pairs: z.number().int().min(0),
  overall_significance_rate: z.number().min(0).max(1),
  average_effect_size: z.number().finite(),
  effect_size_variability: z.number().min(0),
  execution_time_ms: z.number().min(0),
});

export const ExecutionMetadataSchema = z.object({
  timestamp: z.date(),
  duration_ms: z.number().min(0),
  parameters: z.object({
    pairs: z.array(SamplePairSchema),
    global_settings: GlobalSimulationSettingsSchema,
    ui_preferences: UIPreferencesSchema,
  }),
  version: z.string(),
  performance_metrics: z.object({
    memory_usage_mb: z.number().min(0),
    cpu_usage_percent: z.number().min(0).max(100),
    simulations_per_second: z.number().min(0),
    average_pair_duration_ms: z.number().min(0),
  }),
});

export const MultiPairResultsSchema = z.object({
  pairs_results: z.array(PairResultSchema),
  cross_pair_analysis: CrossPairAnalysisSchema,
  global_statistics: GlobalStatisticsSchema,
  execution_metadata: ExecutionMetadataSchema,
});

// Chart validation schemas
export const ChartConfigSchema = z.object({
  xAxis: z.string().optional(),
  yAxis: z.string().optional(),
  colorBy: z.string().optional(),
  sizeBy: z.string().optional(),
  showLegend: z.boolean(),
  showGrid: z.boolean(),
  interactive: z.boolean(),
  animation: z.boolean(),
  showConfidenceIntervals: z.boolean(),
  significanceThreshold: z.number().min(0).max(1),
  effectSizeInterpretation: z.boolean(),
  theme: z.enum(['light', 'dark']),
  colorScheme: z.array(z.string()),
  fontSize: z.number().int().min(8).max(24),
});

// Validation helper functions
export function validateSamplePair(data: unknown): z.infer<typeof SamplePairSchema> {
  return SamplePairSchema.parse(data);
}

export function validateSimulationSession(data: unknown): z.infer<typeof SimulationSessionSchema> {
  return SimulationSessionSchema.parse(data);
}

export function validateSimulationResults(data: unknown): z.infer<typeof MultiPairResultsSchema> {
  return MultiPairResultsSchema.parse(data);
}

export function validateChartConfig(data: unknown): z.infer<typeof ChartConfigSchema> {
  return ChartConfigSchema.parse(data);
}

// Safe validation functions that return errors instead of throwing
export function safeValidateSamplePair(data: unknown): {
  success: boolean;
  data?: z.infer<typeof SamplePairSchema>;
  error?: z.ZodError;
} {
  try {
    const result = SamplePairSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error as z.ZodError };
  }
}

export function safeValidateSimulationSession(data: unknown): {
  success: boolean;
  data?: z.infer<typeof SimulationSessionSchema>;
  error?: z.ZodError;
} {
  try {
    const result = SimulationSessionSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error as z.ZodError };
  }
}

// Utility function to get validation error messages
export function getValidationErrorMessage(error: z.ZodError): string {
  return error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`).join('; ');
}

// Type exports for use in components
export type ValidatedSamplePair = z.infer<typeof SamplePairSchema>;
export type ValidatedSimulationSession = z.infer<typeof SimulationSessionSchema>;
export type ValidatedMultiPairResults = z.infer<typeof MultiPairResultsSchema>;
export type ValidatedChartConfig = z.infer<typeof ChartConfigSchema>;