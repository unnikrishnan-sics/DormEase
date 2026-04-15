import React ,{useEffect}from 'react';
import { Grid, Paper, Typography, Box, Card, CardContent, CircularProgress, Chip } from '@mui/material';
import { Bed, People, Receipt, Message, BarChart } from '@mui/icons-material';
import api from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const Dashboard: React.FC = () => {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/analytics/stats');
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const stats = [
    { title: 'Total Rooms', value: data?.totalRooms || 0, icon: <Bed color="primary" />, color: '#EBF5FF' },
    { title: 'Total Students', value: data?.totalStudents || 0, icon: <People color="secondary" />, color: '#E6FFFA' },
    { title: 'Recent Revenue', value: `$${data?.revenue?.recent?.toLocaleString() || 0}`, icon: <Receipt sx={{ color: '#F59E0B' }} />, color: '#FFFBEB' },
    { title: 'Active Complaints', value: data?.complaints?.active || 0, icon: <Message sx={{ color: '#EF4444' }} />, color: '#FEF2F2' },
  ];

  const occupancyData = {
    labels: ['Occupied Slots', 'Available Slots'],
    datasets: [
      {
        data: [data?.occupancy?.currentOccupancy || 0, data?.occupancy?.available || 0],
        backgroundColor: ['#2563EB', '#E5E7EB'],
        borderWidth: 0,
      },
    ],
  };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const revenueData = {
    labels: data?.revenue?.trends?.map((t: any) => monthNames[t._id.month - 1]) || [],
    datasets: [
      {
        label: 'Revenue ($)',
        data: data?.revenue?.trends?.map((t: any) => t.total) || [],
        backgroundColor: '#14B8A6',
        borderRadius: 4,
      },
    ],
  };

  return (
    <Box component={motion.div} variants={container} initial="hidden" animate="show">
      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mb: 4 }} style={{color:"black"}}>
        Business Analytics
      </Typography>

      <Paper 
        sx={{ 
          p: 8, 
          textAlign: 'center', 
          borderRadius: 6,
          background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
          border: '1px dashed',
          borderColor: 'primary.light',
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 3
        }}
        component={motion.div}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box 
          sx={{ 
            p: 3, 
            borderRadius: '50%', 
            bgcolor: 'white', 
            boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.1)',
            display: 'flex'
          }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
          >
            <BarChart sx={{ fontSize: 80, color: 'primary.main' }} />
          </motion.div>
        </Box>
        
        <Box>
          <Typography variant="h4" fontWeight="900" gutterBottom sx={{ color: '#0F172A' }}>
            Analytics Coming Soon
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ maxWidth: 500, mx: 'auto' }}>
            We're building a powerful AI-driven analytics engine to help you track revenue, occupancy, and mess performance in real-time.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Chip label="Predictive Occupancy" variant="outlined" color="primary" sx={{ fontWeight: 'bold' }} />
          <Chip label="Revenue Forecasting" variant="outlined" color="secondary" sx={{ fontWeight: 'bold' }} />
          <Chip label="AI Insights" variant="outlined" color="success" sx={{ fontWeight: 'bold' }} />
        </Box>
      </Paper>
    </Box>
  );
};


export default Dashboard;
