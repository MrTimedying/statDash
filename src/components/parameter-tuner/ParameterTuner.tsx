import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Button,
  Tabs,
  Tab,
  Chip,
  Stack,
  InputAdornment
} from '@mui/material';
import {
  Tune as TuneIcon,
  Add as AddIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import {
  GlobalSimulationSettings,
  AnalysisSettings,
  TestType
} from '../../types/simulation.types';

interface ParameterTunerProps {
  globalSettings: GlobalSimulationSettings;
  analysisSettings: AnalysisSettings;
  onGlobalSettingsChange: (settings: Partial<GlobalSimulationSettings>) => void;
  onAnalysisSettingsChange: (settings: Partial<AnalysisSettings>) => void;
}

export const ParameterTuner: React.FC<ParameterTunerProps> = ({
  globalSettings,
  analysisSettings,
  onGlobalSettingsChange,
  onAnalysisSettingsChange
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [newThresholdValue, setNewThresholdValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSignificanceLevelsChange = (levels: number[]) => {
    onGlobalSettingsChange({ significance_levels: levels });
  };

  const addSignificanceLevel = () => {
    const newLevel = 0.05;
    if (!globalSettings.significance_levels.includes(newLevel)) {
      handleSignificanceLevelsChange([...globalSettings.significance_levels, newLevel].sort());
    }
  };

  const removeSignificanceLevel = (level: number) => {
    if (globalSettings.significance_levels.length > 1) {
      handleSignificanceLevelsChange(globalSettings.significance_levels.filter(l => l !== level));
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Determine which tab should be highlighted based on search query
  const getHighlightedTab = () => {
    if (!searchQuery.trim()) return null;

    const query = searchQuery.toLowerCase();

    // Define keywords for each tab
    const tabKeywords = {
      0: ['simulation', 'simulations', 'test', 'welch', 'pooled', 'mann', 'confidence', 'level'], // Simulation tab
      1: ['significance', 'alpha', 'threshold', 'p-value', 'pvalue'], // Significance tab
      2: ['analysis', 'power', 'effect', 'size', 'target'] // Analysis tab
    };

    for (const [tabIndex, keywords] of Object.entries(tabKeywords)) {
      if (keywords.some(keyword => query.includes(keyword))) {
        return parseInt(tabIndex);
      }
    }

    return null;
  };

  const highlightedTab = getHighlightedTab();

  // Auto-switch to highlighted tab when searching
  React.useEffect(() => {
    if (highlightedTab !== null && highlightedTab !== activeTab) {
      setActiveTab(highlightedTab);
    }
  }, [highlightedTab, activeTab]);

  const handleAddThreshold = () => {
    const newThreshold = parseFloat(newThresholdValue);
    if (!isNaN(newThreshold) && newThreshold > 0 && newThreshold < 1 &&
        !globalSettings.significance_levels.includes(newThreshold)) {
      const updatedLevels = [...globalSettings.significance_levels, newThreshold].sort((a, b) => b - a);
      onGlobalSettingsChange({ significance_levels: updatedLevels });
      setNewThresholdValue('');
    }
  };

  const handleRemoveThreshold = (threshold: number) => {
    if (globalSettings.significance_levels.length > 1) {
      const updatedLevels = globalSettings.significance_levels.filter(level => level !== threshold);
      onGlobalSettingsChange({ significance_levels: updatedLevels });
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', borderLeft: '1px solid', borderColor: 'divider' }}>
      {/* Header */}
      <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <TuneIcon sx={{ fontSize: 16 }} />
          <Typography variant="subtitle2" sx={{ fontSize: '12px', fontWeight: 600 }}>
            Parameters
          </Typography>
        </Box>
        <TextField
          size="small"
          placeholder="Search parameters..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 16 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: '100%',
            '& .MuiInputBase-root': { height: '32px', fontSize: '12px' }
          }}
        />
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth" sx={{ minHeight: 32 }}>
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                Simulation
                {highlightedTab === 0 && searchQuery && (
                  <Box sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    animation: 'pulse 1.5s infinite'
                  }} />
                )}
              </Box>
            }
            sx={{ fontSize: '11px', minHeight: 32, py: 0.5 }}
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                Significance
                {highlightedTab === 1 && searchQuery && (
                  <Box sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    animation: 'pulse 1.5s infinite'
                  }} />
                )}
              </Box>
            }
            sx={{ fontSize: '11px', minHeight: 32, py: 0.5 }}
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                Analysis
                {highlightedTab === 2 && searchQuery && (
                  <Box sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    animation: 'pulse 1.5s infinite'
                  }} />
                )}
              </Box>
            }
            sx={{ fontSize: '11px', minHeight: 32, py: 0.5 }}
          />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2, pt: 2.5 }}>
        {/* Simulation Tab */}
        {activeTab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {/* Simulations and Confidence Level - Same Row */}
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <TextField
                label="Simulations"
                type="number"
                size="small"
                value={globalSettings.num_simulations}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1000;
                  const clampedValue = Math.max(100, Math.min(10000, value));
                  onGlobalSettingsChange({ num_simulations: clampedValue });
                }}
                inputProps={{ min: 100, max: 10000, step: 100 }}
                sx={{
                  flex: 1,
                  '& .MuiInputBase-root': { height: '36px', fontSize: '12px' }
                }}
              />
              <TextField
                label="Confidence (%)"
                type="number"
                size="small"
                value={(globalSettings.confidence_level * 100).toFixed(0)}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 95;
                  const clampedValue = Math.max(80, Math.min(99, value));
                  onGlobalSettingsChange({ confidence_level: clampedValue / 100 });
                }}
                inputProps={{ min: 80, max: 99, step: 1 }}
                sx={{
                  flex: 1,
                  '& .MuiInputBase-root': { height: '36px', fontSize: '12px' }
                }}
              />
            </Box>

            <FormControl size="small" fullWidth>
              <InputLabel sx={{ fontSize: '12px' }}>Test Type</InputLabel>
              <Select
                value={globalSettings.test_type}
                label="Test Type"
                onChange={(e) => onGlobalSettingsChange({ test_type: e.target.value as TestType })}
                sx={{ height: '36px', fontSize: '12px' }}
              >
                <MenuItem value="welch" sx={{ fontSize: '12px' }}>Welch's t-test</MenuItem>
                <MenuItem value="pooled" sx={{ fontSize: '12px' }}>Pooled t-test</MenuItem>
                <MenuItem value="mann_whitney" sx={{ fontSize: '12px' }}>Mann-Whitney U</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}

        {/* Significance Tab */}
        {activeTab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography variant="body2" sx={{ fontSize: '12px', fontWeight: 500 }}>
              Significance Thresholds
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {globalSettings.significance_levels.map((level) => (
                <Chip
                  key={level}
                  label={`α = ${level}`}
                  size="small"
                  onDelete={globalSettings.significance_levels.length > 1 ? () => handleRemoveThreshold(level) : undefined}
                  sx={{
                    fontSize: '11px',
                    height: 28,
                    '& .MuiChip-deleteIcon': { fontSize: '14px' }
                  }}
                />
              ))}
            </Stack>

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="0.05"
                value={newThresholdValue}
                onChange={(e) => setNewThresholdValue(e.target.value)}
                inputProps={{ step: 0.001, min: 0.001, max: 0.5 }}
                sx={{ width: 80, '& .MuiInputBase-root': { height: '32px', fontSize: '12px' } }}
              />
              <Button
                size="small"
                onClick={handleAddThreshold}
                disabled={!newThresholdValue || globalSettings.significance_levels.length >= 5}
                startIcon={<AddIcon />}
                sx={{ fontSize: '11px', textTransform: 'none' }}
              >
                Add
              </Button>
            </Box>

            <Typography variant="caption" sx={{ fontSize: '10px', color: 'text.secondary' }}>
              These thresholds will be reflected in p-value charts and results table
            </Typography>
          </Box>
        )}

        {/* Analysis Tab */}
        {activeTab === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <TextField
              label="Target Power"
              type="number"
              size="small"
              value={analysisSettings.power_analysis_settings.target_power}
              onChange={(e) => onAnalysisSettingsChange({
                power_analysis_settings: {
                  ...analysisSettings.power_analysis_settings,
                  target_power: parseFloat(e.target.value) || 0.8
                }
              })}
              inputProps={{ min: 0.5, max: 0.99, step: 0.05 }}
              sx={{ '& .MuiInputBase-root': { height: '36px', fontSize: '12px' } }}
            />

            <Box>
              <Typography variant="body2" sx={{ fontSize: '12px', color: 'text.secondary', mb: 1 }}>
                Effect Size Thresholds
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {Object.entries(analysisSettings.effect_size_thresholds).map(([key, value]) => (
                  <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontSize: '12px', minWidth: 60, textTransform: 'capitalize' }}>
                      {key}:
                    </Typography>
                    <TextField
                      type="number"
                      size="small"
                      value={value}
                      onChange={(e) => onAnalysisSettingsChange({
                        effect_size_thresholds: {
                          ...analysisSettings.effect_size_thresholds,
                          [key]: parseFloat(e.target.value) || 0
                        }
                      })}
                      inputProps={{ min: 0, max: 2, step: 0.1 }}
                      sx={{
                        flex: 1,
                        '& .MuiInputBase-root': { height: '32px', fontSize: '12px' }
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
        <Typography variant="caption" sx={{ fontSize: '9px', color: 'text.secondary', textAlign: 'center' }}>
          Real-time parameter updates
        </Typography>
      </Box>
    </Box>
  );
};