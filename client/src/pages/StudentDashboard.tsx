import React, { useState, useEffect } from 'react';
import { 
  Grid, Typography, Box, Card, CardContent, Button, Divider, 
  Paper, CircularProgress, Skeleton, Alert, Snackbar, Chip, IconButton 
} from '@mui/material';
import { 
  Bed, LocalDining, Receipt, Message, AutoAwesome, 
  Warning, ChevronRight, Payments, HourglassEmpty 
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await api.get('/students/me/summary');
      setData(res.data);
    } catch (err: any) {
      setError('Failed to fetch dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const getNextMeal = () => {
    if (!data?.todayMenu) return { label: 'TBD', items: 'Menu not available' };
    const hour = new Date().getHours();
    
    if (hour < 10) return { label: 'BREAKFAST', items: data.todayMenu.breakfast.items.join(', ') };
    if (hour < 15) return { label: 'LUNCH', items: data.todayMenu.lunch.items.join(', ') };
    if (hour < 19) return { label: 'SNACKS', items: data.todayMenu.snacks.items.join(', ') };
    return { label: 'DINNER', items: data.todayMenu.dinner.items.join(', ') };
  };

  const nextMeal = getNextMeal();

  const isExpiringSoon = data?.profile?.subscriptionEndDate && 
    (new Date(data.profile.subscriptionEndDate).getTime() - new Date().getTime()) < (3 * 24 * 60 * 60 * 1000) &&
    (new Date(data.profile.subscriptionEndDate).getTime() - new Date().getTime()) > 0;

  const hasPendingBalance = data?.financials?.pendingAmount > 0;

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Skeleton variant="text" width="60%" height={60} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="40%" height={30} sx={{ mb: 6 }} />
        <Grid container spacing={3}>
          <Grid xs={12} md={7}><Skeleton variant="rectangular" height={300} sx={{ borderRadius: 4 }} /></Grid>
          <Grid xs={12} md={5}><Skeleton variant="rectangular" height={300} sx={{ borderRadius: 4 }} /></Grid>
          <Grid xs={12} md={6}><Skeleton variant="rectangular" height={100} sx={{ borderRadius: 4 }} /></Grid>
          <Grid xs={12} md={6}><Skeleton variant="rectangular" height={100} sx={{ borderRadius: 4 }} /></Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box component={motion.div} variants={container} initial="hidden" animate="show">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" fontWeight="800" sx={{ mb: 1 }}>
            Welcome back, {user?.name.split(' ')[0]}!
          </Typography>
          <Typography variant="body1" fontWeight="600" color="text.primary">
            Manage your stay and track your services in real-time.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<Warning />} 
          color="error"
          onClick={() => navigate('/complaints')}
          sx={{ borderRadius: 2 }}
        >
          Report Issue
        </Button>
      </Box>

      {hasPendingBalance && (
        <Alert 
          severity="error" 
          variant="filled" 
          icon={<Receipt />}
          sx={{ mb: 2, borderRadius: 3, fontWeight: 'bold' }}
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/payments')}>
              PAY DUES
            </Button>
          }
        >
          You have a pending balance of ${data.financials.pendingAmount.toLocaleString()}. Please clear it to avoid service restrictions.
        </Alert>
      )}

      {isExpiringSoon && (
        <Alert 
          severity="warning" 
          variant="filled" 
          icon={<Payments />}
          sx={{ mb: hasPendingBalance ? 4 : 4, borderRadius: 3, fontWeight: 'bold' }}
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/payments')}>
              RENEW NOW
            </Button>
          }
        >
          Your current stay package is expiring on {new Date(data.profile.subscriptionEndDate).toLocaleDateString()}. Please renew soon to avoid allocation issues.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Room Status */}
        <Grid xs={12} md={7} component={motion.div} variants={item}>
          <Card sx={{ height: '100%', borderRadius: 4, position: 'relative', overflow: 'hidden', border: '1px solid #f0f0f0', boxShadow: '0 4px 12px 0 rgba(0,0,0,0.02)' }}>
            <Box sx={{ position: 'absolute', top: -20, right: -20, p: 3, opacity: 0.05 }}>
              <Bed sx={{ fontSize: 200 }} />
            </Box>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Typography variant="h6" fontWeight="900" color="text.primary">My Residence</Typography>
                <Chip 
                  label={data?.profile?.bookingStatus || 'N/A'} 
                  color={data?.profile?.bookingStatus === 'Allocated' ? 'success' : 'warning'} 
                  size="small" 
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>
              
              <Typography variant="h3" color="primary.main" fontWeight="900" sx={{ my: 2 }}>
                {data?.room?.roomNumber ? `Room ${data.room.roomNumber}` : 'Waitlisted'}
              </Typography>

              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid xs={6}>
                  <Typography variant="caption" color="text.primary" fontWeight="800" display="block">ROOM TYPE</Typography>
                  <Typography variant="body1" fontWeight="900" color="primary.main">{data?.room?.roomType || 'Standard'}</Typography>
                </Grid>
                <Grid xs={6}>
                  <Typography variant="caption" color="text.primary" fontWeight="800" display="block">FLOOR</Typography>
                  <Typography variant="body1" fontWeight="900" color="primary.main">Floor {data?.room?.floor || 'N/A'}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.primary" fontWeight="800" display="block" sx={{ mb: 0.5 }}>ROOMMATES</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {data?.roommates?.length > 0 ? (
                      data.roommates.map((name: string, i: number) => (
                        <Chip key={i} label={name} size="small" variant="soft" sx={{ fontSize: '0.75rem' }} />
                      ))
                    ) : (
                      <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>No roommates yet</Typography>
                    )}
                  </Box>
                </Box>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => navigate('/rooms')}
                  sx={{ borderRadius: 2 }}
                >
                  View Detail
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Payments */}
        <Grid xs={12} md={5} component={motion.div} variants={item}>
          <Card sx={{ height: '100%', borderRadius: 4, bgcolor: 'primary.main', color: 'white', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}>
              <Payments sx={{ fontSize: 180 }} />
            </Box>
            <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Pending Balance</Typography>
              <Typography variant="h3" fontWeight="900" sx={{ my: 2 }}>
                ${data?.financials?.pendingAmount?.toLocaleString() || '0.00'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 4 }}>
                {data?.financials?.pendingAmount > 0 
                  ? 'Please clear your dues to avoid late fees.' 
                  : 'All your dues are cleared. Great job!'}
              </Typography>
              <Box sx={{ mt: 'auto' }}>
                <Button 
                  fullWidth 
                  variant="contained" 
                  onClick={() => navigate('/payments')}
                  sx={{ 
                    bgcolor: 'white', 
                    color: 'primary.main',
                    fontWeight: 900,
                    py: 1.5,
                    borderRadius: 2,
                    '&:hover': { bgcolor: '#f0f0f0' }
                  }}
                  startIcon={<Receipt />}
                >
                  {data?.financials?.pendingAmount > 0 ? 'Pay Now' : 'View History'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Next Meal */}
        <Grid xs={12} md={6} component={motion.div} variants={item}>
          <Paper sx={{ p: 3, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 3, border: '1px solid #f0f0f0', boxShadow: 'none' }}>
            <Box sx={{ p: 2, bgcolor: 'rgba(20, 184, 166, 0.1)', borderRadius: 3, display: 'flex' }}>
              <LocalDining sx={{ color: '#14B8A6' }} fontSize="large" />
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="caption" color="text.primary" fontWeight="900" sx={{ letterSpacing: 1 }}>NEXT MEAL: {nextMeal.label}</Typography>
              <Typography variant="h6" fontWeight="900" color="primary.dark">{nextMeal.items}</Typography>
            </Box>
            <IconButton onClick={() => navigate('/mess')}><ChevronRight /></IconButton>
          </Paper>
        </Grid>

        {/* Complaints Status */}
        <Grid xs={12} md={6} component={motion.div} variants={item}>
          <Paper sx={{ p: 3, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 3, border: '1px solid #f0f0f0', boxShadow: 'none' }}>
            <Box sx={{ p: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', borderRadius: 3, display: 'flex' }}>
              <Message sx={{ color: '#EF4444' }} fontSize="large" />
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="caption" color="text.primary" fontWeight="900" sx={{ letterSpacing: 1 }}>RECENT COMPLAINT</Typography>
              {data?.latestComplaint ? (
                <>
                  <Typography variant="h6" fontWeight="800" noWrap sx={{ maxWidth: 200 }}>{data.latestComplaint.description}</Typography>
                  <Typography variant="caption" sx={{ 
                    fontWeight: 900, 
                    color: data.latestComplaint.status === 'Resolved' ? 'success.main' : 'warning.main',
                    letterSpacing: 0.5
                  }}>
                    {data.latestComplaint.status.toUpperCase()}
                  </Typography>
                </>
              ) : (
                <Typography variant="h6" fontWeight="800" color="textSecondary">No active issues</Typography>
              )}
            </Box>
            <IconButton onClick={() => navigate('/complaints')}><ChevronRight /></IconButton>
          </Paper>
        </Grid>

        {/* AI Insight */}
        <AnimatePresence>
          {data?.room && (
            <Grid xs={12} component={motion.div} variants={item} layout>
              <Paper sx={{ 
                p: 3, 
                borderRadius: 4, 
                background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
                border: '1px solid #bae6fd',
                display: 'flex',
                alignItems: 'center',
                gap: 2.5,
                boxShadow: 'none'
              }}>
                <Box sx={{ p: 1.5, bgcolor: 'primary.main', borderRadius: '50%', color: 'white', display: 'flex' }}>
                  <AutoAwesome fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="primary.main" fontWeight="800">SMART RESIDENCE INSIGHT</Typography>
                  <Typography variant="body2" color="text.primary" fontWeight="500">
                    Welcome to **Room {data.room.roomNumber}**. You have **{data.roommates.length}** awesome roommate(s). 
                    Your room is a **{data.room.roomType}** - make sure to check the room guidelines soon!
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          )}
        </AnimatePresence>
      </Grid>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>{error}</Alert>
      </Snackbar>
    </Box>
  );
};

export default StudentDashboard;
