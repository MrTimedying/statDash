import React, { useState, useMemo } from 'react';
import {
  Box,
  Checkbox,
  Typography,
  useTheme,
  useMediaQuery,
  Alert
} from '@mui/material';
import { useSimulationStore } from '../../stores/simulation.store';
import { useChartStore } from '../../stores/chart.store';
import { ChartModal } from './ChartModal';
import { ChartCard } from './ChartCard';
import { MultiPairResults } from '../../types/simulation.types';

interface ChartGridProps {
  multiPairResults: MultiPairResults | null;
  loading: boolean;
  error: string | null;
}

export const ChartGrid: React.FC<ChartGridProps> = ({
  multiPairResults,
  loading,
  error
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const simulationStore = useSimulationStore();
  const chartStore = useChartStore();

  const [selectedCharts, setSelectedCharts] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [currentChartIndex, setCurrentChartIndex] = useState(0);

  // Get significance thresholds from simulation store
  const significanceLevels = simulationStore.currentSession?.parameters.global_settings.significance_levels || [0.01, 0.05, 0.10];

  // Define available charts
  const availableCharts = useMemo(() => [
    {
      id: 'distribution-curves',
      title: 'Sample Distribution Curves',
      type: 'line' as const,
      description: 'Distribution curves for g1 and g2 sample values'
    },
    {
      id: 'pvalue-barchart',
      title: 'P-Value Distribution',
      type: 'bar' as const,
      description: 'P-value distribution with significance thresholds'
    },
    {
      id: 'confidence-intervals',
      title: 'Confidence Intervals',
      type: 'bar' as const,
      description: 'Confidence interval visualization for each pair'
    },
    {
      id: 'overlayed-analysis',
      title: 'Overlayed Analysis',
      type: 'combined' as const,
      description: 'Confidence intervals with distribution overlays'
    },
    {
      id: 'effect-size-histogram',
      title: 'Effect Size Distribution',
      type: 'histogram' as const,
      description: 'Histogram of effect sizes across all pairs'
    },
    {
      id: 'qq-plot',
      title: 'QQ Plot',
      type: 'scatter' as const,
      description: 'Quantile-quantile plot for normality assessment'
    },
    {
      id: 'pvalue-effect-scatter',
      title: 'P-Value vs Effect Size',
      type: 'scatter' as const,
      description: 'Scatter plot of p-values vs effect sizes'
    },
    {
      id: 'box-plot',
      title: 'Sample Distributions',
      type: 'boxplot' as const,
      description: 'Box plot comparison of sample distributions'
    }
  ], []);

  // Handle chart selection
  const handleChartSelect = (chartId: string, checked: boolean) => {
    const newSelected = new Set(selectedCharts);
    if (checked) {
      newSelected.add(chartId);
    } else {
      newSelected.delete(chartId);
    }
    setSelectedCharts(newSelected);
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCharts(new Set(availableCharts.map(chart => chart.id)));
    } else {
      setSelectedCharts(new Set());
    }
  };

  // Handle chart expansion
  const handleChartExpand = (chartId: string) => {
    const index = availableCharts.findIndex(chart => chart.id === chartId);
    if (index !== -1) {
      setCurrentChartIndex(index);
      setModalOpen(true);
    }
  };

  // Handle modal navigation
  const handleModalNavigate = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentChartIndex(prev =>
        prev === 0 ? availableCharts.length - 1 : prev - 1
      );
    } else {
      setCurrentChartIndex(prev =>
        prev === availableCharts.length - 1 ? 0 : prev + 1
      );
    }
  };

  // Determine grid columns based on screen size
  const getGridColumns = () => {
    if (isMobile) return 1;
    if (isTablet) return 2;
    return 3;
  };

  // Loading state
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

  // Error state
  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  // No data state
  if (!multiPairResults) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
          Charts will be displayed here
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Run a simulation to generate chart visualizations.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      {/* Selection Controls */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Checkbox
            checked={selectedCharts.size === availableCharts.length}
            indeterminate={selectedCharts.size > 0 && selectedCharts.size < availableCharts.length}
            onChange={(e) => handleSelectAll(e.target.checked)}
            size="small"
          />
          <Typography variant="body2" sx={{ ml: 1 }}>
            Select All ({selectedCharts.size}/{availableCharts.length})
          </Typography>
        </Box>

        {selectedCharts.size > 0 && (
          <Typography variant="body2" color="text.secondary">
            {selectedCharts.size} chart{selectedCharts.size !== 1 ? 's' : ''} selected
          </Typography>
        )}
      </Box>

      {/* Charts Grid */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)'
            },
            gap: 2,
            p: 1
          }}
        >
          {availableCharts.map((chart) => (
            <Box key={chart.id}>
              <ChartCard
                chart={chart}
                selected={selectedCharts.has(chart.id)}
                onSelect={(checked: boolean) => handleChartSelect(chart.id, checked)}
                onExpand={() => handleChartExpand(chart.id)}
                multiPairResults={multiPairResults}
                significanceLevels={significanceLevels}
              />
            </Box>
          ))}
        </Box>
      </Box>

      {/* Chart Modal */}
      <ChartModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        charts={availableCharts}
        currentIndex={currentChartIndex}
        onNavigate={handleModalNavigate}
        multiPairResults={multiPairResults}
        significanceLevels={significanceLevels}
      />
    </Box>
  );
};