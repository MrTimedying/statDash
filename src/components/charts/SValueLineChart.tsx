import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ChartContainer } from './base/ChartContainer';
import { MultiPairResults } from '../../types/simulation.types';
import { useSimulationStore } from '../../stores/simulation.store';

interface SValueLineChartProps {
  multiPairResults: MultiPairResults;
  width?: number;
  height?: number;
  mini?: boolean;
}

export const SValueLineChart: React.FC<SValueLineChartProps> = ({
  multiPairResults,
  width = 600,
  height = 400,
  mini = false
}) => {
  const simulationStore = useSimulationStore();

  const chartData = useMemo(() => {
    if (!multiPairResults?.pairs_results?.length) return null;

    // Group by sample size
    const sampleSizeGroups: { [key: number]: number[] } = {};
    const originalPairs = simulationStore.currentSession?.parameters.pairs || [];

    multiPairResults.pairs_results.forEach((pairResult) => {
      const originalPair = originalPairs.find(p => p.id === pairResult.pair_id);
      const sampleSize = originalPair?.sample_size_per_group || pairResult.individual_results.length;

      if (!sampleSizeGroups[sampleSize]) {
        sampleSizeGroups[sampleSize] = [];
      }

      pairResult.individual_results.forEach((result) => {
        sampleSizeGroups[sampleSize].push(result.s_value);
      });
    });

    // If no sample sizes found, create default groups
    if (Object.keys(sampleSizeGroups).length === 0) {
      const allSValues = multiPairResults.pairs_results.flatMap(p =>
        p.individual_results.map(r => r.s_value)
      );

      // Create 4 groups with different sample sizes
      const groupSizes = [10, 30, 60, 100];
      groupSizes.forEach(size => {
        sampleSizeGroups[size] = allSValues.slice(0, size);
      });
    }

    // Create line data points
    const sampleSizes = Object.keys(sampleSizeGroups)
      .map(Number)
      .sort((a, b) => a - b)
      .slice(0, 4); // Limit to 4 groups

    const maxLength = Math.max(...sampleSizes);
    const dataPoints: Array<{ x: number; [key: string]: number }> = [];

    for (let i = 0; i < maxLength; i++) {
      const dataPoint: any = { x: i };

      sampleSizes.forEach((sampleSize) => {
        const sValues = sampleSizeGroups[sampleSize];
        if (i < sValues.length) {
          // Sort values as in blueprint
          const sortedValues = [...sValues].sort((a, b) => a - b);
          dataPoint[`n${sampleSize}`] = sortedValues[i];
        }
      });

      dataPoints.push(dataPoint);
    }

    return {
      dataPoints,
      sampleSizes,
      sampleSizeGroups
    };
  }, [multiPairResults, simulationStore.currentSession?.parameters.pairs]);

  if (!chartData) {
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
          <span style={{ color: '#666', fontSize: '12px' }}>No S-value data available</span>
        </div>
      );
    }
    return (
      <ChartContainer
        title="S-Value Line Plots"
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
          <span style={{ color: '#666' }}>No S-value data available</span>
        </div>
      </ChartContainer>
    );
  }

  if (mini) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData.dataPoints}
          margin={{
            top: 5,
            right: 5,
            left: 5,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="x"
            fontSize={10}
          />
          <YAxis fontSize={10} />
          <Tooltip
            formatter={(value: any, name: string) => [
              Number(value).toFixed(3),
              `n=${name.replace('n', '')}`
            ]}
            labelFormatter={(label) => `Index: ${label}`}
          />
          {chartData.sampleSizes.map((sampleSize, index) => {
            const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];
            return (
              <Line
                key={sampleSize}
                type="monotone"
                dataKey={`n${sampleSize}`}
                name={`n=${sampleSize}`}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={false}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // Colors for different sample sizes
  const lineColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

  return (
    <ChartContainer
      title="S-Value Line Plots by Sample Size"
      width={width}
      height={height}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData.dataPoints}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="x"
            label={{ value: 'Sorted Index', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            label={{ value: 'S-Value', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            formatter={(value: any, name: string) => [
              Number(value).toFixed(3),
              `Sample Size ${name.replace('n', '')}`
            ]}
            labelFormatter={(label) => `Index: ${label}`}
          />
          <Legend />
          {chartData.sampleSizes.map((sampleSize, index) => (
            <Line
              key={sampleSize}
              type="monotone"
              dataKey={`n${sampleSize}`}
              name={`n=${sampleSize}`}
              stroke={lineColors[index % lineColors.length]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Summary */}
      <div style={{
        marginTop: '16px',
        padding: '8px',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>S-Value Summary by Sample Size:</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
          {chartData.sampleSizes.map((sampleSize, index) => {
            const sValues = chartData.sampleSizeGroups[sampleSize];
            const meanSValue = sValues.reduce((sum, s) => sum + s, 0) / sValues.length;
            const medianSValue = [...sValues].sort((a, b) => a - b)[Math.floor(sValues.length / 2)];
            return (
              <div key={sampleSize}>
                <strong>n = {sampleSize}:</strong><br />
                Mean: {meanSValue.toFixed(3)}<br />
                Median: {medianSValue.toFixed(3)}
              </div>
            );
          })}
        </div>
      </div>
    </ChartContainer>
  );
};