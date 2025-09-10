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
  Switch,
  FormControlLabel,
  Divider,
  Button,
  Tooltip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  Tune as TuneIcon,
  Assessment as AssessmentIcon,
  Palette as PaletteIcon
} from '@mui/icons-material';
import {
  GlobalSimulationSettings,
  UIPreferences,
  AnalysisSettings,
  TestType,
  ThemeType
} from '../types/simulation.types';

interface ParameterTunerProps {
  globalSettings: GlobalSimulationSettings;
  uiPreferences: UIPreferences;
  analysisSettings: AnalysisSettings;
  onGlobalSettingsChange: (settings: Partial<GlobalSimulationSettings>) => void;
  onUIPreferencesChange: (preferences: Partial<UIPreferences>) => void;
  onAnalysisSettingsChange: (settings: Partial<AnalysisSettings>) => void;
}

export const ParameterTuner: React.FC<ParameterTunerProps> = ({
  globalSettings,
  uiPreferences,
  analysisSettings,
  onGlobalSettingsChange,
  onUIPreferencesChange,
  onAnalysisSettingsChange
}) => {
  const [expanded, setExpanded] = useState<string | false>('simulation');

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

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

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      {/* Header */}
      <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1 }}>
          <TuneIcon sx={{ fontSize: 16 }} />
          <Typography variant="subtitle2" sx={{ fontSize: '12px', fontWeight: 600 }}>
            Parameters
          </Typography>
        </Box>
      </Box>

      {/* Parameter Sections */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
        {/* Simulation Settings */}
        <Accordion
          expanded={expanded === 'simulation'}
          onChange={handleAccordionChange('simulation')}
          sx={{
            '& .MuiAccordionSummary-root': { minHeight: 32, px: 1 },
            '& .MuiAccordionSummary-content': { my: 0.5 },
            '& .MuiAccordionDetails-root': { px: 1, pb: 1 },
            boxShadow: 'none',
            border: 'none',
            '&:before': { display: 'none' }
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 16 }} />}>
            <Typography variant="caption" sx={{ fontSize: '11px', fontWeight: 600 }}>
              Simulation
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <TextField
                label="Simulations"
                type="number"
                size="small"
                value={globalSettings.num_simulations}
                onChange={(e) => onGlobalSettingsChange({ num_simulations: parseInt(e.target.value) || 1000 })}
                inputProps={{ min: 100, max: 100000, step: 100 }}
                sx={{ '& .MuiInputBase-root': { height: '32px', fontSize: '11px' } }}
              />

              <FormControl size="small" fullWidth>
                <InputLabel sx={{ fontSize: '11px' }}>Test Type</InputLabel>
                <Select
                  value={globalSettings.test_type}
                  label="Test Type"
                  onChange={(e) => onGlobalSettingsChange({ test_type: e.target.value as TestType })}
                  sx={{ height: '32px', fontSize: '11px' }}
                >
                  <MenuItem value="welch" sx={{ fontSize: '11px' }}>Welch's t-test</MenuItem>
                  <MenuItem value="pooled" sx={{ fontSize: '11px' }}>Pooled t-test</MenuItem>
                  <MenuItem value="mann_whitney" sx={{ fontSize: '11px' }}>Mann-Whitney U</MenuItem>
                </Select>
              </FormControl>

              <Box>
                <Typography variant="caption" sx={{ fontSize: '10px', color: 'text.secondary', mb: 0.5 }}>
                  Confidence Level
                </Typography>
                <Slider
                  value={globalSettings.confidence_level}
                  onChange={(_, value) => onGlobalSettingsChange({ confidence_level: value as number })}
                  min={0.8}
                  max={0.99}
                  step={0.01}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${(value * 100).toFixed(0)}%`}
                  size="small"
                  sx={{ mx: 1 }}
                />
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>

        <Divider />

        {/* Significance Levels */}
        <Accordion
          expanded={expanded === 'significance'}
          onChange={handleAccordionChange('significance')}
          sx={{
            '& .MuiAccordionSummary-root': { minHeight: 32, px: 1 },
            '& .MuiAccordionSummary-content': { my: 0.5 },
            '& .MuiAccordionDetails-root': { px: 1, pb: 1 },
            boxShadow: 'none',
            border: 'none',
            '&:before': { display: 'none' }
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 16 }} />}>
            <Typography variant="caption" sx={{ fontSize: '11px', fontWeight: 600 }}>
              Significance
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {globalSettings.significance_levels.map((level, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TextField
                    type="number"
                    size="small"
                    value={level}
                    onChange={(e) => {
                      const newLevels = [...globalSettings.significance_levels];
                      newLevels[index] = parseFloat(e.target.value) || 0.05;
                      handleSignificanceLevelsChange(newLevels.sort());
                    }}
                    inputProps={{ min: 0.001, max: 0.5, step: 0.001 }}
                    sx={{
                      flex: 1,
                      '& .MuiInputBase-root': { height: '28px', fontSize: '11px' },
                      '& .MuiInputBase-input': { textAlign: 'center' }
                    }}
                  />
                  <Typography variant="caption" sx={{ fontSize: '10px', minWidth: 20 }}>
                    α = {level}
                  </Typography>
                  {globalSettings.significance_levels.length > 1 && (
                    <IconButton
                      size="small"
                      onClick={() => removeSignificanceLevel(level)}
                      sx={{ p: 0.25 }}
                    >
                      <Typography variant="caption" sx={{ fontSize: '12px', color: 'error.main' }}>×</Typography>
                    </IconButton>
                  )}
                </Box>
              ))}

              <Button
                size="small"
                onClick={addSignificanceLevel}
                disabled={globalSettings.significance_levels.length >= 5}
                sx={{ height: 24, fontSize: '10px', textTransform: 'none' }}
              >
                + Add Level
              </Button>
            </Box>
          </AccordionDetails>
        </Accordion>

        <Divider />

        {/* Analysis Settings */}
        <Accordion
          expanded={expanded === 'analysis'}
          onChange={handleAccordionChange('analysis')}
          sx={{
            '& .MuiAccordionSummary-root': { minHeight: 32, px: 1 },
            '& .MuiAccordionSummary-content': { my: 0.5 },
            '& .MuiAccordionDetails-root': { px: 1, pb: 1 },
            boxShadow: 'none',
            border: 'none',
            '&:before': { display: 'none' }
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 16 }} />}>
            <Typography variant="caption" sx={{ fontSize: '11px', fontWeight: 600 }}>
              Analysis
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
                sx={{ '& .MuiInputBase-root': { height: '32px', fontSize: '11px' } }}
              />

              <Box>
                <Typography variant="caption" sx={{ fontSize: '10px', color: 'text.secondary', mb: 0.5 }}>
                  Effect Size Thresholds
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {Object.entries(analysisSettings.effect_size_thresholds).map(([key, value]) => (
                    <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="caption" sx={{ fontSize: '9px', minWidth: 35, textTransform: 'capitalize' }}>
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
                          '& .MuiInputBase-root': { height: '24px', fontSize: '10px' }
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>

        <Divider />

        {/* UI Preferences */}
        <Accordion
          expanded={expanded === 'ui'}
          onChange={handleAccordionChange('ui')}
          sx={{
            '& .MuiAccordionSummary-root': { minHeight: 32, px: 1 },
            '& .MuiAccordionSummary-content': { my: 0.5 },
            '& .MuiAccordionDetails-root': { px: 1, pb: 1 },
            boxShadow: 'none',
            border: 'none',
            '&:before': { display: 'none' }
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 16 }} />}>
            <Typography variant="caption" sx={{ fontSize: '11px', fontWeight: 600 }}>
              Display
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <TextField
                label="Decimal Places"
                type="number"
                size="small"
                value={uiPreferences.decimal_places}
                onChange={(e) => onUIPreferencesChange({ decimal_places: parseInt(e.target.value) || 3 })}
                inputProps={{ min: 1, max: 6 }}
                sx={{ '& .MuiInputBase-root': { height: '32px', fontSize: '11px' } }}
              />

              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={uiPreferences.chart_animations}
                    onChange={(e) => onUIPreferencesChange({ chart_animations: e.target.checked })}
                  />
                }
                label={<Typography variant="caption" sx={{ fontSize: '10px' }}>Animations</Typography>}
                sx={{ mx: 0 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={uiPreferences.color_blind_safe}
                    onChange={(e) => onUIPreferencesChange({ color_blind_safe: e.target.checked })}
                  />
                }
                label={<Typography variant="caption" sx={{ fontSize: '10px' }}>Color Blind Safe</Typography>}
                sx={{ mx: 0 }}
              />

              <FormControl size="small" fullWidth>
                <InputLabel sx={{ fontSize: '11px' }}>Theme</InputLabel>
                <Select
                  value={uiPreferences.theme}
                  label="Theme"
                  onChange={(e) => onUIPreferencesChange({ theme: e.target.value as ThemeType })}
                  sx={{ height: '32px', fontSize: '11px' }}
                >
                  <MenuItem value="light" sx={{ fontSize: '11px' }}>Light</MenuItem>
                  <MenuItem value="dark" sx={{ fontSize: '11px' }}>Dark</MenuItem>
                  <MenuItem value="auto" sx={{ fontSize: '11px' }}>Auto</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </AccordionDetails>
        </Accordion>
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