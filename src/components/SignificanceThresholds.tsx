import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Button,
  Box,
  TextField,
  Chip,
  Tooltip,
  Typography,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Close as CloseIcon
} from '@mui/icons-material';


interface SignificanceThresholdsProps {
  thresholds: number[];
  onThresholdsChange: (thresholds: number[]) => void;
  maxThresholds?: number;
}

export const SignificanceThresholds: React.FC<SignificanceThresholdsProps> = ({
  thresholds,
  onThresholdsChange,
  maxThresholds = 6
}) => {
  const [newThreshold, setNewThreshold] = useState<number | null>(null);
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Standard significance levels
  const standardThresholds = [0.001, 0.01, 0.05, 0.10];

  const handleAddStandardThreshold = (threshold: number) => {
    if (!thresholds.includes(threshold) && thresholds.length < maxThresholds) {
      onThresholdsChange([...thresholds, threshold].sort((a, b) => a - b));
    }
  };

  const handleAddCustomThreshold = () => {
    if (newThreshold !== null && !thresholds.includes(newThreshold) && thresholds.length < maxThresholds) {
      if (newThreshold > 0 && newThreshold < 1) {
        onThresholdsChange([...thresholds, newThreshold].sort((a, b) => a - b));
        setNewThreshold(null);
        setShowCustomInput(false);
      }
    }
  };

  const handleRemoveThreshold = (threshold: number) => {
    onThresholdsChange(thresholds.filter(t => t !== threshold));
  };

  const getThresholdLabel = (threshold: number): string => {
    switch (threshold) {
      case 0.001: return 'Very Strict (α = 0.001)';
      case 0.01: return 'Strict (α = 0.01)';
      case 0.05: return 'Standard (α = 0.05)';
      case 0.10: return 'Liberal (α = 0.10)';
      default: return `Custom (α = ${threshold})`;
    }
  };

  const getThresholdColor = (threshold: number): 'error' | 'warning' | 'info' | 'secondary' => {
    if (threshold <= 0.01) return 'error';
    if (threshold <= 0.05) return 'warning';
    if (threshold <= 0.10) return 'info';
    return 'secondary';
  };

  const getThresholdIcon = (threshold: number) => {
    if (threshold <= 0.01) return <CheckCircleIcon sx={{ color: 'error.main' }} />;
    if (threshold <= 0.05) return <WarningIcon sx={{ color: 'warning.main' }} />;
    return <InfoIcon sx={{ color: 'info.main' }} />;
  };

  const getThresholdDescription = (threshold: number): string => {
    if (threshold === 0.001) return 'Very conservative - reduces false positives but may miss real effects';
    if (threshold === 0.01) return 'Conservative - good balance for most research';
    if (threshold === 0.05) return 'Standard threshold used in most scientific research';
    if (threshold === 0.10) return 'Liberal - increases power but raises false positive risk';
    return 'Custom threshold - use with caution and clear justification';
  };

  return (
    <Card variant="outlined" sx={{ fontSize: '12px' }}>
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Current Thresholds */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
              Active ({thresholds.length}/{maxThresholds})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {thresholds.map(threshold => (
                <Chip
                  key={threshold}
                  label={`α = ${threshold}`}
                  color={getThresholdColor(threshold) as any}
                  size="small"
                  onDelete={() => handleRemoveThreshold(threshold)}
                  sx={{ fontSize: '11px', height: '24px' }}
                />
              ))}
            </Box>
            {thresholds.length === 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No thresholds configured
              </Typography>
            )}
          </Box>

          {/* Standard Thresholds */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
              Quick Add
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {standardThresholds.map(threshold => {
                const isActive = thresholds.includes(threshold);
                return (
                  <Button
                    key={threshold}
                    variant={isActive ? 'contained' : 'outlined'}
                    size="small"
                    disabled={isActive || thresholds.length >= maxThresholds}
                    onClick={() => handleAddStandardThreshold(threshold)}
                    sx={{ fontSize: '11px', height: '24px', minWidth: 'auto', px: 1 }}
                  >
                    α = {threshold}
                  </Button>
                );
              })}
            </Box>
          </Box>

          {/* Custom Threshold */}
          <Box>
            {!showCustomInput ? (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setShowCustomInput(true)}
                disabled={thresholds.length >= maxThresholds}
                size="small"
                sx={{ fontSize: '11px', height: '24px' }}
              >
                Custom
              </Button>
            ) : (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  placeholder="α value"
                  type="number"
                  inputProps={{
                    min: 0.001,
                    max: 0.999,
                    step: 0.001
                  }}
                  value={newThreshold || ''}
                  onChange={(e) => setNewThreshold(parseFloat(e.target.value) || null)}
                  size="small"
                  sx={{ fontSize: '11px', flex: 1 }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddCustomThreshold}
                  disabled={
                    newThreshold === null ||
                    thresholds.includes(newThreshold) ||
                    newThreshold <= 0 ||
                    newThreshold >= 1
                  }
                  size="small"
                  sx={{ fontSize: '11px' }}
                >
                  Add
                </Button>
                <IconButton
                  onClick={() => {
                    setShowCustomInput(false);
                    setNewThreshold(null);
                  }}
                  size="small"
                  sx={{ fontSize: '11px' }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};