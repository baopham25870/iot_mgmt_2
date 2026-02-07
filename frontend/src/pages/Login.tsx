import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import {
  Box, Paper, Typography, TextField, Button, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Grid
} from '@mui/material';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  
  // Registration form state
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  
  const { login } = useContext(AuthContext)!;
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegLoading(true);

    try {
      const res = await axios.post('/api/register', {
        username: regUsername,
        password: regPassword,
        email: regEmail,
        full_name: regFullName
      });
      
      // Close dialog and show success
      setOpenRegister(false);
      setRegUsername('');
      setRegPassword('');
      setRegEmail('');
      setRegFullName('');
      
      // Auto login after registration
      setUsername(regUsername);
      setPassword(regPassword);
      setError('Đăng ký thành công! Vui lòng đăng nhập.');
    } catch (err: any) {
      setRegError(err.response?.data?.error || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.100'
      }}
    >
      <Paper elevation={6} sx={{ p: 5, width: 400, maxWidth: '90%' }}>
        <Typography variant="h4" align="center" gutterBottom>
          Đăng nhập hệ thống
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Tên đăng nhập"
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />
          <TextField
            fullWidth
            label="Mật khẩu"
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, py: 1.5 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Đăng nhập'}
          </Button>
        </form>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button
            variant="text"
            color="secondary"
            onClick={() => setOpenRegister(true)}
          >
            Chưa có tài khoản? Đăng ký ngay
          </Button>
        </Box>
      </Paper>

      {/* Registration Dialog */}
      <Dialog open={openRegister} onClose={() => setOpenRegister(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Đăng ký tài khoản mới</DialogTitle>
        <form onSubmit={handleRegister}>
          <DialogContent>
            {regError && <Alert severity="error" sx={{ mb: 2 }}>{regError}</Alert>}
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tên đăng nhập"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mật khẩu"
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  helperText="Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email (tùy chọn)"
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Họ và tên (tùy chọn)"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpenRegister(false)}>Hủy</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={regLoading}
            >
              {regLoading ? <CircularProgress size={24} /> : 'Đăng ký'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default LoginPage;
