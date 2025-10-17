import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store';
import theme from './theme';

// Import components (to be created)
import Layout from './components/Layout';
import MapView from './views/MapView';
import Dashboard from './views/Dashboard';
import Login from './views/Login';
import ProjectList from './views/ProjectList';
import AnalysisView from './views/AnalysisView';

const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/map" element={<MapView />} />
              <Route path="/login" element={<Login />} />
              <Route path="/projects" element={<ProjectList />} />
              <Route path="/analysis" element={<AnalysisView />} />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default App;