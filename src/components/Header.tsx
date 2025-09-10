import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Switch,
  Box,
  IconButton,
  useTheme as useMuiTheme
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  Brightness4 as MoonIcon,
  Brightness7 as SunIcon
} from '@mui/icons-material';
import { useUIStore } from '../stores/ui.store';

interface AppHeaderProps {
  title?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title = "StatDash - Statistical Simulations Dashboard"
}) => {
  const muiTheme = useMuiTheme();
  const { theme, setTheme } = useUIStore();
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <AppBar
      position="static"
      elevation={1}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            color="primary"
            sx={{ p: 0 }}
          >
            <BarChartIcon sx={{ fontSize: 28 }} />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 600,
              color: 'text.primary'
            }}
          >
            {title}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary' }}
          >
            {isDark ? 'Dark' : 'Light'} Mode
          </Typography>
          <Switch
            checked={isDark}
            onChange={toggleTheme}
            icon={<SunIcon sx={{ fontSize: 16 }} />}
            checkedIcon={<MoonIcon sx={{ fontSize: 16 }} />}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: 'primary.main',
                '& + .MuiSwitch-track': {
                  backgroundColor: 'primary.main',
                },
              },
            }}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};