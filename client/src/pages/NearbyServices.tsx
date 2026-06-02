import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, Grid, Card, CardContent, 
  Button, IconButton, CircularProgress, Chip, 
  Divider, Tooltip
} from '@mui/material';
import { 
  LocalHospital, Policy, Train, 
  ShoppingBag, MyLocation, Directions, TravelExplore
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const NearbyServices: React.FC = () => {
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [category, setCategory] = useState<string>('hospital');

    const categories = [
        { id: 'hospital', label: 'Hospitals', icon: <LocalHospital />, color: '#EF4444', osmTags: ['amenity=hospital', 'amenity=clinic'] },
        { id: 'police', label: 'Police', icon: <Policy />, color: '#3B82F6', osmTags: ['amenity=police'] },
        { id: 'transport', label: 'Transport', icon: <Train />, color: '#F59E0B', osmTags: ['railway=station', 'amenity=bus_station', 'highway=bus_stop'] },
        { id: 'shopping', label: 'Malls', icon: <ShoppingBag />, color: '#8B5CF6', osmTags: ['shop=mall', 'shop=department_store'] },
    ];

    const getUserLocation = () => {
        if ("geolocation" in navigator) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                    fetchNearby(position.coords.latitude, position.coords.longitude, category);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    const fallback: [number, number] = [12.9716, 77.5946];
                    setUserLocation(fallback);
                    fetchNearby(fallback[0], fallback[1], category);
                }
            );
        }
    };

    const fetchNearby = async (lat: number, lon: number, catId: string) => {
        setLoading(true);
        const activeCat = categories.find(c => c.id === catId);
        const tags = activeCat?.osmTags || ['amenity=hospital'];
        
        const tagQueries = tags.map(tag => `
            node[${tag}](around:5000, ${lat}, ${lon});
            way[${tag}](around:5000, ${lat}, ${lon});
            relation[${tag}](around:5000, ${lat}, ${lon});
        `).join('');

        const query = `
            [out:json];
            (
              ${tagQueries}
            );
            out center;
        `;
        
        try {
            const res = await axios.post('https://overpass-api.de/api/interpreter', query);
            const results = res.data.elements.filter((e: any) => e.tags?.name);
            setServices(results.map((e: any) => ({
                id: e.id,
                name: e.tags.name,
                lat: e.lat || e.center?.lat,
                lon: e.lon || e.center?.lon,
                tags: e.tags
            })));
        } catch (err) {
            console.error("Error fetching nearby services:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getUserLocation();
    }, []);

    const handleCategoryChange = (catId: string) => {
        setCategory(catId);
        if (userLocation) {
            fetchNearby(userLocation[0], userLocation[1], catId);
        }
    };

    return (
        <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} sx={{ width: '100%' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight="900" sx={{ color: '#0F172A' }}>Nearby Services</Typography>
                    <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5, fontWeight: 500 }}>
                        Find essential facilities and transport hubs around your current location.
                    </Typography>
                </Box>
            </Box>

            {/* Category Toggle */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4, overflowX: 'auto', pb: 1 }}>
                {categories.map((cat) => (
                    <Chip
                        key={cat.id}
                        icon={cat.icon}
                        label={cat.label}
                        onClick={() => handleCategoryChange(cat.id)}
                        sx={{ 
                            px: 1, py: 2.5, borderRadius: 3, fontWeight: 'bold',
                            bgcolor: category === cat.id ? `${cat.color}15` : 'transparent',
                            color: category === cat.id ? cat.color : '#64748B',
                            border: '1px solid',
                            borderColor: category === cat.id ? cat.color : '#E2E8F0',
                            '&:hover': { bgcolor: `${cat.color}10` }
                        }}
                    />
                ))}
                <Button 
                    startIcon={<MyLocation />} 
                    onClick={getUserLocation}
                    sx={{ ml: 'auto', borderRadius: 3, fontWeight: 'bold' }}
                >
                    Recenter
                </Button>
            </Box>

            <Grid container spacing={2}>
                {loading ? (
                    <Grid item xs={12} sx={{ py: 10, textAlign: 'center' }}>
                        <CircularProgress />
                    </Grid>
                ) : services.length > 0 ? (
                    services.map(service => (
                        <Grid item xs={12} sm={6} md={4} key={service.id}>
                            <Card sx={{ borderRadius: 4, border: '1px solid #E2E8F0', boxShadow: 'none', '&:hover': { borderColor: 'primary.main' } }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Box sx={{ p: 1, bgcolor: `${categories.find(c => c.id === category)?.color}15`, color: categories.find(c => c.id === category)?.color, borderRadius: 2 }}>
                                            {categories.find(c => c.id === category)?.icon}
                                        </Box>
                                        <IconButton size="small" href={`https://www.google.com/maps/dir/?api=1&destination=${service.lat},${service.lon}`} target="_blank">
                                            <Directions color="primary" />
                                        </IconButton>
                                    </Box>
                                    <Typography variant="subtitle1" fontWeight="bold" noWrap>{service.name}</Typography>
                                    <Typography variant="caption" color="textSecondary" noWrap display="block">
                                        {service.tags?.['addr:street'] || 'Nearby Services'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                ) : (
                    <Grid item xs={12} sx={{ py: 10, textAlign: 'center' }}>
                        <TravelExplore sx={{ fontSize: 60, color: '#CBD5E1', mb: 2 }} />
                        <Typography color="textSecondary">No {category} found within 5km of your location.</Typography>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default NearbyServices;
