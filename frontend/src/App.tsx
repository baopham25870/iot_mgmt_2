// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import LoginPage from './pages/Login';
import DashboardLayout from './components/DashboardLayout';
import GeneralSearchPage from './pages/GeneralSearch';
import { AuthContext } from './context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

function App() {
  const { user, loading } = useContext(AuthContext)!;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<GeneralSearchPage />} />
        <Route path="search" element={<GeneralSearchPage />} />
        {/* Thêm route cho Location/Box/Camera sau */}
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;
