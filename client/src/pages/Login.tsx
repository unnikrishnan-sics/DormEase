import React, { useState } from 'react';
import { 
  Box, Paper, Typography, TextField, Button, Link as MuiLink, Container, 
  Alert, CircularProgress, IconButton, InputAdornment, Dialog, DialogTitle, 
  DialogContent, DialogActions, Snackbar 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Visibility, VisibilityOff, LockOutlined, EmailOutlined, DialpadOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  // Forgot Password states
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = Enter Email, 2 = Verify OTP & Reset
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [forgotSnackbar, setForgotSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleOpenForgot = () => {
    setForgotOpen(true);
    setForgotStep(1);
    setForgotEmail('');
    setForgotOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotError('');
  };

  const handleCloseForgot = () => {
    setForgotOpen(false);
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (!forgotEmail) {
      setForgotError('Please enter your email address.');
      return;
    }

    setForgotLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotSnackbar({
        open: true,
        message: response.data.message || 'OTP sent successfully! Check server console.',
        severity: 'success'
      });
      setForgotStep(2);
    } catch (err: any) {
      setForgotError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (!forgotOtp) {
      setForgotError('Please enter the OTP.');
      return;
    }
    if (!newPassword) {
      setForgotError('Please enter a new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }

    setForgotLoading(true);
    try {
      const response = await api.post('/auth/reset-password', {
        email: forgotEmail,
        otp: forgotOtp,
        newPassword
      });
      setForgotSnackbar({
        open: true,
        message: response.data.message || 'Password reset successfully!',
        severity: 'success'
      });
      setForgotOpen(false);
    } catch (err: any) {
      setForgotError(err.response?.data?.message || 'Failed to reset password. Please check the OTP.');
    } finally {
      setForgotLoading(false);
    }
  };

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
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: 'rgba(255,255,255,0.5)' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
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
                <MuiLink 
                  component="button" 
                  type="button" 
                  onClick={handleOpenForgot} 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 600, 
                    color: 'var(--secondary)', 
                    textDecoration: 'none',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    p: 0,
                    '&:hover': { color: '#6ad1c4' }
                  }}
                >
                  Forgot password?
                </MuiLink>
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
                  New Dormitory? <MuiLink href="/#contact" sx={{ color: 'var(--secondary)', fontWeight: 700, textDecoration: 'none' }}>Contact Sales</MuiLink>
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

      {/* Forgot Password Dialog */}
      <Dialog 
        open={forgotOpen} 
        onClose={handleCloseForgot} 
        maxWidth="xs" 
        fullWidth
        sx={{
          '& .MuiPaper-root': {
            background: '#0F172A !important',
            backgroundImage: 'none !important',
            border: '1px solid rgba(255, 255, 255, 0.1) !important',
            borderRadius: '24px !important',
            color: 'white !important',
            p: 4,
            boxShadow: '0 40px 100px rgba(0,0,0,0.8) !important'
          },
          '& .MuiBackdrop-root': {
            backdropFilter: 'blur(12px) !important',
            backgroundColor: 'rgba(0, 0, 0, 0.75) !important'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 900, textAlign: 'center', pb: 1.5, px: 0, color: 'white !important', fontSize: '1.75rem', letterSpacing: '-0.5px' }}>
          {forgotStep === 1 ? 'Forgot Password' : 'Reset Password'}
        </DialogTitle>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5) !important', textAlign: 'center', mb: 4, px: 1, lineHeight: 1.5 }}>
          {forgotStep === 1 
            ? 'Enter your registered email address to receive a 6-digit verification code.'
            : `Verify the OTP sent to your email and set your new password.`}
        </Typography>

        <DialogContent sx={{ p: 0, overflow: 'visible', bgcolor: 'transparent !important' }}>
          {forgotError && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3.5, 
                borderRadius: 3, 
                bgcolor: 'rgba(239, 68, 68, 0.1) !important', 
                color: '#fca5a5 !important',
                border: '1px solid rgba(239, 68, 68, 0.2) !important',
                '& .MuiAlert-icon': { color: '#f87171 !important' }
              }}
            >
              {forgotError}
            </Alert>
          )}

          {forgotStep === 1 ? (
            <Box component="form" onSubmit={handleRequestOtp}>
              <TextField
                required
                fullWidth
                label="Email Address"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ color: 'rgba(255,255,255,0.5) !important' }}>
                      <EmailOutlined />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  mb: 3.5,
                  '& .MuiInputLabel-root': { 
                    color: 'rgba(255, 255, 255, 0.5) !important',
                    '&.Mui-focused': { color: 'var(--secondary) !important' }
                  },
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.03) !important',
                    color: 'white !important',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1) !important' },
                    '&:hover fieldset': { borderColor: 'var(--secondary) !important' },
                    '&.Mui-focused fieldset': { borderColor: 'var(--secondary) !important' }
                  },
                  '& .MuiOutlinedInput-input': { 
                    color: 'white !important',
                    '-webkit-text-fill-color': 'white !important'
                  }
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={forgotLoading}
                sx={{ 
                  height: 54, 
                  borderRadius: 3,
                  fontWeight: 800,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  bgcolor: 'var(--primary) !important',
                  color: 'white !important',
                  boxShadow: '0 20px 40px rgba(43, 90, 129, 0.3) !important',
                  '&:hover': { bgcolor: '#1e4a6d !important' }
                }}
              >
                {forgotLoading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset OTP'}
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleResetPassword}>
              <TextField
                required
                fullWidth
                label="Enter 6-Digit OTP"
                value={forgotOtp}
                onChange={(e) => setForgotOtp(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ color: 'rgba(255,255,255,0.5) !important' }}>
                      <DialpadOutlined />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  mb: 2.5,
                  '& .MuiInputLabel-root': { 
                    color: 'rgba(255, 255, 255, 0.5) !important',
                    '&.Mui-focused': { color: 'var(--secondary) !important' }
                  },
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.03) !important',
                    color: 'white !important',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1) !important' },
                    '&:hover fieldset': { borderColor: 'var(--secondary) !important' },
                    '&.Mui-focused fieldset': { borderColor: 'var(--secondary) !important' }
                  },
                  '& .MuiOutlinedInput-input': { 
                    color: 'white !important',
                    '-webkit-text-fill-color': 'white !important'
                  }
                }}
              />
              <TextField
                required
                fullWidth
                label="New Password"
                type={showForgotNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ color: 'rgba(255,255,255,0.5) !important' }}>
                      <LockOutlined />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                        edge="end"
                        sx={{ color: 'rgba(255,255,255,0.5) !important' }}
                      >
                        {showForgotNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  mb: 2.5,
                  '& .MuiInputLabel-root': { 
                    color: 'rgba(255, 255, 255, 0.5) !important',
                    '&.Mui-focused': { color: 'var(--secondary) !important' }
                  },
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.03) !important',
                    color: 'white !important',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1) !important' },
                    '&:hover fieldset': { borderColor: 'var(--secondary) !important' },
                    '&.Mui-focused fieldset': { borderColor: 'var(--secondary) !important' }
                  },
                  '& .MuiOutlinedInput-input': { 
                    color: 'white !important',
                    '-webkit-text-fill-color': 'white !important'
                  }
                }}
              />
              <TextField
                required
                fullWidth
                label="Confirm Password"
                type={showForgotConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ color: 'rgba(255,255,255,0.5) !important' }}>
                      <LockOutlined />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                        edge="end"
                        sx={{ color: 'rgba(255,255,255,0.5) !important' }}
                      >
                        {showForgotConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  mb: 4,
                  '& .MuiInputLabel-root': { 
                    color: 'rgba(255, 255, 255, 0.5) !important',
                    '&.Mui-focused': { color: 'var(--secondary) !important' }
                  },
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.03) !important',
                    color: 'white !important',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1) !important' },
                    '&:hover fieldset': { borderColor: 'var(--secondary) !important' },
                    '&.Mui-focused fieldset': { borderColor: 'var(--secondary) !important' }
                  },
                  '& .MuiOutlinedInput-input': { 
                    color: 'white !important',
                    '-webkit-text-fill-color': 'white !important'
                  }
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={forgotLoading}
                sx={{ 
                  height: 54, 
                  borderRadius: 3,
                  fontWeight: 800,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  bgcolor: 'var(--secondary) !important',
                  color: 'white !important',
                  boxShadow: '0 20px 40px rgba(82, 168, 158, 0.3) !important',
                  '&:hover': { bgcolor: '#3d7e77 !important' }
                }}
              >
                {forgotLoading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
              </Button>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', mt: 3, p: 0 }}>
          <Button 
            onClick={handleCloseForgot}
            sx={{ 
              fontWeight: 700, 
              color: 'rgba(255,255,255,0.5) !important', 
              textTransform: 'none',
              '&:hover': { color: 'white !important', bgcolor: 'transparent !important' }
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={forgotSnackbar.open}
        autoHideDuration={6000}
        onClose={() => setForgotSnackbar({ ...forgotSnackbar, open: false })}
      >
        <Alert 
          severity={forgotSnackbar.severity} 
          variant="filled"
          onClose={() => setForgotSnackbar({ ...forgotSnackbar, open: false })}
          sx={{ borderRadius: 3, fontWeight: 700 }}
        >
          {forgotSnackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Login;
