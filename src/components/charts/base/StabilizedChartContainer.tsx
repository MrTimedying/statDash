import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Box, Paper, Typography, IconButton, Tooltip, Menu, MenuItem } from '@mui/material';
import { MoreVert as MoreIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { ChartProps } from '../types/chart.types';

interface StabilizedChartContainerProps extends ChartProps {
  title: string;
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  onExport?: (format: 'png' | 'svg' | 'pdf') => void;
  onSettingsChange?: () => void;
  showControls?: boolean;
  responsive?: boolean;
  debounceMs?: number;
  isResizing?: boolean; // New prop to indicate parent is resizing
  minWidth?: number;
  minHeight?: number;
}

interface StableSize {
  width: number;
  height: number;
  timestamp: number;
}

/**
 * Stabilized Chart Container that prevents flickering during resizes
 * Key features:
 * - Freezes dimensions during parent resizing
 * - Enhanced debouncing with change thresholds  
 * - Stable component identity with memoization
 * - Animation suspension during resize
 * - CSS containment for layout isolation
 */
export const StabilizedChartContainer: React.FC<StabilizedChartContainerProps> = React.memo(({
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
  debounceMs = 150,
  isResizing = false,
  minWidth = 200,
  minHeight = 150,
  config
}) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [stableSize, setStableSize] = useState<StableSize>({
    width: Math.max(width, minWidth),
    height: Math.max(height, minHeight),
    timestamp: Date.now()
  });
  const [isAnimationEnabled, setIsAnimationEnabled] = useState(true);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const frozenSizeRef = useRef<StableSize | null>(null);
  const lastMeasurementRef = useRef<{ width: number; height: number } | null>(null);
  
  // Threshold for size changes (ignore sub-pixel differences)
  const SIZE_CHANGE_THRESHOLD = 2;
  
  // Enhanced debounce during resize vs idle
  const effectiveDebounce = isResizing ? 500 : debounceMs;
  
  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setMenuAnchor(null);
  }, []);

  const handleExport = useCallback((format: 'png' | 'svg' | 'pdf') => {
    onExport?.(format);
    handleMenuClose();
  }, [onExport, handleMenuClose]);

  // Stabilized resize handler with thresholds and rounding
  const handleResize = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (!containerRef.current || !responsive || isResizing) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      
      // Round to integers to prevent sub-pixel churn
      const newWidth = Math.round(Math.max(rect.width, minWidth));
      const newHeight = Math.round(Math.max(rect.height - 60, minHeight)); // Subtract header
      
      // Check if change exceeds threshold
      const lastMeasurement = lastMeasurementRef.current;
      if (lastMeasurement) {
        const widthDelta = Math.abs(newWidth - lastMeasurement.width);
        const heightDelta = Math.abs(newHeight - lastMeasurement.height);
        
        if (widthDelta < SIZE_CHANGE_THRESHOLD && heightDelta < SIZE_CHANGE_THRESHOLD) {
          return; // Skip update for insignificant changes
        }
      }
      
      // Update last measurement
      lastMeasurementRef.current = { width: newWidth, height: newHeight };
      
      // Apply new stable size
      setStableSize(prev => {
        if (prev.width === newWidth && prev.height === newHeight) {
          return prev; // Same size, prevent state update
        }
        return {
          width: newWidth,
          height: newHeight,
          timestamp: Date.now()
        };
      });
    }, effectiveDebounce);
  }, [responsive, effectiveDebounce, minWidth, minHeight, isResizing]);

  // Handle resize state changes
  useEffect(() => {
    if (isResizing) {
      // Freeze current dimensions
      frozenSizeRef.current = stableSize;
      setIsAnimationEnabled(false);
    } else {
      // Resume after resize
      frozenSizeRef.current = null;
      // Re-enable animations after a short delay
      const timer = setTimeout(() => setIsAnimationEnabled(true), 150);
      return () => clearTimeout(timer);
    }
  }, [isResizing, stableSize]);

  // Set up resize observer for responsive mode
  useEffect(() => {
    if (!responsive || !containerRef.current) return;

    // Use ResizeObserver with RAF throttling
    let rafId: number | null = null;
    
    resizeObserverRef.current = new ResizeObserver((entries) => {
      if (rafId) cancelAnimationFrame(rafId);
      
      rafId = requestAnimationFrame(() => {
        handleResize();
      });
    });
    
    resizeObserverRef.current.observe(containerRef.current);

    // Initial measurement
    handleResize();

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [responsive, handleResize]);

  // Get effective dimensions (frozen during resize or stable)
  const effectiveDimensions = useMemo(() => {
    if (isResizing && frozenSizeRef.current) {
      return frozenSizeRef.current;
    }
    return stableSize;
  }, [isResizing, stableSize]);

  // Memoized chart content to prevent unnecessary re-renders
  const chartContent = useMemo(() => {
    if (loading) {
      return (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Loading chart...
          </Typography>
        </Box>
      );
    }
    
    if (responsive) {
      return (
        <Box sx={{ width: '100%', height: '100%' }}>
          {children}
        </Box>
      );
    }
    
    return (
      <Box sx={{ 
        width: `${effectiveDimensions.width}px`, 
        height: `${effectiveDimensions.height}px`,
        overflow: 'hidden'
      }}>
        {children}
      </Box>
    );
  }, [loading, responsive, children, effectiveDebounce, minWidth, minHeight, effectiveDimensions]);

  if (error) {
    return (
      <Paper
        sx={{
          width: responsive ? '100%' : `${effectiveDimensions.width}px`,
          height: responsive ? '100%' : `${effectiveDimensions.height}px`,
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
        width: responsive ? '100%' : `${effectiveDimensions.width}px`,
        minHeight: responsive ? 0 : `${effectiveDimensions.height}px`,
        height: responsive ? '100%' : `${effectiveDimensions.height}px`,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        // CSS containment for layout isolation
        contain: 'layout style paint',
        // Disable transitions during resize to prevent flickering
        transition: isResizing || !isAnimationEnabled ? 'none' : 'all 0.2s ease-in-out',
        // Prevent layout thrash
        willChange: isResizing ? 'auto' : 'contents'
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
          bgcolor: 'background.default',
          minHeight: '52px',
          flexShrink: 0
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
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
          minHeight: 0,
          display: 'flex',
          alignItems: responsive ? 'stretch' : 'center',
          justifyContent: 'center',
          // Additional containment
          contain: 'layout style',
          // Prevent reflow during resize
          overflow: 'hidden'
        }}
      >
        {chartContent}
      </Box>
      
      {/* Resize indicator for debugging */}
      {isResizing && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            bgcolor: 'warning.main',
            color: 'warning.contrastText',
            px: 1,
            py: 0.5,
            fontSize: '10px',
            zIndex: 1000,
            opacity: 0.8
          }}
        >
          Resizing...
        </Box>
      )}
    </Paper>
  );
});

StabilizedChartContainer.displayName = 'StabilizedChartContainer';