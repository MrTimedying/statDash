import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Close as CloseIcon,
  TableChart as TableIcon,
  Download as DownloadIcon,
  Analytics as SummaryIcon,
  DataObject as DetailedIcon
} from '@mui/icons-material';
import { useSimulationStore } from '../../stores/simulation.store';
import { VirtualizedResultsTable } from '../tables/VirtualizedResultsTable';
import { VirtualizedSummaryTable } from '../tables/VirtualizedSummaryTable';

interface DataTablesModalProps {
  open: boolean;
  onClose: () => void;
}

// Removed PairDetailTable component - replaced with VirtualizedResultsTable

export const DataTablesModal: React.FC<DataTablesModalProps> = ({
  open,
  onClose
}) => {
  const [activeView, setActiveView] = useState<'summary' | string>('summary');
  const simulationStore = useSimulationStore();
  const currentSession = simulationStore.currentSession;
  const multiPairResults = currentSession?.results;

  // Process data for virtualized tables
  const summaryData = useMemo(() => {
    if (!multiPairResults?.pairs_results) return [];

    return multiPairResults.pairs_results.map((pairResult) => {
      const results = pairResult.individual_results || [];
      const meanPValue = results.reduce((sum, r) => sum + r.p_value, 0) / results.length;
      const meanEffectSize = results.reduce((sum, r) => sum + r.effect_size, 0) / results.length;
      const significantCount = results.filter(r => r.significant).length;
      const significantPercentage = (significantCount / results.length) * 100;

      return {
        pairName: pairResult.pair_name,
        meanPValue,
        meanEffectSize,
        significantPercentage,
        totalReplications: results.length
      };
    });
  }, [multiPairResults]);

  // Get individual pair results with proper indexing
  const getPairResults = (pairName: string) => {
    const pairResult = multiPairResults?.pairs_results.find(p => p.pair_name === pairName);
    if (!pairResult?.individual_results) return [];

    return pairResult.individual_results.map((result, index) => ({
      ...result,
      simulation_index: index // Add index for the virtualized table
    }));
  };

  const handleExportCSV = (dataType: 'results' | 'summary', pairName?: string) => {
    if (!multiPairResults) return;

    let csvContent = '';
    let filename = '';

    if (dataType === 'results') {
      if (pairName) {
        // Export single pair results
        csvContent = 'Replication,P-Value,Effect Size,CI Lower,CI Upper,S-Value,Significant\n';
        const pairResult = multiPairResults.pairs_results.find(p => p.pair_name === pairName);
        if (pairResult) {
          pairResult.individual_results.forEach((result, index) => {
            csvContent += [
              index + 1,
              result.p_value.toFixed(6),
              result.effect_size.toFixed(6),
              result.confidence_interval[0].toFixed(6),
              result.confidence_interval[1].toFixed(6),
              result.s_value.toFixed(6),
              result.significant ? 'TRUE' : 'FALSE'
            ].join(',') + '\n';
          });
        }
        filename = `${pairName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_detailed_results`;
      } else {
        // Export all results
        csvContent = 'Pair Name,Replication,P-Value,Effect Size,CI Lower,CI Upper,S-Value,Significant\n';
        multiPairResults.pairs_results.forEach((pairResult) => {
          pairResult.individual_results.forEach((result, index) => {
            csvContent += [
              pairResult.pair_name,
              index + 1,
              result.p_value.toFixed(6),
              result.effect_size.toFixed(6),
              result.confidence_interval[0].toFixed(6),
              result.confidence_interval[1].toFixed(6),
              result.s_value.toFixed(6),
              result.significant ? 'TRUE' : 'FALSE'
            ].join(',') + '\n';
          });
        });
        filename = 'all_simulation_results';
      }
    } else if (dataType === 'summary') {
      csvContent = 'Pair Name,Mean P-Value,Mean Effect Size,Significant Results (%),Total Replications\n';
      multiPairResults.pairs_results.forEach((pairResult) => {
        const results = pairResult.individual_results;
        const meanPValue = results.reduce((sum, r) => sum + r.p_value, 0) / results.length;
        const meanEffectSize = results.reduce((sum, r) => sum + r.effect_size, 0) / results.length;
        const significantCount = results.filter(r => r.significant).length;
        const significantPercentage = (significantCount / results.length) * 100;

        csvContent += [
          pairResult.pair_name,
          meanPValue.toFixed(6),
          meanEffectSize.toFixed(6),
          significantPercentage.toFixed(2),
          results.length
        ].join(',') + '\n';
      });
      filename = 'simulation_summary';
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    a.download = `${filename}_${timestamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (!multiPairResults) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            No simulation results available. Run a simulation first.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '85vh',
          maxHeight: '85vh',
          m: 2
        }
      }}
    >
      {/* Tight Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          minHeight: 40
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 500, fontSize: '0.9rem' }}>
          Data Tables
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ p: 0.5 }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0, display: 'flex', overflow: 'hidden' }}>
        {/* Left Navigation Menu */}
        <Paper
          elevation={0}
          sx={{
            width: 180,
            borderRight: 1,
            borderColor: 'divider',
            bgcolor: 'grey.50'
          }}
        >
          <List sx={{ p: 0.5 }}>
            <ListItemButton
              selected={activeView === 'summary'}
              onClick={() => setActiveView('summary')}
              sx={{
                borderRadius: 0,
                mb: 0,
                py: 0.75,
                px: 1,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '& .MuiListItemIcon-root': { color: 'white' }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 28 }}>
                <SummaryIcon sx={{ fontSize: 16 }} />
              </ListItemIcon>
              <ListItemText
                primary="Summary"
                primaryTypographyProps={{ fontSize: '0.8rem' }}
              />
            </ListItemButton>

            {multiPairResults?.pairs_results.map((pairResult) => (
              <ListItemButton
                key={pairResult.pair_name}
                selected={activeView === pairResult.pair_name}
                onClick={() => setActiveView(pairResult.pair_name)}
                sx={{
                  borderRadius: 0,
                  mb: 0,
                  py: 0.75,
                  px: 1,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '& .MuiListItemIcon-root': { color: 'white' }
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <DetailedIcon sx={{ fontSize: 16 }} />
                </ListItemIcon>
                <ListItemText
                  primary={pairResult.pair_name}
                  primaryTypographyProps={{ fontSize: '0.8rem' }}
                />
              </ListItemButton>
            ))}
          </List>
        </Paper>

        {/* Main Content Area */}
        <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Summary View */}
          {activeView === 'summary' && (
            <Box sx={{ p: 3, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <VirtualizedSummaryTable
                data={summaryData}
                onExportCSV={() => handleExportCSV('summary')}
              />
            </Box>
          )}

          {/* Individual Pair Views */}
          {multiPairResults?.pairs_results.map((pairResult) =>
            activeView === pairResult.pair_name && (
              <Box key={pairResult.pair_name} sx={{ p: 3, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <VirtualizedResultsTable
                  data={getPairResults(pairResult.pair_name)}
                  pairName={pairResult.pair_name}
                  onExportCSV={(pairName, results) => handleExportCSV('results', pairName)}
                />
              </Box>
            )
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};