import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import DatePicker from 'react-datepicker';
import { format, isSameDay } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";
import { auth, db } from '../firebase-config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

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

// Add custom CSS to remove the green background
const customStyles = `
  .react-datepicker__day--selected {
    background-color: #e3f2fd !important;
    color: inherit !important;
  }
  .react-datepicker__day--keyboard-selected {
    background-color: #e3f2fd !important;
    color: inherit !important;
  }
  .react-datepicker__day--highlighted {
    background-color: transparent !important;
    color: inherit !important;
  }
`;

const Calendar: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDayPayments, setSelectedDayPayments] = useState<Account[]>([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!auth.currentUser) return;
      
      const accountsQuery = query(
        collection(db, 'accounts'),
        where('userId', '==', auth.currentUser.uid)
      );
      
      const querySnapshot = await getDocs(accountsQuery);
      const fetchedAccounts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Account[];
      
      setAccounts(fetchedAccounts);
    };

    fetchAccounts();
  }, []);

  const handleDateClick = (date: Date) => {
    const payments = accounts.filter(account => 
      account.type === 'debt' && 
      account.monthlyPayment && 
      isSameDay(new Date(account.monthlyPayment.nextPaymentDate + 'T00:00:00'), date)
    );
    
    if (payments.length > 0) {
      setSelectedDayPayments(payments);
      setOpenDialog(true);
    }
  };

  const renderDayContents = (dayOfMonth: number, date?: Date) => {
    if (!date) return dayOfMonth;
    
    const hasPayments = accounts.some(account => 
      account.type === 'debt' && 
      account.monthlyPayment && 
      isSameDay(new Date(account.monthlyPayment.nextPaymentDate + 'T00:00:00'), date)
    );

    return (
      <div 
        style={{ 
          position: 'relative',
          cursor: hasPayments ? 'pointer' : 'default'
        }}
        onClick={() => hasPayments && handleDateClick(date)}
      >
        {dayOfMonth}
        {hasPayments && (
          <div
            style={{
              position: 'absolute',
              bottom: '2px',
              right: '2px',
              width: '6px',
              height: '6px',
              backgroundColor: 'red',
              borderRadius: '50%',
            }}
          />
        )}
      </div>
    );
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate(-1)}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div">
            Calendar
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <style>{customStyles}</style>
            <DatePicker
              selected={selectedDate}
              onChange={(date: Date) => setSelectedDate(date)}
              inline
              renderDayContents={renderDayContents}
              highlightDates={accounts
                .filter(account => account.type === 'debt' && account.monthlyPayment)
                .map(account => new Date(account.monthlyPayment!.nextPaymentDate + 'T00:00:00'))}
            />
          </Paper>

          <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
            <DialogTitle>Payments Due</DialogTitle>
            <DialogContent>
              <List>
                {selectedDayPayments.map((account, index) => (
                  <React.Fragment key={account.id}>
                    <ListItem>
                      <ListItemText
                        primary={account.name}
                        secondary={
                          <>
                            <Typography variant="body2" color="text.primary">
                              Amount: ${account.monthlyPayment?.amount.toFixed(2)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              From: {accounts.find(acc => acc.id === account.monthlyPayment?.linkedAccountId)?.name}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < selectedDayPayments.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Close</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Container>
    </>
  );
};

export default Calendar; 