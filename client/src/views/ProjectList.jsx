import React from 'react';
import { Container, Typography, Box } from '@mui/material';

export default function ProjectList() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4">Projects</Typography>
        <Typography variant="body1">Project list will be displayed here</Typography>
      </Box>
    </Container>
  );
}