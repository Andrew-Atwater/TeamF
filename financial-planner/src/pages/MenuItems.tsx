import React from 'react';
import { ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  AddCircle as AddCircleIcon,
  List as ListIcon,
  BarChart as BarChartIcon,
  AccountBalance as AccountBalanceIcon,
  Settings as SettingsIcon,
  Calculate as CalculateIcon
} from '@mui/icons-material';
import '../styles/Menu.css';

export const MenuItems: React.FC = () => {
  const navigate = useNavigate();

  const menuItems = [
    { text: 'Add Transaction', icon: <AddCircleIcon />, path: '/add-transaction' },
    { text: 'Transactions', icon: <ListIcon />, path: '/transactions' },
    { text: 'Reports', icon: <BarChartIcon />, path: '/reports' },
    { text: 'Accounts', icon: <AccountBalanceIcon />, path: '/accounts' },
    { text: 'Tuition Cost Calculator', icon: <CalculateIcon />, path: '/cost-calculator' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' }
  ];

  return (
    <>
      {menuItems.map((item) => (
        <ListItem 
          component="div"
          sx={{ cursor: 'pointer' }}
          key={item.text} 
          onClick={() => navigate(item.path)}
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.text} />
        </ListItem>
      ))}
    </>
  );
};