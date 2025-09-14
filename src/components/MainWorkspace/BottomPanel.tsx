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
import { useVirtualizer } from '@tanstack/react-virtual';
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
} from '../../types/simulation.types';
import { useSimulationStore } from '../../stores/simulation.store';
import { BottomPanelProps } from './types';
import { DataMenu } from './WorkspaceMenus';

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

export const BottomPanel: React.FC<BottomPanelProps> = ({
  multiPairResults,
  onExportCSV
}) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Get significance levels from global settings
  const currentSession = useSimulationStore((state) => state.currentSession);
  const significanceLevels = currentSession?.parameters.global_settings.significance_levels || [0.01, 0.05, 0.10];

  // Create column helper for type-safe column definitions
  const columnHelper = createColumnHelper<TableRowData>();

  // Transform data to table format with dynamic significance columns
  const tableData: TableRowData[] = React.useMemo(() =>
    multiPairResults.pairs_results.map((pairResult: PairResult) => {
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
    }), [multiPairResults, significanceLevels]
  );

  // Define columns with semantic styling - base columns
  const baseColumns: ColumnDef<TableRowData, any>[] = [
    columnHelper.accessor('pair_name', {
      header: 'pair_name',
      cell: (info) => (
        <Box sx={{
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: '#000000' // Black for all data
        }}>
          {info.getValue()}
        </Box>
      ),
      size: 200,
    }),
    columnHelper.accessor('sample_size', {
      header: 'sample_size',
      cell: (info) => (
        <Box sx={{
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          textAlign: 'right',
          color: '#000000' // Black for all data
        }}>
          {info.getValue().toLocaleString()}
        </Box>
      ),
      size: 120,
    }),
    columnHelper.accessor('effect_size', {
      header: 'effect_size',
      cell: (info) => (
        <Box sx={{
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          textAlign: 'right',
          color: '#000000' // Black for all data
        }}>
          {info.getValue().toFixed(4)}
        </Box>
      ),
      size: 120,
    }),
    columnHelper.accessor('power', {
      header: 'power',
      cell: (info) => (
        <Box sx={{
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          textAlign: 'right',
          color: '#000000' // Black for all data
        }}>
          {info.getValue().toFixed(4)}
        </Box>
      ),
      size: 100,
    }),
    columnHelper.accessor('ci_coverage', {
      header: 'ci_coverage',
      cell: (info) => (
        <Box sx={{
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          textAlign: 'right',
          color: '#000000' // Black for all data
        }}>
          {info.getValue().toFixed(4)}
        </Box>
      ),
      size: 120,
    }),
    columnHelper.accessor('ci_width', {
      header: 'ci_width',
      cell: (info) => (
        <Box sx={{
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          textAlign: 'right',
          color: '#000000' // Black for all data
        }}>
          {info.getValue().toFixed(4)}
        </Box>
      ),
      size: 100,
    }),
  ];

  // Generate dynamic significance columns with black text
  const significanceColumns: ColumnDef<TableRowData, any>[] = significanceLevels.map(level => {
    const key = `p_${level.toString().replace('.', '_')}`;
    return columnHelper.accessor(key, {
      header: `p_${level}`,
      cell: (info) => (
        <Box sx={{
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          textAlign: 'right',
          color: '#000000', // Black for all data
          fontWeight: info.getValue() < level ? 600 : 400 // Bold if significant
        }}>
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

  // Virtualization setup
  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: tableData.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 35, // Estimated row height
    overscan: 10,
  });

  return (
    <Box sx={{ height: '100%', position: 'relative' }}>
      <TableContainer
        component={Paper}
        ref={tableContainerRef}
        sx={{
          maxHeight: '100%',
          borderRadius: 0, // Remove rounded edges
          boxShadow: 'none',
          border: '1px solid #e0e0e0'
        }}
      >
        <Table size="small" stickyHeader sx={{ borderRadius: 0 }}>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} sx={{ borderRadius: 0 }}>
                {headerGroup.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    sx={{
                      fontWeight: 'bold',
                      bgcolor: '#f5f5f5',
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      borderBottom: '2px solid #1976d2',
                      borderRight: '1px solid #e0e0e0',
                      p: 1,
                      textAlign: header.column.id === 'pair_name' ? 'left' : 'right',
                      cursor: header.column.getCanSort() ? 'pointer' : 'default',
                      '&:hover': {
                        bgcolor: header.column.getCanSort() ? '#e8f4fd' : '#f5f5f5',
                      },
                      transition: 'background-color 0.2s ease',
                      borderRadius: 0 // Remove rounded edges
                    }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: header.column.id === 'pair_name' ? 'flex-start' : 'flex-end'
                    }}>
                      {header.isPlaceholder ? null : (
                        <>
                          <Box sx={{
                            fontWeight: 600,
                            color: getColumnHeaderColor(header.column.id)
                          }}>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </Box>
                          {header.column.getCanSort() && (
                            <TableSortLabel
                              active={header.column.getIsSorted() !== false}
                              direction={header.column.getIsSorted() || 'asc'}
                              sx={{
                                ml: 0.5,
                                '& .MuiTableSortLabel-icon': { fontSize: '1rem' },
                                color: '#1976d2'
                              }}
                            />
                          )}
                        </>
                      )}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = table.getRowModel().rows[virtualRow.index];
              return (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    bgcolor: virtualRow.index % 2 === 0 ? '#ffffff' : '#f9f9f9', // Alternating colors
                    '&:hover': {
                      bgcolor: '#e3f2fd',
                    },
                    borderRadius: 0, // Remove rounded edges
                    borderBottom: '1px solid #e0e0e0'
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      sx={{
                        p: 1,
                        borderRight: '1px solid #f0f0f0',
                        borderRadius: 0 // Remove rounded edges
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Data Menu */}
      <DataMenu
        multiPairResults={multiPairResults}
        onExportCSV={onExportCSV}
      />
    </Box>
  );
};

// Helper function for column header coloring - light blue for all headers
function getColumnHeaderColor(columnId: string): string {
  return '#42a5f5'; // Light blue for all headers
}