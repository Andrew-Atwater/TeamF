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
  SpeedDialAction,
  InputLabel,
  Select
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Close as CloseIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  AddCircle as AddCircleIcon,
  List as ListIcon,
  BarChart as BarChartIcon,
  AccountBalance as AccountBalanceIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase-config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { MenuItems } from './MenuItems';

interface Account {
  id?: string;
  name: string;
  balance: number;
  dueDate: string | null;
  description: string;
  type: 'savings' | 'debt';
  userId: string;
  monthlyPayment?: {
    amount: number;
    linkedAccountId: string;
    nextPaymentDate: string;
  } | null;
}

interface Transaction {
  id?: string;
  accountId: string;
  accountName: string;
  userId: string;
  type: 'create' | 'update' | 'delete';
  previousBalance?: number;
  newBalance?: number;
  timestamp: Date;
  description: string;
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
  const [isSweepDialogOpen, setIsSweepDialogOpen] = useState<boolean>(false);
  const [sweepTargetAccountId, setSweepTargetAccountId] = useState<string>('');
  const [isCreatingAccountForSweep, setIsCreatingAccountForSweep] = useState<boolean>(false);
  const [newAccount, setNewAccount] = useState<Omit<Account, 'userId'>>({
    name: '',
    balance: 0,
    dueDate: null,
    description: '',
    type: 'savings',
    monthlyPayment: null
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isPendingPayment, setIsPendingPayment] = useState<Account | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState<boolean>(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchAccounts(currentUser.uid);
        fetchTransactions(currentUser.uid);
        processMonthlyPayments(currentUser.uid);
      } else {
        setAccounts([]);
        setTransactions([]);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Check for pending debt amount from cost calculator
    const pendingDebtAmount = localStorage.getItem('pendingDebtAmount');
    if (pendingDebtAmount) {
      setNewAccount({
        ...newAccount,
        type: 'debt',
        balance: parseFloat(pendingDebtAmount)
      });
      setIsAddDialogOpen(true);
      localStorage.removeItem('pendingDebtAmount'); // Clear the pending amount
    }
  }, []); // Run once on component mount

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

