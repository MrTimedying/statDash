import React, { useMemo, useRef, useEffect, useState } from 'react';
import embed from 'vega-embed';
import { MultiPairResults, SamplePair } from '../../types/simulation.types';
import * as jStat from 'jstat';

interface GardnerAltmanEstimationPlotProps {
  multiPairResults: MultiPairResults;
  significanceLevels: number[];
  pairs: SamplePair[]; // Add pairs to access population parameters
  currentPairIndex?: number;
  width?: number;
  height?: number;
}

export const GardnerAltmanEstimationPlot: React.FC<GardnerAltmanEstimationPlotProps> = ({
  multiPairResults,
  significanceLevels,
  pairs,
  currentPairIndex = 0,
  width = 450,
  height = 320
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  // Generate sample data for visualization
  const sampleData = useMemo(() => {
    if (!pairs?.length || currentPairIndex >= pairs.length) return [];

    const currentPair = pairs[currentPairIndex];
    const sampleSize = currentPair.sample_size_per_group;

    // Generate sample data from population parameters
    const group1Data = Array.from({ length: sampleSize }, () =>
      (jStat as any).normal.sample(currentPair.group1.mean, currentPair.group1.std)
    );

    const group2Data = Array.from({ length: sampleSize }, () =>
      (jStat as any).normal.sample(currentPair.group2.mean, currentPair.group2.std)
    );

    // Create data points for visualization
    const dataPoints: Array<{
      comparison: string;
      value: number;
      index: number;
      group: string;
      type?: 'individual' | 'mean';
      ciLower?: number;
      ciUpper?: number;
    }> = [];

    // Calculate means and confidence intervals
    const g1Mean = (jStat as any).mean(group1Data);
    const g2Mean = (jStat as any).mean(group2Data);
    const diffData = group1Data.map((g1, i) => g1 - group2Data[i]);
    const diffMean = (jStat as any).mean(diffData);

    // Calculate standard errors and confidence intervals
    const g1Std = Math.sqrt((jStat as any).variance(group1Data, true));
    const g2Std = Math.sqrt((jStat as any).variance(group2Data, true));
    const diffStd = Math.sqrt((jStat as any).variance(diffData, true));

    const g1SE = g1Std / Math.sqrt(group1Data.length);
    const g2SE = g2Std / Math.sqrt(group2Data.length);
    const diffSE = diffStd / Math.sqrt(diffData.length);

    const tValue = 1.96; // 95% CI
    const g1CI = [g1Mean - tValue * g1SE, g1Mean + tValue * g1SE];
    const g2CI = [g2Mean - tValue * g2SE, g2Mean + tValue * g2SE];
    const diffCI = [diffMean - tValue * diffSE, diffMean + tValue * diffSE];

    // Add Group 1 data points
    group1Data.forEach((value, index) => {
      dataPoints.push({
        comparison: 'Group 1',
        value: value,
        index: index,
        group: 'g1',
        type: 'individual'
      });
    });

    // Add Group 2 data points
    group2Data.forEach((value, index) => {
      dataPoints.push({
        comparison: 'Group 2',
        value: value,
        index: index,
        group: 'g2',
        type: 'individual'
      });
    });

    // Add difference data points (g1 - g2 for each pair)
    diffData.forEach((value, index) => {
      dataPoints.push({
        comparison: 'Difference',
        value: value,
        index: index,
        group: 'diff',
        type: 'individual'
      });
    });

    // Add mean points with error bars
    dataPoints.push({
      comparison: 'Group 1',
      value: g1Mean,
      index: -1,
      group: 'g1',
      type: 'mean',
      ciLower: g1CI[0],
      ciUpper: g1CI[1]
    });

    dataPoints.push({
      comparison: 'Group 2',
      value: g2Mean,
      index: -1,
      group: 'g2',
      type: 'mean',
      ciLower: g2CI[0],
      ciUpper: g2CI[1]
    });

    dataPoints.push({
      comparison: 'Difference',
      value: diffMean,
      index: -1,
      group: 'diff',
      type: 'mean',
      ciLower: diffCI[0],
      ciUpper: diffCI[1]
    });

    return dataPoints;
  }, [pairs, currentPairIndex]);

  const spec = useMemo(() => ({
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: 'container' as const,
    height: 'container' as const,
    autosize: {
      type: 'fit' as const,
      contains: 'padding' as const,
      resize: true
    },
    data: { values: sampleData },
    layer: [
      // Individual data points
      {
        mark: { type: 'point' as const, filled: true, size: 40, opacity: 0.6 },
        encoding: {
          x: {
            field: 'comparison',
            type: 'nominal' as const,
            title: 'Comparison',
            axis: { labelAngle: 0 },
            sort: ['Group 1', 'Group 2', 'Difference']
          },
          y: {
            field: 'value',
            type: 'quantitative' as const,
            title: 'Individual Values'
          },
          color: {
            field: 'comparison',
            type: 'nominal' as const,
            scale: {
              type: 'ordinal',
              domain: ['Group 1', 'Group 2', 'Difference'],
              range: ['#007bff', '#28a745', '#dc3545']
            },
            legend: { title: 'Comparison Type' }
          }
        },
        transform: [{ filter: 'datum.type == "individual"' }]
      },
      // Error bars for means (drawn first so they appear behind)
      {
        mark: {
          type: 'errorbar' as const,
          color: '#333',
          opacity: 0.8,
          thickness: 2,
          ticks: { size: 4 } // Short ticks (4 pixels) at the ends of error bars
        },
        encoding: {
          x: {
            field: 'comparison',
            type: 'nominal' as const,
            sort: ['Group 1', 'Group 2', 'Difference']
          },
          y: {
            field: 'ciLower',
            type: 'quantitative' as const
          },
          y2: {
            field: 'ciUpper',
            type: 'quantitative' as const
          }
        },
        transform: [{ filter: 'datum.type == "mean"' }]
      },
      // Mean points with error bars (drawn on top with black border)
      {
        mark: {
          type: 'point' as const,
          filled: true,
          size: 150, // Slightly larger for prominence
          shape: 'diamond',
          stroke: '#000000', // Black border
          strokeWidth: 2 // Border thickness
        },
        encoding: {
          x: {
            field: 'comparison',
            type: 'nominal' as const,
            sort: ['Group 1', 'Group 2', 'Difference']
          },
          y: {
            field: 'value',
            type: 'quantitative' as const
          },
          color: {
            field: 'comparison',
            type: 'nominal' as const,
            scale: {
              domain: ['Group 1', 'Group 2', 'Difference'],
              range: ['#0056b3', '#1e7e34', '#bd2130'] // Darker colors for means
            }
          }
        },
        transform: [{ filter: 'datum.type == "mean"' }]
      }
    ],
    config: {
      axis: {
        labelFontSize: 12,
        titleFontSize: 14,
        grid: true,
        gridColor: '#e9ecef',
        gridDash: [2, 2], // Dotted grid lines
        gridOpacity: 0.5
      },
      background: '#ffffff',
      padding: { left: 60, top: 20, right: 20, bottom: 60 }
    }
  }), [sampleData]);

  useEffect(() => {
    if (chartRef.current && sampleData.length > 0) {
      embed(chartRef.current, spec, {
        mode: 'vega-lite',
        renderer: 'svg',
        actions: false,
        config: {
          autosize: {
            type: 'fit',
            contains: 'padding',
            resize: true
          }
        }
      }).then((result) => {
        // Add ResizeObserver to force chart resize when container changes
        const resizeObserver = new ResizeObserver(() => {
          if (result && result.view) {
            result.view.resize();
          }
        });
        
        if (chartRef.current) {
          resizeObserver.observe(chartRef.current);
        }
        
        // Store observer for cleanup
        (chartRef.current as any).__resizeObserver = resizeObserver;
      });
    }

    // Cleanup function
    return () => {
      if (chartRef.current && (chartRef.current as any).__resizeObserver) {
        (chartRef.current as any).__resizeObserver.disconnect();
        delete (chartRef.current as any).__resizeObserver;
      }
    };
  }, [spec, sampleData]);

  if (!sampleData.length) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9f9f9'
      }}>
        <span style={{ color: '#666' }}>No estimation data available</span>
      </div>
    );
  }



  return (
    <div
      ref={chartRef}
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  );
};