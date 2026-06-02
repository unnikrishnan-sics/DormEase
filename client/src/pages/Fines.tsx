import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, Button, 
  IconButton, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, MenuItem, CircularProgress,
  Snackbar, Alert, Grid, Tooltip
} from '@mui/material';
import { 
  Add, CheckCircle, Delete, FilterList, 
  Info, History, Gavel, Search
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Fines: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin' || user?.role === 'Staff';
  const [fines, setFines] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  const [formData, setFormData] = useState({
    studentId: '',
    type: 'Late Payment',
    amount: '',
    description: '',
    paymentMethod: 'Card'
  });

  const selectedStudent = students.find(s => s._id === formData.studentId);

  const fetchFines = async () => {
    try {
      const endpoint = isAdmin ? '/fines' : '/fines/me';
      const res = await api.get(endpoint);
      setFines(res.data);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to fetch fines', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    if (!isAdmin) return;
    try {
      const res = await api.get('/students');
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFines();
    fetchStudents();
  }, [isAdmin]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFormData({ studentId: '', type: 'Late Payment', amount: '', description: '', paymentMethod: 'Card' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'studentId') {
      const student = students.find(s => s._id === value);
      setFormData({ 
        ...formData, 
        studentId: value,
        paymentMethod: student?.preferredPaymentMethod || 'Card'
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/fines', formData);
      setSnackbar({ open: true, message: 'Fine issued successfully!', severity: 'success' });
      fetchFines();
      handleClose();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Error issuing fine', severity: 'error' });
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.put(`/fines/${id}`, { status });
      setSnackbar({ open: true, message: `Fine marked as ${status}`, severity: 'success' });
      fetchFines();
    } catch (err) {
      setSnackbar({ open: true, message: 'Error updating status', severity: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this fine?')) return;
    try {
      await api.delete(`/fines/${id}`);
      setSnackbar({ open: true, message: 'Fine deleted', severity: 'success' });
      fetchFines();
    } catch (err) {
      setSnackbar({ open: true, message: 'Error deleting fine', severity: 'error' });
    }
  };

  const handlePayNow = async (fineId: string) => {
    try {
      setLoading(true);
      const res = await api.post(`/fines/${fineId}/pay`);
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Payment initiation failed', severity: 'error' });
      setLoading(false);
    }
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: '#0F172A', mb: 1 }}>Fines & Penalties</Typography>
          <Typography variant="body1" color="textSecondary">
            {isAdmin ? 'Manage and track manual penalties for residents.' : 'View your issued fines and payment status.'}
          </Typography>
        </Box>
        {isAdmin && (
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            onClick={handleOpen}
            sx={{ borderRadius: 2, px: 3, py: 1, boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}
          >
            Issue New Fine
          </Button>
        )}
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              {isAdmin && <TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell>}
              <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Method</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Reason</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date Issued</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              {isAdmin && <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={isAdmin ? 8 : 6} align="center" sx={{ py: 4 }}><CircularProgress size={30} /></TableCell></TableRow>
            ) : fines.length === 0 ? (
              <TableRow><TableCell colSpan={isAdmin ? 8 : 6} align="center" sx={{ py: 4 }}><Typography color="textSecondary">No fines found.</Typography></TableCell></TableRow>
            ) : fines.map((fine) => (
              <TableRow key={fine._id} hover>
                {isAdmin && (
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">{fine.studentId?.userId?.name}</Typography>
                    <Typography variant="caption" color="textSecondary">{fine.studentId?.studentId}</Typography>
                  </TableCell>
                )}
                <TableCell>
                  <Chip 
                    label={fine.type} 
                    size="small" 
                    variant="outlined" 
                    color={fine.type === 'Late Payment' ? 'warning' : fine.type === 'Damages' ? 'error' : 'info'}
                    sx={{ fontWeight: 'bold' }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold" color="error.main">₹{fine.amount}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600} color="primary">{fine.paymentMethod}</Typography>
                </TableCell>
                <TableCell>
                  <Tooltip title={fine.description}>
                    <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {fine.description}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{new Date(fine.issuedAt).toLocaleDateString()}</Typography>
                  <Typography variant="caption" color="textSecondary">By {fine.issuedBy?.name}</Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={fine.status} 
                    size="small" 
                    color={fine.status === 'Paid' ? 'success' : 'error'} 
                    sx={{ fontWeight: 'bold' }}
                  />
                  {!isAdmin && fine.status === 'Unpaid' && (
                    <Box sx={{ mt: 1 }}>
                      {fine.paymentMethod === 'Cash' ? (
                        <Chip label="Pay at Office" size="small" color="info" variant="outlined" sx={{ fontWeight: 'bold' }} />
                      ) : (
                        <Button 
                          size="small" 
                          variant="contained" 
                          color="primary" 
                          sx={{ py: 0, fontSize: '0.7rem' }}
                          onClick={() => handlePayNow(fine._id)}
                          disabled={loading}
                        >
                          {loading ? '...' : 'Pay Now'}
                        </Button>
                      )}
                    </Box>
                  )}
                </TableCell>
                {isAdmin && (
                  <TableCell align="right">
                    {fine.status === 'Unpaid' && (
                      <IconButton color="success" onClick={() => handleStatusUpdate(fine._id, 'Paid')}>
                        <CheckCircle />
                      </IconButton>
                    )}
                    <IconButton color="error" onClick={() => handleDelete(fine._id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Issue Fine Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 'bold' }}>Issue New Fine</DialogTitle>
          <DialogContent sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Select Student"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  required
                >
                  {students.map(s => (
                    <MenuItem key={s._id} value={s._id}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <Typography variant="body2">{s.userId?.name} ({s.studentId})</Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ ml: 2, fontWeight: 'bold' }}>
                          [Prev: {s.preferredPaymentMethod || 'N/A'}]
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
                {selectedStudent && (
                  <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'info.main', fontWeight: 'bold' }}>
                    * Previous Admission Payment Method: {selectedStudent.preferredPaymentMethod || 'Not Recorded'}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Fine Type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="Late Payment">Late Payment</MenuItem>
                  <MenuItem value="Damages">Damages</MenuItem>
                  <MenuItem value="Rule Violation">Rule Violation</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Amount (₹)"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Payment Method for Fine"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  required
                  helperText={formData.paymentMethod === 'Cash' ? 'Requires manual verification after payment' : 'Online processing available'}
                >
                  <MenuItem value="UPI">UPI</MenuItem>
                  <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="Card">Card</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason / Description"
                  name="description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="Details about the late payment or damage..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button variant="contained" type="submit" startIcon={<Gavel />}>
              Issue Penalty
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Fines;
