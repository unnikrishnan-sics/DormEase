import React from 'react';
import { Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Chip, Button, TextField, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Snackbar, Alert, CircularProgress, Divider, MenuItem } from '@mui/material';
import { Search, Add, FileDownload, Visibility, Delete, Edit } from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../services/api';

const Students: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [studentToView, setStudentToView] = React.useState<any>(null);
  const [currentStudentId, setCurrentStudentId] = React.useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [studentToDelete, setStudentToDelete] = React.useState<any>(null);

  const [loading, setLoading] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    permanentAddress: '',
    parentGuardianName: '',
    emergencyContact: '',
    currentRoomId: '',
    packageType: 'Monthly'
  });
  const [students, setStudents] = React.useState<any[]>([]);
  const [rooms, setRooms] = React.useState<any[]>([]);
  const [fetching, setFetching] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [roomFilter, setRoomFilter] = React.useState('All');

  const billingInfo = React.useMemo(() => {
    if (!formData.currentRoomId) return null;
    const room = rooms.find(r => r._id === formData.currentRoomId);
    if (!room) return null;

    let billAmount = room.pricePerMonth;
    let totalAmount = billAmount;
    let months = 1;

    if (formData.packageType === '6 Months') {
      months = 6;
      totalAmount = room.price6Months || (billAmount * 6);
    } else if (formData.packageType === '12 Months') {
      months = 12;
      totalAmount = room.price12Months || (billAmount * 12);
    } else if (formData.packageType === '24 Months') {
      months = 24;
      totalAmount = room.price24Months || (billAmount * 24);
    }

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    return { billAmount, totalAmount, months, endDate };
  }, [formData.currentRoomId, formData.packageType, rooms]);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students');
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await api.get('/rooms');
      setRooms(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    fetchStudents();
    fetchRooms();
  }, []);

  const handleOpen = () => {
    setIsEditing(false);
    setCurrentStudentId(null);
    setFormData({ 
      name: '', email: '', phone: '', permanentAddress: '', 
      parentGuardianName: '', emergencyContact: '', currentRoomId: '',
      packageType: 'Monthly' 
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleEditOpen = (s: any) => {
    setIsEditing(true);
    setCurrentStudentId(s._id);
    setFormData({
      name: s.userId?.name || '',
      email: s.userId?.email || '',
      phone: s.userId?.contactDetails?.phone || '',
      permanentAddress: s.permanentAddress || '',
      parentGuardianName: s.parentGuardianName || '',
      emergencyContact: s.emergencyContact || '',
      currentRoomId: s.currentRoomId?._id || s.currentRoomId || '',
      packageType: s.packageType || 'Monthly'
    });
    setOpen(true);
  };

  const handleViewOpen = (s: any) => {
    setStudentToView(s);
    setViewOpen(true);
  };

  const handleViewClose = () => {
    setViewOpen(false);
    setStudentToView(null);
  };

  const handleDeleteDialogOpen = (s: any) => {
    setStudentToDelete(s);
    setDeleteOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteOpen(false);
    setStudentToDelete(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing && currentStudentId) {
        await api.put(`/students/${currentStudentId}`, formData);
        setSnackbar({ open: true, message: 'Student updated successfully!', severity: 'success' });
      } else {
        await api.post('/students', formData);
        setSnackbar({ open: true, message: 'Student added and credentials emailed!', severity: 'success' });
      }
      handleClose();
      fetchStudents();
      fetchRooms();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.response?.data?.message || `Error ${isEditing ? 'updating' : 'adding'} student`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!studentToDelete) return;
    try {
      await api.delete(`/students/${studentToDelete._id}`);
      setSnackbar({ open: true, message: 'Student removed successfully', severity: 'success' });
      fetchStudents();
      fetchRooms();
      handleDeleteDialogClose();
    } catch (err: any) {
      setSnackbar({ open: true, message: 'Error deleting student', severity: 'error' });
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.currentRoomId?.roomNumber?.toString().includes(searchQuery);
    const matchesRoom = roomFilter === 'All' || s.currentRoomId?._id === roomFilter;
    return matchesSearch && matchesRoom;
  });

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" style={{color:"black"}}>Students</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<FileDownload />} sx={{ borderRadius: 2 }}>Export</Button>
          <Button variant="contained" startIcon={<Add />} sx={{ borderRadius: 2, boxShadow: 2 }} onClick={handleOpen}>
            Add Student
          </Button>
        </Box>
      </Box>

      <Paper 
        elevation={0} 
        sx={{ p: 2, mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 2, display: 'flex', gap: 2 }}
        component={motion.div}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search students..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
        <TextField
          select
          label="Filter by Room"
          value={roomFilter}
          onChange={(e) => setRoomFilter(e.target.value)}
          sx={{ minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          size="small"
        >
          <MenuItem value="All">All Rooms</MenuItem>
          {rooms.map(room => (
            <MenuItem key={room._id} value={room._id}>Room {room.roomNumber}</MenuItem>
          ))}
        </TextField>
      </Paper>

      <TableContainer 
        component={Paper} 
        elevation={0} 
        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}
        component={motion.div}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: '#F9FAFB' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>Student</TableCell>
              <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>Room</TableCell>
              <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>Phone</TableCell>
              <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: "text.primary" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fetching ? (
              <TableRow><TableCell colSpan={5} align="center"><CircularProgress sx={{ my: 4 }} /></TableCell></TableRow>
            ) : filteredStudents.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center"><Typography color="textSecondary" sx={{ my: 4 }}>No students found matching "{searchQuery}".</Typography></TableCell></TableRow>
            ) : filteredStudents.map((s) => (
              <TableRow key={s._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.light', color: 'primary.main', fontWeight: 'bold' }}>{s.userId?.name?.[0] || '?'}</Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="900" sx={{ color: '#0F172A' }}>{s.userId?.name}</Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>{s.userId?.email}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="700" sx={{ color: '#1E293B' }}>{s.currentRoomId?.roomNumber || 'Unassigned'}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600 }}>{s.userId?.contactDetails?.phone || '-'}</Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={s.bookingStatus} 
                    size="small" 
                    color={s.bookingStatus === 'Allocated' ? 'success' : 'warning'} 
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Button size="small" variant="text" startIcon={<Visibility />} sx={{ fontWeight: 600 }} onClick={() => handleViewOpen(s)}>View</Button>
                  <Button size="small" variant="text" startIcon={<Edit />} sx={{ fontWeight: 600 }} onClick={() => handleEditOpen(s)}>Edit</Button>
                  <Button size="small" variant="text" color="error" startIcon={<Delete />} sx={{ fontWeight: 600 }} onClick={() => handleDeleteDialogOpen(s)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 'bold' }}>{isEditing ? 'Edit Student Details' : 'Add New Student'}</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              {isEditing 
                ? "Update the student's personal and room allocation information below."
                : "Input student details below. A secure temporary password will be generated and emailed to the student automatically."}
            </Typography>
            <Grid container spacing={3}>
              <Grid xs={12} sm={6}>
                <TextField 
                  fullWidth label="Full Name" name="name" required 
                  value={formData.name} onChange={handleChange} disabled={isEditing} 
                  variant="outlined"
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField 
                  fullWidth label="Email Address" name="email" type="email" required 
                  value={formData.email} onChange={handleChange} disabled={isEditing} 
                  variant="outlined"
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField 
                  fullWidth label="Phone Number" name="phone" required 
                  value={formData.phone} onChange={handleChange} 
                  variant="outlined"
                />
              </Grid>

              <Grid xs={12}>
                <Divider sx={{ my: 1, borderStyle: 'dashed' }}>Parent/Guardian Details</Divider>
              </Grid>

              <Grid xs={12} sm={6}>
                <TextField 
                  fullWidth label="Guardian Name" name="parentGuardianName" 
                  value={formData.parentGuardianName} onChange={handleChange} 
                  variant="outlined"
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField 
                  fullWidth label="Emergency Contact" name="emergencyContact" 
                  value={formData.emergencyContact} onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid xs={12}>
                <TextField 
                  fullWidth label="Permanent Address" name="permanentAddress" multiline rows={2} 
                  value={formData.permanentAddress} onChange={handleChange} 
                  variant="outlined"
                />
              </Grid>

              <Grid xs={12}>
                <Divider sx={{ my: 1, mt: 1, borderStyle: 'dashed' }}>Room Allocation</Divider>
              </Grid>

              <Grid xs={12} sm={6}>
                <TextField 
                  fullWidth select label="Assign Room" name="currentRoomId" 
                  value={formData.currentRoomId} onChange={handleChange}
                  variant="outlined"
                >
                  <MenuItem value="">
                    <Typography variant="body2" color="textSecondary">None (Waitlist)</Typography>
                  </MenuItem>
                  {rooms.map(room => {
                    const availableSlots = room.totalCapacity - room.currentOccupancy;
                    const isFull = availableSlots <= 0 || room.status === 'Maintenance';
                    
                    return (
                      <MenuItem key={room._id} value={room._id} disabled={isFull}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="body1" fontWeight="bold">
                            Room {room.roomNumber} ({room.totalCapacity === 1 ? 'Single' : room.totalCapacity === 2 ? 'Double' : 'Shared'})
                          </Typography>
                          <Typography variant="caption" color={isFull ? 'error' : 'textSecondary'}>
                            Rent: ${room.pricePerMonth}/mo | Slots Available: {availableSlots}
                          </Typography>
                        </Box>
                      </MenuItem>
                    );
                  })}
                </TextField>
              </Grid>

              <Grid xs={12} sm={6}>
                <TextField 
                  fullWidth select label="Subscription Package" name="packageType" 
                  value={formData.packageType || 'Monthly'} onChange={handleChange}
                  variant="outlined"
                >
                  <MenuItem value="Monthly">Monthly Billing</MenuItem>
                  <MenuItem value="6 Months">6 Months Package</MenuItem>
                  <MenuItem value="12 Months">12 Months Package</MenuItem>
                  <MenuItem value="24 Months">24 Months Package</MenuItem>
                </TextField>
              </Grid>

              {billingInfo && (
                <Grid xs={12}>
                  <Box 
                    sx={{ 
                      p: 2.5, 
                      borderRadius: 3, 
                      bgcolor: 'rgba(59, 130, 246, 0.04)', 
                      border: '1px solid rgba(59, 130, 246, 0.1)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" fontWeight="700" color="text.primary">Bill Amount (/Mo)</Typography>
                      <Typography variant="body1" fontWeight="800" color="primary.main">${billingInfo.billAmount.toLocaleString()}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" fontWeight="700" color="text.primary">Total Amount ({billingInfo.months} Mo)</Typography>
                      <Typography variant="h6" fontWeight="900" color="primary.dark">${billingInfo.totalAmount.toLocaleString()}</Typography>
                    </Box>
                    <Divider sx={{ my: 0.5, opacity: 0.5 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" fontWeight="700" color="text.primary">Subscription Validity</Typography>
                      <Typography variant="body2" fontWeight="800" color="success.main">
                        Ends: {billingInfo.endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.primary" sx={{ mt: 1, fontStyle: 'italic', fontWeight: 500 }}>
                      The student will be invoiced for the <strong>Total Amount</strong> upon registration.
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : (isEditing ? 'Update Student' : 'Save & Send Welcome Email')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Custom Delete Dialog */}
      <Dialog open={deleteOpen} onClose={handleDeleteDialogClose} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main' }}>Confirm Removal</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to remove <strong>{studentToDelete?.userId?.name}</strong> from the system?
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            This will also delete their associated user account and free up their room slot.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleDeleteDialogClose} color="inherit">Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Remove Student
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Student Details Dialog */}
      <Dialog open={viewOpen} onClose={handleViewClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Student Profile
          <Chip label={studentToView?.bookingStatus} color={studentToView?.bookingStatus === 'Allocated' ? 'success' : 'warning'} size="small" />
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ width: 64, height: 64, mr: 2, bgcolor: 'primary.main', fontSize: '1.5rem' }}>
              {studentToView?.userId?.name?.[0]}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="900" sx={{ color: '#0F172A' }}>{studentToView?.userId?.name}</Typography>
              <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600 }}>{studentToView?.userId?.email}</Typography>
            </Box>
          </Box>

          <Grid container spacing={3}>
            <Grid xs={6}>
              <Typography variant="caption" color="textSecondary" display="block">Phone Number</Typography>
              <Typography variant="body1" fontWeight="medium">{studentToView?.userId?.contactDetails?.phone || 'N/A'}</Typography>
            </Grid>
            <Grid xs={6}>
              <Typography variant="caption" color="textSecondary" display="block">Assigned Room</Typography>
              <Typography variant="body1" fontWeight="medium">
                {studentToView?.currentRoomId?.roomNumber ? `Room ${studentToView.currentRoomId.roomNumber}` : 'Pending Allocation'}
              </Typography>
            </Grid>
            <Grid xs={12}>
              <Divider />
            </Grid>
            <Grid xs={6}>
              <Typography variant="caption" color="textSecondary" display="block">Guardian Name</Typography>
              <Typography variant="body1" fontWeight="medium">{studentToView?.parentGuardianName || 'N/A'}</Typography>
            </Grid>
            <Grid xs={6}>
              <Typography variant="caption" color="textSecondary" display="block">Emergency Contact</Typography>
              <Typography variant="body1" fontWeight="medium">{studentToView?.emergencyContact || 'N/A'}</Typography>
            </Grid>
            <Grid xs={12}>
              <Typography variant="caption" color="textSecondary" display="block">Permanent Address</Typography>
              <Typography variant="body1" fontWeight="medium">{studentToView?.permanentAddress || 'N/A'}</Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleViewClose} variant="contained" fullWidth sx={{ borderRadius: 2 }}>Close Profile</Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Students;
