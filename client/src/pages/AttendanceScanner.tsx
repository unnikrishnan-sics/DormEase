import React, { useEffect, useState, useRef } from 'react';
import { 
    Box, Typography, Paper, Container, Grid, Avatar, Button, 
    CircularProgress, Chip 
} from '@mui/material';
import { Html5Qrcode } from 'html5-qrcode';
import { 
    QrCodeScanner, Warning, 
    Refresh, CameraAlt 
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const AttendanceScanner: React.FC = () => {
    const [scanResult, setScanResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isScanning, setIsScanning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Use refs for stable values across renders
    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
    const isTransitioningRef = useRef(false);
    const mountedRef = useRef(false);

    useEffect(() => {
        mountedRef.current = true;
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => {
            mountedRef.current = false;
            clearInterval(timer);
            // Full cleanup on unmount
            if (html5QrCodeRef.current?.isScanning) {
                html5QrCodeRef.current.stop().catch(e => console.warn(e));
            }
        };
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
        });
    };

    const startScanner = async () => {
        if (isTransitioningRef.current || isScanning || !mountedRef.current) return;

        try {
            setIsLoading(true);
            isTransitioningRef.current = true;
            setError(null);

            const container = document.getElementById("reader");
            if (container) container.innerHTML = "";

            if (!html5QrCodeRef.current) {
                html5QrCodeRef.current = new Html5Qrcode("reader");
            }

            const config = {
                fps: 15,
                qrbox: { width: 150, height: 150 }, // Even tighter scan area
                aspectRatio: 1.0
            };

            await html5QrCodeRef.current.start(
                { facingMode: "environment" }, 
                config,
                onScanSuccess,
                onScanFailure
            );
            
            setIsScanning(true);
        } catch (err: any) {
            console.error("Scanner Start Error:", err);
            setError("Camera hardware issue. Please use the Reset button.");
            setIsScanning(false);
        } finally {
            if (mountedRef.current) {
                setIsLoading(false);
                isTransitioningRef.current = false;
            }
        }
    };

    const lastScanTextRef = useRef<string | null>(null);

    const onScanSuccess = async (decodedText: string) => {
        // Anti-loop: Ignore if we just scanned the exact same text in the last 5 seconds
        if (isProcessing || scanResult || decodedText === lastScanTextRef.current) return; 

        try {
            setIsProcessing(true);
            lastScanTextRef.current = decodedText;
            
            // Clear the "anti-loop" after 5 seconds
            setTimeout(() => { lastScanTextRef.current = null; }, 5000);

            const response = await api.post('/attendance/scan', { studentIdString: decodedText });
            setScanResult(response.data);
            setError(null);

            // Hold result for 5 seconds before resuming scanner
            setTimeout(() => {
                if (mountedRef.current) {
                    setScanResult(null);
                    setIsProcessing(false);
                }
            }, 5000); 
        } catch (err: any) {
            // Show specific backend message (e.g., Rate Limit info)
            const msg = err.response?.data?.message || "Scan failed. Check connection.";
            setError(msg);
            
            setTimeout(() => {
                if (mountedRef.current) {
                    setError(null);
                    setIsProcessing(false);
                }
            }, 5000); // Also hold error messages for 5 seconds
        }
    };

    const onScanFailure = () => {};

    const handleHardReset = () => {
        window.location.reload();
    };

    // Auto-start with a safe buffer
    useEffect(() => {
        const timeout = setTimeout(() => {
            startScanner();
        }, 1200);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <Container maxWidth="sm" sx={{ py: 0.5 }}>
            <Paper 
                elevation={0}
                sx={{ 
                    borderRadius: 3, 
                    bgcolor: '#0F172A', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 250, // Ultra-shrunken height
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                }}
            >
                {/* Header Section (Minimalist) */}
                <Box sx={{ 
                    p: 1, 
                    zIndex: 10,
                    background: 'linear-gradient(to bottom, rgba(15,23,42,1) 0%, rgba(15,23,42,0.8) 100%)',
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <Box>
                        <Typography variant="h6" fontWeight="900" sx={{ color: 'white', lineHeight: 1 }}>Gate Monitor</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}>
                            DormEase Security
                        </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h5" fontWeight="900" sx={{ color: 'primary.light', letterSpacing: 1 }}>
                            {formatTime(currentTime)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}>
                            {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </Typography>
                    </Box>
                </Box>

                {/* Main Viewport */}
                <Box sx={{ flexGrow: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {isLoading && (
                        <Box sx={{ textAlign: 'center', color: 'white', zIndex: 5 }}>
                            <CircularProgress color="inherit" sx={{ mb: 2 }} />
                            <Typography variant="body2" sx={{ opacity: 0.7 }}>Starting Camera...</Typography>
                        </Box>
                    )}
                    
                    <Box 
                        id="reader" 
                        sx={{ 
                            width: '100%', 
                            height: '400px',
                            display: (isLoading || !isScanning) ? 'none' : 'block',
                            '& video': { width: '100% !important', height: '100% !important', objectFit: 'cover' }
                        }} 
                    />

                    {(!isScanning && !isLoading && !scanResult) && (
                        <Box sx={{ textAlign: 'center', p: 4 }}>
                            <CameraAlt sx={{ fontSize: 60, color: 'rgba(255,255,255,0.1)', mb: 2 }} />
                            <Typography sx={{ color: 'white', mb: 3, opacity: 0.8 }}>Scanner is ready</Typography>
                            <Button 
                                variant="contained" 
                                startIcon={<QrCodeScanner />} 
                                onClick={startScanner}
                                sx={{ borderRadius: 3, px: 4, py: 1.5, fontWeight: 'bold' }}
                            >
                                Activate Camera
                            </Button>
                        </Box>
                    )}

                    {/* Result Overlay (Docked Card) */}
                    <AnimatePresence>
                        {scanResult && (
                            <Box
                                component={motion.div}
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 50 }}
                                sx={{ 
                                    position: 'absolute', 
                                    bottom: 20, left: 20, right: 20, 
                                    zIndex: 100, 
                                    bgcolor: '#1E293B', 
                                    borderRadius: 4,
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
                                    p: 2,
                                    display: 'flex', alignItems: 'center', gap: 2
                                }}
                            >
                                <Avatar sx={{ width: 45, height: 45, bgcolor: 'primary.main', border: '2px solid white' }}>
                                    {scanResult.student.name[0]}
                                </Avatar>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="subtitle2" fontWeight="900" sx={{ color: 'white' }}>{scanResult.student.name}</Typography>
                                    <Typography variant="caption" sx={{ color: 'primary.light', display: 'block' }}>
                                        {scanResult.student.studentId} • Room {scanResult.student.roomNumber}
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Chip 
                                        label={scanResult.student.newStatus === 'IN' ? 'IN' : 'OUT'} 
                                        size="small"
                                        sx={{ bgcolor: scanResult.student.newStatus === 'IN' ? '#10B981' : '#F43F5E', color: 'white', fontWeight: 'bold' }}
                                    />
                                </Box>
                            </Box>
                        )}
                    </AnimatePresence>
                </Box>

                {/* Footer / Error Section */}
                <Box sx={{ p: 2, bgcolor: error ? 'rgba(244, 63, 94, 0.1)' : 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    {error ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#F43F5E' }}>
                                <Warning fontSize="small" />
                                <Typography variant="body2" fontWeight="bold">{error}</Typography>
                            </Box>
                            <Button size="small" startIcon={<Refresh />} onClick={handleHardReset} sx={{ color: 'white' }}>Reset</Button>
                        </Box>
                    ) : (
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', display: 'block' }}>
                            SECURE GATE SYSTEM • {isScanning ? 'MONITORING ACTIVE' : 'AWAITING ACTIVATION'}
                        </Typography>
                    )}
                </Box>
            </Paper>
        </Container>
    );
};

export default AttendanceScanner;
