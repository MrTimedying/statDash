# Phase 2 Technical Implementation Specifications

## Priority Implementation Matrix

### 🔥 Critical Priority (Phase 2 Core)
1. **UI Library Integration** - Ant Design setup with theming
2. **Multiple Sample Pairs** - Core architectural change
3. **Comparison Tables** - Essential for multi-pair analysis
4. **Multiple Significance Thresholds** - Key statistical enhancement

### 🎯 High Priority (Enhanced Features)
5. **Theme System** - Dark/light mode implementation
6. **Enhanced Charts** - Better visualization with Ant Design integration
7. **Data Export Enhancement** - Multiple formats
8. **Dynamic Pair Management** - Add/remove pairs UI

### 📈 Medium Priority (Advanced Features)
9. **Statistical Power Analysis** - Educational value addition
10. **Simulation Presets** - User experience improvement
11. **Advanced Statistical Tests** - Extended functionality
12. **Progress Indicators** - Better UX for long operations

### ⚡ Future Enhancements
13. **Simulation History** - Data persistence
14. **Help System** - Educational documentation
15. **PWA Features** - Offline capability
16. **Keyboard Shortcuts** - Power user features

## Core Interface Mockups

### Enhanced Control Panel Design
```
┌─────────────────────────────────────┐
│  📊 StatDash - Simulation Controls   │
├─────────────────────────────────────┤
│                                     │
│  🎯 Sample Pairs                    │
│  ┌─ Pair 1: Control vs Treatment ──┐│
│  │  Group 1: μ=0, σ=1, n=30        ││
│  │  Group 2: μ=0.5, σ=1, n=30      ││
│  │  [📝] [🗑️] [📋]                  ││
│  └─────────────────────────────────┘│
│  ┌─ Pair 2: Pre vs Post ──────────┐│
│  │  Group 1: μ=10, σ=2, n=25       ││
│  │  Group 2: μ=12, σ=2, n=25       ││
│  │  [📝] [🗑️] [📋]                  ││
│  └─────────────────────────────────┘│
│  [➕ Add New Pair]                  │
│                                     │
│  ⚙️ Global Settings                 │
│  ┌─────────────────────────────────┐│
│  │  Simulations: [1000        ] ▼ ││
│  │  α levels: [0.01][0.05][0.10]  ││
│  │  Custom α: [     ] [+]          ││
│  │  CI Level: 95% ▼                ││
│  └─────────────────────────────────┘│
│                                     │
│  🚀 [Run Multi-Pair Analysis]       │
│  💾 [Save as Preset]                │
│  🌙 Theme: [🌞] Light               │
└─────────────────────────────────────┘
```

### Enhanced Results Dashboard
```
┌────────────────────────────────────────────────────────────┐
│  📈 Results Dashboard          [📊Export ▼] [🌙 Dark Mode]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  [📊 Overview] [📈 P-Values] [🎯 CIs] [⚡ Power] [📋 Raw]   │
│  ──────────────────────────────────────────────────────────│
│                                                            │
│  📋 Multi-Pair Comparison Summary                          │
│  ┌─────────────┬──────────┬──────────┬──────────┬────────┐ │
│  │ Pair Name   │ n (each) │ Effect   │ p < 0.05 │ Power  │ │
│  ├─────────────┼──────────┼──────────┼──────────┼────────┤ │
│  │ Ctrl vs Trt │    30    │   0.48   │  73.2%   │ 0.68   │ │
│  │ Pre vs Post │    25    │   0.89   │  94.7%   │ 0.92   │ │
│  │ Drug vs Plc │    40    │   0.31   │  52.1%   │ 0.45   │ │
│  └─────────────┴──────────┴──────────┴──────────┴────────┘ │
│                                                            │
│  📊 Significance Analysis Across Thresholds                │
│  ┌─────────────┬──────────┬──────────┬──────────────────┐  │
│  │ Pair Name   │ α = 0.01 │ α = 0.05 │ α = 0.10         │  │
│  ├─────────────┼──────────┼──────────┼──────────────────┤  │
│  │ Ctrl vs Trt │  34.2%   │  73.2%   │  89.1%           │  │
│  │ Pre vs Post │  78.9%   │  94.7%   │  97.8%           │  │
│  │ Drug vs Plc │  21.3%   │  52.1%   │  71.4%           │  │
│  └─────────────┴──────────┴──────────┴──────────────────┘  │
│                                                            │
│  [📊 View Detailed Charts] [📋 Statistical Report]         │
└────────────────────────────────────────────────────────────┘
```

## Technical Implementation Details

### 1. Enhanced Data Structures

