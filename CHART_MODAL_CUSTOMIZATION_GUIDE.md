# Chart Modal Customization Guide

## Overview
This guide covers how to customize chart display in modals, troubleshoot rendering issues, and optimize the user experience for statistical chart visualization.

## Architecture

### Component Hierarchy
```
ChartModal (Dialog wrapper)
├── DialogContent (flex container)
│   └── Box (chart wrapper with flex: 1)
│       └── ChartContainer (responsive wrapper)
│           └── Chart Component (e.g., PValueBarChart)
```

## Key Issues and Solutions

### 1. **Modal Height Chain Problem**

**Issue:** Charts appear constrained or centered instead of filling modal space.

**Root Cause:** ResponsiveContainer needs a definite height, but the height chain from Dialog → Content → Chart was broken.

**Solution Applied:**
```tsx
// ChartModal.tsx
sx={{
  '& .MuiDialog-paper': {
    display: 'flex',           // Enable flex layout
    flexDirection: 'column',   // Stack header/content/footer
    height: '90vh'             // Definite height
  }
}}

// DialogContent
<DialogContent sx={{ 
  p: 0, 
  flex: 1,                   // Take remaining space
  display: 'flex', 
  overflow: 'auto' 
}}>
  <Box sx={{ flex: 1, minHeight: 0, p: 2 }}>
    {/* Chart content */}
  </Box>
</DialogContent>
```

### 2. **Responsive vs Fixed Sizing Conflict**

**Issue:** ChartModal passed both `responsive: true` and fixed `width/height`, causing conflicts.

**Solution:**
```tsx
// Only pass width/height when not responsive
const chartProps = {
  multiPairResults,
  ...(currentChart.props?.responsive === false ? {
    width: isMobile ? 300 : 800,
    height: isMobile ? 250 : 500
  } : {}),
  responsive: true,
  ...currentChart.props
};
```

### 3. **Grid Layout Optimization**

**Issue:** PValueBarChart grid didn't adapt well to modal constraints.

**Solution:**
```tsx
// Improved grid for modal display
gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
height: responsive ? 'clamp(240px, 28vh, 360px)' : '250px',
alignContent: 'start',
width: '100%'
```

## Customization Options

### Modal Sizing

#### Dialog Dimensions
```tsx
// Small modal
maxWidth="md"  // 960px max
height: '70vh'

// Large modal (recommended)
maxWidth="xl"  // 1536px max
height: '90vh'

// Full screen on mobile
fullScreen={isMobile}
```

#### Content Area
```tsx
// Tight padding
<Box sx={{ flex: 1, minHeight: 0, p: 1 }}>

// Standard padding
<Box sx={{ flex: 1, minHeight: 0, p: 2 }}>

// Generous padding
<Box sx={{ flex: 1, minHeight: 0, p: 3 }}>
```

### Chart Container Behavior

#### Responsive Mode (Recommended for Modals)
```tsx
<ChartContainer
  responsive={true}  // Fills available space
  // No width/height needed
/>
```

#### Fixed Mode
```tsx
<ChartContainer
  responsive={false}
  width={800}
  height={600}
/>
```

### Chart-Specific Customizations

#### PValueBarChart
```tsx
// Modal optimized
<PValueBarChart
  responsive={true}
  selectedPairId="pair1"  // Show single pair
  mini={false}            // Full features
/>

// Compact view
<PValueBarChart
  responsive={true}
  mini={true}             // Simplified display
/>
```

## Advanced Customizations

### Custom Modal Wrapper
```tsx
const CustomChartModal = ({ children, ...props }) => (
  <Dialog
    {...props}
    maxWidth="xl"
    sx={{
      '& .MuiDialog-paper': {
        display: 'flex',
        flexDirection: 'column',
        height: '95vh',        // Custom height
        margin: 1,            // Custom margin
        borderRadius: 2       // Custom border radius
      }
    }}
  >
    <DialogContent sx={{ 
      p: 0, 
      flex: 1, 
      display: 'flex',
      background: 'linear-gradient(to bottom, #f5f5f5, #ffffff)' // Custom background
    }}>
      <Box sx={{ 
        flex: 1, 
        minHeight: 0, 
        p: 3,                 // Custom padding
        display: 'flex',
        flexDirection: 'column'
      }}>
        {children}
      </Box>
    </DialogContent>
  </Dialog>
);
```

### Theme Integration
```tsx
// Use theme values for consistent styling
const theme = useTheme();

sx={{
  '& .MuiDialog-paper': {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius * 2
  }
}}
```

### Multi-Chart Layouts
```tsx
// Side-by-side charts
<Box sx={{ 
  display: 'grid', 
  gridTemplateColumns: '1fr 1fr', 
  gap: 2,
  height: '100%'
}}>
  <ChartContainer responsive>{chart1}</ChartContainer>
  <ChartContainer responsive>{chart2}</ChartContainer>
</Box>

// Tabbed charts
<Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
  <Tabs value={activeTab}>
    <Tab label="Distribution" />
    <Tab label="P-Values" />
  </Tabs>
  <Box sx={{ flex: 1, minHeight: 0 }}>
    <ChartContainer responsive>{activeChart}</ChartContainer>
  </Box>
</Box>
```

## Performance Considerations

### Lazy Loading
```tsx
const LazyChart = React.lazy(() => import('./PValueBarChart'));

<Suspense fallback={<CircularProgress />}>
  <LazyChart {...chartProps} />
</Suspense>
```

### Memoization
```tsx
const chartComponent = React.useMemo(() => (
  <PValueBarChart {...chartProps} />
), [chartProps.multiPairResults, chartProps.selectedPairId]);
```

## Troubleshooting

### Common Issues

1. **Chart appears too small/constrained**
   - Ensure modal has `flex` layout
   - Check `minHeight: 0` on flex children
   - Verify chart has `responsive={true}`

2. **Content overflows/clips**
   - Set `overflow: 'auto'` on DialogContent
   - Use `minHeight: 0` instead of fixed heights
   - Check absolute positioning in charts

3. **Poor mobile experience**
   - Use `fullScreen={isMobile}`
   - Adjust grid columns for small screens
   - Reduce padding on mobile

4. **Slow rendering**
   - Implement lazy loading
   - Memoize expensive calculations
   - Use virtual scrolling for many charts

### Debug Tools
```tsx
// Add debug borders
sx={{
  border: '2px solid red',    // Chart container
  '& > *': { border: '1px solid blue' }  // Child elements
}}

// Log dimensions
const ref = useRef();
useEffect(() => {
  console.log('Container size:', ref.current?.getBoundingClientRect());
}, []);
```

## Best Practices

1. **Always use responsive mode in modals**
2. **Establish proper height chains with flex layout**
3. **Test on multiple screen sizes**
4. **Use theme values for consistency**
5. **Implement error boundaries for chart failures**
6. **Optimize for accessibility (keyboard navigation, screen readers)**
7. **Consider loading states and empty data scenarios**

## Example Implementation

See the updated `ChartModal.tsx`, `ChartContainer.tsx`, and `PValueBarChart.tsx` files for complete working examples of these patterns.
