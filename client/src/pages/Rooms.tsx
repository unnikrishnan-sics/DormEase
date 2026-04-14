import React from 'react';
import { Typography, Box, Grid, Card, CardContent, Chip, Button, IconButton } from '@mui/material';
import { Add, Edit, Delete, Wifi, AcUnit, Tv } from '@mui/icons-material';

import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const item = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1 }
};

const Rooms: React.FC = () => {
  const rooms = [
    { id: 1, number: '101', type: 'Double', price: 500, status: 'Available', facilities: ['WiFi', 'AC'] },
    { id: 2, number: '102', type: 'Single', price: 700, status: 'Full', facilities: ['WiFi', 'AC', 'TV'] },
    { id: 3, number: '103', type: 'Double', price: 500, status: 'Maintenance', facilities: ['WiFi'] },
    { id: 4, number: '201', type: 'Triple', price: 400, status: 'Available', facilities: ['WiFi', 'AC'] },
    { id: 5, number: '202', type: 'Double', price: 500, status: 'Available', facilities: ['WiFi', 'AC'] },
    { id: 6, number: '301', type: 'Single', price: 750, status: 'Available', facilities: ['WiFi', 'AC', 'TV', 'Minibar'] },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'success';
      case 'Full': return 'error';
      case 'Maintenance': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box component={motion.div} variants={container} initial="hidden" animate="show">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">Rooms</Typography>
        <Button variant="contained" startIcon={<Add />} sx={{ boxShadow: 3 }}>Add Room</Button>
      </Box>

      <Grid container spacing={3}>
        {rooms.map((room) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={room.id} component={motion.div} variants={item}>
            <Card sx={{ 
              height: '100%',
              transition: 'all 0.3s ease',
              '&:hover': { 
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
              }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h5" fontWeight="bold">Room {room.number}</Typography>
                  <Chip label={room.status} color={getStatusColor(room.status) as any} size="small" />
                </Box>
                
                <Typography color="textSecondary" gutterBottom>{room.type} Sharing</Typography>
                <Typography variant="h6" color="primary.main" fontWeight="bold" sx={{ mb: 2 }}>
                  ${room.price}/month
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                  {room.facilities.includes('WiFi') && <Wifi fontSize="small" color="action" />}
                  {room.facilities.includes('AC') && <AcUnit fontSize="small" color="action" />}
                  {room.facilities.includes('TV') && <Tv fontSize="small" color="action" />}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <IconButton size="small" color="primary"><Edit fontSize="small" /></IconButton>
                  <IconButton size="small" color="error"><Delete fontSize="small" /></IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};


export default Rooms;
