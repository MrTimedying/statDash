import React from 'react';
import { Box, IconButton, Typography, Tooltip } from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MinimalChartNavigationProps {
  currentIndex: number;
  totalCount: number;
  onPrevious: () => void;
  onNext: () => void;
  label?: string;
}

export const MinimalChartNavigation: React.FC<MinimalChartNavigationProps> = ({
  currentIndex,
  totalCount,
  onPrevious,
  onNext,
  label = "Chart"
}) => {
  if (totalCount <= 1) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 80,
        left: 16,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        bgcolor: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 0,
        px: 1,
        py: 0.5
      }}
    >
      <Tooltip title={`Previous ${label}`}>
        <span>
          <IconButton
            size="small"
            onClick={onPrevious}
            disabled={currentIndex === 0}
            sx={{
              p: 0.25,
              '&:disabled': { opacity: 0.3 }
            }}
          >
            <ChevronLeft size={14} />
          </IconButton>
        </span>
      </Tooltip>

      <Typography
        variant="body2"
        sx={{
          fontSize: '0.75rem',
          minWidth: 28,
          textAlign: 'center',
          fontWeight: 500,
          color: 'text.primary'
        }}
      >
        {currentIndex + 1}/{totalCount}
      </Typography>

      <Tooltip title={`Next ${label}`}>
        <span>
          <IconButton
            size="small"
            onClick={onNext}
            disabled={currentIndex === totalCount - 1}
            sx={{
              p: 0.25,
              '&:disabled': { opacity: 0.3 }
            }}
          >
            <ChevronRight size={14} />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
};