import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  SelectChangeEvent,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase-config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface Account {
  name: string;
  balance: number;
  type: 'savings' | 'debt';
  dueDate?: string;
  monthlyPayment?: {
    amount: number;
    linkedAccountId: string;
    nextPaymentDate: string;
  };
}

const AddAccount: React.FC = () => {
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account>({
    name: '',
    balance: 0,
    type: 'savings'
  });
  const [error, setError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAccount(prev => ({
      ...prev,
      [name]: name === 'balance' ? parseFloat(value) : value
    }));
  };

  const handleTypeChange = (e: SelectChangeEvent) => {
    setAccount(prev => ({
      ...prev,
      type: e.target.value as 'savings' | 'debt'
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const user = auth.currentUser;
      if (!user) {
        setError('You must be logged in to add an account');
        return;
      }

      const accountData = {
        ...account,
        userId: user.uid,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'accounts'), accountData);
      navigate('/accounts');
    } catch (error) {
      console.error('Error adding account:', error);
      setError('Failed to add account. Please try again.');
    }
  };

  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Add New Account
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Account Name"
            name="name"
            value={account.name}
            onChange={handleChange}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="Balance"
            name="balance"
            type="number"
            value={account.balance}
            onChange={handleChange}
            margin="normal"
            required
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Account Type</InputLabel>
            <Select
              value={account.type}
              onChange={handleTypeChange}
              label="Account Type"
            >
              <MenuItem value="savings">Savings</MenuItem>
              <MenuItem value="debt">Debt</MenuItem>
            </Select>
          </FormControl>

          {account.type === 'debt' && (
            <TextField
              fullWidth
              label="Due Date"
              name="dueDate"
              type="date"
              value={account.dueDate || ''}
              onChange={handleChange}
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
          >
            Add Account
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default AddAccount; 