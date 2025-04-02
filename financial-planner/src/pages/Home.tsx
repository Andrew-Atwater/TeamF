import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  IconButton, 
  Container, 
  Card, 
  CardContent, 
  Box,
  Divider,
  Button,
  Avatar,
  Menu,
  MenuItem
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  AddCircle as AddCircleIcon, 
  List as ListIcon, 
  BarChart as BarChartIcon, 
  AccountBalance as AccountBalanceIcon, 
  Settings as SettingsIcon, 
  Close as CloseIcon,
  Login as LoginIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase-config';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const Home: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const accounts = [
    {
      name: 'Checking Account',
      balance: 2345.67,
      dueDate: null
    },
    {
      name: 'Savings Account',
      balance: 15000.00,
      dueDate: null
    },
    {
      name: 'Credit Card',
      balance: -740.25,
      dueDate: '2024-03-15'
    },
    {
      name: 'Car Loan',
      balance: -12500.00,
      dueDate: '2024-03-25'
    }
  ];

  const menuItems = [
    { 
      icon: <AddCircleIcon />, 
      text: 'Add Transaction',
      action: () => {} 
    },
    { 
      icon: <ListIcon />, 
      text: 'Transaction History',
      action: () => {} 
    },
    { 
      icon: <BarChartIcon />, 
      text: 'Reports',
      action: () => {} 
    },
    { 
      icon: <AccountBalanceIcon />, 
      text: 'Accounts',
      action: () => {} 
    },
    { 
      icon: <SettingsIcon />, 
      text: 'Settings',
      action: () => {} 
    }
  ];

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' && 
      ((event as React.KeyboardEvent).key === 'Tab' || 
       (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setIsDrawerOpen(open);
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // No navigation needed, the routing will handle the redirect
      setAnchorEl(null);
    } catch (error) {
      console.error('Sign out error', error);
    }
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Financial Dashboard
          </Typography>
          {user ? (
            <IconButton 
              color="inherit" 
              onClick={handleProfileMenuOpen}
            >
              <Avatar 
                src={user.photoURL || undefined} 
                alt={user.displayName || 'User'}
                sx={{ width: 32, height: 32 }}
              />
            </IconButton>
          ) : (
            <Button 
              color="inherit" 
              startIcon={<LoginIcon />} 
              onClick={handleLogin}
            >
              Sign In
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleSignOut}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Sign Out
        </MenuItem>
      </Menu>

      <Drawer
        anchor="left"
        open={isDrawerOpen}
        onClose={toggleDrawer(false)}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            p: 2 
          }}>
            <Typography variant="h6">Menu</Typography>
            <IconButton onClick={toggleDrawer(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />
          <List>
            {menuItems.map((item, index) => (
              <ListItem 
                key={index} 
                onClick={item.action}
                disableGutters
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Container sx={{ mt: 3 }}>
        {accounts.map((account, index) => (
          <Card key={index} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{account.name}</Typography>
                <Typography 
                  variant="h5" 
                  color={account.balance < 0 ? 'error.main' : 'success.main'}
                >
                  ${Math.abs(account.balance).toFixed(2)}
                </Typography>
              </Box>
              {account.dueDate && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Due Date
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color="error.main"
                  >
                    {new Date(account.dueDate).toLocaleDateString()}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
      </Container>
    </Box>
  );
};

export default Home;