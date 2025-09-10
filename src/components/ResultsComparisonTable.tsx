import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Tooltip,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider
} from '@mui/material';
import {
  Info as InfoIcon,
  BarChart as BarChartIcon,
  Science as ScienceIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import {
  MultiPairResults,
  EffectSizeCategory,
  SignificanceResult
} from '../types/simulation.types';

interface ResultsComparisonTableProps {
  results: MultiPairResults;
  significanceThresholds?: number[];
}

export const ResultsComparisonTable: React.FC<ResultsComparisonTableProps> = ({
  results,
  significanceThresholds = [0.01, 0.05, 0.10]
}) => {
  const getEffectSizeCategory = (effectSize: number): EffectSizeCategory => {
    const absEffect = Math.abs(effectSize);
    if (absEffect < 0.2) return 'negligible';
    if (absEffect < 0.5) return 'small';
    if (absEffect < 0.8) return 'medium';
    return 'large';
  };

  const getEffectSizeColor = (category: EffectSizeCategory): string => {
    switch (category) {
      case 'negligible': return 'default';
      case 'small': return 'blue';
      case 'medium': return 'orange';
      case 'large': return 'red';
      default: return 'default';
    }
  };

  const getSignificanceIcon = (percentage: number, threshold: number) => {
    if (percentage >= 50) return <CheckCircleIcon sx={{ color: 'success.main' }} />;
    if (percentage >= 20) return <WarningIcon sx={{ color: 'warning.main' }} />;
    return <ErrorIcon sx={{ color: 'error.main' }} />;
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  const getPowerColor = (power: number): string => {
    if (power >= 0.8) return '#52c41a';
    if (power >= 0.5) return '#faad14';
    return '#f5222d';
  };

  // Prepare table data
  const tableData = results.pairs_results.map((pairResult, index) => {
    const effectSizeCategory = getEffectSizeCategory(pairResult.effect_size_analysis.mean);
    const power = pairResult.significance_analysis.by_threshold[0.05]?.percentage || 0;

    return {
      key: pairResult.pair_id,
      pairName: pairResult.pair_name,
      sampleSize: pairResult.aggregated_stats.total_count,
      effectSize: pairResult.effect_size_analysis.mean,
      effectSizeCategory,
      power: power / 100,
      powerPercentage: power,
      significanceRates: significanceThresholds.map(threshold => ({
        threshold,
        rate: pairResult.significance_analysis.by_threshold[threshold]?.percentage || 0
      })),
      ciCoverage: pairResult.aggregated_stats.ci_coverage,
      ciWidth: pairResult.aggregated_stats.mean_ci_width,
      practicalSignificance: pairResult.effect_size_analysis.practical_significance
    };
  });

  // Table data is prepared above in tableData variable

  // Summary statistics
  const summaryStats = {
    totalPairs: results.pairs_results.length,
    averagePower: results.pairs_results.reduce((sum, pair) => {
      const power = pair.significance_analysis.by_threshold[0.05]?.percentage || 0;
      return sum + power;
    }, 0) / results.pairs_results.length,
    averageEffectSize: results.pairs_results.reduce((sum, pair) =>
      sum + Math.abs(pair.effect_size_analysis.mean), 0
    ) / results.pairs_results.length,
    totalSimulations: results.global_statistics.total_simulations,
    executionTime: results.execution_metadata.duration_ms
  };

  return (
    <Box>
      {/* Summary Statistics */}
      <Card sx={{ mb: 2 }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BarChartIcon />
              <Typography variant="h6">Multi-Pair Analysis Summary</Typography>
            </Box>
          }
        />
        <CardContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: '1 1 200px', textAlign: 'center', p: 2 }}>
              <ScienceIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" color="primary">
                {summaryStats.totalPairs}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Pairs
              </Typography>
            </Box>
            <Box sx={{ flex: '1 1 200px', textAlign: 'center', p: 2 }}>
              <TimelineIcon sx={{ fontSize: 32, color: getPowerColor(summaryStats.averagePower / 100), mb: 1 }} />
              <Typography variant="h4" sx={{ color: getPowerColor(summaryStats.averagePower / 100) }}>
                {summaryStats.averagePower.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average Power
              </Typography>
            </Box>
            <Box sx={{ flex: '1 1 200px', textAlign: 'center', p: 2 }}>
              <BarChartIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" color="primary">
                {summaryStats.averageEffectSize.toFixed(3)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                |d| = Average Effect Size
              </Typography>
            </Box>
            <Box sx={{ flex: '1 1 200px', textAlign: 'center', p: 2 }}>
              <InfoIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" color="primary">
                {summaryStats.totalSimulations.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Simulations
              </Typography>
            </Box>
            <Box sx={{ flex: '1 1 200px', textAlign: 'center', p: 2 }}>
              <ScienceIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" color="primary">
                {(summaryStats.executionTime / 1000).toFixed(2)}s
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Execution Time
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Main Comparison Table */}
      <Card>
        <CardHeader title="Detailed Results Comparison" />
        <CardContent>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Sample Pair</TableCell>
                  <TableCell align="center">Sample Size</TableCell>
                  <TableCell align="center">Effect Size</TableCell>
                  <TableCell align="center">Statistical Power</TableCell>
                  <TableCell align="center">CI Coverage</TableCell>
                  <TableCell align="center">Mean CI Width</TableCell>
                  {significanceThresholds.map(threshold => (
                    <TableCell key={threshold} align="center">
                      <Tooltip title={`α = ${threshold}`}>
                        <Typography variant="body2">α = {threshold}</Typography>
                      </Tooltip>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {tableData.map((row) => (
                  <TableRow key={row.key}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ScienceIcon sx={{ color: 'primary.main' }} />
                        <Typography variant="body2" fontWeight="bold">
                          {row.pairName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight="bold">
                        {row.sampleSize.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={row.practicalSignificance}>
                        <Chip
                          label={row.effectSize.toFixed(3)}
                          color={row.effectSizeCategory === 'large' ? 'error' :
                                row.effectSizeCategory === 'medium' ? 'warning' :
                                row.effectSizeCategory === 'small' ? 'info' : 'default'}
                          size="small"
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                        <CircularProgress
                          variant="determinate"
                          value={Math.round(row.power * 100)}
                          size={32}
                          sx={{ color: getPowerColor(row.power) }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {row.powerPercentage.toFixed(1)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={formatPercentage(row.ciCoverage * 100)}
                        color={row.ciCoverage >= 0.95 ? 'success' :
                              row.ciCoverage >= 0.90 ? 'warning' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {row.ciWidth.toFixed(3)}
                      </Typography>
                    </TableCell>
                    {row.significanceRates.map((sig) => (
                      <TableCell key={sig.threshold} align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          {getSignificanceIcon(sig.rate, sig.threshold)}
                          <Typography variant="body2">
                            {formatPercentage(sig.rate)}
                          </Typography>
                        </Box>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Effect Size Legend */}
      <Card sx={{ mt: 2 }}>
        <CardHeader title="Effect Size Interpretation (Cohen's d)" titleTypographyProps={{ variant: 'subtitle1' }} />
        <CardContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip label="Negligible: |d| < 0.2" variant="outlined" />
            <Chip label="Small: |d| = 0.2 - 0.5" color="info" />
            <Chip label="Medium: |d| = 0.5 - 0.8" color="warning" />
            <Chip label="Large: |d| > 0.8" color="error" />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};