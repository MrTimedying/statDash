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

interface DistributionCurveChartProps {
  multiPairResults: MultiPairResults;
  width?: number;
  height?: number;
}

export const DistributionCurveChart: React.FC<DistributionCurveChartProps> = ({
  multiPairResults,
  width = 600,
  height = 400
}) => {
  const simulationStore = useSimulationStore();

  const chartData = useMemo(() => {
    if (!multiPairResults?.pairs_results?.length) return [];

    // Get original pair parameters from simulation store
    const originalPairs = simulationStore.currentSession?.parameters.pairs || [];

    // Calculate the overall plotting range across all pairs
    let plotMin = Infinity;
    let plotMax = -Infinity;

    const validPairs: Array<{pairResult: any, originalPair: any}> = [];

    multiPairResults.pairs_results.forEach((pairResult) => {
      const originalPair = originalPairs.find(p => p.id === pairResult.pair_id);
      if (originalPair) {
        const { group1, group2 } = originalPair;
        const group1Min = group1.mean - 3 * group1.std;
        const group1Max = group1.mean + 3 * group1.std;
        const group2Min = group2.mean - 3 * group2.std;
        const group2Max = group2.mean + 3 * group2.std;

        plotMin = Math.min(plotMin, group1Min, group2Min);
        plotMax = Math.max(plotMax, group1Max, group2Max);

        validPairs.push({ pairResult, originalPair });
      }
    });

    if (validPairs.length === 0) return [];

    const plotRange = plotMax - plotMin;
    const maxPoints = 100; // Number of points to plot
    const dataPoints: any[] = [];

    // Generate data points for all pairs
    for (let i = 0; i < maxPoints; i++) {
      const x = plotMin + (i / (maxPoints - 1)) * plotRange;
      const dataPoint: any = { x: Number(x.toFixed(2)) };

      // Calculate y-values for each pair
      validPairs.forEach(({ pairResult, originalPair }) => {
        const { group1, group2 } = originalPair;

        // Normal distribution formula: (1/(σ√(2π))) * exp(-0.5 * ((x-μ)/σ)²)
        const y1 = (1 / (group1.std * Math.sqrt(2 * Math.PI))) *
                  Math.exp(-0.5 * Math.pow((x - group1.mean) / group1.std, 2));

        const y2 = (1 / (group2.std * Math.sqrt(2 * Math.PI))) *
                  Math.exp(-0.5 * Math.pow((x - group2.mean) / group2.std, 2));

        dataPoint[`${pairResult.pair_name}_g1`] = y1;
        dataPoint[`${pairResult.pair_name}_g2`] = y2;
      });

      dataPoints.push(dataPoint);
    }

    return dataPoints;
  }, [multiPairResults, simulationStore.currentSession?.parameters.pairs]);

  const lines = useMemo(() => {
    if (!multiPairResults?.pairs_results?.length) return [];

    const lineConfigs: any[] = [];
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff'];

    multiPairResults.pairs_results.forEach((pairResult, pairIndex) => {
      const color1 = colors[pairIndex * 2 % colors.length];
      const color2 = colors[(pairIndex * 2 + 1) % colors.length];

      lineConfigs.push(
        {
          dataKey: `${pairResult.pair_name}_g1`,
          stroke: color1,
          strokeWidth: 2,
          name: `${pairResult.pair_name} - Group 1`
        },
        {
          dataKey: `${pairResult.pair_name}_g2`,
          stroke: color2,
          strokeWidth: 2,
          name: `${pairResult.pair_name} - Group 2`
        }
      );
    });

    return lineConfigs;
  }, [multiPairResults]);

  if (!chartData.length) {
    return (
      <ChartContainer
        title="Sample Distribution Curves"
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
          <span style={{ color: '#666' }}>
            {!simulationStore.currentSession?.parameters.pairs?.length
              ? 'No pair parameters available'
              : 'No distribution data available'
            }
          </span>
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer
      title="Sample Distribution Curves"
      width={width}
      height={height}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="x"
            type="number"
            domain={['dataMin', 'dataMax']}
            label={{ value: 'Sample Value', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            label={{ value: 'Probability Density', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            formatter={(value: any, name: string) => [
              Number(value).toFixed(3),
              name
            ]}
            labelFormatter={(label) => `Value: ${label}`}
          />
          <Legend />
          {lines.map((line, index) => (
            <Line
              key={index}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.stroke}
              strokeWidth={line.strokeWidth}
              name={line.name}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};