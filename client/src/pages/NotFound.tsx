import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { motion } from 'framer-motion';
import { RocketLaunch, Home, ExploreOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="md">
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: 4
                }}
            >
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, type: 'spring' }}
                >
                    <Box
                        sx={{
                            position: 'relative',
                            display: 'inline-block'
                        }}
                    >
                        <ExploreOff 
                            sx={{ 
                                fontSize: 160, 
                                color: 'primary.main', 
                                opacity: 0.1,
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)'
                            }} 
                        />
                        <Typography 
                            variant="h1" 
                            fontWeight="900" 
                            sx={{ 
                                fontSize: { xs: '8rem', md: '12rem' },
                                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                lineHeight: 1,
                                zIndex: 1
                            }}
                        >
                            404
                        </Typography>
                    </Box>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Lost in Space?
                    </Typography>
                    <Typography variant="body1" color="textSecondary" sx={{ mb: 4, maxWidth: 500 }}>
                        The page you are looking for has drifted into another galaxy. 
                        Let's get you back to the home base.
                    </Typography>
                </motion.div>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                >
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button 
                            variant="contained" 
                            size="large" 
                            startIcon={<Home />}
                            onClick={() => navigate('/')}
                            sx={{ 
                                borderRadius: 4, 
                                px: 4, 
                                py: 1.5,
                                fontSize: '1.1rem',
                                boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)',
                                '&:hover': {
                                    boxShadow: '0 12px 24px rgba(59, 130, 246, 0.4)',
                                    transform: 'translateY(-2px)'
                                }
                            }}
                        >
                            Back to Earth
                        </Button>
                        <Button 
                            variant="outlined" 
                            size="large" 
                            startIcon={<ExploreOff />}
                            onClick={() => navigate(-1)}
                            sx={{ 
                                borderRadius: 4, 
                                px: 4,
                                py: 1.5,
                                fontSize: '1.1rem'
                            }}
                        >
                            Go Back
                        </Button>
                    </Box>
                </motion.div>

                {/* Decorative floating elements */}
                <motion.div
                    animate={{ 
                        y: [0, -15, 0],
                        rotate: [0, 5, 0]
                    }}
                    transition={{ 
                        repeat: Infinity, 
                        duration: 4,
                        ease: "easeInOut"
                    }}
                    style={{ position: 'absolute', top: '15%', right: '10%' }}
                >
                    <RocketLaunch sx={{ fontSize: 40, color: 'secondary.main', opacity: 0.5, transform: 'rotate(-45deg)' }} />
                </motion.div>
            </Box>
        </Container>
    );
};

export default NotFound;
