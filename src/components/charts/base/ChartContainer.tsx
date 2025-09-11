import React, { useRef, useEffect, useState } from 'react';
import { Box, Paper, Typography, IconButton, Tooltip, Menu, MenuItem } from '@mui/material';
import { MoreVert as MoreIcon, Download as DownloadIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { ChartConfig, ChartProps, ChartInteractionEvent } from '../types/chart.types';

interface ChartContainerProps extends ChartProps {
  title: string;
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  onExport?: (format: 'png' | 'svg' | 'pdf') => void;
  onSettingsChange?: () => void;
  showControls?: boolean;
  responsive?: boolean; // New prop for responsive behavior
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  children,
  loading = false,
  error = null,
  width = 600,
  height = 400,
  onExport,
  onSettingsChange,
  showControls = true,
  responsive = false,
  config
}) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleExport = (format: 'png' | 'svg' | 'pdf') => {
    onExport?.(format);
    handleMenuClose();
  };

  if (error) {
    return (
      <Paper
        sx={{
          width: `${width}px`,
          height: `${height}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          p: 2,
          border: '1px solid',
          borderColor: 'error.main'
        }}
      >
        <Typography variant="h6" color="error" gutterBottom>
          Chart Error
        </Typography>
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      ref={containerRef}
      sx={{
        width: responsive ? '100%' : `${width}px`,
        minHeight: responsive ? 0 : `${height}px`,
        height: responsive ? '100%' : `${height}px`,
        position: 'relative',
        overflow: responsive ? 'auto' : 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Chart Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.default'
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>

        {showControls && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {onSettingsChange && (
              <Tooltip title="Chart Settings">
                <IconButton size="small" onClick={onSettingsChange}>
                  <SettingsIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            )}

            {onExport && (
              <>
                <Tooltip title="Export Chart">
                  <IconButton size="small" onClick={handleMenuOpen}>
                    <MoreIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>

                <Menu
                  anchorEl={menuAnchor}
                  open={Boolean(menuAnchor)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={() => handleExport('png')}>
                    Export as PNG
                  </MenuItem>
                  <MenuItem onClick={() => handleExport('svg')}>
                    Export as SVG
                  </MenuItem>
                  <MenuItem onClick={() => handleExport('pdf')}>
                    Export as PDF
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        )}
      </Box>

      {/* Chart Content */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          flex: 1,
          minHeight: responsive ? 0 : `${height - 60}px`, // Subtract header height
          display: 'flex',
          alignItems: responsive ? 'stretch' : 'center',
          justifyContent: 'center'
        }}
      >
        {loading ? (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Loading chart...
            </Typography>
          </Box>
        ) : (
          children
        )}
      </Box>
    </Paper>
  );
};

// Hook for chart interactions
export const useChartInteractions = (
  onInteraction?: (event: ChartInteractionEvent) => void
) => {
  const handleClick = (dataIndex: number, datasetIndex: number, value: any, label: string) => {
    onInteraction?.({
      type: 'click',
      dataIndex,
      datasetIndex,
      value,
      label
    });
  };

  const handleHover = (dataIndex: number, datasetIndex: number, value: any, label: string) => {
    onInteraction?.({
      type: 'hover',
      dataIndex,
      datasetIndex,
      value,
      label
    });
  };

  return {
    handleClick,
    handleHover
  };
};