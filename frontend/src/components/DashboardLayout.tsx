// src/components/DashboardLayout.tsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar from './Sidebar';

const DashboardLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <AppBar position="fixed" sx={{ width: { md: `calc(100% - 25%)` }, ml: { md: '25%' }, display: { md: 'none' } }}>
          <Toolbar>
            <IconButton color="inherit" onClick={() => setMobileOpen(true)}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Quản lý Camera
            </Typography>
          </Toolbar>
        </AppBar>

        <Box sx={{ mt: { xs: 8, md: 0 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;