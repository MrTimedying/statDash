import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SimulationResult, MultiPairResults, SamplePair } from '../types/simulation.types';

// Chart visibility and configuration
interface ChartConfig {
  visible: boolean;
  mode: 'separate' | 'overlay'; // For animated charts
}

interface ChartsStore {
  // Chart Visibility & Modes
  pValueHistogram: ChartConfig;
  effectSizeDistribution: ChartConfig;
  statisticalPowerTable: ChartConfig;
  shannonSValues: ChartConfig;
  ciGapChart: ChartConfig;
  confidenceIntervalBarchart: ChartConfig;
  overlayCIDistribution: ChartConfig;
  populationDistribution: ChartConfig;
  sValueLineChart: ChartConfig;

  // Current Data Context
  currentResults: MultiPairResults | null;
  hasMultiplePairs: boolean;

  // Export Settings
  exportFormat: 'png' | 'svg' | 'pdf';
  exportQuality: 'standard' | 'high';
  includeInsights: boolean;

  // Scientific Insights
  autoInsights: boolean;
  currentInsights: string[];

  // Chart Actions
  toggleChartVisibility: (chartType: keyof Pick<ChartsStore,
    'pValueHistogram' | 'effectSizeDistribution' | 'statisticalPowerTable' |
    'shannonSValues' | 'ciGapChart' | 'confidenceIntervalBarchart' |
    'overlayCIDistribution' | 'populationDistribution' | 'sValueLineChart'>) => void;
  setChartMode: (chartType: keyof Pick<ChartsStore,
    'pValueHistogram' | 'effectSizeDistribution'>, mode: 'separate' | 'overlay') => void;

  // Data Actions
  updateCurrentResults: (results: MultiPairResults | null) => void;
  generateInsights: (results: MultiPairResults) => void;

  // Export Actions
  setExportFormat: (format: 'png' | 'svg' | 'pdf') => void;
  setExportQuality: (quality: 'standard' | 'high') => void;
  toggleIncludeInsights: () => void;

  // Bulk Actions
  showAllCharts: () => void;
  hideAllCharts: () => void;
  resetToDefaults: () => void;
}

