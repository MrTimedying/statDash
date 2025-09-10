import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box
} from '@mui/material';
import {
  MultiPairResults,
  PairResult
} from '../types/simulation.types';

interface SimpleResultsTableProps {
  results: MultiPairResults;
}

export const SimpleResultsTable: React.FC<SimpleResultsTableProps> = ({
  results
}) => {
  // Prepare table data in a pandas-like format
  const tableData = results.pairs_results.map((pairResult: PairResult) => {
    const power = pairResult.significance_analysis.by_threshold[0.05]?.percentage || 0;

    return {
      pair_name: pairResult.pair_name,
      sample_size: pairResult.aggregated_stats.total_count,
      effect_size: pairResult.effect_size_analysis.mean,
      power: power / 100,
      ci_coverage: pairResult.aggregated_stats.ci_coverage,
      ci_width: pairResult.aggregated_stats.mean_ci_width,
      p_001: pairResult.significance_analysis.by_threshold[0.01]?.percentage || 0,
      p_005: pairResult.significance_analysis.by_threshold[0.05]?.percentage || 0,
      p_010: pairResult.significance_analysis.by_threshold[0.10]?.percentage || 0
    };
  });

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Simulation Results
      </Typography>

      <TableContainer component={Paper} sx={{ maxHeight: '100%' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>pair_name</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>sample_size</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>effect_size</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>power</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>ci_coverage</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>ci_width</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>p_0.01</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>p_0.05</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>p_0.10</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row, index) => (
              <TableRow key={index} hover>
                <TableCell sx={{ fontFamily: 'monospace' }}>{row.pair_name}</TableCell>
                <TableCell align="right" sx={{ fontFamily: 'monospace' }}>{row.sample_size.toLocaleString()}</TableCell>
                <TableCell align="right" sx={{ fontFamily: 'monospace' }}>{row.effect_size.toFixed(4)}</TableCell>
                <TableCell align="right" sx={{ fontFamily: 'monospace' }}>{row.power.toFixed(4)}</TableCell>
                <TableCell align="right" sx={{ fontFamily: 'monospace' }}>{row.ci_coverage.toFixed(4)}</TableCell>
                <TableCell align="right" sx={{ fontFamily: 'monospace' }}>{row.ci_width.toFixed(4)}</TableCell>
                <TableCell align="right" sx={{ fontFamily: 'monospace' }}>{row.p_001.toFixed(2)}%</TableCell>
                <TableCell align="right" sx={{ fontFamily: 'monospace' }}>{row.p_005.toFixed(2)}%</TableCell>
                <TableCell align="right" sx={{ fontFamily: 'monospace' }}>{row.p_010.toFixed(2)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {results.pairs_results.length} rows × 9 columns
        </Typography>
      </Box>
    </Box>
  );
};