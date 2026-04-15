import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, Card, CardContent, 
  Chip, Divider, CircularProgress, Button, List, 
  ListItem, ListItemIcon, ListItemText, 
  Avatar
} from '@mui/material';
import { 
  Bed, CheckCircle, Wifi, AcUnit, Tv, 
  CleaningServices, Group, MeetingRoom, 
  ChevronLeft, Info
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const RoomDetail: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchRoomDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get('/students/me/summary');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomDetail();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const room = data?.room;
  const roommates = data?.roommates || [];

  if (!room) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>No Room Assigned</Typography>
        <Typography color="textSecondary" sx={{ mb: 4 }}>You are currently on the waitlist or your allocation is pending.</Typography>
        <Button variant="contained" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </Box>
    );
  }

  const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase();
    if (lower.includes('wifi')) return <Wifi color="primary" />;
    if (lower.includes('ac')) return <AcUnit color="primary" />;
    if (lower.includes('tv')) return <Tv color="primary" />;
    return <CheckCircle color="primary" />;
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      sx={{ maxWidth: 1000, mx: 'auto', p: 2 }}
    >
      <Button 
        startIcon={<ChevronLeft />} 
        onClick={() => navigate('/dashboard')}
        sx={{ mb: 3, fontWeight: 'bold' }}
      >
        Back to Dashboard
      </Button>

      <Grid container spacing={4}>
        <Grid xs={12} md={7}>
          <Paper sx={{ p: 4, borderRadius: 4, height: '100%', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Box>
                <Typography variant="h3" fontWeight="900" color="primary.main">Room {room.roomNumber}</Typography>
                <Typography variant="h6" color="textSecondary">Floor {room.floor} • {room.roomType || 'Standard'}</Typography>
              </Box>
              <Chip label={room.status} color={room.status === 'Available' ? 'success' : 'primary'} variant="filled" sx={{ fontWeight: 'bold' }} />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Info fontSize="small" /> Amenities & Facilities
            </Typography>
            <Grid container spacing={2}>
              {room.facilities?.map((f: string, i: number) => (
                <Grid xs={6} sm={4} key={i}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, borderRadius: 2, bgcolor: '#F1F5F9', border: '1px solid #E2E8F0' }}>
                    {getAmenityIcon(f)}
                    <Typography variant="body2" fontWeight="800" color="text.primary">{f}</Typography>
                  </Box>
                </Grid>
              ))}
              {(!room.facilities || room.facilities.length === 0) && (
                <Typography color="textSecondary" sx={{ ml: 2 }}>Basic amenities included.</Typography>
              )}
            </Grid>

            <Box sx={{ mt: 4, p: 3, borderRadius: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Room Rules</Typography>
              <List size="small">
                {['No loud music after 10 PM', 'Keep the room clean and hygienic', 'No guests allowed overnight'].map((rule, i) => (
                  <ListItem key={i} sx={{ px: 0, py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 30, color: 'inherit' }}>
                      <CheckCircle fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={rule} primaryTypographyProps={{ variant: 'body2' }} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Paper>
        </Grid>

        <Grid xs={12} md={5}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Group /> Roommates
                </Typography>
                <List>
                  {roommates.map((name: string, i: number) => (
                    <ListItem key={i} sx={{ borderBottom: i < roommates.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                      <Avatar sx={{ mr: 2, bgcolor: i % 2 === 0 ? 'secondary.main' : 'info.main', width: 32, height: 32, fontSize: '0.875rem' }}>
                        {name[0]}
                      </Avatar>
                      <ListItemText primary={name} primaryTypographyProps={{ fontWeight: 600 }} />
                      <Chip label="Allocated" size="small" variant="outlined" />
                    </ListItem>
                  ))}
                  {roommates.length === 0 && (
                    <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic', py: 2 }}>
                      No roommates assigned to this room yet.
                    </Typography>
                  )}
                </List>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 4, bgcolor: '#0F172A', color: 'white' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CleaningServices /> Maintenance
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, mb: 3 }}>
                  Need something fixed or a deep clean? Our staff is here to help.
                </Typography>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  color="inherit" 
                  onClick={() => navigate('/complaints')}
                  sx={{ borderRadius: 2, borderColor: 'rgba(255,255,255,0.3)' }}
                >
                  Request Service
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RoomDetail;
