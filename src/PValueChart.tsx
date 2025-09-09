import React from 'react';

interface SimulationResult {
  p_value: number;
  effect_size: number;
  confidence_interval: [number, number];
  s_value: number;
  significant: boolean;
}

interface HistogramBin {
  bin_start: number;
  bin_end: number;
  count: number;
  significant: boolean;
}

interface AggregatedResults {
  individual_results: SimulationResult[];
  p_value_histogram: HistogramBin[];
  significant_count: number;
  total_count: number;
  mean_effect_size: number;
  effect_size_ci: [number, number];
  ci_coverage: number;
  mean_ci_width: number;
}

interface PValueChartProps {
  data: AggregatedResults;
}

const PValueChart: React.FC<PValueChartProps> = ({ data }) => {
  const maxCount = Math.max(...data.p_value_histogram.map(bin => bin.count));

  return (
    <div className="pvalue-chart">
      <h3>P-Value Distribution Histogram</h3>
      
      <div className="histogram-container" style={{ 
        padding: '20px', 
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '4px'
      }}>
        <div className="histogram-bars" style={{ 
          display: 'flex', 
          alignItems: 'flex-end', 
          height: '200px',
          marginBottom: '20px',
          position: 'relative'
        }}>
          {data.p_value_histogram.map((bin, index) => {
            const height = (bin.count / maxCount) * 180;
            const isSignificant = bin.significant;
            
            return (
              <div
                key={index}
                style={{
                  flex: 1,
                  height: `${height}px`,
                  backgroundColor: isSignificant ? '#f44336' : '#2196f3',
                  margin: '0 1px',
                  position: 'relative',
                  cursor: 'pointer'
                }}
                title={`Range: ${bin.bin_start.toFixed(3)} - ${bin.bin_end.toFixed(3)}\nCount: ${bin.count}\n${isSignificant ? 'Significant' : 'Not Significant'}`}
              >
                <div style={{
                  position: 'absolute',
                  top: '-25px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '10px',
                  color: '#666'
                }}>
                  {bin.count > 0 ? bin.count : ''}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="x-axis" style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#666'
        }}>
          <span>0.0</span>
          <span>0.2</span>
          <span>0.4</span>
          <span>0.6</span>
          <span>0.8</span>
          <span>1.0</span>
        </div>
        
        <div className="x-axis-label" style={{ 
          textAlign: 'center', 
          marginTop: '10px',
          fontWeight: 'bold'
        }}>
          P-Value
        </div>
      </div>
      
      <div className="legend" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '20px',
        marginTop: '15px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ 
            width: '16px', 
            height: '16px', 
            backgroundColor: '#f44336' 
          }}></div>
          <span>Significant (p &lt; α)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ 
            width: '16px', 
            height: '16px', 
            backgroundColor: '#2196f3' 
          }}></div>
          <span>Not Significant (p ≥ α)</span>
        </div>
      </div>
    </div>
  );
};

export default PValueChart;