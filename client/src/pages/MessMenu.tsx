import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, Grid, Paper, Tabs, Tab, Button, Card, CardContent, 
  Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, Snackbar, Alert, MenuItem, IconButton, Tooltip,
  InputAdornment, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Avatar, Badge
} from '@mui/material';
import { 
  AutoAwesome, CalendarMonth, LocalDining, Edit, Save, 
  Timer, Info, History, AddCircle, CheckCircle, Pending,
  Warning, Fastfood, Restaurant, AccountBalanceWallet, ChevronRight
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const MessMenu: React.FC = () => {
  const { user } = useAuth();
  const isAdminOrStaff = user?.role === 'Admin' || user?.role === 'Staff';
  const isStudent = user?.role === 'Student';
  
  const [mainTab, setMainTab] = useState(0); // 0: Menu, 1: Extras
  const [dayTab, setDayTab] = useState(0); // 0-6 for Mon-Sun
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const [menuData, setMenuData] = useState<any[]>([]);
  const [warnings, setWarnings] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [messItems, setMessItems] = useState<any[]>([]);
  const [studentProfile, setStudentProfile] = useState<any>(null);

  // Request States
  const [reqOpen, setReqOpen] = useState(false);
  const [requestData, setRequestData] = useState({
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    mealType: 'Dinner',
    item: 'extraChicken',
    paymentMethod: 'Cash'
  });

  // Edit States
  const [editOpen, setEditOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiDraft, setAiDraft] = useState<any>(null);
  const [aiConstraints, setAiConstraints] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<string>('');
  const [aiTheme, setAiTheme] = useState('Healthy Balanced');
  const [editData, setEditData] = useState({
    items: '',
    time: ''
  });
  const [specialNote, setSpecialNote] = useState('');

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await api.get('/mess');
      // Backend now returns { menu, warnings }
      setMenuData(res.data.menu || []);
      setWarnings(res.data.warnings || []);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to fetch menu', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

   const fetchRequests = async () => {
    try {
      const endpoint = isAdminOrStaff ? '/mess/requests' : '/mess/requests/my';
      const res = await api.get(endpoint);
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await api.get('/attendance/settings');
      setMessItems(res.data.messItems || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudentProfile = async () => {
    if (isStudent) {
      try {
        const res = await api.get('/students/me/summary');
        setStudentProfile(res.data);
      } catch (err) {
        console.error('Failed to fetch student profile', err);
      }
    }
  };

  useEffect(() => {
    fetchMenu();
    fetchRequests();
    fetchSettings();
    fetchStudentProfile();
  }, []);

  const currentDayData = menuData.find(d => d.dayOfWeek === days[dayTab]) || {
    dayOfWeek: days[dayTab],
    breakfast: { items: [], time: '08:00 AM' },
    lunch: { items: [], time: '01:00 PM' },
    snacks: { items: [], time: '05:00 PM' },
    dinner: { items: [], time: '08:30 PM' },
    specialNote: ''
  };

  const handleEditClick = (meal: string) => {
    setSelectedMeal(meal);
    const mealData = currentDayData[meal.toLowerCase()];
    // Format: "ItemName (Allergen1, Allergen2) [Type]"
    const itemString = mealData?.items?.map((i: any) => {
        let str = i.name;
        if (i.allergens?.length > 0) str += ` (${i.allergens.join(', ')})`;
        if (i.type) str += ` [${i.type}]`;
        return str;
    }).join(', ') || '';

    setEditData({
      items: itemString,
      time: mealData?.time || ''
    });
    setEditOpen(true);
  };

  const handleSaveMeal = async () => {
    try {
      setUpdating(true);
      const items = editData.items.split(',').map(raw => {
        // Regex to match "Item Name (Allergen1, Allergen2) [Type]"
        const match = raw.match(/(.+?)\s*(?:\((.+?)\))?\s*(?:\[(.+?)\])?$/);
        if (match) {
          return { 
            name: match[1]?.trim() || '', 
            allergens: match[2] ? match[2].split(',').map(a => a.trim()) : [],
            type: match[3]?.trim() || 'Veg'
          };
        }
        return { name: raw.trim(), allergens: [], type: 'Veg' };
      }).filter(i => i.name !== '');

      const updatedDay = { ...currentDayData };
      updatedDay[selectedMeal.toLowerCase()] = { items, time: editData.time };
      
      await api.put(`/mess/${days[dayTab]}`, updatedDay);
      setSnackbar({ open: true, message: `${selectedMeal} updated!`, severity: 'success' });
      setEditOpen(false);
      fetchMenu();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update menu', severity: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const handleAiSuggest = async () => {
    try {
      setUpdating(true);
      const res = await api.post('/mess/suggest', { theme: aiTheme, constraints: aiConstraints });
      setAiDraft(res.data);
      setSnackbar({ open: true, message: 'AI Suggestions ready for review!', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'AI generation failed', severity: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const handleApplyDraft = async () => {
    try {
      setUpdating(true);
      await api.put(`/mess/${days[dayTab]}`, { ...currentDayData, ...aiDraft });
      setSnackbar({ open: true, message: 'Menu applied to schedule!', severity: 'success' });
      setAiOpen(false);
      setAiDraft(null);
      setAiConstraints('');
      fetchMenu();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to apply menu', severity: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const handleSubmitRequest = async () => {
    try {
      setUpdating(true);
      const res = await api.post('/mess/request', requestData);
      setSnackbar({ open: true, message: 'Request submitted!', severity: 'success' });
      setReqOpen(false);
      fetchRequests();
      if (res.data.requiresOnlinePayment) {
          // Stripe logic would go here
          setSnackbar({ open: true, message: 'Please complete payment via Stripe to confirm.', severity: 'info' });
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Request failed', severity: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusUpdate = async (id: string, update: { status?: string, paymentStatus?: string }) => {
    try {
      await api.put(`/mess/requests/${id}`, update);
      setSnackbar({ open: true, message: `Updated successfully`, severity: 'success' });
      fetchRequests();
    } catch (err) {
      setSnackbar({ open: true, message: 'Update failed', severity: 'error' });
    }
  };

  return (
    <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="900" sx={{ color: '#0F172A' }}>Smart Mess Portal</Typography>
          <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>
            {isAdminOrStaff ? 'Manage schedule, production counts and student requests.' : 'View menu, dietary warnings, and request extras.'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
            {isAdminOrStaff && (
              <Button 
                variant="contained" startIcon={<AutoAwesome />} 
                onClick={() => setAiOpen(true)}
                sx={{ borderRadius: 3, bgcolor: '#4F46E5', '&:hover': { bgcolor: '#4338CA' } }}
              >
                AI Menu Gen
              </Button>
            )}
            {isStudent && (
               <Button 
                 variant="contained" startIcon={<AddCircle />} 
                 onClick={() => setReqOpen(true)}
                 sx={{ borderRadius: 3 }}
               >
                 Advance Request
               </Button>
            )}
        </Box>
      </Box>

      {/* Main Mode Tabs */}
      <Tabs 
        value={mainTab} onChange={(_, v) => setMainTab(v)} 
        sx={{ mb: 4, borderBottom: '1px solid #e2e8f0', '& .MuiTab-root': { fontWeight: 800, textTransform: 'none', px: 4 } }}
      >
        <Tab label="Weekly Schedule" icon={<CalendarMonth />} iconPosition="start" />
        <Tab 
            label={isAdminOrStaff ? "Orders & Requests" : "My Requests"} 
            icon={<Restaurant />} iconPosition="start" 
        />
      </Tabs>

      {mainTab === 0 ? (
        <>
            <Paper sx={{ mb: 4, borderRadius: 4, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
               <Tabs
                 value={dayTab} onChange={(_, v) => setDayTab(v)}
                 variant="scrollable" scrollButtons="auto"
                 sx={{ bgcolor: '#F8FAFC', '& .MuiTab-root': { fontWeight: 700, py: 2 } }}
               >
                 {days.map((day) => <Tab key={day} label={day} />)}
               </Tabs>
            </Paper>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
            ) : (
                <Grid container spacing={3}>
                  {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map((meal) => {
                    const data = currentDayData[meal.toLowerCase()];
                    const mealWarnings = warnings.filter(w => w.day === days[dayTab] && w.meal === meal.toLowerCase());
                    
                    return (
                      <Grid xs={12} sm={6} md={3} key={meal}>
                        <Card sx={{ 
                          height: '100%', borderRadius: 5, border: '1px solid #f0f0f0',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                          transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 20px rgba(0,0,0,0.05)' }
                        }}>
                          <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                               <Typography variant="h6" fontWeight="900" sx={{ color: '#1E293B' }}>{meal}</Typography>
                               {isAdminOrStaff && (
                                 <IconButton size="small" onClick={() => handleEditClick(meal)} color="primary">
                                    <Edit fontSize="small" />
                                 </IconButton>
                               )}
                            </Box>
                            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, bgcolor: '#F1F5F9', px: 1, py: 0.5, borderRadius: 1 }}>
                                {data?.time}
                            </Typography>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                              {data?.items?.length > 0 ? (
                                data.items
                                .filter((item: any) => {
                                  if (!isStudent || !studentProfile) return true;
                                  const pref = studentProfile.dietaryPreference;
                                  if (pref === 'Veg') return item.type === 'Veg' || item.type === 'Egg';
                                  if (pref === 'Vegan') return item.type === 'Veg'; // Assuming Veg is base for Vegan here
                                  return true; // Non-Veg sees all
                                })
                                .map((item: any, i: number) => {
                                  const studentAllergies = studentProfile?.allergies || [];
                                  const isAllergic = item.allergens?.some((a: string) => 
                                    studentAllergies.some((sa: string) => sa.toLowerCase() === a.toLowerCase())
                                  );

                                  return (
                                    <Box key={i}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ 
                                          width: 8, height: 8, 
                                          borderRadius: '50%',
                                          border: '1px solid',
                                          borderColor: item.type === 'Veg' ? '#10B981' : item.type === 'Non-Veg' ? '#EF4444' : '#F59E0B',
                                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                           <Box sx={{ 
                                             width: 4, height: 4, borderRadius: '50%', 
                                             bgcolor: item.type === 'Veg' ? '#10B981' : item.type === 'Non-Veg' ? '#EF4444' : '#F59E0B' 
                                           }} />
                                        </Box>
                                        <Typography 
                                          variant="body2" 
                                          fontWeight="700" 
                                          sx={{ 
                                            color: isAllergic ? '#E11D48' : '#334155',
                                            textDecoration: isAllergic ? 'underline' : 'none'
                                          }}
                                        >
                                          {item.name} {isAllergic && '(CAUTION)'}
                                        </Typography>
                                      </Box>
                                      {item.allergens?.length > 0 && (
                                         <Box sx={{ ml: 3, mt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {item.allergens.map((a: string) => {
                                              const isSpecificAllergen = studentAllergies.some((sa: string) => sa.toLowerCase() === a.toLowerCase());
                                              return (
                                                <Chip 
                                                  key={a} label={a} size="small" 
                                                  sx={{ 
                                                    height: 16, fontSize: '0.65rem', 
                                                    bgcolor: isSpecificAllergen ? '#FFE4E6' : '#FEF3C7', 
                                                    color: isSpecificAllergen ? '#E11D48' : '#92400E', 
                                                    fontWeight: 'bold',
                                                    border: isSpecificAllergen ? '1px solid #FECDD3' : 'none'
                                                  }} 
                                                />
                                              );
                                            })}
                                         </Box>
                                      )}
                                    </Box>
                                  );
                                })
                              ) : (
                                <Typography variant="caption" color="textSecondary" sx={{ fontStyle: 'italic' }}>No items added</Typography>
                              )}
                            </Box>

                            {isStudent && mealWarnings.length > 0 && (
                                <Box sx={{ mt: 3, p: 1.5, bgcolor: '#FFF1F2', borderRadius: 3, border: '1px solid #FECDD3' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                      <Warning sx={{ color: '#E11D48', fontSize: '1rem' }} />
                                      <Typography variant="caption" fontWeight="900" color="#9F1239">ALLERGY ALERT</Typography>
                                    </Box>
                                    <Typography variant="caption" color="#BE123B" display="block">
                                      Contains: {mealWarnings.map(w => w.allergens.join(', ')).join(', ')}
                                    </Typography>
                                </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
            )}
        </>
      ) : (
        /* Requests View */
        <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} sx={{ width: '100%' }}>
            {isAdminOrStaff && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {[
                        { label: 'Total Extra Eggs', count: requests.filter(r => r.item === 'extraEgg' && r.status !== 'Cancelled').length, icon: <Restaurant />, color: '#F59E0B' },
                        { label: 'Total Extra Chicken', count: requests.filter(r => r.item === 'extraChicken' && r.status !== 'Cancelled').length, icon: <Fastfood />, color: '#EF4444' },
                        { label: 'Pending Payments', count: requests.filter(r => r.paymentStatus === 'Unpaid').length, icon: <AccountBalanceWallet />, color: '#3B82F6' }
                    ].map((stat, i) => (
                        <Grid item xs={12} md={4} key={i}>
                            <Paper sx={{ p: 3, borderRadius: 5, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 2.5 }}>
                                <Box sx={{ p: 2, bgcolor: `${stat.color}15`, color: stat.color, borderRadius: 4, display: 'flex' }}>
                                    {stat.icon}
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="textSecondary" fontWeight="bold">{stat.label}</Typography>
                                    <Typography variant="h5" fontWeight="900">{stat.count}</Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            )}

            <TableContainer component={Paper} sx={{ borderRadius: 5, border: '1px solid #e2e8f0', boxShadow: 'none', width: '100%' }}>
                      <Table sx={{ width: '100%' }}>
                         <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                            <TableRow>
                               <TableCell><Typography variant="subtitle2" fontWeight="bold">Student / Date</Typography></TableCell>
                               <TableCell><Typography variant="subtitle2" fontWeight="bold">Item</Typography></TableCell>
                               <TableCell><Typography variant="subtitle2" fontWeight="bold">Amount</Typography></TableCell>
                               <TableCell><Typography variant="subtitle2" fontWeight="bold">Status</Typography></TableCell>
                               {requests.some(r => (isAdminOrStaff && (r.status === 'Pending' || r.status === 'Ready')) || (isStudent && r.status === 'Pending')) && (
                                   <TableCell><Typography variant="subtitle2" fontWeight="bold">Action</Typography></TableCell>
                               )}
                               {isAdminOrStaff && <TableCell><Typography variant="subtitle2" fontWeight="bold">Payment</Typography></TableCell>}
                            </TableRow>
                         </TableHead>
                         <TableBody>
                            {requests.map((req) => {
                               const hasAction = (isAdminOrStaff && (req.status === 'Pending' || req.status === 'Ready')) || (isStudent && req.status === 'Pending');
                               const showActionColumn = requests.some(r => (isAdminOrStaff && (r.status === 'Pending' || r.status === 'Ready')) || (isStudent && r.status === 'Pending'));
                               
                               return (
                               <TableRow key={req._id}>
                                  <TableCell>
                                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Avatar size="small" sx={{ width: 32, height: 32, fontSize: '0.8rem' }}>{req.studentId?.userId?.name?.[0]}</Avatar>
                                        <Box>
                                           <Typography variant="body2" fontWeight="bold">{req.studentId?.userId?.name}</Typography>
                                           <Typography variant="caption" color="textSecondary">{req.date} • {req.mealType}</Typography>
                                        </Box>
                                     </Box>
                                  </TableCell>
                                  <TableCell>
                                      <Chip 
                                        label={req.item === 'extraEgg' ? 'Extra Egg' : 'Extra Chicken'} 
                                        size="small" variant="outlined" 
                                        sx={{ fontWeight: 'bold' }}
                                      />
                                  </TableCell>
                                  <TableCell><Typography variant="body2" fontWeight="bold">${req.amount}</Typography></TableCell>
                                  <TableCell>
                                     <Chip 
                                        label={req.status} 
                                        size="small"
                                        icon={req.status === 'Ready' ? <CheckCircle /> : req.status === 'Pending' ? <Pending /> : undefined}
                                        sx={{ 
                                          fontWeight: 'bold',
                                          bgcolor: req.status === 'Collected' ? '#D1FAE5' : req.status === 'Pending' ? '#FEF3C7' : '#DBEAFE',
                                          color: req.status === 'Collected' ? '#065F46' : req.status === 'Pending' ? '#92400E' : '#1E40AF'
                                        }}
                                     />
                                  </TableCell>
                                  {showActionColumn && (
                                      <TableCell>
                                         {hasAction ? (
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                               {isAdminOrStaff && req.status === 'Pending' && <Button size="small" onClick={() => handleStatusUpdate(req._id, { status: 'Ready' })}>Ready</Button>}
                                               {isAdminOrStaff && req.status === 'Ready' && <Button size="small" variant="contained" onClick={() => handleStatusUpdate(req._id, { status: 'Collected' })}>Check Off</Button>}
                                               {isStudent && req.status === 'Pending' && <Button size="small" color="error" onClick={() => handleStatusUpdate(req._id, { status: 'Cancelled' })}>Cancel</Button>}
                                            </Box>
                                         ) : (
                                            <Typography variant="caption" color="textSecondary">—</Typography>
                                         )}
                                      </TableCell>
                                  )}
                                  {isAdminOrStaff && (
                                     <TableCell>
                                        <Chip 
                                          label={req.paymentStatus} 
                                          onClick={() => handleStatusUpdate(req._id, { paymentStatus: req.paymentStatus === 'Paid' ? 'Unpaid' : 'Paid' })}
                                          size="small" variant={req.paymentStatus === 'Paid' ? 'filled' : 'outlined'}
                                          color={req.paymentStatus === 'Paid' ? 'success' : 'warning'}
                                          sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                                        />
                                     </TableCell>
                                  )}
                               </TableRow>
                            );})}
                         </TableBody>
                      </Table>
                   </TableContainer>
        </Box>
      )}

      {/* Advance Request Dialog */}
      <Dialog open={reqOpen} onClose={() => setReqOpen(false)} maxWidth="xs" fullWidth>
         <DialogTitle sx={{ fontWeight: 'bold' }}>Request Extra Prep</DialogTitle>
         <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
               <TextField
                 fullWidth label="Date" type="date"
                 InputLabelProps={{ shrink: true }}
                 value={requestData.date}
                 onChange={(e) => setRequestData({ ...requestData, date: e.target.value })}
               />
               <TextField
                 select fullWidth label="Meal"
                 value={requestData.mealType}
                 onChange={(e) => setRequestData({ ...requestData, mealType: e.target.value })}
               >
                 <MenuItem value="Breakfast">Breakfast</MenuItem>
                 <MenuItem value="Lunch">Lunch</MenuItem>
                 <MenuItem value="Dinner">Dinner</MenuItem>
               </TextField>
               <TextField
                 select fullWidth label="Choice of Extra"
                 value={requestData.item}
                 onChange={(e) => setRequestData({ ...requestData, item: e.target.value })}
               >
                 <MenuItem value="extraEgg">Extra Egg</MenuItem>
                 <MenuItem value="extraChicken">Extra Chicken</MenuItem>
                 {messItems.map((item, idx) => (
                   <MenuItem key={idx} value={item.name}>{item.name} (${item.price})</MenuItem>
                 ))}
               </TextField>
               <TextField
                 select fullWidth label="Payment Method"
                 value={requestData.paymentMethod}
                 onChange={(e) => setRequestData({ ...requestData, paymentMethod: e.target.value })}
               >
                 <MenuItem value="Cash">Cash at Office</MenuItem>
                 <MenuItem value="Card">Pay Online (Stripe)</MenuItem>
                 <MenuItem value="UPI">UPI / Dashboard</MenuItem>
               </TextField>
            </Box>
         </DialogContent>
         <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setReqOpen(false)}>Later</Button>
            <Button variant="contained" onClick={handleSubmitRequest} disabled={updating} sx={{ borderRadius: 2, px: 4 }}>
               {updating ? <CircularProgress size={20} /> : 'Submit Order'}
            </Button>
         </DialogActions>
      </Dialog>

      {/* Edit & AI Dialogs (Preserved and updated for new structure) */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Edit {selectedMeal}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <TextField
              fullWidth multiline rows={4}
              label="Menu Items, Allergens & Type"
              placeholder="e.g. Omelette (Egg, Dairy) [Egg], Toast (Gluten) [Veg]"
              helperText="Format: Item Name (Allergen1, Allergen2) [Veg/Non-Veg/Egg]"
              value={editData.items}
              onChange={(e) => setEditData({ ...editData, items: e.target.value })}
            />
            <TextField
               fullWidth label="Serving Time" value={editData.time}
               onChange={(e) => setEditData({ ...editData, time: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveMeal} disabled={updating}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={aiOpen} 
        onClose={() => { setAiOpen(false); setAiDraft(null); }} 
        maxWidth={aiDraft ? "md" : "xs"} 
        fullWidth
      >
         <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesome color="primary" /> AI Menu Architect
         </DialogTitle>
         <DialogContent sx={{ py: 2 }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Generate a custom meal plan for **{days[dayTab]}**. 
            </Typography>
            
            <Grid container spacing={3}>
              <Grid xs={12} md={aiDraft ? 4 : 12}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <TextField
                    select fullWidth label="Dietary Theme"
                    value={aiTheme}
                    onChange={(e) => setAiTheme(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  >
                     <MenuItem value="Healthy Balanced">Healthy Balanced</MenuItem>
                     <MenuItem value="North Indian Tradition">North Indian Tradition</MenuItem>
                     <MenuItem value="South Indian Special">South Indian Special</MenuItem>
                     <MenuItem value="Continental">Continental Lite</MenuItem>
                     <MenuItem value="High Protein">High Protein</MenuItem>
                  </TextField>

                  <TextField
                    fullWidth multiline rows={4}
                    label="Kitchen Stock / Constraints"
                    placeholder="e.g., We have extra spinach and eggs. No milk today."
                    value={aiConstraints}
                    onChange={(e) => setAiConstraints(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />

                  <Button 
                    fullWidth variant="contained" 
                    onClick={handleAiSuggest} 
                    disabled={updating}
                    startIcon={updating ? <CircularProgress size={20} color="inherit" /> : <AutoAwesome />}
                    sx={{ borderRadius: 3, py: 1.5 }}
                  >
                    {aiDraft ? 'Regenerate Draft' : 'Predict Menu'}
                  </Button>
                </Box>
              </Grid>

              {aiDraft && (
                <Grid xs={12} md={8}>
                  <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: 4, border: '1px solid #E2E8F0' }}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Info fontSize="small" color="primary" /> Draft Preview for {days[dayTab]}
                    </Typography>
                    
                    <Grid container spacing={2}>
                      {['breakfast', 'lunch', 'snacks', 'dinner'].map(meal => (
                        <Grid xs={12} sm={6} key={meal}>
                          <Typography variant="caption" fontWeight="900" sx={{ textTransform: 'uppercase', color: 'primary.main', mb: 1, display: 'block' }}>
                            {meal}
                          </Typography>
                          <TextField
                            fullWidth multiline rows={3}
                            variant="outlined"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'white', fontSize: '0.85rem' } }}
                            value={aiDraft[meal].items.map((i: any) => i.allergens.length > 0 ? `${i.name} (${i.allergens.join(', ')})` : i.name).join('\n')}
                            onChange={(e) => {
                               const newItems = e.target.value.split('\n').map(line => {
                                 const match = line.match(/(.+?)\s*\((.+?)\)/);
                                 if (match) return { name: match[1].trim(), allergens: match[2].split(',').map(a => a.trim()) };
                                 return { name: line.trim(), allergens: [] };
                               }).filter(i => i.name !== '');
                               setAiDraft({ ...aiDraft, [meal]: { ...aiDraft[meal], items: newItems } });
                            }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Grid>
              )}
            </Grid>
         </DialogContent>
         <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => { setAiOpen(false); setAiDraft(null); }}>Cancel</Button>
            {aiDraft && (
              <Button 
                variant="contained" 
                color="success"
                onClick={handleApplyDraft} 
                disabled={updating}
                sx={{ borderRadius: 2, px: 4, fontWeight: 'bold' }}
              >
                Apply to Schedule
              </Button>
            )}
         </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default MessMenu;
