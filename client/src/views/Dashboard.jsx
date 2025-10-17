import React from 'react';
import { Container, Typography, Box } from '@mui/material';

export default function Dashboard() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4">Dashboard</Typography>
        <Typography variant="body1">Welcome to the Geospatial Platform</Typography>
      </Box>
    </Container>
  );
}