import React from 'react';
import { Box, AppBar, Toolbar, Typography, Container } from '@mui/material';
import { Link } from 'react-router-dom';

export default function Layout({ children }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Geospatial Platform
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
              Dashboard
            </Link>
            <Link to="/map" style={{ color: 'white', textDecoration: 'none' }}>
              Map
            </Link>
            <Link to="/projects" style={{ color: 'white', textDecoration: 'none' }}>
              Projects
            </Link>
            <Link to="/analysis" style={{ color: 'white', textDecoration: 'none' }}>
              Analysis
            </Link>
            <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>
              Login
            </Link>
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
    </Box>
  );
}