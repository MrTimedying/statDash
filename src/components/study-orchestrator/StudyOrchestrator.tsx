import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  Chip,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Settings as SettingsIcon,
  Folder as FolderIcon,
  MoreVert as MoreIcon,
  Science as ScienceIcon
} from '@mui/icons-material';
import { StudyBuilderCompact } from './components/StudyBuilderCompact';
import { SamplePair, SimulationStudy, StudyStatus } from '../../types/simulation.types';

interface StudyOrchestratorProps {
  currentStudy: SimulationStudy | null;
  studies: SimulationStudy[];
  onStudyChange: (study: SimulationStudy | null) => void;
  onStudyCreate: (study: Omit<SimulationStudy, 'id' | 'created_at' | 'updated_at'>) => void;
  onStudyUpdate: (studyId: string, updates: Partial<SimulationStudy>) => void;
  onStudyDelete: (studyId: string) => void;
  onRunStudy: (studyId: string) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`study-tabpanel-${index}`}
      aria-labelledby={`study-tab-${index}`}
      {...other}
      style={{ height: '100%' }}
    >
      {value === index && <Box sx={{ height: '100%' }}>{children}</Box>}
    </div>
  );
}

export const StudyOrchestrator: React.FC<StudyOrchestratorProps> = ({
  currentStudy,
  studies,
  onStudyChange,
  onStudyCreate,
  onStudyUpdate,
  onStudyDelete,
  onRunStudy
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedStudyId, setSelectedStudyId] = useState<string | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, studyId: string) => {
    setMenuAnchor(event.currentTarget);
    setSelectedStudyId(studyId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedStudyId(null);
  };

  const handleCreateStudy = () => {
    const newStudy: Omit<SimulationStudy, 'id' | 'created_at' | 'updated_at'> = {
      name: `Study ${studies.length + 1}`,
      description: '',
      pairs: [],
      parameters: {
        global_settings: {
          num_simulations: 1000,
          significance_levels: [0.01, 0.05, 0.10],
          confidence_level: 0.95,
          test_type: 'welch'
        },
        ui_preferences: {
          theme: 'light',
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
            alternative: 'two-sided'
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
      metadata: {
        version: '1.0.0',
        tags: [],
        notes: []
      },
      status: 'draft'
    };

    onStudyCreate(newStudy);
  };

  const handleStudySelect = (study: SimulationStudy) => {
    onStudyChange(study);
  };

  const getStatusColor = (status: StudyStatus) => {
    switch (status) {
      case 'completed': return 'success';
      case 'running': return 'warning';
      case 'error': return 'error';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: StudyStatus) => {
    switch (status) {
      case 'completed': return <ScienceIcon sx={{ fontSize: 12 }} />;
      case 'running': return <PlayIcon sx={{ fontSize: 12 }} />;
      case 'error': return <SettingsIcon sx={{ fontSize: 12 }} />;
      default: return <ScienceIcon sx={{ fontSize: 12 }} />;
    }
  };

  const renderStudyList = () => (
    <Box sx={{ p: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontSize: '11px', fontWeight: 600 }}>
          Studies ({studies.length})
        </Typography>
        <Tooltip title="Create new study">
          <IconButton size="small" onClick={handleCreateStudy} sx={{ p: 0.5 }}>
            <AddIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ maxHeight: '200px', overflow: 'auto' }}>
        {studies.length === 0 ? (
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.default' }}>
            <FolderIcon sx={{ fontSize: 24, color: 'text.disabled', mb: 1 }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px' }}>
              No studies yet
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {studies.map((study) => (
              <Box
                key={study.id}
                onClick={() => handleStudySelect(study)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 0.75,
                  borderRadius: 1,
                  cursor: 'pointer',
                  bgcolor: currentStudy?.id === study.id ? 'action.selected' : 'background.paper',
                  border: '1px solid',
                  borderColor: currentStudy?.id === study.id ? 'primary.main' : 'divider',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <Box sx={{ mr: 1 }}>
                  {getStatusIcon(study.status)}
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '11px',
                      fontWeight: currentStudy?.id === study.id ? 600 : 400,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {study.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                    <Chip
                      label={study.status}
                      size="small"
                      color={getStatusColor(study.status)}
                      variant="outlined"
                      sx={{ fontSize: '9px', height: 16 }}
                    />
                    <Typography variant="caption" sx={{ fontSize: '9px', color: 'text.secondary' }}>
                      {study.pairs.length} pairs
                    </Typography>
                  </Box>
                </Box>

                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMenuOpen(e, study.id);
                  }}
                  sx={{ p: 0.25 }}
                >
                  <MoreIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );


  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontSize: '14px', fontWeight: 600 }}>
          Study Orchestrator
        </Typography>
        {currentStudy && (
          <Button
            variant="contained"
            size="small"
            startIcon={<PlayIcon sx={{ fontSize: 14 }} />}
            onClick={() => onRunStudy(currentStudy.id)}
            disabled={currentStudy.status === 'running'}
            sx={{
              height: 28,
              fontSize: '11px',
              textTransform: 'none',
              px: 1.5,
              minWidth: 'auto'
            }}
          >
            {currentStudy.status === 'running' ? 'Running...' : 'Run'}
          </Button>
        )}
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            minHeight: 32,
            '& .MuiTab-root': {
              minHeight: 32,
              fontSize: '11px',
              textTransform: 'none',
              padding: '6px 12px'
            }
          }}
        >
          <Tab label="Builder" />
          <Tab label="Studies" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <TabPanel value={tabValue} index={0}>
          {currentStudy ? (
            <StudyBuilderCompact
              pairs={currentStudy.pairs}
              onPairsChange={(pairs) => onStudyUpdate(currentStudy.id, { pairs })}
            />
          ) : (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <ScienceIcon sx={{ fontSize: 32, color: 'text.disabled', mb: 1 }} />
              <Typography variant="caption" color="text.secondary">
                Select or create a study to begin
              </Typography>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {renderStudyList()}
        </TabPanel>
      </Box>


      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedStudyId) {
            const study = studies.find(s => s.id === selectedStudyId);
            if (study) handleStudySelect(study);
          }
          handleMenuClose();
        }}>
          Open Study
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedStudyId) {
            onStudyDelete(selectedStudyId);
          }
          handleMenuClose();
        }}>
          Delete Study
        </MenuItem>
      </Menu>
    </Box>
  );
};