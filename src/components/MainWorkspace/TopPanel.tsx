import React, { useState, useCallback } from 'react';
import { Box } from '@mui/material';
import { ChartCanvas } from '../charts/ChartCanvas';
import { ZoomController } from './ZoomController';
import { TopPanelProps } from './types';

export const TopPanel: React.FC<TopPanelProps> = ({
  multiPairResults,
  significanceLevels,
  pairs,
  currentChartType,
  onChartTypeChange
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.2, 0.3));
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleZoomChange = useCallback((event: Event, newValue: number | number[]) => {
    setZoom(newValue as number);
  }, []);

  return (
    <Box sx={{
      height: '100%',
      position: 'relative'
    }}>
      {/* Zoom Controller - Mid Left */}
      {multiPairResults && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: 16,
            transform: 'translateY(-50%)',
            zIndex: 20
          }}
        >
          <ZoomController
            zoom={zoom}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onReset={handleReset}
            onZoomChange={handleZoomChange}
          />
        </Box>
      )}

      {multiPairResults ? (
        <ChartCanvas
          multiPairResults={multiPairResults}
          significanceLevels={significanceLevels}
          pairs={pairs}
          zoom={zoom}
          onZoomChange={setZoom}
          pan={pan}
          onPanChange={setPan}
          currentChartType={currentChartType}
          onChartTypeChange={onChartTypeChange}
        />
      ) : (
        <Box sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.secondary'
        }}>
          Run a simulation to view the interactive chart canvas
        </Box>
      )}
    </Box>
  );
};