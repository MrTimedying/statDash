import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  MultiPairSimulationParams,
  MultiPairResults,
  SamplePair,
  GlobalSimulationSettings,
  SimulationSession
} from '../types/simulation.types';
import { databaseService } from '../services/database.service';
import { multiPairSimulationEngine } from '../services/multi-pair-simulation';

interface SimulationState {
  // Current session state
  currentSession: SimulationSession | null;
  simulationHistory: SimulationSession[];

  // UI state
  activeTab: 'numerical' | 'pvalues' | 'effectsizes';
  selectedPairId: string | null;
  isLoading: boolean;
  error: string | null;

  // Computed properties
  activePairs: SamplePair[];
  hasUnsavedChanges: boolean;
  resultsStale: boolean; // Indicates if current results are out of date due to parameter changes
}

interface SimulationActions {
  // Session management
  createSession: (params: MultiPairSimulationParams) => void;
  updateSession: (updates: Partial<SimulationSession>) => void;
  saveSession: () => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  loadSessionHistory: () => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;

  // Simulation management
  runSimulation: () => Promise<void>;
  cancelSimulation: () => void;

  // UI actions
  setActiveTab: (tab: 'numerical' | 'pvalues' | 'effectsizes') => void;
  setSelectedPairId: (pairId: string | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Data management
  updatePairs: (pairs: SamplePair[]) => void;
  updateGlobalSettings: (settings: Partial<GlobalSimulationSettings>) => void;
}

type SimulationStore = SimulationState & SimulationActions;

const initialState: SimulationState = {
  currentSession: null,
  simulationHistory: [],
  activeTab: 'numerical',
  selectedPairId: null,
  isLoading: false,
  error: null,
  activePairs: [],
  hasUnsavedChanges: false,
  resultsStale: false,
};

const deserializeDates = (session: SimulationSession): SimulationSession => {
  return {
    ...session,
    created_at: new Date(session.created_at),
    updated_at: new Date(session.updated_at),
  };
};

const deserializeSessionHistory = (history: SimulationSession[]): SimulationSession[] => {
  return history.map(deserializeDates);
};

export const useSimulationStore = create<SimulationStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Session management
        createSession: (params) => {
          const newSession: SimulationSession = {
            id: crypto.randomUUID(),
            name: `Session ${new Date().toLocaleString()}`,
            description: '',
            parameters: params,
            results: null,
            created_at: new Date(),
            updated_at: new Date(),
            is_active: true,
          };

          set((state) => ({
            currentSession: newSession,
            simulationHistory: [newSession, ...state.simulationHistory],
            hasUnsavedChanges: true,
          }));
        },

        updateSession: (updates) => {
          set((state) => {
            if (!state.currentSession) return state;

            const updatedSession = {
              ...state.currentSession,
              ...updates,
              updated_at: new Date(),
            };

            return {
              currentSession: updatedSession,
              hasUnsavedChanges: true,
            };
          });
        },

        saveSession: async () => {
          const { currentSession } = get();
          if (!currentSession) return;

          try {
            // Ensure database is initialized
            await databaseService.initialize();

            // Save session to database
            await databaseService.saveSession(currentSession);

            set((state) => ({
              hasUnsavedChanges: false,
            }));

            console.log('Session saved successfully:', currentSession.id);
          } catch (error) {
            console.error('Failed to save session:', error);
            set({ error: 'Failed to save session' });
          }
        },

        loadSession: async (sessionId) => {
          try {
            // Ensure database is initialized
            await databaseService.initialize();

            // Load session from database
            const session = await databaseService.loadSession(sessionId);

            if (session) {
              // Ensure dates are Date objects (database service should handle this, but double-check)
              const normalizedSession = deserializeDates(session);
              set({
                currentSession: normalizedSession,
                hasUnsavedChanges: false,
              });
              console.log('Session loaded successfully:', sessionId);
            } else {
              set({ error: 'Session not found' });
            }
          } catch (error) {
            console.error('Failed to load session:', error);
            set({ error: 'Failed to load session' });
          }
        },

        deleteSession: async (sessionId) => {
          try {
            // Ensure database is initialized
            await databaseService.initialize();

            // Delete from database
            await databaseService.deleteSession(sessionId);

            // Update local state
            set((state) => ({
              simulationHistory: state.simulationHistory.filter(s => s.id !== sessionId),
              currentSession: state.currentSession?.id === sessionId ? null : state.currentSession,
            }));

            console.log('Session deleted successfully:', sessionId);
          } catch (error) {
            console.error('Failed to delete session:', error);
            set({ error: 'Failed to delete session' });
          }
        },

