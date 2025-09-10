import React, { useState } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Switch,
  Tooltip,
  Paper,
  Divider,
  Button,
  Chip,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Science as ScienceIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { SamplePair, DistributionType } from '../types/simulation.types';

interface StudyBuilderCompactProps {
  pairs: SamplePair[];
  onPairsChange: (pairs: SamplePair[]) => void;
  maxPairs?: number;
}

interface InlineEditState {
  pairId: string | null;
  field: string | null;
}

export const StudyBuilderCompact: React.FC<StudyBuilderCompactProps> = ({
  pairs,
  onPairsChange,
  maxPairs = 10
}) => {
  const [editing, setEditing] = useState<InlineEditState>({ pairId: null, field: null });
  const [editValues, setEditValues] = useState<Record<string, any>>({});

  const generateId = () => `pair_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const createDefaultPair = (index: number): SamplePair => ({
    id: generateId(),
    name: `Pair ${index + 1}`,
    group1: { mean: 0, std: 1, distribution_type: 'normal' },
    group2: { mean: 0.5, std: 1, distribution_type: 'normal' },
    sample_size_per_group: 30,
    enabled: true,
    color_scheme: getDefaultColor(index)
  });

  const getDefaultColor = (index: number): string => {
    const colors = ['#1976d2', '#2e7d32', '#ed6c02', '#d32f2f', '#7b1fa2'];
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

  const handleTogglePair = (pairId: string) => {
    const updatedPairs = pairs.map(pair =>
      pair.id === pairId ? { ...pair, enabled: !pair.enabled } : pair
    );
    onPairsChange(updatedPairs);
  };

  const startEditing = (pairId: string, field: string, currentValue: any) => {
    setEditing({ pairId, field });
    setEditValues({ [`${pairId}_${field}`]: currentValue });
  };

  const saveEdit = (pairId: string, field: string) => {
    const value = editValues[`${pairId}_${field}`];
    if (value === undefined) return;

    const updatedPairs = pairs.map(pair => {
      if (pair.id === pairId) {
        if (field === 'name') {
          return { ...pair, name: value };
        } else if (field.startsWith('group1_')) {
          const param = field.replace('group1_', '');
          return {
            ...pair,
            group1: { ...pair.group1, [param]: param === 'distribution_type' ? value : parseFloat(value) || 0 }
          };
        } else if (field.startsWith('group2_')) {
          const param = field.replace('group2_', '');
          return {
            ...pair,
            group2: { ...pair.group2, [param]: param === 'distribution_type' ? value : parseFloat(value) || 0 }
          };
        } else if (field === 'sample_size') {
          return { ...pair, sample_size_per_group: parseInt(value) || 30 };
        }
      }
      return pair;
    });

    onPairsChange(updatedPairs);
    setEditing({ pairId: null, field: null });
  };

  const cancelEdit = () => {
    setEditing({ pairId: null, field: null });
    setEditValues({});
  };

  const renderEditableField = (
    pairId: string,
    field: string,
    currentValue: any,
    type: 'text' | 'number' = 'text',
    width: number = 60
  ) => {
    const isEditing = editing.pairId === pairId && editing.field === field;
    const editKey = `${pairId}_${field}`;

    if (isEditing) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <TextField
            size="small"
            type={type}
            value={editValues[editKey] ?? currentValue}
            onChange={(e) => setEditValues(prev => ({ ...prev, [editKey]: e.target.value }))}
            sx={{
              width: `${width}px`,
              '& .MuiInputBase-root': { height: '24px', fontSize: '11px' },
              '& .MuiInputBase-input': { padding: '2px 6px' }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit(pairId, field);
              if (e.key === 'Escape') cancelEdit();
            }}
            autoFocus
          />
          <IconButton size="small" onClick={() => saveEdit(pairId, field)} sx={{ p: 0.25 }}>
            <CheckIcon sx={{ fontSize: 14 }} />
          </IconButton>
          <IconButton size="small" onClick={cancelEdit} sx={{ p: 0.25 }}>
            <CloseIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>
      );
    }

    return (
      <Tooltip title="Click to edit">
        <Typography
          variant="caption"
          sx={{
            cursor: 'pointer',
            '&:hover': { bgcolor: 'action.hover' },
            px: 0.5,
            py: 0.25,
            borderRadius: 0.5,
            fontSize: '11px',
            minWidth: `${width}px`,
            textAlign: 'center'
          }}
          onClick={() => startEditing(pairId, field, currentValue)}
        >
          {type === 'number' ? Number(currentValue).toFixed(2) : currentValue}
        </Typography>
      </Tooltip>
    );
  };

  const renderPairCard = (pair: SamplePair, index: number) => (
    <Paper
      key={pair.id}
      elevation={1}
      sx={{
        p: 1.5,
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        opacity: pair.enabled ? 1 : 0.6,
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 2,
          borderColor: 'primary.light'
        }
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <ScienceIcon sx={{ fontSize: 16, color: 'primary.main' }} />
          {renderEditableField(pair.id, 'name', pair.name, 'text', 100)}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={pair.enabled}
                onChange={() => handleTogglePair(pair.id)}
              />
            }
            label={<Typography variant="caption" sx={{ fontSize: '10px' }}>Active</Typography>}
            sx={{ mx: 0 }}
          />

          <Tooltip title="Delete pair">
            <IconButton size="small" onClick={() => handleDeletePair(pair.id)} sx={{ p: 0.25 }}>
              <DeleteIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Parameters Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1.5 }}>
        {/* Group 1 */}
        <Box sx={{ p: 1, bgcolor: 'background.default', borderRadius: 0.5 }}>
          <Typography variant="caption" sx={{ fontSize: '10px', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>
            Group 1 (Control)
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontSize: '9px', minWidth: 15 }}>μ:</Typography>
            {renderEditableField(pair.id, 'group1_mean', pair.group1.mean, 'number', 45)}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" sx={{ fontSize: '9px', minWidth: 15 }}>σ:</Typography>
            {renderEditableField(pair.id, 'group1_std', pair.group1.std, 'number', 45)}
          </Box>
        </Box>

        {/* Group 2 */}
        <Box sx={{ p: 1, bgcolor: 'background.default', borderRadius: 0.5 }}>
          <Typography variant="caption" sx={{ fontSize: '10px', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>
            Group 2 (Treatment)
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontSize: '9px', minWidth: 15 }}>μ:</Typography>
            {renderEditableField(pair.id, 'group2_mean', pair.group2.mean, 'number', 45)}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" sx={{ fontSize: '9px', minWidth: 15 }}>σ:</Typography>
            {renderEditableField(pair.id, 'group2_std', pair.group2.std, 'number', 45)}
          </Box>
        </Box>
      </Box>

      {/* Sample Size & Effect Size */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="caption" sx={{ fontSize: '10px', color: 'text.secondary' }}>Sample Size:</Typography>
          {renderEditableField(pair.id, 'sample_size', pair.sample_size_per_group, 'number', 50)}
        </Box>

        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="caption" sx={{ fontSize: '9px', color: 'text.secondary' }}>
            Effect Size (d)
          </Typography>
          <Typography variant="caption" sx={{ fontSize: '11px', fontWeight: 600 }}>
            {(Math.abs(pair.group1.mean - pair.group2.mean) /
               Math.sqrt((pair.group1.std ** 2 + pair.group2.std ** 2) / 2)).toFixed(3)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontSize: '12px', fontWeight: 600 }}>
            Study Builder
          </Typography>
          <Chip
            label={`${pairs.filter(p => p.enabled).length}/${pairs.length}`}
            size="small"
            variant="outlined"
            sx={{ fontSize: '10px', height: 20 }}
          />
        </Box>

        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon sx={{ fontSize: 14 }} />}
          onClick={handleAddPair}
          disabled={pairs.length >= maxPairs}
          fullWidth
          sx={{
            height: 28,
            fontSize: '11px',
            textTransform: 'none'
          }}
        >
          Add Pair ({pairs.length}/{maxPairs})
        </Button>
      </Box>

      {/* Pairs List */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
        {pairs.length === 0 ? (
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.default' }}>
            <ScienceIcon sx={{ fontSize: 24, color: 'text.disabled', mb: 1 }} />
            <Typography variant="caption" color="text.secondary">
              No pairs configured
            </Typography>
          </Paper>
        ) : (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 1.5,
            width: '100%'
          }}>
            {pairs.map((pair, index) => renderPairCard(pair, index))}
          </Box>
        )}
      </Box>

      {/* Footer with summary */}
      {pairs.length > 0 && (
        <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
          <Typography variant="caption" sx={{ fontSize: '10px', color: 'text.secondary' }}>
            {pairs.filter(p => p.enabled).length} active pairs •
            Total N: {pairs.filter(p => p.enabled).reduce((sum, p) => sum + p.sample_size_per_group * 2, 0)}
          </Typography>
        </Box>
      )}
    </Box>
  );
};