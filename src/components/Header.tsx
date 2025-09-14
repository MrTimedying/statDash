import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Switch,
  Box,
  IconButton,
  Button,
  Menu,
  MenuItem,
  useTheme as useMuiTheme
} from '@mui/material';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart as BarChartIcon,
  Brightness4 as MoonIcon,
  Brightness7 as SunIcon,
  Science as ScienceIcon,
  Menu as MenuIcon,
  Visibility as VisibilityIcon,
  KeyboardArrowDown as ArrowDownIcon
} from '@mui/icons-material';
import { useUIStore } from '../stores/ui.store';

interface AppHeaderProps {
  title?: string;
  onDesignComposerOpen?: () => void;
  onChartOptionClick?: (option: string) => void;
  onDataOptionClick?: (option: string) => void;
  onViewChange?: (view: 'chart' | 'table') => void;
  currentView?: 'chart' | 'table';
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title = "StatDash",
  onDesignComposerOpen,
  onChartOptionClick,
  onDataOptionClick,
  onViewChange,
  currentView = 'chart'
}) => {
  const muiTheme = useMuiTheme();
  const { theme, setTheme } = useUIStore();
  const isDark = theme === 'dark';

  // Menu state
  const [mainMenuAnchor, setMainMenuAnchor] = useState<null | HTMLElement>(null);
  const [viewMenuAnchor, setViewMenuAnchor] = useState<null | HTMLElement>(null);

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const handleMainMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMainMenuAnchor(event.currentTarget);
  };

  const handleViewMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setViewMenuAnchor(event.currentTarget);
  };

  const handleMainMenuClose = () => {
    setMainMenuAnchor(null);
  };

  const handleViewMenuClose = () => {
    setViewMenuAnchor(null);
  };

  const handleChartOption = (option: string) => {
    onChartOptionClick?.(option);
    handleMainMenuClose();
  };

  const handleDataOption = (option: string) => {
    onDataOptionClick?.(option);
    handleMainMenuClose();
  };

  const handleViewChange = (view: 'chart' | 'table') => {
    onViewChange?.(view);
    handleViewMenuClose();
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        minHeight: 42
      }}
    >
      <Toolbar sx={{
        justifyContent: 'space-between',
        minHeight: '42px !important',
        py: 0.25
      }}>
        {/* Left Section - Logo & Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton
            color="primary"
            sx={{ p: 0.25 }}
          >
            <BarChartIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              fontSize: '0.95rem'
            }}
          >
            {title}
          </Typography>
        </Box>

        {/* Center Section - Navigation */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Design Composer Button */}
          <Button
            variant="contained"
            startIcon={<ScienceIcon sx={{ fontSize: 16 }} />}
            onClick={onDesignComposerOpen}
            sx={{
              textTransform: 'none',
              fontSize: '0.8rem',
              py: 0.25,
              px: 1.25,
              borderRadius: 0.5
            }}
          >
            Design Composer
          </Button>

          {/* Modern Menu Tabs */}
          <Box sx={{ display: 'flex', position: 'relative' }}>
            <motion.div
              layout
              style={{
                position: 'absolute',
                top: 0,
                left: Boolean(mainMenuAnchor) ? 0 : Boolean(viewMenuAnchor) ? '80px' : 0,
                width: '80px',
                height: '100%',
                background: 'linear-gradient(45deg, rgba(25,118,210,0.1), rgba(25,118,210,0.2))',
                borderRadius: 0,
                zIndex: 0
              }}
              animate={{
                left: Boolean(mainMenuAnchor) ? 0 : Boolean(viewMenuAnchor) ? '80px' : 0,
                opacity: Boolean(mainMenuAnchor) || Boolean(viewMenuAnchor) ? 1 : 0
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
            />

            <Box
              component={motion.div}
              onClick={handleMainMenuClick}
              sx={{
                position: 'relative',
                px: 2,
                py: 1,
                cursor: 'pointer',
                zIndex: 1,
                borderRadius: 0,
                color: Boolean(mainMenuAnchor) ? 'primary.main' : 'text.primary',
                fontWeight: Boolean(mainMenuAnchor) ? 600 : 400,
                fontSize: '0.8rem',
                userSelect: 'none',
                minWidth: '80px',
                textAlign: 'center',
                '&:hover': {
                  color: 'primary.main'
                }
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Main
              <ArrowDownIcon sx={{ fontSize: 14, ml: 0.5, verticalAlign: 'middle' }} />
            </Box>

            <Box
              component={motion.div}
              onClick={handleViewMenuClick}
              sx={{
                position: 'relative',
                px: 2,
                py: 1,
                cursor: 'pointer',
                zIndex: 1,
                borderRadius: 0,
                color: Boolean(viewMenuAnchor) ? 'primary.main' : 'text.primary',
                fontWeight: Boolean(viewMenuAnchor) ? 600 : 400,
                fontSize: '0.8rem',
                userSelect: 'none',
                minWidth: '80px',
                textAlign: 'center',
                '&:hover': {
                  color: 'primary.main'
                }
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              View
              <ArrowDownIcon sx={{ fontSize: 14, ml: 0.5, verticalAlign: 'middle' }} />
            </Box>
          </Box>
        </Box>

        {/* Right Section - Theme Toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton onClick={toggleTheme} size="small" sx={{ p: 0.25 }}>
            {isDark ? <SunIcon sx={{ fontSize: 18 }} /> : <MoonIcon sx={{ fontSize: 18 }} />}
          </IconButton>
        </Box>

        {/* Main Menu Dropdown */}
        <Menu
          anchorEl={mainMenuAnchor}
          open={Boolean(mainMenuAnchor)}
          onClose={handleMainMenuClose}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 160,
              boxShadow: 3
            }
          }}
        >
          <MenuItem disabled sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }}>
            CHART OPTIONS
          </MenuItem>
          <MenuItem onClick={() => handleChartOption('save')}>Save Chart</MenuItem>
          <MenuItem onClick={() => handleChartOption('export')}>Export Chart</MenuItem>
          <MenuItem onClick={() => handleChartOption('settings')}>Chart Settings</MenuItem>

          <MenuItem disabled sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary', mt: 1 }}>
            DATA OPTIONS
          </MenuItem>
          <MenuItem onClick={() => handleDataOption('export')}>Export Data</MenuItem>
          <MenuItem onClick={() => handleDataOption('save')}>Save Session</MenuItem>
          <MenuItem onClick={() => handleDataOption('import')}>Import Data</MenuItem>
        </Menu>

        {/* View Menu Dropdown */}
        <Menu
          anchorEl={viewMenuAnchor}
          open={Boolean(viewMenuAnchor)}
          onClose={handleViewMenuClose}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 120,
              boxShadow: 3
            }
          }}
        >
          <MenuItem
            onClick={() => handleViewChange('chart')}
            selected={currentView === 'chart'}
          >
            Chart View
          </MenuItem>
          <MenuItem
            onClick={() => handleViewChange('table')}
            selected={currentView === 'table'}
          >
            Table View
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};