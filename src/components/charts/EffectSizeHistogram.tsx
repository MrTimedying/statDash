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
import { useSimulationStore } from '../../stores/simulation.store';
import { calculateOptimalBins } from './utils/chart-utils';

interface EffectSizeHistogramProps {
  multiPairResults: MultiPairResults;
  effectSizeThresholds?: {
    negligible: number;
    small: number;
    medium: number;
    large: number;
  };
  width?: number;
  height?: number;
  showLegend?: boolean;
  mini?: boolean;
  responsive?: boolean; // For modal responsiveness
}

export const EffectSizeHistogram: React.FC<EffectSizeHistogramProps> = ({
  multiPairResults,
  effectSizeThresholds = {
    negligible: 0.2,
    small: 0.5,
    medium: 0.8,
    large: 1.2
  },
  width = 600,
  height = 400,
  showLegend = true,
  mini = false,
  responsive = false
}) => {
  const simulationStore = useSimulationStore();

  const chartData = useMemo((): {
    sampleSizes: Array<{
      sampleSize: number;
      bins: Array<{
        binStart: number;
        binEnd: number;
        binCenter: number;
        count: number;
        percentage: number;
        color: string;
      }>;
      summary: {
        totalCount: number;
        mean: number;
        median: number;
        std: number;
        min: number;
        max: number;
        ci95: [number, number];
        extremesGap: number;
      };
    }>;
  } | null => {
    if (!multiPairResults?.pairs_results?.length) return null;

    // Group results by sample size (assuming sample sizes are 10, 30, 60, 100 as in blueprint)
    const sampleSizeGroups: { [key: number]: number[] } = {};

    // Get sample sizes from simulation store
    const originalPairs = simulationStore.currentSession?.parameters.pairs || [];

    multiPairResults.pairs_results.forEach((pairResult) => {
      const originalPair = originalPairs.find(p => p.id === pairResult.pair_id);
      const sampleSize = originalPair?.sample_size_per_group || pairResult.individual_results.length;

      if (!sampleSizeGroups[sampleSize]) {
        sampleSizeGroups[sampleSize] = [];
      }

      pairResult.individual_results.forEach((result) => {
        sampleSizeGroups[sampleSize].push(result.effect_size);
      });
    });

    // If no sample sizes found, create default groups
    if (Object.keys(sampleSizeGroups).length === 0) {
      const allEffectSizes = multiPairResults.pairs_results.flatMap(p =>
        p.individual_results.map(r => r.effect_size)
      );

      // Create 4 groups with different sample sizes
      const groupSizes = [10, 30, 60, 100];
      groupSizes.forEach(size => {
        sampleSizeGroups[size] = allEffectSizes.slice(0, size);
      });
    }

    const sampleSizes = Object.keys(sampleSizeGroups)
      .map(Number)
      .sort((a, b) => a - b)
      .map(sampleSize => {
        const effectSizes = sampleSizeGroups[sampleSize];
        if (effectSizes.length === 0) return null;

        const minES = Math.min(...effectSizes);
        const maxES = Math.max(...effectSizes);
        const range = maxES - minES;
        const numBins = Math.min(calculateOptimalBins(effectSizes, 'sturges'), 30); // Cap at 30 bins

        const binWidth = range / numBins;
        const bins: Array<{
          binStart: number;
          binEnd: number;
          binCenter: number;
          count: number;
          percentage: number;
          color: string;
        }> = [];

        for (let i = 0; i < numBins; i++) {
          const binStart = minES + i * binWidth;
          const binEnd = minES + (i + 1) * binWidth;
          const binCenter = (binStart + binEnd) / 2;

          const count = effectSizes.filter(es => es >= binStart && es < binEnd).length;
          const percentage = (count / effectSizes.length) * 100;

          bins.push({
            binStart,
            binEnd,
            binCenter,
            count,
            percentage,
            color: '#f0f0f0' // Light gray for all bins
          });
        }

        // Calculate summary statistics
        const mean = effectSizes.reduce((sum, es) => sum + es, 0) / effectSizes.length;
        const sorted = [...effectSizes].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        const std = Math.sqrt(
          effectSizes.reduce((sum, es) => sum + Math.pow(es - mean, 2), 0) / effectSizes.length
        );

        // Calculate 95% CI (simplified)
        const ci95: [number, number] = [
          mean - 1.96 * std / Math.sqrt(effectSizes.length),
          mean + 1.96 * std / Math.sqrt(effectSizes.length)
        ];
        const extremesGap = ci95[1] - ci95[0];

        return {
          sampleSize,
          bins,
          summary: {
            totalCount: effectSizes.length,
            mean,
            median,
            std,
            min: minES,
            max: maxES,
            ci95,
            extremesGap
          }
        };
      })
      .filter(Boolean) as Array<{
        sampleSize: number;
        bins: Array<{
          binStart: number;
          binEnd: number;
          binCenter: number;
          count: number;
          percentage: number;
          color: string;
        }>;
        summary: {
          totalCount: number;
          mean: number;
          median: number;
          std: number;
          min: number;
          max: number;
          ci95: [number, number];
          extremesGap: number;
        };
      }>;

    return { sampleSizes };
  }, [multiPairResults, effectSizeThresholds]);

  const referenceLines = useMemo(() => {
    return [
      { value: effectSizeThresholds.negligible, label: 'Negligible', color: '#52c41a' },
      { value: effectSizeThresholds.small, label: 'Small', color: '#1890ff' },
      { value: effectSizeThresholds.medium, label: 'Medium', color: '#faad14' },
      { value: effectSizeThresholds.large, label: 'Large', color: '#ff4d4f' },
      { value: -effectSizeThresholds.negligible, label: '-Negligible', color: '#52c41a' },
      { value: -effectSizeThresholds.small, label: '-Small', color: '#1890ff' },
      { value: -effectSizeThresholds.medium, label: '-Medium', color: '#faad14' },
      { value: -effectSizeThresholds.large, label: '-Large', color: '#ff4d4f' }
    ];
  }, [effectSizeThresholds]);

  if (!chartData || !chartData.sampleSizes.length) {
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
          <span style={{ color: '#666', fontSize: '12px' }}>No effect size data available</span>
        </div>
      );
    }
    return (
      <ChartContainer
        title="Effect Size Distribution"
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
          <span style={{ color: '#666' }}>No effect size data available</span>
        </div>
      </ChartContainer>
    );
  }

  if (mini) {
    // For mini view, show the first sample size group
    const firstGroup = chartData.sampleSizes[0];
    if (!firstGroup) {
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
          data={firstGroup.bins}
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
            formatter={(value: any, name: string, props: any) => [
              `${Number(value).toFixed(1)} (${props.payload.percentage.toFixed(1)}%)`,
              'Count'
            ]}
            labelFormatter={(label) => `Effect Size: ${Number(label).toFixed(2)}`}
          />
          <Bar
            dataKey="count"
            name="Count"
            radius={[2, 2, 0, 0]}
          >
            {firstGroup.bins.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ChartContainer
      title="Effect Size Distribution by Sample Size"
      width={width}
      height={height}
      responsive={responsive}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '20px',
        padding: '20px'
      }}>
        {chartData.sampleSizes.map((sampleSizeData, index) => {
          const grayColors = ['#f0f0f0', '#d3d3d3', '#a9a9a9', '#000000'];
          const color = grayColors[index % grayColors.length];

          return (
            <div key={sampleSizeData.sampleSize} style={{ position: 'relative' }}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={sampleSizeData.bins}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 10,
                    bottom: 10,
                  }}
                >
                  <XAxis
                    dataKey="binCenter"
                    type="number"
                    domain={['dataMin', 'dataMax']}
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
                    labelFormatter={(label) => `Effect Size: ${Number(label).toFixed(2)}`}
                  />
                  <Bar
                    dataKey="count"
                    fill={color}
                    stroke="black"
                    strokeWidth={0.5}
                  />
                </BarChart>
              </ResponsiveContainer>

              {/* Text labels like in blueprint */}
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                fontSize: '10px',
                color: 'black',
                backgroundColor: 'white',
                padding: '2px 4px',
                borderRadius: '2px'
              }}>
                {`CI 95%:(${sampleSizeData.summary.ci95[0].toFixed(2)}, ${sampleSizeData.summary.ci95[1].toFixed(2)})`}
                <br />
                {`Extremes gap: ${sampleSizeData.summary.extremesGap.toFixed(2)}`}
              </div>

              {/* Sample size label */}
              <div style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
                fontSize: '12px',
                fontWeight: 'bold',
                color: 'black'
              }}>
                n = {sampleSizeData.sampleSize}
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall Summary */}
      <div style={{
        marginTop: '16px',
        padding: '8px',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Overall Summary:</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
          {chartData.sampleSizes.map((sampleSizeData, index) => (
            <div key={sampleSizeData.sampleSize}>
              <strong>n = {sampleSizeData.sampleSize}:</strong><br />
              Mean: {sampleSizeData.summary.mean.toFixed(3)}<br />
              N: {sampleSizeData.summary.totalCount}
            </div>
          ))}
        </div>
      </div>
    </ChartContainer>
  );
};