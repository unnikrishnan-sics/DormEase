import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Grid, TextField, Button, 
    CircularProgress, Alert, Container, Divider, Card, CardContent, IconButton, InputAdornment 
} from '@mui/material';
import { Save, Settings as SettingsIcon, AccessTime, Add, Delete, Restaurant } from '@mui/icons-material';
import api from '../services/api';

const Settings: React.FC = () => {
    const [settings, setSettings] = useState({
        gateOpenTime: '06:00',
        gateCloseTime: '21:00',
        extraEggPrice: 10,
        extraChickenPrice: 50,
        extrasDailyLimit: 9,
        messItems: [] as { name: string; price: number; available: boolean }[]
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/attendance/settings');
                if (response.data) {
                    setSettings({
                        gateOpenTime: response.data.gateOpenTime,
                        gateCloseTime: response.data.gateCloseTime,
                        extraEggPrice: response.data.messPrices?.extraEgg || 10,
                        extraChickenPrice: response.data.messPrices?.extraChicken || 50,
                        extrasDailyLimit: response.data.extrasDailyLimit || 9,
                        messItems: response.data.messItems || []
                    });
                }
            } catch (err) {
                console.error('Failed to fetch settings:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            await api.put('/attendance/settings', settings);
            setMessage({ type: 'success', text: 'Gate timings updated successfully!' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update settings' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="md">
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="900" sx={{ color: '#0F172A', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <SettingsIcon fontSize="large" color="primary" />
                    System Settings
                </Typography>
                <Typography variant="body1" color="textSecondary">
                    Configure global parameters for the DormEase management system.
                </Typography>
            </Box>

            <Grid container spacing={4}>
                <Grid item xs={12} md={7}>
                    <Paper 
                        elevation={0} 
                        sx={{ 
                            p: 4, 
                            borderRadius: 6, 
                            border: '1px solid', 
                            borderColor: 'divider',
                            bgcolor: 'background.paper',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                        }}
                    >
                        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <AccessTime color="primary" />
                            <Typography variant="h6" fontWeight="bold">Gate Access Timings</Typography>
                        </Box>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
                            Define the active hours for student entry and exit. Scans outside these hours will be automatically flagged as "Late Entry" in the dashboard.
                        </Typography>

                        <form onSubmit={handleSave}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Gate Open Time"
                                        type="time"
                                        value={settings.gateOpenTime}
                                        onChange={(e) => setSettings({ ...settings, gateOpenTime: e.target.value })}
                                        InputLabelProps={{ shrink: true }}
                                        inputProps={{ step: 300 }} // 5 min intervals
                                        variant="outlined"
                                        sx={{ 
                                            '& .MuiOutlinedInput-root': { borderRadius: 3 }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Gate Close Time"
                                        type="time"
                                        value={settings.gateCloseTime}
                                        onChange={(e) => setSettings({ ...settings, gateCloseTime: e.target.value })}
                                        InputLabelProps={{ shrink: true }}
                                        inputProps={{ step: 300 }}
                                        variant="outlined"
                                        sx={{ 
                                            '& .MuiOutlinedInput-root': { borderRadius: 3 }
                                        }}
                                    />
                                </Grid>
                                
                                {message && (
                                    <Grid item xs={12}>
                                        <Alert 
                                            severity={message.type} 
                                            sx={{ borderRadius: 3, fontWeight: 500 }}
                                            onClose={() => setMessage(null)}
                                        >
                                            {message.text}
                                        </Alert>
                                    </Grid>
                                )}

                                 <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Restaurant color="primary" />
                                        <Typography variant="h6" fontWeight="bold">Mess & Extra Prep Settings</Typography>
                                    </Box>
                                </Grid>
                                
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Daily Extras Limit (Hostel Wide)"
                                        type="number"
                                        value={settings.extrasDailyLimit}
                                        onChange={(e) => setSettings({ ...settings, extrasDailyLimit: Number(e.target.value) })}
                                        helperText="Total requests allowed per item per meal"
                                        variant="outlined"
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Box sx={{ mt: 2, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Typography variant="subtitle1" fontWeight="800">Dynamic Extra Items List</Typography>
                                        <Button 
                                            startIcon={<Add />} 
                                            size="small" 
                                            variant="outlined"
                                            onClick={() => setSettings({
                                                ...settings,
                                                messItems: [...settings.messItems, { name: '', price: 0, available: true }]
                                            })}
                                            sx={{ borderRadius: 2 }}
                                        >
                                            Add New Item
                                        </Button>
                                    </Box>
                                    <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                                        Add variety of extra items students can purchase (e.g. Milk, Fruit, Special Dishes).
                                    </Typography>

                                    <Grid container spacing={2}>
                                        {settings.messItems.map((item, index) => (
                                            <React.Fragment key={index}>
                                                <Grid item xs={12} sm={7}>
                                                    <TextField
                                                        fullWidth
                                                        label="Item Name"
                                                        placeholder="e.g. Extra Milk"
                                                        value={item.name}
                                                        onChange={(e) => {
                                                            const newItems = [...settings.messItems];
                                                            newItems[index].name = e.target.value;
                                                            setSettings({ ...settings, messItems: newItems });
                                                        }}
                                                        variant="outlined"
                                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                                    />
                                                </Grid>
                                                <Grid item xs={8} sm={4}>
                                                    <TextField
                                                        fullWidth
                                                        label="Price ($)"
                                                        type="number"
                                                        value={item.price}
                                                        onChange={(e) => {
                                                            const newItems = [...settings.messItems];
                                                            newItems[index].price = Number(e.target.value);
                                                            setSettings({ ...settings, messItems: newItems });
                                                        }}
                                                        variant="outlined"
                                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                                    />
                                                </Grid>
                                                <Grid item xs={4} sm={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <IconButton color="error" onClick={() => {
                                                        const newItems = settings.messItems.filter((_, i) => i !== index);
                                                        setSettings({ ...settings, messItems: newItems });
                                                    }}>
                                                        <Delete />
                                                    </IconButton>
                                                </Grid>
                                            </React.Fragment>
                                        ))}
                                    </Grid>
                                </Grid>


                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                        <Button 
                                            type="submit" 
                                            variant="contained" 
                                            disabled={saving}
                                            startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                                            sx={{ 
                                                borderRadius: 3, 
                                                px: 4, 
                                                py: 1.2, 
                                                fontWeight: 'bold',
                                                textTransform: 'none',
                                                fontSize: '1rem'
                                            }}
                                        >
                                            {saving ? 'Saving...' : 'Save Settings'}
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </form>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={5}>
                    <Card sx={{ borderRadius: 6, border: '1px solid', borderColor: 'divider', bgcolor: '#F8FAFC' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                Configuration Summary
                            </Typography>
                            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Box>
                                    <Typography variant="caption" color="textSecondary" fontWeight="bold" sx={{ textTransform: 'uppercase' }}>
                                        Status
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10B981' }} />
                                        <Typography variant="body2" fontWeight="600">Active</Typography>
                                    </Box>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="textSecondary" fontWeight="bold" sx={{ textTransform: 'uppercase' }}>
                                        Current Window
                                    </Typography>
                                    <Typography variant="body1" fontWeight="900" sx={{ mt: 0.5 }}>
                                        {settings.gateOpenTime} — {settings.gateCloseTime}
                                    </Typography>
                                </Box>
                                <Alert severity="info" sx={{ mt: 1, borderRadius: 3, bgcolor: 'white', border: '1px solid rgba(0,0,0,0.05)' }}>
                                    Changes take effect immediately for all subsequent scans.
                                </Alert>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Settings;
