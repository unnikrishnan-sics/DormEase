import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Typography, Paper, Grid, TextField, Button, 
  Avatar, Divider, CircularProgress, Snackbar, Alert, Card,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  MenuItem
} from '@mui/material';
import { 
  Person, ContactPhone, Emergency, Home, Save, 
  Badge, Email, Lock, QrCode2, Download, Close 
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    phone: '',
    emergencyContact: '',
    parentGuardianName: '',
    permanentAddress: '',
    dietaryPreference: 'Non-Veg',
    allergies: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/students/me/summary');
      const profile = res.data.profile;
      setStudentProfile(profile);
      setFormData({
        phone: profile?.userId?.contactDetails?.phone || '',
        emergencyContact: profile.emergencyContact || '',
        parentGuardianName: profile.parentGuardianName || '',
        permanentAddress: profile.permanentAddress || '',
        dietaryPreference: profile.dietaryPreference || 'Non-Veg',
        allergies: profile.allergies?.join(', ') || ''
      });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to fetch profile details', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put('/students/me', {
        ...formData,
        allergies: formData.allergies.split(',').map(a => a.trim()).filter(a => a !== '')
      });
      setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Update failed', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = `${user?.name || 'student'}_QR.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{ maxWidth: 800, mx: 'auto', p: 2 }}
    >
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar 
            sx={{ 
              width: 80, height: 80, 
              bgcolor: 'primary.main', 
              fontSize: '2rem',
              fontWeight: 'bold',
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
            }}
          >
            {user?.name?.[0]}
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="900" color="text.primary">{user?.name}</Typography>
            <Typography variant="body1" fontWeight="500" color="text.secondary">Manage your personal details and contact preferences.</Typography>
          </Box>
        </Box>
        <Button
          variant="outlined"
          startIcon={<QrCode2 />}
          onClick={() => setQrOpen(true)}
          sx={{ borderRadius: 3, fontWeight: 'bold' }}
          disabled={!studentProfile?.studentId}
        >
          My ID Badge
        </Button>
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Account Info (Read-only) */}
          <Grid xs={12}>
            <Card sx={{ p: 3, borderRadius: 4, bgcolor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              <Typography variant="subtitle1" fontWeight="900" color="text.primary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Badge color="primary" sx={{ '& .MuiBadge-badge': { height: 8, minWidth: 8, borderRadius: '50%' } }} /> Account Information
              </Typography>
              <Grid container spacing={2}>
                <Grid xs={12} sm={6}>
                  <TextField 
                    fullWidth label="Full Name" value={user?.name} disabled 
                    slotProps={{ input: { startAdornment: <Person sx={{ mr: 1, opacity: 0.5 }} /> } }}
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <TextField 
                    fullWidth label="Email Address" value={user?.email} disabled 
                    slotProps={{ input: { startAdornment: <Email sx={{ mr: 1, opacity: 0.5 }} /> } }}
                  />
                </Grid>
                {studentProfile?.studentId && (
                  <Grid xs={12}>
                    <Typography variant="caption" fontWeight="bold" color="primary" sx={{ mt: 1, display: 'block' }}>
                      Permanent Student ID: {studentProfile.studentId}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Card>
          </Grid>

          {/* Editable Details */}
          <Grid xs={12}>
            <Paper sx={{ p: 4, borderRadius: 4, bgcolor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
              <Typography variant="h6" fontWeight="900" color="text.primary" sx={{ mb: 3 }}>Personal Details</Typography>
              <Grid container spacing={3}>
                <Grid xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    sx={{ 
                      '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#f8fafc' },
                      '& .MuiInputLabel-root': { fontWeight: 600, color: 'text.primary' }
                    }}
                    slotProps={{ 
                      input: {
                        startAdornment: <ContactPhone sx={{ mr: 1, color: 'primary.main' }} />,
                        sx: { fontWeight: 600, color: 'text.primary' }
                      }
                    }}
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Emergency Contact"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#f8fafc' },
                      '& .MuiInputLabel-root': { fontWeight: 600, color: 'text.primary' }
                    }}
                    slotProps={{ 
                      input: {
                        startAdornment: <Emergency sx={{ mr: 1, color: 'error.main' }} />,
                        sx: { fontWeight: 600, color: 'text.primary' }
                      }
                    }}
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Guardian Name"
                    name="parentGuardianName"
                    value={formData.parentGuardianName}
                    onChange={handleChange}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#f8fafc' },
                      '& .MuiInputLabel-root': { fontWeight: 600, color: 'text.primary' }
                    }}
                    slotProps={{ 
                      input: {
                        startAdornment: <Person sx={{ mr: 1, color: 'secondary.main' }} />,
                        sx: { fontWeight: 600, color: 'text.primary' }
                      }
                    }}
                  />
                </Grid>
                <Grid xs={12}>
                  <TextField
                    fullWidth
                    label="Permanent Address"
                    name="permanentAddress"
                    multiline
                    rows={3}
                    value={formData.permanentAddress}
                    onChange={handleChange}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#f8fafc' },
                      '& .MuiInputLabel-root': { fontWeight: 600, color: 'text.primary' }
                    }}
                    slotProps={{ 
                      input: {
                        startAdornment: <Home sx={{ mr: 1, mt: 1, color: 'info.main' }} />,
                        sx: { fontWeight: 600, color: 'text.primary' }
                      }
                    }}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />
              <Typography variant="h6" fontWeight="900" color="text.primary" sx={{ mb: 3 }}>Dietary & Mess Preferences</Typography>
              
              <Grid container spacing={3}>
                <Grid xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Dietary Preference"
                    name="dietaryPreference"
                    value={formData.dietaryPreference}
                    onChange={handleChange}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#f8fafc' } }}
                  >
                    <MenuItem value="Veg">Vegetarian</MenuItem>
                    <MenuItem value="Non-Veg">Non-Vegetarian</MenuItem>
                    <MenuItem value="Vegan">Vegan</MenuItem>
                  </TextField>
                </Grid>
                <Grid xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Allergies (Optional)"
                    name="allergies"
                    placeholder="e.g. Peanuts, Lactose, Gluten"
                    value={formData.allergies}
                    onChange={handleChange}
                    helperText="Separate multiple allergies with commas"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#f8fafc' } }}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/change-password')}
                  startIcon={<Lock />}
                  sx={{ borderRadius: 3, textTransform: 'none' }}
                >
                  Change Password
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                  sx={{ borderRadius: 3, px: 4, fontWeight: 'bold', textTransform: 'none' }}
                >
                  Save Changes
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </form>

      {/* QR Code Dialog */}
      <Dialog open={qrOpen} onClose={() => setQrOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', pb: 0 }}>
          Your Student ID QR Code
          <IconButton
            onClick={() => setQrOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <Box ref={qrRef} sx={{ p: 4, bgcolor: 'white', display: 'inline-block', borderRadius: 4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            <QRCodeCanvas 
                value={studentProfile?.studentId || ''} 
                size={200}
                level="H"
                includeMargin={true}
            />
            <Typography variant="h6" fontWeight="bold" sx={{ mt: 2, letterSpacing: 2 }}>
                {studentProfile?.studentId}
            </Typography>
            <Typography variant="caption" color="textSecondary">
                DormEase Access Key
            </Typography>
          </Box>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 3, px: 2 }}>
            Present this QR code at the gate for entry/exit scanning.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 4 }}>
          <Button 
            variant="contained" 
            startIcon={<Download />} 
            onClick={downloadQR}
            sx={{ borderRadius: 3, px: 4 }}
          >
            Download as PNG
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;
