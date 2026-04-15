import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { Bed } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const PublicNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', href: '#home' },
    { label: 'Features', href: '#features' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        bgcolor: scrolled ? 'rgba(15, 23, 42, 0.8)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.1)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.1)' : 'none',
        transition: 'all 0.3s ease-in-out'
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ py: scrolled ? 1 : 2, justifyContent: 'space-between', transition: 'all 0.3s ease-in-out' }}>
          {/* Logo Section */}
          <Box 
            component="a" 
            href="/" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5, 
              textDecoration: 'none',
              cursor: 'pointer'
            }}
          >
            <Box 
              component="img" 
              src={logo} 
              alt="DormEase" 
              onError={(e: any) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
              sx={{ height: 65, width: 'auto' }}
            />
            <Box sx={{ display: 'none', alignItems: 'center', gap: 1 }}>
              <Bed sx={{ color: 'var(--secondary)', fontSize: 32 }} />
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 900, 
                  color: 'white', 
                  letterSpacing: -1,
                  background: 'linear-gradient(45deg, #fff, var(--secondary))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                DormEase
              </Typography>
            </Box>
          </Box>

          {/* Desktop Nav */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4, alignItems: 'center' }}>
            {navItems.map((item) => (
              <Typography
                key={item.label}
                component="a"
                href={item.href}
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  '&:hover': { color: 'var(--secondary)' },
                  transition: 'color 0.2s'
                }}
              >
                {item.label}
              </Typography>
            ))}
            <Button
              variant="contained"
              onClick={() => navigate('/login')}
              sx={{
                bgcolor: 'var(--primary)',
                borderRadius: '12px',
                px: 3,
                py: 1,
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: '0 8px 20px rgba(43, 90, 129, 0.3)',
                '&:hover': { bgcolor: '#1e4a6d' }
              }}
            >
              Sign In
            </Button>
          </Box>

          {/* Mobile Overlay Toggle Placeholder */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
             <Button variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}>Menu</Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default PublicNavbar;
