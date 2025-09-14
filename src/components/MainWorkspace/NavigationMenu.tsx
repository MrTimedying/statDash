import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Tooltip,
  Collapse
} from '@mui/material';
import {
  Play as PlayIcon,
  ChevronDown as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  BarChart3 as ChartIcon,
  Table as TableIcon,
  FolderOpen as StudyIcon,
  Settings as SettingsIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSimulationStore } from '../../stores/simulation.store';
import { useChartsStore } from '../../stores/charts.store';
import { DataTablesModal } from '../DataView/DataTablesModal';

interface NavigationMenuProps {
  onRunSimulation: () => void;
  onChartTypeChange?: (chartType: 'estimation' | 'variability') => void;
  currentChartType?: 'estimation' | 'variability';
}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({
  onRunSimulation,
  onChartTypeChange,
  currentChartType = 'estimation'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    studies: false,
    charts: false,
    tables: false
  });
  const [showDataModal, setShowDataModal] = useState(false);

  const simulationStore = useSimulationStore();
  const chartsStore = useChartsStore();

  const currentSession = simulationStore.currentSession;
  const simulationHistory = simulationStore.simulationHistory;
  const hasResults = !!currentSession?.results;

  // Load session history when component mounts (only if history is empty)
  useEffect(() => {
    if (simulationHistory.length === 0) {
      simulationStore.loadSessionHistory();
    }
  }, [simulationHistory.length]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleStudySelect = (sessionId: string) => {
    if (sessionId !== currentSession?.id) {
      simulationStore.loadSession(sessionId);
    }
  };

  // Chart types available for each study
  const chartTypes = [
    { key: 'estimation', label: 'Gardner-Altman Estimation Plot', description: 'Effect sizes with confidence intervals' },
    { key: 'variability', label: 'P-Value Variability Chart', description: 'P-value fluctuations across replications' }
  ];

  // Get studies with results that can show charts
  const studiesWithCharts = simulationHistory.filter(session => session.results);

  const handleChartNavigation = (chartKey: string, studyId?: string) => {
    // If a study is specified and it's different from current, switch to it
    if (studyId && studyId !== currentSession?.id) {
      handleStudySelect(studyId);
    }

    // Change chart type
    if (onChartTypeChange && (chartKey === 'estimation' || chartKey === 'variability')) {
      onChartTypeChange(chartKey);
    }
  };

  return (
    <>
      <Box sx={{ position: 'fixed', top: 80, right: 16, zIndex: 1000 }}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Paper
            elevation={0}
            sx={{
              borderRadius: 0,
              overflow: 'hidden',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            {/* Header with Run Simulation Button */}
            <Box sx={{
              p: 2,
              bgcolor: 'background.paper',
              color: 'text.primary',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}>
              <Button
                variant="contained"
                startIcon={<PlayIcon size={14} />}
                onClick={onRunSimulation}
                disabled={!currentSession || simulationStore.isLoading}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark'
                  },
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.75rem'
                }}
                size="small"
              >
                {simulationStore.isLoading ? 'Running...' : 'Run Simulation'}
              </Button>

              <IconButton
                onClick={() => setIsExpanded(!isExpanded)}
                sx={{
                  color: 'text.primary',
                  ml: 'auto',
                  p: 0.5
                }}
                size="small"
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ExpandMoreIcon size={16} />
                </motion.div>
              </IconButton>
            </Box>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <Box sx={{ maxHeight: '70vh', overflow: 'auto' }}>
                    {/* Studies Section */}
                    <Box sx={{ p: 1 }}>
                      <ListItemButton
                        onClick={() => toggleSection('studies')}
                        sx={{
                          borderRadius: 1,
                          py: 0.5,
                          px: 1
                        }}
                        dense
                      >
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          {expandedSections.studies ? <ExpandMoreIcon size={14} /> : <ChevronRightIcon size={14} />}
                        </ListItemIcon>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          <StudyIcon size={14} />
                        </ListItemIcon>
                        <ListItemText
                          primary="Studies"
                          primaryTypographyProps={{ fontSize: '0.75rem', fontWeight: 500 }}
                        />
                        <Chip
                          label={simulationHistory.length}
                          size="small"
                          sx={{
                            height: 16,
                            fontSize: '0.65rem',
                            bgcolor: 'primary.main',
                            color: 'white'
                          }}
                        />
                      </ListItemButton>

                      <Collapse in={expandedSections.studies} timeout={200}>
                        <Box sx={{ pl: 1, maxHeight: '200px', overflow: 'auto' }}>
                          {simulationHistory.length === 0 ? (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                p: 1,
                                fontSize: '0.75rem',
                                fontStyle: 'italic'
                              }}
                            >
                              No studies available
                            </Typography>
                          ) : (
                            simulationHistory.map((session) => (
                              <ListItemButton
                                key={session.id}
                                onClick={() => handleStudySelect(session.id)}
                                selected={session.id === currentSession?.id}
                                sx={{
                                  borderRadius: 1,
                                  py: 0.25,
                                  px: 1,
                                  mb: 0.25,
                                  '&.Mui-selected': {
                                    bgcolor: 'primary.main',
                                    color: 'white'
                                  }
                                }}
                                dense
                              >
                                <ListItemText
                                  primary={session.name}
                                  secondary={`${session.parameters.pairs.length} pairs`}
                                  primaryTypographyProps={{ fontSize: '0.75rem' }}
                                  secondaryTypographyProps={{
                                    fontSize: '0.65rem',
                                    color: session.id === currentSession?.id ? 'rgba(255,255,255,0.7)' : 'text.secondary'
                                  }}
                                />
                              </ListItemButton>
                            ))
                          )}
                        </Box>
                      </Collapse>
                    </Box>

                    <Divider />

                    {/* Charts Section */}
                    <Box sx={{ p: 1 }}>
                      <ListItemButton
                        onClick={() => toggleSection('charts')}
                        sx={{
                          borderRadius: 1,
                          py: 0.5,
                          px: 1
                        }}
                        dense
                        disabled={!hasResults}
                      >
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          {expandedSections.charts ? <ExpandMoreIcon size={14} /> : <ChevronRightIcon size={14} />}
                        </ListItemIcon>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          <ChartIcon size={14} />
                        </ListItemIcon>
                        <ListItemText
                          primary="Charts"
                          primaryTypographyProps={{ fontSize: '0.75rem', fontWeight: 500 }}
                        />
                        <Chip
                          label={studiesWithCharts.length}
                          size="small"
                          sx={{
                            height: 16,
                            fontSize: '0.65rem',
                            bgcolor: studiesWithCharts.length > 0 ? 'info.main' : 'grey.400',
                            color: 'white'
                          }}
                        />
                      </ListItemButton>

                      <Collapse in={expandedSections.charts} timeout={200}>
                        <Box sx={{ pl: 1, maxHeight: '200px', overflow: 'auto' }}>
                          {studiesWithCharts.length === 0 ? (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                p: 1,
                                fontSize: '0.75rem',
                                fontStyle: 'italic'
                              }}
                            >
                              No studies with results available
                            </Typography>
                          ) : (
                            studiesWithCharts.map((study) => (
                              <Box key={study.id} sx={{ mb: 1 }}>
                                {/* Study Header */}
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    display: 'block',
                                    px: 1,
                                    py: 0.5,
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    bgcolor: 'grey.100',
                                    borderRadius: 0
                                  }}
                                >
                                  {study.name}
                                </Typography>

                                {/* Chart Types for this Study */}
                                {chartTypes.map((chart) => (
                                  <ListItemButton
                                    key={`${study.id}-${chart.key}`}
                                    onClick={() => handleChartNavigation(chart.key, study.id)}
                                    selected={
                                      currentSession?.id === study.id &&
                                      currentChartType === chart.key
                                    }
                                    sx={{
                                      borderRadius: 0,
                                      py: 0.25,
                                      px: 2,
                                      mb: 0.25,
                                      ml: 1,
                                      '&.Mui-selected': {
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        '& .MuiListItemText-secondary': { color: 'rgba(255,255,255,0.7)' }
                                      }
                                    }}
                                    dense
                                  >
                                    <ListItemText
                                      primary={chart.label}
                                      secondary={`${study.parameters.pairs.length} pair(s)`}
                                      primaryTypographyProps={{ fontSize: '0.7rem' }}
                                      secondaryTypographyProps={{ fontSize: '0.6rem' }}
                                    />
                                  </ListItemButton>
                                ))}
                              </Box>
                            ))
                          )}
                        </Box>
                      </Collapse>
                    </Box>

                    <Divider />

                    {/* Tables Section */}
                    <Box sx={{ p: 1 }}>
                      <ListItemButton
                        onClick={() => toggleSection('tables')}
                        sx={{
                          borderRadius: 1,
                          py: 0.5,
                          px: 1
                        }}
                        dense
                        disabled={!hasResults}
                      >
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          {expandedSections.tables ? <ExpandMoreIcon size={14} /> : <ChevronRightIcon size={14} />}
                        </ListItemIcon>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          <TableIcon size={14} />
                        </ListItemIcon>
                        <ListItemText
                          primary="Data Tables"
                          primaryTypographyProps={{ fontSize: '0.75rem', fontWeight: 500 }}
                        />
                        <Chip
                          label={hasResults ? currentSession?.results?.pairs_results.length || 0 : 0}
                          size="small"
                          sx={{
                            height: 16,
                            fontSize: '0.65rem',
                            bgcolor: hasResults ? 'info.main' : 'grey.400',
                            color: 'white'
                          }}
                        />
                      </ListItemButton>

                      <Collapse in={expandedSections.tables} timeout={200}>
                        <Box sx={{ pl: 1 }}>
                          <ListItemButton
                            onClick={() => setShowDataModal(true)}
                            disabled={!hasResults}
                            sx={{
                              borderRadius: 1,
                              py: 0.25,
                              px: 1,
                              mb: 0.25
                            }}
                            dense
                          >
                            <ListItemText
                              primary="View All Data Tables"
                              primaryTypographyProps={{ fontSize: '0.75rem' }}
                            />
                          </ListItemButton>

                          {hasResults && currentSession?.results?.pairs_results.map((pairResult) => (
                            <ListItemButton
                              key={pairResult.pair_name}
                              onClick={() => setShowDataModal(true)}
                              sx={{
                                borderRadius: 1,
                                py: 0.25,
                                px: 1,
                                mb: 0.25,
                                pl: 2
                              }}
                              dense
                            >
                              <ListItemText
                                primary={pairResult.pair_name}
                                secondary={`${pairResult.individual_results.length} rows`}
                                primaryTypographyProps={{ fontSize: '0.7rem' }}
                                secondaryTypographyProps={{ fontSize: '0.6rem' }}
                              />
                            </ListItemButton>
                          ))}
                        </Box>
                      </Collapse>
                    </Box>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
          </Paper>
        </motion.div>
      </Box>

      {/* Data Tables Modal */}
      <DataTablesModal
        open={showDataModal}
        onClose={() => setShowDataModal(false)}
      />
    </>
  );
};