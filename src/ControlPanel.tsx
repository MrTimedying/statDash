import React, { useState, useContext, createContext } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  TextField,
  Box,
  Alert,
  Typography,
  Divider
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Settings as SettingsIcon,
  Science as ScienceIcon
} from '@mui/icons-material';
import { SamplePairManagerMUI as SamplePairManager } from './components/SamplePairManagerMUI';
import { SignificanceThresholds } from './components/SignificanceThresholds';
import { SamplePair, MultiPairSimulationParams, GlobalSimulationSettings } from './types/simulation.types';
import { multiPairSimulationEngine } from './services/multi-pair-simulation';

// Phase 1.5: Import new Zustand store
import { useSimulationStore } from './stores/simulation.store';
import { useUIStore } from './stores/ui.store';
import { workerService } from './services/worker.service';

// Types matching Rust backend
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

interface AppState {
  // Single-pair mode
  params: SimulationParams;
  results: AggregatedResults | null;

  // Multi-pair mode
  multiPairParams: MultiPairSimulationParams;
  multiPairResults: any | null; // Will be properly typed later

  // Common
  mode: 'single' | 'multi';
  loading: boolean;
  error: string | null;
}

interface AppContextType extends AppState {
  // Single-pair methods
  setParams: (params: Partial<SimulationParams>) => void;
  runSimulation: () => Promise<void>;

  // Multi-pair methods
  setMultiPairParams: (params: Partial<MultiPairSimulationParams>) => void;
  setPairs: (pairs: SamplePair[]) => void;
  setGlobalSettings: (settings: Partial<GlobalSimulationSettings>) => void;
  runMultiPairSimulation: () => Promise<void>;

  // Common methods
  setMode: (mode: 'single' | 'multi') => void;
  clearError: () => void;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    // Single-pair mode
    params: {
      group1_mean: 0,
      group1_std: 1,
      group2_mean: 0,
      group2_std: 1,
      sample_size_per_group: 30,
      num_simulations: 1000,
      hypothesized_effect_size: 0,
      alpha_level: 0.05,
    },
    results: null,

    // Multi-pair mode
    multiPairParams: {
      pairs: [],
      global_settings: {
        num_simulations: 1000,
        significance_levels: [0.01, 0.05, 0.10],
        confidence_level: 0.95,
        test_type: 'welch'
      },
      ui_preferences: {
        theme: 'light',
        decimal_places: 3,
        chart_animations: true,
        color_blind_safe: false
      }
    },
    multiPairResults: null,

