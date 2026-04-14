import React from 'react';
import { Typography, Box, Grid, Paper, Tabs, Tab, Button, Card, CardContent, Divider } from '@mui/material';
import { AutoAwesome, CalendarMonth, LocalDining } from '@mui/icons-material';

import { motion, AnimatePresence } from 'framer-motion';

const MessMenu: React.FC = () => {
  const [value, setValue] = React.useState(0);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const menu = {
    breakfast: ['Idli', 'Sambar', 'Chutney', 'Tea/Coffee'],
    lunch: ['Rice', 'Dal', 'Mix Veg', 'Paneer Butter Masala', 'Curd'],
    snacks: ['Samosa', 'Tea'],
    dinner: ['Roti', 'Dal Tadka', 'Chicken Curry', 'Salad']
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="800">Mess & Nutrition</Typography>
        <Button 
          variant="contained" 
          startIcon={<AutoAwesome />} 
          sx={{ borderRadius: 3, px: 3, py: 1.5, boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.4)' }}
        >
          Generate Healthy Menu
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 4, borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ '& .MuiTab-root': { fontWeight: 600, py: 2 } }}
        >
          {days.map((day) => <Tab key={day} label={day} />)}
        </Tabs>
      </Paper>

      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Typography variant="h5" sx={{ mb: 4, display: 'flex', alignItems: 'center', fontWeight: 700 }}>
            <CalendarMonth sx={{ mr: 1.5 }} color="primary" /> {days[value]}'s Selection
          </Typography>

          <Grid container spacing={3}>
            {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map((meal, idx) => (
              <Grid item xs={12} sm={6} md={3} key={meal}>
                <Card sx={{ 
                  height: '100%', 
                  borderRadius: 4,
                  border: '1px solid #E5E7EB',
                  boxShadow: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 10px 20px -5px rgba(0,0,0,0.05)',
                    transform: 'translateY(-4px)'
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
                      <Box sx={{ p: 1, bgcolor: 'rgba(20, 184, 166, 0.1)', borderRadius: 2, mr: 1.5, display: 'flex' }}>
                        <LocalDining fontSize="small" color="secondary" />
                      </Box>
                      <Typography variant="h6" fontWeight="800">{meal}</Typography>
                    </Box>
                    <Divider sx={{ mb: 2.5 }} />
                    <Box component="ul" sx={{ pl: 0, listStyle: 'none' }}>
                      {(menu as any)[meal.toLowerCase()].map((item: string) => (
                        <Box component="li" key={item} sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                          <Box sx={{ width: 6, height: 6, bgcolor: 'secondary.main', borderRadius: '50%', mr: 1.5 }} />
                          <Typography variant="body2" fontWeight="500">
                            {item}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Paper sx={{ 
              mt: 6, 
              p: 3, 
              bgcolor: '#F0FDF4', 
              border: '1px solid #DCFCE7', 
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              <Box sx={{ p: 1.5, bgcolor: '#BBF7D0', borderRadius: '50%', display: 'flex' }}>
                <AutoAwesome color="success" />
              </Box>
              <Box>
                <Typography variant="subtitle1" color="success.main" fontWeight="800">
                  Kitchen Chef's Note
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight="500">
                  Special Sunday Dessert: Homemade Ice Cream and Fresh Mediterranean Fruit Salad.
                </Typography>
              </Box>
            </Paper>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};


export default MessMenu;
