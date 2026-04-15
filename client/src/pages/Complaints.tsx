import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, Grid, Card, CardContent, Chip, Button, TextField, 
  List, ListItem, ListItemText, Divider, Paper, Dialog, DialogTitle, 
  DialogContent, DialogActions, MenuItem, CircularProgress, Snackbar, Alert,
  Avatar, Tooltip
} from '@mui/material';
import { 
  AutoAwesome, Warning, CheckCircle, HourglassEmpty, FilterList, 
  Search, History, Flag, Person, Category, Update, Construction
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Complaints: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin' || user?.role === 'Staff';

  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  // Filtering & Search
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog States
  const [resolveOpen, setResolveOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [resolutionData, setResolutionData] = useState({
    status: '',
    resolutionDetails: ''
  });

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get('/complaints');
      setComplaints(res.data);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to fetch complaints', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleOpenResolve = (c: any) => {
    setSelectedComplaint(c);
    setResolutionData({
      status: c.status,
      resolutionDetails: c.resolutionDetails || ''
    });
    setResolveOpen(true);
  };

  const handleUpdateStatus = async () => {
    try {
      setUpdating(true);
      await api.put(`/complaints/${selectedComplaint._id}`, resolutionData);
      setSnackbar({ open: true, message: 'Complaint updated successfully', severity: 'success' });
      setResolveOpen(false);
      fetchComplaints();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update complaint', severity: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'Urgent': return '#EF4444';
      case 'High': return '#F97316';
      case 'Medium': return '#F59E0B';
      default: return '#10B981';
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'Logged': return 'error';
      case 'In Progress': return 'warning';
      case 'Resolved': return 'success';
      case 'Closed': return 'default';
      default: return 'primary';
    }
  };

  const filteredComplaints = complaints.filter(c => {
    const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
    const matchesPriority = filterPriority === 'All' || c.priority === filterPriority;
    const matchesSearch = c.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         c.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const stats = {
    total: complaints.length,
    open: complaints.filter(c => c.status === 'Logged').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    resolved: complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Typography variant="h4" fontWeight="bold" style={{color:"black"}} sx={{ mb: 1 }}>Student Complaints</Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>Manage and resolve student issues with AI assistance.</Typography>

      <Paper 
        sx={{ 
          p: 8, 
          textAlign: 'center', 
          borderRadius: 6,
          background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
          border: '1px dashed',
          borderColor: 'warning.light',
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 3
        }}
        component={motion.div}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box 
          sx={{ 
            p: 3, 
            borderRadius: '50%', 
            bgcolor: 'white', 
            boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.1)',
            display: 'flex'
          }}
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <Construction sx={{ fontSize: 80, color: 'warning.main' }} />
          </motion.div>
        </Box>
        
        <Box>
          <Typography variant="h4" fontWeight="900" gutterBottom sx={{ color: '#0F172A' }}>
            System Under Construction
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ maxWidth: 500, mx: 'auto' }}>
            Our AI-powered grievance architect is currently offline for maintenance and upgrades. 
            We're building a smarter way to resolve student concerns.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Chip label="Smart Auto-Resolve" variant="outlined" color="warning" sx={{ fontWeight: 'bold' }} />
          <Chip label="Priority Sentiment AI" variant="outlined" color="error" sx={{ fontWeight: 'bold' }} />
          <Chip label="Automated Staff Routing" variant="outlined" color="primary" sx={{ fontWeight: 'bold' }} />
        </Box>
      </Paper>

      {/* Resolution Dialog */}
      <Dialog open={resolveOpen} onClose={() => setResolveOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Update Resolution Status</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" color="textSecondary">ISSUE DESCRIPTION</Typography>
            <Typography variant="body1" fontWeight="medium">{selectedComplaint?.description}</Typography>
          </Box>

          {selectedComplaint?.aiAnalysis && (
            <Box sx={{ mb: 4, p: 2, bgcolor: '#f0f9ff', borderRadius: 2, border: '1px solid #bae6fd' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AutoAwesome fontSize="small" color="primary" sx={{ mr: 1 }} />
                <Typography variant="caption" color="primary.main" fontWeight="bold">AI RECOMMENDED RESPONSE</Typography>
              </Box>
              <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                {selectedComplaint.aiAnalysis.suggestedResponse}
              </Typography>
            </Box>
          )}

          <Grid container spacing={2}>
            <Grid xs={12}>
              <TextField
                select
                fullWidth
                label="Current Status"
                value={resolutionData.status}
                onChange={(e) => setResolutionData({ ...resolutionData, status: e.target.value })}
              >
                <MenuItem value="Logged">Logged</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Resolved">Resolved</MenuItem>
                <MenuItem value="Closed">Closed</MenuItem>
              </TextField>
            </Grid>
            <Grid xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Resolution Details / Private Note"
                value={resolutionData.resolutionDetails}
                onChange={(e) => setResolutionData({ ...resolutionData, resolutionDetails: e.target.value })}
                placeholder="Explain how this issue was handled..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setResolveOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleUpdateStatus} 
            disabled={updating}
            sx={{ px: 4, borderRadius: 2 }}
          >
            {updating ? <CircularProgress size={24} color="inherit" /> : 'Save Resolution'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Complaints;
