# Performance Optimization Strategy: StatDash
*High-performance statistical simulation with Web Workers + Rust WASM + Virtual Tables*

## Executive Summary

StatDash optimization strategy focusing on **client-side performance** while maintaining the simple `npm run dev` workflow. No backend complexity, maximum performance gains through modern web technologies.

**Performance Targets:**
- **15-30x faster** statistical computations (Web Workers + Rust WASM)
- **10-100x faster** table rendering (TanStack Virtual Tables)
- **Non-blocking UI** during heavy operations (OffscreenCanvas)
- **Same development workflow** (npm run dev)

## Architecture Decision: Web Workers + Rust WASM

### Core Strategy
Replace slow JavaScript statistical computations with compiled Rust WASM modules running in Web Workers, while keeping all data persistence and UI logic in React/TypeScript.

```
Performance Stack:
┌─────────────────────────────────────────────────────────────────┐
│ React UI (Main Thread)                                          │
│ ├── TanStack Virtual Tables (large dataset rendering)          │
│ ├── Zustand State Management (unchanged)                       │
│ └── SQL.js Local Storage (unchanged)                           │
├─────────────────────────────────────────────────────────────────┤
│ Web Workers (Background Threads)                               │
│ ├── Rust WASM Statistical Engine (15-30x faster)               │
│ ├── OffscreenCanvas Chart Rendering                            │
│ └── SharedArrayBuffer Communication                            │
└─────────────────────────────────────────────────────────────────┘
```

### Benefits
- ✅ **No Backend Complexity**: Stays client-side, keeps `npm run dev` workflow
- ✅ **Massive Performance Gains**: Rust WASM + parallel processing
- ✅ **Progressive Enhancement**: Graceful fallback to JavaScript
- ✅ **Existing Infrastructure**: Leverages current Web Worker setup
- ✅ **Modern Web Standards**: Future-proof technology stack

## Phase 1: Table Performance Optimization (Week 1)

### Current Problem
`DataTablesModal.tsx` uses basic MUI Tables that render ALL rows in DOM:
- 10,000 simulation results = 10,000 DOM elements
- Causes browser freezing and memory issues
- No built-in sorting, filtering, or pagination

### Solution: TanStack Virtual Table
Replace MUI tables with TanStack Virtual Table featuring:
- **Virtualization**: Only renders visible rows (~20-50 DOM elements)
- **Built-in sorting, filtering, pagination**
- **Column resizing and reordering**
- **Export functionality**
- **10-100x performance improvement for large datasets**

#### Implementation Plan
```typescript
// src/components/tables/VirtualizedResultsTable.tsx
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualizedTableProps {
  data: SimulationResult[];
  columns: ColumnDef<SimulationResult>[];
}

const VirtualizedResultsTable: React.FC<VirtualizedTableProps> = ({ data, columns }) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Virtual scrolling for performance
  const virtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 35, // Row height
    overscan: 10,
  });

  return (
    // Virtual table implementation
    // Only renders visible rows for performance
  );
};
```

## Phase 2: Rust WASM Statistical Engine (Week 2-3)

### Current Problem
JavaScript statistical computations using jStat are slow:
- Single-threaded execution blocks UI
- Inefficient mathematical operations
- Memory allocation overhead

### Solution: Rust + WASM
High-performance statistical engine compiled to WebAssembly:

#### Project Structure
```
src/wasm/
├── Cargo.toml          # Rust dependencies
├── src/
│   ├── lib.rs          # WASM bindings
│   ├── stats.rs        # Statistical functions
│   └── simulation.rs   # Multi-pair simulation logic
└── pkg/                # Generated WASM binaries
```

#### Rust Implementation
```rust
// src/wasm/src/lib.rs
use wasm_bindgen::prelude::*;
use statrs::distribution::{Normal, ContinuousCDF};
use js_sys::Array;

#[wasm_bindgen]
pub struct SimulationEngine;

#[wasm_bindgen]
impl SimulationEngine {
    #[wasm_bindgen(constructor)]
    pub fn new() -> SimulationEngine {
        SimulationEngine
    }

    #[wasm_bindgen]
    pub fn run_multi_pair_simulation(&self, params: &JsValue) -> JsValue {
        // High-performance vectorized statistical operations
        // 15-30x faster than JavaScript equivalent

        let params: SimulationParams = params.into_serde().unwrap();
        let mut results = Vec::new();

        for pair in params.pairs {
            let group1_samples: Vec<f64> = (0..params.num_simulations)
                .map(|_| Normal::new(pair.group1_mean, pair.group1_std).unwrap().sample(&mut rng))
                .collect();

            let group2_samples: Vec<f64> = (0..params.num_simulations)
                .map(|_| Normal::new(pair.group2_mean, pair.group2_std).unwrap().sample(&mut rng))
                .collect();

            // Vectorized t-tests and effect size calculations
            let pair_results = calculate_statistics(&group1_samples, &group2_samples);
            results.push(pair_results);
        }

        JsValue::from_serde(&results).unwrap()
    }
}
```

