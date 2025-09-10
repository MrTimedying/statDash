// Material UI version of SamplePairManager
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  Box,
  Typography,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Alert,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Edit as EditIcon,
  Science as ScienceIcon,
  Settings as SettingsIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { SamplePair, PopulationParams, DistributionType } from '../types/simulation.types';

interface SamplePairManagerProps {
  pairs: SamplePair[];
  onPairsChange: (pairs: SamplePair[]) => void;
  maxPairs?: number;
}

interface PairFormData {
  name: string;
  description?: string;
  group1_mean: number;
  group1_std: number;
  group2_mean: number;
  group2_std: number;
  sample_size_per_group: number;
  distribution_type: DistributionType;
  enabled: boolean;
}

export const SamplePairManagerMUI: React.FC<SamplePairManagerProps> = ({
  pairs,
  onPairsChange,
  maxPairs = 10
}) => {
  const [editingPair, setEditingPair] = useState<string | null>(null);
  const [formData, setFormData] = useState<PairFormData>({
    name: '',
    description: '',
    group1_mean: 0,
    group1_std: 1,
    group2_mean: 0.5,
    group2_std: 1,
    sample_size_per_group: 30,
    distribution_type: 'normal',
    enabled: true
  });

  const generateId = () => `pair_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const createDefaultPair = (index: number): SamplePair => ({
    id: generateId(),
    name: `Sample Pair ${index + 1}`,
    description: '',
    group1: { mean: 0, std: 1, distribution_type: 'normal' },
    group2: { mean: 0.5, std: 1, distribution_type: 'normal' },
    sample_size_per_group: 30,
    enabled: true,
    color_scheme: getDefaultColor(index)
  });

  const getDefaultColor = (index: number): string => {
    const colors = [
      '#1976d2', '#2e7d32', '#ed6c02', '#d32f2f',
      '#7b1fa2', '#00796b', '#f57c00', '#1976d2',
      '#388e3c', '#f57f17'
    ];
    return colors[index % colors.length];
  };

  const handleAddPair = () => {
    if (pairs.length >= maxPairs) return;
    const newPair = createDefaultPair(pairs.length);
    onPairsChange([...pairs, newPair]);
  };

  const handleDeletePair = (pairId: string) => {
    const updatedPairs = pairs.filter(pair => pair.id !== pairId);
    onPairsChange(updatedPairs);
  };

  const handleClonePair = (pairId: string) => {
    if (pairs.length >= maxPairs) return;
    const pairToClone = pairs.find(pair => pair.id === pairId);
    if (!pairToClone) return;

    const clonedPair: SamplePair = {
      ...pairToClone,
      id: generateId(),
      name: `${pairToClone.name} (Copy)`,
      color_scheme: getDefaultColor(pairs.length)
    };

    onPairsChange([...pairs, clonedPair]);
  };

  const handleTogglePair = (pairId: string, enabled: boolean) => {
    const updatedPairs = pairs.map(pair =>
      pair.id === pairId ? { ...pair, enabled } : pair
    );
    onPairsChange(updatedPairs);
  };

  const handleEditPair = (pair: SamplePair) => {
    setEditingPair(pair.id);
    setFormData({
      name: pair.name,
      description: pair.description || '',
      group1_mean: pair.group1.mean,
      group1_std: pair.group1.std,
      group2_mean: pair.group2.mean,
      group2_std: pair.group2.std,
      sample_size_per_group: pair.sample_size_per_group,
      distribution_type: pair.group1.distribution_type || 'normal',
      enabled: pair.enabled
    });
  };

  const handleSavePair = () => {
    if (!editingPair) return;

    const updatedPairs = pairs.map(pair => {
      if (pair.id === editingPair) {
        return {
          ...pair,
          name: formData.name,
          description: formData.description,
          group1: {
            mean: formData.group1_mean,
            std: formData.group1_std,
            distribution_type: formData.distribution_type
          },
          group2: {
            mean: formData.group2_mean,
            std: formData.group2_std,
            distribution_type: formData.distribution_type
          },
          sample_size_per_group: formData.sample_size_per_group,
          enabled: formData.enabled
        };
      }
      return pair;
    });

    onPairsChange(updatedPairs);
    setEditingPair(null);
  };

  const handleCancelEdit = () => {
    setEditingPair(null);
  };

  const renderPairCard = (pair: SamplePair, index: number) => {
    const isEditing = editingPair === pair.id;

    if (isEditing) {
      return (
        <Dialog
          key={pair.id}
          open={true}
          onClose={handleCancelEdit}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScienceIcon />
            Edit Sample Pair
            <Box sx={{ flex: 1 }} />
            <IconButton onClick={handleCancelEdit}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: 1 }}>
              <TextField
                fullWidth
                label="Pair Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                sx={{ flex: 1 }}
              />
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                sx={{ flex: 1 }}
              />
            </Box>

            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
              Population Parameters
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <Card variant="outlined" sx={{ flex: 1 }}>
                <CardHeader title="Group 1 (Control)" titleTypographyProps={{ variant: 'subtitle1' }} />
                <CardContent>
                  <TextField
                    fullWidth
                    label="Mean (μ)"
                    type="number"
                    value={formData.group1_mean}
                    onChange={(e) => setFormData(prev => ({ ...prev, group1_mean: parseFloat(e.target.value) || 0 }))}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Standard Deviation (σ)"
                    type="number"
                    value={formData.group1_std}
                    onChange={(e) => setFormData(prev => ({ ...prev, group1_std: parseFloat(e.target.value) || 1 }))}
                    inputProps={{ min: 0.01 }}
                  />
                </CardContent>
              </Card>
              <Card variant="outlined" sx={{ flex: 1 }}>
                <CardHeader title="Group 2 (Treatment)" titleTypographyProps={{ variant: 'subtitle1' }} />
                <CardContent>
                  <TextField
                    fullWidth
                    label="Mean (μ)"
                    type="number"
                    value={formData.group2_mean}
                    onChange={(e) => setFormData(prev => ({ ...prev, group2_mean: parseFloat(e.target.value) || 0 }))}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Standard Deviation (σ)"
                    type="number"
                    value={formData.group2_std}
                    onChange={(e) => setFormData(prev => ({ ...prev, group2_std: parseFloat(e.target.value) || 1 }))}
                    inputProps={{ min: 0.01 }}
                  />
                </CardContent>
              </Card>
            </Box>

            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
              Study Design
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Sample Size per Group"
                type="number"
                value={formData.sample_size_per_group}
                onChange={(e) => setFormData(prev => ({ ...prev, sample_size_per_group: parseInt(e.target.value) || 30 }))}
                inputProps={{ min: 5, max: 1000 }}
                sx={{ flex: 1 }}
              />
              <FormControl fullWidth sx={{ flex: 1 }}>
                <InputLabel>Distribution Type</InputLabel>
                <Select
                  value={formData.distribution_type}
                  label="Distribution Type"
                  onChange={(e) => setFormData(prev => ({ ...prev, distribution_type: e.target.value as DistributionType }))}
                >
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="uniform">Uniform</MenuItem>
                  <MenuItem value="exponential">Exponential</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.enabled}
                      onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                    />
                  }
                  label="Include in Analysis"
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelEdit}>Cancel</Button>
            <Button onClick={handleSavePair} variant="contained">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      );
    }

    return (
      <Card
        key={pair.id}
        variant="outlined"
        sx={{
          mb: 2,
          borderColor: pair.enabled ? pair.color_scheme : 'grey.300',
          opacity: pair.enabled ? 1 : 0.6
        }}
      >
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: pair.color_scheme
                }}
              />
              <Typography variant="h6">{pair.name}</Typography>
              <Chip
                label={pair.enabled ? 'Enabled' : 'Disabled'}
                color={pair.enabled ? 'success' : 'default'}
                size="small"
              />
            </Box>
          }
          action={
            <Box>
              <Tooltip title="Edit pair settings">
                <IconButton onClick={() => handleEditPair(pair)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Clone this pair">
                <IconButton onClick={() => handleClonePair(pair.id)} disabled={pairs.length >= maxPairs}>
                  <CopyIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete this pair">
                <IconButton onClick={() => handleDeletePair(pair.id)} color="error">
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          }
        />
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Group 1:</strong> μ = {pair.group1.mean}, σ = {pair.group1.std}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Group 2:</strong> μ = {pair.group2.mean}, σ = {pair.group2.std}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Sample Size:</strong> {pair.sample_size_per_group} per group
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Distribution:</strong> {pair.group1.distribution_type || 'normal'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Effect Size:</strong> {(Math.abs(pair.group1.mean - pair.group2.mean) / Math.sqrt((pair.group1.std ** 2 + pair.group2.std ** 2) / 2)).toFixed(3)}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <FormControlLabel
            control={
              <Switch
                checked={pair.enabled}
                onChange={(e) => handleTogglePair(pair.id, e.target.checked)}
                size="small"
              />
            }
            label="Include in analysis"
          />
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={handleAddPair}
        disabled={pairs.length >= maxPairs}
        fullWidth
        sx={{ mb: 2 }}
      >
        Add Sample Pair ({pairs.length}/{maxPairs})
      </Button>

      {pairs.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ScienceIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Sample Pairs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add your first comparison above
          </Typography>
        </Paper>
      ) : (
        <Box>
          {pairs.map((pair, index) => renderPairCard(pair, index))}
        </Box>
      )}
    </Box>
  );
};