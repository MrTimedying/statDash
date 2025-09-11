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
    // Add individual p-value histograms for each pair
    pairs.forEach((pair) => {
      const pairResult = multiPairResults.pairs_results.find(p => p.pair_id === pair.id);
      if (pairResult) {
        charts.push({
          id: `pvalue-${pair.id}`,
          title: `${pair.name} P-Value Histogram`,
          description: `P-value distribution for ${pair.name} with significance threshold`,
          type: 'bar',
          pairId: pair.id,
          component: undefined, // Will be resolved by the consumer
          props: {
            multiPairResults,
            significanceLevels,
            selectedPairId: pair.id
          },
          category: 'distributions'
        });
      }
    });


    // Add confidence interval barchart
    charts.push({
      id: 'confidence-interval-barchart',
      title: 'Confidence Intervals',
      description: 'Visualize confidence intervals for each pair with significance indicators',
      type: 'bar',
      component: undefined, // Will be resolved by the consumer
      props: {
        multiPairResults,
        significanceLevels
      },
      category: 'comparisons'
    });

    // Add overlay CI + distribution chart
    charts.push({
      id: 'overlay-ci-distribution',
      title: 'CI + Distribution Overlay',
      description: 'Overlay confidence intervals on distribution curves',
      type: 'comparison',
      component: undefined, // Will be resolved by the consumer
      props: {
        multiPairResults,
        significanceLevels
      },
      category: 'comparisons'
    });

    // Add effect size histogram
    charts.push({
      id: 'effect-size-histogram',
      title: 'Effect Size Distribution',
      description: 'Histogram of effect sizes across all pairs with categorization',
      type: 'bar',
      component: undefined, // Will be resolved by the consumer
      props: {
        multiPairResults,
        effectSizeThresholds: {
          negligible: 0.2,
          small: 0.5,
          medium: 0.8,
          large: 1.2
        }
      },
      category: 'analysis'
    });

    // Add population distribution chart
    charts.push({
      id: 'population-distribution',
      title: 'Population Distributions',
      description: 'Overlaid histograms showing population distributions with KDE',
      type: 'distribution',
      component: undefined, // Will be resolved by the consumer
      props: {
        multiPairResults
      },
      category: 'distributions'
    });


    // Add S-value line chart
    charts.push({
      id: 'svalue-line-chart',
      title: 'S-Value Line Plots',
      description: 'Line plots of S-values sorted by sample size',
      type: 'comparison',
      component: undefined, // Will be resolved by the consumer
      props: {
        multiPairResults
      },
      category: 'analysis'
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