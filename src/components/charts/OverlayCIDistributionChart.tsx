import React, { useMemo } from 'react';
import {
  ComposedChart,
  Line,
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

interface OverlayCIDistributionChartProps {
  multiPairResults: MultiPairResults;
  significanceLevels: number[];
  width?: number;
  height?: number;
  showLegend?: boolean;
  mini?: boolean;
}

export const OverlayCIDistributionChart: React.FC<OverlayCIDistributionChartProps> = ({
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

      // Calculate y-values for each pair's distribution
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

    // Add CI data to the first data point (for overlay)
    if (dataPoints.length > 0 && validPairs.length > 0) {
      const firstPoint = dataPoints[0];

      validPairs.forEach(({ pairResult }) => {
        // Calculate average confidence interval
        const ciData = pairResult.individual_results.map((r: any) => ({
          lower: r.confidence_interval[0],
          upper: r.confidence_interval[1],
          center: (r.confidence_interval[0] + r.confidence_interval[1]) / 2
        }));

        const avgLower = ciData.reduce((sum: number, ci: any) => sum + ci.lower, 0) / ciData.length;
        const avgUpper = ciData.reduce((sum: number, ci: any) => sum + ci.upper, 0) / ciData.length;
        const avgCenter = (avgLower + avgUpper) / 2;

        // Determine significance
        const isSignificant = avgLower > 0 || avgUpper < 0;

        firstPoint[`${pairResult.pair_name}_ci_center`] = avgCenter;
        firstPoint[`${pairResult.pair_name}_ci_error`] = [avgCenter - avgLower, avgUpper - avgCenter];
        firstPoint[`${pairResult.pair_name}_significant`] = isSignificant;
      });
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

  const ciBars = useMemo(() => {
    if (!multiPairResults?.pairs_results?.length) return [];

    const barConfigs: any[] = [];
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff'];

    multiPairResults.pairs_results.forEach((pairResult, pairIndex) => {
      const color = colors[pairIndex % colors.length];

      barConfigs.push({
        dataKey: `${pairResult.pair_name}_ci_center`,
        fill: color,
        name: `${pairResult.pair_name} CI`,
        errorDataKey: `${pairResult.pair_name}_ci_error`
      });
    });

    return barConfigs;
  }, [multiPairResults]);

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
          <span style={{ color: '#666', fontSize: '12px' }}>No overlay data available</span>
        </div>
      );
    }
    return (
      <ChartContainer
        title="CI + Distribution Overlay"
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
          <span style={{ color: '#666' }}>No overlay data available</span>
        </div>
      </ChartContainer>
    );
  }

  if (mini) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
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
          />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip
            formatter={(value: any, name: string) => [
              Number(value).toFixed(3),
              name
            ]}
            labelFormatter={(label) => `Value: ${label}`}
          />
          {lines.map((line, index) => (
            <Line
              key={index}
              yAxisId="left"
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.stroke}
              strokeWidth={line.strokeWidth}
              name={line.name}
              dot={false}
            />
          ))}
          {ciBars.map((bar, index) => (
            <Bar
              key={index}
              yAxisId="right"
              dataKey={bar.dataKey}
              fill={bar.fill}
              name={bar.name}
              barSize={20}
            >
              <ErrorBar
                dataKey={bar.errorDataKey}
                width={4}
                strokeWidth={2}
                stroke="#666"
              />
            </Bar>
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ChartContainer
      title="Confidence Intervals + Distribution Curves"
      width={width}
      height={height}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{
            top: 20,
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
            yAxisId="left"
            label={{ value: 'Probability Density', angle: -90, position: 'insideLeft' }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{ value: 'Effect Size', angle: 90, position: 'insideRight' }}
          />
          <Tooltip
            formatter={(value: any, name: string) => [
              Number(value).toFixed(3),
              name
            ]}
            labelFormatter={(label) => `Value: ${label}`}
          />
          {showLegend && <Legend />}
          {lines.map((line, index) => (
            <Line
              key={index}
              yAxisId="left"
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.stroke}
              strokeWidth={line.strokeWidth}
              name={line.name}
              dot={false}
            />
          ))}
          {ciBars.map((bar, index) => (
            <Bar
              key={index}
              yAxisId="right"
              dataKey={bar.dataKey}
              fill={bar.fill}
              name={bar.name}
              barSize={30}
            >
              <ErrorBar
                dataKey={bar.errorDataKey}
                width={6}
                strokeWidth={2}
                stroke="#666"
              />
            </Bar>
          ))}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Chart Explanation */}
      <div style={{
        marginTop: '16px',
        padding: '8px',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Chart Explanation:</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <div>• <strong>Lines:</strong> Sample distribution curves</div>
          <div>• <strong>Bars:</strong> Confidence intervals for effect sizes</div>
          <div>• <strong>Error bars:</strong> CI width and significance</div>
        </div>
      </div>
    </ChartContainer>
  );
};