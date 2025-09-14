import React from 'react';
import { Box } from '@mui/material';
import MainWorkspace from './components/MainWorkspace';
import { MaterialThemeProvider } from './components/MaterialThemeProvider';
import { AppHeader } from './components/Header';
import { DesignComposer } from './components/design-composer/DesignComposer';
import { DataTablesModal } from './components/DataView/DataTablesModal';
import './App.css';

// Import new types and stores
import { useSimulationStore } from './stores/simulation.store';
import { useUIStore } from './stores/ui.store';
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


function App() {
  const [designComposerOpen, setDesignComposerOpen] = React.useState(false);
  const [dataTablesOpen, setDataTablesOpen] = React.useState(false);
  const [currentView, setCurrentView] = React.useState<'chart' | 'table'>('chart');

  const handleDesignComposerOpen = () => {
    setDesignComposerOpen(true);
  };

  const handleChartOption = async (option: string) => {
    console.log('Chart option clicked:', option);

    if (option === 'export') {
      // Export current chart as PNG
      const { exportChartAsImage } = await import('./utils/chartExport');
      const success = await exportChartAsImage('main-chart-container', 'statdash_chart');
      if (success) {
        console.log('Chart exported successfully');
      }
    } else if (option === 'save') {
      // Save chart configuration
      console.log('Save chart configuration functionality');
    } else if (option === 'settings') {
      // Open chart settings
      console.log('Chart settings functionality');
    }
  };

  const handleDataOption = (option: string) => {
    console.log('Data option clicked:', option);

    if (option === 'export') {
      // Open data tables modal for export
      setDataTablesOpen(true);
    } else if (option === 'save') {
      // Save current session
      console.log('Save session functionality');
    } else if (option === 'import') {
      // Import data functionality
      console.log('Import data functionality');
    }
  };

  const handleViewChange = (view: 'chart' | 'table') => {
    setCurrentView(view);
    if (view === 'table') {
      setDataTablesOpen(true);
    }
    console.log('View changed to:', view);
  };

  return (
    <MaterialThemeProvider>
      <Phase15Provider>
        <Box sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <AppHeader
            onDesignComposerOpen={handleDesignComposerOpen}
            onChartOptionClick={handleChartOption}
            onDataOptionClick={handleDataOption}
            onViewChange={handleViewChange}
            currentView={currentView}
          />

          <Box sx={{
            flex: 1,
            overflow: 'hidden',
            minHeight: 0
          }}>
            <MainWorkspace isResizing={false} />
          </Box>

          {/* Design Composer Modal */}
          <DesignComposer
            open={designComposerOpen}
            onClose={() => setDesignComposerOpen(false)}
          />

          {/* Data Tables Modal */}
          <DataTablesModal
            open={dataTablesOpen}
            onClose={() => {
              setDataTablesOpen(false);
              setCurrentView('chart'); // Reset to chart view when closing
            }}
          />
        </Box>
      </Phase15Provider>
    </MaterialThemeProvider>
  );
}

export default App;