import React, { useState } from 'react';
import { Box, Menu, MenuItem, Fab, Tooltip } from '@mui/material';
import {
  Download,
  MoreVertical,
  FileText,
  Image,
  Settings,
  Share,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WorkspaceMenuProps } from './types';

// Chart Menu Component - for Top Panel
export const ChartMenu: React.FC<WorkspaceMenuProps> = ({
  multiPairResults,
  onExportCSV
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  return (
    <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <Tooltip title="Chart Options">
          <Box
            component="button"
            onClick={handleMenuClick}
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: 'rgba(255, 255, 255, 1)',
              color: 'text.primary',
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 1)',
                boxShadow: 'none'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <MoreVertical size={14} />
          </Box>
        </Tooltip>
      </motion.div>

      <AnimatePresence>
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
          transitionDuration={200}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          PaperProps={{
            component: motion.div,
            initial: { opacity: 0, scale: 0.9, y: -10 },
            animate: { opacity: 1, scale: 1, y: 0 },
            exit: { opacity: 0, scale: 0.9, y: -10 },
            transition: { duration: 0.2 }
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.2 }}
          >
            <MenuItem onClick={() => { onExportCSV(); handleMenuClose(); }}>
              <Download size={16} style={{ marginRight: 8 }} />
              Export Data (CSV)
            </MenuItem>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.2 }}
          >
            <MenuItem onClick={handleMenuClose}>
              <Image size={16} style={{ marginRight: 8 }} />
              Export Chart (PNG)
            </MenuItem>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.2 }}
          >
            <MenuItem onClick={handleMenuClose}>
              <FileText size={16} style={{ marginRight: 8 }} />
              Export Chart (SVG)
            </MenuItem>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.2 }}
          >
            <MenuItem onClick={handleMenuClose}>
              <Save size={16} style={{ marginRight: 8 }} />
              Save Session
            </MenuItem>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.2 }}
          >
            <MenuItem onClick={handleMenuClose}>
              <Share size={16} style={{ marginRight: 8 }} />
              Share Results
            </MenuItem>
          </motion.div>
        </Menu>
      </AnimatePresence>
    </Box>
  );
};

// Data Menu Component - for Bottom Panel
export const DataMenu: React.FC<WorkspaceMenuProps> = ({
  multiPairResults,
  onExportCSV
}) => {
  const [dataMenuAnchorEl, setDataMenuAnchorEl] = useState<null | HTMLElement>(null);

  const handleDataMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setDataMenuAnchorEl(event.currentTarget);
  };

  const handleDataMenuClose = () => {
    setDataMenuAnchorEl(null);
  };

  return (
    <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <Tooltip title="Data Options">
          <Box
            component="button"
            onClick={handleDataMenuClick}
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: 'rgba(255, 255, 255, 1)',
              color: 'text.primary',
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 1)',
                boxShadow: 'none'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <MoreVertical size={14} />
          </Box>
        </Tooltip>
      </motion.div>

      <AnimatePresence>
        <Menu
          anchorEl={dataMenuAnchorEl}
          open={Boolean(dataMenuAnchorEl)}
          onClose={handleDataMenuClose}
          transitionDuration={200}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          PaperProps={{
            component: motion.div,
            initial: { opacity: 0, scale: 0.9, y: -10 },
            animate: { opacity: 1, scale: 1, y: 0 },
            exit: { opacity: 0, scale: 0.9, y: -10 },
            transition: { duration: 0.2 }
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.2 }}
          >
            <MenuItem onClick={() => { onExportCSV(); handleDataMenuClose(); }}>
              <Download size={16} style={{ marginRight: 8 }} />
              Export Data (CSV)
            </MenuItem>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.2 }}
          >
            <MenuItem onClick={handleDataMenuClose}>
              <FileText size={16} style={{ marginRight: 8 }} />
              Export Data (JSON)
            </MenuItem>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.2 }}
          >
            <MenuItem onClick={handleDataMenuClose}>
              <Settings size={16} style={{ marginRight: 8 }} />
              Table Settings
            </MenuItem>
          </motion.div>
        </Menu>
      </AnimatePresence>
    </Box>
  );
};