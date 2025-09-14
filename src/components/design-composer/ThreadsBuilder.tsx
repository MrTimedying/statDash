import React from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Button,
  Chip,
  Grid,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Science as ScienceIcon
} from '@mui/icons-material';
import { SamplePair } from '../../types/simulation.types';

interface ThreadsBuilderProps {
  threads: SamplePair[];
  onThreadsChange: (threads: SamplePair[]) => void;
  maxThreads?: number;
}

export const ThreadsBuilder: React.FC<ThreadsBuilderProps> = ({
  threads,
  onThreadsChange,
  maxThreads = 10
}) => {

  const generateId = () => `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const createDefaultThread = (index: number): SamplePair => ({
    id: generateId(),
    name: `Thread ${index + 1}`,
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

  const handleAddThread = () => {
    if (threads.length >= maxThreads) return;
    const newThread = createDefaultThread(threads.length);
    onThreadsChange([...threads, newThread]);
  };

  const handleDeleteThread = (threadId: string) => {
    const updatedThreads = threads.filter(thread => thread.id !== threadId);
    onThreadsChange(updatedThreads);
  };

  const handleThreadUpdate = (threadId: string, updates: Partial<SamplePair>) => {
    const updatedThreads = threads.map(thread =>
      thread.id === threadId ? { ...thread, ...updates } : thread
    );
    onThreadsChange(updatedThreads);
  };


  if (threads.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <ScienceIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="body1" color="text.secondary" gutterBottom>
          No threads configured yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Create comparison threads to define your study groups
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddThread}
        >
          Add First Thread
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      px: 2
    }}>
      <Box sx={{ width: '50%', minWidth: '400px' }}>
        <Stack spacing={1.5} sx={{ alignItems: 'stretch' }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 500, mb: 0.5, fontSize: '0.9rem' }}>
              Study Groups Configuration
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 1.5 }}>
              {threads.length} group{threads.length !== 1 ? 's' : ''} configured
            </Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddThread}
              disabled={threads.length >= maxThreads}
              variant="outlined"
              sx={{
                textTransform: 'none',
                borderRadius: 0,
                fontSize: '0.75rem'
              }}
            >
              Add Study Group
            </Button>
          </Box>

          {/* Threads List */}
          {threads.map((thread, index) => (
            <Box key={thread.id} sx={{ mb: 2 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', opacity: 0.3, mb: 1.5 }} />

              {/* Thread Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <TextField
                  size="small"
                  value={thread.name}
                  onChange={(e) => handleThreadUpdate(thread.id, { name: e.target.value })}
                  variant="standard"
                  sx={{
                    flex: 1,
                    '& .MuiInput-underline': {
                      '&:before': { borderBottom: '1px solid rgba(0,0,0,0.42)' },
                      '&:after': { borderBottom: '2px solid #1976d2' }
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      lineHeight: 1.2
                    }
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => handleDeleteThread(thread.id)}
                  sx={{ p: 0.5, ml: 2 }}
                >
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>

              {/* Sample Size */}
              <Box sx={{ mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem', lineHeight: 1.2 }}>
                    Sample Size (per group)
                  </Typography>
                  <TextField
                    size="small"
                    type="number"
                    value={thread.sample_size_per_group}
                    onChange={(e) => handleThreadUpdate(thread.id, { sample_size_per_group: parseInt(e.target.value) || 30 })}
                    inputProps={{ min: 5, max: 1000 }}
                    sx={{
                      width: 80,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 0,
                        height: 28
                      },
                      '& .MuiOutlinedInput-input': {
                        fontSize: '0.75rem',
                        padding: '4px 8px',
                        lineHeight: 1.2
                      }
                    }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block', lineHeight: 1.2 }}>
                  Number of participants in each comparison group
                </Typography>
              </Box>

              {/* Control Group */}
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem', mb: 0.75, lineHeight: 1.2 }}>
                  Control Group Parameters
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 0.5 }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.25 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>Mean</Typography>
                      <TextField
                        size="small"
                        type="number"
                        value={thread.group1.mean}
                        onChange={(e) => handleThreadUpdate(thread.id, {
                          group1: { ...thread.group1, mean: parseFloat(e.target.value) || 0 }
                        })}
                        inputProps={{ step: 0.1 }}
                        sx={{
                          width: 80,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 0,
                            height: 28
                          },
                          '& .MuiOutlinedInput-input': {
                            fontSize: '0.75rem',
                            padding: '4px 8px',
                            lineHeight: 1.2
                          }
                        }}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.25 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>Std Dev</Typography>
                      <TextField
                        size="small"
                        type="number"
                        value={thread.group1.std}
                        onChange={(e) => handleThreadUpdate(thread.id, {
                          group1: { ...thread.group1, std: parseFloat(e.target.value) || 1 }
                        })}
                        inputProps={{ min: 0.1, step: 0.1 }}
                        sx={{
                          width: 80,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 0,
                            height: 28
                          },
                          '& .MuiOutlinedInput-input': {
                            fontSize: '0.75rem',
                            padding: '4px 8px',
                            lineHeight: 1.2
                          }
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block', lineHeight: 1.2 }}>
                  Population parameters for the baseline/control condition
                </Typography>
              </Box>

              {/* Treatment Group */}
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem', mb: 0.75, lineHeight: 1.2 }}>
                  Treatment Group Parameters
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 0.5 }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.25 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>Mean</Typography>
                      <TextField
                        size="small"
                        type="number"
                        value={thread.group2.mean}
                        onChange={(e) => handleThreadUpdate(thread.id, {
                          group2: { ...thread.group2, mean: parseFloat(e.target.value) || 0 }
                        })}
                        inputProps={{ step: 0.1 }}
                        sx={{
                          width: 80,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 0,
                            height: 28
                          },
                          '& .MuiOutlinedInput-input': {
                            fontSize: '0.75rem',
                            padding: '4px 8px',
                            lineHeight: 1.2
                          }
                        }}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.25 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>Std Dev</Typography>
                      <TextField
                        size="small"
                        type="number"
                        value={thread.group2.std}
                        onChange={(e) => handleThreadUpdate(thread.id, {
                          group2: { ...thread.group2, std: parseFloat(e.target.value) || 1 }
                        })}
                        inputProps={{ min: 0.1, step: 0.1 }}
                        sx={{
                          width: 80,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 0,
                            height: 28
                          },
                          '& .MuiOutlinedInput-input': {
                            fontSize: '0.75rem',
                            padding: '4px 8px',
                            lineHeight: 1.2
                          }
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block', lineHeight: 1.2 }}>
                  Population parameters for the experimental/treatment condition
                </Typography>
              </Box>

              {/* Summary Stats */}
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 0.5 }}>
                <Chip
                  size="small"
                  label={`Effect Size: ${(thread.group2.mean - thread.group1.mean).toFixed(2)}`}
                  sx={{
                    fontSize: '0.65rem',
                    height: 18,
                    borderRadius: 0,
                    bgcolor: 'primary.light',
                    color: 'white'
                  }}
                />
                <Chip
                  size="small"
                  label={`n = ${thread.sample_size_per_group}`}
                  sx={{
                    fontSize: '0.65rem',
                    height: 18,
                    borderRadius: 0,
                    bgcolor: 'secondary.light',
                    color: 'white'
                  }}
                />
              </Box>
            </Box>
          ))}

          {threads.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <ScienceIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" color="text.secondary" gutterBottom>
                No pairs groups configured yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create comparison groups to define your study parameters
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>
    </Box>
  );
};