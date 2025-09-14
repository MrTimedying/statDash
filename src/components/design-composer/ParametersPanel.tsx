import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Stack,
  Grid,
  Paper,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import {
  GlobalSimulationSettings,
  AnalysisSettings,
  TestType
} from '../../types/simulation.types';

interface ParametersPanelProps {
  globalSettings: GlobalSimulationSettings;
  analysisSettings: AnalysisSettings;
  onGlobalSettingsChange: (settings: Partial<GlobalSimulationSettings>) => void;
  onAnalysisSettingsChange: (settings: Partial<AnalysisSettings>) => void;
}

export const ParametersPanel: React.FC<ParametersPanelProps> = ({
  globalSettings,
  analysisSettings,
  onGlobalSettingsChange,
  onAnalysisSettingsChange
}) => {
  const [newThresholdValue, setNewThresholdValue] = useState('');

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
    <Box sx={{
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      px: 2
    }}>
      <Box sx={{ width: '50%', minWidth: '400px' }}>
        <Stack spacing={3} sx={{ alignItems: 'stretch' }}>
          {/* Simulation Settings */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 500, mb: 2, fontSize: '0.9rem', textAlign: 'center' }}>
              Simulation Configuration
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                  Number of Simulations
                </Typography>
                <TextField
                  size="small"
                  type="number"
                  value={globalSettings.num_simulations}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1000;
                    const clampedValue = Math.max(100, Math.min(10000, value));
                    onGlobalSettingsChange({ num_simulations: clampedValue });
                  }}
                  inputProps={{ min: 100, max: 10000, step: 100 }}
                  sx={{
                    width: 120,
                    '& .MuiOutlinedInput-root': { borderRadius: 0 }
                  }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block' }}>
                More simulations provide more precise estimates but take longer to compute
              </Typography>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', opacity: 0.3, mb: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                  Confidence Level
                </Typography>
                <TextField
                  size="small"
                  type="number"
                  value={(globalSettings.confidence_level * 100).toFixed(0)}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 95;
                    const clampedValue = Math.max(80, Math.min(99, value));
                    onGlobalSettingsChange({ confidence_level: clampedValue / 100 });
                  }}
                  inputProps={{ min: 80, max: 99, step: 1 }}
                  sx={{
                    width: 120,
                    '& .MuiOutlinedInput-root': { borderRadius: 0 }
                  }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block' }}>
                Probability that confidence intervals contain the true parameter value
              </Typography>
            </Box>
          </Box>

          {/* Significance Levels */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 500, mb: 2, fontSize: '0.9rem', textAlign: 'center' }}>
              Significance Thresholds
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem', mb: 1 }}>
                Alpha Levels
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1 }}>
                {globalSettings.significance_levels.map((level) => (
                  <Chip
                    key={level}
                    label={`α = ${level}`}
                    size="small"
                    onDelete={globalSettings.significance_levels.length > 1 ? () => handleRemoveThreshold(level) : undefined}
                    sx={{ fontSize: '0.7rem', borderRadius: 0, height: 24 }}
                  />
                ))}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', mb: 1.5 }}>
                Probability thresholds for rejecting the null hypothesis (Type I error rates)
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
                <TextField
                  size="small"
                  placeholder="0.05"
                  value={newThresholdValue}
                  onChange={(e) => setNewThresholdValue(e.target.value)}
                  inputProps={{ step: 0.001, min: 0.001, max: 0.5 }}
                  sx={{
                    width: 100,
                    '& .MuiOutlinedInput-root': { borderRadius: 0 }
                  }}
                />
                <Button
                  size="small"
                  onClick={handleAddThreshold}
                  disabled={!newThresholdValue || globalSettings.significance_levels.length >= 5}
                  startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                  variant="outlined"
                  sx={{
                    textTransform: 'none',
                    borderRadius: 0,
                    fontSize: '0.75rem'
                  }}
                >
                  Add
                </Button>
              </Box>
            </Box>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', opacity: 0.3, mb: 3 }} />

          {/* Effect Size Thresholds */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 500, mb: 2, fontSize: '0.9rem', textAlign: 'center' }}>
              Effect Size Categories
            </Typography>

            <Stack spacing={2}>
              {Object.entries(analysisSettings.effect_size_thresholds).map(([key, value], index, array) => (
                <Box key={key}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                      {key.charAt(0).toUpperCase() + key.slice(1)} Effect
                    </Typography>
                    <TextField
                      size="small"
                      type="number"
                      value={value}
                      onChange={(e) => onAnalysisSettingsChange({
                        effect_size_thresholds: {
                          ...analysisSettings.effect_size_thresholds,
                          [key]: parseFloat(e.target.value) || 0
                        }
                      })}
                      inputProps={{ min: 0, max: 2, step: 0.1 }}
                      sx={{
                        width: 120,
                        '& .MuiOutlinedInput-root': { borderRadius: 0 }
                      }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block' }}>
                    {key === 'negligible' && 'Cohen\'s d threshold for effects considered practically insignificant'}
                    {key === 'small' && 'Threshold for small but meaningful practical differences'}
                    {key === 'medium' && 'Moderate effect size threshold, often considered clinically relevant'}
                    {key === 'large' && 'Threshold for effects considered practically significant'}
                  </Typography>
                  {index < array.length - 1 && (
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', opacity: 0.3, mt: 2 }} />
                  )}
                </Box>
              ))}
            </Stack>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', opacity: 0.3, my: 3 }} />

          {/* Power Analysis */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 500, mb: 2, fontSize: '0.9rem', textAlign: 'center' }}>
              Power Analysis
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                  Target Power
                </Typography>
                <TextField
                  size="small"
                  type="number"
                  value={analysisSettings.power_analysis_settings.target_power}
                  onChange={(e) => onAnalysisSettingsChange({
                    power_analysis_settings: {
                      ...analysisSettings.power_analysis_settings,
                      target_power: parseFloat(e.target.value) || 0.8
                    }
                  })}
                  inputProps={{ min: 0.5, max: 0.99, step: 0.05 }}
                  sx={{
                    width: 120,
                    '& .MuiOutlinedInput-root': { borderRadius: 0 }
                  }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block' }}>
                Probability of detecting an effect if it truly exists (1 - β, where β is Type II error)
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};