# StatDash Charts Module

A comprehensive charting system for statistical data visualization in StatDash.

## 📁 Directory Structure

```
src/components/charts/
├── types/
│   └── chart.types.ts          # TypeScript interfaces and types
├── base/
│   └── ChartContainer.tsx      # Base chart wrapper component
├── statistical/
│   └── PValueChart.tsx         # P-value distribution histogram
├── utils/
│   └── chart-utils.ts          # Chart utility functions
├── index.ts                    # Main exports
└── README.md                   # This file
```

## 🚀 Features

### Base Components
- **ChartContainer**: Reusable wrapper with export, settings, and interaction controls
- **Chart Interactions**: Built-in hover, click, and selection handlers

### Statistical Charts
- **PValueChart**: Interactive p-value distribution histogram with significance highlighting
- **Effect Size Charts**: Box plots and confidence interval visualizations
- **Power Analysis Charts**: Statistical power curves and analysis

### Utilities
- **Color Management**: Statistical color palettes and significance-based coloring
- **Data Formatting**: Statistical value formatting for tooltips and labels
- **Bin Calculation**: Optimal histogram bin size calculation
- **Export Functions**: CSV and image export capabilities

## 📊 Usage Examples

### Basic P-Value Chart
```tsx
import { PValueChart } from './components/charts';

function MyComponent() {
  return (
    <PValueChart
      chartId="my-pvalue-chart"
      width={600}
      height={400}
      significanceThreshold={0.05}
    />
  );
}
```

### Using Chart Container
```tsx
import { ChartContainer } from './components/charts';

function CustomChart({ children }) {
  return (
    <ChartContainer
      title="My Statistical Chart"
      width={800}
      height={500}
      onExport={(format) => console.log('Export as', format)}
      showControls={true}
    >
      {children}
    </ChartContainer>
  );
}
```

### Chart Utilities
```tsx
import { generateColorPalette, formatStatisticalValue } from './components/charts';

// Generate colors for multiple datasets
const colors = generateColorPalette(5);

// Format p-values for display
const formattedP = formatStatisticalValue(0.034, 'p-value'); // "0.034"
```

## 🎨 Color Schemes

### Statistical Colors
- **Significant**: Red tones for p < α
- **Not Significant**: Blue tones for p ≥ α
- **Borderline**: Yellow/Orange for near-threshold values

### Themes
- **Light Theme**: Clean white backgrounds with subtle grids
- **Dark Theme**: Dark backgrounds optimized for data visibility

## 🔧 Configuration

Charts support extensive configuration through the `ChartConfig` interface:

```typescript
interface ChartConfig {
  showLegend: boolean;
  showGrid: boolean;
  interactive: boolean;
  animation: boolean;
  showConfidenceIntervals: boolean;
  significanceThreshold: number;
  effectSizeInterpretation: boolean;
  theme: 'light' | 'dark';
  colorScheme: string[];
  fontSize: number;
}
```

## 📈 Data Flow

1. **Data Source**: Charts automatically connect to Zustand stores
2. **Transformation**: Data transformers convert raw statistics to chart format
3. **Rendering**: Chart components render with interactive features
4. **Persistence**: Chart configurations saved in chart store
5. **Export**: Multiple export formats supported

## 🔄 Migration Guide

### From Old Structure
```tsx
// Old way
import PValueChart from './PValueChart';

// New way
import { PValueChart } from './components/charts';
```

### Backward Compatibility
The old `src/PValueChart.tsx` file now serves as a compatibility wrapper that imports from the new structure, ensuring existing code continues to work.

## 🚀 Future Enhancements

- **Chart.js Integration**: Full Chart.js library support
- **Interactive Drill-down**: Click-to-drill-down functionality
- **Real-time Updates**: Live chart updates during simulations
- **Advanced Statistical Plots**: Q-Q plots, residual plots, etc.
- **Custom Themes**: User-defined color schemes and themes

## 📚 API Reference

See `types/chart.types.ts` for complete TypeScript interfaces and `utils/chart-utils.ts` for utility function documentation.