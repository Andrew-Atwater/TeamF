import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Divider
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase-config';
import { collection, query, where, getDocs } from 'firebase/firestore';

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

const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const transactionsRef = collection(db, 'transactions');
        const q = query(transactionsRef, where('userId', '==', user.uid));
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [navigate]);

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
            Transaction History
          </Typography>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        {isLoading ? (
          <Typography>Loading transactions...</Typography>
        ) : transactions.length === 0 ? (
          <Typography>No transactions found.</Typography>
        ) : (
          <List>
            {transactions.map((transaction) => (
              <React.Fragment key={transaction.id}>
                <ListItem>
                  <ListItemText
                    primary={transaction.description}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {transaction.timestamp.toLocaleString()}
                        </Typography>
                        {transaction.type === 'update' && (
                          <Typography variant="body2" color="text.secondary">
                            Balance changed from ${Math.abs(transaction.previousBalance || 0).toFixed(2)} to ${Math.abs(transaction.newBalance || 0).toFixed(2)}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
      </Container>
    </Box>
  );
};

export default TransactionHistory; 