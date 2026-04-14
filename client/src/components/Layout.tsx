import React, { useState } from 'react';
import { Box, Drawer, AppBar, Toolbar, List, Typography, Divider, IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText, Tooltip, useTheme, useMediaQuery } from '@mui/material';
import { Menu as MenuIcon, Dashboard, Bed, People, Receipt, Message, Fastfood, Assessment, ExitToApp, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 260;
const collapsedWidth = 80;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setOpen(!open);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Filter menu items by role
  const allMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', roles: ['Admin', 'Student', 'Staff'] },
    { text: 'Rooms', icon: <Bed />, path: '/rooms', roles: ['Admin'] },
    { text: 'Students', icon: <People />, path: '/students', roles: ['Admin', 'Staff'] },
    { text: 'Payments', icon: <Receipt />, path: '/payments', roles: ['Admin', 'Student'] },
    { text: 'Complaints', icon: <Message />, path: '/complaints', roles: ['Admin', 'Student', 'Staff'] },
    { text: 'Mess Menu', icon: <Fastfood />, path: '/mess', roles: ['Admin', 'Student', 'Staff'] },
    { text: 'Analytics', icon: <Assessment />, path: '/analytics', roles: ['Admin'] },
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(user?.role || ''));

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: open ? 'space-between' : 'center',
        px: [1] 
      }}>
        {open && (
          <Typography variant="h6" color="primary" sx={{ fontWeight: 800, letterSpacing: 1, ml: 1 }}>
            DORMEASE
          </Typography>
        )}
        <IconButton onClick={handleDrawerToggle}>
          {open ? <ChevronLeft /> : <ChevronRight />}
        </IconButton>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1.5, py: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 0.5 }}>
            <Tooltip title={!open ? item.text : ""} placement="right">
              <ListItemButton
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  borderRadius: 2,
                  transition: 'all 0.2s ease',
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '& .MuiListItemIcon-root': { color: 'white' },
                    '&:hover': { backgroundColor: 'primary.dark' }
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(37, 99, 235, 0.08)',
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: location.pathname === item.path ? 'white' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {open && <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} primaryTypographyProps={{ fontWeight: 600 }} />}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      
      {/* User Status */}
      {open && user && (
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, bgcolor: 'secondary.main', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
            {user.name[0]}
          </Box>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body2" fontWeight="bold" noWrap>{user.name}</Typography>
            <Typography variant="caption" color="textSecondary" noWrap display="block">{user.role}</Typography>
          </Box>
        </Box>
      )}

      <List sx={{ px: 1.5, py: 1 }}>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              minHeight: 48,
              justifyContent: open ? 'initial' : 'center',
              px: 2.5,
              borderRadius: 2,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 2 : 'auto',
                justifyContent: 'center',
              }}
            >
              <ExitToApp />
            </ListItemIcon>
            {open && <ListItemText primary="Logout" sx={{ opacity: open ? 1 : 0 }} />}
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  const currentTitle = menuItems.find(item => item.path === location.pathname)?.text || 'DormEase';

  return (
    <Box sx={{ display: 'flex', backgroundColor: '#F3F4F6', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          transition: (theme) => theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(open && !isMobile && {
            ml: `${drawerWidth}px`,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: (theme) => theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
          ...(!open && !isMobile && {
            ml: `${collapsedWidth}px`,
            width: `calc(100% - ${collapsedWidth}px)`,
          }),
          backgroundColor: 'white',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, ...( !isMobile && { display: 'none' }), color: 'text.primary' }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" color="text.primary" fontWeight="bold">
            {currentTitle}
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : open}
        onClose={handleDrawerToggle}
        sx={{
          width: open ? drawerWidth : collapsedWidth,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          boxSizing: 'border-box',
          ...(open && {
            '& .MuiDrawer-paper': { 
              width: drawerWidth, 
              transition: (theme) => theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              overflowX: 'hidden' 
            },
          }),
          ...(!open && {
            '& .MuiDrawer-paper': { 
              width: collapsedWidth,
              transition: (theme) => theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
              overflowX: 'hidden' 
            },
          }),
        }}
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${open ? drawerWidth : collapsedWidth}px)` },
          transition: (theme) => theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar />
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </Box>
    </Box>
  );
};

export default Layout;
