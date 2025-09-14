import React from 'react';
import { Box, IconButton, Slider, Tooltip } from '@mui/material';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

interface ZoomControllerProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onZoomChange: (event: Event, newValue: number | number[]) => void;
}

export const ZoomController: React.FC<ZoomControllerProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
  onZoomChange
}) => {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.5,
          bgcolor: 'rgba(255, 255, 255, 1)',
          borderRadius: 2,
          p: 0.5,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Tooltip title="Zoom In">
          <IconButton 
            size="small" 
            onClick={onZoomIn} 
            disabled={zoom >= 3} 
            sx={{ p: 0.25 }}
          >
            <ZoomIn size={14} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Zoom Out">
          <IconButton 
            size="small" 
            onClick={onZoomOut} 
            disabled={zoom <= 0.3} 
            sx={{ p: 0.25 }}
          >
            <ZoomOut size={14} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Reset View">
          <IconButton 
            size="small" 
            onClick={onReset} 
            sx={{ p: 0.25 }}
          >
            <RotateCcw size={14} />
          </IconButton>
        </Tooltip>

        {/* Zoom Slider - Vertical */}
        <Box sx={{ height: 60, mt: 0.5 }}>
          <Slider
            value={zoom}
            onChange={onZoomChange}
            min={0.3}
            max={3}
            step={0.1}
            size="small"
            orientation="vertical"
            sx={{
              '& .MuiSlider-thumb': {
                width: 10,
                height: 10
              },
              '& .MuiSlider-rail': {
                width: 3
              },
              '& .MuiSlider-track': {
                width: 3
              }
            }}
          />
        </Box>
      </Box>
    </motion.div>
  );
};