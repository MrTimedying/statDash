import React from 'react';
import { MultiPairResults, SamplePair } from '../../types/simulation.types';

// Import chart components
import { GardnerAltmanEstimationPlot } from './GardnerAltmanEstimationPlot';
import { PValueVariabilityChart } from './PValueVariabilityChart';

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

  // Add Gardner-Altman estimation plot
  charts.push({
    id: 'gardner-altman-estimation',
    title: 'Gardner-Altman Estimation Plot',
    description: 'Estimation plot showing effect sizes with confidence intervals for each pair comparison',
    type: 'comparison',
    component: GardnerAltmanEstimationPlot,
    props: {
      multiPairResults,
      significanceLevels,
      responsive: true,
      showLegend: false,
      mini: false
    },
    category: 'analysis'
  });

  // Add P-Value Variability Chart
  charts.push({
    id: 'p-value-variability',
    title: 'P-Value Variability Across Replications',
    description: 'Demonstrates how p-values fluctuate across multiple replications of the same study, showing the fickleness of statistical significance',
    type: 'comparison',
    component: PValueVariabilityChart,
    props: {
      multiPairResults,
      pairs,
      numReplications: 20,
      responsive: true
    },
    category: 'analysis'
  });

  return charts;
};

// Helper function to get chart categories for organization
export const getChartCategories = () => [
  {
    id: 'analysis',
    title: 'Statistical Analysis',
    description: 'Estimation statistics and effect size analysis'
  }
];

// Helper function to get charts by category
export const getChartsByCategory = (
  charts: DynamicChartInfo[],
  category: string
): DynamicChartInfo[] => {
  return charts.filter(chart => chart.category === category);
};