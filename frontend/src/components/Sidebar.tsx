// src/components/Sidebar.tsx
import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Storage as BoxIcon,
  Videocam as CameraIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'General Search', icon: <SearchIcon />, path: '/dashboard/search' },
    { text: 'Location Management', icon: <LocationIcon />, path: '/dashboard/locations' },
    { text: 'Box Management', icon: <BoxIcon />, path: '/dashboard/boxes' },
    { text: 'Camera Management', icon: <CameraIcon />, path: '/dashboard/cameras' },
  ];

  const drawerContent = (
    <>
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" fontWeight="bold">
          Quản lý Camera
        </Typography>
      </Box>

      <Divider />

      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (!isDesktop) onClose(); // đóng drawer trên mobile
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );

  return (
    <Drawer
      variant={isDesktop ? 'permanent' : 'temporary'}
      open={open}
      onClose={onClose}
      sx={{
        width: '25%',
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: '25%',
          boxSizing: 'border-box',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;