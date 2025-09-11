import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  TableSortLabel,
} from '@mui/material';
import {
  MultiPairResults,
  PairResult
} from '../types/simulation.types';
import { useSimulationStore } from '../stores/simulation.store';

// Define the table data type - will be extended dynamically
type TableRowData = {
  pair_name: string;
  sample_size: number;
  effect_size: number;
  power: number;
  ci_coverage: number;
  ci_width: number;
  [key: string]: any; // For dynamic significance columns
};

interface TanStackResultsTableProps {
  results: MultiPairResults;
}

export const TanStackResultsTable: React.FC<TanStackResultsTableProps> = ({
  results
}) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Get significance levels from global settings
  const currentSession = useSimulationStore((state) => state.currentSession);
  const significanceLevels = currentSession?.parameters.global_settings.significance_levels || [0.01, 0.05, 0.10];

  // Create column helper for type-safe column definitions
  const columnHelper = createColumnHelper<TableRowData>();

  // Transform data to table format with dynamic significance columns
  const tableData: TableRowData[] = React.useMemo(() =>
    results.pairs_results.map((pairResult: PairResult) => {
      const power = pairResult.significance_analysis.by_threshold[0.05]?.percentage || 0;

      const rowData: TableRowData = {
        pair_name: pairResult.pair_name,
        sample_size: pairResult.aggregated_stats.total_count,
        effect_size: pairResult.effect_size_analysis.mean,
        power: power / 100,
        ci_coverage: pairResult.aggregated_stats.ci_coverage,
        ci_width: pairResult.aggregated_stats.mean_ci_width,
      };

      // Add dynamic significance columns
      significanceLevels.forEach(level => {
        const key = `p_${level.toString().replace('.', '_')}`;
        rowData[key] = (pairResult.significance_analysis.by_threshold[level]?.percentage || 0) / 100;
      });

      return rowData;
    }), [results, significanceLevels]
  );

  // Define columns with pandas-like styling - base columns
  const baseColumns: ColumnDef<TableRowData, any>[] = [
    columnHelper.accessor('pair_name', {
      header: 'pair_name',
      cell: (info) => (
        <Box sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
          {info.getValue()}
        </Box>
      ),
      size: 200,
    }),
    columnHelper.accessor('sample_size', {
      header: 'sample_size',
      cell: (info) => (
        <Box sx={{ fontFamily: 'monospace', fontSize: '0.875rem', textAlign: 'right' }}>
          {info.getValue().toLocaleString()}
        </Box>
      ),
      size: 120,
    }),
    columnHelper.accessor('effect_size', {
      header: 'effect_size',
      cell: (info) => (
        <Box sx={{ fontFamily: 'monospace', fontSize: '0.875rem', textAlign: 'right' }}>
          {info.getValue().toFixed(4)}
        </Box>
      ),
      size: 120,
    }),
    columnHelper.accessor('power', {
      header: 'power',
      cell: (info) => (
        <Box sx={{ fontFamily: 'monospace', fontSize: '0.875rem', textAlign: 'right' }}>
          {info.getValue().toFixed(4)}
        </Box>
      ),
      size: 100,
    }),
    columnHelper.accessor('ci_coverage', {
      header: 'ci_coverage',
      cell: (info) => (
        <Box sx={{ fontFamily: 'monospace', fontSize: '0.875rem', textAlign: 'right' }}>
          {info.getValue().toFixed(4)}
        </Box>
      ),
      size: 120,
    }),
    columnHelper.accessor('ci_width', {
      header: 'ci_width',
      cell: (info) => (
        <Box sx={{ fontFamily: 'monospace', fontSize: '0.875rem', textAlign: 'right' }}>
          {info.getValue().toFixed(4)}
        </Box>
      ),
      size: 100,
    }),
  ];

  // Generate dynamic significance columns
  const significanceColumns: ColumnDef<TableRowData, any>[] = significanceLevels.map(level => {
    const key = `p_${level.toString().replace('.', '_')}`;
    return columnHelper.accessor(key, {
      header: `p_${level}`,
      cell: (info) => (
        <Box sx={{ fontFamily: 'monospace', fontSize: '0.875rem', textAlign: 'right' }}>
          {(info.getValue() * 100).toFixed(2)}%
        </Box>
      ),
      size: 80,
    });
  });

  // Combine base columns with dynamic significance columns
  const columns: ColumnDef<TableRowData, any>[] = [...baseColumns, ...significanceColumns];

  // Create the table instance
  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Simulation Results
      </Typography>

      <TableContainer component={Paper} sx={{ maxHeight: '100%' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    sx={{
                      fontWeight: 'bold',
                      bgcolor: 'grey.100',
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      borderBottom: '2px solid',
                      borderColor: 'grey.300',
                      p: 1,
                      textAlign: header.column.id === 'pair_name' ? 'left' : 'right',
                      cursor: header.column.getCanSort() ? 'pointer' : 'default',
                      '&:hover': {
                        bgcolor: header.column.getCanSort() ? 'grey.200' : 'grey.100',
                      },
                    }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder ? null : (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: header.column.id === 'pair_name' ? 'flex-start' : 'flex-end' }}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <TableSortLabel
                            active={header.column.getIsSorted() !== false}
                            direction={header.column.getIsSorted() || 'asc'}
                            sx={{ ml: 0.5, '& .MuiTableSortLabel-icon': { fontSize: '1rem' } }}
                          />
                        )}
                      </Box>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                hover
                sx={{
                  '&:nth-of-type(odd)': {
                    bgcolor: 'grey.50',
                  },
                  '&:hover': {
                    bgcolor: 'grey.200',
                  },
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    sx={{
                      p: 1,
                      borderBottom: '1px solid',
                      borderColor: 'grey.200',
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {tableData.length} rows × {columns.length} columns
        </Typography>
      </Box>
    </Box>
  );
};