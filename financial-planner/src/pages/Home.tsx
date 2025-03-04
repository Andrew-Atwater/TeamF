import React, { useState } from 'react';
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
  Divider
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  AddCircle as AddCircleIcon, 
  List as ListIcon, 
  BarChart as BarChartIcon, 
  AccountBalance as AccountBalanceIcon, 
  Settings as SettingsIcon, 
  Close as CloseIcon
} from '@mui/icons-material';

const Home: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

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
      balance: -750.25,
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
        </Toolbar>
      </AppBar>

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