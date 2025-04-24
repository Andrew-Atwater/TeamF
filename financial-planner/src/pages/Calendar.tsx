import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
} from '@mui/material';

const Calendar: React.FC = () => {
  const [message, setMessage] = useState<string>('Loading...');

  useEffect(() => {
    const fetchData = async () => {
      console.log('Attempting to fetch data...');
      try {
        const response = await fetch('http://127.0.0.1:5000/api/calendar');
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Received data:', data);
        setMessage(data.message);
      } catch (error) {
        console.error('Detailed error:', error);
        setMessage('Error connecting to backend: ' + (error as Error).message);
      }
    };

    fetchData();
  }, []);

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Calendar Page
        </Typography>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="body1">
            {message}
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Calendar; 