```typescript
// Enhanced simulation parameters for multiple pairs
interface MultiPairSimulationParams {
  pairs: SamplePair[];
  global_settings: GlobalSimulationSettings;
  ui_preferences: UIPreferences;
}

interface SamplePair {
  id: string;
  name: string;
  description?: string;
  group1: PopulationParams;
  group2: PopulationParams;
  sample_size_per_group: number;
  enabled: boolean;
  color_scheme?: string;
}

interface PopulationParams {
  mean: number;
  std: number;
  distribution_type?: 'normal' | 'uniform' | 'exponential';
}

interface GlobalSimulationSettings {
  num_simulations: number;
  significance_levels: number[];
  confidence_level: number;
  random_seed?: number;
  test_type: 'welch' | 'pooled' | 'mann_whitney';
}

interface UIPreferences {
  theme: 'light' | 'dark' | 'auto';
  decimal_places: number;
  chart_animations: boolean;
  color_blind_safe: boolean;
}

// Enhanced results structure
interface MultiPairResults {
  pairs_results: PairResult[];
  cross_pair_analysis: CrossPairAnalysis;
  global_statistics: GlobalStatistics;
  execution_metadata: ExecutionMetadata;
}

interface PairResult {
  pair_id: string;
  pair_name: string;
  individual_results: SimulationResult[];
  aggregated_stats: AggregatedStats;
  significance_analysis: SignificanceAnalysis;
  effect_size_analysis: EffectSizeAnalysis;
}

interface CrossPairAnalysis {
  effect_size_comparison: EffectSizeComparison[];
  power_analysis: PowerAnalysis[];
  significance_correlation: SignificanceCorrelation;
  recommendations: AnalysisRecommendation[];
}

interface SignificanceAnalysis {
  by_threshold: Record<number, SignificanceResult>;
  threshold_sensitivity: ThresholdSensitivity;
}

interface SignificanceResult {
  threshold: number;
  significant_count: number;
  percentage: number;
  confidence_interval: [number, number];
}
```

### 2. Ant Design Component Specifications

#### 2.1 Theme Configuration
```typescript
import { ConfigProvider, theme } from 'antd';

const lightTheme = {
  token: {
    colorPrimary: '#1890ff',
    colorBgContainer: '#ffffff',
    colorText: '#000000d9',
    borderRadius: 6,
    // Statistical color scheme
    colorSuccess: '#52c41a', // Significant results
    colorWarning: '#faad14', // Marginal significance
    colorError: '#f5222d',   // Non-significant
  },
  algorithm: theme.defaultAlgorithm,
};

const darkTheme = {
  token: {
    colorPrimary: '#177ddc',
    colorBgContainer: '#141414',
    colorText: '#ffffffd9',
    borderRadius: 6,
    colorSuccess: '#49aa19',
    colorWarning: '#d89614',
    colorError: '#dc4446',
  },
  algorithm: theme.darkAlgorithm,
};
```

#### 2.2 Enhanced Form Components
```typescript
// Sample Pair Form Component
import { Form, InputNumber, Input, Card, Button, Space, Tooltip } from 'antd';
import { DeleteOutlined, CopyOutlined, EditOutlined } from '@ant-design/icons';

const SamplePairForm: React.FC<SamplePairFormProps> = ({ pair, onUpdate, onDelete, onClone }) => (
  <Card
    size="small"
    title={
      <Space>
        <Input
          value={pair.name}
          onChange={(e) => onUpdate({ ...pair, name: e.target.value })}
          style={{ width: 200 }}
        />
        <Tooltip title="Edit pair settings">
          <Button icon={<EditOutlined />} size="small" />
        </Tooltip>
      </Space>
    }
    extra={
      <Space>
        <Tooltip title="Clone this pair">
          <Button icon={<CopyOutlined />} size="small" onClick={onClone} />
        </Tooltip>
        <Tooltip title="Delete this pair">
          <Button 
            icon={<DeleteOutlined />} 
            size="small" 
            danger 
            onClick={onDelete}
          />
        </Tooltip>
      </Space>
    }
  >
    <Form layout="vertical" size="small">
      <Form.Item label="Group 1 (Control)">
        <Space>
          <InputNumber
            addonBefore="μ ="
            value={pair.group1.mean}
            onChange={(value) => onUpdate({
              ...pair,
              group1: { ...pair.group1, mean: value || 0 }
            })}
            step={0.1}
            precision={2}
          />
          <InputNumber
            addonBefore="σ ="
            value={pair.group1.std}
            onChange={(value) => onUpdate({
              ...pair,
              group1: { ...pair.group1, std: value || 1 }
            })}
            min={0.01}
            step={0.1}
            precision={2}
          />
        </Space>
      </Form.Item>
      
      <Form.Item label="Group 2 (Treatment)">
        <Space>
          <InputNumber
            addonBefore="μ ="
            value={pair.group2.mean}
            onChange={(value) => onUpdate({
              ...pair,
              group2: { ...pair.group2, mean: value || 0 }
            })}
            step={0.1}
            precision={2}
          />
          <InputNumber
            addonBefore="σ ="
            value={pair.group2.std}
            onChange={(value) => onUpdate({
              ...pair,
              group2: { ...pair.group2, std: value || 1 }
            })}
            min={0.01}
            step={0.1}
            precision={2}
          />
        </Space>
      </Form.Item>
      
      <Form.Item label="Sample Size (per group)">
        <InputNumber
          value={pair.sample_size_per_group}
          onChange={(value) => onUpdate({
            ...pair,
            sample_size_per_group: value || 30
          })}
          min={5}
          max={1000}
          addonAfter="per group"
        />
      </Form.Item>
    </Form>
  </Card>
);
```

