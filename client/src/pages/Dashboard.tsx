import React, { useEffect, useState } from 'react';
import { 
  Grid, Paper, Typography, Box, Card, CardContent, 
  CircularProgress, Chip, Avatar, Divider, List, ListItem, ListItemText 
} from '@mui/material';
import { 
  Bed, People, Receipt, Message, CheckCircle, 
  Warning, Login, Logout, History 
} from '@mui/icons-material';
import api from '../services/api';
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

const Dashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [attendanceStats, setAttendanceStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, attendanceRes] = await Promise.all([
          api.get('/analytics/stats'),
          api.get('/attendance/stats')
        ]);
        setData(statsRes.data);
        setAttendanceStats(attendanceRes.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const stats = [
    { title: 'Total Rooms', value: data?.totalRooms || 0, icon: <Bed />, color: '#3B82F6' },
    { title: 'Total Students', value: data?.totalStudents || 0, icon: <People />, color: '#10B981' },
    { title: 'Recent Revenue', value: `$${data?.revenue?.recent?.toLocaleString() || 0}`, icon: <Receipt />, color: '#F59E0B' },
    { title: 'Active Complaints', value: data?.complaints?.active || 0, icon: <Message />, color: '#EF4444' },
  ];

  const renderAttendanceList = (list: any[], type: 'Authorized' | 'Late Entry') => (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {list.length === 0 ? (
        <Typography variant="body2" color="textSecondary" sx={{ py: 2, textAlign: 'center' }}>
          No recent records
        </Typography>
      ) : (
        list.map((log) => (
          <React.Fragment key={log._id}>
            <ListItem alignItems="flex-start" sx={{ px: 0 }}>
              <Avatar sx={{ mr: 2, bgcolor: type === 'Authorized' ? 'success.light' : 'warning.light' }}>
                {log.type === 'IN' ? <Login fontSize="small" /> : <Logout fontSize="small" />}
              </Avatar>
              <ListItemText
                primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                            {log.studentId?.userId?.name || 'Unknown'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </Typography>
                    </Box>
                }
                secondary={
                  <Typography variant="caption" display="block">
                    {log.type} • {log.status}
                  </Typography>
                }
              />
            </ListItem>
            <Divider variant="inset" component="li" />
          </React.Fragment>
        ))
      )}
    </List>
  );

  return (
    <Box component={motion.div} variants={container} initial="hidden" animate="show" sx={{ p: 1 }}>
      <Typography variant="h4" gutterBottom fontWeight="900" sx={{ mb: 4, color: '#0F172A' }}>
        Dashboard Overview
      </Typography>

      {/* Main Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title} component={motion.div} variants={item}>
            <Card sx={{ borderRadius: 4, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: `${stat.color}15`, color: stat.color, mr: 2, display: 'flex' }}>
                  {stat.icon}
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {stat.title}
                  </Typography>
                  <Typography variant="h5" fontWeight="900" sx={{ color: '#0F172A' }}>
                    {stat.value}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Attendance Widgets Section */}
      <Grid container spacing={3}>
        {/* Recent Authorized */}
        <Grid item xs={12} md={6} component={motion.div} variants={item}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle sx={{ color: 'success.main' }} />
                    <Typography variant="h6" fontWeight="bold">Recent Authorized Entries</Typography>
                </Box>
                <History 
                    sx={{ color: 'text.secondary', cursor: 'pointer', '&:hover': { color: 'primary.main' } }} 
                    onClick={() => window.location.href='/attendance'}
                />
            </Box>
            <Divider />
            {attendanceStats && renderAttendanceList(attendanceStats.authorized, 'Authorized')}
          </Paper>
        </Grid>

        {/* Recent Late/Unauthorized */}
        <Grid item xs={12} md={6} component={motion.div} variants={item}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Warning sx={{ color: 'warning.main' }} />
                    <Typography variant="h6" fontWeight="bold">Late Entry / Flagged</Typography>
                </Box>
                <Chip label="Attention Required" size="small" color="warning" sx={{ fontWeight: 'bold' }} />
            </Box>
            <Divider />
            {attendanceStats && renderAttendanceList(attendanceStats.unauthorized, 'Late Entry')}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
