import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
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

interface GapHistogramChartProps {
  multiPairResults: MultiPairResults;
  width?: number;
  height?: number;
  mini?: boolean;
  responsive?: boolean; // For modal responsiveness
}

export const GapHistogramChart: React.FC<GapHistogramChartProps> = ({
  multiPairResults,
  width = 600,
  height = 400,
  mini = false,
  responsive = false
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

      // Calculate gap (difference between confidence interval bounds)
      pairResult.individual_results.forEach((result) => {
        const gap = Math.abs(result.confidence_interval[1] - result.confidence_interval[0]);
        sampleSizeGroups[sampleSize].push(gap);
      });
    });

    // If no sample sizes found, create default groups
    if (Object.keys(sampleSizeGroups).length === 0) {
      const allGaps = multiPairResults.pairs_results.flatMap(p =>
        p.individual_results.map(r => Math.abs(r.confidence_interval[1] - r.confidence_interval[0]))
      );

      // Create 4 groups with different sample sizes
      const groupSizes = [10, 30, 60, 100];
      groupSizes.forEach(size => {
        sampleSizeGroups[size] = allGaps.slice(0, size);
      });
    }

    // Create histogram bins for each sample size
    const sampleSizes = Object.keys(sampleSizeGroups)
      .map(Number)
      .sort((a, b) => a - b)
      .slice(0, 4); // Limit to 4 groups like blueprint

    const allGaps = sampleSizes.flatMap(size => sampleSizeGroups[size]);
    const minGap = Math.min(...allGaps);
    const maxGap = Math.max(...allGaps);
    const range = maxGap - minGap;
    const numBins = 30;
    const binWidth = range / numBins;

    const bins: Array<{
      binCenter: number;
      [key: string]: number;
    }> = [];

    for (let i = 0; i < numBins; i++) {
      const binStart = minGap + i * binWidth;
      const binEnd = minGap + (i + 1) * binWidth;
      const binCenter = (binStart + binEnd) / 2;

      const binData: any = { binCenter };

      sampleSizes.forEach((sampleSize, index) => {
        const gaps = sampleSizeGroups[sampleSize];
        const count = gaps.filter(gap => gap >= binStart && gap < binEnd).length;
        binData[`n${sampleSize}`] = count;
      });

      bins.push(binData);
    }

    return {
      bins,
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
          <span style={{ color: '#666', fontSize: '12px' }}>No gap data available</span>
        </div>
      );
    }
    return (
      <ChartContainer
        title="Gap Histograms"
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
          <span style={{ color: '#666' }}>No gap data available</span>
        </div>
      </ChartContainer>
    );
  }

  if (mini) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData.bins}
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
            domain={['dataMin', 'dataMax']}
            fontSize={10}
          />
          <YAxis fontSize={10} />
          <Tooltip
            formatter={(value: any, name: string) => [
              Number(value).toFixed(1),
              `n=${name.replace('n', '')}`
            ]}
            labelFormatter={(label) => `Gap: ${Number(label).toFixed(3)}`}
          />
          {chartData.sampleSizes.map((sampleSize, index) => {
            const colors = ['#ffffff', '#d3d3d3', '#a9a9a9', '#000000'];
            return (
              <Bar
                key={sampleSize}
                dataKey={`n${sampleSize}`}
                name={`n=${sampleSize}`}
                fill={colors[index % colors.length]}
                stroke="black"
                strokeWidth={0.5}
              />
            );
          })}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // Gray colors for different sample sizes (matching blueprint)
  const grayColors = ['#ffffff', '#d3d3d3', '#a9a9a9', '#000000'];

  return (
    <ChartContainer
      title="Gap Histograms by Sample Size"
      width={width}
      height={height}
      responsive={responsive}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData.bins}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="binCenter"
            type="number"
            domain={['dataMin', 'dataMax']}
            label={{ value: 'Gap Size', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            formatter={(value: any, name: string) => [
              Number(value).toFixed(1),
              `Sample Size ${name.replace('n', '')}`
            ]}
            labelFormatter={(label) => `Gap: ${Number(label).toFixed(3)}`}
          />
          <Legend />
          {chartData.sampleSizes.map((sampleSize, index) => (
            <Bar
              key={sampleSize}
              dataKey={`n${sampleSize}`}
              name={`n=${sampleSize}`}
              fill={grayColors[index % grayColors.length]}
              stroke="black"
              strokeWidth={0.5}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      {/* Summary */}
      <div style={{
        marginTop: '16px',
        padding: '8px',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Gap Summary by Sample Size:</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
          {chartData.sampleSizes.map((sampleSize, index) => {
            const gaps = chartData.sampleSizeGroups[sampleSize];
            const meanGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
            return (
              <div key={sampleSize}>
                <strong>n = {sampleSize}:</strong><br />
                Mean Gap: {meanGap.toFixed(3)}<br />
                Count: {gaps.length}
              </div>
            );
          })}
        </div>
      </div>
    </ChartContainer>
  );
};