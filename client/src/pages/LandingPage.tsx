import React from 'react';
import { Box, Container, Typography, Button, Grid, Paper, Accordion, AccordionSummary, AccordionDetails, Stack, TextField } from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Bed, Fastfood, Message, Security, 
  KeyboardArrowDown, Wifi, ReceiptLong,
  AutoAwesome, Login, Foundation
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';

// Fix for React DOM warning on Stack props
const StyledStack = (props: any) => {
  const { justifyContent, alignItems, ...rest } = props;
  return <Stack {...rest} sx={{ justifyContent, alignItems, ...rest.sx }} />;
};
import logo from '../assets/logo.png';

const StudentHeroMockup = () => {
  return (
    <Box sx={{ 
      position: 'relative', 
      width: '100%',
      height: '100%', 
      minHeight: { xs: 350, md: 500 }, 
      display: 'flex', 
      alignItems: 'center',
      justifyContent: 'center',
      perspective: '1000px'
    }}>
      {/* Intense Background Glow */}
      <Box sx={{
        position: 'absolute',
        width: '120%',
        height: '120%',
        background: 'radial-gradient(circle, rgba(82, 168, 158, 0.2) 0%, rgba(43, 90, 129, 0.1) 40%, transparent 70%)',
        filter: 'blur(50px)',
        zIndex: 0,
        animation: 'glowPulse 6s infinite'
      }} />

      {/* Main Feature Image / Clean Card */}
      <motion.div
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ zIndex: 2, width: '90%', maxWidth: '400px' }}
      >
        <Paper sx={{
          overflow: 'hidden',
          borderRadius: 6,
          background: 'rgba(30, 41, 59, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6)'
        }}>
          {/* Aesthetic Room Image */}
          <Box 
            component="img" 
            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800" 
            alt="Premium Room"
            sx={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }}
          />
          <Stack spacing={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="800">Shared & Private Rooms</Typography>
              {/* <Box sx={{ px: 1.5, py: 0.5, borderRadius: 8, bgcolor: 'rgba(20, 184, 166, 0.15)', color: '#14B8A6', fontSize: '0.75rem', fontWeight: 'bold' }}>AVAILABLE</Box> */}
            </Box>
            <Typography variant="body2" color="text.secondary">
              Fully furnished with high-speed WiFi, dedicated study space, and ensuite bathroom.
            </Typography>
            <Button variant="contained" fullWidth sx={{ mt: 1, bgcolor: 'var(--primary)', borderRadius: 2 }}>
              Book Your View
            </Button>
          </Stack>
        </Paper>
      </motion.div>
    </Box>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();

  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  const bentoGrid = [
    { title: 'Nutritious AI Menus', desc: 'Vote on meals, view your daily nutritional intake, and request custom dietary adjustments.', icon: <AutoAwesome />, span: { xs: 12, md: 6 }, gradient: 'linear-gradient(135deg, rgba(82, 168, 158, 0.1) 0%, rgba(15, 23, 42, 0.5) 100%)' },
    { title: 'Seamless Comfort', desc: 'Browse available rooms, request upgrades, and manage your stay from your phone.', icon: <Bed />, span: { xs: 12, md: 6 }, gradient: 'linear-gradient(135deg, rgba(43, 90, 129, 0.1) 0%, rgba(15, 23, 42, 0.5) 100%)' },
    { title: 'Easy Payments', desc: 'Pay your rent and manage bills securely with one-click online transactions.', icon: <ReceiptLong />, span: { xs: 12, md: 6 }, gradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.1) 0%, rgba(15, 23, 42, 0.5) 100%)' },
    { title: 'Instant Support', desc: 'Log a maintenance issue or cleaning request, and our AI ensures it is prioritized and fixed instantly.', icon: <Message />, span: { xs: 12, md: 6 }, gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(15, 23, 42, 0.5) 100%)' }
  ];

  const benefits = [
    { label: '24/7 Premium Security', icon: <Security /> },
    { label: 'Healthy AI-Optimized Mess', icon: <Fastfood /> },
    { label: 'Instant Room Services', icon: <Bed /> },
    { label: 'High-Speed WiFi Access', icon: <Wifi /> }
  ];

  return (
    <Box sx={{ bgcolor: '#0F172A', color: 'white', minHeight: '100vh', overflowX: 'hidden' }}>
      <PublicNavbar />
      
      {/* Hero Section */}
      <Box sx={{ position: 'relative', pt: { xs: 15, md: 14 }, pb: 10, overflow: 'hidden', textAlign: 'center' }}>
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 10 }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2, py: 1, borderRadius: 8, border: '1px solid rgba(82, 168, 158, 0.3)', bgcolor: 'rgba(82, 168, 158, 0.1)', mb: 4, mx: 'auto' }}>
              <Foundation sx={{ fontSize: 16, color: 'var(--secondary)' }} />
              <Typography variant="caption" sx={{ color: 'var(--secondary)', fontWeight: 800, letterSpacing: 1 }}>WELCOME HOME</Typography>
            </Box>
            <Typography variant="h1" sx={{ 
              fontSize: { xs: '3.2rem', md: '4.8rem' }, 
              lineHeight: 1.05, 
              fontWeight: 900, 
              mb: 3,
              letterSpacing: -1,
              mx: 'auto'
            }}>
              Your Premium<br />
              <Box component="span" sx={{ 
                background: 'linear-gradient(to right, #52A89E, #fff)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent' 
              }}>
                Student Living.
              </Box>
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400, mb: 6, maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}>
              Experience the perfect balance of community, comfort, and state-of-the-art facilities. A space designed to help you thrive.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ justifyContent: 'center', alignItems: 'center', mb: 8, mx: 'auto', width: 'fit-content' }}>
              <Button 
                variant="contained" 
                size="large" 
                onClick={() => navigate('/login')}
                endIcon={<Login />}
                sx={{ 
                  py: 2, px: 4, 
                  bgcolor: 'white', 
                  color: 'black', 
                  borderRadius: 4,
                  boxShadow: '0 0 30px rgba(255,255,255,0.2)',
                  '&:hover': { bgcolor: '#f0f0f0', transform: 'translateY(-2px)' },
                  transition: 'all 0.3s'
                }}
              >
                Student Login
              </Button>
              <Button 
                variant="outlined" 
                size="large" 
                onClick={() => {
                    const el = document.getElementById('amenities');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                sx={{ 
                  py: 2, px: 4, 
                  borderColor: 'rgba(255,255,255,0.2)', 
                  color: 'white', 
                  borderRadius: 4,
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.05)' }
                }}
              >
                Explore Amenities
              </Button>
            </Stack>
            
            <Box sx={{ mx: 'auto', display: 'flex', justifyContent: 'center', width: '100%', maxWidth: '600px' }}>
              <StudentHeroMockup />
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Living Benefits Band */}
      <Box sx={{ 
        my: { xs: 5, md: 10 },
        position: 'relative',
        py: 6,
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'linear-gradient(90deg, rgba(15,23,42,1) 0%, rgba(43,90,129,0.15) 50%, rgba(15,23,42,1) 100%)'
      }}>
        <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center' }}>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={{ xs: 4, md: 2 }} 
            justifyContent="space-evenly" 
            alignItems="center" 
            sx={{ width: '100%' }}
          >
            {benefits.map((stat, i) => (
              <Box key={i} sx={{ width: { xs: '100%', sm: '25%' } }}>
                <motion.div {...fadeInUp} transition={{ delay: i * 0.1, duration: 0.8 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 1.5 }}>
                    <Box sx={{ color: 'var(--secondary)', opacity: 0.9, '& > svg': { fontSize: 32 } }}>
                      {stat.icon}
                    </Box>
                    <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 800, letterSpacing: 0.5 }}>
                      {stat.label}
                    </Typography>
                  </Box>
                </motion.div>
              </Box>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* About Us / Our Mission */}
      <Box sx={{ bgcolor: 'rgba(255,255,255,0.01)', py: 15, textAlign: 'center' }} id="about">
        <Container maxWidth="md">
          <motion.div {...fadeInUp}>
            <Typography variant="overline" sx={{ color: 'var(--secondary)', fontWeight: 800, letterSpacing: 2 }}>ABOUT US</Typography>
            <Typography variant="h2" sx={{ fontWeight: 900, mb: 3, mt: 1 }}>More than just a room.</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.8, maxWidth: 800, mx: 'auto' }}>
              We believe that student living should be inspiring, secure, and completely hassle-free. Our facilities are designed to foster community while providing you with the privacy and comfort needed to excel in your studies.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 6, fontSize: '1.1rem', lineHeight: 1.8, maxWidth: 800, mx: 'auto' }}>
              From AI-optimized nutritional planning to instant maintenance support, we have integrated modern technology into every aspect of our dormitories to ensure your focus remains entirely on your success.
            </Typography>
            <Paper sx={{ 
              borderRadius: 8, overflow: 'hidden', p: 1, 
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(0,0,0,0.5))',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 40px 100px rgba(0,0,0,0.4)',
              mx: 'auto'
            }}>
              <Box component="img" src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200" sx={{ width: '100%', height: 400, objectFit: 'cover', borderRadius: 6, display: 'block' }} />
            </Paper>
          </motion.div>
        </Container>
      </Box>

      {/* Premium Bento Grid - Amenities */}
      <Container maxWidth="lg" sx={{ py: 15 }} id="amenities">
        <Box sx={{ textAlign: 'center', mb: 10 }}>
          <motion.div {...fadeInUp}>
            <Typography variant="h2" sx={{ fontWeight: 900, mb: 3 }}>Amenities designed<br />for <span style={{ color: 'var(--secondary)' }}>your comfort.</span></Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>Everything you need to live, study, and thrive—accessible right from your phone.</Typography>
          </motion.div>
        </Box>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, justifyItems: 'center' }}>
          {bentoGrid.map((item, i) => (
            <motion.div 
              key={i}
              {...fadeInUp}
              whileHover={{ scale: 1.02 }}
              style={{ width: '100%', height: '100%' }}
            >
              <Paper sx={{ 
                height: '100%',
                p: { xs: 4, md: 5 },
                borderRadius: 6,
                background: item.gradient,
                border: '1px solid rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Subtle Inner Glow */}
                <Box sx={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', filter: 'blur(30px)' }} />
                
                <Box sx={{ mb: 4, p: 2, display: 'inline-flex', borderRadius: 4, bgcolor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                  {item.icon}
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '1.5rem', md: '2.125rem' } }}>{item.title}</Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1.1rem' }}>{item.desc}</Typography>
              </Paper>
            </motion.div>
          ))}
        </Box>
      </Container>


      {/* Elegant Contact / Move In */}
      <Box sx={{ position: 'relative', py: 20, overflow: 'hidden' }} id="contact">
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: '100%', background: 'radial-gradient(circle, rgba(43, 90, 129, 0.3) 0%, transparent 60%)', zIndex: 0 }} />
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          <motion.div {...fadeInUp}>
            <Paper sx={{ 
              p: { xs: 4, md: 8 }, 
              borderRadius: 8, 
              background: 'rgba(15, 23, 42, 0.6)', 
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 30px 60px rgba(0,0,0,0.5)'
            }}>
              <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>Questions about moving in?</Typography>
                <Typography color="text.secondary">Send us your details and our reception team will guide you.</Typography>
              </Box>
              <Stack spacing={3}>
                <TextField fullWidth label="Your Name" variant="outlined" slotProps={{ inputLabel: { style: { color: 'rgba(255,255,255,0.5)' } } }} sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' } } }} />
                <TextField fullWidth label="Your Email" variant="outlined" slotProps={{ inputLabel: { style: { color: 'rgba(255,255,255,0.5)' } } }} sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' } } }} />
                <TextField fullWidth label="Your Question" multiline rows={3} variant="outlined" slotProps={{ inputLabel: { style: { color: 'rgba(255,255,255,0.5)' } } }} sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' } } }} />
                <Button fullWidth variant="contained" size="large" sx={{ py: 2, bgcolor: 'var(--secondary)', color: 'white', fontWeight: 800, borderRadius: 3, '&:hover': { bgcolor: '#438e85' } }}>
                  Send Message
                </Button>
              </Stack>
            </Paper>
          </motion.div>
        </Container>
      </Box>

      {/* Modern Footer */}
      <Box sx={{ py: 6, borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
        <Typography sx={{ color: 'text.secondary', fontWeight: 600 }}>
          © {new Date().getFullYear()} DormEase. Elevating Student Living.
        </Typography>
      </Box>
    </Box>
  );
};

export default LandingPage;