#### WASM Build Pipeline
```toml
# Cargo.toml
[package]
name = "statdash-wasm"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
wasm-bindgen = "0.2"
statrs = "0.16"
js-sys = "0.3"
serde = { version = "1.0", features = ["derive"] }
serde-wasm-bindgen = "0.4"

[dependencies.web-sys]
version = "0.3"
features = [
  "console",
  "Performance",
  "Window",
]
```

## Phase 3: Web Worker Integration (Week 3-4)

### Enhanced Worker Architecture
Integrate Rust WASM with existing Web Worker infrastructure:

```typescript
// src/services/wasm-worker.service.ts
class WasmWorkerService {
  private workers: Worker[] = [];
  private wasmModule: any;

  async initializeWorkers(numWorkers: number = navigator.hardwareConcurrency) {
    // Initialize multiple workers for parallel processing
    for (let i = 0; i < numWorkers; i++) {
      const worker = new Worker('/workers/simulation-worker.js');
      await this.loadWasmInWorker(worker);
      this.workers.push(worker);
    }
  }

  async runSimulation(params: MultiPairSimulationParams): Promise<MultiPairResults> {
    // Distribute work across multiple workers
    const chunkSize = Math.ceil(params.pairs.length / this.workers.length);
    const promises = this.workers.map((worker, index) => {
      const startIndex = index * chunkSize;
      const endIndex = Math.min(startIndex + chunkSize, params.pairs.length);
      const chunk = params.pairs.slice(startIndex, endIndex);

      return this.runWorkerSimulation(worker, { ...params, pairs: chunk });
    });

    const results = await Promise.all(promises);
    return this.mergeResults(results);
  }
}
```

#### Worker Implementation
```javascript
// public/workers/simulation-worker.js
importScripts('/wasm/pkg/statdash_wasm.js');

let wasmModule;

async function initializeWasm() {
  wasmModule = await wasm_bindgen('/wasm/pkg/statdash_wasm_bg.wasm');
  const engine = new wasm_bindgen.SimulationEngine();

  self.postMessage({ type: 'ready' });

  self.onmessage = async (event) => {
    const { type, data } = event.data;

    if (type === 'simulate') {
      try {
        const results = engine.run_multi_pair_simulation(data);
        self.postMessage({ type: 'results', data: results });
      } catch (error) {
        self.postMessage({ type: 'error', error: error.message });
      }
    }
  };
}

initializeWasm();
```

## Phase 4: Advanced Optimizations (Week 5-6)

### OffscreenCanvas Chart Rendering
Move chart rendering to Web Workers to prevent UI blocking:

```typescript
// src/services/chart-worker.service.ts
class ChartWorkerService {
  private chartWorker: Worker;

  constructor() {
    this.chartWorker = new Worker('/workers/chart-worker.js');
  }

  async renderChart(
    data: ChartData,
    config: ChartConfig,
    canvas: OffscreenCanvas
  ): Promise<ImageBitmap> {
    return new Promise((resolve) => {
      this.chartWorker.postMessage({
        type: 'render',
        data,
        config,
        canvas
      }, [canvas]);

      this.chartWorker.onmessage = (event) => {
        if (event.data.type === 'rendered') {
          resolve(event.data.imageBitmap);
        }
      };
    });
  }
}
```

### SharedArrayBuffer for High-Performance Communication
Enable zero-copy data sharing between workers:

```typescript
// src/services/shared-memory.service.ts
class SharedMemoryService {
  private sharedBuffer: SharedArrayBuffer;
  private float64Array: Float64Array;

  constructor(size: number) {
    this.sharedBuffer = new SharedArrayBuffer(size * 8); // 8 bytes per float64
    this.float64Array = new Float64Array(this.sharedBuffer);
  }

  writeResults(results: number[], offset: number = 0): void {
    this.float64Array.set(results, offset);
  }

  readResults(length: number, offset: number = 0): number[] {
    return Array.from(this.float64Array.slice(offset, offset + length));
  }
}
```

