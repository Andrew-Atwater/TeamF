import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase-config';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';

interface Account {
  id: string;
  name: string;
  balance: number;
  type: 'savings' | 'debt';
}

interface TransactionForm {
  accountId: string;
  amount: number | '';
  description: string;
  transactionType: 'deposit' | 'withdraw' | 'payoff';
}

const AddTransaction: React.FC = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [formData, setFormData] = useState<TransactionForm>({
    accountId: '',
    amount: '',
    description: '',
    transactionType: 'deposit',
  });
  const [loading, setLoading] = useState(true);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!auth.currentUser) return;

      try {
        const accountsRef = collection(db, 'accounts');
        const q = query(accountsRef, where('userId', '==', auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        const accountsData: Account[] = [];
        querySnapshot.forEach((doc) => {
          accountsData.push({ id: doc.id, ...doc.data() } as Account);
        });
        
        setAccounts(accountsData);
      } catch (error) {
        console.error('Error fetching accounts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || formData.amount === '') return;
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmSubmit = async () => {
    if (!auth.currentUser || formData.amount === '') return;

    try {
      const account = accounts.find(a => a.id === formData.accountId);
      if (!account) return;

      // Calculate the amount based on transaction type
      let amount = formData.amount;
      if (account.type === 'debt') {
        amount = Math.abs(amount); // For debt accounts, we subtract the payment amount
      } else {
        amount = formData.transactionType === 'deposit' ? Math.abs(amount) : -Math.abs(amount);
      }

      // Update account balance
      const accountRef = doc(db, 'accounts', formData.accountId);
      const newBalance = account.type === 'debt' 
        ? account.balance + amount // For debt accounts, adding a positive amount reduces the debt
        : account.balance + amount; // For savings accounts, logic remains the same

      await updateDoc(accountRef, { balance: newBalance });

      // Add transaction record
      const transactionsRef = collection(db, 'transactions');
      await addDoc(transactionsRef, {
        accountId: formData.accountId,
        accountName: account.name,
        userId: auth.currentUser.uid,
        type: 'update',
        previousBalance: account.balance,
        newBalance: newBalance,
        timestamp: Timestamp.now(),
        description: formData.description
      });

      // Navigate back to home
      navigate('/');
    } catch (error) {
      console.error('Error adding transaction:', error);
    } finally {
      setIsConfirmDialogOpen(false);
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    
    if (name === 'accountId') {
      const selectedAccount = accounts.find(a => a.id === value);
      setFormData(prev => ({
        ...prev,
        accountId: value,
        transactionType: selectedAccount?.type === 'debt' ? 'payoff' : 'deposit'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name as string]: value
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? (value === '' ? '' : parseFloat(value)) : value
    }));
  };

  const getTransactionTypeOptions = () => {
    const selectedAccount = accounts.find(a => a.id === formData.accountId);
    if (!selectedAccount) return [];

    if (selectedAccount.type === 'debt') {
      return [{ value: 'payoff', label: 'Debt Payment' }];
    } else {
      return [
        { value: 'deposit', label: 'Deposit' },
        { value: 'withdraw', label: 'Withdraw' }
      ];
    }
  };

  const getSelectedAccount = () => {
    return accounts.find(a => a.id === formData.accountId);
  };

  const getTransactionTypeLabel = () => {
    const options = getTransactionTypeOptions();
    const option = options.find(opt => opt.value === formData.transactionType);
    return option ? option.label : '';
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Add Transaction
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm">
        <Box sx={{ my: 4 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Account</InputLabel>
                <Select
                  name="accountId"
                  value={formData.accountId}
                  label="Account"
                  onChange={handleSelectChange}
                  required
                >
                  {accounts.map((account) => (
                    <MenuItem key={account.id} value={account.id}>
                      {account.name} (${account.balance})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {formData.accountId && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Transaction Type</InputLabel>
                  <Select
                    name="transactionType"
                    value={formData.transactionType}
                    label="Transaction Type"
                    onChange={handleSelectChange}
                    required
                  >
                    {getTransactionTypeOptions().map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <TextField
                fullWidth
                label="Amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleInputChange}
                required
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                multiline
                rows={3}
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading || !formData.accountId || formData.amount === '' || !formData.description}
              >
                Confirm Transaction
              </Button>
            </form>
          </Paper>
        </Box>
      </Container>

      <Dialog open={isConfirmDialogOpen} onClose={() => setIsConfirmDialogOpen(false)}>
        <DialogTitle>Confirm Transaction</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              <strong>Account:</strong> {getSelectedAccount()?.name}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Transaction Type:</strong> {getTransactionTypeLabel()}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Amount:</strong> ${typeof formData.amount === 'number' ? Math.abs(formData.amount).toFixed(2) : '0.00'}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Description:</strong> {formData.description}
            </Typography>
            <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
              Please review the transaction details before confirming.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsConfirmDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmSubmit} variant="contained" color="primary">
            Confirm Transaction
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddTransaction; 