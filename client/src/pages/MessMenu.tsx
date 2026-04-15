import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, Grid, Paper, Tabs, Tab, Button, Card, CardContent, 
  Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, Snackbar, Alert, MenuItem, IconButton, Tooltip,
  InputAdornment
} from '@mui/material';
import { 
  AutoAwesome, CalendarMonth, LocalDining, Edit, Save, 
  AddCircle, RestartAlt, Timer, ContentPaste, Info
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const MessMenu: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  
  const [tabIndex, setTabIndex] = useState(0);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const [menuData, setMenuData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Dialog States
  const [editOpen, setEditOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
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
      setMenuData(res.data);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to fetch menu', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  useEffect(() => {
    // Update local special note state when day changes
    const dayData = menuData.find(d => d.dayOfWeek === days[tabIndex]);
    setSpecialNote(dayData?.specialNote || '');
  }, [tabIndex, menuData]);

  const currentDayData = menuData.find(d => d.dayOfWeek === days[tabIndex]) || {
    dayOfWeek: days[tabIndex],
    breakfast: { items: [], time: '08:00 AM' },
    lunch: { items: [], time: '01:00 PM' },
    snacks: { items: [], time: '05:00 PM' },
    dinner: { items: [], time: '08:30 PM' },
    specialNote: ''
  };

  const handleEditClick = (meal: string) => {
    setSelectedMeal(meal);
    const mealData = currentDayData[meal.toLowerCase()];
    setEditData({
      items: mealData?.items?.join(', ') || '',
      time: mealData?.time || ''
    });
    setEditOpen(true);
  };

  const handleSaveMeal = async () => {
    try {
      setUpdating(true);
      const updatedDay = { ...currentDayData };
      updatedDay[selectedMeal.toLowerCase()] = {
        items: editData.items.split(',').map(i => i.trim()).filter(i => i !== ''),
        time: editData.time
      };
      
      await api.put(`/mess/${days[tabIndex]}`, updatedDay);
      setSnackbar({ open: true, message: `${selectedMeal} updated successfully!`, severity: 'success' });
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
      const res = await api.post('/mess/suggest', { theme: aiTheme });
      const suggested = res.data;
      
      // Update the whole day with AI suggestions
      const updatedDay = {
        ...currentDayData,
        breakfast: { ...currentDayData.breakfast, items: suggested.breakfast.items },
        lunch: { ...currentDayData.lunch, items: suggested.lunch.items },
        snacks: { ...currentDayData.snacks, items: suggested.snacks.items },
        dinner: { ...currentDayData.dinner, items: suggested.dinner.items },
      };

      await api.put(`/mess/${days[tabIndex]}`, updatedDay);
      setSnackbar({ open: true, message: `AI generated a ${aiTheme} menu for ${days[tabIndex]}!`, severity: 'success' });
      setAiOpen(false);
      fetchMenu();
    } catch (err) {
      setSnackbar({ open: true, message: 'AI generation failed', severity: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateNote = async () => {
    try {
      setUpdating(true);
      await api.put(`/mess/${days[tabIndex]}`, { ...currentDayData, specialNote: specialNote });
      setSnackbar({ open: true, message: 'Note updated!', severity: 'success' });
      fetchMenu();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update note', severity: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="800" sx={{ color: '#0F172A' }}>Mess & Nutrition</Typography>
          <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>Weekly meal schedules and nutrition planning.</Typography>
        </Box>
        {isAdmin && (
          <Button 
            variant="contained" 
            startIcon={<AutoAwesome />} 
            onClick={() => setAiOpen(true)}
            sx={{ borderRadius: 3, px: 3, py: 1.5, boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)' }}
          >
            AI Menu Architect
          </Button>
        )}
      </Box>

      <Paper sx={{ width: '100%', mb: 4, borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
        <Tabs
          value={tabIndex}
          onChange={(_, v) => setTabIndex(v)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ bgcolor: '#F8FAFC', '& .MuiTab-root': { fontWeight: 700, py: 2.5, fontSize: '0.9rem', color: '#64748B' }, '& .Mui-selected': { color: '#2B5A81 !important' } }}
        >
          {days.map((day) => <Tab key={day} label={day} />)}
        </Tabs>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={tabIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', fontWeight: 800, color: '#0F172A' }}>
                <CalendarMonth sx={{ mr: 1.5 }} color="primary" /> {days[tabIndex]}'s Menu
              </Typography>
              {isAdmin && (
                <Tooltip title="Copy this menu to other days">
                  <IconButton color="primary"><ContentPaste /></IconButton>
                </Tooltip>
              )}
            </Box>

            <Grid container spacing={3}>
              {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map((meal) => {
                const data = currentDayData[meal.toLowerCase()];
                return (
                  <Grid xs={12} sm={6} md={3} key={meal}>
                    <Card sx={{ 
                      height: '100%', 
                      borderRadius: 4,
                      border: '1px solid #f0f0f0',
                      boxShadow: '0 4px 12px 0 rgba(0,0,0,0.03)',
                      position: 'relative',
                      overflow: 'visible',
                    }}>
                      {isAdmin && (
                        <IconButton 
                          size="small"
                          onClick={() => handleEditClick(meal)}
                          sx={{ 
                            position: 'absolute', top: -10, right: -10, 
                            bgcolor: 'primary.main', color: 'white', 
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                            zIndex: 2,
                            '&:hover': { bgcolor: 'primary.dark' }
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      )}
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ p: 1, bgcolor: '#E0F2FE', borderRadius: 2, mr: 1.5, display: 'flex' }}>
                              <LocalDining fontSize="small" sx={{ color: '#0369A1' }} />
                            </Box>
                            <Typography variant="h6" fontWeight="800" sx={{ color: 'text.primary' }}>{meal}</Typography>
                          </Box>
                          <Typography variant="caption" sx={{ fontWeight: 700, px: 1, py: 0.5, bgcolor: '#F1F5F9', borderRadius: 1, color: '#475569' }}>
                            {data?.time}
                          </Typography>
                        </Box>
                        
                        <Divider sx={{ mb: 2.5 }} />
                        
                        <Box component="ul" sx={{ pl: 0, listStyle: 'none' }}>
                          {data?.items?.length > 0 ? (
                            data.items.map((item: string, i: number) => (
                              <Box component="li" key={i} sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <Box sx={{ width: 6, height: 6, bgcolor: '#38BDF8', borderRadius: '50%', mr: 1.5 }} />
                                <Typography variant="body2" fontWeight="700" sx={{ color: 'text.primary' }}>{item}</Typography>
                              </Box>
                            ))
                          ) : (
                            <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', fontWeight: 500 }}>No items added</Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            {/* Special Note Section */}
            <Box sx={{ mt: 5 }}>
              <Paper sx={{ 
                p: 3, 
                bgcolor: '#F8FAFC', 
                border: '1px solid #E2E8F0', 
                borderRadius: 4,
                display: 'flex',
                flexDirection: isAdmin ? 'column' : 'row',
                alignItems: isAdmin ? 'flex-start' : 'center',
                gap: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Box sx={{ p: 1.5, bgcolor: 'primary.main', borderRadius: '50%', display: 'flex', color: 'white' }}>
                    <Info />
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#1E293B' }}>Chef's Special Note</Typography>
                    {isAdmin ? (
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <TextField 
                          fullWidth 
                          variant="standard" 
                          placeholder="Add a special note for this day..."
                          value={specialNote}
                          onChange={(e) => setSpecialNote(e.target.value)}
                          sx={{ '& .MuiInputBase-input': { color: '#0F172A', fontWeight: 600 } }}
                        />
                        <Button size="small" variant="contained" onClick={handleUpdateNote}>Update</Button>
                      </Box>
                    ) : (
                      <Typography variant="body2" fontWeight="700" sx={{ color: 'primary.main', fontSize: '1rem' }}>
                        {currentDayData.specialNote || 'No special announcements for today.'}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Paper>
            </Box>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Edit Meal Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Edit {selectedMeal}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 1 }}>
            <TextField
              sx={{ mt: 1 }}
              fullWidth
              label="Menu Items"
              placeholder="e.g. Idli, Sambar, Tea"
              helperText="Separate multiple items with commas"
              value={editData.items}
              onChange={(e) => setEditData({ ...editData, items: e.target.value })}
            />
            <TextField
              fullWidth
              label="Serving Time"
              placeholder="e.g. 08:00 AM"
              value={editData.time}
              onChange={(e) => setEditData({ ...editData, time: e.target.value })}
              slotProps={{ 
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Timer sx={{ mr: 1, color: 'text.secondary', fontSize: '1rem' }} />
                    </InputAdornment>
                  )
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveMeal} disabled={updating} sx={{ borderRadius: 2, px: 4 }}>
            {updating ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI Suggest Dialog */}
      <Dialog open={aiOpen} onClose={() => setAiOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesome color="primary" /> AI Menu Architect
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Gemini will generate a scientifically balanced meal plan for **{days[tabIndex]}** based on your selected theme.
          </Typography>
          <TextField
            select
            fullWidth
            label="Select Dietary Theme"
            value={aiTheme}
            onChange={(e) => setAiTheme(e.target.value)}
          >
            <MenuItem value="Healthy Balanced">Healthy Balanced</MenuItem>
            <MenuItem value="North Indian">North Indian Tradition</MenuItem>
            <MenuItem value="South Indian">South Indian Special</MenuItem>
            <MenuItem value="Continental">Continental Lite</MenuItem>
            <MenuItem value="High Protein">High Protein (Sports)</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setAiOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAiSuggest} disabled={updating} sx={{ borderRadius: 2, px: 3 }}>
            {updating ? <CircularProgress size={24} color="inherit" /> : 'Generate & Apply'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default MessMenu;
