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
  amount: number;
  description: string;
}

const AddTransaction: React.FC = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [formData, setFormData] = useState<TransactionForm>({
    accountId: '',
    amount: 0,
    description: '',
  });
  const [loading, setLoading] = useState(true);

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
    if (!auth.currentUser) return;

    try {
      const account = accounts.find(a => a.id === formData.accountId);
      if (!account) return;

      // Update account balance
      const accountRef = doc(db, 'accounts', formData.accountId);
      const newBalance = account.balance + formData.amount;
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
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
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
                disabled={loading || !formData.accountId || !formData.amount || !formData.description}
              >
                Add Transaction
              </Button>
            </form>
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default AddTransaction; 