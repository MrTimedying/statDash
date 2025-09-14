import React, { useMemo, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  IconButton
} from '@mui/material';
import {
  Download as DownloadIcon,
  ArrowUpward as SortAscIcon,
  ArrowDownward as SortDescIcon
} from '@mui/icons-material';

interface SimulationResult {
  simulation_index: number;
  p_value: number;
  effect_size: number;
  confidence_interval: [number, number];
  s_value: number;
  significant: boolean;
}

interface VirtualizedResultsTableProps {
  data: SimulationResult[];
  pairName: string;
  onExportCSV: (pairName: string, results: SimulationResult[]) => void;
}

export const VirtualizedResultsTable: React.FC<VirtualizedResultsTableProps> = ({
  data,
  pairName,
  onExportCSV
}) => {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');

  const columns = useMemo<ColumnDef<SimulationResult>[]>(
    () => [
      {
        accessorKey: 'simulation_index',
        header: 'Replication',
        size: 100,
        cell: ({ getValue }) => (getValue() as number) + 1
      },
      {
        accessorKey: 'p_value',
        header: 'P-Value',
        size: 120,
        cell: ({ getValue }) => (getValue() as number).toFixed(6)
      },
      {
        accessorKey: 'effect_size',
        header: 'Effect Size',
        size: 120,
        cell: ({ getValue }) => (getValue() as number).toFixed(3)
      },
      {
        accessorKey: 'confidence_interval',
        header: 'CI Lower',
        size: 100,
        cell: ({ getValue }) => {
          const ci = getValue() as [number, number];
          return ci[0].toFixed(3);
        }
      },
      {
        id: 'ci_upper',
        header: 'CI Upper',
        size: 100,
        cell: ({ row }) => {
          const ci = row.original.confidence_interval;
          return ci[1].toFixed(3);
        }
      },
      {
        accessorKey: 's_value',
        header: 'S-Value',
        size: 100,
        cell: ({ getValue }) => (getValue() as number).toFixed(2)
      },
      {
        accessorKey: 'significant',
        header: 'Significant',
        size: 100,
        cell: ({ getValue }) => (
          <Typography
            variant="body2"
            sx={{
              color: getValue() ? 'success.main' : 'text.secondary',
              fontWeight: getValue() ? 'bold' : 'normal'
            }}
          >
            {getValue() ? 'Yes' : 'No'}
          </Typography>
        )
      }
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    debugTable: process.env.NODE_ENV === 'development'
  });

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 35,
    overscan: 20
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0)
      : 0;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header with search and export */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
          {pairName} - Detailed Results ({data.length.toLocaleString()} rows)
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            placeholder="Search results..."
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(String(e.target.value))}
            size="small"
            sx={{ width: 200 }}
          />
          <Button
            startIcon={<DownloadIcon />}
            onClick={() => onExportCSV(pairName, data)}
            variant="outlined"
            size="small"
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      {/* Virtual Table */}
      <Paper sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Table Header */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: columns.map(col => `${col.size}px`).join(' '),
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'grey.50',
            minHeight: 40
          }}
        >
          {table.getHeaderGroups().map((headerGroup) =>
            headerGroup.headers.map((header) => (
              <Box
                key={header.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 1,
                  py: 0.5,
                  cursor: header.column.getCanSort() ? 'pointer' : 'default',
                  userSelect: 'none',
                  '&:hover': {
                    bgcolor: header.column.getCanSort() ? 'grey.100' : 'transparent'
                  }
                }}
                onClick={header.column.getToggleSortingHandler()}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </Typography>
                {header.column.getIsSorted() && (
                  <IconButton size="small" sx={{ ml: 0.5, p: 0 }}>
                    {header.column.getIsSorted() === 'asc' ? (
                      <SortAscIcon sx={{ fontSize: 12 }} />
                    ) : (
                      <SortDescIcon sx={{ fontSize: 12 }} />
                    )}
                  </IconButton>
                )}
              </Box>
            ))
          )}
        </Box>

        {/* Virtual Table Body */}
        <Box
          ref={tableContainerRef}
          sx={{
            flex: 1,
            overflow: 'auto'
          }}
        >
          <div
            style={{
              height: `${totalSize}px`,
              width: '100%',
              position: 'relative'
            }}
          >
            {paddingTop > 0 && (
              <div style={{ height: `${paddingTop}px` }} />
            )}

            {virtualRows.map((virtualRow) => {
              const row = rows[virtualRow.index];
              return (
                <Box
                  key={row.id}
                  data-index={virtualRow.index}
                  ref={(node) => rowVirtualizer.measureElement(node)}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: columns.map(col => `${col.size}px`).join(' '),
                    borderBottom: 1,
                    borderColor: 'divider',
                    '&:hover': {
                      bgcolor: 'grey.50'
                    },
                    transform: `translateY(${virtualRow.start}px)`
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <Box
                      key={cell.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        px: 1,
                        py: 0.5,
                        minHeight: 35
                      }}
                    >
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              );
            })}

            {paddingBottom > 0 && (
              <div style={{ height: `${paddingBottom}px` }} />
            )}
          </div>
        </Box>

        {/* Footer with row count */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 2,
            py: 1,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'grey.50',
            minHeight: 32
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Showing {rows.length.toLocaleString()} of {data.length.toLocaleString()} results
          </Typography>
          {globalFilter && (
            <Typography variant="caption" color="primary">
              Filtered by: "{globalFilter}"
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
};