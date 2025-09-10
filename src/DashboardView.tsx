import React, { useState } from 'react';
import {
  Button,
  Box,
  Typography
} from '@mui/material';
import {
  Download as DownloadIcon
} from '@mui/icons-material';
import { useSimulationStore, useResultsStale } from './stores/simulation.store';
import { useUIStore } from './stores/ui.store';
import { ChartGrid } from './components/charts/ChartGrid';
import { MultiPairResults, PairResult, SimulationResult } from './types/simulation.types';
import { Warning as WarningIcon } from '@mui/icons-material';

const DashboardView: React.FC = () => {
  const simulationStore = useSimulationStore();
  const uiStore = useUIStore();

  // Get data from Zustand stores
  const currentSession = simulationStore.currentSession;
  const multiPairResults = currentSession?.results || null;
  const loading = simulationStore.isLoading;
  const error = simulationStore.error;
  const resultsStale = useResultsStale();

  const [selectedPairId, setSelectedPairId] = useState<string>('');
  const [exporting, setExporting] = useState(false);


  const handleExportCSV = async () => {
    if (!multiPairResults) return;

    setExporting(true);
    try {
      let csvContent = 'Pair Name,P-Value,Effect Size,CI Lower,CI Upper,S-Value,Significant\n';

      // Export all pairs data
      multiPairResults.pairs_results.forEach((pairResult: PairResult) => {
        pairResult.individual_results.forEach((result: SimulationResult) => {
          csvContent += [
            pairResult.pair_name,
            result.p_value.toFixed(6),
            result.effect_size.toFixed(6),
            result.confidence_interval[0].toFixed(6),
            result.confidence_interval[1].toFixed(6),
            result.s_value.toFixed(6),
            result.significant ? 'TRUE' : 'FALSE'
          ].join(',') + '\n';
        });
      });

      // Create a blob and download the file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      a.download = `multi_pair_simulation_results_${timestamp}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log('CSV exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      alert(`Export failed: ${error}`);
    } finally {
      setExporting(false);
    }
  };

  const renderContent = () => {
    return (
      <ChartGrid
        multiPairResults={multiPairResults}
        loading={loading}
        error={error}
      />
    );
  };


  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header - Minimal for charts */}
      <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            {resultsStale && (
              <WarningIcon sx={{ color: 'warning.main', fontSize: '16px' }} titleAccess="Results are out of date - parameters have changed" />
            )}
          </Box>
          {multiPairResults && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
              onClick={handleExportCSV}
              disabled={loading || exporting}
              sx={{ fontSize: '11px', height: 28 }}
            >
              {exporting ? 'Exporting...' : 'Export CSV'}
            </Button>
          )}
        </Box>
      </Box>

      {/* Content - Ready for charts */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
        {renderContent()}
      </Box>
    </Box>
  );
};

export default DashboardView;