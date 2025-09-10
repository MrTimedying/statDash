import React, { useEffect } from 'react';
import { useChartStore } from '../../../stores/chart.store';
import { useSimulationStore } from '../../../stores/simulation.store';
import { transformPValueHistogram } from '../../../utils/chart-transformers';
import { ChartContainer } from '../base/ChartContainer';
import { PValueChartProps, SIGNIFICANCE_COLORS } from '../types/chart.types';

const PValueHistogram: React.FC<PValueChartProps> = ({
  chartId = 'pvalue-chart',
  width = 600,
  height = 300,
  significanceThreshold = 0.05
}) => {
  const chartStore = useChartStore();
  const simulationStore = useSimulationStore();

  // Get current session results
  const currentSession = simulationStore.currentSession;
  const multiPairResults = currentSession?.results;

  useEffect(() => {
    if (multiPairResults && multiPairResults.pairs_results.length > 0) {
      // Use the first pair's results for the histogram
      const firstPair = multiPairResults.pairs_results[0];
      const histogramData = firstPair.aggregated_stats.p_value_histogram;

      if (histogramData && histogramData.length > 0) {
        // Transform data using chart transformers
        const chartData = transformPValueHistogram(histogramData, 'P-Value Distribution');

        // Create or update chart in store
        const existingChart = chartStore.charts[chartId];
        if (existingChart) {
          chartStore.updateChart(chartId, {
            data: histogramData,
            lastUpdated: new Date()
          });
        } else {
          chartStore.addChart({
            type: 'histogram',
            title: 'P-Value Distribution',
            data: histogramData,
            config: {
              showLegend: true,
              showGrid: true,
              interactive: true,
              animation: true,
              showConfidenceIntervals: false,
              significanceThreshold,
              effectSizeInterpretation: false,
              theme: 'light',
              colorScheme: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'],
              fontSize: 12
            }
          });
        }
      }
    }
  }, [multiPairResults, chartId, chartStore, significanceThreshold]);

  // Get chart data from store
  const chart = chartStore.charts[chartId];
  const histogramData = chart?.data as any[] || [];

  const renderHistogram = () => {
    if (!histogramData.length) {
      return (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: '#f9f9f9'
        }}>
          <span style={{ color: '#666' }}>No p-value data available</span>
        </div>
      );
    }

    const maxCount = Math.max(...histogramData.map((bin: any) => bin.count));

    return (
      <div style={{ width: '100%', height: '100%', padding: '20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          height: '200px',
          marginBottom: '20px',
          position: 'relative'
        }}>
          {histogramData.map((bin: any, index: number) => {
            const height = (bin.count / maxCount) * 180;
            const isSignificant = bin.significant;

            return (
              <div
                key={index}
                style={{
                  flex: 1,
                  height: `${height}px`,
                  backgroundColor: isSignificant ? SIGNIFICANCE_COLORS.significant : SIGNIFICANCE_COLORS.notSignificant,
                  margin: '0 1px',
                  position: 'relative',
                  cursor: 'pointer'
                }}
                title={`Range: ${bin.bin_start.toFixed(3)} - ${bin.bin_end.toFixed(3)}\nCount: ${bin.count}\n${isSignificant ? 'Significant' : 'Not Significant'}`}
              >
                <div style={{
                  position: 'absolute',
                  top: '-25px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '10px',
                  color: '#666'
                }}>
                  {bin.count > 0 ? bin.count : ''}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#666'
        }}>
          <span>0.0</span>
          <span>0.2</span>
          <span>0.4</span>
          <span>0.6</span>
          <span>0.8</span>
          <span>1.0</span>
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: '10px',
          fontWeight: 'bold'
        }}>
          P-Value
        </div>
      </div>
    );
  };

  const renderLegend = () => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: '20px',
      marginTop: '15px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <div style={{
          width: '16px',
          height: '16px',
          backgroundColor: SIGNIFICANCE_COLORS.significant
        }}></div>
        <span>{'Significant (p < 0.05)'}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <div style={{
          width: '16px',
          height: '16px',
          backgroundColor: SIGNIFICANCE_COLORS.notSignificant
        }}></div>
        <span>Not Significant (p ≥ 0.05)</span>
      </div>
    </div>
  );

  return (
    <ChartContainer
      title="P-Value Distribution Histogram"
      width={width}
      height={height}
      chartId={chartId}
      showControls={true}
    >
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {renderHistogram()}
        {renderLegend()}
      </div>
    </ChartContainer>
  );
};

export default PValueHistogram;