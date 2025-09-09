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

interface CIChartProps {
  data: AggregatedResults;
}

const CIChart: React.FC<CIChartProps> = ({ data }) => {
  // Take first 20 results for visualization to avoid overcrowding
  const displayResults = data.individual_results.slice(0, 20);
  
  // Find the range of effect sizes and CIs for scaling
  const allValues = displayResults.flatMap(result => [
    result.effect_size,
    result.confidence_interval[0],
    result.confidence_interval[1]
  ]);
  
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const range = maxValue - minValue;
  const padding = range * 0.1;
  const chartMin = minValue - padding;
  const chartMax = maxValue + padding;
  const chartRange = chartMax - chartMin;

  return (
    <div className="ci-chart">
      <h3>Confidence Interval Explorer</h3>
      <p>Showing the "dance" of confidence intervals across {displayResults.length} simulations</p>
      
      <div className="ci-plot-container" style={{ 
        padding: '20px', 
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '4px',
        position: 'relative'
      }}>
        <div className="ci-plot" style={{ 
          height: '400px',
          position: 'relative',
          marginBottom: '30px'
        }}>
          {/* Y-axis (simulation number) */}
          <div style={{
            position: 'absolute',
            left: '0',
            top: '0',
            height: '100%',
            width: '40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#666'
          }}>
            <span>{displayResults.length}</span>
            <span>{Math.floor(displayResults.length * 0.75)}</span>
            <span>{Math.floor(displayResults.length * 0.5)}</span>
            <span>{Math.floor(displayResults.length * 0.25)}</span>
            <span>1</span>
          </div>
          
          {/* Chart area */}
          <div style={{
            marginLeft: '50px',
            marginRight: '20px',
            height: '100%',
            position: 'relative',
            borderLeft: '1px solid #ccc',
            borderBottom: '1px solid #ccc'
          }}>
            {/* Zero line if it's in range */}
            {chartMin <= 0 && chartMax >= 0 && (
              <div style={{
                position: 'absolute',
                left: `${((0 - chartMin) / chartRange) * 100}%`,
                top: '0',
                height: '100%',
                width: '1px',
                backgroundColor: '#666',
                zIndex: 1
              }}></div>
            )}
            
            {/* Confidence intervals */}
            {displayResults.map((result, index) => {
              const yPosition = ((displayResults.length - index - 1) / (displayResults.length - 1)) * 90 + 5;
              const ciStart = ((result.confidence_interval[0] - chartMin) / chartRange) * 100;
              const ciEnd = ((result.confidence_interval[1] - chartMin) / chartRange) * 100;
              const effectPos = ((result.effect_size - chartMin) / chartRange) * 100;
              
              return (
                <div key={index} style={{ position: 'absolute', top: `${yPosition}%` }}>
                  {/* Confidence interval line */}
                  <div style={{
                    position: 'absolute',
                    left: `${Math.min(ciStart, ciEnd)}%`,
                    width: `${Math.abs(ciEnd - ciStart)}%`,
                    height: '2px',
                    backgroundColor: result.significant ? '#f44336' : '#2196f3',
                    top: '-1px'
                  }}></div>
                  
                  {/* CI endpoints */}
                  <div style={{
                    position: 'absolute',
                    left: `${ciStart}%`,
                    width: '2px',
                    height: '6px',
                    backgroundColor: result.significant ? '#f44336' : '#2196f3',
                    top: '-3px',
                    transform: 'translateX(-50%)'
                  }}></div>
                  <div style={{
                    position: 'absolute',
                    left: `${ciEnd}%`,
                    width: '2px',
                    height: '6px',
                    backgroundColor: result.significant ? '#f44336' : '#2196f3',
                    top: '-3px',
                    transform: 'translateX(-50%)'
                  }}></div>
                  
                  {/* Effect size point */}
                  <div style={{
                    position: 'absolute',
                    left: `${effectPos}%`,
                    width: '6px',
                    height: '6px',
                    backgroundColor: result.significant ? '#d32f2f' : '#1976d2',
                    borderRadius: '50%',
                    top: '-3px',
                    transform: 'translateX(-50%)',
                    border: '1px solid white'
                  }}></div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* X-axis */}
        <div style={{
          marginLeft: '50px',
          marginRight: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#666'
        }}>
          <span>{chartMin.toFixed(2)}</span>
          <span>{((chartMin + chartMax) / 2).toFixed(2)}</span>
          <span>{chartMax.toFixed(2)}</span>
        </div>
        
        <div style={{ 
          textAlign: 'center', 
          marginTop: '10px',
          fontWeight: 'bold'
        }}>
          Effect Size
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
          <span>Significant Results</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ 
            width: '16px', 
            height: '16px', 
            backgroundColor: '#2196f3' 
          }}></div>
          <span>Non-Significant Results</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ 
            width: '6px', 
            height: '6px', 
            backgroundColor: '#333',
            borderRadius: '50%'
          }}></div>
          <span>Effect Size Point</span>
        </div>
      </div>
    </div>
  );
};

export default CIChart;