import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface ChartData {
  id: string;
  type: 'histogram' | 'boxplot' | 'scatter' | 'bar' | 'line';
  title: string;
  data: any[];
  config: ChartConfig;
  lastUpdated: Date;
}

interface ChartConfig {
  // Data mapping
  xAxis?: string;
  yAxis?: string;
  colorBy?: string;
  sizeBy?: string;

  // Visual options
  showLegend: boolean;
  showGrid: boolean;
  interactive: boolean;
  animation: boolean;

  // Statistical options
  showConfidenceIntervals: boolean;
  significanceThreshold: number;
  effectSizeInterpretation: boolean;

  // Styling
  theme: 'light' | 'dark';
  colorScheme: string[];
  fontSize: number;
}

interface ChartState {
  // Chart management
  charts: Record<string, ChartData>;
  activeChartId: string | null;

  // Chart creation state
  isCreatingChart: boolean;
  chartCreationError: string | null;

  // Data caching
  cachedData: Record<string, any[]>;
  dataLastFetched: Record<string, Date>;
}

interface ChartActions {
  // Chart management
  addChart: (chart: Omit<ChartData, 'id' | 'lastUpdated'>) => string;
  updateChart: (id: string, updates: Partial<ChartData>) => void;
  removeChart: (id: string) => void;
  setActiveChart: (id: string | null) => void;

  // Chart creation
  createChartFromData: (data: any[], type: ChartData['type'], title: string) => string;
  duplicateChart: (id: string) => string;

  // Data management
  cacheData: (key: string, data: any[]) => void;
  getCachedData: (key: string) => any[] | null;
  invalidateCache: (key?: string) => void;

  // Configuration
  updateChartConfig: (id: string, config: Partial<ChartConfig>) => void;
  resetChartConfig: (id: string) => void;

  // Export
  exportChart: (id: string, format: 'png' | 'svg' | 'pdf') => Promise<Blob>;
}

type ChartStore = ChartState & ChartActions;

const defaultChartConfig: ChartConfig = {
  showLegend: true,
  showGrid: true,
  interactive: true,
  animation: true,
  showConfidenceIntervals: false,
  significanceThreshold: 0.05,
  effectSizeInterpretation: false,
  theme: 'light',
  colorScheme: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'],
  fontSize: 12,
};

const initialState: ChartState = {
  charts: {},
  activeChartId: null,
  isCreatingChart: false,
  chartCreationError: null,
  cachedData: {},
  dataLastFetched: {},
};

export const useChartStore = create<ChartStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Chart management
      addChart: (chart) => {
        const id = crypto.randomUUID();
        const newChart: ChartData = {
          ...chart,
          id,
          config: { ...defaultChartConfig, ...chart.config },
          lastUpdated: new Date(),
        };

        set((state) => ({
          charts: { ...state.charts, [id]: newChart },
          activeChartId: id,
        }));

        return id;
      },

      updateChart: (id, updates) => {
        set((state) => {
          if (!state.charts[id]) return state;

          return {
            charts: {
              ...state.charts,
              [id]: {
                ...state.charts[id],
                ...updates,
                lastUpdated: new Date(),
              },
            },
          };
        });
      },

      removeChart: (id) => {
        set((state) => {
          const newCharts = { ...state.charts };
          delete newCharts[id];

          return {
            charts: newCharts,
            activeChartId: state.activeChartId === id ? null : state.activeChartId,
          };
        });
      },

      setActiveChart: (id) => set({ activeChartId: id }),

      // Chart creation
      createChartFromData: (data, type, title) => {
        set({ isCreatingChart: true, chartCreationError: null });

        try {
          const chart = {
            type,
            title,
            data,
            config: defaultChartConfig,
          };

          const id = get().addChart(chart);
          set({ isCreatingChart: false });
          return id;
        } catch (error) {
          set({
            isCreatingChart: false,
            chartCreationError: error instanceof Error ? error.message : 'Unknown error',
          });
          throw error;
        }
      },

      duplicateChart: (id) => {
        const originalChart = get().charts[id];
        if (!originalChart) {
          throw new Error('Chart not found');
        }

        const duplicatedChart = {
          ...originalChart,
          title: `${originalChart.title} (Copy)`,
          id: undefined,
          lastUpdated: undefined,
        };

        return get().addChart(duplicatedChart);
      },

      // Data management
      cacheData: (key, data) => {
        set((state) => ({
          cachedData: { ...state.cachedData, [key]: data },
          dataLastFetched: { ...state.dataLastFetched, [key]: new Date() },
        }));
      },

      getCachedData: (key) => {
        const state = get();
        const data = state.cachedData[key];
        const lastFetched = state.dataLastFetched[key];

        // Check if data is still fresh (less than 5 minutes old)
        if (data && lastFetched) {
          const age = Date.now() - lastFetched.getTime();
          if (age < 5 * 60 * 1000) { // 5 minutes
            return data;
          }
        }

        return null;
      },

      invalidateCache: (key) => {
        if (key) {
          set((state) => {
            const newCachedData = { ...state.cachedData };
            const newDataLastFetched = { ...state.dataLastFetched };
            delete newCachedData[key];
            delete newDataLastFetched[key];

            return {
              cachedData: newCachedData,
              dataLastFetched: newDataLastFetched,
            };
          });
        } else {
          set({ cachedData: {}, dataLastFetched: {} });
        }
      },

      // Configuration
      updateChartConfig: (id, config) => {
        const currentChart = get().charts[id];
        if (!currentChart) return;

        get().updateChart(id, {
          config: { ...currentChart.config, ...config },
        });
      },

      resetChartConfig: (id) => {
        get().updateChart(id, {
          config: defaultChartConfig,
        });
      },

      // Export (placeholder implementation)
      exportChart: async (id, format) => {
        // TODO: Implement actual chart export
        console.log(`Exporting chart ${id} as ${format}`);
        return new Blob(['placeholder'], { type: 'application/octet-stream' });
      },
    }),
    {
      name: 'chart-store',
    }
  )
);

// Selectors
export const useCharts = () => useChartStore((state) => Object.values(state.charts));
export const useActiveChart = () => {
  const { charts, activeChartId } = useChartStore();
  return activeChartId ? charts[activeChartId] : null;
};
export const useChartById = (id: string) => {
  return useChartStore((state) => state.charts[id]);
};
export const useIsCreatingChart = () => useChartStore((state) => state.isCreatingChart);
export const useChartCreationError = () => useChartStore((state) => state.chartCreationError);