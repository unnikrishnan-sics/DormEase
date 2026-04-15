import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, Grid, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, Button, TextField, 
  InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, 
  MenuItem, CircularProgress, Snackbar, Alert, Card, CardContent,
  Avatar, Divider, IconButton, Tooltip
} from '@mui/material';
import { 
  Search, Add, Delete, Mail, Phone, Security, AdminPanelSettings, 
  Badge, Work, ContactPhone, PersonAdd
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Staff: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create Staff Dialog States
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Staff',
    phone: '',
    address: ''
  });

  // Delete Dialog States
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/staff');
      setStaff(res.data);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to fetch team members', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async () => {
    try {
      setSaving(true);
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        contactDetails: {
          phone: formData.phone,
          address: formData.address
        }
      };
      
      await api.post('/auth/register', payload);
      setSnackbar({ open: true, message: 'New team member added! Initial password is correct.', severity: 'success' });
      setOpen(false);
      fetchStaff();
      setFormData({ name: '', email: '', password: '', role: 'Staff', phone: '', address: '' });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to add staff', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await api.delete(`/auth/users/${deleteId}`);
      setSnackbar({ open: true, message: 'Member removed from team', severity: 'success' });
      setDeleteId(null);
      fetchStaff();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to remove member', severity: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" style={{color:"black"}}>Team Management</Typography>
          <Typography variant="body2" color="textSecondary">Manage administrators, wardens, and caretaking staff.</Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<PersonAdd />} 
          onClick={() => setOpen(true)}
          sx={{ borderRadius: 2, px: 3 }}
        >
          Add Team Member
        </Button>
      </Box>

      {/* Stats Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Administrators', count: staff.filter(s => s.role === 'Admin').length, icon: <Security />, color: '#7C3AED' },
          { label: 'Staff / Wardens', count: staff.filter(s => s.role === 'Staff').length, icon: <Badge />, color: '#10B981' },
          { label: 'Total Team', count: staff.length, icon: <Work />, color: '#3B82F6' },
        ].map((stat, i) => (
          <Grid xs={12} md={4} key={i}>
            <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Box sx={{ p: 2, borderRadius: '50%', bgcolor: `${stat.color}15`, color: stat.color, mr: 2, display: 'flex' }}>
                  {stat.icon}
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" fontWeight="medium">{stat.label}</Typography>
                  <Typography variant="h5" fontWeight="bold">{stat.count}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">Staff Directory</Typography>
          <TextField
            size="small"
            fullWidth
            variant="outlined"
            placeholder="Search team..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }
            }}
            sx={{ width: 280, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </Box>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#F1F5F9' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Name & Role</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Joined Date</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#0F172A' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6 }}><CircularProgress /></TableCell></TableRow>
              ) : filteredStaff.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6 }}>No team members found.</TableCell></TableRow>
              ) : (
                filteredStaff.map((s) => (
                  <TableRow key={s._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: s.role === 'Admin' ? 'primary.main' : 'secondary.main', width: 36, height: 36 }}>{s.name[0]}</Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">{s.name} {s._id === currentUser?._id && "(You)"}</Typography>
                          <Chip 
                            label={s.role} 
                            size="small" 
                            variant="outlined"
                            icon={s.role === 'Admin' ? <AdminPanelSettings sx={{ fontSize: '1rem !important' }} /> : <Badge sx={{ fontSize: '1rem !important' }} />}
                            sx={{ mt: 0.5, height: 20, fontSize: '0.65rem', fontWeight: 700 }}
                          />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                        <Mail fontSize="inherit" />
                        <Typography variant="body2">{s.email}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                        <Phone fontSize="inherit" />
                        <Typography variant="body2">{s.contactDetails?.phone || 'N/A'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {s._id !== currentUser?._id && (
                        <Tooltip title="Remove Member">
                          <IconButton size="small" color="error" onClick={() => setDeleteId(s._id)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Staff Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Add New Team Member</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} sx={{ py: 1 }}>
            <Grid xs={12} sm={6}>
              <TextField 
                fullWidth label="Full Name" 
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField 
                select fullWidth label="Role" 
                value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <MenuItem value="Staff">Staff / Warden</MenuItem>
                <MenuItem value="Admin">Full Administrator</MenuItem>
              </TextField>
            </Grid>
            <Grid xs={12}>
              <TextField 
                fullWidth label="Email Address" type="email"
                value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} 
              />
            </Grid>
            <Grid xs={12}>
              <TextField 
                fullWidth label="Initial Password" type="password"
                value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} 
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField 
                fullWidth label="Phone Number" 
                value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} 
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField 
                fullWidth label="Address" 
                value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} 
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateStaff} disabled={saving} sx={{ borderRadius: 2, px: 4 }}>
            {saving ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Remove Team Member?</DialogTitle>
        <DialogContent>
          <Typography>This will permanently remove the user's access to the system. Are you sure?</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteStaff} disabled={deleting} sx={{ borderRadius: 2 }}>
            {deleting ? 'Removing...' : 'Yes, Remove Member'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Staff;
