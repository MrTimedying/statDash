import React, { useMemo, useRef, useEffect } from 'react';
import embed from 'vega-embed';
import { Box, Typography, Paper, Divider } from '@mui/material';
import { MultiPairResults, SamplePair } from '../../types/simulation.types';

interface PValueVariabilityChartProps {
  multiPairResults: MultiPairResults;
  pairs: SamplePair[];
  currentPairIndex?: number;
  significanceLevels?: number[];
  width?: number;
  height?: number;
}

export const PValueVariabilityChart: React.FC<PValueVariabilityChartProps> = ({
  multiPairResults,
  pairs,
  currentPairIndex = 0,
  significanceLevels = [0.01, 0.05, 0.10],
  width = 600,
  height = 400
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [selectedThreshold, setSelectedThreshold] = React.useState<number>(significanceLevels[1] || 0.05);

  // Use actual simulation results instead of generating new data
  const replicationData = useMemo(() => {
    if (!multiPairResults?.pairs_results?.length || currentPairIndex >= multiPairResults.pairs_results.length) {
      return [];
    }

    const currentPairResults = multiPairResults.pairs_results[currentPairIndex];
    const individualResults = currentPairResults.individual_results;

    if (!individualResults?.length) return [];

    // Transform actual simulation results into chart data
    const replications = individualResults.map((result, index) => ({
      replication: index + 1,
      p_value: Math.max(0.0001, Math.min(1, result.p_value)), // Ensure valid range for log scale
      original_significant: result.significant,
      effect_size: result.effect_size,
      // Dynamic significance based on selected threshold
      significant_at_threshold: result.p_value < selectedThreshold,
      significance_label: result.p_value < selectedThreshold ? 'Significant' : 'Non-significant'
    }));

    return replications;
  }, [multiPairResults, currentPairIndex, selectedThreshold]);

  // Calculate variability metrics
  const variabilityMetrics = useMemo(() => {
    if (!replicationData.length) return null;

    const pValues = replicationData.map(d => d.p_value);
    const significantCount = replicationData.filter(d => d.significant_at_threshold).length;

    const mean = pValues.reduce((sum, val) => sum + val, 0) / pValues.length;
    const variance = pValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / pValues.length;
    const standardDeviation = Math.sqrt(variance);

    // Count significance status changes if we had ordered data
    let statusChanges = 0;
    for (let i = 1; i < replicationData.length; i++) {
      if (replicationData[i].significant_at_threshold !== replicationData[i-1].significant_at_threshold) {
        statusChanges++;
      }
    }

    return {
      count: pValues.length,
      mean: mean,
      standardDeviation: standardDeviation,
      coefficientOfVariation: mean > 0 ? standardDeviation / mean : 0,
      min: Math.min(...pValues),
      max: Math.max(...pValues),
      range: Math.max(...pValues) - Math.min(...pValues),
      significantCount: significantCount,
      significantPercentage: (significantCount / pValues.length) * 100,
      statusChanges: statusChanges,
      threshold: selectedThreshold
    };
  }, [replicationData, selectedThreshold]);

  // Calculate dynamic Y-axis domain based on actual data
  const yAxisDomain = useMemo(() => {
    if (!replicationData.length) return [0.0001, 1];
    
    const pValues = replicationData.map(d => d.p_value);
    const minP = Math.min(...pValues);
    const maxP = Math.max(...pValues);
    
    // Add padding to the range (log scale)
    const logMin = Math.log10(minP);
    const logMax = Math.log10(maxP);
    const padding = (logMax - logMin) * 0.1; // 10% padding
    
    const domainMin = Math.max(0.0001, Math.pow(10, logMin - padding));
    const domainMax = Math.min(1, Math.pow(10, logMax + padding));
    
    return [domainMin, domainMax];
  }, [replicationData]);

  // Create threshold line data
  const thresholdData = useMemo(() => {
    return significanceLevels.map(level => ({
      threshold: level,
      label: level.toString(),
      isSelected: level === selectedThreshold,
      threshold_color: level === selectedThreshold ? 'selected' : 'unselected'
    }));
  }, [significanceLevels, selectedThreshold]);

  const spec = useMemo(() => ({
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    title: {
      text: 'P-Value Variability Across Replications',
      fontSize: 16,
      fontWeight: 600,
      anchor: 'start' as const,
      offset: 10
    },
    width: 'container' as const,
    height: 'container' as const,
    autosize: {
      type: 'fit' as const,
      contains: 'padding' as const,
      resize: true
    },
    datasets: {
      replication_data: replicationData,
      threshold_data: thresholdData
    },
    layer: [
      // P-value points (move to bottom layer)
      {
        data: { name: 'replication_data' },
        mark: {
          type: 'point' as const,
          filled: true,
          size: 80,
          opacity: 0.8,
          stroke: '#ffffff',
          strokeWidth: 1
        },
        encoding: {
          x: {
            field: 'replication',
            type: 'quantitative' as const,
            title: 'Replication Number',
            axis: { 
              tickMinStep: 1,
              grid: true,
              gridColor: '#e9ecef',
              gridOpacity: 0.5
            }
          },
          y: {
            field: 'p_value',
            type: 'quantitative' as const,
            title: 'P-Value (log scale)',
            scale: { 
              type: 'log' as const, 
              domain: yAxisDomain,
              nice: false
            },
            axis: {
              tickCount: 6,
              format: '.4f',
              grid: true,
              gridColor: '#e9ecef',
              gridOpacity: 0.5
            }
          },
          color: {
            field: 'significance_label',
            type: 'nominal' as const,
            title: 'Result',
            scale: {
              domain: ['Significant', 'Non-significant'],
              range: ['#17a2b8', '#d6d8db'] // Aquamarine/azure for significant, light gray for non-significant
            }
          },
          tooltip: [
            { field: 'replication', title: 'Replication' },
            { field: 'p_value', title: 'P-Value', format: '.6f' },
            { field: 'significance_label', title: `Result (α = ${selectedThreshold})` },
            { field: 'effect_size', title: 'Effect Size', format: '.3f' }
          ]
        }
      },
      // Multiple significance threshold lines (on top of points)
      {
        data: { name: 'threshold_data' },
        mark: {
          type: 'rule' as const,
          strokeWidth: 2,
          strokeDash: [5, 5],
          opacity: 0.8
        },
        encoding: {
          y: { 
            field: 'threshold',
            type: 'quantitative' as const
          },
          stroke: {
            field: 'threshold_color',
            type: 'nominal' as const,
            scale: {
              domain: ['selected', 'unselected'],
              range: ['#fa8072', '#999999'] // Salmon for selected, gray for others
            },
            legend: null
          },
          strokeWidth: {
            field: 'threshold_color',
            type: 'nominal' as const,
            scale: {
              domain: ['selected', 'unselected'],
              range: [3, 2] // Thicker line for selected threshold
            },
            legend: null
          }
        }
      },
      // Threshold label text (prominent clickable labels)
      {
        data: { name: 'threshold_data' },
        mark: {
          type: 'text' as const,
          fontSize: 12,
          fontWeight: 'bold' as const,
          dx: 15,
          align: 'left' as const,
          baseline: 'middle' as const,
          cursor: 'pointer' as const
        },
        encoding: {
          y: { 
            field: 'threshold',
            type: 'quantitative' as const
          },
          text: { 
            field: 'threshold',
            type: 'nominal' as const,
            format: '.3f'
          },
          fill: {
            field: 'threshold_color',
            type: 'nominal' as const,
            scale: {
              domain: ['selected', 'unselected'],
              range: ['#fa8072', '#999999'] // Salmon for selected, gray for unselected
            },
            legend: null
          },
          opacity: {
            field: 'threshold_color',
            type: 'nominal' as const,
            scale: {
              domain: ['selected', 'unselected'],
              range: [1, 0.8] // Full opacity for selected, slightly reduced for others
            },
            legend: null
          }
        }
      }
    ],
    config: {
      axis: {
        labelFontSize: 11,
        titleFontSize: 13,
        titleColor: '#333',
        labelColor: '#666'
      },
      legend: {
        titleFontSize: 13,
        labelFontSize: 11,
        titleColor: '#333',
        labelColor: '#666'
      },
      title: {
        fontSize: 16,
        fontWeight: 600,
        color: '#333'
      },
      background: '#ffffff',
      padding: { left: 70, top: 60, right: 20, bottom: 60 }
    }
  }), [replicationData, yAxisDomain, thresholdData, selectedThreshold]);

  useEffect(() => {
    if (chartRef.current && replicationData.length > 0) {
      embed(chartRef.current, spec, {
        mode: 'vega-lite',
        renderer: 'svg',
        actions: false,
        config: {
          autosize: {
            type: 'fit',
            contains: 'padding',
            resize: true
          }
        }
      }).then((result) => {
        // Add click handler for threshold labels
        if (result && result.view) {
          result.view.addEventListener('click', (event: any, item: any) => {
            if (item && item.datum && typeof item.datum.threshold === 'number') {
              setSelectedThreshold(item.datum.threshold);
            }
          });
        }

        // Add ResizeObserver to force chart resize when container changes
        const resizeObserver = new ResizeObserver(() => {
          if (result && result.view) {
            result.view.resize();
          }
        });

        if (chartRef.current) {
          resizeObserver.observe(chartRef.current);
        }

        // Store observer and view for cleanup
        (chartRef.current as any).__resizeObserver = resizeObserver;
        (chartRef.current as any).__vegaView = result.view;
      });
    }

    // Cleanup function
    return () => {
      if (chartRef.current) {
        if ((chartRef.current as any).__resizeObserver) {
          (chartRef.current as any).__resizeObserver.disconnect();
          delete (chartRef.current as any).__resizeObserver;
        }
        if ((chartRef.current as any).__vegaView) {
          (chartRef.current as any).__vegaView.finalize();
          delete (chartRef.current as any).__vegaView;
        }
      }
    };
  }, [spec, replicationData]);

  if (!replicationData.length) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff'
      }}>
        <span style={{ color: '#666', fontSize: '14px' }}>No replication data available</span>
      </div>
    );
  }

  // Variability sidebar component
  const VariabilitySidebar = () => {
    if (!variabilityMetrics) return null;

    return (
      <Paper
        elevation={1}
        sx={{
          p: 2,
          width: 280,
          height: 'fit-content',
          maxHeight: '100%',
          overflowY: 'auto',
          bgcolor: '#fafafa',
          borderLeft: '1px solid #e0e0e0',
          position: 'sticky',
          top: 0
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ fontSize: 14, fontWeight: 600 }}>
          Replication Statistics
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12, mb: 0.5 }}>
            Replications: {variabilityMetrics.count}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12, mb: 0.5 }}>
            Significant at α = {variabilityMetrics.threshold}: {variabilityMetrics.significantCount} ({variabilityMetrics.significantPercentage.toFixed(1)}%)
          </Typography>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" sx={{ fontSize: 13, fontWeight: 600, mb: 1 }}>
          P-Value Distribution
        </Typography>

        <Box sx={{ mb: 1.5 }}>
          <Typography variant="body2" sx={{ fontSize: 11, color: 'text.secondary' }}>
            Range: {variabilityMetrics.min.toFixed(4)} - {variabilityMetrics.max.toFixed(4)}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: 11, color: 'text.secondary' }}>
            Mean: {variabilityMetrics.mean.toFixed(4)}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: 11, color: 'text.secondary' }}>
            Standard Deviation: {variabilityMetrics.standardDeviation.toFixed(4)}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: 11, color: 'text.secondary' }}>
            Coefficient of Variation: {variabilityMetrics.coefficientOfVariation.toFixed(2)}
          </Typography>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" sx={{ fontSize: 13, fontWeight: 600, mb: 1 }}>
          Significance Status Changes
        </Typography>

        <Typography variant="body2" sx={{ fontSize: 11, color: 'text.secondary', mb: 1.5 }}>
          {variabilityMetrics.statusChanges} transitions between significant/non-significant
        </Typography>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" sx={{ fontSize: 13, fontWeight: 600, mb: 1 }}>
          Research Notes
        </Typography>

        <Typography variant="body2" sx={{ fontSize: 10, color: 'text.secondary', lineHeight: 1.4, mb: 1 }}>
          <strong>P-value variability:</strong> Studies show that even with identical experimental conditions, p-values can vary substantially across replications due to sampling variability.
        </Typography>

        <Typography variant="body2" sx={{ fontSize: 10, color: 'text.secondary', lineHeight: 1.4, mb: 1 }}>
          <strong>Replication ranges:</strong> Research indicates that if a study obtains p = 0.03, there is a 90% chance that a replicate study would return a p-value between 0-0.6, with only 56% chance of p &lt; 0.05.
        </Typography>

        <Typography variant="body2" sx={{ fontSize: 10, color: 'text.secondary', lineHeight: 1.4, mb: 1 }}>
          <strong>Power considerations:</strong> Even with 80% statistical power, p-values show substantial variation across replications. Only at ≥90% power do p-values become more stable.
        </Typography>

        <Typography variant="body2" sx={{ fontSize: 10, color: 'text.secondary', lineHeight: 1.4 }}>
          <strong>Interpretation:</strong> The magnitude of variability observed here reflects the inherent uncertainty in statistical inference from finite samples.
        </Typography>
      </Paper>
    );
  };

  return (
    <Box sx={{ display: 'flex', width: '100%', height: '100%' }}>
      <div
        ref={chartRef}
        style={{
          flex: 1,
          backgroundColor: '#ffffff'
        }}
      />
      <VariabilitySidebar />
    </Box>
  );
};