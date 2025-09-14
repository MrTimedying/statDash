import { useState, useCallback, useRef } from 'react';

/**
 * Hook to manage resize state for preventing chart flickering
 * Provides utilities to detect when panels are actively being resized
 */
export const useResizeState = () => {
  const [isResizing, setIsResizing] = useState(false);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resizeStartTimeRef = useRef<number | null>(null);
  const isResizingRef = useRef(false);

  // Duration to keep resize state active after last resize event
  const RESIZE_SETTLE_DELAY = 300;

  const startResizing = useCallback(() => {
    if (!isResizingRef.current) {
      console.log('🔧 Starting resize operation');
      isResizingRef.current = true;
      setIsResizing(true);
      resizeStartTimeRef.current = Date.now();
    }

    // Clear any existing timeout
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }

    // Set new timeout to end resize state
    resizeTimeoutRef.current = setTimeout(() => {
      console.log('🔧 Resize operation ended');
      isResizingRef.current = false;
      setIsResizing(false);
      resizeStartTimeRef.current = null;
    }, RESIZE_SETTLE_DELAY);
  }, []);
  
  const endResizing = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    
    // Use shorter delay when explicitly ending
    resizeTimeoutRef.current = setTimeout(() => {
      setIsResizing(false);
      resizeStartTimeRef.current = null;
    }, 100);
  }, []);
  
  const getResizeDuration = useCallback(() => {
    if (!resizeStartTimeRef.current) return 0;
    return Date.now() - resizeStartTimeRef.current;
  }, []);
  
  // Cleanup timeout on unmount
  const cleanup = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = null;
    }
  }, []);
  
  return {
    isResizing,
    startResizing,
    endResizing, 
    getResizeDuration,
    cleanup
  };
};

/**
 * Hook specifically for react-resizable-panels integration
 * Automatically manages resize state from panel events
 */
export const usePanelResizeState = () => {
  const { isResizing, startResizing, endResizing, getResizeDuration, cleanup } = useResizeState();
  
  // Handler for panel resize events
  const handlePanelResize = useCallback(() => {
    startResizing();
  }, [startResizing]);
  
  // Handler for panel resize end events  
  const handlePanelResizeEnd = useCallback(() => {
    endResizing();
  }, [endResizing]);
  
  return {
    isResizing,
    handlePanelResize,
    handlePanelResizeEnd,
    getResizeDuration,
    cleanup
  };
};