import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, Grid, Card, CardContent, Chip, Button, TextField, 
  Divider, Paper, Dialog, DialogTitle, DialogContent, 
  DialogActions, MenuItem, CircularProgress, Snackbar, Alert,
  Avatar, IconButton, InputAdornment
} from '@mui/material';
import { 
  Warning, CheckCircle, HourglassEmpty, Search, 
  History as HistoryIcon, Flag, Update, Add, ChevronLeft
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Complaints: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin' || user?.role === 'Staff';

  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  // Filtering & Search
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog States
  const [resolveOpen, setResolveOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  
  const [newComplaint, setNewComplaint] = useState({
    category: 'Room',
    priority: 'Medium',
    description: ''
  });

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

  const handleSubmitComplaint = async () => {
    if (!newComplaint.description) return;
    try {
      setSubmitting(true);
      await api.post('/complaints', newComplaint);
      setSnackbar({ open: true, message: 'Complaint submitted successfully!', severity: 'success' });
      setSubmitOpen(false);
      setNewComplaint({ category: 'Room', priority: 'Medium', description: '' });
      fetchComplaints();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to submit complaint', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

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

  const getStatusIcon = (s: string) => {
    switch (s) {
      case 'Logged': return <Flag fontSize="small" />;
      case 'In Progress': return <Update fontSize="small" />;
      case 'Resolved': return <CheckCircle fontSize="small" />;
      case 'Closed': return <HourglassEmpty fontSize="small" />;
      default: return <HistoryIcon fontSize="small" />;
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
    <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="900" sx={{ color: '#0F172A' }}>Grievance Dashboard</Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            {isAdmin ? 'Manage and resolve student issues.' : 'Report issues and track their resolution status.'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button startIcon={<ChevronLeft />} onClick={() => navigate('/dashboard')}>Back</Button>
          {!isAdmin && (
            <Button 
              variant="contained" 
              startIcon={<Add />} 
              onClick={() => setSubmitOpen(true)}
              sx={{ borderRadius: 3, px: 3, py: 1.2, fontWeight: 'bold' }}
            >
              File Complaint
            </Button>
          )}
        </Box>
      </Box>

      {/* Stats Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Requests', value: stats.total, color: 'primary.main', icon: <HistoryIcon /> },
          { label: 'Pending Action', value: stats.open, color: 'error.main', icon: <Warning /> },
          { label: 'In Progress', value: stats.inProgress, color: 'warning.main', icon: <Update /> },
          { label: 'Resolved', value: stats.resolved, color: 'success.main', icon: <CheckCircle /> }
        ].map((stat, i) => (
          <Grid xs={12} sm={6} md={3} key={i}>
            <Card sx={{ borderRadius: 4, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
              <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: `${stat.color}15`, color: stat.color, display: 'flex' }}>
                  {stat.icon}
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold">{stat.value}</Typography>
                  <Typography variant="caption" color="textSecondary" fontWeight="bold">{stat.label.toUpperCase()}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 4, borderRadius: 4, border: '1px solid #E2E8F0', boxShadow: 'none', display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Search complaints..."
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flexGrow: 1, minWidth: '200px' }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          select
          size="small"
          label="Status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          sx={{ minWidth: '150px' }}
        >
          <MenuItem value="All">All Status</MenuItem>
          <MenuItem value="Logged">Logged</MenuItem>
          <MenuItem value="In Progress">In Progress</MenuItem>
          <MenuItem value="Resolved">Resolved</MenuItem>
          <MenuItem value="Closed">Closed</MenuItem>
        </TextField>
        <TextField
          select
          size="small"
          label="Priority"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          sx={{ minWidth: '150px' }}
        >
          <MenuItem value="All">All Priority</MenuItem>
          <MenuItem value="Urgent">Urgent</MenuItem>
          <MenuItem value="High">High</MenuItem>
          <MenuItem value="Medium">Medium</MenuItem>
          <MenuItem value="Low">Low</MenuItem>
        </TextField>
      </Paper>

      {/* Complaints List */}
      <Grid container spacing={3}>
        {loading ? (
          <Grid xs={12} sx={{ textAlign: 'center', py: 10 }}>
            <CircularProgress />
          </Grid>
        ) : filteredComplaints.length > 0 ? (
          filteredComplaints.map((c, i) => (
            <Grid xs={12} key={c._id}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card sx={{ borderRadius: 4, border: '1px solid #E2E8F0', boxShadow: 'none', '&:hover': { borderColor: 'primary.main' } }}>
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                      <Grid xs={12} md={9}>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                          <Chip 
                            label={c.status} 
                            size="small" 
                            color={c.status === 'Logged' ? 'error' : c.status === 'Resolved' ? 'success' : 'warning'}
                            icon={getStatusIcon(c.status)}
                            sx={{ fontWeight: 'bold' }}
                          />
                          <Chip 
                            label={c.priority} 
                            size="small" 
                            sx={{ bgcolor: `${getPriorityColor(c.priority)}15`, color: getPriorityColor(c.priority), fontWeight: 'bold' }}
                          />
                          <Chip label={c.category} size="small" variant="outlined" sx={{ fontWeight: 'bold' }} />
                        </Box>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>{c.description}</Typography>
                        
                        {isAdmin && c.userId && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: 'primary.main' }}>{c.userId.name[0]}</Avatar>
                            <Typography variant="caption" fontWeight="bold">{c.userId.name} • {c.userId.email}</Typography>
                          </Box>
                        )}
                        
                        {!isAdmin && c.resolutionDetails && (
                          <Box sx={{ mt: 2, p: 2, bgcolor: '#F0F9FF', borderRadius: 2, borderLeft: '4px solid #0EA5E9' }}>
                            <Typography variant="caption" color="primary.main" fontWeight="bold">RESOLUTION NOTES</Typography>
                            <Typography variant="body2">{c.resolutionDetails}</Typography>
                          </Box>
                        )}
                      </Grid>

                      <Grid xs={12} md={3} sx={{ display: 'flex', alignItems: 'center', justifyContent: { md: 'flex-end' }, borderLeft: { md: '1px solid #E2E8F0' }, pl: { md: 4 } }}>
                        {isAdmin ? (
                          <Button 
                            variant="contained" 
                            onClick={() => handleOpenResolve(c)}
                            sx={{ borderRadius: 2, fontWeight: 'bold', px: 3 }}
                          >
                            Take Action
                          </Button>
                        ) : (
                          <Box sx={{ textAlign: 'center', width: '100%' }}>
                            <Typography variant="caption" color="textSecondary" fontWeight="bold" display="block">STATUS</Typography>
                            <Typography variant="body2" fontWeight="bold">{c.status}</Typography>
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))
        ) : (
          <Grid xs={12} sx={{ textAlign: 'center', py: 10 }}>
            <Typography color="textSecondary">No complaints found matching your criteria.</Typography>
          </Grid>
        )}
      </Grid>

      {/* Submit Dialog */}
      <Dialog open={submitOpen} onClose={() => setSubmitOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>File New Complaint</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Category"
                value={newComplaint.category}
                onChange={(e) => setNewComplaint({ ...newComplaint, category: e.target.value })}
              >
                {['Room', 'Food', 'Electricity', 'Plumbing', 'Cleaning', 'Other'].map(opt => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Priority"
                value={newComplaint.priority}
                onChange={(e) => setNewComplaint({ ...newComplaint, priority: e.target.value })}
              >
                {['Low', 'Medium', 'High', 'Urgent'].map(opt => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Describe the issue"
                value={newComplaint.description}
                onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                placeholder="Please be specific so we can help you faster..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setSubmitOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmitComplaint} 
            disabled={submitting || !newComplaint.description}
            sx={{ px: 4, borderRadius: 2 }}
          >
            {submitting ? <CircularProgress size={24} /> : 'Submit Complaint'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Resolution Dialog */}
      <Dialog open={resolveOpen} onClose={() => setResolveOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Update Resolution Status</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" color="textSecondary" fontWeight="bold">STUDENT ISSUE</Typography>
            <Typography variant="body1">{selectedComplaint?.description}</Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid xs={12}>
              <TextField
                select
                fullWidth
                label="Update Status"
                value={resolutionData.status}
                onChange={(e) => setResolutionData({ ...resolutionData, status: e.target.value })}
              >
                <MenuItem value="Logged">Logged (New)</MenuItem>
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
                label="Resolution Details / Reply to Student"
                value={resolutionData.resolutionDetails}
                onChange={(e) => setResolutionData({ ...resolutionData, resolutionDetails: e.target.value })}
                placeholder="Type your response here..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setResolveOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleUpdateStatus} 
            disabled={updating}
            sx={{ px: 4, borderRadius: 2 }}
          >
            {updating ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 3 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Complaints;
