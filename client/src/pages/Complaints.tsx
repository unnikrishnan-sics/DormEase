import React from 'react';
import { Typography, Box, Grid, Card, CardContent, Chip, Button, TextField, List, ListItem, ListItemText, Divider, Paper } from '@mui/material';
import { AutoAwesome, Warning, CheckCircle, HourglassEmpty } from '@mui/icons-material';

import { motion } from 'framer-motion';

const Complaints: React.FC = () => {
  const complaints = [
    { 
      id: 1, 
      user: 'John Doe', 
      issue: 'AC not working in Room 101', 
      status: 'Logged', 
      priority: 'High', 
      date: '2026-04-14',
      aiSummary: 'AC Unit malfunction in Room 101. Requires electrician.',
      aiSentiment: 'Negative',
      aiSuggestedResponse: 'Hello John, we have logged your complaint regarding the AC in Room 101. A technician has been assigned and will be there within 2 hours.'
    },
    { id: 2, user: 'Jane Smith', issue: 'Leaking tap in bathroom', status: 'In Progress', priority: 'Medium', date: '2026-04-13' },
  ];

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">Complaints</Typography>
        <Button variant="contained" startIcon={<Warning />} sx={{ borderRadius: 2, boxShadow: 4, bgcolor: 'error.main' }}>
          Report Issue
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 4, boxShadow: "0 4px 20px 0 rgba(0,0,0,0.05)", p: 0, overflow: 'hidden' }}>
            {complaints.map((c, index) => (
              <React.Fragment key={c.id}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ListItem alignItems="flex-start" sx={{ py: 3, px: 4, '&:hover': { bgcolor: 'rgba(0,0,0,0.01)' } }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6" fontWeight="700">{c.issue}</Typography>
                          <Chip 
                            label={c.status} 
                            size="small" 
                            color={c.status === 'Logged' ? 'error' : 'warning'} 
                            sx={{ fontWeight: 'bold', borderRadius: 1.5 }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography component="span" variant="subtitle2" color="textPrimary" fontWeight="bold">
                              {c.user}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              • {c.date}
                            </Typography>
                          </Box>
                          {c.aiSummary && (
                            <Box
                              component={motion.div}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.3 }}
                              sx={{ 
                                mt: 2, 
                                p: 2.5, 
                                bgcolor: 'aliceblue', 
                                borderRadius: 3, 
                                border: '1px solid',
                                borderColor: 'primary.light',
                                position: 'relative'
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <AutoAwesome fontSize="small" color="primary" sx={{ mr: 1 }} />
                                <Typography variant="subtitle2" color="primary.main" fontWeight="800">SMART ANALYSIS</Typography>
                              </Box>
                              <Typography variant="body2" sx={{ mb: 1.5, color: 'text.primary', lineHeight: 1.6 }}>
                                <strong>Summary:</strong> {c.aiSummary}
                              </Typography>
                              <Typography variant="body2" sx={{ p: 2, bgcolor: 'white', borderRadius: 2, border: '1px dashed #2563EB', italic: 'true' }}>
                                <strong>Suggested Response:</strong> {c.aiSuggestedResponse}
                              </Typography>
                              <Box sx={{ mt: 2, display: 'flex', gap: 1.5 }}>
                                <Button size="small" variant="contained" sx={{ borderRadius: 1.5 }}>Use Draft</Button>
                                <Button size="small" variant="outlined" sx={{ borderRadius: 1.5 }}>Escalate</Button>
                              </Box>
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                </motion.div>
                {index < complaints.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 4, boxShadow: "0 4px 20px 0 rgba(0,0,0,0.05)" }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Resolution Pulse</Typography>
            <Box sx={{ mt: 3 }}>
              {[{ label: 'Open Issues', val: 5, color: '#EF4444' }, { label: 'In Progress', val: 3, color: '#F59E0B' }, { label: 'Resolved Today', val: 12, color: '#10B981' }].map((item) => (
                <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2.5, alignItems: 'center' }}>
                  <Typography variant="body2" color="textSecondary" fontWeight="medium">{item.label}</Typography>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: item.color }}>{item.val}</Typography>
                </Box>
              ))}
            </Box>
            <Divider sx={{ my: 2 }} />
            <Button fullWidth variant="soft" color="primary">View Detailed Report</Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};


export default Complaints;
