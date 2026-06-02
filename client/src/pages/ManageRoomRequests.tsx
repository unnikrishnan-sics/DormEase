import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, Card, CardContent, 
  Button, CircularProgress, Chip, TextField,
  List, ListItem, ListItemText, Divider, Alert,
  Avatar, Dialog, DialogTitle, DialogContent, 
  DialogActions, DialogContentText
} from '@mui/material';
import { 
  ChevronLeft, Person, Bed, Chat, History as HistoryIcon,
  SwapHoriz, CheckCircle, Pending, Cancel
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ManageRoomRequests: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [actionType, setActionType] = useState<'Approved' | 'Rejected' | null>(null);
  const [adminComment, setAdminComment] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/room-requests');
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleActionClick = (req: any, type: 'Approved' | 'Rejected') => {
    setSelectedRequest(req);
    setActionType(type);
    setOpenDialog(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedRequest || !actionType) return;

    try {
      setProcessing(true);
      setError('');
      await api.put(`/room-requests/${selectedRequest._id}`, {
        status: actionType,
        adminComment
      });
      setOpenDialog(false);
      setAdminComment('');
      fetchRequests();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error processing request');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'Pending');
  const pastRequests = requests.filter(r => r.status !== 'Pending');

  return (
    <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="900" sx={{ color: '#0F172A' }}>Room Change Management</Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5, fontWeight: 500 }}>
            Review and process student requests for room swaps.
          </Typography>
        </Box>
        <Button startIcon={<ChevronLeft />} onClick={() => navigate('/dashboard')}>Back</Button>
      </Box>

      <Grid container spacing={4}>
        <Grid xs={12} lg={8}>
          <Paper sx={{ p: 4, borderRadius: 4, border: '1px solid #E2E8F0' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Pending color="warning" /> Pending Requests ({pendingRequests.length})
            </Typography>

            <List>
              <AnimatePresence>
                {pendingRequests.map((req, i) => (
                  <motion.div
                    key={req._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card sx={{ mb: 3, border: '1px solid #F1F5F9', boxShadow: 'none', '&:hover': { borderColor: 'primary.main' } }}>
                      <CardContent sx={{ p: 3 }}>
                        <Grid container spacing={2}>
                          <Grid xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                              <Avatar sx={{ bgcolor: 'primary.main' }}>{req.studentId?.userId?.name[0]}</Avatar>
                              <Box>
                                <Typography variant="subtitle1" fontWeight="bold">{req.studentId?.userId?.name}</Typography>
                                <Typography variant="caption" color="textSecondary">{req.studentId?.userId?.email}</Typography>
                              </Box>
                            </Box>
                            <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                              <Typography variant="caption" color="textSecondary" fontWeight="bold" sx={{ display: 'block', mb: 1 }}>REASON FOR CHANGE:</Typography>
                              <Typography variant="body2">{req.reason}</Typography>
                            </Box>
                          </Grid>

                          <Grid xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, height: '100%', flexDirection: { xs: 'row', sm: 'column' } }}>
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="caption" color="textSecondary" fontWeight="bold">CURRENT</Typography>
                                <Paper variant="outlined" sx={{ px: 2, py: 1, borderRadius: 2, mt: 0.5, bgcolor: '#FFF1F2' }}>
                                  <Typography fontWeight="bold">Room {req.currentRoomId?.roomNumber}</Typography>
                                </Paper>
                              </Box>
                              <SwapHoriz sx={{ color: '#94A3B8', fontSize: 32 }} />
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="caption" color="textSecondary" fontWeight="bold">REQUESTED</Typography>
                                <Paper variant="outlined" sx={{ px: 2, py: 1, borderRadius: 2, mt: 0.5, bgcolor: '#F0F9FF' }}>
                                  <Typography fontWeight="bold" color="primary.main">Room {req.requestedRoomId?.roomNumber}</Typography>
                                </Paper>
                              </Box>
                            </Box>
                          </Grid>

                          <Grid xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                              <Button 
                                variant="outlined" 
                                color="error" 
                                startIcon={<Cancel />}
                                onClick={() => handleActionClick(req, 'Rejected')}
                                sx={{ borderRadius: 2 }}
                              >
                                Reject
                              </Button>
                              <Button 
                                variant="contained" 
                                color="success" 
                                startIcon={<CheckCircle />}
                                onClick={() => handleActionClick(req, 'Approved')}
                                sx={{ borderRadius: 2 }}
                              >
                                Approve
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {pendingRequests.length === 0 && (
                <Box sx={{ py: 8, textAlign: 'center' }}>
                  <Typography color="textSecondary">All caught up! No pending requests.</Typography>
                </Box>
              )}
            </List>
          </Paper>
        </Grid>

        <Grid xs={12} lg={4}>
          <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #E2E8F0' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <HistoryIcon color="primary" /> Recent Decisions
            </Typography>
            <List>
              {pastRequests.map((req) => (
                <Card key={req._id} sx={{ mb: 2, bgcolor: '#F8FAFC', border: '1px solid #F1F5F9', boxShadow: 'none' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight="bold">{req.studentId?.userId?.name}</Typography>
                      <Chip 
                        label={req.status} 
                        size="small" 
                        color={req.status === 'Approved' ? 'success' : 'error'}
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    </Box>
                    <Typography variant="caption" display="block" color="textSecondary">
                      {req.currentRoomId?.roomNumber} → {req.requestedRoomId?.roomNumber}
                    </Typography>
                    {req.adminComment && (
                      <Box sx={{ mt: 1, p: 1, borderLeft: '2px solid #CBD5E1' }}>
                        <Typography variant="caption" sx={{ fontStyle: 'italic' }}>"{req.adminComment}"</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
              {pastRequests.length === 0 && (
                <Typography variant="body2" color="textSecondary" align="center">No history yet.</Typography>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Action Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {actionType === 'Approved' ? 'Approve Room Change' : 'Reject Room Change'}
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <DialogContentText sx={{ mb: 3 }}>
            You are about to {actionType?.toLowerCase()} the request for <strong>{selectedRequest?.studentId?.userId?.name}</strong> to move from Room {selectedRequest?.currentRoomId?.roomNumber} to Room {selectedRequest?.requestedRoomId?.roomNumber}.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Admin Comment"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={adminComment}
            onChange={(e) => setAdminComment(e.target.value)}
            placeholder={actionType === 'Approved' ? "e.g., Request approved based on medical preference." : "e.g., Requested room is reserved for maintenance."}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)} disabled={processing}>Cancel</Button>
          <Button 
            onClick={handleConfirmAction} 
            variant="contained" 
            color={actionType === 'Approved' ? 'success' : 'error'}
            disabled={processing}
          >
            {processing ? 'Processing...' : `Confirm ${actionType}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageRoomRequests;
