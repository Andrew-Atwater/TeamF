import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const Reports: React.FC = () => {
  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Reports
        </Typography>
        <Typography variant="body1">
          Financial reports and analytics will be displayed here.
        </Typography>
      </Box>
    </Container>
  );
};

export default Reports; 