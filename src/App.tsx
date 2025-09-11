import React, { useState, useRef } from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import DashboardView from './DashboardView';
import { MaterialThemeProvider } from './components/MaterialThemeProvider';
import { AppHeader } from './components/Header';
import { StudyOrchestrator } from './components/study-orchestrator/StudyOrchestrator';
import { ParameterTuner } from './components/parameter-tuner/ParameterTuner';
import './App.css';

// Import new types and stores
import { SimulationStudy, SamplePair, SimulationSession } from './types/simulation.types';
import { useSimulationStore } from './stores/simulation.store';
import { useUIStore } from './stores/ui.store';
import { useChartStore } from './stores/chart.store';
import { databaseService } from './services/database.service';
import { workerService } from './services/worker.service';
import { TanStackResultsTable } from './components/TanStackResultsTable';

// Phase 1.5: Provider component for new architecture
const Phase15Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [initialized, setInitialized] = React.useState(false);
  const [initError, setInitError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const initializeServices = async () => {
      try {
        // Initialize database
        await databaseService.initialize();
        console.log('✅ Database initialized');

        // Initialize Web Worker
        await workerService.initialize();
        console.log('✅ Web Worker initialized');

        // Load UI preferences
        const uiPrefs = await databaseService.loadAllUIPreferences();
        if (uiPrefs) {
          // Apply UI preferences to stores
          console.log('✅ UI preferences loaded');
        }

        setInitialized(true);
        console.log('🎉 Phase 1.5 services initialized successfully');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
        console.error('❌ Phase 1.5 initialization failed:', errorMessage);
        setInitError(errorMessage);
        // Continue with legacy system if new system fails
        setInitialized(true);
      }
    };

    initializeServices();
  }, []);

  if (!initialized) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: '8px' }}>🚀 Initializing Phase 1.5</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Setting up modern architecture...</div>
        </div>
      </div>
    );
  }

  if (initError) {
    console.warn('⚠️ Phase 1.5 initialization failed, falling back to legacy system:', initError);
  }

  return <>{children}</>;
};