## Development Workflow Integration

### Build Configuration
```json
// package.json
{
  "scripts": {
    "dev": "npm run build:wasm && vite",
    "build": "npm run build:wasm && vite build",
    "build:wasm": "cd src/wasm && wasm-pack build --target web --out-dir pkg",
    "test:wasm": "cd src/wasm && cargo test"
  },
  "devDependencies": {
    "@wasm-tool/wasm-pack-plugin": "^1.6.0",
    "vite-plugin-wasm": "^3.2.2"
  }
}
```

### Vite Configuration
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    react(),
    wasm(),
    {
      name: 'wasm-pack',
      buildStart() {
        exec('cd src/wasm && wasm-pack build --target web');
      }
    }
  ],
  worker: {
    format: 'es',
    plugins: [wasm()]
  },
  optimizeDeps: {
    include: ['@tanstack/react-table', '@tanstack/react-virtual']
  }
});
```

## Performance Benchmarks & Success Metrics

### Target Performance Improvements
1. **Statistical Computations**: 15-30x faster (Rust WASM vs JavaScript)
2. **Table Rendering**: 10-100x faster (Virtual scrolling vs DOM rendering)
3. **UI Responsiveness**: No blocking during heavy operations
4. **Memory Usage**: 50-80% reduction for large datasets

### Benchmark Implementation
```typescript
// src/utils/performance-benchmarks.ts
interface BenchmarkResult {
  jsTime: number;
  wasmTime: number;
  tableRenderTime: number;
  memoryUsage: number;
  improvementFactor: number;
}

class PerformanceBenchmark {
  async runComputationBenchmark(
    params: MultiPairSimulationParams
  ): Promise<BenchmarkResult> {
    // JavaScript baseline
    const jsStart = performance.now();
    const jsResults = await this.runJavaScriptSimulation(params);
    const jsTime = performance.now() - jsStart;

    // WASM comparison
    const wasmStart = performance.now();
    const wasmResults = await this.runWasmSimulation(params);
    const wasmTime = performance.now() - wasmStart;

    return {
      jsTime,
      wasmTime,
      improvementFactor: jsTime / wasmTime,
      // Additional metrics...
    };
  }
}
```

## Risk Management & Fallback Strategy

### Graceful Degradation
```typescript
// src/services/adaptive-simulation.service.ts
class AdaptiveSimulationService {
  private wasmAvailable: boolean = false;
  private workersAvailable: boolean = false;

  async initialize() {
    // Check WASM support
    this.wasmAvailable = await this.checkWasmSupport();
    this.workersAvailable = typeof Worker !== 'undefined';
  }

  async runSimulation(params: MultiPairSimulationParams): Promise<MultiPairResults> {
    if (this.wasmAvailable && this.workersAvailable) {
      // Best performance: WASM + Workers
      return this.wasmWorkerService.runSimulation(params);
    } else if (this.workersAvailable) {
      // Fallback: JavaScript + Workers
      return this.jsWorkerService.runSimulation(params);
    } else {
      // Fallback: Single-threaded JavaScript
      return this.jsSimulationService.runSimulation(params);
    }
  }
}
```

## Implementation Timeline

| Phase | Duration | Key Deliverable | Performance Gain |
|-------|----------|-----------------|------------------|
| **Phase 1** | Week 1 | TanStack Virtual Tables | 10-100x table rendering |
| **Phase 2** | Week 2-3 | Rust WASM Statistical Engine | 15-30x computation speed |
| **Phase 3** | Week 3-4 | Web Worker Integration | Parallel processing |
| **Phase 4** | Week 5-6 | OffscreenCanvas + SharedArrayBuffer | UI responsiveness |

**Total Duration**: 6 weeks with continuous `npm run dev` workflow throughout

## Technology Stack Summary

**Computation Layer**:
- Rust + WebAssembly for statistical operations
- Multiple Web Workers for parallel processing
- SharedArrayBuffer for zero-copy data sharing

**UI Layer**:
- TanStack Virtual Tables for large dataset rendering
- OffscreenCanvas for non-blocking chart rendering
- React + Zustand (unchanged) for state management

**Development**:
- Same `npm run dev` workflow
- Vite + wasm-pack build integration
- Progressive enhancement with fallbacks

**Deployment**:
- Single-page application (no backend)
- Static hosting compatible
- Works offline after initial load

This strategy delivers maximum performance gains while maintaining development simplicity and preserving the existing `npm run dev` workflow.