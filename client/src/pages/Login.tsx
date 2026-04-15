import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Link as MuiLink, Container, Alert, CircularProgress, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await api.post('/auth/login', { email, password });
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
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      bgcolor: '#0F172A',
      color: 'white'
    }}>
      <div className="blob"></div>
      <div className="blob blob-2" style={{ top: '60%', right: '-10%' }}></div>
      <div className="blob blob-3" style={{ bottom: '-10%', left: '-10%' }}></div>
      
      {/* Back Button */}
      <Box sx={{ position: 'absolute', top: 40, left: 40 }}>
        <Button 
          startIcon={<ChevronLeft />} 
          onClick={() => navigate('/')}
          sx={{ 
            fontWeight: 700, 
            color: 'rgba(255,255,255,0.6)', 
            textTransform: 'none',
            '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.05)' }
          }}
        >
          Back to Home
        </Button>
      </Box>

      <Container component="main" maxWidth="xs" sx={{ position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Paper 
            elevation={0} 
            sx={{ 
              p: 6, 
              width: '100%', 
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 40px 100px rgba(0,0,0,0.5)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4, textAlign: 'center' }}>
              <Box 
                component="img" 
                src="/logo.png" 
                alt="Logo" 
                onError={(e: any) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
                sx={{ height: 60 }} 
              />
              <Box sx={{ display: 'none', alignItems: 'center', gap: 1 }}>
                <Typography variant="h4" fontWeight={900} sx={{ 
                   background: 'linear-gradient(45deg, #fff, var(--secondary))',
                   WebkitBackgroundClip: 'text',
                   WebkitTextFillColor: 'transparent',
                   letterSpacing: -1
                }}>
                  DormEase
                </Typography>
              </Box>
            </Box>
            
            <Typography variant="h5" align="center" fontWeight={800} gutterBottom sx={{ color: 'white' }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" align="center" sx={{ mb: 4, color: 'rgba(255,255,255,0.5)' }}>
              Secure access to your management portal.
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3, bgcolor: 'rgba(211, 47, 47, 0.1)', color: '#ffcdd2' }}>{error}</Alert>}

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
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.03)',
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                    '&:hover fieldset': { borderColor: 'var(--secondary)' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' }
                }}
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
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.03)',
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                    '&:hover fieldset': { borderColor: 'var(--secondary)' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' }
                }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <MuiLink href="#" variant="body2" sx={{ fontWeight: 600, color: 'var(--secondary)', textDecoration: 'none' }}>Forgot password?</MuiLink>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ 
                  mt: 4, 
                  mb: 3, 
                  height: 56, 
                  borderRadius: 3,
                  fontWeight: 800,
                  fontSize: '1rem',
                  textTransform: 'none',
                  bgcolor: 'var(--primary)',
                  boxShadow: '0 20px 40px rgba(43, 90, 129, 0.3)',
                  '&:hover': { bgcolor: '#1e4a6d' }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>
              
              <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 3, textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                  New Dormitory? <MuiLink href="#contact" sx={{ color: 'var(--secondary)', fontWeight: 700, textDecoration: 'none' }}>Contact Sales</MuiLink>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </motion.div>
      </Container>
      
      <Box sx={{ mt: 8, textAlign: 'center', zIndex: 10 }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>
          © {new Date().getFullYear()} DormEase. Trusted by 200+ Campuses.
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
