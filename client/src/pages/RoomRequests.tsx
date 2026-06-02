import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, Card, CardContent, 
  Button, TextField, MenuItem, CircularProgress, 
  Chip, List, ListItem, ListItemText, Divider, Alert,
  IconButton, Tooltip
} from '@mui/material';
import { 
  SwapHoriz, History as HistoryIcon, Bed, Info, CheckCircle, 
  Pending, Cancel, ChevronLeft 
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const RoomRequests: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    requestedRoomId: '',
    reason: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryRes, roomsRes, requestsRes] = await Promise.all([
        api.get('/students/me/summary'),
        api.get('/rooms'),
        api.get('/room-requests/my')
      ]);
      setSummary(summaryRes.data);
      setRooms(roomsRes.data.filter((r: any) => r._id !== summaryRes.data.room?._id && r.currentOccupancy < r.totalCapacity));
      setRequests(requestsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.requestedRoomId || !formData.reason) {
      setError('Please fill all fields');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await api.post('/room-requests', formData);
      setSuccess('Request submitted successfully!');
      setFormData({ requestedRoomId: '', reason: '' });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error submitting request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const currentRoom = summary?.room;

  return (
    <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} sx={{ maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="900" sx={{ color: '#0F172A' }}>Room Change Request</Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5, fontWeight: 500 }}>
            Request a swap to a different room based on availability.
          </Typography>
        </Box>
        <Button startIcon={<ChevronLeft />} onClick={() => navigate('/dashboard')}>Back</Button>
      </Box>

      <Grid container spacing={4}>
        <Grid xs={12} md={6}>
          <Paper sx={{ p: 4, borderRadius: 4, border: '1px solid #E2E8F0' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SwapHoriz color="primary" /> Submit New Request
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {!currentRoom ? (
              <Alert severity="warning">You must have an allocated room to request a change.</Alert>
            ) : (
              <form onSubmit={handleSubmit}>
                <Box sx={{ mb: 3, p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px dashed #CBD5E1' }}>
                  <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}>CURRENT ROOM</Typography>
                  <Typography variant="h6" fontWeight="bold">Room {currentRoom.roomNumber}</Typography>
                  <Typography variant="body2" color="textSecondary">Floor {currentRoom.floor}</Typography>
                </Box>

                <TextField
                  select
                  fullWidth
                  label="Select New Room"
                  value={formData.requestedRoomId}
                  onChange={(e) => setFormData({ ...formData, requestedRoomId: e.target.value })}
                  sx={{ mb: 3 }}
                  disabled={submitting}
                >
                  {rooms.map((room) => (
                    <MenuItem key={room._id} value={room._id}>
                      Room {room.roomNumber} - Floor {room.floor} ({room.totalCapacity - room.currentOccupancy} spaces left)
                    </MenuItem>
                  ))}
                  {rooms.length === 0 && <MenuItem disabled>No available rooms with capacity found</MenuItem>}
                </TextField>

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Reason for Change"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  sx={{ mb: 3 }}
                  disabled={submitting}
                  placeholder="e.g., Preference for higher floor, medical reasons, etc."
                />

                <Button 
                  fullWidth 
                  variant="contained" 
                  type="submit" 
                  disabled={submitting || !formData.requestedRoomId}
                  sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </form>
            )}
          </Paper>
        </Grid>

        <Grid xs={12} md={6}>
          <Paper sx={{ p: 4, borderRadius: 4, border: '1px solid #E2E8F0', height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <HistoryIcon color="primary" /> Request History
            </Typography>

            <List>
              <AnimatePresence>
                {requests.map((req, i) => (
                  <motion.div
                    key={req._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card sx={{ mb: 2, border: '1px solid #F1F5F9', boxShadow: 'none' }}>
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Bed fontSize="small" color="action" />
                            <Typography variant="subtitle2" fontWeight="bold">
                              {req.currentRoomId?.roomNumber} → {req.requestedRoomId?.roomNumber}
                            </Typography>
                          </Box>
                          <Chip 
                            label={req.status} 
                            size="small" 
                            color={req.status === 'Approved' ? 'success' : req.status === 'Rejected' ? 'error' : 'warning'}
                            icon={req.status === 'Approved' ? <CheckCircle /> : req.status === 'Pending' ? <Pending /> : <Cancel />}
                            sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
                          />
                        </Box>
                        
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1, display: 'block' }}>
                          Reason: {req.reason}
                        </Typography>

                        {req.adminComment && (
                          <Box sx={{ mt: 1, p: 1, bgcolor: '#F8FAFC', borderRadius: 1, borderLeft: '3px solid #64748B' }}>
                            <Typography variant="caption" color="textSecondary" fontWeight="bold">ADMIN COMMENT:</Typography>
                            <Typography variant="body2">{req.adminComment}</Typography>
                          </Box>
                        )}

                        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                          Submitted on {new Date(req.createdAt).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {requests.length === 0 && (
                <Box sx={{ py: 6, textAlign: 'center' }}>
                  <Typography color="textSecondary">No previous requests found.</Typography>
                </Box>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RoomRequests;
