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
import { DistributionCurveChart } from './DistributionCurveChart';
import { PValueBarChart } from './PValueBarChart';
import { PairDistributionChart } from './PairDistributionChart';
import { DynamicChartInfo } from './chartFactory';

interface ChartCardProps {
  chart: DynamicChartInfo;
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

  const renderMiniChart = () => {
    if (!multiPairResults.pairs_results.length) {
      return (
        <Typography variant="caption" color="text.secondary">
          No data available
        </Typography>
      );
    }

    // If we have a component, render it at mini size
    if (chart.component) {
      const MiniChartComponent = chart.component;
      return (
        <MiniChartComponent {...chart.props} width={400} height={300} showLegend={false} mini={true} />
      );
    }

    // Resolve component based on chart type if not provided
    let ResolvedComponent = null;
    switch (chart.type) {
      case 'distribution':
        ResolvedComponent = PairDistributionChart;
        break;
      case 'bar':
        ResolvedComponent = PValueBarChart;
        break;
      default:
        ResolvedComponent = null;
    }

    if (ResolvedComponent) {
      return (
        <ResolvedComponent {...chart.props} width={400} height={300} showLegend={false} mini={true} />
      );
    }

    // Fallback to SVG representations based on chart type
    switch (chart.type) {
      case 'distribution':
        // Show mini bell curve representation for pair-specific distribution
        return (
          <Box sx={{ width: '100%', height: '100%', p: 1, position: 'relative' }}>
            <svg width="100%" height="100%" viewBox="0 0 120 80">
              <defs>
                <linearGradient id={`gradient1-${chart.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={getChartColor('line')} stopOpacity="0.8" />
                  <stop offset="100%" stopColor={getChartColor('line')} stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id={`gradient2-${chart.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={getChartColor('bar')} stopOpacity="0.8" />
                  <stop offset="100%" stopColor={getChartColor('bar')} stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <path
                d="M10,70 Q30,10 60,10 Q90,10 110,70 L110,80 L10,80 Z"
                fill={`url(#gradient1-${chart.id})`}
                stroke={getChartColor('line')}
                strokeWidth="2"
              />
              <path
                d="M15,65 Q35,20 60,20 Q85,20 105,65 L105,80 L15,80 Z"
                fill={`url(#gradient2-${chart.id})`}
                stroke={getChartColor('bar')}
                strokeWidth="2"
                opacity="0.7"
              />
            </svg>
            <Typography variant="caption" sx={{ position: 'absolute', bottom: 2, left: 2, fontSize: '8px' }}>
              {chart.pairId ? 'Pair Distribution' : 'Distributions'}
            </Typography>
          </Box>
        );

      case 'bar':
        // Show mini bar chart representation
        return (
          <Box sx={{ width: '100%', height: '100%', p: 1, position: 'relative' }}>
            <svg width="100%" height="100%" viewBox="0 0 120 80">
              <rect x="10" y="50" width="15" height="25" fill={getChartColor('bar')} />
              <rect x="30" y="30" width="15" height="45" fill={getChartColor('bar')} />
              <rect x="50" y="40" width="15" height="35" fill={getChartColor('bar')} />
              <rect x="70" y="20" width="15" height="55" fill={getChartColor('bar')} />
              <rect x="90" y="35" width="15" height="40" fill={getChartColor('bar')} />
              <line x1="0" y1="25" x2="120" y2="25" stroke="#ff4d4f" strokeWidth="1" strokeDasharray="2,2" />
            </svg>
            <Typography variant="caption" sx={{ position: 'absolute', bottom: 2, left: 2, fontSize: '8px' }}>
              P-values
            </Typography>
          </Box>
        );

      case 'comparison':
        // Show mini comparison chart representation
        return (
          <Box sx={{ width: '100%', height: '100%', p: 1, position: 'relative' }}>
            <svg width="100%" height="100%" viewBox="0 0 120 80">
              <circle cx="30" cy="30" r="8" fill={getChartColor('line')} />
              <circle cx="60" cy="40" r="8" fill={getChartColor('bar')} />
              <circle cx="90" cy="35" r="8" fill={getChartColor('scatter')} />
              <line x1="30" y1="30" x2="60" y2="40" stroke="#666" strokeWidth="2" />
              <line x1="60" y1="40" x2="90" y2="35" stroke="#666" strokeWidth="2" />
            </svg>
            <Typography variant="caption" sx={{ position: 'absolute', bottom: 2, left: 2, fontSize: '8px' }}>
              Comparison
            </Typography>
          </Box>
        );

      default:
        // Fallback placeholder
        return (
          <Box sx={{ width: '100%', height: '100%', p: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '8px' }}>
              {chart.type}
            </Typography>
          </Box>
        );
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
      <CardContent sx={{ flex: 1, p: 0.5, pb: 0.5, '&:last-child': { pb: 0.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0 }}>
          <Checkbox
            checked={selected}
            onChange={(e) => onSelect(e.target.checked)}
            size="small"
            sx={{ mr: 0.5 }}
          />
          <Box
            sx={{
              color: getChartColor(chart.type),
              mr: 0.5,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {getChartIcon(chart.type)}
          </Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1, fontSize: '0.875rem' }}>
            {chart.title}
          </Typography>
        </Box>

        {/* Mini chart preview */}
        <Box
          sx={{
            flex: 1,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {renderMiniChart()}
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: 0.5, py: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
          {multiPairResults.pairs_results.length} pairs
        </Typography>

        <IconButton
          size="small"
          onClick={onExpand}
          sx={{
            color: theme.palette.primary.main,
            p: 0.5,
            '&:hover': {
              bgcolor: theme.palette.primary.main,
              color: 'white'
            }
          }}
        >
          <ExpandIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </CardActions>
    </Card>
  );
};