    // Common
    mode: 'single',
    loading: false,
    error: null,
  });

  const setParams = (newParams: Partial<SimulationParams>) => {
    setState(prev => ({
      ...prev,
      params: { ...prev.params, ...newParams },
    }));
  };

  const runSimulation = async () => {
    console.log('Single-pair simulation not available - simulationEngine.ts was removed');

    setState(prev => ({
      ...prev,
      error: 'Single-pair simulation is not available. The simulationEngine.ts file was removed. Please use multi-pair mode instead.',
      loading: false,
    }));
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  // Multi-pair methods
  const setMultiPairParams = (newParams: Partial<MultiPairSimulationParams>) => {
    setState(prev => ({
      ...prev,
      multiPairParams: { ...prev.multiPairParams, ...newParams },
    }));
  };

  const setPairs = (pairs: SamplePair[]) => {
    setState(prev => ({
      ...prev,
      multiPairParams: { ...prev.multiPairParams, pairs },
    }));
  };

  const setGlobalSettings = (settings: Partial<GlobalSimulationSettings>) => {
    setState(prev => ({
      ...prev,
      multiPairParams: {
        ...prev.multiPairParams,
        global_settings: { ...prev.multiPairParams.global_settings, ...settings },
      },
    }));
  };

  const runMultiPairSimulation = async () => {
    console.log('Starting multi-pair simulation...');

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log('Running multi-pair simulation with params:', state.multiPairParams);
      const results = await multiPairSimulationEngine.runMultiPairSimulation(
        state.multiPairParams,
        (progress) => {
          console.log('Progress:', progress);
        }
      );
      console.log('Multi-pair simulation completed successfully');

      setState(prev => ({
        ...prev,
        multiPairResults: results,
        mode: 'multi', // Automatically switch to multi mode when results are available
        loading: false,
      }));
    } catch (error) {
      console.error('Multi-pair simulation error:', error);

      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        loading: false,
      }));
    }
  };

  const setMode = (mode: 'single' | 'multi') => {
    setState(prev => ({ ...prev, mode }));
  };

  const contextValue: AppContextType = {
    ...state,
    setParams,
    runSimulation,
    setMultiPairParams,
    setPairs,
    setGlobalSettings,
    runMultiPairSimulation,
    setMode,
    clearError,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// Updated ControlPanel component with Phase 1.5 migration
const ControlPanel: React.FC = () => {
  // Phase 1.5: Use new Zustand stores
  const simulationStore = useSimulationStore();
  const uiStore = useUIStore();

  // Legacy context as fallback
  const legacyContext = useAppContext();

  // Determine which system to use (Phase 1.5 preferred, legacy fallback)
  const useNewSystem = true; // Toggle this to switch between systems

  const {
    mode,
    params,
    setParams,
    runSimulation,
    multiPairParams,
    setPairs,
    setGlobalSettings,
    runMultiPairSimulation,
    setMode,
    loading,
    error,
    clearError
  } = useNewSystem ? {
    // Phase 1.5: Map Zustand store to legacy interface
    mode: 'multi' as const, // Always use multi-pair mode in new system
    params: legacyContext.params, // Keep legacy for single-pair
    setParams: legacyContext.setParams,
    runSimulation: legacyContext.runSimulation,
    multiPairParams: simulationStore.currentSession?.parameters || legacyContext.multiPairParams,
    setPairs: (pairs: SamplePair[]) => simulationStore.updatePairs(pairs),
    setGlobalSettings: (settings: Partial<GlobalSimulationSettings>) =>
      simulationStore.updateGlobalSettings(settings),
    runMultiPairSimulation: async () => {
      if (!simulationStore.currentSession) {
        // Create a new session if none exists
        const params = legacyContext.multiPairParams;
        simulationStore.createSession(params);
      }

      // Use Web Worker for computation
      try {
        const params = simulationStore.currentSession?.parameters;
        if (!params) throw new Error('No simulation parameters');

        simulationStore.setError(null);
        const results = await workerService.runSimulation(
          {
            group1_mean: params.pairs[0]?.group1.mean || 0,
            group1_std: params.pairs[0]?.group1.std || 1,
            group2_mean: params.pairs[0]?.group2.mean || 0,
            group2_std: params.pairs[0]?.group2.std || 1,
            sample_size_per_group: params.pairs[0]?.sample_size_per_group || 30,
            num_simulations: params.global_settings.num_simulations,
            alpha_level: params.global_settings.significance_levels[0] || 0.05,
          },
          (completed, total) => {
            console.log(`Phase 1.5: Progress ${completed}/${total}`);
          }
        );

        // Update session with results
        if (simulationStore.currentSession) {
          simulationStore.updateSession({
            results: {
              pairs_results: [], // TODO: Transform results
              cross_pair_analysis: {
                effect_size_comparison: [],
                power_analysis: [],
                significance_correlation: {
                  correlation_matrix: {},
                  overall_consistency: 0,
                  threshold_stability: {}
                },
                recommendations: []
              },
              global_statistics: {
                total_simulations: results.total_count,
                total_pairs: 1,
                overall_significance_rate: results.significant_count / results.total_count,
                average_effect_size: results.mean_effect_size,
                effect_size_variability: 0,
                execution_time_ms: 0
              },
              execution_metadata: {
                timestamp: new Date(),
                duration_ms: 0,
                parameters: params,
                version: '1.5.0',
                performance_metrics: {
                  memory_usage_mb: 0,
                  cpu_usage_percent: 0,
                  simulations_per_second: results.total_count / 1, // Rough estimate
                  average_pair_duration_ms: 0
                }
              }
            }
          });
        }
      } catch (error) {
        simulationStore.setError(error instanceof Error ? error.message : 'Simulation failed');
      }
    },
    setMode: (mode: 'single' | 'multi') => {
      // In Phase 1.5, we always use multi-pair mode
      console.log('Phase 1.5: Mode switching not needed, always multi-pair');
    },
    loading: simulationStore.isLoading,
    error: simulationStore.error,
    clearError: () => simulationStore.setError(null)
  } : legacyContext;

  // Remove Antd form hooks - using local state instead

  const handleInputChange = (field: keyof SimulationParams, value: number | null) => {
    if (value === null || isNaN(value) || !isFinite(value)) {
      console.warn(`Invalid value detected for field ${field}, skipping update`);
      return;
    }

    // Additional field-specific validation
    if (field === 'group1_std' || field === 'group2_std') {
      if (value <= 0) {
        console.warn(`Standard deviation must be positive, got ${value}`);
        return;
      }
    }
    if (field === 'sample_size_per_group' || field === 'num_simulations') {
      if (value <= 0 || !Number.isInteger(value)) {
        console.warn(`${field} must be a positive integer, got ${value}`);
        return;
      }
    }
    if (field === 'alpha_level') {
      if (value <= 0 || value >= 1) {
        console.warn(`Alpha level must be between 0 and 1, got ${value}`);
        return;
      }
    }

    setParams({ [field]: value });
  };

  const handleRunSimulation = async () => {
    clearError();
    await runSimulation();
  };

  const handleRunMultiPairSimulation = async () => {
    clearError();
    await runMultiPairSimulation();
  };

  return (
    <div className="control-panel" style={{
      height: '100%',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        overflowY: 'auto',
        flex: 1,
        padding: '12px 8px 12px 12px',
        minHeight: 0 // Important for flex scrolling
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', pb: 2.5 }}>

          {error && (
            <Alert
              severity="error"
              onClose={clearError}
              sx={{ mb: 1.5, fontSize: '12px' }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Analysis Error
              </Typography>
              <Typography variant="body2">
                {error}
              </Typography>
            </Alert>
          )}

          <SamplePairManager
            pairs={multiPairParams.pairs}
            onPairsChange={setPairs}
          />

          <SignificanceThresholds
            thresholds={multiPairParams.global_settings.significance_levels}
            onThresholdsChange={(thresholds) =>
              setGlobalSettings({ significance_levels: thresholds })
            }
          />

          <Card variant="outlined" sx={{ fontSize: '12px' }}>
            <CardHeader
              title="Simulation Settings"
              titleTypographyProps={{ variant: 'subtitle1' }}
            />
            <CardContent sx={{ pt: 0 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Simulations per pair"
                  type="number"
                  value={multiPairParams.global_settings.num_simulations}
                  onChange={(e) => setGlobalSettings({ num_simulations: parseInt(e.target.value) || 1000 })}
                  inputProps={{ min: 100, max: 100000, step: 100 }}
                  size="small"
                  fullWidth
                />
                <TextField
                  label="Confidence level"
                  type="number"
                  value={multiPairParams.global_settings.confidence_level}
                  onChange={(e) => setGlobalSettings({ confidence_level: parseFloat(e.target.value) || 0.95 })}
                  inputProps={{ min: 0.8, max: 0.99, step: 0.01 }}
                  size="small"
                  fullWidth
                />
              </Box>
            </CardContent>
          </Card>

          <Button
            variant="contained"
            startIcon={<PlayIcon />}
            onClick={handleRunMultiPairSimulation}
            disabled={loading || multiPairParams.pairs.filter(p => p.enabled).length === 0}
            size="small"
            fullWidth
            sx={{ mt: 1.5, height: '32px' }}
          >
            {loading ? 'Running Analysis...' : 'Run Analysis'}
          </Button>

          {multiPairParams.pairs.filter(p => p.enabled).length === 0 && (
            <Typography
              variant="body2"
              color="warning.main"
              textAlign="center"
              sx={{ mt: 1 }}
            >
              Add and enable at least one sample pair
            </Typography>
          )}

          {loading && (
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ mt: 1.5 }}
            >
              Processing {multiPairParams.pairs.filter(p => p.enabled).length} pairs × {multiPairParams.global_settings.num_simulations.toLocaleString()} simulations...
            </Typography>
          )}
        </Box>
      </div>
    </div>
  );
};

export default ControlPanel;