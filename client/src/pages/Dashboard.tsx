import React from 'react';
import { Grid, Paper, Typography, Box, Card, CardContent } from '@mui/material';
import { Bed, People, Receipt, Message } from '@mui/icons-material';
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
  const stats = [
    { title: 'Total Rooms', value: '45', icon: <Bed color="primary" />, color: '#EBF5FF' },
    { title: 'Total Students', value: '120', icon: <People color="secondary" />, color: '#E6FFFA' },
    { title: 'Pending Dues', value: '$1,200', icon: <Receipt sx={{ color: '#F59E0B' }} />, color: '#FFFBEB' },
    { title: 'Active Complaints', value: '8', icon: <Message sx={{ color: '#EF4444' }} />, color: '#FEF2F2' },
  ];

  const occupancyData = {
    labels: ['Occupied', 'Available'],
    datasets: [
      {
        data: [120, 30],
        backgroundColor: ['#2563EB', '#E5E7EB'],
        borderWidth: 0,
      },
    ],
  };

  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: [5000, 5500, 6000, 5800, 6500, 7000],
        backgroundColor: '#14B8A6',
        borderRadius: 4,
      },
    ],
  };

  return (
    <Box component={motion.div} variants={container} initial="hidden" animate="show">
      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mb: 4 }}>
        Overview
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title} component={motion.div} variants={item}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' }
            }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  backgroundColor: stat.color, 
                  display: 'flex', 
                  mr: 2 
                }}>
                  {stat.icon}
                </Box>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    {stat.title}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {stat.value}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4} component={motion.div} variants={item}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Occupancy Rate
            </Typography>
            <Box sx={{ height: 250, display: 'flex', justifyContent: 'center' }}>
              <Doughnut data={occupancyData} options={{ maintainAspectRatio: false, cutout: '70%' }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8} component={motion.div} variants={item}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Revenue Trends
            </Typography>
            <Box sx={{ height: 250 }}>
              <Bar 
                data={revenueData} 
                options={{ 
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true } }
                }} 
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};


export default Dashboard;
