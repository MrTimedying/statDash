import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  Psychology as DesignIcon,
  Settings as ParametersIcon,
  List as ThreadsIcon,
  Functions as StatisticsIcon
} from '@mui/icons-material';
import { Calculator, BarChart3, TrendingUp } from 'lucide-react';
import { ThreadsBuilder } from './ThreadsBuilder';
import { ParametersPanel } from './ParametersPanel';
import { SamplePair, GlobalSimulationSettings, AnalysisSettings } from '../../types/simulation.types';
import { useSimulationStore } from '../../stores/simulation.store';

interface DesignComposerProps {
  open: boolean;
  onClose: () => void;
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
      id={`design-composer-tabpanel-${index}`}
      aria-labelledby={`design-composer-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const DesignComposer: React.FC<DesignComposerProps> = ({
  open,
  onClose
}) => {
  const [activeView, setActiveView] = useState<'designs' | 'threads' | 'statistics' | 'parameters'>('designs');
  const [selectedDesign, setSelectedDesign] = useState<string>('two_independent');

  // Get simulation store
  const simulationStore = useSimulationStore();
  const currentSession = simulationStore.currentSession;

  // Local state for composer data
  const [threads, setThreads] = useState<SamplePair[]>(
    currentSession?.parameters.pairs || []
  );

  // Default parameters
  const defaultGlobalSettings: GlobalSimulationSettings = {
    num_simulations: 1000,
    significance_levels: [0.01, 0.05, 0.10],
    confidence_level: 0.95,
    test_type: 'welch'
  };

  const defaultAnalysisSettings: AnalysisSettings = {
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
      theme: 'light'
    }
  };

  const [globalSettings, setGlobalSettings] = useState<GlobalSimulationSettings>(
    currentSession?.parameters.global_settings || defaultGlobalSettings
  );

  const [analysisSettings, setAnalysisSettings] = useState<AnalysisSettings>(
    defaultAnalysisSettings
  );

  const handleDesignSelect = (designType: string) => {
    setSelectedDesign(designType);
    setActiveView('threads'); // Move to Threads view
  };

  const handleCreateStudy = () => {
    // Create new study with current configuration
    const sessionParams = {
      pairs: threads,
      global_settings: globalSettings,
      ui_preferences: {
        theme: 'light' as const,
        decimal_places: 3,
        chart_animations: true,
        color_blind_safe: false
      }
    };

    simulationStore.createSession(sessionParams);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '85vh',
          maxHeight: '85vh',
          m: 2
        }
      }}
    >
      {/* Tight Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          minHeight: 40
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 500, fontSize: '0.9rem' }}>
          Design Composer
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ p: 0.5 }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0, display: 'flex', overflow: 'hidden' }}>
        {/* Left Navigation Menu */}
        <Paper
          elevation={0}
          sx={{
            width: 180,
            borderRight: 1,
            borderColor: 'divider',
            bgcolor: 'grey.50'
          }}
        >
          <List sx={{ p: 0.5 }}>
            <ListItemButton
              selected={activeView === 'designs'}
              onClick={() => setActiveView('designs')}
              sx={{
                borderRadius: 0,
                mb: 0,
                py: 0.75,
                px: 1,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '& .MuiListItemIcon-root': { color: 'white' }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 28 }}>
                <DesignIcon sx={{ fontSize: 16 }} />
              </ListItemIcon>
              <ListItemText
                primary="Design Library"
                primaryTypographyProps={{ fontSize: '0.8rem' }}
              />
            </ListItemButton>

            <ListItemButton
              selected={activeView === 'threads'}
              onClick={() => setActiveView('threads')}
              sx={{
                borderRadius: 0,
                mb: 0,
                py: 0.75,
                px: 1,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '& .MuiListItemIcon-root': { color: 'white' }
                }
              }}
              disabled={!selectedDesign}
            >
              <ListItemIcon sx={{ minWidth: 28 }}>
                <ThreadsIcon sx={{ fontSize: 16 }} />
              </ListItemIcon>
              <ListItemText
                primary="Study Groups"
                primaryTypographyProps={{ fontSize: '0.8rem' }}
              />
            </ListItemButton>

            <ListItemButton
              selected={activeView === 'statistics'}
              onClick={() => setActiveView('statistics')}
              sx={{
                borderRadius: 0,
                mb: 0,
                py: 0.75,
                px: 1,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '& .MuiListItemIcon-root': { color: 'white' }
                }
              }}
              disabled={!selectedDesign}
            >
              <ListItemIcon sx={{ minWidth: 28 }}>
                <StatisticsIcon sx={{ fontSize: 16 }} />
              </ListItemIcon>
              <ListItemText
                primary="Statistical Tests"
                primaryTypographyProps={{ fontSize: '0.8rem' }}
              />
            </ListItemButton>

            <ListItemButton
              selected={activeView === 'parameters'}
              onClick={() => setActiveView('parameters')}
              sx={{
                borderRadius: 0,
                mb: 0,
                py: 0.75,
                px: 1,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '& .MuiListItemIcon-root': { color: 'white' }
                }
              }}
              disabled={!selectedDesign}
            >
              <ListItemIcon sx={{ minWidth: 28 }}>
                <ParametersIcon sx={{ fontSize: 16 }} />
              </ListItemIcon>
              <ListItemText
                primary="Parameters"
                primaryTypographyProps={{ fontSize: '0.8rem' }}
              />
            </ListItemButton>
          </List>
        </Paper>

        {/* Main Content Area */}
        <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          {/* Design Library View */}
          {activeView === 'designs' && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Choose Your Research Design
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Select a research design that matches your research question. Each design comes with specific constraints and recommended analyses.
              </Typography>

              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                {/* Two Independent Groups Card */}
                <Box
                  onClick={() => handleDesignSelect('two_independent')}
                  sx={{
                    p: 3,
                    borderRadius: 0,
                    cursor: 'pointer',
                    bgcolor: '#00bcd4',
                    color: 'white',
                    minHeight: '380px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      bgcolor: '#00acc1',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(0,188,212,0.3)'
                    }
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Typography variant="h5" fontWeight={700} sx={{ fontSize: '1rem' }}>
                        Two Independent Groups
                      </Typography>
                      {selectedDesign === 'two_independent' && (
                        <Box sx={{
                          bgcolor: 'rgba(255,255,255,0.9)',
                          color: '#006064',
                          px: 1,
                          py: 0.25,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          letterSpacing: '0.5px',
                          flexShrink: 0,
                          ml: 1
                        }}>
                          SELECTED
                        </Box>
                      )}
                    </Box>

                    <Typography variant="body2" sx={{ mb: 1.5, fontSize: '0.75rem', lineHeight: 1.4, opacity: 0.95 }}>
                      Compare outcomes between two completely separate groups with no relationship between participants. Each subject belongs to only one group, creating independent samples for statistical comparison.
                    </Typography>

                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontSize: '0.7rem', fontWeight: 600, mb: 0.75, opacity: 0.9 }}>
                        Key Characteristics
                      </Typography>
                      <Box component="ul" sx={{ m: 0, pl: 2, '& li': { mb: 0.25, fontSize: '0.75rem', lineHeight: 1.3 } }}>
                        <li>Independent random sampling from two populations</li>
                        <li>No pairing or matching between groups</li>
                        <li>High statistical power for medium to large effects</li>
                        <li>Robust to minor assumption violations</li>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontSize: '0.7rem', fontWeight: 600, mb: 0.75, opacity: 0.9 }}>
                        Sample Requirements
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', lineHeight: 1.3 }}>
                        Minimum 15-20 participants per group for adequate power. Larger samples (30+) recommended for detecting small effects or when population variances are unknown.
                      </Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      bgcolor: 'rgba(255,255,255,0.15)',
                      px: 2,
                      py: 1,
                      display: 'inline-block',
                      letterSpacing: '0.5px'
                    }}>
                      CLINICAL TRIALS • A/B TESTING • RCTs • COHORT STUDIES
                    </Typography>
                  </Box>
                </Box>

                {/* Two Dependent Groups Card */}
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 0,
                    cursor: 'not-allowed',
                    bgcolor: '#00bcd4',
                    color: 'white',
                    minHeight: '380px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    opacity: 0.7,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      opacity: 0.8,
                      transform: 'translateY(-1px)',
                    }
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Typography variant="h5" fontWeight={700} sx={{ fontSize: '1rem' }}>
                        Two Dependent Groups
                      </Typography>
                      <Box sx={{
                        bgcolor: 'rgba(255,193,7,0.95)',
                        color: '#000',
                        px: 1,
                        py: 0.25,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        letterSpacing: '0.5px',
                        flexShrink: 0,
                        ml: 1
                      }}>
                        COMING SOON
                      </Box>
                    </Box>

                    <Typography variant="body2" sx={{ mb: 1.5, fontSize: '0.75rem', lineHeight: 1.4, opacity: 0.95 }}>
                      Compare outcomes within the same subjects across different conditions or time points. Paired observations from the same participants provide higher statistical power through reduced variance.
                    </Typography>

                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontSize: '0.7rem', fontWeight: 600, mb: 0.75, opacity: 0.9 }}>
                        Key Characteristics
                      </Typography>
                      <Box component="ul" sx={{ m: 0, pl: 2, '& li': { mb: 0.25, fontSize: '0.75rem', lineHeight: 1.3 } }}>
                        <li>Same participants measured under different conditions</li>
                        <li>Controls for individual differences between subjects</li>
                        <li>Higher power than independent groups design</li>
                        <li>Requires careful control for order effects</li>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontSize: '0.7rem', fontWeight: 600, mb: 0.75, opacity: 0.9 }}>
                        Sample Requirements
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', lineHeight: 1.3 }}>
                        Smaller samples needed (10-15 pairs minimum) due to increased power from paired design. Effect of individual differences is eliminated from error term.
                      </Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      bgcolor: 'rgba(255,255,255,0.15)',
                      px: 2,
                      py: 1,
                      display: 'inline-block',
                      letterSpacing: '0.5px'
                    }}>
                      PRE/POST STUDIES • CROSSOVER TRIALS • PAIRED COMPARISONS
                    </Typography>
                  </Box>
                </Box>

                {/* Multi-Group Design Card */}
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 0,
                    cursor: 'not-allowed',
                    bgcolor: '#00bcd4',
                    color: 'white',
                    minHeight: '380px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    opacity: 0.7,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      opacity: 0.8,
                      transform: 'translateY(-1px)',
                    }
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Typography variant="h5" fontWeight={700} sx={{ fontSize: '1rem' }}>
                        Multi-Group Comparison
                      </Typography>
                      <Box sx={{
                        bgcolor: 'rgba(255,193,7,0.95)',
                        color: '#000',
                        px: 1,
                        py: 0.25,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        letterSpacing: '0.5px',
                        flexShrink: 0,
                        ml: 1
                      }}>
                        COMING SOON
                      </Box>
                    </Box>

                    <Typography variant="body2" sx={{ mb: 1.5, fontSize: '0.75rem', lineHeight: 1.4, opacity: 0.95 }}>
                      Compare outcomes across three or more independent groups simultaneously. Utilizes ANOVA framework with multiple comparison corrections to control family-wise error rates.
                    </Typography>

                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontSize: '0.7rem', fontWeight: 600, mb: 0.75, opacity: 0.9 }}>
                        Key Characteristics
                      </Typography>
                      <Box component="ul" sx={{ m: 0, pl: 2, '& li': { mb: 0.25, fontSize: '0.75rem', lineHeight: 1.3 } }}>
                        <li>Simultaneous comparison of multiple independent groups</li>
                        <li>Controls for multiple testing through ANOVA framework</li>
                        <li>Post-hoc tests identify specific group differences</li>
                        <li>Power depends on number of groups and effect sizes</li>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontSize: '0.7rem', fontWeight: 600, mb: 0.75, opacity: 0.9 }}>
                        Sample Requirements
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', lineHeight: 1.3 }}>
                        20-30 participants per group recommended for adequate power. Larger samples needed as number of groups increases to maintain power for pairwise comparisons.
                      </Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      bgcolor: 'rgba(255,255,255,0.15)',
                      px: 2,
                      py: 1,
                      display: 'inline-block',
                      letterSpacing: '0.5px'
                    }}>
                      ANOVA DESIGNS • MULTI-ARM TRIALS • DOSE-RESPONSE STUDIES
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}

          {/* Threads View */}
          {activeView === 'threads' && (
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
                Configure Study Groups
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.8rem' }}>
                Set up your comparison groups with different population parameters.
              </Typography>

              {/* Threads Builder - Space Optimized */}
              <ThreadsBuilder
                threads={threads}
                onThreadsChange={setThreads}
                maxThreads={10}
              />
            </Box>
          )}

          {/* Statistical Tests View */}
          {activeView === 'statistics' && (
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
                Statistical Test Selection
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.8rem' }}>
                Choose the appropriate statistical test based on your data characteristics and research design.
              </Typography>

              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {/* Welch's t-test Card */}
                <Box
                  onClick={() => setGlobalSettings({ ...globalSettings, test_type: 'welch' })}
                  sx={{
                    p: 3,
                    borderRadius: 0,
                    cursor: 'pointer',
                    bgcolor: '#00bcd4',
                    color: 'white',
                    minHeight: '380px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      bgcolor: '#00acc1',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(0,188,212,0.3)'
                    }
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Calculator size={18} />
                        <Typography variant="h5" fontWeight={600} sx={{ fontSize: '1rem' }}>
                          Welch's t-test
                        </Typography>
                      </Box>
                      {globalSettings.test_type === 'welch' && (
                        <Box sx={{
                          bgcolor: 'rgba(255,255,255,0.9)',
                          color: '#006064',
                          px: 1,
                          py: 0.25,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          letterSpacing: '0.5px',
                          flexShrink: 0,
                          ml: 1
                        }}>
                          SELECTED
                        </Box>
                      )}
                    </Box>

                    <Typography variant="body2" sx={{ mb: 1.5, fontSize: '0.75rem', lineHeight: 1.4, opacity: 0.95 }}>
                      The gold standard for comparing two independent groups. Does not assume equal population variances, making it robust for real-world data with unequal group sizes or heteroscedasticity.
                    </Typography>

                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontSize: '0.7rem', fontWeight: 500, mb: 0.75, opacity: 0.9 }}>
                        Key Advantages
                      </Typography>
                      <Box component="ul" sx={{ m: 0, pl: 2, '& li': { mb: 0.25, fontSize: '0.75rem', lineHeight: 1.3 } }}>
                        <li>Automatically handles unequal variances (heteroscedasticity)</li>
                        <li>Works optimally with unequal sample sizes</li>
                        <li>More conservative p-values reduce Type I error risk</li>
                        <li>Robust performance across diverse data conditions</li>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontSize: '0.7rem', fontWeight: 500, mb: 0.75, opacity: 0.9 }}>
                        Statistical Properties
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', lineHeight: 1.3 }}>
                        Uses Satterthwaite approximation for degrees of freedom. Maintains nominal Type I error rates even when population variances differ substantially. Recommended by most statistical authorities.
                      </Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      bgcolor: 'rgba(255,255,255,0.15)',
                      px: 2,
                      py: 1,
                      display: 'inline-block',
                      letterSpacing: '0.5px'
                    }}>
                      CLINICAL TRIALS • OBSERVATIONAL STUDIES • A/B TESTS • DEFAULT CHOICE
                    </Typography>
                  </Box>
                </Box>

                {/* Pooled t-test Card */}
                <Box
                  onClick={() => setGlobalSettings({ ...globalSettings, test_type: 'pooled' })}
                  sx={{
                    p: 3,
                    borderRadius: 0,
                    cursor: 'pointer',
                    bgcolor: '#00bcd4',
                    color: 'white',
                    minHeight: '380px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      bgcolor: '#00acc1',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(0,188,212,0.3)'
                    }
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BarChart3 size={18} />
                        <Typography variant="h5" fontWeight={600} sx={{ fontSize: '1rem' }}>
                          Student's t-test
                        </Typography>
                      </Box>
                      {globalSettings.test_type === 'pooled' && (
                        <Box sx={{
                          bgcolor: 'rgba(255,255,255,0.9)',
                          color: '#006064',
                          px: 1,
                          py: 0.25,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          letterSpacing: '0.5px',
                          flexShrink: 0,
                          ml: 1
                        }}>
                          SELECTED
                        </Box>
                      )}
                    </Box>

                    <Typography variant="body2" sx={{ mb: 1.5, fontSize: '0.75rem', lineHeight: 1.4, opacity: 0.95 }}>
                      Classic parametric test that pools variance estimates from both groups. Offers higher statistical power when homoscedasticity assumption is met, but becomes less reliable with unequal variances.
                    </Typography>

                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontSize: '0.7rem', fontWeight: 500, mb: 0.75, opacity: 0.9 }}>
                        Key Characteristics
                      </Typography>
                      <Box component="ul" sx={{ m: 0, pl: 2, '& li': { mb: 0.25, fontSize: '0.75rem', lineHeight: 1.3 } }}>
                        <li>Assumes equal population variances (homoscedasticity)</li>
                        <li>Uses pooled standard deviation estimate</li>
                        <li>Higher statistical power when assumptions are valid</li>
                        <li>Sensitive to variance inequality violations</li>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontSize: '0.7rem', fontWeight: 500, mb: 0.75, opacity: 0.9 }}>
                        When to Use
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', lineHeight: 1.3 }}>
                        Ideal for controlled experiments with similar group sizes and roughly equal variances. Perform Levene's test to verify homoscedasticity assumption before use.
                      </Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      bgcolor: 'rgba(255,255,255,0.15)',
                      px: 2,
                      py: 1,
                      display: 'inline-block',
                      letterSpacing: '0.5px'
                    }}>
                      CONTROLLED EXPERIMENTS • EQUAL GROUP SIZES • LABORATORY STUDIES
                    </Typography>
                  </Box>
                </Box>

                {/* Mann-Whitney U Card */}
                <Box
                  onClick={() => setGlobalSettings({ ...globalSettings, test_type: 'mann_whitney' })}
                  sx={{
                    p: 3,
                    borderRadius: 0,
                    cursor: 'pointer',
                    bgcolor: '#00bcd4',
                    color: 'white',
                    minHeight: '380px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      bgcolor: '#00acc1',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(0,188,212,0.3)'
                    }
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrendingUp size={18} />
                        <Typography variant="h5" fontWeight={600} sx={{ fontSize: '1rem' }}>
                          Mann-Whitney U
                        </Typography>
                      </Box>
                      {globalSettings.test_type === 'mann_whitney' && (
                        <Box sx={{
                          bgcolor: 'rgba(255,255,255,0.9)',
                          color: '#006064',
                          px: 1,
                          py: 0.25,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          letterSpacing: '0.5px',
                          flexShrink: 0,
                          ml: 1
                        }}>
                          SELECTED
                        </Box>
                      )}
                    </Box>

                    <Typography variant="body2" sx={{ mb: 1.5, fontSize: '0.75rem', lineHeight: 1.4, opacity: 0.95 }}>
                      Distribution-free nonparametric test that ranks all observations and compares rank sums. Robust alternative when normality assumptions are violated or data is ordinal.
                    </Typography>

                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontSize: '0.7rem', fontWeight: 500, mb: 0.75, opacity: 0.9 }}>
                        Key Strengths
                      </Typography>
                      <Box component="ul" sx={{ m: 0, pl: 2, '& li': { mb: 0.25, fontSize: '0.75rem', lineHeight: 1.3 } }}>
                        <li>No assumptions about population distributions</li>
                        <li>Handles extreme outliers and heavy skewness</li>
                        <li>Works with ordinal or non-normal continuous data</li>
                        <li>Maintains Type I error rates across data conditions</li>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontSize: '0.7rem', fontWeight: 500, mb: 0.75, opacity: 0.9 }}>
                        Trade-offs
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', lineHeight: 1.3 }}>
                        Lower statistical power than t-tests when data is normally distributed. Uses ranks rather than original values, potentially losing information about magnitude of differences.
                      </Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      bgcolor: 'rgba(255,255,255,0.15)',
                      px: 2,
                      py: 1,
                      display: 'inline-block',
                      letterSpacing: '0.5px'
                    }}>
                      SKEWED DATA • ORDINAL SCALES • SMALL SAMPLES • ROBUST ANALYSIS
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}

          {/* Parameters View */}
          {activeView === 'parameters' && (
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
                Analysis Parameters
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.8rem' }}>
                Configure simulation settings and analysis preferences.
              </Typography>

              {/* Parameters - Space Optimized Panel */}
              <ParametersPanel
                globalSettings={globalSettings}
                analysisSettings={analysisSettings}
                onGlobalSettingsChange={(settings) => {
                  setGlobalSettings({ ...globalSettings, ...settings });
                }}
                onAnalysisSettingsChange={(settings) => {
                  setAnalysisSettings({ ...analysisSettings, ...settings });
                }}
              />
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          variant="contained"
          sx={{ ml: 1 }}
          onClick={handleCreateStudy}
          disabled={threads.length === 0}
        >
          Create Study
        </Button>
      </DialogActions>
    </Dialog>
  );
};