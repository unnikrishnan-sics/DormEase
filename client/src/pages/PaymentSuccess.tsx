import React, { useEffect } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

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
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
        }}
      >
        <Box sx={{ mb: 3 }}>
          <CheckCircle sx={{ fontSize: 80, color: '#10B981' }} />
        </Box>
        <Typography variant="h4" fontWeight="900" sx={{ mb: 1, color: '#0F172A' }}>
          Payment Successful!
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
          Your transaction has been processed securely by Stripe. Thank you for your payment!
          {sessionId && <Box component="span" sx={{ display: 'block', mt: 1, fontSize: '0.75rem', color: '#94A3B8' }}>Session ID: {sessionId.slice(0, 15)}...</Box>}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/dashboard')}
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
