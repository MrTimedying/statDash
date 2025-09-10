import { MultiPairResults, SamplePair } from '../../types/simulation.types';

export interface DynamicChartInfo {
  id: string;
  title: string;
  description: string;
  type: 'distribution' | 'bar' | 'comparison';
  pairId?: string; // For pair-specific charts
  component?: React.ComponentType<any>; // Made optional
  props: any;
  category: 'distributions' | 'comparisons' | 'analysis';
}

export const generateDynamicCharts = (
  pairs: SamplePair[],
  multiPairResults: MultiPairResults,
  significanceLevels: number[]
): DynamicChartInfo[] => {
  const charts: DynamicChartInfo[] = [];

  if (!pairs.length || !multiPairResults.pairs_results.length) {
    return charts;
  }

  // Generate one distribution chart per pair
  pairs.forEach((pair, index) => {
    const pairResult = multiPairResults.pairs_results.find(p => p.pair_id === pair.id);
    if (pairResult) {
      charts.push({
        id: `dist-${pair.id}`,
        title: `${pair.name} Distribution`,
        description: `Theoretical distribution curves for ${pair.name} (μ₁=${pair.group1.mean}, σ₁=${pair.group1.std} | μ₂=${pair.group2.mean}, σ₂=${pair.group2.std})`,
        type: 'distribution',
        pairId: pair.id,
        component: undefined, // Will be resolved by the consumer
        props: {
          multiPairResults,
          pairId: pair.id,
          showFill: true
        },
        category: 'distributions'
      });
    }
  });

  // Generate aggregate comparison charts
  if (multiPairResults.pairs_results.length > 1) {
    charts.push({
      id: 'pvalue-comparison',
      title: 'P-Value Comparison',
      description: 'Compare p-values across all pairs with significance thresholds',
      type: 'bar',
      component: undefined, // Will be resolved by the consumer
      props: {
        multiPairResults,
        significanceLevels
      },
      category: 'comparisons'
    });

    // Add effect size comparison chart (placeholder for now)
    charts.push({
      id: 'effect-size-comparison',
      title: 'Effect Size Comparison',
      description: 'Compare effect sizes across all pairs',
      type: 'comparison',
      component: undefined, // Will be resolved by the consumer
     props: {
        multiPairResults,
        significanceLevels
      },
      category: 'comparisons'
    });
  }

  return charts;
};

// Helper function to get chart categories for organization
export const getChartCategories = () => [
  {
    id: 'distributions',
    title: 'Distribution Curves',
    description: 'Individual distribution curves for each pair'
  },
  {
    id: 'comparisons',
    title: 'Comparisons',
    description: 'Aggregate comparisons across pairs'
  },
  {
    id: 'analysis',
    title: 'Analysis',
    description: 'Statistical analysis and insights'
  }
];

// Helper function to get charts by category
export const getChartsByCategory = (
  charts: DynamicChartInfo[],
  category: string
): DynamicChartInfo[] => {
  return charts.filter(chart => chart.category === category);
};