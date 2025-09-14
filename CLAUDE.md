# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` (runs on port 3000)
- **Build**: `npm run build` (TypeScript compilation + Vite build)
- **Preview build**: `npm run preview`

## Architecture Overview

StatDash is a React-based statistical simulation dashboard that enables users to run multi-pair statistical comparisons with real-time visualizations. The application uses a modern data-driven architecture with Zustand state management and Chart.js for visualizations.

### Key Architectural Patterns

**State Management**: 
- Zustand stores handle application state (`src/stores/`)
- `simulation.store.ts`: Core simulation session management and data
- `charts.store.ts`: Chart-specific state and configuration
- `ui.store.ts`: UI preferences and display settings

**Data Layer**:
- Local database using SQL.js (`src/services/database.service.ts`)
- Persistent storage for simulation sessions, parameters, and results
- Web Worker integration for heavy computational tasks (`src/services/worker.service.ts`)

**Chart System**:
- Dynamic chart generation using factory pattern (`src/components/charts/chartFactory.ts`)
- Chart carousel for displaying multiple visualizations (`src/components/charts/ChartCarousel.tsx`)
- Individual chart components in `src/components/charts/`

**Layout Architecture**:
- Three-panel layout using `react-resizable-panels`
- Left: Study orchestrator for session management
- Center: Chart workspace displaying visualizations
- Right: Parameter tuner for simulation configuration

### Core Data Flow

1. **Session Creation**: Users create simulation sessions with multiple sample pairs
2. **Parameter Configuration**: Global settings and per-pair parameters are configured
3. **Simulation Execution**: Multi-pair simulations run using statistical engine (`src/services/multi-pair-simulation.ts`)
4. **Visualization**: Results are processed through chart factory and displayed in carousel
5. **Persistence**: Sessions and results are stored in local SQL.js database

### Type System

The application uses comprehensive TypeScript types defined in `src/types/simulation.types.ts`:
- `SimulationSession`: Core session data structure
- `SamplePair`: Individual comparison group configuration
- `MultiPairResults`: Structured simulation results with statistical analysis
- `SimulationStudy`: Enhanced analytical units for complex studies

### Key Dependencies

- **React 19** with TypeScript
- **Material-UI v7** for components and theming
- **Zustand** for state management with persistence
- **Chart.js + react-chartjs-2** for visualizations
- **SQL.js** for client-side database
- **jStat** for statistical computations
- **react-resizable-panels** for layout management

### Component Structure

**Main Components**:
- `App.tsx`: Root application with Phase 1.5 initialization and layout
- `CentralWorkspace.tsx`: Main chart display area
- `DashboardView.tsx`: Results visualization and export functionality

**Chart Components** (`src/components/charts/`):
- Individual chart types (PValue, EffectSize, Distribution, etc.)
- `ChartContainer.tsx` and `StabilizedChartContainer.tsx` for chart wrapper logic
- Chart factory system for dynamic chart generation

### Development Notes

- Uses Vite for fast development and building
- TypeScript with strict mode enabled
- SQL.js loads from CDN: `https://sql.js.org/dist/`
- Charts support responsive design and resize handling
- State persistence through localStorage with Zustand middleware