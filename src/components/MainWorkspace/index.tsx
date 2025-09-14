import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useSimulationStore } from '../../stores/simulation.store';
import { TopPanel } from './TopPanel';
import { NavigationMenu } from './NavigationMenu';
import { MainWorkspaceProps } from './types';

const MainWorkspace: React.FC<MainWorkspaceProps> = ({ isResizing = false }) => {
  const simulationStore = useSimulationStore();
  const [currentChartType, setCurrentChartType] = useState<'estimation' | 'variability'>('estimation');

  // Get data from stores
  const currentSession = simulationStore.currentSession;
  const multiPairResults = currentSession?.results || null;
  const significanceLevels = currentSession?.parameters.global_settings.significance_levels || [0.01, 0.05, 0.10];
  const pairs = currentSession?.parameters.pairs || [];

  // Handle running simulation
  const handleRunSimulation = async () => {
    try {
      await simulationStore.runSimulation();
    } catch (error) {
      console.error('Simulation error:', error);
    }
  };

  // Handle chart type change
  const handleChartTypeChange = (chartType: 'estimation' | 'variability') => {
    setCurrentChartType(chartType);
  };

  if (!currentSession) {
    return (
      <Box sx={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 2
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <Box component="h3" sx={{ fontSize: '1.125rem', fontWeight: 600, mb: 0.5 }}>
            Ready for Analysis
          </Box>
          <Box component="p" sx={{ color: 'text.secondary', maxWidth: '350px', fontSize: '0.875rem' }}>
            Configure your simulation parameters and run the analysis to explore visualizations and insights.
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', position: 'relative' }}>
      {/* Full Height Chart Area - No Resizable Panels */}
      <Box sx={{
        height: '100%',
        position: 'relative'
      }}>
        {multiPairResults ? (
          <TopPanel
            multiPairResults={multiPairResults}
            significanceLevels={significanceLevels}
            pairs={pairs}
            currentChartType={currentChartType}
            onChartTypeChange={handleChartTypeChange}
          />
        ) : (
          <Box sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary'
          }}>
            Run a simulation to view the interactive chart canvas
          </Box>
        )}

        {/* Navigation Menu */}
        <NavigationMenu
          onRunSimulation={handleRunSimulation}
          currentChartType={currentChartType}
          onChartTypeChange={handleChartTypeChange}
        />
      </Box>
    </Box>
  );
};

export default MainWorkspace;