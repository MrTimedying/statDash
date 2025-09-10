import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { ChartContainer } from './base/ChartContainer';
import { MultiPairResults } from '../../types/simulation.types';
import { useSimulationStore } from '../../stores/simulation.store';

interface PairDistributionChartProps {
  multiPairResults: MultiPairResults;
  pairId: string;
  width?: number;
  height?: number;
  showFill?: boolean; // Whether to show filled area under curve
  showLegend?: boolean;
  mini?: boolean;
}

export const PairDistributionChart: React.FC<PairDistributionChartProps> = ({
  multiPairResults,
  pairId,
  width = 600,
  height = 400,
  showFill = true,
  showLegend = true,
  mini = false
}) => {
  const simulationStore = useSimulationStore();

  const chartData = useMemo(() => {
    if (!multiPairResults?.pairs_results?.length) return [];

    // Get original pair parameters from simulation store
    const originalPairs = simulationStore.currentSession?.parameters.pairs || [];

    // Find the specific pair
    const pairResult = multiPairResults.pairs_results.find(p => p.pair_id === pairId);
    const originalPair = originalPairs.find(p => p.id === pairId);

    if (!pairResult || !originalPair) return [];

    const { group1, group2 } = originalPair;

    // Calculate the range for plotting (mean ± 3*std for each group)
    const group1Min = group1.mean - 3 * group1.std;
    const group1Max = group1.mean + 3 * group1.std;
    const group2Min = group2.mean - 3 * group2.std;
    const group2Max = group2.mean + 3 * group2.std;

    const plotMin = Math.min(group1Min, group2Min);
    const plotMax = Math.max(group1Max, group2Max);
    const plotRange = plotMax - plotMin;
    const maxPoints = 100; // Number of points to plot
    const dataPoints: any[] = [];

    // Generate curve data points using normal distribution formula
    for (let i = 0; i < maxPoints; i++) {
      const x = plotMin + (i / (maxPoints - 1)) * plotRange;

      // Normal distribution formula: (1/(σ√(2π))) * exp(-0.5 * ((x-μ)/σ)²)
      const y1 = (1 / (group1.std * Math.sqrt(2 * Math.PI))) *
                Math.exp(-0.5 * Math.pow((x - group1.mean) / group1.std, 2));

      const y2 = (1 / (group2.std * Math.sqrt(2 * Math.PI))) *
                Math.exp(-0.5 * Math.pow((x - group2.mean) / group2.std, 2));

      dataPoints.push({
        x: Number(x.toFixed(2)),
        g1: y1,
        g2: y2
      });
    }

    return dataPoints;
  }, [multiPairResults, pairId, simulationStore.currentSession?.parameters.pairs]);

  const lines = useMemo(() => {
    if (!multiPairResults?.pairs_results?.length) return [];

    const pairResult = multiPairResults.pairs_results.find(p => p.pair_id === pairId);
    if (!pairResult) return [];

    const colors = ['#8884d8', '#82ca9d'];

    return [
      {
        dataKey: 'g1',
        stroke: colors[0],
        strokeWidth: 2,
        name: `${pairResult.pair_name} - Group 1`,
        fill: showFill ? colors[0] : undefined,
        fillOpacity: showFill ? 0.3 : undefined
      },
      {
        dataKey: 'g2',
        stroke: colors[1],
        strokeWidth: 2,
        name: `${pairResult.pair_name} - Group 2`,
        fill: showFill ? colors[1] : undefined,
        fillOpacity: showFill ? 0.3 : undefined
      }
    ];
  }, [multiPairResults, pairId, showFill]);

  const originalPair = useMemo(() => {
    const originalPairs = simulationStore.currentSession?.parameters.pairs || [];
    return originalPairs.find(p => p.id === pairId);
  }, [pairId, simulationStore.currentSession?.parameters.pairs]);

  if (!chartData.length || !originalPair) {
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
          <span style={{ color: '#666', fontSize: '12px' }}>No distribution data available</span>
        </div>
      );
    }
    return (
      <ChartContainer
        title="Distribution Curve"
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
          <span style={{ color: '#666' }}>No distribution data available</span>
        </div>
      </ChartContainer>
    );
  }

  if (mini) {
    const ChartComponent = showFill ? AreaChart : LineChart;
    return (
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent
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
            dataKey="x"
            type="number"
            domain={['dataMin', 'dataMax']}
            fontSize={10}
          />
          <YAxis fontSize={10} />
          <Tooltip
            formatter={(value: any, name: string) => [
              Number(value).toFixed(4),
              name
            ]}
            labelFormatter={(label) => `Value: ${label}`}
          />
          {lines.map((line, index) => (
            showFill ? (
              <Area
                key={index}
                type="monotone"
                dataKey={line.dataKey}
                stroke={line.stroke}
                strokeWidth={line.strokeWidth}
                name={line.name}
                fill={line.fill}
                fillOpacity={line.fillOpacity}
              />
            ) : (
              <Line
                key={index}
                type="monotone"
                dataKey={line.dataKey}
                stroke={line.stroke}
                strokeWidth={line.strokeWidth}
                name={line.name}
                dot={false}
              />
            )
          ))}
        </ChartComponent>
      </ResponsiveContainer>
    );
  }

  const ChartComponent = showFill ? AreaChart : LineChart;

  return (
    <ChartContainer
      title={`${originalPair.name} Distribution Curves`}
      width={width}
      height={height}
    >
      <div style={{ fontSize: '12px', marginBottom: '8px', color: '#666' }}>
        Group 1: μ={originalPair.group1.mean}, σ={originalPair.group1.std} | {' '}
        Group 2: μ={originalPair.group2.mean}, σ={originalPair.group2.std}
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent
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
              Number(value).toFixed(4),
              name
            ]}
            labelFormatter={(label) => `Value: ${label}`}
          />
          {showLegend && <Legend />}
          {lines.map((line, index) => (
            showFill ? (
              <Area
                key={index}
                type="monotone"
                dataKey={line.dataKey}
                stroke={line.stroke}
                strokeWidth={line.strokeWidth}
                name={line.name}
                fill={line.fill}
                fillOpacity={line.fillOpacity}
              />
            ) : (
              <Line
                key={index}
                type="monotone"
                dataKey={line.dataKey}
                stroke={line.stroke}
                strokeWidth={line.strokeWidth}
                name={line.name}
                dot={false}
              />
            )
          ))}
        </ChartComponent>
      </ResponsiveContainer>
    </ChartContainer>
  );
};