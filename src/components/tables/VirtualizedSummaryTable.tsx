import React, { useMemo, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton
} from '@mui/material';
import {
  Download as DownloadIcon,
  ArrowUpward as SortAscIcon,
  ArrowDownward as SortDescIcon
} from '@mui/icons-material';

interface SummaryData {
  pairName: string;
  meanPValue: number;
  meanEffectSize: number;
  significantPercentage: number;
  totalReplications: number;
}

interface VirtualizedSummaryTableProps {
  data: SummaryData[];
  onExportCSV: () => void;
}

export const VirtualizedSummaryTable: React.FC<VirtualizedSummaryTableProps> = ({
  data,
  onExportCSV
}) => {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns = useMemo<ColumnDef<SummaryData>[]>(
    () => [
      {
        accessorKey: 'pairName',
        header: 'Pair Name',
        size: 200,
        cell: ({ getValue }) => (
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {getValue() as string}
          </Typography>
        )
      },
      {
        accessorKey: 'meanPValue',
        header: 'Mean P-Value',
        size: 120,
        cell: ({ getValue }) => (getValue() as number).toFixed(6)
      },
      {
        accessorKey: 'meanEffectSize',
        header: 'Mean Effect Size',
        size: 140,
        cell: ({ getValue }) => (getValue() as number).toFixed(3)
      },
      {
        accessorKey: 'significantPercentage',
        header: 'Significant Results (%)',
        size: 180,
        cell: ({ getValue }) => (
          <Typography
            variant="body2"
            sx={{
              color: (getValue() as number) > 50 ? 'success.main' : 'text.primary',
              fontWeight: (getValue() as number) > 50 ? 'bold' : 'normal'
            }}
          >
            {(getValue() as number).toFixed(1)}%
          </Typography>
        )
      },
      {
        accessorKey: 'totalReplications',
        header: 'Total Replications',
        size: 160,
        cell: ({ getValue }) => (getValue() as number).toLocaleString()
      }
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: process.env.NODE_ENV === 'development'
  });

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 40,
    overscan: 10
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
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
          Summary Statistics by Pair
        </Typography>
        <Button
          startIcon={<DownloadIcon />}
          onClick={onExportCSV}
          variant="outlined"
          size="small"
        >
          Export CSV
        </Button>
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
            minHeight: 44
          }}
        >
          {table.getHeaderGroups().map((headerGroup) =>
            headerGroup.headers.map((header) => (
              <Box
                key={header.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 1.5,
                  py: 0.75,
                  cursor: header.column.getCanSort() ? 'pointer' : 'default',
                  userSelect: 'none',
                  '&:hover': {
                    bgcolor: header.column.getCanSort() ? 'grey.100' : 'transparent'
                  }
                }}
                onClick={header.column.getToggleSortingHandler()}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </Typography>
                {header.column.getIsSorted() && (
                  <IconButton size="small" sx={{ ml: 0.5, p: 0 }}>
                    {header.column.getIsSorted() === 'asc' ? (
                      <SortAscIcon sx={{ fontSize: 14 }} />
                    ) : (
                      <SortDescIcon sx={{ fontSize: 14 }} />
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
                        px: 1.5,
                        py: 0.75,
                        minHeight: 40
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
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

        {/* Footer */}
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
            minHeight: 36
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {rows.length} pair{rows.length !== 1 ? 's' : ''} displayed
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};