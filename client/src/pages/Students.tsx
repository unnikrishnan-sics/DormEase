import { Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Chip, Button, TextField, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Snackbar, Alert, CircularProgress } from '@mui/material';
import { Search, Add, FileDownload } from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';

const Students: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    permanentAddress: '',
    parentGuardianName: '',
    emergencyContact: ''
  });
  const [students, setStudents] = React.useState<any[]>([]);
  const [fetching, setFetching] = React.useState(true);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/students');
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  React.useEffect(() => {
    fetchStudents();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/students', formData);
      setSnackbar({ open: true, message: 'Student added and credentials emailed!', severity: 'success' });
      handleClose();
      fetchStudents();
      setFormData({ name: '', email: '', phone: '', permanentAddress: '', parentGuardianName: '', emergencyContact: '' });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Error adding student', severity: 'error' });
    } finally {
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
        <Typography variant="h4" fontWeight="bold">Students</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<FileDownload />} sx={{ borderRadius: 2 }}>Export</Button>
          <Button variant="contained" startIcon={<Add />} sx={{ borderRadius: 2, boxShadow: 2 }} onClick={handleOpen}>
            Add Student
          </Button>
        </Box>
      </Box>

      <Paper 
        elevation={0} 
        sx={{ p: 2, mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
        component={motion.div}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search students by name, email or room..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
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
              <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Room</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fetching ? (
              <TableRow><TableCell colSpan={5} align="center"><CircularProgress sx={{ my: 4 }} /></TableCell></TableRow>
            ) : students.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center"><Typography color="textSecondary" sx={{ my: 4 }}>No students found.</Typography></TableCell></TableRow>
            ) : students.map((s) => (
              <TableRow key={s._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.light', color: 'primary.main', fontWeight: 'bold' }}>{s.userId?.name?.[0] || '?'}</Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">{s.userId?.name}</Typography>
                      <Typography variant="caption" color="textSecondary">{s.userId?.email}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">{s.currentRoomId?.roomNumber || 'Unassigned'}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="textSecondary">{s.userId?.contactDetails?.phone || '-'}</Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={s.bookingStatus} 
                    size="small" 
                    color={s.bookingStatus === 'Allocated' ? 'success' : 'warning'} 
                    variant="soft"
                    sx={{ fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Button size="small" variant="text" sx={{ fontWeight: 600 }}>View Detail</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Student Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 'bold' }}>Add New Student</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Input student details below. A secure temporary password will be generated and emailed to the student automatically.
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Full Name" name="name" required value={formData.name} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Email Address" name="email" type="email" required value={formData.email} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Phone Number" name="phone" required value={formData.phone} onChange={handleChange} />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }}>Parent/Guardian Details</Divider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Guardian Name" name="parentGuardianName" value={formData.parentGuardianName} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Emergency Contact" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Permanent Address" name="permanentAddress" multiline rows={2} value={formData.permanentAddress} onChange={handleChange} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Save & Send Welcome Email'}
            </Button>
          </DialogActions>
        </form>
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
