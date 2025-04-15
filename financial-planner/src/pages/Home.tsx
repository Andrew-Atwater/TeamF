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
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel,
  CircularProgress,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction
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
  Logout as LogoutIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase-config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

interface Account {
  id?: string;
  name: string;
  balance: number;
  dueDate: string | null;
  description: string;
  type: 'savings' | 'debt';
  userId: string;
}

const Home: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [newAccount, setNewAccount] = useState<Omit<Account, 'userId'>>({
    name: '',
    balance: 0,
    dueDate: null,
    description: '',
    type: 'savings'
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchAccounts(currentUser.uid);
      } else {
        setAccounts([]);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchAccounts = async (uid: string) => {
    try {
      setIsLoading(true);
      const accountsRef = collection(db, 'accounts');
      const q = query(accountsRef, where('userId', '==', uid));
      const querySnapshot = await getDocs(q);
      
      const accountsData: Account[] = [];
      querySnapshot.forEach((doc) => {
        accountsData.push({ id: doc.id, ...doc.data() } as Account);
      });
      
      setAccounts(accountsData);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAccount = async () => {
    if (!user) return;
    
    try {
      const accountsRef = collection(db, 'accounts');
      await addDoc(accountsRef, {
        ...newAccount,
        userId: user.uid,
        balance: newAccount.type === 'debt' ? -Math.abs(newAccount.balance) : Math.abs(newAccount.balance)
      });
      
      // Reset form and close dialog
      setNewAccount({
        name: '',
        balance: 0,
        dueDate: null,
        description: '',
        type: 'savings'
      });
      setIsAddDialogOpen(false);
      
      // Refresh accounts
      fetchAccounts(user.uid);
    } catch (error) {
      console.error('Error adding account:', error);
    }
  };

  const handleUpdateAccount = async () => {
    if (!user || !selectedAccount || !selectedAccount.id) return;
    
    try {
      const accountRef = doc(db, 'accounts', selectedAccount.id);
      await updateDoc(accountRef, {
        name: selectedAccount.name,
        description: selectedAccount.description,
        balance: selectedAccount.type === 'debt' ? -Math.abs(selectedAccount.balance) : Math.abs(selectedAccount.balance),
        dueDate: selectedAccount.dueDate,
        type: selectedAccount.type
      });
      
      setIsEditDialogOpen(false);
      setSelectedAccount(null);
      
      // Refresh accounts
      fetchAccounts(user.uid);
    } catch (error) {
      console.error('Error updating account:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !selectedAccount || !selectedAccount.id) return;
    
    try {
      const accountRef = doc(db, 'accounts', selectedAccount.id);
      await deleteDoc(accountRef);
      
      setIsEditDialogOpen(false);
      setSelectedAccount(null);
      
      // Refresh accounts
      fetchAccounts(user.uid);
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAccount(prev => ({
      ...prev,
      [name]: name === 'balance' ? parseFloat(value) || 0 : value
    }));
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedAccount) return;
    
    const { name, value } = e.target;
    setSelectedAccount(prev => ({
      ...prev!,
      [name]: name === 'balance' ? parseFloat(value) || 0 : value
    }));
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const type = e.target.value as 'savings' | 'debt';
    setNewAccount(prev => ({
      ...prev,
      type,
      dueDate: type === 'debt' ? (prev.dueDate || new Date().toISOString().split('T')[0]) : null
    }));
  };

  const handleEditTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedAccount) return;
    
    const type = e.target.value as 'savings' | 'debt';
    setSelectedAccount(prev => ({
      ...prev!,
      type,
      dueDate: type === 'debt' ? (prev!.dueDate || new Date().toISOString().split('T')[0]) : null
    }));
  };

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

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handleAccountClick = (account: Account) => {
    if (isEditMode) {
      setSelectedAccount({...account});
      setIsEditDialogOpen(true);
    }
  };

  const speedDialActions = [
    { icon: <AddIcon />, name: 'Add Account', action: () => setIsAddDialogOpen(true) },
    { icon: <EditIcon />, name: 'Edit Accounts', action: toggleEditMode }
  ];

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

      <Container sx={{ mt: 3, position: 'relative', pb: 10 }}>
        {isEditMode && (
          <Box sx={{ 
            bgcolor: 'warning.light', 
            p: 2, 
            mb: 2, 
            borderRadius: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="body1" color="warning.contrastText">
              Edit Mode: Tap on an account to edit
            </Typography>
            <Button 
              variant="contained" 
              color="warning" 
              size="small"
              onClick={toggleEditMode}
            >
              Exit Edit Mode
            </Button>
          </Box>
        )}
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <CircularProgress />
          </Box>
        ) : accounts.length === 0 ? (
          <Box sx={{ textAlign: 'center', my: 5 }}>
            <Typography variant="h6" color="text.secondary">
              No accounts yet. Use the menu button to add one.
            </Typography>
          </Box>
        ) : (
          accounts.map((account, index) => (
            <Card 
              key={index} 
              sx={{ 
                mb: 2, 
                cursor: isEditMode ? 'pointer' : 'default',
                '&:hover': {
                  boxShadow: isEditMode ? 3 : 1
                }
              }}
              onClick={() => handleAccountClick(account)}
            >
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
                {account.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {account.description}
                  </Typography>
                )}
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
          ))
        )}
        
        {/* SpeedDial Menu (replaces the Fab) */}
        {user && (
          <SpeedDial
            ariaLabel="account actions"
            sx={{ position: 'fixed', bottom: 20, right: 20 }}
            icon={<SpeedDialIcon />}
          >
            {speedDialActions.map((action) => (
              <SpeedDialAction
                key={action.name}
                icon={action.icon}
                tooltipTitle={action.name}
                onClick={action.action}
              />
            ))}
          </SpeedDial>
        )}

        {/* Add Account Dialog */}
        <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add New Account</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Account Name"
              type="text"
              fullWidth
              variant="outlined"
              value={newAccount.name}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="dense"
              name="description"
              label="Description"
              type="text"
              fullWidth
              variant="outlined"
              multiline
              rows={2}
              value={newAccount.description}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="dense"
              name="balance"
              label="Amount"
              type="number"
              fullWidth
              variant="outlined"
              value={newAccount.balance}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel component="legend">Account Type</FormLabel>
              <RadioGroup
                row
                name="type"
                value={newAccount.type}
                onChange={handleTypeChange}
              >
                <FormControlLabel value="savings" control={<Radio />} label="Savings/Asset (Green)" />
                <FormControlLabel value="debt" control={<Radio />} label="Debt/Liability (Red)" />
              </RadioGroup>
            </FormControl>
            
            {newAccount.type === 'debt' && (
              <TextField
                margin="dense"
                name="dueDate"
                label="Due Date"
                type="date"
                fullWidth
                variant="outlined"
                value={newAccount.dueDate || ''}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleAddAccount}
              variant="contained"
              disabled={!newAccount.name || newAccount.balance === 0}
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Account Dialog */}
        <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Account</DialogTitle>
          <DialogContent>
            {selectedAccount && (
              <>
                <TextField
                  autoFocus
                  margin="dense"
                  name="name"
                  label="Account Name"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={selectedAccount.name}
                  onChange={handleEditInputChange}
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  margin="dense"
                  name="description"
                  label="Description"
                  type="text"
                  fullWidth
                  variant="outlined"
                  multiline
                  rows={2}
                  value={selectedAccount.description}
                  onChange={handleEditInputChange}
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  margin="dense"
                  name="balance"
                  label="Amount"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={Math.abs(selectedAccount.balance)}
                  onChange={handleEditInputChange}
                  sx={{ mb: 2 }}
                />
                
                <FormControl component="fieldset" sx={{ mb: 2 }}>
                  <FormLabel component="legend">Account Type</FormLabel>
                  <RadioGroup
                    row
                    name="type"
                    value={selectedAccount.type}
                    onChange={handleEditTypeChange}
                  >
                    <FormControlLabel value="savings" control={<Radio />} label="Savings/Asset (Green)" />
                    <FormControlLabel value="debt" control={<Radio />} label="Debt/Liability (Red)" />
                  </RadioGroup>
                </FormControl>
                
                {selectedAccount.type === 'debt' && (
                  <TextField
                    margin="dense"
                    name="dueDate"
                    label="Due Date"
                    type="date"
                    fullWidth
                    variant="outlined"
                    value={selectedAccount.dueDate || ''}
                    onChange={handleEditInputChange}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleDeleteAccount}
              color="error"
              startIcon={<DeleteIcon />}
            >
              Delete
            </Button>
            <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleUpdateAccount}
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              disabled={!selectedAccount?.name || selectedAccount?.balance === 0}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Home;