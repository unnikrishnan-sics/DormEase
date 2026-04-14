import React from 'react';
import { Grid, Typography, Box, Card, CardContent, Button, Divider, Paper } from '@mui/material';
import { Bed, LocalDining, Receipt, Message, AutoAwesome, Warning } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <Box component={motion.div} variants={container} initial="hidden" animate="show">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="800" sx={{ mb: 1 }}>
          Welcome back, {user?.name.split(' ')[0]}!
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Here is what's happening at DormEase today.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Room Status */}
        <Grid item xs={12} md={7} component={motion.div} variants={item}>
          <Card sx={{ height: '100%', borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', top: 0, right: 0, p: 3, opacity: 0.1 }}>
              <Bed sx={{ fontSize: 120 }} />
            </Box>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>My Residence</Typography>
              <Typography variant="h3" color="primary.main" fontWeight="900" sx={{ my: 2 }}>Room 204</Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary" display="block">ROOM TYPE</Typography>
                  <Typography variant="body1" fontWeight="bold">Double Sharing</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary" display="block">STATUS</Typography>
                  <Typography variant="body1" fontWeight="bold" color="success.main">Allocated</Typography>
                </Grid>
              </Grid>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="textSecondary">ROOMMATES</Typography>
                  <Typography variant="body2" fontWeight="medium">Kevin Peters</Typography>
                </Box>
                <Button variant="outlined" size="small">View Room Details</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Payments */}
        <Grid item xs={12} md={5} component={motion.div} variants={item}>
          <Card sx={{ height: '100%', borderRadius: 4, bgcolor: 'primary.main', color: 'white' }}>
            <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Pending Balance</Typography>
              <Typography variant="h3" fontWeight="900" sx={{ my: 2 }}>$450.00</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 4 }}>
                Next payment due by April 20th, 2026.
              </Typography>
              <Box sx={{ mt: 'auto' }}>
                <Button 
                  fullWidth 
                  variant="contained" 
                  sx={{ 
                    bgcolor: 'white', 
                    color: 'primary.main',
                    fontWeight: 'bold',
                    '&:hover': { bgcolor: '#f0f0f0' }
                  }}
                  startIcon={<Receipt />}
                >
                  Pay Now
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Next Meal */}
        <Grid item xs={12} md={6} component={motion.div} variants={item}>
          <Paper sx={{ p: 3, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ p: 2, bgcolor: 'secondary.light', borderRadius: 3 }}>
              <LocalDining color="secondary" fontSize="large" />
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="caption" color="textSecondary" fontWeight="bold">NEXT MEAL: DINNER</Typography>
              <Typography variant="h6" fontWeight="bold">Roti, Dal Tadka, Chicken Curry</Typography>
            </Box>
            <Button variant="text" color="secondary">Full Menu</Button>
          </Paper>
        </Grid>

        {/* Complaints Status */}
        <Grid item xs={12} md={6} component={motion.div} variants={item}>
          <Paper sx={{ p: 3, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ p: 2, bgcolor: 'error.light', borderRadius: 3 }}>
              <Message sx={{ color: 'error.main' }} fontSize="large" />
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="caption" color="textSecondary" fontWeight="bold">RECENT COMPLAINT</Typography>
              <Typography variant="h6" fontWeight="bold">AC Not Working</Typography>
              <Typography variant="caption" color="warning.main" fontWeight="bold">IN PROGRESS</Typography>
            </Box>
            <Button variant="text" color="error">Track All</Button>
          </Paper>
        </Grid>

        {/* AI Insight */}
        <Grid item xs={12} component={motion.div} variants={item}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: 4, 
            bgcolor: '#F0F9FF', 
            border: '1px solid', 
            borderColor: 'primary.light',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <AutoAwesome color="primary" />
            <Typography variant="body2" color="primary.dark" fontWeight="500">
              <strong>DormEase AI Insight:</strong> Based on your electricity usage, you could save $15 this month by turning off the AC 1 hour earlier.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;