// Study Management Component - Updated to use Zustand stores
const StudyManager: React.FC = () => {
  const simulationStore = useSimulationStore();
  const uiStore = useUIStore();

  // Sidebar state (no longer collapsible)
  const leftPanelRef = useRef<any>(null);
  const rightPanelRef = useRef<any>(null);

  // Get data from stores
  const currentSession = simulationStore.currentSession;
  const simulationHistory = simulationStore.simulationHistory;

  // Study management handlers - now using simulation store
  const handleStudyCreate = (studyData: Omit<SimulationStudy, 'id' | 'created_at' | 'updated_at'>) => {
    // Convert study to session format
    const sessionParams = {
      pairs: studyData.pairs || [],
      global_settings: studyData.parameters?.global_settings || {
        num_simulations: 1000,
        significance_levels: [0.01, 0.05, 0.10],
        confidence_level: 0.95,
        test_type: 'welch' as const
      },
      ui_preferences: studyData.parameters?.ui_preferences || {
        theme: 'light' as const,
        decimal_places: 3,
        chart_animations: true,
        color_blind_safe: false
      }
    };

    simulationStore.createSession(sessionParams);
  };

  const handleStudyUpdate = (studyId: string, updates: Partial<SimulationStudy>) => {
    if (updates.parameters) {
      // Convert StudyParameters to MultiPairSimulationParams
      const sessionUpdates: Partial<SimulationSession> = {
        name: updates.name,
        description: updates.description,
        parameters: {
          pairs: updates.pairs || [],
          global_settings: updates.parameters.global_settings,
          ui_preferences: updates.parameters.ui_preferences
        }
      };
      simulationStore.updateSession(sessionUpdates);
    } else if (updates.pairs) {
      // Handle pairs update
      simulationStore.updatePairs(updates.pairs);
    } else {
      // Handle other updates
      simulationStore.updateSession({
        name: updates.name,
        description: updates.description
      });
    }
  };

  const handleStudyDelete = (studyId: string) => {
    simulationStore.deleteSession(studyId);
  };

  const handleRunStudy = (studyId: string) => {
    // Load the study/session and run simulation
    simulationStore.loadSession(studyId).then(() => {
      simulationStore.runSimulation();
    });
  };


  // Default study parameters for when no study is selected
  const defaultParameters = {
    global_settings: {
      num_simulations: 1000,
      significance_levels: [0.01, 0.05, 0.10],
      confidence_level: 0.95,
      test_type: 'welch' as const
    },
    ui_preferences: {
      theme: 'light' as const,
      decimal_places: 3,
      chart_animations: true,
      color_blind_safe: false
    },
    analysis_settings: {
      effect_size_thresholds: {
        negligible: 0.2,
        small: 0.5,
        medium: 0.8,
        large: 1.2
      },
      power_analysis_settings: {
        target_power: 0.8,
        alpha_levels: [0.05],
        alternative: 'two-sided' as const
      },
      reporting_preferences: {
        decimal_places: 3,
        include_confidence_intervals: true,
        include_effect_sizes: true,
        export_formats: ['json', 'csv'],
        chart_animations: true,
        color_blind_safe: false,
        theme: 'light' as const
      }
    }
  };

  return (
    <Box sx={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Main horizontal panel group for left/center/right - spans full viewport */}
      <PanelGroup direction="horizontal" style={{
        height: '100%',
        width: '100%',
        flex: 1
      }}>
        {/* Left Panel: Study Orchestrator */}
        <Panel ref={leftPanelRef} defaultSize={25} minSize={15} maxSize={40} style={{ height: '100%' }}>
          <StudyOrchestrator
            currentStudy={currentSession ? {
              id: currentSession.id,
              name: currentSession.name,
              description: currentSession.description,
              pairs: currentSession.parameters.pairs,
              parameters: {
                global_settings: currentSession.parameters.global_settings,
                ui_preferences: currentSession.parameters.ui_preferences,
                analysis_settings: {
                  effect_size_thresholds: {
                    negligible: 0.2,
                    small: 0.5,
                    medium: 0.8,
                    large: 1.2
                  },
                  power_analysis_settings: {
                    target_power: 0.8,
                    alpha_levels: [0.05],
                    alternative: 'two-sided' as const
                  },
                  reporting_preferences: {
                    decimal_places: 3,
                    include_confidence_intervals: true,
                    include_effect_sizes: true,
                    export_formats: ['json', 'csv'],
                    chart_animations: true,
                    color_blind_safe: false,
                    theme: 'light' as const
                  }
                }
              },
              results: currentSession.results ? {
                execution_id: crypto.randomUUID(),
                multi_pair_results: currentSession.results,
                study_insights: {
                  key_findings: [],
                  recommendations: [],
                  statistical_summary: {
                    total_pairs_analyzed: currentSession.results.pairs_results.length,
                    overall_power: 0.8,
                    effect_size_distribution: {
                      mean: 0,
                      median: 0,
                      range: [0, 0],
                      categories: { negligible: 0, small: 0, medium: 0, large: 0 }
                    },
                    significance_patterns: {
                      consistent_threshold: 0.05,
                      variability_across_pairs: 0,
                      power_curve: []
                    }
                  },
                  data_quality_metrics: {
                    normality_tests: {},
                    variance_homogeneity: true,
                    sample_size_adequacy: true,
                    effect_size_reliability: 0.9
                  }
                },
                parameter_history: [],
                execution_timestamp: new Date()
              } : undefined,
              metadata: {
                version: '1.0.0',
                tags: [],
                notes: []
              },
              status: 'draft' as const,
              created_at: currentSession.created_at,
              updated_at: currentSession.updated_at
            } : null}
            studies={simulationHistory.map(session => ({
              id: session.id,
              name: session.name,
              description: session.description,
              pairs: session.parameters.pairs,
              parameters: {
                global_settings: session.parameters.global_settings,
                ui_preferences: session.parameters.ui_preferences,
                analysis_settings: {
                  effect_size_thresholds: {
                    negligible: 0.2,
                    small: 0.5,
                    medium: 0.8,
                    large: 1.2
                  },
                  power_analysis_settings: {
                    target_power: 0.8,
                    alpha_levels: [0.05],
                    alternative: 'two-sided' as const
                  },
                  reporting_preferences: {
                    decimal_places: 3,
                    include_confidence_intervals: true,
                    include_effect_sizes: true,
                    export_formats: ['json', 'csv'],
                    chart_animations: true,
                    color_blind_safe: false,
                    theme: 'light' as const
                  }
                }
              },
              results: session.results ? {
                execution_id: crypto.randomUUID(),
                multi_pair_results: session.results,
                study_insights: {
                  key_findings: [],
                  recommendations: [],
                  statistical_summary: {
                    total_pairs_analyzed: session.results.pairs_results.length,
                    overall_power: 0.8,
                    effect_size_distribution: {
                      mean: 0,
                      median: 0,
                      range: [0, 0],
                      categories: { negligible: 0, small: 0, medium: 0, large: 0 }
                    },
                    significance_patterns: {
                      consistent_threshold: 0.05,
                      variability_across_pairs: 0,
                      power_curve: []
                    }
                  },
                  data_quality_metrics: {
                    normality_tests: {},
                    variance_homogeneity: true,
                    sample_size_adequacy: true,
                    effect_size_reliability: 0.9
                  }
                },
                parameter_history: [],
                execution_timestamp: new Date()
              } : undefined,
              metadata: {
                version: '1.0.0',
                tags: [],
                notes: []
              },
              status: 'draft' as const,
              created_at: session.created_at,
              updated_at: session.updated_at
            }))}
            onStudyChange={(study) => {
              if (study) {
                simulationStore.loadSession(study.id);
              }
            }}
            onStudyCreate={handleStudyCreate}
            onStudyUpdate={handleStudyUpdate}
            onStudyDelete={handleStudyDelete}
            onRunStudy={handleRunStudy}
          />
        </Panel>

        {/* Left resize handle */}
        <PanelResizeHandle style={{
          width: '2px',
          background: 'transparent',
          cursor: 'col-resize',
          height: '100%'
        }}>
          <Box sx={{
            width: '2px',
            height: '100%',
            bgcolor: 'divider',
            borderRadius: '1px'
          }} />
        </PanelResizeHandle>

        {/* Center Panel: Analysis Dashboard with vertical split */}
        <Panel defaultSize={55} minSize={30} style={{ height: '100%' }}>
          <PanelGroup direction="vertical" style={{ height: '100%', width: '100%' }}>
            {/* Top Section: Charts */}
            <Panel defaultSize={70} minSize={40} style={{ width: '100%' }}>
              <Box sx={{
                height: '100%',
                width: '100%',
                p: 1,
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <DashboardView />
              </Box>
            </Panel>

            {/* Vertical resize handle */}
            <PanelResizeHandle style={{
              height: '2px',
              background: 'transparent',
              cursor: 'row-resize',
              width: '100%'
            }}>
              <Box sx={{
                height: '2px',
                width: '100%',
                bgcolor: 'divider',
                borderRadius: '1px'
              }} />
            </PanelResizeHandle>

            {/* Bottom Section: Data Table */}
            <Panel defaultSize={30} minSize={20} style={{ width: '100%' }}>
              <Box sx={{
                height: '100%',
                width: '100%',
                p: 1,
                bgcolor: 'background.default',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'auto'
              }}>
                {currentSession?.results ? (
                  <TanStackResultsTable results={currentSession.results} />
                ) : (
                  <Box sx={{
                    p: 2,
                    textAlign: 'center',
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Typography variant="caption" color="text.secondary">
                      Run a simulation to view tabular results
                    </Typography>
                  </Box>
                )}
              </Box>
            </Panel>
          </PanelGroup>
        </Panel>

        {/* Right resize handle */}
        <PanelResizeHandle style={{
          width: '2px',
          background: 'transparent',
          cursor: 'col-resize',
          height: '100%'
        }}>
          <Box sx={{
            width: '2px',
            height: '100%',
            bgcolor: 'divider',
            borderRadius: '1px'
          }} />
        </PanelResizeHandle>

        {/* Right Panel: Parameter Tuner - Always visible */}
        <Panel ref={rightPanelRef} defaultSize={20} minSize={15} maxSize={35} style={{ height: '100%' }}>
          <ParameterTuner
            globalSettings={currentSession?.parameters.global_settings || defaultParameters.global_settings}
            analysisSettings={defaultParameters.analysis_settings}
            onGlobalSettingsChange={(settings) => {
              if (currentSession) {
                simulationStore.updateGlobalSettings(settings);
              }
            }}
            onAnalysisSettingsChange={(settings) => {
              // Analysis settings would be handled by simulation store if needed
              console.log('Analysis settings changed:', settings);
            }}
          />
        </Panel>
      </PanelGroup>
    </Box>
  );
};

function App() {
  return (
    <MaterialThemeProvider>
      <Phase15Provider>
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <AppHeader />

          <Box sx={{ flex: 1, height: 'calc(100vh - 64px)' }}>
            <StudyManager />
          </Box>
        </Box>
      </Phase15Provider>
    </MaterialThemeProvider>
  );
}

export default App;