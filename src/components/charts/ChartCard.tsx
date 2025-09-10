import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Checkbox,
  IconButton,
  Box,
  useTheme
} from '@mui/material';
import {
  OpenInFull as ExpandIcon,
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
  ScatterPlot as ScatterPlotIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { MultiPairResults } from '../../types/simulation.types';

interface ChartInfo {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'histogram' | 'scatter' | 'boxplot' | 'combined';
  description: string;
}

interface ChartCardProps {
  chart: ChartInfo;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onExpand: () => void;
  multiPairResults: MultiPairResults;
  significanceLevels: number[];
}

export const ChartCard: React.FC<ChartCardProps> = ({
  chart,
  selected,
  onSelect,
  onExpand,
  multiPairResults,
  significanceLevels
}) => {
  const theme = useTheme();

  const getChartIcon = (type: string) => {
    switch (type) {
      case 'line': return <LineChartIcon />;
      case 'bar': return <BarChartIcon />;
      case 'scatter': return <ScatterPlotIcon />;
      case 'histogram': return <BarChartIcon />;
      case 'boxplot': return <AssessmentIcon />;
      default: return <BarChartIcon />;
    }
  };

  const getChartColor = (type: string) => {
    switch (type) {
      case 'line': return theme.palette.primary.main;
      case 'bar': return theme.palette.secondary.main;
      case 'scatter': return theme.palette.success.main;
      case 'histogram': return theme.palette.warning.main;
      case 'boxplot': return theme.palette.info.main;
      default: return theme.palette.primary.main;
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: selected ? `2px solid ${theme.palette.primary.main}` : '1px solid',
        borderColor: selected ? theme.palette.primary.main : theme.palette.divider,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: theme.shadows[4],
          transform: 'translateY(-2px)'
        }
      }}
    >
      <CardContent sx={{ flex: 1, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Checkbox
            checked={selected}
            onChange={(e) => onSelect(e.target.checked)}
            size="small"
            sx={{ mr: 1 }}
          />
          <Box
            sx={{
              color: getChartColor(chart.type),
              mr: 1,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {getChartIcon(chart.type)}
          </Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
            {chart.title}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {chart.description}
        </Typography>

        {/* Mini chart preview */}
        <Box
          sx={{
            height: 120,
            bgcolor: theme.palette.background.default,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          {multiPairResults.pairs_results.length > 0 ? (
            <Box sx={{ width: '100%', height: '100%', p: 1 }}>
              {/* Simple preview based on chart type */}
              {chart.type === 'line' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                  <Box sx={{ height: '2px', bgcolor: getChartColor(chart.type), borderRadius: '1px' }} />
                  <Box sx={{ height: '2px', bgcolor: getChartColor(chart.type), borderRadius: '1px', width: '80%' }} />
                  <Box sx={{ height: '2px', bgcolor: getChartColor(chart.type), borderRadius: '1px', width: '60%' }} />
                  <Box sx={{ height: '2px', bgcolor: getChartColor(chart.type), borderRadius: '1px', width: '40%' }} />
                </Box>
              )}
              {chart.type === 'bar' && (
                <Box sx={{ display: 'flex', alignItems: 'flex-end', height: '100%', gap: 0.5, px: 1 }}>
                  <Box sx={{ width: '20%', bgcolor: getChartColor(chart.type), borderRadius: '2px 2px 0 0', height: '40%' }} />
                  <Box sx={{ width: '20%', bgcolor: getChartColor(chart.type), borderRadius: '2px 2px 0 0', height: '70%' }} />
                  <Box sx={{ width: '20%', bgcolor: getChartColor(chart.type), borderRadius: '2px 2px 0 0', height: '55%' }} />
                  <Box sx={{ width: '20%', bgcolor: getChartColor(chart.type), borderRadius: '2px 2px 0 0', height: '85%' }} />
                </Box>
              )}
              {chart.type === 'scatter' && (
                <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
                  <Box sx={{
                    position: 'absolute',
                    top: '20%',
                    left: '30%',
                    width: '4px',
                    height: '4px',
                    bgcolor: getChartColor(chart.type),
                    borderRadius: '50%'
                  }} />
                  <Box sx={{
                    position: 'absolute',
                    top: '60%',
                    left: '70%',
                    width: '4px',
                    height: '4px',
                    bgcolor: getChartColor(chart.type),
                    borderRadius: '50%'
                  }} />
                  <Box sx={{
                    position: 'absolute',
                    top: '40%',
                    left: '50%',
                    width: '4px',
                    height: '4px',
                    bgcolor: getChartColor(chart.type),
                    borderRadius: '50%'
                  }} />
                </Box>
              )}
              {chart.type === 'histogram' && (
                <Box sx={{ display: 'flex', alignItems: 'flex-end', height: '100%', gap: 0.5, px: 1 }}>
                  <Box sx={{ width: '15%', bgcolor: getChartColor(chart.type), borderRadius: '2px 2px 0 0', height: '30%' }} />
                  <Box sx={{ width: '15%', bgcolor: getChartColor(chart.type), borderRadius: '2px 2px 0 0', height: '60%' }} />
                  <Box sx={{ width: '15%', bgcolor: getChartColor(chart.type), borderRadius: '2px 2px 0 0', height: '45%' }} />
                  <Box sx={{ width: '15%', bgcolor: getChartColor(chart.type), borderRadius: '2px 2px 0 0', height: '75%' }} />
                  <Box sx={{ width: '15%', bgcolor: getChartColor(chart.type), borderRadius: '2px 2px 0 0', height: '25%' }} />
                </Box>
              )}
              {chart.type === 'boxplot' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                  <Box sx={{ width: '60%', height: '2px', bgcolor: getChartColor(chart.type) }} />
                  <Box sx={{ width: '40%', height: '40%', border: `2px solid ${getChartColor(chart.type)}`, borderRadius: '2px' }} />
                  <Box sx={{ width: '60%', height: '2px', bgcolor: getChartColor(chart.type) }} />
                </Box>
              )}
              {chart.type === 'combined' && (
                <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', height: '60%', gap: 0.5, px: 1 }}>
                    <Box sx={{ width: '20%', bgcolor: getChartColor('bar'), borderRadius: '2px 2px 0 0', height: '40%' }} />
                    <Box sx={{ width: '20%', bgcolor: getChartColor('bar'), borderRadius: '2px 2px 0 0', height: '70%' }} />
                    <Box sx={{ width: '20%', bgcolor: getChartColor('bar'), borderRadius: '2px 2px 0 0', height: '55%' }} />
                  </Box>
                  <Box sx={{ position: 'absolute', top: '10%', left: 0, right: 0, height: '2px', bgcolor: getChartColor('line') }} />
                  <Box sx={{ position: 'absolute', top: '30%', left: 0, right: 0, height: '2px', bgcolor: getChartColor('line'), width: '80%' }} />
                  <Box sx={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', bgcolor: getChartColor('line'), width: '60%' }} />
                </Box>
              )}
            </Box>
          ) : (
            <Typography variant="caption" color="text.secondary">
              No data available
            </Typography>
          )}
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          {multiPairResults.pairs_results.length} pairs
        </Typography>

        <IconButton
          size="small"
          onClick={onExpand}
          sx={{
            color: theme.palette.primary.main,
            '&:hover': {
              bgcolor: theme.palette.primary.main,
              color: 'white'
            }
          }}
        >
          <ExpandIcon fontSize="small" />
        </IconButton>
      </CardActions>
    </Card>
  );
};