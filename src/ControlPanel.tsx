import React, { useState, useContext, createContext } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { runStatisticalSimulation as runJSSimulation } from './simulationEngine';

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
  params: SimulationParams;
  results: AggregatedResults | null;
  loading: boolean;
  error: string | null;
}

interface AppContextType extends AppState {
  setParams: (params: Partial<SimulationParams>) => void;
  runSimulation: () => Promise<void>;
  clearError: () => void;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
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
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('Calling simulation with params:', state.params);
      console.log('Invoke function available:', typeof invoke);
      console.log('Running in Tauri context:', (window as any).__TAURI__ !== undefined);
      
      let results: AggregatedResults;
      
      // Check if Tauri is available
      const isTauriAvailable = typeof invoke !== 'undefined' && (window as any).__TAURI__ !== undefined;
      
      if (isTauriAvailable) {
        console.log('Using Tauri/Rust backend for simulation');
        try {
          results = await invoke('run_statistical_simulation', {
            params: state.params
          });
        } catch (tauriError) {
          console.warn('Tauri backend failed, falling back to JavaScript implementation:', tauriError);
          results = await runJSSimulation(state.params);
        }
      } else {
        console.log('Using JavaScript backend for simulation (Tauri not available)');
        results = await runJSSimulation(state.params);
      }
      
      setState(prev => ({
        ...prev,
        results,
        loading: false,
      }));
    } catch (error) {
      console.error('Simulation error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        loading: false,
      }));
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const contextValue: AppContextType = {
    ...state,
    setParams,
    runSimulation,
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

// Updated ControlPanel component
const ControlPanel: React.FC = () => {
  const { params, setParams, runSimulation, loading, error, clearError } = useAppContext();

  const handleInputChange = (field: keyof SimulationParams, value: number) => {
    console.log(`Input change - Field: ${field}, Value: ${value}, IsNaN: ${isNaN(value)}`);
    if (isNaN(value) || !isFinite(value)) {
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

  return (
    <div className="control-panel">
      <h2>Simulation Parameters</h2>
      
      {error && (
        <div className="error-message" style={{ 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          padding: '10px', 
          margin: '10px 0', 
          borderRadius: '4px',
          border: '1px solid #ef5350'
        }}>
          <strong>Error:</strong> {error}
          <button 
            onClick={clearError}
            style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}
      
      <div className="parameter-group">
        <h3>Population 1</h3>
        <div className="input-row">
          <label>Mean:</label>
          <input
            type="number"
            value={isNaN(params.group1_mean) ? '' : params.group1_mean}
            onChange={(e) => {
              const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
              handleInputChange('group1_mean', value);
            }}
            step="0.1"
          />
        </div>
        <div className="input-row">
          <label>Standard Deviation:</label>
          <input
            type="number"
            value={isNaN(params.group1_std) ? '' : params.group1_std}
            onChange={(e) => {
              const value = e.target.value === '' ? 1 : parseFloat(e.target.value);
              handleInputChange('group1_std', value);
            }}
            min="0.1"
            step="0.1"
          />
        </div>
      </div>
      
      <div className="parameter-group">
        <h3>Population 2</h3>
        <div className="input-row">
          <label>Mean:</label>
          <input
            type="number"
            value={isNaN(params.group2_mean) ? '' : params.group2_mean}
            onChange={(e) => {
              const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
              handleInputChange('group2_mean', value);
            }}
            step="0.1"
          />
        </div>
        <div className="input-row">
          <label>Standard Deviation:</label>
          <input
            type="number"
            value={isNaN(params.group2_std) ? '' : params.group2_std}
            onChange={(e) => {
              const value = e.target.value === '' ? 1 : parseFloat(e.target.value);
              handleInputChange('group2_std', value);
            }}
            min="0.1"
            step="0.1"
          />
        </div>
      </div>
      
      <div className="parameter-group">
        <h3>Simulation Settings</h3>
        <div className="input-row">
          <label>Sample Size (per group):</label>
          <input
            type="number"
            value={isNaN(params.sample_size_per_group) ? '' : params.sample_size_per_group}
            onChange={(e) => {
              const value = e.target.value === '' ? 30 : parseInt(e.target.value);
              handleInputChange('sample_size_per_group', value);
            }}
            min="5"
            max="1000"
          />
        </div>
        <div className="input-row">
          <label>Number of Simulations:</label>
          <input
            type="number"
            value={isNaN(params.num_simulations) ? '' : params.num_simulations}
            onChange={(e) => {
              const value = e.target.value === '' ? 1000 : parseInt(e.target.value);
              handleInputChange('num_simulations', value);
            }}
            min="100"
            max="100000"
            step="100"
          />
        </div>
        <div className="input-row">
          <label>Hypothesized Effect Size:</label>
          <input
            type="number"
            value={isNaN(params.hypothesized_effect_size) ? '' : params.hypothesized_effect_size}
            onChange={(e) => {
              const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
              handleInputChange('hypothesized_effect_size', value);
            }}
            step="0.1"
          />
        </div>
        <div className="input-row">
          <label>Alpha Level:</label>
          <input
            type="number"
            value={isNaN(params.alpha_level) ? '' : params.alpha_level}
            onChange={(e) => {
              const value = e.target.value === '' ? 0.05 : parseFloat(e.target.value);
              handleInputChange('alpha_level', value);
            }}
            min="0.001"
            max="0.10"
            step="0.001"
          />
        </div>
      </div>
      
      <button 
        className="run-button"
        onClick={handleRunSimulation}
        disabled={loading}
        style={{
          backgroundColor: loading ? '#cccccc' : '#2196f3',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          fontSize: '16px',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          width: '100%',
          marginTop: '20px'
        }}
      >
        {loading ? 'Running Simulation...' : 'Run Simulation'}
      </button>
      
      {loading && (
        <div className="loading-indicator" style={{ 
          textAlign: 'center', 
          marginTop: '10px',
          color: '#666'
        }}>
          Processing {params.num_simulations.toLocaleString()} simulations...
        </div>
      )}
    </div>
  );
};

export default ControlPanel;