        loadSessionHistory: async () => {
          try {
            // Ensure database is initialized
            await databaseService.initialize();

            // Load session history from database
            const history = await databaseService.getSessionHistory(20);

            // Ensure dates are Date objects
            const normalizedHistory = deserializeSessionHistory(history);

            set({ simulationHistory: normalizedHistory });
            console.log('Session history loaded:', history.length, 'sessions');
          } catch (error) {
            console.error('Failed to load session history:', error);
            set({ error: 'Failed to load session history' });
          }
        },

        // Simulation management
        runSimulation: async () => {
          set({ isLoading: true, error: null });

          try {
            const { currentSession } = get();
            if (!currentSession) {
              throw new Error('No active session');
            }

            console.log('Running multi-pair simulation for session:', currentSession.id);

            // Run the actual multi-pair simulation
            const results: MultiPairResults = await multiPairSimulationEngine.runMultiPairSimulation(
              currentSession.parameters,
              (progress) => {
                console.log('Simulation progress:', progress);
              }
            );

            console.log('Multi-pair simulation completed successfully');

            // Update session with results
            const updatedSession = {
              ...currentSession,
              results,
              updated_at: new Date(),
            };

            set((state) => ({
              currentSession: updatedSession,
              simulationHistory: state.simulationHistory.map(session =>
                session.id === currentSession.id ? updatedSession : session
              ),
              hasUnsavedChanges: true,
              isLoading: false,
              resultsStale: false, // Clear stale flag when new results are generated
            }));

            console.log('Session updated with simulation results');
          } catch (error) {
            console.error('Simulation failed:', error);
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Simulation failed'
            });
          }
        },

        cancelSimulation: () => {
          set({ isLoading: false });
        },

        // UI actions
        setActiveTab: (tab) => set({ activeTab: tab }),
        setSelectedPairId: (pairId) => set({ selectedPairId: pairId }),
        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),

        // Data management
        updatePairs: (pairs) => {
          set((state) => {
            if (!state.currentSession) return state;

            return {
              currentSession: {
                ...state.currentSession,
                parameters: {
                  ...state.currentSession.parameters,
                  pairs,
                },
                updated_at: new Date(),
              },
              hasUnsavedChanges: true,
              resultsStale: true, // Mark results as stale when pairs change
            };
          });
        },

        updateGlobalSettings: (settings) => {
          set((state) => {
            if (!state.currentSession) return state;

            return {
              currentSession: {
                ...state.currentSession,
                parameters: {
                  ...state.currentSession.parameters,
                  global_settings: {
                    ...state.currentSession.parameters.global_settings,
                    ...settings,
                  },
                },
                updated_at: new Date(),
              },
              hasUnsavedChanges: true,
              resultsStale: true, // Mark results as stale when global settings change
            };
          });
        },
      }),
      {
        name: 'statdash-simulation-store',
        partialize: (state) => ({
          currentSession: state.currentSession,
          simulationHistory: state.simulationHistory.slice(0, 10), // Keep only last 10 sessions
          activeTab: state.activeTab,
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            // Deserialize dates in currentSession
            if (state.currentSession) {
              state.currentSession = deserializeDates(state.currentSession);
            }
            // Deserialize dates in simulationHistory
            if (state.simulationHistory) {
              state.simulationHistory = deserializeSessionHistory(state.simulationHistory);
            }
          }
        },
      }
    ),
    {
      name: 'simulation-store',
    }
  )
);

// Selectors for computed values
export const useActivePairs = () => {
  return useSimulationStore((state) =>
    state.currentSession?.parameters.pairs.filter((p: SamplePair) => p.enabled) || []
  );
};

export const useCurrentSession = () => {
  return useSimulationStore((state) => state.currentSession);
};

export const useSimulationHistory = () => {
  return useSimulationStore((state) => state.simulationHistory);
};

export const useIsLoading = () => {
  return useSimulationStore((state) => state.isLoading);
};

export const useError = () => {
  return useSimulationStore((state) => state.error);
};

export const useResultsStale = () => {
  return useSimulationStore((state) => state.resultsStale);
};