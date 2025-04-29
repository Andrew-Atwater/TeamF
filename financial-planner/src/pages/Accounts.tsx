import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import { Edit as EditIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase-config';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

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

const Accounts: React.FC = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchAccounts(user.uid);
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

  const handleEditClick = (account: Account) => {
    setSelectedAccount({...account});
    setIsEditDialogOpen(true);
  };

  const handleUpdateAccount = async () => {
    if (!auth.currentUser || !selectedAccount || !selectedAccount.id) return;
    
    try {
      const accountRef = doc(db, 'accounts', selectedAccount.id);
      const newBalance = selectedAccount.type === 'debt' ? -Math.abs(selectedAccount.balance) : Math.abs(selectedAccount.balance);
      
      const updateData: any = {
        balance: newBalance
      };

      if (selectedAccount.type === 'debt') {
        updateData.dueDate = selectedAccount.dueDate;
      }
      
      // If it's a debt account and balance is 0, delete it
      if (selectedAccount.type === 'debt' && newBalance === 0) {
        await deleteDoc(accountRef);
      } else {
        await updateDoc(accountRef, updateData);
      }
      
      setIsEditDialogOpen(false);
      setSelectedAccount(null);
      fetchAccounts(auth.currentUser.uid);
    } catch (error) {
      console.error('Error updating account:', error);
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedAccount) return;
    
    const { name, value } = e.target;
    setSelectedAccount(prev => ({
      ...prev!,
      [name]: name === 'balance' ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
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
            Accounts
          </Typography>
        </Toolbar>
      </AppBar>

      <Container>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Accounts
          </Typography>
          
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : accounts.length === 0 ? (
            <Typography variant="body1" color="text.secondary">
              No accounts found.
            </Typography>
          ) : (
            <Box sx={{ display: 'grid', gap: 2, mt: 2 }}>
              {accounts.map((account) => (
                <Card key={account.id}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6">{account.name}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography 
                          variant="h5" 
                          color={account.balance < 0 ? 'error.main' : 'success.main'}
                        >
                          ${Math.abs(account.balance).toFixed(2)}
                        </Typography>
                        <Button
                          startIcon={<EditIcon />}
                          onClick={() => handleEditClick(account)}
                        >
                          Do Nothing
                        </Button>
                      </Box>
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
                        <Typography variant="body1" color="error.main">
                          {new Date(account.dueDate + 'T00:00:00').toLocaleDateString()}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {/* Edit Account Dialog */}
          <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Dump Account Balance</DialogTitle>
            <DialogContent>
              {selectedAccount && (
                <>
                  <TextField
                    margin="dense"
                    name="balance"
                    label="Balance"
                    type="number"
                    fullWidth
                    variant="outlined"
                    value={selectedAccount.balance}
                    onChange={handleEditInputChange}
                    sx={{ mb: 2 }}
                  />
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
                      sx={{ mb: 2 }}
                    />
                  )}
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleUpdateAccount}
                variant="contained"
                color="primary"
              >
                Save
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Container>
    </Box>
  );
};

export default Accounts; 