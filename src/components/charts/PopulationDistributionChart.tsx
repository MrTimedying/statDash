import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { ChartContainer } from './base/ChartContainer';
import { MultiPairResults } from '../../types/simulation.types';
import { useSimulationStore } from '../../stores/simulation.store';

interface PopulationDistributionChartProps {
  multiPairResults: MultiPairResults;
  width?: number;
  height?: number;
  mini?: boolean;
  responsive?: boolean; // For modal responsiveness
}

export const PopulationDistributionChart: React.FC<PopulationDistributionChartProps> = ({
  multiPairResults,
  width = 600,
  height = 400,
  mini = false,
  responsive = false
}) => {
  const simulationStore = useSimulationStore();

  const chartData = useMemo(() => {
    if (!multiPairResults?.pairs_results?.length) return null;

    // Get the first pair for demonstration
    const firstPair = multiPairResults.pairs_results[0];
    const originalPairs = simulationStore.currentSession?.parameters.pairs || [];
    const originalPair = originalPairs.find(p => p.id === firstPair.pair_id);

    if (!originalPair) return null;

    const { group1, group2 } = originalPair;

    // Generate sample data from the population parameters
    const sampleSize = 1000;
    const group1Data: number[] = [];
    const group2Data: number[] = [];

    // Generate normal distribution samples
    for (let i = 0; i < sampleSize; i++) {
      // Box-Muller transform for normal distribution
      const u1 = Math.random();
      const u2 = Math.random();
      const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);

      group1Data.push(group1.mean + z1 * group1.std);
      group2Data.push(group2.mean + z2 * group2.std);
    }

    // Create histogram bins
    const minVal = Math.min(...group1Data, ...group2Data);
    const maxVal = Math.max(...group1Data, ...group2Data);
    const range = maxVal - minVal;
    const numBins = 30;
    const binWidth = range / numBins;

    const bins: Array<{
      binCenter: number;
      group1Count: number;
      group2Count: number;
      group1Percentage: number;
      group2Percentage: number;
    }> = [];

    for (let i = 0; i < numBins; i++) {
      const binStart = minVal + i * binWidth;
      const binEnd = minVal + (i + 1) * binWidth;
      const binCenter = (binStart + binEnd) / 2;

      const group1Count = group1Data.filter(val => val >= binStart && val < binEnd).length;
      const group2Count = group2Data.filter(val => val >= binStart && val < binEnd).length;

      bins.push({
        binCenter,
        group1Count,
        group2Count,
        group1Percentage: (group1Count / sampleSize) * 100,
        group2Percentage: (group2Count / sampleSize) * 100
      });
    }

    return {
      bins,
      group1Mean: group1.mean,
      group2Mean: group2.mean,
      sampleSize
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
          <span style={{ color: '#666', fontSize: '12px' }}>No population data available</span>
        </div>
      );
    }
    return (
      <ChartContainer
        title="Population Distribution"
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
          <span style={{ color: '#666' }}>No population data available</span>
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
              name === 'group1Count' ? 'Population A' : 'Population B'
            ]}
            labelFormatter={(label) => `Value: ${Number(label).toFixed(2)}`}
          />
          <Bar
            dataKey="group1Count"
            name="Population A"
            fill="lightgray"
            opacity={0.7}
          />
          <Bar
            dataKey="group2Count"
            name="Population B"
            fill="crimson"
            opacity={0.7}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ChartContainer
      title="Population Distributions"
      width={width}
      height={height}
      responsive={responsive}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData.bins}
            margin={{
              top: 40,
              right: 30,
              left: 20,
              bottom: 40,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
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
              formatter={(value: any, name: string) => [
                Number(value).toFixed(1),
                name === 'group1Count' ? 'Population A' : 'Population B'
              ]}
              labelFormatter={(label) => `Value: ${Number(label).toFixed(2)}`}
            />
            <ReferenceLine
              x={0}
              stroke="black"
              strokeWidth={1}
            />
            <ReferenceLine
              x={chartData.group1Mean}
              stroke="black"
              strokeDasharray="5 5"
              strokeWidth={1}
            />
            <Bar
              dataKey="group1Count"
              name="Population A"
              fill="lightgray"
              stroke="black"
              strokeWidth={1}
            />
            <Bar
              dataKey="group2Count"
              name="Population B"
              fill="crimson"
              stroke="black"
              strokeWidth={0.5}
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Text labels like in blueprint */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '20px',
          fontSize: '12px',
          color: 'black',
          backgroundColor: 'white',
          padding: '2px 4px',
          borderRadius: '2px',
          zIndex: 10
        }}>
          Population A: Gray<br />
          Population B: Red
        </div>

        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '20px',
          fontSize: '12px',
          color: 'black',
          backgroundColor: 'white',
          padding: '2px 4px',
          borderRadius: '2px',
          zIndex: 10
        }}>
          0
        </div>

        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '12px',
          color: 'crimson',
          backgroundColor: 'white',
          padding: '2px 4px',
          borderRadius: '2px',
          zIndex: 10
        }}>
          0.5
        </div>
      </div>

      {/* Summary */}
      <div style={{
        marginTop: '16px',
        padding: '8px',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Population Summary:</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
          <div><strong>Population A Mean:</strong> {chartData.group1Mean.toFixed(2)}</div>
          <div><strong>Population B Mean:</strong> {chartData.group2Mean.toFixed(2)}</div>
          <div><strong>Sample Size:</strong> {chartData.sampleSize}</div>
        </div>
      </div>
    </ChartContainer>
  );
};