#### 2.3 Results Comparison Table
```typescript
import { Table, Tag, Tooltip, Progress } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface ComparisonTableData {
  key: string;
  pairName: string;
  sampleSize: number;
  effectSize: number;
  power: number;
  significanceRates: Record<number, number>;
}

const ResultsComparisonTable: React.FC<{ data: MultiPairResults }> = ({ data }) => {
  const columns: ColumnsType<ComparisonTableData> = [
    {
      title: 'Sample Pair',
      dataIndex: 'pairName',
      key: 'pairName',
      fixed: 'left',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Sample Size',
      dataIndex: 'sampleSize',
      key: 'sampleSize',
      align: 'center',
      render: (size: number) => `${size} × 2`,
    },
    {
      title: 'Effect Size',
      dataIndex: 'effectSize',
      key: 'effectSize',
      align: 'center',
      render: (value: number) => (
        <Tooltip title={getEffectSizeInterpretation(value)}>
          <span style={{ 
            color: getEffectSizeColor(value),
            fontWeight: 'bold'
          }}>
            {value.toFixed(3)}
          </span>
        </Tooltip>
      ),
      sorter: (a, b) => a.effectSize - b.effectSize,
    },
    {
      title: 'Statistical Power',
      dataIndex: 'power',
      key: 'power',
      align: 'center',
      render: (power: number) => (
        <Progress
          type="circle"
          size={50}
          percent={Math.round(power * 100)}
          format={(percent) => `${percent}%`}
          strokeColor={power >= 0.8 ? '#52c41a' : power >= 0.5 ? '#faad14' : '#f5222d'}
        />
      ),
      sorter: (a, b) => a.power - b.power,
    },
    {
      title: 'Significance Rate',
      children: [
        {
          title: 'α = 0.01',
          dataIndex: ['significanceRates', 0.01],
          key: 'sig001',
          align: 'center',
          render: (rate: number) => renderSignificanceRate(rate, 0.01),
          sorter: (a, b) => a.significanceRates[0.01] - b.significanceRates[0.01],
        },
        {
          title: 'α = 0.05',
          dataIndex: ['significanceRates', 0.05],
          key: 'sig005',
          align: 'center',
          render: (rate: number) => renderSignificanceRate(rate, 0.05),
          sorter: (a, b) => a.significanceRates[0.05] - b.significanceRates[0.05],
        },
        {
          title: 'α = 0.10',
          dataIndex: ['significanceRates', 0.10],
          key: 'sig010',
          align: 'center',
          render: (rate: number) => renderSignificanceRate(rate, 0.10),
          sorter: (a, b) => a.significanceRates[0.10] - b.significanceRates[0.10],
        },
      ],
    },
  ];

  const renderSignificanceRate = (rate: number, alpha: number) => (
    <Tag 
      color={rate > 50 ? 'success' : rate > 20 ? 'warning' : 'error'}
    >
      {(rate).toFixed(1)}%
    </Tag>
  );

  return (
    <Table
      columns={columns}
      dataSource={transformResultsToTableData(data)}
      pagination={false}
      scroll={{ x: 800 }}
      size="small"
      bordered
    />
  );
};
```

### 3. Enhanced Simulation Engine Architecture

