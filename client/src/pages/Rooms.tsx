import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, Grid, Card, CardContent, Chip, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  FormGroup, FormControlLabel, Checkbox, CircularProgress, Alert
} from '@mui/material';
import { Add, Edit, Delete, Wifi, AcUnit, Tv, Kitchen, LocalLaundryService, People, Badge, Info } from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../services/api';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1 }
};

interface Room {
  _id: string;
  roomNumber: string;
  totalCapacity: number;
  currentOccupancy: number;
  pricePerMonth: number;
  facilities: string[];
  status: string;
  floor: number;
  price6Months?: number;
  price12Months?: number;
  price24Months?: number;
}

const AVAILABLE_FACILITIES = ['WiFi', 'AC', 'TV', 'Attached Bath'];

const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    roomNumber: '',
    totalCapacity: 1,
    pricePerMonth: 0,
    floor: 1,
    status: 'Available',
    facilities: [] as string[],
    price6Months: 0,
    price12Months: 0,
    price24Months: 0
  });

  // Occupants Dialog
  const [occupantsOpen, setOccupantsOpen] = useState(false);
  const [currentOccupants, setCurrentOccupants] = useState<any[]>([]);
  const [fetchingOccupants, setFetchingOccupants] = useState(false);
  const [selectedRoomNumber, setSelectedRoomNumber] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await api.get('/rooms');
      setRooms(res.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNew = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      roomNumber: '',
      totalCapacity: 1,
      pricePerMonth: 0,
      floor: 1,
      status: 'Available',
      facilities: [],
      price6Months: 0,
      price12Months: 0,
      price24Months: 0
    });
    setOpen(true);
  };

  const handleOpenEdit = (room: Room) => {
    setIsEditing(true);
    setCurrentId(room._id);
    setFormData({
      roomNumber: room.roomNumber,
      totalCapacity: room.totalCapacity,
      pricePerMonth: room.pricePerMonth,
      floor: room.floor || 1,
      status: room.status,
      facilities: room.facilities || [],
      price6Months: room.price6Months || 0,
      price12Months: room.price12Months || 0,
      price24Months: room.price24Months || 0
    });
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      facilities: checked 
        ? [...prev.facilities, value]
        : prev.facilities.filter(f => f !== value)
    }));
  };

  const handleSubmit = async () => {
    try {
      if (isEditing && currentId) {
        await api.put(`/rooms/${currentId}`, formData);
      } else {
        await api.post('/rooms', formData);
      }
      setOpen(false);
      fetchRooms();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleViewOccupants = async (room: Room) => {
    try {
      setFetchingOccupants(true);
      setSelectedRoomNumber(room.roomNumber);
      setOccupantsOpen(true);
      const res = await api.get(`/rooms/${room._id}/occupants`);
      setCurrentOccupants(res.data);
    } catch (err) {
      setError('Failed to fetch occupants');
    } finally {
      setFetchingOccupants(false);
    }
  };

  const handleCloseOccupants = () => {
    setOccupantsOpen(false);
    setCurrentOccupants([]);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await api.delete(`/rooms/${id}`);
        fetchRooms();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Deletion failed');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'success';
      case 'Full': return 'error';
      case 'Maintenance': return 'warning';
      default: return 'default';
    }
  };

  const renderIcon = (facility: string) => {
    switch (facility) {
      case 'WiFi': return <Wifi fontSize="small" color="action" titleAccess="WiFi" />;
      case 'AC': return <AcUnit fontSize="small" color="action" titleAccess="AC" />;
      case 'TV': return <Tv fontSize="small" color="action" titleAccess="TV" />;
      default: return null;
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box component={motion.div} variants={container} initial="hidden" animate="show">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" style={{color:"black"}}>Rooms Management</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenNew} sx={{ boxShadow: 3 }}>
          Add Room
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError(null)}>{error}</Alert>}

      <Grid container spacing={3}>
        {rooms.map((room) => (
          <Grid xs={12} sm={6} md={4} lg={3} key={room._id} component={motion.div} variants={item}>
            <Card sx={{ 
              height: '100%',
              transition: 'all 0.3s ease',
              '&:hover': { 
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
              }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h5" fontWeight="bold">Room {room.roomNumber}</Typography>
                  <Chip label={room.status} color={getStatusColor(room.status) as any} size="small" />
                </Box>
                
                <Typography color="textSecondary" gutterBottom>
                  {room.totalCapacity === 1 ? 'Single' : room.totalCapacity === 2 ? 'Double' : 'Shared'} Room
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Floor: {room.floor} | Occupants: {room.currentOccupancy}/{room.totalCapacity}
                </Typography>
                <Typography variant="h6" color="primary.main" fontWeight="bold" sx={{ mb: 2 }}>
                  ${room.pricePerMonth}/month
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                  {room.facilities?.map((f, i) => (
                    <span key={i}>{renderIcon(f)}</span>
                  ))}
                  {room.facilities?.length === 0 && <Typography variant="caption" color="textSecondary">No facilities listed</Typography>}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <IconButton 
                    size="small" 
                    color="info" 
                    onClick={() => handleViewOccupants(room)}
                    title="View Occupants"
                    sx={{ bgcolor: '#F0F9FF', '&:hover': { bgcolor: '#E0F2FE' } }}
                  >
                    <People fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="primary" onClick={() => handleOpenEdit(room)}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(room._id)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {rooms.length === 0 && (
          <Grid xs={12}>
            <Typography variant="body1" color="textSecondary" align="center" sx={{ py: 10 }}>
              No rooms found in the database. Add one to get started!
            </Typography>
          </Grid>
        )}
      </Grid>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Room' : 'Add New Room'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid xs={12} sm={6}>
              <TextField fullWidth label="Room Number" name="roomNumber" value={formData.roomNumber} onChange={handleInputChange} margin="normal" />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField fullWidth type="number" label="Total Capacity" name="totalCapacity" value={formData.totalCapacity} onChange={handleInputChange} margin="normal" />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField fullWidth type="number" label="Price Per Month ($)" name="pricePerMonth" value={formData.pricePerMonth} onChange={handleInputChange} margin="normal" />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField fullWidth type="number" label="Floor" name="floor" value={formData.floor} onChange={handleInputChange} margin="normal" />
            </Grid>
            <Grid xs={12}>
              <Typography variant="subtitle2" sx={{ mt: 1, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Badge fontSize="small" color="primary" /> Package Pricing ($)
              </Typography>
              <Grid container spacing={2}>
                <Grid xs={4}>
                  <TextField fullWidth type="number" label="6 Months" name="price6Months" value={formData.price6Months} onChange={handleInputChange} size="small" placeholder={`${formData.pricePerMonth * 6}`} />
                </Grid>
                <Grid xs={4}>
                  <TextField fullWidth type="number" label="12 Months" name="price12Months" value={formData.price12Months} onChange={handleInputChange} size="small" placeholder={`${formData.pricePerMonth * 12}`} />
                </Grid>
                <Grid xs={4}>
                  <TextField fullWidth type="number" label="24 Months" name="price24Months" value={formData.price24Months} onChange={handleInputChange} size="small" placeholder={`${formData.pricePerMonth * 24}`} />
                </Grid>
              </Grid>
              <Typography variant="caption" color="textSecondary">Leave package prices 0 to use standard monthly rate calculation.</Typography>
            </Grid>
            <Grid xs={12}>
              <TextField fullWidth select label="Status" name="status" value={formData.status} onChange={handleInputChange} margin="normal">
                <MenuItem value="Available">Available</MenuItem>
                <MenuItem value="Full">Full</MenuItem>
                <MenuItem value="Maintenance">Maintenance</MenuItem>
              </TextField>
            </Grid>
            <Grid xs={12}>
              <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>Facilities</Typography>
              <FormGroup row>
                {AVAILABLE_FACILITIES.map(fac => (
                  <FormControlLabel
                    key={fac}
                    control={<Checkbox checked={formData.facilities.includes(fac)} onChange={handleCheckboxChange} value={fac} />}
                    label={fac}
                  />
                ))}
              </FormGroup>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {isEditing ? 'Save Changes' : 'Create Room'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Occupants Dialog */}
      <Dialog open={occupantsOpen} onClose={handleCloseOccupants} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <People color="primary" /> Room {selectedRoomNumber} Occupants
        </DialogTitle>
        <DialogContent dividers>
          {fetchingOccupants ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={30} /></Box>
          ) : currentOccupants.length === 0 ? (
            <Typography align="center" variant="body2" color="textSecondary" sx={{ py: 3 }}>
              This room is currently empty.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {currentOccupants.map((occ) => (
                <Box key={occ._id} sx={{ p: 1.5, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#0F172A' }}>{occ.name}</Typography>
                  <Typography variant="caption" color="textSecondary" display="block">{occ.email}</Typography>
                  {occ.phone && <Typography variant="caption" color="primary.main">{occ.phone}</Typography>}
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseOccupants}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Rooms;
