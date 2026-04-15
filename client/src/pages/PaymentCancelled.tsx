import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { CancelOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const PaymentCancelled: React.FC = () => {
  const navigate = useNavigate();

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
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
          borderTop: '6px solid #EF4444'
        }}
      >
        <Box sx={{ mb: 3 }}>
          <CancelOutlined sx={{ fontSize: 80, color: '#EF4444' }} />
        </Box>
        <Typography variant="h4" fontWeight="900" sx={{ mb: 1, color: '#0F172A' }}>
          Payment Cancelled
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
          Your payment process was interrupted or cancelled. No charges were made to your card.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            color="error" 
            onClick={() => navigate('/payments')}
            sx={{ fontWeight: 'bold', borderRadius: 2 }}
          >
            Try Again
          </Button>
          <Button 
            variant="outlined" 
            color="inherit"
            onClick={() => navigate('/dashboard')}
            sx={{ fontWeight: 'bold', borderRadius: 2 }}
          >
            Dashboard
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default PaymentCancelled;