export const useChartsStore = create<ChartsStore>()(
  persist(
    (set, get) => ({
      // Initial Chart Configurations
      pValueHistogram: { visible: true, mode: 'separate' },
      effectSizeDistribution: { visible: true, mode: 'separate' },
      statisticalPowerTable: { visible: true, mode: 'separate' },
      shannonSValues: { visible: false, mode: 'separate' }, // Hidden by default
      ciGapChart: { visible: false, mode: 'separate' }, // Hidden by default
      confidenceIntervalBarchart: { visible: true, mode: 'separate' },
      overlayCIDistribution: { visible: true, mode: 'separate' },
      populationDistribution: { visible: true, mode: 'separate' },
      sValueLineChart: { visible: true, mode: 'separate' },

      // Initial Data State
      currentResults: null,
      hasMultiplePairs: false,

      // Initial Export Settings
      exportFormat: 'png',
      exportQuality: 'high',
      includeInsights: true,

      // Initial Insights
      autoInsights: true,
      currentInsights: [],

      // Chart Actions
      toggleChartVisibility: (chartType) => {
        set(state => ({
          [chartType]: {
            ...state[chartType],
            visible: !state[chartType].visible
          }
        }));
      },

      setChartMode: (chartType, mode) => {
        set(state => ({
          [chartType]: {
            ...state[chartType],
            mode
          }
        }));
      },

      // Data Actions
      updateCurrentResults: (results) => {
        const state = get();
        const hasMultiplePairs = results?.pairs_results && results.pairs_results.length > 1;

        // Only update if results have actually changed
        if (state.currentResults !== results) {
          const insights: string[] = [];

          // Generate insights inline to avoid separate state update
          if (results && state.autoInsights) {
            if (results.pairs_results && results.pairs_results.length > 1) {
              // Multi-pair insights
              insights.push(`Comparing ${results.pairs_results.length} sample pairs`);

              // Power comparison
              const powers = results.pairs_results.map(p =>
                p.individual_results.filter(r => r.significant).length / p.individual_results.length
              );
              const minPower = Math.min(...powers);
              const maxPower = Math.max(...powers);

              insights.push(`Statistical power ranges from ${(minPower * 100).toFixed(1)}% to ${(maxPower * 100).toFixed(1)}%`);

              // Precision comparison
              const precisions = results.pairs_results.map(p => {
                const mean = p.individual_results.reduce((sum, r) => sum + (r.confidence_interval[1] - r.confidence_interval[0]), 0) / p.individual_results.length;
                return mean;
              });
              const maxPrecision = Math.max(...precisions);
              const minPrecision = Math.min(...precisions);
              const improvement = ((maxPrecision - minPrecision) / maxPrecision * 100);

              insights.push(`CI precision varies by ${improvement.toFixed(1)}% across pairs`);
            } else if (results.pairs_results && results.pairs_results.length === 1) {
              // Single-pair insights
              const pair = results.pairs_results[0];
              const power = pair.individual_results.filter(r => r.significant).length / pair.individual_results.length;
              insights.push(`Statistical power: ${(power * 100).toFixed(1)}% at α = 0.05`);

              const meanEffect = pair.individual_results.reduce((sum, r) => sum + r.effect_size, 0) / pair.individual_results.length;
              insights.push(`Mean effect size: ${meanEffect.toFixed(3)}`);
            }
          }

          set({
            currentResults: results,
            hasMultiplePairs: Boolean(hasMultiplePairs),
            currentInsights: insights
          });
        }
      },

      generateInsights: (results) => {
        const insights: string[] = [];

        if (results.pairs_results && results.pairs_results.length > 1) {
          // Multi-pair insights
          insights.push(`Comparing ${results.pairs_results.length} sample pairs`);

          // Power comparison
          const powers = results.pairs_results.map(p =>
            p.individual_results.filter(r => r.significant).length / p.individual_results.length
          );
          const minPower = Math.min(...powers);
          const maxPower = Math.max(...powers);

          insights.push(`Statistical power ranges from ${(minPower * 100).toFixed(1)}% to ${(maxPower * 100).toFixed(1)}%`);

          // Precision comparison
          const precisions = results.pairs_results.map(p => {
            const mean = p.individual_results.reduce((sum, r) => sum + (r.confidence_interval[1] - r.confidence_interval[0]), 0) / p.individual_results.length;
            return mean;
          });
          const maxPrecision = Math.max(...precisions);
          const minPrecision = Math.min(...precisions);
          const improvement = ((maxPrecision - minPrecision) / maxPrecision * 100);

          insights.push(`CI precision varies by ${improvement.toFixed(1)}% across pairs`);
        } else if (results.pairs_results && results.pairs_results.length === 1) {
          // Single-pair insights
          const pair = results.pairs_results[0];
          const power = pair.individual_results.filter(r => r.significant).length / pair.individual_results.length;
          insights.push(`Statistical power: ${(power * 100).toFixed(1)}% at α = 0.05`);

          const meanEffect = pair.individual_results.reduce((sum, r) => sum + r.effect_size, 0) / pair.individual_results.length;
          insights.push(`Mean effect size: ${meanEffect.toFixed(3)}`);
        }

        set({ currentInsights: insights });
      },

      // Export Actions
      setExportFormat: (format) => set({ exportFormat: format }),
      setExportQuality: (quality) => set({ exportQuality: quality }),
      toggleIncludeInsights: () => set(state => ({ includeInsights: !state.includeInsights })),

      // Bulk Actions
      showAllCharts: () => set(state => ({
        pValueHistogram: { ...state.pValueHistogram, visible: true },
        effectSizeDistribution: { ...state.effectSizeDistribution, visible: true },
        statisticalPowerTable: { ...state.statisticalPowerTable, visible: true },
        shannonSValues: { ...state.shannonSValues, visible: true },
        ciGapChart: { ...state.ciGapChart, visible: true },
        confidenceIntervalBarchart: { ...state.confidenceIntervalBarchart, visible: true },
        overlayCIDistribution: { ...state.overlayCIDistribution, visible: true },
        populationDistribution: { ...state.populationDistribution, visible: true },
        sValueLineChart: { ...state.sValueLineChart, visible: true }
      })),

      hideAllCharts: () => set(state => ({
        pValueHistogram: { ...state.pValueHistogram, visible: false },
        effectSizeDistribution: { ...state.effectSizeDistribution, visible: false },
        statisticalPowerTable: { ...state.statisticalPowerTable, visible: false },
        shannonSValues: { ...state.shannonSValues, visible: false },
        ciGapChart: { ...state.ciGapChart, visible: false },
        confidenceIntervalBarchart: { ...state.confidenceIntervalBarchart, visible: false },
        overlayCIDistribution: { ...state.overlayCIDistribution, visible: false },
        populationDistribution: { ...state.populationDistribution, visible: false },
        sValueLineChart: { ...state.sValueLineChart, visible: false }
      })),

      resetToDefaults: () => set({
        pValueHistogram: { visible: true, mode: 'separate' },
        effectSizeDistribution: { visible: true, mode: 'separate' },
        statisticalPowerTable: { visible: true, mode: 'separate' },
        shannonSValues: { visible: false, mode: 'separate' },
        ciGapChart: { visible: false, mode: 'separate' },
        confidenceIntervalBarchart: { visible: true, mode: 'separate' },
        overlayCIDistribution: { visible: true, mode: 'separate' },
        populationDistribution: { visible: true, mode: 'separate' },
        sValueLineChart: { visible: true, mode: 'separate' },
        exportFormat: 'png',
        exportQuality: 'high',
        includeInsights: true,
        autoInsights: true
      })
    }),
    {
      name: 'statdash-charts-storage',
      partialize: (state) => ({
        pValueHistogram: state.pValueHistogram,
        effectSizeDistribution: state.effectSizeDistribution,
        statisticalPowerTable: state.statisticalPowerTable,
        shannonSValues: state.shannonSValues,
        ciGapChart: state.ciGapChart,
        confidenceIntervalBarchart: state.confidenceIntervalBarchart,
        overlayCIDistribution: state.overlayCIDistribution,
        populationDistribution: state.populationDistribution,
        sValueLineChart: state.sValueLineChart,
        exportFormat: state.exportFormat,
        exportQuality: state.exportQuality,
        includeInsights: state.includeInsights,
        autoInsights: state.autoInsights
      }),
      version: 1,
    }
  )
);

