import React, { useState } from 'react';
import { useAppContext } from './ControlPanel';
import PValueChart from './PValueChart';
import CIChart from './CIChart';
import { invoke } from '@tauri-apps/api/core';

const DashboardView: React.FC = () => {
  const { results, loading } = useAppContext();
  const [activeTab, setActiveTab] = useState<'pvalue' | 'ci' | 'svalue'>('pvalue');
  const [exporting, setExporting] = useState(false);

  const handleExportCSV = async () => {
    if (!results) return;
    
    setExporting(true);
    try {
      const csvContent: string = await invoke('export_simulation_csv', {
        results: results
      });
      
      // Create a blob and download the file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `simulation_results_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('CSV exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      alert(`Export failed: ${error}`);
    } finally {
      setExporting(false);
    }
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="loading-content" style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          color: '#666'
        }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>
            Running Statistical Simulation...
          </div>
          <div style={{ fontSize: '14px' }}>
            This may take a few moments for large numbers of simulations
          </div>
        </div>
      );
    }

    if (!results) {
      return (
        <div className="no-results" style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          color: '#888'
        }}>
          <h3>No simulation results yet</h3>
          <p>Set your simulation parameters in the sidebar and click "Run Simulation" to get started.</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'pvalue':
        return (
          <div>
            <PValueChart data={results} />
            <div className="stats-summary" style={{ 
              marginTop: '20px', 
              padding: '15px', 
              backgroundColor: '#f5f5f5',
              borderRadius: '4px'
            }}>
              <h4>P-Value Distribution Summary</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <strong>Significant Results:</strong> {results.significant_count} / {results.total_count} 
                  ({(results.significant_count / results.total_count * 100).toFixed(1)}%)
                </div>
                <div>
                  <strong>Mean Effect Size:</strong> {results.mean_effect_size.toFixed(3)}
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'ci':
        return (
          <div>
            <CIChart data={results} />
            <div className="stats-summary" style={{ 
              marginTop: '20px', 
              padding: '15px', 
              backgroundColor: '#f5f5f5',
              borderRadius: '4px'
            }}>
              <h4>Confidence Interval Summary</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <strong>CI Coverage:</strong> {(results.ci_coverage * 100).toFixed(1)}%
                </div>
                <div>
                  <strong>Mean CI Width:</strong> {results.mean_ci_width.toFixed(3)}
                </div>
                <div>
                  <strong>Effect Size Range:</strong> {results.effect_size_ci[0].toFixed(3)} to {results.effect_size_ci[1].toFixed(3)}
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'svalue':
        return (
          <div>
            <div className="svalue-analysis" style={{ padding: '20px' }}>
              <h3>S-Value Analysis</h3>
              <p>S-Values represent the information content against the null hypothesis, measured in bits.</p>
              
              <div className="svalue-stats" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '15px',
                marginTop: '20px'
              }}>
                {results.individual_results.slice(0, 10).map((result, index) => (
                  <div key={index} style={{ 
                    padding: '15px', 
                    backgroundColor: '#f9f9f9',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}>
                    <div><strong>Simulation {index + 1}</strong></div>
                    <div>P-value: {result.p_value.toFixed(4)}</div>
                    <div>S-value: {result.s_value.toFixed(2)} bits</div>
                    <div>Effect Size: {result.effect_size.toFixed(3)}</div>
                    <div style={{ 
                      color: result.significant ? '#4caf50' : '#f44336',
                      fontWeight: 'bold'
                    }}>
                      {result.significant ? 'Significant' : 'Not Significant'}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="svalue-interpretation" style={{ 
                marginTop: '20px', 
                padding: '15px', 
                backgroundColor: '#e3f2fd',
                borderRadius: '4px'
              }}>
                <h4>S-Value Interpretation</h4>
                <ul>
                  <li><strong>S = 1 bit:</strong> Evidence is 2:1 against null (p = 0.5)</li>
                  <li><strong>S = 2 bits:</strong> Evidence is 4:1 against null (p = 0.25)</li>
                  <li><strong>S = 3.32 bits:</strong> Evidence is 10:1 against null (p = 0.1)</li>
                  <li><strong>S = 4.32 bits:</strong> Evidence is 20:1 against null (p = 0.05)</li>
                </ul>
              </div>
            </div>
          </div>
        );
        
      default:
        return <div>Tab content not found</div>;
    }
  };

  return (
    <div className="dashboard-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Statistical Simulation Dashboard</h2>
        {results && (
          <button
            onClick={handleExportCSV}
            disabled={exporting || loading}
            style={{
              backgroundColor: exporting ? '#cccccc' : '#4caf50',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: exporting ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        )}
      </div>
      
      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'pvalue' ? 'active' : ''}`}
          onClick={() => setActiveTab('pvalue')}
        >
          P-Value Distribution
        </button>
        <button
          className={`tab-button ${activeTab === 'ci' ? 'active' : ''}`}
          onClick={() => setActiveTab('ci')}
        >
          Confidence Intervals
        </button>
        <button
          className={`tab-button ${activeTab === 'svalue' ? 'active' : ''}`}
          onClick={() => setActiveTab('svalue')}
        >
          S-Value Analysis
        </button>
      </div>
      
      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default DashboardView;