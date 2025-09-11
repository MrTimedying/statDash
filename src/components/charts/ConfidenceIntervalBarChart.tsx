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
  ErrorBar
} from 'recharts';
import { ChartContainer } from './base/ChartContainer';
import { MultiPairResults } from '../../types/simulation.types';
import { useSimulationStore } from '../../stores/simulation.store';
import { SIGNIFICANCE_COLORS } from './types/chart.types';

interface ConfidenceIntervalBarChartProps {
  multiPairResults: MultiPairResults;
  significanceLevels: number[];
  width?: number;
  height?: number;
  showLegend?: boolean;
  mini?: boolean;
}

export const ConfidenceIntervalBarChart: React.FC<ConfidenceIntervalBarChartProps> = ({
  multiPairResults,
  significanceLevels,
  width = 600,
  height = 400,
  showLegend = true,
  mini = false
}) => {
  const simulationStore = useSimulationStore();

  const chartData = useMemo(() => {
    if (!multiPairResults?.pairs_results?.length) return [];

    return multiPairResults.pairs_results.map((pairResult) => {
      const aggregatedStats = pairResult.aggregated_stats;

      // Calculate average confidence interval from individual results
      const ciData = pairResult.individual_results.map(r => ({
        lower: r.confidence_interval[0],
        upper: r.confidence_interval[1],
        center: (r.confidence_interval[0] + r.confidence_interval[1]) / 2,
        width: r.confidence_interval[1] - r.confidence_interval[0]
      }));

      const avgLower = ciData.reduce((sum, ci) => sum + ci.lower, 0) / ciData.length;
      const avgUpper = ciData.reduce((sum, ci) => sum + ci.upper, 0) / ciData.length;
      const avgCenter = (avgLower + avgUpper) / 2;
      const avgWidth = avgUpper - avgLower;

      // Determine significance based on whether CI contains 0
      const isSignificant = avgLower > 0 || avgUpper < 0;
      const alpha = (significanceLevels && significanceLevels[0]) || 0.05;
      const color = isSignificant ? SIGNIFICANCE_COLORS.significant : SIGNIFICANCE_COLORS.notSignificant;

      return {
        pair: pairResult.pair_name,
        center: avgCenter,
        lower: avgLower,
        upper: avgUpper,
        width: avgWidth,
        error: [avgCenter - avgLower, avgUpper - avgCenter], // For ErrorBar component
        significant: isSignificant,
        color: color,
        count: pairResult.individual_results.length,
        ciCoverage: aggregatedStats.ci_coverage,
        meanCIWidth: aggregatedStats.mean_ci_width
      };
    });
  }, [multiPairResults, significanceLevels]);

  if (!chartData.length) {
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
          <span style={{ color: '#666', fontSize: '12px' }}>No CI data available</span>
        </div>
      );
    }
    return (
      <ChartContainer
        title="Confidence Intervals"
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
          <span style={{ color: '#666' }}>No confidence interval data available</span>
        </div>
      </ChartContainer>
    );
  }

  if (mini) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 5,
            left: 5,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="pair"
            angle={-45}
            textAnchor="end"
            height={40}
            interval={0}
            fontSize={10}
          />
          <YAxis fontSize={10} />
          <Tooltip
            formatter={(value: any, name: string, props: any) => [
              `${Number(value).toFixed(3)} (${props.payload.significant ? 'Sig' : 'NS'})`,
              'Effect Size'
            ]}
            labelFormatter={(label) => `Pair: ${label}`}
          />
          <Bar
            dataKey="center"
            name="Effect Size"
            radius={[2, 2, 0, 0]}
            fill="#8884d8"
          >
            {chartData.map((entry, index) => (
              <Bar key={`cell-${index}`} fill={entry.color} />
            ))}
            <ErrorBar
              dataKey="error"
              width={4}
              strokeWidth={2}
              stroke="#666"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ChartContainer
      title="Confidence Intervals by Pair"
      width={width}
      height={height}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="pair"
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
          />
          <YAxis
            label={{ value: 'Effect Size', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            formatter={(value: any, name: string, props: any) => [
              `${Number(value).toFixed(3)} (${props.payload.significant ? 'Significant' : 'Not Significant'})`,
              'Effect Size'
            ]}
            labelFormatter={(label) => `Pair: ${label}`}
          />
          {showLegend && <Legend />}
          <Bar
            dataKey="center"
            name="Effect Size"
            radius={[4, 4, 0, 0]}
          >
            {chartData.map((entry, index) => (
              <Bar key={`cell-${index}`} fill={entry.color} />
            ))}
            <ErrorBar
              dataKey="error"
              width={6}
              strokeWidth={2}
              stroke="#666"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Significance Legend */}
      <div style={{
        marginTop: '16px',
        padding: '8px',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Significance Based on CI:</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: SIGNIFICANCE_COLORS.significant,
                borderRadius: '2px'
              }}
            />
            <span>Significant (CI doesn't contain 0)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: SIGNIFICANCE_COLORS.notSignificant,
                borderRadius: '2px'
              }}
            />
            <span>Not Significant (CI contains 0)</span>
          </div>
        </div>
      </div>
    </ChartContainer>
  );
};