// Selectors for better performance - using individual selectors to avoid object creation
export const usePValueHistogramVisible = () => useChartsStore(state => state.pValueHistogram.visible);
export const useEffectSizeDistributionVisible = () => useChartsStore(state => state.effectSizeDistribution.visible);
export const useStatisticalPowerTableVisible = () => useChartsStore(state => state.statisticalPowerTable.visible);
export const useShannonSValuesVisible = () => useChartsStore(state => state.shannonSValues.visible);
export const useCiGapChartVisible = () => useChartsStore(state => state.ciGapChart.visible);
export const useConfidenceIntervalBarchartVisible = () => useChartsStore(state => state.confidenceIntervalBarchart.visible);
export const useOverlayCIDistributionVisible = () => useChartsStore(state => state.overlayCIDistribution.visible);
export const usePopulationDistributionVisible = () => useChartsStore(state => state.populationDistribution.visible);
export const useSValueLineChartVisible = () => useChartsStore(state => state.sValueLineChart.visible);

export const usePValueHistogramMode = () => useChartsStore(state => state.pValueHistogram.mode);
export const useEffectSizeDistributionMode = () => useChartsStore(state => state.effectSizeDistribution.mode);

// Export settings selectors - individual primitives to avoid object creation
export const useExportFormat = () => useChartsStore(state => state.exportFormat);
export const useExportQuality = () => useChartsStore(state => state.exportQuality);
export const useIncludeInsights = () => useChartsStore(state => state.includeInsights);

// Individual action selectors - stable function references
export const useToggleChartVisibility = () => useChartsStore(state => state.toggleChartVisibility);
export const useSetChartMode = () => useChartsStore(state => state.setChartMode);
export const useShowAllCharts = () => useChartsStore(state => state.showAllCharts);
export const useHideAllCharts = () => useChartsStore(state => state.hideAllCharts);
export const useSetExportFormat = () => useChartsStore(state => state.setExportFormat);
export const useSetExportQuality = () => useChartsStore(state => state.setExportQuality);
export const useResetToDefaults = () => useChartsStore(state => state.resetToDefaults);

// Data and insights selectors
export const useCurrentResults = () => useChartsStore(state => state.currentResults);
export const useHasMultiplePairs = () => useChartsStore(state => state.hasMultiplePairs);
export const useCurrentInsights = () => useChartsStore(state => state.currentInsights);
export const useUpdateCurrentResults = () => useChartsStore(state => state.updateCurrentResults);
export const useGenerateInsights = () => useChartsStore(state => state.generateInsights);