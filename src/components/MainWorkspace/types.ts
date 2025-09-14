export interface MainWorkspaceProps {
  isResizing?: boolean;
}

export interface WorkspaceMenuProps {
  multiPairResults: any; // Using any for now, should be properly typed
  onExportCSV: () => void;
}

export interface TopPanelProps {
  multiPairResults: any;
  significanceLevels: number[];
  pairs: any[];
  currentChartType?: 'estimation' | 'variability';
  onChartTypeChange?: (chartType: 'estimation' | 'variability') => void;
}

export interface BottomPanelProps {
  multiPairResults: any;
  onExportCSV: () => void;
}