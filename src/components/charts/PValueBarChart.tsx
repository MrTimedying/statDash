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
  significanceLevels: number[];
  width?: number;
  height?: number;
  showLegend?: boolean;
  mini?: boolean;
}

export const PValueBarChart: React.FC<PValueBarChartProps> = ({
  multiPairResults,
  significanceLevels,
  width = 600,
  height = 400,
  showLegend = true,
  mini = false
}) => {
  const chartData = useMemo(() => {
    if (!multiPairResults?.pairs_results?.length) return [];

    return multiPairResults.pairs_results.map((pairResult) => {
      // Calculate average p-value for the pair
      const pValues = pairResult.individual_results.map(r => r.p_value);
      const avgPValue = pValues.reduce((sum, p) => sum + p, 0) / pValues.length;

      // Determine significance level
      let significanceLevel = 'Not Significant';
      let color = '#52c41a'; // Green for not significant

      for (const threshold of significanceLevels.sort((a, b) => b - a)) {
        if (avgPValue <= threshold) {
          significanceLevel = `α ≤ ${threshold}`;
          if (threshold <= 0.01) color = '#ff4d4f'; // Red for very significant
          else if (threshold <= 0.05) color = '#faad14'; // Orange for significant
          else color = '#1890ff'; // Blue for moderately significant
          break;
        }
      }

      return {
        pair: pairResult.pair_name,
        pValue: avgPValue,
        significance: significanceLevel,
        color: color,
        count: pairResult.individual_results.length
      };
    });
  }, [multiPairResults, significanceLevels]);

  const significanceReferenceLines = useMemo(() => {
    return significanceLevels.map((threshold, index) => (
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
          <YAxis
            domain={[0, 1]}
            fontSize={10}
          />
          <Tooltip
            formatter={(value: any, name: string, props: any) => [
              `${Number(value).toFixed(4)} (${props.payload.significance})`,
              'P-Value'
            ]}
            labelFormatter={(label) => `Pair: ${label}`}
          />
          <Bar
            dataKey="pValue"
            name="P-Value"
            radius={[2, 2, 0, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ChartContainer
      title="P-Value Distribution with Significance Thresholds"
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
            domain={[0, 1]}
            label={{ value: 'P-Value', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            formatter={(value: any, name: string, props: any) => [
              `${Number(value).toFixed(4)} (${props.payload.significance})`,
              'P-Value'
            ]}
            labelFormatter={(label) => `Pair: ${label}`}
          />
          {showLegend && <Legend />}
          {significanceReferenceLines}
          <Bar
            dataKey="pValue"
            name="P-Value"
            radius={[4, 4, 0, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
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
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Significance Levels:</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {significanceLevels.map((threshold, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: threshold <= 0.01 ? '#ff4d4f' :
                    threshold <= 0.05 ? '#faad14' : '#1890ff',
                  borderRadius: '2px'
                }}
              />
              <span>α ≤ {threshold}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: '#52c41a',
                borderRadius: '2px'
              }}
            />
            <span>Not Significant</span>
          </div>
        </div>
      </div>
    </ChartContainer>
  );
};