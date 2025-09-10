import React, { useState } from 'react';
import {
  Button,
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Download as DownloadIcon
} from '@mui/icons-material';
import { useAppContext } from './ControlPanel';
import { ResultsComparisonTable } from './components/ResultsComparisonTable';
import { MultiPairResults, PairResult, SimulationResult } from './types/simulation.types';

const DashboardView: React.FC = () => {
  const { results, multiPairResults, mode, loading } = useAppContext();
  const [selectedPairId, setSelectedPairId] = useState<string>('');
  const [exporting, setExporting] = useState(false);


  const handleExportCSV = async () => {
    if (!multiPairResults && !results) return;

    setExporting(true);
    try {
      let csvContent = '';

      if (mode === 'multi' && multiPairResults) {
        // Export all pairs data
        csvContent = 'Pair Name,P-Value,Effect Size,CI Lower,CI Upper,S-Value,Significant\n';

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
      } else if (mode === 'single' && results) {
        // Export single pair data
        csvContent = 'P-Value,Effect Size,CI Lower,CI Upper,S-Value,Significant\n';

        results.individual_results.forEach((result: SimulationResult) => {
          csvContent += [
            result.p_value.toFixed(6),
            result.effect_size.toFixed(6),
            result.confidence_interval[0].toFixed(6),
            result.confidence_interval[1].toFixed(6),
            result.s_value.toFixed(6),
            result.significant ? 'TRUE' : 'FALSE'
          ].join(',') + '\n';
        });
      }

      // Create a blob and download the file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const modePrefix = mode === 'multi' ? 'multi_pair_' : 'single_pair_';
      a.download = `${modePrefix}simulation_results_${timestamp}.csv`;
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
    if (loading) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Running Statistical Simulation...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This may take a few moments for large numbers of simulations
          </Typography>
        </Box>
      );
    }

    const hasResults = mode === 'multi' ? multiPairResults : results;
    if (!hasResults) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No simulation results yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Set your parameters and run a simulation to get started.
          </Typography>
        </Box>
      );
    }

    // For multi-pair mode, we need results to display
    if (mode === 'multi' && !multiPairResults) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            Multi-pair results not available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please run a multi-pair simulation.
          </Typography>
        </Box>
      );
    }

    // Show the main results table for now
    if (mode === 'multi' && multiPairResults) {
      return <ResultsComparisonTable results={multiPairResults} />;
    } else if (mode === 'single' && results) {
      // For single-pair, show a simplified table
      return (
        <Card sx={{ mt: 1 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Single Pair Results
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 180px' }}>
                <Typography variant="h5" color="primary">
                  {results.total_count}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Simulations
                </Typography>
              </Box>
              <Box sx={{ flex: '1 1 180px' }}>
                <Typography variant="h5" color="primary">
                  {results.significant_count}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Significant ({((results.significant_count / results.total_count) * 100).toFixed(1)}%)
                </Typography>
              </Box>
              <Box sx={{ flex: '1 1 180px' }}>
                <Typography variant="h5" color="primary">
                  {results.mean_effect_size.toFixed(3)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Mean Effect Size
                </Typography>
              </Box>
              <Box sx={{ flex: '1 1 180px' }}>
                <Typography variant="h5" color="primary">
                  {(results.ci_coverage * 100).toFixed(1)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  CI Coverage
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      );
    }

    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          No results to display
        </Typography>
      </Box>
    );
  };


  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600 }}>
              Analysis Dashboard
            </Typography>
            {mode === 'multi' && multiPairResults && (
              <FormControl size="small" sx={{ mt: 0.5, minWidth: 180 }}>
                <InputLabel sx={{ fontSize: '11px' }}>Select pair</InputLabel>
                <Select
                  value={selectedPairId || ''}
                  label="Select pair"
                  onChange={(e) => setSelectedPairId(e.target.value)}
                  sx={{ fontSize: '11px' }}
                >
                  {multiPairResults.pairs_results.map((pair: PairResult) => (
                    <MenuItem key={pair.pair_id} value={pair.pair_id} sx={{ fontSize: '11px' }}>
                      {pair.pair_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
          {(multiPairResults || results) && (
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

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
        {renderContent()}
      </Box>
    </Box>
  );
};

export default DashboardView;