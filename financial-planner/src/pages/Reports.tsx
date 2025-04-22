import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent,
  Grid,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { auth, db } from '../firebase-config';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface Account {
  id?: string;
  name: string;
  balance: number;
  type: 'savings' | 'debt';
}

interface Transaction {
  id?: string;
  accountId: string;
  accountName: string;
  type: 'create' | 'update' | 'delete';
  previousBalance?: number;
  newBalance?: number;
  timestamp: Date;
  description: string;
}

interface ChartData {
  date: string;
  balance: number;
}

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchAccounts(user.uid);
        fetchTransactions(user.uid);
      } else {
        setAccounts([]);
        setTransactions([]);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedAccount && transactions.length > 0) {
      generateChartData();
    }
  }, [selectedAccount, transactions]);

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

  const generateChartData = () => {
    if (!selectedAccount) return;

    // Filter transactions for selected account
    const accountTransactions = transactions
      .filter(t => t.accountId === selectedAccount.id)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Create chart data points
    const data: ChartData[] = [];
    let currentBalance = 0;

    // Add initial balance if it's a create transaction
    const createTransaction = accountTransactions.find(t => t.type === 'create');
    if (createTransaction) {
      currentBalance = createTransaction.newBalance || 0;
      data.push({
        date: createTransaction.timestamp.toLocaleDateString(),
        balance: currentBalance
      });
    }

    // Add subsequent balance changes
    accountTransactions.forEach(transaction => {
      if (transaction.type === 'update') {
        currentBalance = transaction.newBalance || currentBalance;
        data.push({
          date: transaction.timestamp.toLocaleDateString(),
          balance: currentBalance
        });
      }
    });

    setChartData(data);
  };

  const handleAccountClick = (account: Account) => {
    setSelectedAccount(account);
  };

  const handleCloseDialog = () => {
    setSelectedAccount(null);
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
            Reports
          </Typography>
        </Toolbar>
      </AppBar>

      <Container>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Reports
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
            <Grid container spacing={3}>
              {accounts.map((account) => (
                <Grid item xs={12} sm={6} md={4} key={account.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: 3
                      }
                    }}
                    onClick={() => handleAccountClick(account)}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {account.name}
                      </Typography>
                      <Typography 
                        variant="h5" 
                        color={account.balance < 0 ? 'error.main' : 'success.main'}
                      >
                        ${Math.abs(account.balance).toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {account.type === 'debt' ? 'Debt Account' : 'Savings Account'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Transaction History Dialog */}
          <Dialog 
            open={Boolean(selectedAccount)} 
            onClose={handleCloseDialog}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              Transaction History - {selectedAccount?.name}
            </DialogTitle>
            <DialogContent>
              {chartData.length > 0 ? (
                <Box sx={{ height: 400, mt: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="balance" 
                        name="Balance" 
                        stroke={selectedAccount?.type === 'debt' ? '#f44336' : '#4caf50'} 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                  No transaction history available for this account.
                </Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Container>
    </Box>
  );
};

export default Reports; 