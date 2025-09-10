import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface UIState {
  // Theme and appearance
  theme: 'light' | 'dark' | 'auto';
  sidebarCollapsed: boolean;
  activeView: 'dashboard' | 'settings' | 'help';

  // Layout preferences
  panelSizes: {
    sidebar: number;
    main: number;
  };

  // User preferences
  decimalPlaces: number;
  chartAnimations: boolean;
  colorBlindSafe: boolean;
  autoSave: boolean;
  showTooltips: boolean;

  // UI state
  loadingStates: Record<string, boolean>;
  notifications: Notification[];
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface UIActions {
  // Theme actions
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  toggleSidebar: () => void;
  setActiveView: (view: 'dashboard' | 'settings' | 'help') => void;

  // Layout actions
  updatePanelSizes: (sizes: { sidebar: number; main: number }) => void;

  // Preferences actions
  updatePreferences: (prefs: Partial<Pick<UIState, 'decimalPlaces' | 'chartAnimations' | 'colorBlindSafe' | 'autoSave' | 'showTooltips'>>) => void;

  // UI state actions
  setLoadingState: (key: string, loading: boolean) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
}

type UIStore = UIState & UIActions;

const initialState: UIState = {
  theme: 'light',
  sidebarCollapsed: false,
  activeView: 'dashboard',
  panelSizes: {
    sidebar: 25,
    main: 75,
  },
  decimalPlaces: 3,
  chartAnimations: true,
  colorBlindSafe: false,
  autoSave: true,
  showTooltips: true,
  loadingStates: {},
  notifications: [],
};

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Theme actions
        setTheme: (theme) => set({ theme }),
        toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
        setActiveView: (view) => set({ activeView: view }),

        // Layout actions
        updatePanelSizes: (sizes) => set({ panelSizes: sizes }),

        // Preferences actions
        updatePreferences: (prefs) => set((state) => ({ ...state, ...prefs })),

        // UI state actions
        setLoadingState: (key, loading) => set((state) => ({
          loadingStates: { ...state.loadingStates, [key]: loading }
        })),

        addNotification: (notification) => {
          const newNotification: Notification = {
            ...notification,
            id: crypto.randomUUID(),
            timestamp: new Date(),
            read: false,
          };
          set((state) => ({
            notifications: [newNotification, ...state.notifications]
          }));
        },

        removeNotification: (id) => set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        })),

        markNotificationRead: (id) => set((state) => ({
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          )
        })),

        clearAllNotifications: () => set({ notifications: [] }),
      }),
      {
        name: 'statdash-ui-store',
        partialize: (state) => ({
          theme: state.theme,
          decimalPlaces: state.decimalPlaces,
          chartAnimations: state.chartAnimations,
          colorBlindSafe: state.colorBlindSafe,
          autoSave: state.autoSave,
          showTooltips: state.showTooltips,
        }),
      }
    ),
    {
      name: 'ui-store',
    }
  )
);

// Selectors
export const useTheme = () => useUIStore((state) => state.theme);
export const useSidebarCollapsed = () => useUIStore((state) => state.sidebarCollapsed);
export const useActiveView = () => useUIStore((state) => state.activeView);
export const useNotifications = () => useUIStore((state) => state.notifications);
export const useUnreadNotificationsCount = () =>
  useUIStore((state) => state.notifications.filter(n => !n.read).length);