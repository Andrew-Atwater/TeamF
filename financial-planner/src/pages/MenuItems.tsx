import React from 'react';
import { useNavigate } from 'react-router-dom';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ListIcon from '@mui/icons-material/List';
import BarChartIcon from '@mui/icons-material/BarChart';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SettingsIcon from '@mui/icons-material/Settings';

export const MenuItems = () => {
  const navigate = useNavigate();

  const menuItems = [
    { 
      icon: <AddCircleIcon />, 
      text: 'Add Transaction',
      action: () => navigate('/add-transaction')
    },
    { 
      icon: <ListIcon />, 
      text: 'Transaction History',
      action: () => navigate('/transaction-history')
    },
    { 
      icon: <BarChartIcon />, 
      text: 'Reports',
      action: () => navigate('/reports')
    },
    { 
      icon: <AccountBalanceIcon />, 
      text: 'Accounts',
      action: () => navigate('/accounts')
    },
    { 
      icon: <SettingsIcon />, 
      text: 'Settings',
      action: () => navigate('/settings')
    }
  ];

    return (
        <div>
          {menuItems.map((item, index) => (
            <div key={index} onClick={item.action} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              {item.icon}
              <span style={{ marginLeft: '8px' }}>{item.text}</span>
            </div>
          ))}
        </div>
      );
    };