  const fetchTransactions = async (uid: string) => {
    try {
      const transactionsRef = collection(db, 'transactions');
      const q = query(transactionsRef, where('userId', '==', uid));
      const querySnapshot = await getDocs(q);
      
      const transactionsData: Transaction[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        transactionsData.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp.toDate()
        } as Transaction);
      });
      
      setTransactions(transactionsData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const processMonthlyPayments = async (uid: string) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get all debt accounts with monthly payments
      const debtAccounts = accounts.filter(
        account => account.type === 'debt' && 
        account.monthlyPayment && 
        account.monthlyPayment.amount > 0 &&
        account.monthlyPayment.linkedAccountId &&
        account.dueDate // Ensure account has a due date
      );

      for (const debtAccount of debtAccounts) {
        // Get the current month's due date
        const currentDueDate = new Date(debtAccount.dueDate + 'T00:00:00');
        currentDueDate.setMonth(today.getMonth());
        currentDueDate.setFullYear(today.getFullYear());

        // If we've passed last month's due date, use this month's due date
        if (currentDueDate < today) {
          currentDueDate.setMonth(currentDueDate.getMonth() + 1);
        }

        // Check if payment is due today
        if (today.getTime() === currentDueDate.getTime()) {
          const linkedAccount = accounts.find(acc => acc.id === debtAccount.monthlyPayment!.linkedAccountId);
          
          if (linkedAccount && linkedAccount.id && debtAccount.id) {
            const paymentAmount = debtAccount.monthlyPayment!.amount;
            
            // Update debt account
            const debtRef = doc(db, 'accounts', debtAccount.id);
            const newDebtBalance = debtAccount.balance + paymentAmount;
            
            // Update savings account
            const savingsRef = doc(db, 'accounts', linkedAccount.id);
            const newSavingsBalance = linkedAccount.balance - paymentAmount;
            
            // Calculate next payment date (next month's due date)
            const nextDueDate = new Date(currentDueDate);
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);
            
            // Update accounts
            await updateDoc(debtRef, {
              balance: newDebtBalance,
              'monthlyPayment.nextPaymentDate': nextDueDate.toISOString().split('T')[0]
            });
            
            await updateDoc(savingsRef, {
              balance: newSavingsBalance
            });
            
            // Add transaction record
            await addTransaction({
              accountId: debtAccount.id,
              accountName: debtAccount.name,
              userId: uid,
              type: 'update',
              previousBalance: debtAccount.balance,
              newBalance: newDebtBalance,
              description: `Monthly payment from ${linkedAccount.name} to ${debtAccount.name}`
            });
          }
        }
      }
      
      // Refresh accounts after processing payments
      fetchAccounts(uid);
    } catch (error) {
      console.error('Error processing monthly payments:', error);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
    if (!user) return;
    
    try {
      const transactionsRef = collection(db, 'transactions');
      await addDoc(transactionsRef, {
        ...transaction,
        timestamp: Timestamp.now()
      });
      
      // Refresh transactions
      fetchTransactions(user.uid);
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const handleAddAccount = async () => {
    if (!user) return;
    
    try {
      const accountsRef = collection(db, 'accounts');
      const newBalance = newAccount.type === 'debt' ? -Math.abs(newAccount.balance) : Math.abs(newAccount.balance);
      
      // If we're creating an account for sweep, add the swept balance
      const finalBalance = isCreatingAccountForSweep && selectedAccount 
        ? newBalance + selectedAccount.balance 
        : newBalance;
      
      const docRef = await addDoc(accountsRef, {
        ...newAccount,
        userId: user.uid,
        balance: finalBalance
      });
      
      // Add transaction record for account creation
      await addTransaction({
        accountId: docRef.id,
        accountName: newAccount.name,
        userId: user.uid,
        type: 'create',
        newBalance: finalBalance,
        description: `Created ${newAccount.type} account: ${newAccount.name}`
      });
      
      // If we were creating an account for sweep, add the sweep transaction and delete old account
      if (isCreatingAccountForSweep && selectedAccount && selectedAccount.id) {
        // Add sweep transaction
        await addTransaction({
          accountId: selectedAccount.id,
          accountName: selectedAccount.name,
          userId: user.uid,
          type: 'delete',
          previousBalance: selectedAccount.balance,
          description: `Deleted account ${selectedAccount.name} - sweep balance - swept $${Math.abs(selectedAccount.balance).toFixed(2)} from ${selectedAccount.name} to ${newAccount.name}`
        });
        
        // Delete the old account
        const accountRef = doc(db, 'accounts', selectedAccount.id);
        await deleteDoc(accountRef);
        
        // Reset sweep-related states
        setIsEditDialogOpen(false);
        setIsSweepDialogOpen(false);
        setSweepTargetAccountId('');
        setSelectedAccount(null);
        setIsCreatingAccountForSweep(false);
      }
      
      // Reset form and close dialog
      setNewAccount({
        name: '',
        balance: 0,
        dueDate: null,
        description: '',
        type: 'savings',
        monthlyPayment: null
      });
      setIsAddDialogOpen(false);
      
      // Refresh accounts and transactions
      fetchAccounts(user.uid);
    } catch (error) {
      console.error('Error adding account:', error);
    }
  };

  const handleUpdateAccount = async () => {
    if (!user || !selectedAccount || !selectedAccount.id) return;
    
    try {
      const accountRef = doc(db, 'accounts', selectedAccount.id);
      const newBalance = selectedAccount.type === 'debt' ? -Math.abs(selectedAccount.balance) : Math.abs(selectedAccount.balance);
      
      // Get previous balance by directly accessing the document
      const accountSnapshot = await getDocs(query(collection(db, 'accounts'), where('__name__', '==', selectedAccount.id)));
      const previousBalance = accountSnapshot.docs[0]?.data().balance || 0;
      
      // If it's a debt account and balance is 0, delete it
      if (selectedAccount.type === 'debt' && newBalance === 0) {
        await deleteDoc(accountRef);
        
        // Add transaction record for deletion
        await addTransaction({
          accountId: selectedAccount.id,
          accountName: selectedAccount.name,
          userId: user.uid,
          type: 'delete',
          previousBalance: previousBalance,
          newBalance: 0,
          description: `Paid off and deleted account ${selectedAccount.name}`
        });
      } else {
        await updateDoc(accountRef, {
          name: selectedAccount.name,
          description: selectedAccount.description,
          balance: newBalance,
          dueDate: selectedAccount.dueDate,
          type: selectedAccount.type
        });
        
        // Add transaction record
        await addTransaction({
          accountId: selectedAccount.id,
          accountName: selectedAccount.name,
          userId: user.uid,
          type: 'update',
          previousBalance: previousBalance,
          newBalance: newBalance,
          description: `Updated account ${selectedAccount.name}`
        });
      }
      
      setIsEditDialogOpen(false);
      setSelectedAccount(null);
      
      // Refresh accounts and transactions
      fetchAccounts(user.uid);
    } catch (error) {
      console.error('Error updating account:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !selectedAccount || !selectedAccount.id) return;
    
    // If there's no balance, delete directly
    if (selectedAccount.balance === 0) {
      await performDeleteAccount();
      return;
    }

    // Show sweep dialog for any account with balance
    setIsSweepDialogOpen(true);
  };

  const performDeleteAccount = async (sweepToAccountId?: string) => {
    if (!user || !selectedAccount || !selectedAccount.id) return;
    
    try {
      const accountRef = doc(db, 'accounts', selectedAccount.id);
      
      if (sweepToAccountId && selectedAccount.balance !== 0) {
        // Handle sweep transaction to existing account
        const targetAccount = accounts.find(acc => acc.id === sweepToAccountId);
        if (targetAccount && targetAccount.id) {
          const targetAccountRef = doc(db, 'accounts', targetAccount.id);
          const newBalance = targetAccount.balance + selectedAccount.balance;
          
          // Update target account balance
          await updateDoc(targetAccountRef, {
            balance: newBalance
          });
          
          // Add sweep transaction
          await addTransaction({
            accountId: selectedAccount.id,
            accountName: selectedAccount.name,
            userId: user.uid,
            type: 'delete',
            previousBalance: selectedAccount.balance,
            description: `Deleted account ${selectedAccount.name} - sweep balance - swept $${Math.abs(selectedAccount.balance).toFixed(2)} from ${selectedAccount.name} to ${targetAccount.name}`
          });
        }
      } else {
        // Regular delete transaction
        await addTransaction({
          accountId: selectedAccount.id,
          accountName: selectedAccount.name,
          userId: user.uid,
          type: 'delete',
          previousBalance: selectedAccount.balance,
          description: `Deleted ${selectedAccount.type} account: ${selectedAccount.name}`
        });
      }
      
      // Delete the account
      await deleteDoc(accountRef);
      
      // Reset states
      setIsEditDialogOpen(false);
      setIsSweepDialogOpen(false);
      setSweepTargetAccountId('');
      setSelectedAccount(null);
      setIsCreatingAccountForSweep(false);
      
      // Refresh accounts and transactions
      fetchAccounts(user.uid);
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const handleSweepDialogClose = (shouldSweep: boolean) => {
    if (!shouldSweep) {
      // User chose not to sweep, proceed with regular delete
      setIsSweepDialogOpen(false);  // Close sweep dialog first
      setIsEditDialogOpen(false);   // Close edit dialog
      performDeleteAccount();        // Then delete the account
    } else {
      // Check if there are accounts of the same type
      const sameTypeAccounts = accounts.filter(
        acc => acc.type === selectedAccount?.type && acc.id !== selectedAccount?.id
      );
      
      if (sameTypeAccounts.length === 0) {
        // No accounts of same type, guide to account creation
        setIsCreatingAccountForSweep(true);
        setIsAddDialogOpen(true);
        setIsSweepDialogOpen(false);
      }
      // If there are accounts, keep sweep dialog open to show account selection
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

  const handleEarlyPaymentClick = (account: Account, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click in edit mode
    setIsPendingPayment(account);
    setIsPaymentDialogOpen(true);
  };

  const handleEarlyPayment = async (account: Account) => {
    if (!account.monthlyPayment || !account.id) return;

    const linkedAccount = accounts.find(acc => acc.id === account.monthlyPayment?.linkedAccountId);
    
    if (!linkedAccount || !linkedAccount.id || linkedAccount.balance < account.monthlyPayment.amount) {
      return; // Insufficient funds or invalid linked account
    }

    try {
      const paymentAmount = account.monthlyPayment.amount;
      
      // Update debt account
      const debtRef = doc(db, 'accounts', account.id);
      const newDebtBalance = account.balance + paymentAmount;
      
      // Update savings account
      const savingsRef = doc(db, 'accounts', linkedAccount.id);
      const newSavingsBalance = linkedAccount.balance - paymentAmount;
      
      // Calculate next payment date (one month from original due date)
      const currentDueDate = new Date(account.dueDate + 'T00:00:00');
      const nextDueDate = new Date(currentDueDate);
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      
      // Update accounts
      await updateDoc(debtRef, {
        balance: newDebtBalance,
        'monthlyPayment.nextPaymentDate': nextDueDate.toISOString().split('T')[0]
      });
      
      await updateDoc(savingsRef, {
        balance: newSavingsBalance
      });
      
      // Add transaction record
      await addTransaction({
        accountId: account.id,
        accountName: account.name,
        userId: user.uid,
        type: 'update',
        previousBalance: account.balance,
        newBalance: newDebtBalance,
        description: `Early payment from ${linkedAccount.name} to ${account.name}`
      });

      // Refresh accounts
      fetchAccounts(user.uid);
    } catch (error) {
      console.error('Error processing early payment:', error);
    } finally {
      // Clear pending payment and close dialog
      setIsPendingPayment(null);
      setIsPaymentDialogOpen(false);
    }
  };

  const menuItems = [
    { 
      icon: <AddCircleIcon />, 
      text: 'Add Transaction',
      action: () => navigate('/add-transaction')
    },
    { 
      icon: <ListIcon />, 
      text: 'Transaction History',
      action: () => navigate('/transactions') 
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
      action: () => navigate('/settings')
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
          <MenuItems />
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
                      {new Date(account.dueDate + 'T00:00:00').toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
                {account.monthlyPayment && account.monthlyPayment.amount > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Monthly Payment: ${account.monthlyPayment.amount.toFixed(2)}
                      </Typography>
                      {!isEditMode && account.type === 'debt' && (
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={(e) => handleEarlyPaymentClick(account, e)}
                          disabled={
                            !accounts.find(
                              acc => 
                                acc.id === account.monthlyPayment?.linkedAccountId && 
                                acc.balance >= (account.monthlyPayment?.amount || 0)
                            )
                          }
                        >
                          Pay Now
                        </Button>
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Next Payment: {new Date(account.monthlyPayment.nextPaymentDate + 'T00:00:00').toLocaleDateString()}
                    </Typography>
                    {accounts.find(acc => acc.id === account.monthlyPayment?.linkedAccountId) && (
                      <Typography variant="body2" color="text.secondary">
                        From: {accounts.find(acc => acc.id === account.monthlyPayment?.linkedAccountId)?.name}
                      </Typography>
                    )}
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
            sx={{
              position: 'fixed',
              bottom: { xs: '1.5rem', sm: '2rem' },
              right: { xs: '1.5rem', sm: '2rem' },
              '& .MuiSpeedDial-fab': {
                width: { xs: 48, sm: 56 },
                height: { xs: 48, sm: 56 },
                '& .MuiSpeedDialIcon-root': {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }
              }
            }}
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
              <>
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
                  sx={{ mb: 2 }}
                />
                
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                  Monthly Payment (Optional)
                </Typography>
                
                <TextField
                  margin="dense"
                  name="monthlyPaymentAmount"
                  label="Monthly Payment Amount"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={newAccount.monthlyPayment?.amount || ''}
                  onChange={(e) => {
                    const amount = parseFloat(e.target.value) || 0;
                    setNewAccount(prev => ({
                      ...prev,
                      monthlyPayment: amount > 0 ? {
                        amount,
                        linkedAccountId: prev.monthlyPayment?.linkedAccountId || '',
                        nextPaymentDate: prev.dueDate || ''
                      } : null
                    }));
                  }}
                  sx={{ mb: 2 }}
                />
                
                {newAccount.monthlyPayment && newAccount.monthlyPayment.amount > 0 && (
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Link to Savings Account</InputLabel>
                    <Select
                      name="linkedAccountId"
                      value={newAccount.monthlyPayment.linkedAccountId}
                      label="Link to Savings Account"
                      onChange={(e) => {
                        setNewAccount(prev => ({
                          ...prev,
                          monthlyPayment: prev.monthlyPayment ? {
                            ...prev.monthlyPayment,
                            linkedAccountId: e.target.value
                          } : null
                        }));
                      }}
                    >
                      {accounts
                        .filter(acc => acc.type === 'savings')
                        .map((account) => (
                          <MenuItem key={account.id} value={account.id}>
                            {account.name} (${account.balance.toFixed(2)})
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleAddAccount}
              variant="contained"
              disabled={!newAccount.name || (newAccount.type === 'debt' && newAccount.balance === 0)}
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
                  <>
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
                      sx={{ mb: 2 }}
                    />
                    
                    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                      Monthly Payment (Optional)
                    </Typography>
                    
                    <TextField
                      margin="dense"
                      name="monthlyPaymentAmount"
                      label="Monthly Payment Amount"
                      type="number"
                      fullWidth
                      variant="outlined"
                      value={selectedAccount.monthlyPayment?.amount || ''}
                      onChange={(e) => {
                        const amount = parseFloat(e.target.value) || 0;
                        setSelectedAccount(prev => ({
                          ...prev!,
                          monthlyPayment: amount > 0 ? {
                            amount,
                            linkedAccountId: prev!.monthlyPayment?.linkedAccountId || '',
                            nextPaymentDate: prev!.dueDate || ''
                          } : null
                        }));
                      }}
                      sx={{ mb: 2 }}
                    />
                    
                    {selectedAccount.monthlyPayment && selectedAccount.monthlyPayment.amount > 0 && (
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Link to Savings Account</InputLabel>
                        <Select
                          name="linkedAccountId"
                          value={selectedAccount.monthlyPayment.linkedAccountId}
                          label="Link to Savings Account"
                          onChange={(e) => {
                            setSelectedAccount(prev => ({
                              ...prev!,
                              monthlyPayment: prev!.monthlyPayment ? {
                                ...prev!.monthlyPayment,
                                linkedAccountId: e.target.value
                              } : null
                            }));
                          }}
                        >
                          {accounts
                            .filter(acc => acc.type === 'savings' && acc.id !== selectedAccount.id)
                            .map((account) => (
                              <MenuItem key={account.id} value={account.id}>
                                {account.name} (${account.balance.toFixed(2)})
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    )}
                  </>
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
              disabled={!selectedAccount?.name || (selectedAccount?.type === 'debt' && selectedAccount?.balance === 0)}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Sweep Balance Dialog */}
        <Dialog open={isSweepDialogOpen} onClose={() => setIsSweepDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Sweep Balance</DialogTitle>
          <DialogContent>
            <Typography gutterBottom>
              Would you like to sweep the remaining balance into an existing account?
            </Typography>
            <Box sx={{ mt: 2 }}>
              <FormControl component="fieldset">
                <RadioGroup
                  value={sweepTargetAccountId}
                  onChange={(e) => {
                    setSweepTargetAccountId(e.target.value);
                  }}
                >
                  {accounts
                    .filter(acc => acc.type === selectedAccount?.type && acc.id !== selectedAccount?.id)
                    .map((account) => (
                      <FormControlLabel
                        key={account.id}
                        value={account.id}
                        control={<Radio />}
                        label={account.name}
                      />
                    ))}
                </RadioGroup>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => handleSweepDialogClose(false)}>No</Button>
            <Button
              onClick={() => {
                if (sweepTargetAccountId) {
                  performDeleteAccount(sweepTargetAccountId);
                } else {
                  handleSweepDialogClose(true);
                }
              }}
              variant="contained"
              disabled={accounts.filter(acc => acc.type === selectedAccount?.type && acc.id !== selectedAccount?.id).length > 0 && !sweepTargetAccountId}
            >
              Yes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Early Payment Confirmation Dialog */}
        <Dialog
          open={isPaymentDialogOpen}
          onClose={() => {
            setIsPaymentDialogOpen(false);
            setIsPendingPayment(null);
          }}
        >
          <DialogTitle>Confirm Early Payment</DialogTitle>
          <DialogContent>
            {isPendingPayment && isPendingPayment.monthlyPayment && (
              <>
                <Typography variant="body1" gutterBottom>
                  Are you sure you want to make an early payment of ${isPendingPayment.monthlyPayment.amount.toFixed(2)} to {isPendingPayment.name}?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This will:
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary={`Transfer $${isPendingPayment.monthlyPayment.amount.toFixed(2)} from ${
                        accounts.find(acc => acc.id === isPendingPayment.monthlyPayment?.linkedAccountId)?.name
                      }`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Process the payment immediately"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary={`Set the next payment date to ${
                        new Date(new Date(isPendingPayment.dueDate + 'T00:00:00').setMonth(
                          new Date(isPendingPayment.dueDate + 'T00:00:00').getMonth() + 1
                        )).toLocaleDateString()
                      }`}
                    />
                  </ListItem>
                </List>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => {
                setIsPaymentDialogOpen(false);
                setIsPendingPayment(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => isPendingPayment && handleEarlyPayment(isPendingPayment)}
            >
              Confirm Payment
            </Button>
          </DialogActions>
        </Dialog>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Transaction History
          </Typography>
          <List>
            {transactions.map((transaction) => (
              <ListItem key={transaction.id} divider>
                <ListItemText
                  primary={
                    transaction.type === 'create' || transaction.type === 'delete'
                      ? transaction.description.split(' - ')[0]  // Only show the first part for delete transactions
                      : `${transaction.description} (${transaction.accountName})`
                  }
                  secondary={
                    `${transaction.timestamp.toLocaleString()}${
                      transaction.type === 'delete' && transaction.description.includes('sweep balance') 
                        ? ` - ${transaction.description.split(' - ').slice(1).join(' - ')}` 
                        : transaction.type === 'delete' 
                        ? '' 
                        : ' - '}${
                      transaction.type === 'create' 
                        ? `Starting Balance: $${Math.abs(transaction.newBalance || 0).toFixed(2)}`
                        : transaction.type === 'update'
                        ? `Balance changed from $${Math.abs(transaction.previousBalance || 0).toFixed(2)} to $${Math.abs(transaction.newBalance || 0).toFixed(2)}`
                        : ''
                    }`
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;