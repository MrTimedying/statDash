import React, { useState } from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import ControlPanel, { AppProvider } from './ControlPanel';
import DashboardView from './DashboardView';
import { MaterialThemeProvider } from './components/MaterialThemeProvider';
import { AppHeader } from './components/Header';
import { StudyOrchestrator } from './components/StudyOrchestrator';
import { ParameterTuner } from './components/ParameterTuner';
import './App.css';

// Import new types and stores
import { SimulationStudy, SamplePair } from './types/simulation.types';
import { useSimulationStore } from './stores/simulation.store';
import { useUIStore } from './stores/ui.store';
import { useChartStore } from './stores/chart.store';
import { databaseService } from './services/database.service';
import { workerService } from './services/worker.service';

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

// Study Management Component
const StudyManager: React.FC = () => {
  const [studies, setStudies] = useState<SimulationStudy[]>([]);
  const [currentStudy, setCurrentStudy] = useState<SimulationStudy | null>(null);

  // Study management handlers
  const handleStudyCreate = (studyData: Omit<SimulationStudy, 'id' | 'created_at' | 'updated_at'>) => {
    const newStudy: SimulationStudy = {
      ...studyData,
      id: crypto.randomUUID(),
      created_at: new Date(),
      updated_at: new Date()
    };
    setStudies(prev => [...prev, newStudy]);
    setCurrentStudy(newStudy);
  };

  const handleStudyUpdate = (studyId: string, updates: Partial<SimulationStudy>) => {
    setStudies(prev => prev.map(study =>
      study.id === studyId
        ? { ...study, ...updates, updated_at: new Date() }
        : study
    ));

    if (currentStudy?.id === studyId) {
      setCurrentStudy(prev => prev ? { ...prev, ...updates, updated_at: new Date() } : null);
    }
  };

  const handleStudyDelete = (studyId: string) => {
    setStudies(prev => prev.filter(study => study.id !== studyId));
    if (currentStudy?.id === studyId) {
      setCurrentStudy(null);
    }
  };

  const handleRunStudy = (studyId: string) => {
    // TODO: Implement study execution
    console.log('Running study:', studyId);
  };

  const handleSaveStudy = (studyId: string) => {
    // TODO: Implement study persistence
    console.log('Saving study:', studyId);
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
        export_formats: ['json', 'csv']
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
        <Panel defaultSize={25} minSize={20} maxSize={40} style={{ height: '100%' }}>
          <StudyOrchestrator
            currentStudy={currentStudy}
            studies={studies}
            onStudyChange={setCurrentStudy}
            onStudyCreate={handleStudyCreate}
            onStudyUpdate={handleStudyUpdate}
            onStudyDelete={handleStudyDelete}
            onRunStudy={handleRunStudy}
            onSaveStudy={handleSaveStudy}
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
                flexDirection: 'column'
              }}>
                {/* TODO: Add data table component */}
                <Box sx={{
                  p: 2,
                  textAlign: 'center',
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Typography variant="caption" color="text.secondary">
                    Data table will be implemented here
                  </Typography>
                </Box>
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
        <Panel defaultSize={20} minSize={15} maxSize={35} style={{ height: '100%' }}>
          <ParameterTuner
            globalSettings={currentStudy?.parameters.global_settings || defaultParameters.global_settings}
            uiPreferences={currentStudy?.parameters.ui_preferences || defaultParameters.ui_preferences}
            analysisSettings={currentStudy?.parameters.analysis_settings || defaultParameters.analysis_settings}
            onGlobalSettingsChange={(settings) => {
              if (currentStudy) {
                handleStudyUpdate(currentStudy.id, {
                  parameters: { ...currentStudy.parameters, global_settings: { ...currentStudy.parameters.global_settings, ...settings } }
                });
              }
            }}
            onUIPreferencesChange={(preferences) => {
              if (currentStudy) {
                handleStudyUpdate(currentStudy.id, {
                  parameters: { ...currentStudy.parameters, ui_preferences: { ...currentStudy.parameters.ui_preferences, ...preferences } }
                });
              }
            }}
            onAnalysisSettingsChange={(settings) => {
              if (currentStudy) {
                handleStudyUpdate(currentStudy.id, {
                  parameters: { ...currentStudy.parameters, analysis_settings: { ...currentStudy.parameters.analysis_settings, ...settings } }
                });
              }
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
        <AppProvider>
          <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <AppHeader />

            <Box sx={{ flex: 1, height: 'calc(100vh - 64px)' }}>
              <StudyManager />
            </Box>
          </Box>
        </AppProvider>
      </Phase15Provider>
    </MaterialThemeProvider>
  );
}

export default App;