```typescript
// Multi-pair simulation orchestrator
export class MultiPairSimulationEngine {
  private webWorker?: Worker;
  
  constructor() {
    // Initialize web worker for heavy computations
    if (typeof Worker !== 'undefined') {
      this.webWorker = new Worker(
        new URL('./simulation.worker.ts', import.meta.url)
      );
    }
  }

  async runMultiPairSimulation(
    params: MultiPairSimulationParams,
    onProgress?: (progress: SimulationProgress) => void
  ): Promise<MultiPairResults> {
    const results: PairResult[] = [];
    const totalPairs = params.pairs.filter(p => p.enabled).length;
    
    for (let i = 0; i < totalPairs; i++) {
      const pair = params.pairs[i];
      
      // Update progress
      onProgress?.({
        currentPair: i + 1,
        totalPairs,
        currentSimulation: 0,
        totalSimulations: params.global_settings.num_simulations,
        phase: 'running_simulations'
      });

      const pairResult = await this.runSinglePairSimulation(
        pair,
        params.global_settings,
        (simProgress) => {
          onProgress?.({
            currentPair: i + 1,
            totalPairs,
            currentSimulation: simProgress.completed,
            totalSimulations: simProgress.total,
            phase: 'running_simulations'
          });
        }
      );

      results.push(pairResult);
    }

    // Cross-pair analysis
    onProgress?.({
      currentPair: totalPairs,
      totalPairs,
      currentSimulation: params.global_settings.num_simulations,
      totalSimulations: params.global_settings.num_simulations,
      phase: 'analyzing_results'
    });

    const crossPairAnalysis = await this.performCrossPairAnalysis(results);
    
    return {
      pairs_results: results,
      cross_pair_analysis: crossPairAnalysis,
      global_statistics: this.calculateGlobalStatistics(results),
      execution_metadata: {
        timestamp: new Date(),
        duration_ms: performance.now(),
        parameters: params
      }
    };
  }

  private async runSinglePairSimulation(
    pair: SamplePair,
    settings: GlobalSimulationSettings,
    onProgress?: (progress: { completed: number; total: number }) => void
  ): Promise<PairResult> {
    // Implementation for single pair simulation
    // Uses existing simulationEngine.ts logic but enhanced
    const results: SimulationResult[] = [];
    
    for (let i = 0; i < settings.num_simulations; i++) {
      // Generate samples and perform statistical test
      const result = await this.performSingleSimulation(pair, settings);
      results.push(result);
      
      // Progress callback
      if (i % 100 === 0) {
        onProgress?.({ completed: i, total: settings.num_simulations });
        // Yield control to prevent UI blocking
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    return {
      pair_id: pair.id,
      pair_name: pair.name,
      individual_results: results,
      aggregated_stats: this.calculateAggregatedStats(results),
      significance_analysis: this.analyzeSignificance(results, settings.significance_levels),
      effect_size_analysis: this.analyzeEffectSizes(results)
    };
  }

  private async performCrossPairAnalysis(results: PairResult[]): Promise<CrossPairAnalysis> {
    return {
      effect_size_comparison: this.compareEffectSizes(results),
      power_analysis: this.analyzePower(results),
      significance_correlation: this.analyzeSignificanceCorrelation(results),
      recommendations: this.generateRecommendations(results)
    };
  }
}
```

### 4. Export System Enhancement

```typescript
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface ExportOptions {
  format: 'csv' | 'json' | 'excel' | 'pdf_report';
  include_raw_data: boolean;
  include_charts: boolean;
  include_summary: boolean;
  filename_prefix?: string;
}

export class EnhancedExportService {
  async exportResults(
    results: MultiPairResults,
    options: ExportOptions
  ): Promise<void> {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `${options.filename_prefix || 'simulation_results'}_${timestamp}`;

    switch (options.format) {
      case 'excel':
        await this.exportToExcel(results, options, filename);
        break;
      case 'csv':
        await this.exportToCSV(results, options, filename);
        break;
      case 'json':
        await this.exportToJSON(results, options, filename);
        break;
      case 'pdf_report':
        await this.exportToPDFReport(results, options, filename);
        break;
    }
  }

  private async exportToExcel(
    results: MultiPairResults,
    options: ExportOptions,
    filename: string
  ): Promise<void> {
    const workbook = XLSX.utils.book_new();

    // Summary sheet
    if (options.include_summary) {
      const summaryData = this.prepareSummaryData(results);
      const summaryWS = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summaryWS, 'Summary');
    }

    // Individual pair sheets
    results.pairs_results.forEach((pairResult, index) => {
      const pairData = options.include_raw_data 
        ? pairResult.individual_results
        : [pairResult.aggregated_stats];
      
      const ws = XLSX.utils.json_to_sheet(pairData);
      XLSX.utils.book_append_sheet(workbook, ws, `Pair_${index + 1}_${pairResult.pair_name.replace(/[^a-zA-Z0-9]/g, '_')}`);
    });

    // Cross-pair analysis sheet
    const crossAnalysisWS = XLSX.utils.json_to_sheet([results.cross_pair_analysis]);
    XLSX.utils.book_append_sheet(workbook, crossAnalysisWS, 'Cross_Pair_Analysis');

    // Save file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `${filename}.xlsx`);
  }
}
```

This technical specification provides the detailed implementation roadmap for transforming StatDash into a comprehensive multi-pair statistical simulation platform with modern UI/UX.