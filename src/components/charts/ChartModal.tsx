import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Close as CloseIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  KeyboardArrowLeft as KeyboardLeftIcon,
  KeyboardArrowRight as KeyboardRightIcon
} from '@mui/icons-material';
import { MultiPairResults } from '../../types/simulation.types';
import { DistributionCurveChart } from './DistributionCurveChart';
import { PValueBarChart } from './PValueBarChart';
import { PairDistributionChart } from './PairDistributionChart';
import { DynamicChartInfo } from './chartFactory';

interface ChartModalProps {
  open: boolean;
  onClose: () => void;
  charts: DynamicChartInfo[];
  currentIndex: number;
  onNavigate: (direction: 'prev' | 'next') => void;
  multiPairResults: MultiPairResults;
  significanceLevels: number[];
}

export const ChartModal: React.FC<ChartModalProps> = ({
  open,
  onClose,
  charts,
  currentIndex,
  onNavigate,
  multiPairResults,
  significanceLevels
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

  const currentChart = charts[currentIndex];

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!open) return;

      switch (event.key) {
        case 'ArrowLeft':
          onNavigate('prev');
          break;
        case 'ArrowRight':
          onNavigate('next');
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [open, onNavigate, onClose]);

  const renderChartContent = () => {
    if (!currentChart) return null;

    const chartProps = {
      multiPairResults,
      // Dynamic sizing based on screen size for better modal utilization
      ...(currentChart.props?.responsive === false ? {
        width: isMobile ? 280 : isTablet ? 600 : isLargeScreen ? 1000 : 800,
        height: isMobile ? 220 : isTablet ? 350 : isLargeScreen ? 600 : 500
      } : {}),
      responsive: true, // Enable responsive behavior for modal
      ...currentChart.props // Include any additional props from the chart factory
    };

    // Use the component from the chart factory if available
    if (currentChart.component) {
      const ChartComponent = currentChart.component;
      return <ChartComponent {...chartProps} />;
    }

    // Resolve component based on chart type if not provided
    let ChartComponent = null;
    switch (currentChart.type) {
      case 'distribution':
        ChartComponent = PairDistributionChart;
        break;
      case 'bar':
        ChartComponent = PValueBarChart;
        break;
      default:
        ChartComponent = null;
    }

    if (ChartComponent) {
      return <ChartComponent {...chartProps} />;
    }

    // Fallback for charts without components
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          minHeight: isMobile ? 300 : 500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: theme.palette.background.default,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {currentChart.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Chart implementation in progress
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Type: {currentChart.type}
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={isLargeScreen ? "xl" : isTablet ? "lg" : "md"}
      fullWidth
      fullScreen={isMobile}
      sx={{
        '& .MuiDialog-paper': {
          height: isMobile ? '100%' : isTablet ? '85vh' : isLargeScreen ? '90vh' : '80vh',
          maxHeight: isMobile ? '100%' : isTablet ? '85vh' : isLargeScreen ? '90vh' : '80vh',
          width: isMobile ? '100%' : isTablet ? '90vw' : isLargeScreen ? '95vw' : '85vw',
          maxWidth: isMobile ? '100%' : isTablet ? '90vw' : isLargeScreen ? '95vw' : '85vw',
          display: 'flex',
          flexDirection: 'column',
          margin: isMobile ? 0 : theme.spacing(2)
        }
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6">
            {currentChart?.title || 'Chart Viewer'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {currentIndex + 1} of {charts.length}
          </Typography>
        </Box>

        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Content */}
      <DialogContent sx={{ p: 0, flex: 1, display: 'flex', overflow: 'auto', position: 'relative' }}>
        {/* Navigation Arrows - Desktop */}
        {!isMobile && (
          <>
            <IconButton
              onClick={() => onNavigate('prev')}
              sx={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)'
                }
              }}
              size="large"
            >
              <PrevIcon fontSize="large" />
            </IconButton>

            <IconButton
              onClick={() => onNavigate('next')}
              sx={{
                position: 'absolute',
                right: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)'
                }
              }}
              size="large"
            >
              <NextIcon fontSize="large" />
            </IconButton>
          </>
        )}

        {/* Chart Content */}
        <Box sx={{
          flex: 1,
          minHeight: 0,
          p: isMobile ? 1 : isTablet ? 1.5 : 2,
          position: 'relative',
          overflow: 'auto'
        }}>
          {renderChartContent()}
        </Box>
      </DialogContent>

      {/* Footer */}
      <DialogActions
        sx={{
          borderTop: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper,
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Use arrow keys to navigate • ESC to close
          </Typography>
        </Box>

        {/* Mobile Navigation */}
        {isMobile && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={() => onNavigate('prev')} size="small">
              <KeyboardLeftIcon />
            </IconButton>
            <Typography variant="body2" sx={{ alignSelf: 'center', mx: 1 }}>
              {currentIndex + 1} / {charts.length}
            </Typography>
            <IconButton onClick={() => onNavigate('next')} size="small">
              <KeyboardRightIcon />
            </IconButton>
          </Box>
        )}

        {/* Desktop Navigation Indicator */}
        {!isMobile && (
          <Typography variant="body2" color="text.secondary">
            {currentIndex + 1} / {charts.length}
          </Typography>
        )}
      </DialogActions>
    </Dialog>
  );
};