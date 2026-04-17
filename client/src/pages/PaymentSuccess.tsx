import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, CircularProgress } from '@mui/material';
import { CheckCircle, Warning } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const [verifying, setVerifying] = useState(!!sessionId);
  const [status, setStatus] = useState<'success' | 'error' | 'verifying'>(sessionId ? 'verifying' : 'success');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) return;
      
      try {
        setVerifying(true);
        const res = await api.get(`/payments/verify/${sessionId}`);
        if (res.data.success) {
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch (err) {
        console.error('Verification error:', err);
        setStatus('error');
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        bgcolor: '#f8fafc' 
      }}
    >
      <Paper 
        component={motion.div}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        sx={{ 
          p: 6, 
          textAlign: 'center', 
          borderRadius: 4, 
          maxWidth: 400,
          width: '90%',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
        }}
      >
        <Box sx={{ mb: 3 }}>
          {status === 'verifying' ? (
            <CircularProgress size={80} />
          ) : status === 'success' ? (
            <CheckCircle sx={{ fontSize: 80, color: '#10B981' }} />
          ) : (
            <Warning sx={{ fontSize: 80, color: '#EF4444' }} />
          )}
        </Box>

        <Typography variant="h4" fontWeight="900" sx={{ mb: 1, color: '#0F172A' }}>
          {status === 'verifying' ? 'Verifying...' : 
           status === 'success' ? 'Payment Successful!' : 
           'Status Uncertain'}
        </Typography>

        <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
          {status === 'verifying' ? 'We are confirming your transaction with Stripe. Please hold on.' :
           status === 'success' ? 'Your transaction has been processed securely. Your residency status and records are now updated!' :
           'Your payment might be processed, but we couldn\'t confirm it instantly. Please check your dashboard in a few minutes.'}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexDirection: { xs: 'column', sm: 'row' } }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/dashboard')}
            disabled={verifying}
            sx={{ fontWeight: 'bold', borderRadius: 2 }}
          >
            Go to Dashboard
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/payments')}
            sx={{ fontWeight: 'bold', borderRadius: 2 }}
          >
            View Payments
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default PaymentSuccess;
