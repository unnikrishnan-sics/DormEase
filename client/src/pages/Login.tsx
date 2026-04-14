import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Link, Container, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';


const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('admin@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });

      
      const { token, ...userData } = response.data;
      login({ user: userData, token });
      
      if (userData.isFirstLogin) {
        navigate('/change-password');
      } else {
        navigate('/dashboard');
      }

    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 3 }}>
          <Typography component="h1" variant="h4" align="center" fontWeight="bold" color="primary" gutterBottom>
            DormEase
          </Typography>
          <Typography variant="body2" align="center" color="textSecondary" sx={{ mb: 3 }}>
            Welcome back! Please login to your account.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleLogin} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2, height: 48 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
            
            <Box sx={{ mt: 2, p: 2, bgcolor: '#F9FAFB', borderRadius: 2 }}>
              <Typography variant="caption" color="textSecondary" display="block">
                Demo Credentials:
              </Typography>
              <Typography variant="caption" color="textSecondary" display="block">
                Admin: admin@gmail.com / admin@123
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Student: student@example.com / password123
              </Typography>
            </Box>


            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Link href="#" variant="body2">Forgot password?</Link>
            </Box>

          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
