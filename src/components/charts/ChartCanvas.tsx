import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import { GardnerAltmanEstimationPlot } from './GardnerAltmanEstimationPlot';
import { PValueVariabilityChart } from './PValueVariabilityChart';
import { MinimalChartNavigation } from '../MainWorkspace/MinimalChartNavigation';
import { MultiPairResults, SamplePair } from '../../types/simulation.types';

interface ChartCanvasProps {
  multiPairResults: MultiPairResults;
  significanceLevels: number[];
  pairs: SamplePair[];
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  pan?: { x: number; y: number };
  onPanChange?: (pan: { x: number; y: number }) => void;
  currentChartType?: 'estimation' | 'variability';
  onChartTypeChange?: (chartType: 'estimation' | 'variability') => void;
}

export const ChartCanvas: React.FC<ChartCanvasProps> = ({
  multiPairResults,
  significanceLevels,
  pairs,
  zoom: externalZoom,
  onZoomChange,
  pan: externalPan,
  onPanChange,
  currentChartType: externalChartType,
  onChartTypeChange
}) => {
  const [internalZoom, setInternalZoom] = useState(1);
  const [internalPan, setInternalPan] = useState({ x: 0, y: 0 });
  
  // Use external state if provided, otherwise use internal state
  const zoom = externalZoom ?? internalZoom;
  const pan = externalPan ?? internalPan;
  
  const setZoom = (newZoom: number | ((prev: number) => number)) => {
    const value = typeof newZoom === 'function' ? newZoom(zoom) : newZoom;
    if (onZoomChange) {
      onZoomChange(value);
    } else {
      setInternalZoom(value);
    }
  };
  
  const setPan = (newPan: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => {
    const value = typeof newPan === 'function' ? newPan(pan) : newPan;
    if (onPanChange) {
      onPanChange(value);
    } else {
      setInternalPan(value);
    }
  };
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [internalChartType, setInternalChartType] = useState<'estimation' | 'variability'>('estimation');
  const canvasRef = useRef<HTMLDivElement>(null);

  // Use external chart type if provided, otherwise use internal state
  const currentChartType = externalChartType ?? internalChartType;

  const setCurrentChartType = (newType: 'estimation' | 'variability') => {
    if (onChartTypeChange) {
      onChartTypeChange(newType);
    } else {
      setInternalChartType(newType);
    }
  };

  // Available chart types
  const chartTypes = [
    { value: 'estimation', label: 'Estimation Plot' },
    { value: 'variability', label: 'P-Value Variability' }
  ];

  // Simple fixed pan boundaries
  const MAX_PAN_DISTANCE = 500;
  
  // Simple pan clamping
  const clampPan = useCallback((panPos: { x: number; y: number }) => {
    return {
      x: Math.max(-MAX_PAN_DISTANCE, Math.min(MAX_PAN_DISTANCE, panPos.x)),
      y: Math.max(-MAX_PAN_DISTANCE, Math.min(MAX_PAN_DISTANCE, panPos.y))
    };
  }, []);


  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  }, [setZoom]);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.2, 0.3));
  }, [setZoom]);

  const handleReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [setZoom, setPan]);

  const handlePrevPair = useCallback(() => {
    setCurrentPairIndex(prev => Math.max(0, prev - 1));
  }, []);

  const handleNextPair = useCallback(() => {
    setCurrentPairIndex(prev => Math.min(pairs.length - 1, prev + 1));
  }, [pairs.length]);

  const handleChartTypeChange = useCallback((newType: 'estimation' | 'variability') => {
    setCurrentChartType(newType);
  }, []);

  // Simple drag handlers using screen coordinates
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      const newPan = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      };
      setPan(clampPan(newPan));
    }
  }, [isDragging, dragStart, clampPan, setPan]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleZoomChange = useCallback((event: Event, newValue: number | number[]) => {
    setZoom(newValue as number);
  }, [setZoom]);

  // Wheel zoom handler
  const handleWheel = useCallback((e: React.WheelEvent) => {
    // Only prevent default if we can (not on passive listeners)
    if (e.cancelable) {
      e.preventDefault();
    }
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => {
      const newZoom = Math.max(0.3, Math.min(3, prev * zoomFactor));
      return newZoom;
    });
  }, [setZoom]);

  // Simple touch handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    }
  }, [pan]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      // Only prevent default if we can (not on passive listeners)
      if (e.cancelable) {
        e.preventDefault();
      }
      const touch = e.touches[0];
      const newPan = {
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      };
      setPan(clampPan(newPan));
    }
  }, [isDragging, dragStart, clampPan, setPan]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const panStep = 50;
    const zoomStep = 0.2;

    // Only handle navigation keys
    const navigationKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', '+', '=', '-', '0'];
    if (!navigationKeys.includes(e.key)) return;

    // Only prevent default if we can (not on passive listeners)
    if (e.cancelable) {
      e.preventDefault();
    }

    switch (e.key) {
      case 'ArrowUp':
        setPan(prev => clampPan({ x: prev.x, y: prev.y + panStep }));
        break;
      case 'ArrowDown':
        setPan(prev => clampPan({ x: prev.x, y: prev.y - panStep }));
        break;
      case 'ArrowLeft':
        setPan(prev => clampPan({ x: prev.x + panStep, y: prev.y }));
        break;
      case 'ArrowRight':
        setPan(prev => clampPan({ x: prev.x - panStep, y: prev.y }));
        break;
      case '+':
      case '=':
        setZoom(prev => Math.min(prev + zoomStep, 3));
        break;
      case '-':
        setZoom(prev => Math.max(prev - zoomStep, 0.3));
        break;
      case '0':
        handleReset();
        break;
    }
  }, [clampPan, handleReset, setZoom, setPan]);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        bgcolor: '#ffffff',
        outline: 'none',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      ref={canvasRef}
      tabIndex={0}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
    >
      {/* Minimal Pair Navigation - Only show if multiple pairs */}
      {pairs && pairs.length > 1 && (
        <MinimalChartNavigation
          currentIndex={currentPairIndex}
          totalCount={pairs.length}
          onPrevious={handlePrevPair}
          onNext={handleNextPair}
          label="Pair"
        />
      )}

      {/* Canvas Content */}
      <Box
        sx={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {currentChartType === 'estimation' && (
          <GardnerAltmanEstimationPlot
            multiPairResults={multiPairResults}
            significanceLevels={significanceLevels}
            pairs={pairs}
            currentPairIndex={currentPairIndex}
          />
        )}
        {currentChartType === 'variability' && (
          <PValueVariabilityChart
            multiPairResults={multiPairResults}
            pairs={pairs}
            currentPairIndex={currentPairIndex}
            significanceLevels={significanceLevels}
          />
        )}
      </Box>

    </Box>
  );
};