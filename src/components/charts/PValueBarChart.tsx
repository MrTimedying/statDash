import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';
import { ChartContainer } from './base/ChartContainer';
import { MultiPairResults } from '../../types/simulation.types';

interface PValueBarChartProps {
  multiPairResults: MultiPairResults;
  significanceLevels?: number[];
  width?: number;
  height?: number;
  showLegend?: boolean;
  mini?: boolean;
  selectedPairId?: string; // Optional: show only specific pair
  responsive?: boolean; // For modal responsiveness
}

export const PValueBarChart: React.FC<PValueBarChartProps> = ({
  multiPairResults,
  significanceLevels = [0.05],
  width = 600,
  height = 400,
  showLegend = true,
  mini = false,
  selectedPairId,
  responsive = false
}) => {
  const currentThreshold = significanceLevels[0] || 0.05;
  const chartData = useMemo(() => {
    if (!multiPairResults?.pairs_results?.length) return null;

    // Filter pairs if selectedPairId is provided
    const pairsToProcess = selectedPairId
      ? multiPairResults.pairs_results.filter(p => p.pair_id === selectedPairId)
      : multiPairResults.pairs_results;

    if (pairsToProcess.length === 0) return null;

    const pairsData = pairsToProcess.map((pairResult) => {
      const pValues = pairResult.individual_results.map(r => r.p_value);
      if (pValues.length === 0) return null;

      // Create histogram bins for this pair
      const minP = 0;
      const maxP = 1;
      const numBins = 39; // As in blueprint
      const binWidth = (maxP - minP) / numBins;

      const bins: Array<{
        binStart: number;
        binEnd: number;
        binCenter: number;
        count: number;
        percentage: number;
        color: string;
      }> = [];

      for (let i = 0; i < numBins; i++) {
        const binStart = minP + i * binWidth;
        const binEnd = minP + (i + 1) * binWidth;
        const binCenter = (binStart + binEnd) / 2;

        const count = pValues.filter(p => p >= binStart && p < binEnd).length;
        const percentage = (count / pValues.length) * 100;

        // Color based on significance (blueprint style)
        const color = binCenter <= currentThreshold ? '#ffffff' : '#d3d3d3';

        bins.push({
          binStart,
          binEnd,
          binCenter,
          count,
          percentage,
          color
        });
      }

      // Calculate summary statistics for this pair
      const significantCount = pValues.filter(p => p <= currentThreshold).length;
      const falseNegatives = pValues.length - significantCount;

      return {
        pairId: pairResult.pair_id,
        pairName: pairResult.pair_name,
        bins,
        summary: {
          totalCount: pValues.length,
          significantCount,
          falseNegatives,
          significantPercentage: (significantCount / pValues.length) * 100
        }
      };
    }).filter(Boolean);

    return { pairsData };
  }, [multiPairResults, selectedPairId, currentThreshold]);

  const significanceReferenceLines = useMemo(() => {
    return (significanceLevels || []).map((threshold, index) => (
      <ReferenceLine
        key={index}
        x={threshold}
        stroke="#ff4d4f"
        strokeDasharray="5 5"
        label={{
          value: `α = ${threshold}`,
          position: 'top',
          fontSize: 10
        }}
      />
    ));
  }, [significanceLevels]);

  if (!chartData || !chartData.pairsData.length) {
    if (mini) {
      return (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9f9f9'
        }}>
          <span style={{ color: '#666', fontSize: '12px' }}>No p-value data available</span>
        </div>
      );
    }
    return (
      <ChartContainer
        title="P-Value Distribution"
        width={width}
        height={height}
      >
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
      </ChartContainer>
    );
  }

  if (mini) {
    // For mini view, show the first pair
    const firstPair = chartData.pairsData[0];
    if (!firstPair) {
      return (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9f9f9'
        }}>
          <span style={{ color: '#666', fontSize: '12px' }}>No data</span>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={firstPair.bins}
          margin={{
            top: 5,
            right: 5,
            left: 5,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="binCenter"
            type="number"
            domain={[0, 1]}
            fontSize={10}
          />
          <YAxis fontSize={10} />
          <Tooltip
            formatter={(value: any) => [Number(value).toFixed(1), 'Count']}
            labelFormatter={(label) => `P-Value: ${Number(label).toFixed(2)}`}
          />
          <Bar
            dataKey="count"
            name="Count"
            radius={[2, 2, 0, 0]}
          >
            {firstPair.bins.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="black" strokeWidth={0.5} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  const significanceThreshold = significanceLevels[0] || 0.05;

  return (
    <ChartContainer
      title={selectedPairId ? `P-Value Histogram - ${chartData.pairsData[0]?.pairName}` : "P-Value Histograms by Pair"}
      width={width}
      height={height}
      responsive={responsive}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: (() => {
          if (selectedPairId) return '1fr';
          if (responsive) {
            const pairCount = chartData.pairsData.filter(p => p !== null).length;
            if (pairCount === 1) return '1fr';
            if (pairCount === 2) return 'repeat(2, 1fr)';
            return 'repeat(auto-fill, minmax(360px, 1fr))';
          }
          return 'repeat(auto-fit, minmax(400px, 1fr))';
        })(),
        gap: responsive ? '16px' : '20px',
        padding: responsive ? '12px' : '20px',
        width: '100%',
        alignContent: 'start'
      }}>
        {chartData.pairsData.filter((pairData): pairData is NonNullable<typeof pairData> => pairData !== null).map((pairData, pairIndex) => (
          <div key={pairData.pairId} style={{ position: 'relative' }}>
            <div style={{
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '10px',
              textAlign: 'center'
            }}>
              {pairData.pairName}
            </div>

            <div
              style={{
                position: 'relative',
                width: '100%',
                height: responsive ? 'clamp(240px, 28vh, 360px)' : '250px',
                minHeight: responsive ? '240px' : '200px'
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={pairData.bins}
                  margin={{
                    top: 20,
                    right: 20,
                    left: 20,
                    bottom: 20,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="binCenter"
                    type="number"
                    domain={[0, 1]}
                    axisLine={false}
                    tickLine={false}
                    tick={false}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={false}
                  />
                  <Tooltip
                    formatter={(value: any) => [Number(value).toFixed(1), 'Count']}
                    labelFormatter={(label) => `P-Value: ${Number(label).toFixed(2)}`}
                  />

                  {/* Add significance threshold reference lines */}
                  {significanceReferenceLines}

                  <Bar
                    dataKey="count"
                    name="Count"
                    radius={[2, 2, 0, 0]}
                  >
                    {pairData.bins.map((entry, index) => (
                      <Cell key={`cell-${pairIndex}-${index}`} fill={entry.color} stroke="black" strokeWidth={0.5} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Text labels for each pair */}
            <div style={{
              position: 'absolute',
              top: '30px',
              left: '20px',
              fontSize: '11px',
              color: 'crimson',
              backgroundColor: 'white',
              padding: '2px 4px',
              borderRadius: '2px',
              zIndex: 10
            }}>
              {pairData.summary.significantCount} significant
            </div>

            <div style={{
              position: 'absolute',
              top: '30px',
              right: '20px',
              fontSize: '11px',
              color: 'black',
              backgroundColor: 'white',
              padding: '2px 4px',
              borderRadius: '2px',
              zIndex: 10
            }}>
              {pairData.summary.falseNegatives} false negatives
            </div>


            {/* Pair summary */}
            <div style={{
              marginTop: '10px',
              padding: '6px',
              backgroundColor: '#f9f9f9',
              borderRadius: '3px',
              fontSize: '11px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                <span><strong>N:</strong> {pairData.summary.totalCount}</span>
                <span><strong>Sig:</strong> {pairData.summary.significantCount} ({pairData.summary.significantPercentage.toFixed(1)}%)</span>
              </div>
            </div>

            {/* Threshold Statistics Panel */}
            <div style={{
              marginTop: '8px',
              padding: '8px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #e9ecef',
              fontSize: '10px'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '6px', color: '#495057' }}>
                Threshold Analysis:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '4px' }}>
                {significanceLevels.map((threshold, idx) => {
                  const thresholdSignificant = pairData.bins
                    .filter(bin => bin.binCenter <= threshold)
                    .reduce((sum, bin) => sum + bin.count, 0);
                  const thresholdPercentage = (thresholdSignificant / pairData.summary.totalCount) * 100;

                  return (
                    <div key={idx} style={{
                      padding: '4px',
                      backgroundColor: 'white',
                      borderRadius: '2px',
                      border: '1px solid #dee2e6',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontWeight: 'bold', color: '#dc3545', fontSize: '9px' }}>
                        α = {threshold}
                      </div>
                      <div style={{ color: '#495057', fontSize: '9px' }}>
                        {thresholdSignificant} ({thresholdPercentage.toFixed(1)}%)
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Overall summary if showing multiple pairs */}
      {!selectedPairId && chartData.pairsData.filter(p => p !== null).length > 1 && (
        <div style={{
          marginTop: '20px',
          padding: '12px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Overall Summary:</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
            {chartData.pairsData.filter((pairData): pairData is NonNullable<typeof pairData> => pairData !== null).map((pairData) => (
              <div key={pairData.pairId}>
                <strong>{pairData.pairName}:</strong><br />
                Total: {pairData.summary.totalCount}<br />
                Significant: {pairData.summary.significantCount} ({pairData.summary.significantPercentage.toFixed(1)}%)
              </div>
            ))}
          </div>
        </div>
      )}
    </ChartContainer>
  );
};