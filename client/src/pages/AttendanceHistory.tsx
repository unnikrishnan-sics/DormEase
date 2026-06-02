import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Chip, Button, 
    TextField, InputAdornment, Grid, CircularProgress, 
    MenuItem, Avatar, Card, CardContent 
} from '@mui/material';
import { 
    Search, FileDownload, History, FilterList, 
    Login, Logout, Warning, CheckCircle 
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AttendanceHistory: React.FC = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (typeFilter !== 'All') params.type = typeFilter;
            if (statusFilter !== 'All') params.status = statusFilter;
            
            const res = await api.get('/attendance/history', { params });
            setHistory(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [typeFilter, statusFilter]);

    const handleExport = () => {
        const headers = ['Student Name', 'ID', 'Type', 'Time', 'Date', 'Status', 'Authorized'];
        const csvContent = history.map(log => [
            log.studentId?.userId?.name || 'N/A',
            log.studentId?.studentId || 'N/A',
            log.type,
            new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
            new Date(log.timestamp).toLocaleDateString(),
            log.status,
            log.isAuthorized ? 'Yes' : 'No'
        ]);

        const csvString = [headers, ...csvContent].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredHistory = history.filter(log => {
        const studentName = log.studentId?.userId?.name?.toLowerCase() || '';
        const studentId = log.studentId?.studentId?.toLowerCase() || '';
        return studentName.includes(searchQuery.toLowerCase()) || 
               studentId.includes(searchQuery.toLowerCase());
    });

    return (
        <Box sx={{ p: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', width: 50, height: 50 }}>
                        <History fontSize="large" />
                    </Avatar>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" style={{ color: "black" }}>Attendance Logs</Typography>
                        <Typography variant="body2" color="textSecondary">
                            {user?.role === 'Student' ? 'Your personal entry/exit history' : 'Global student attendance records'}
                        </Typography>
                    </Box>
                </Box>
                <Button 
                    variant="contained" 
                    startIcon={<FileDownload />} 
                    onClick={handleExport}
                    disabled={history.length === 0}
                    sx={{ borderRadius: 2, px: 3 }}
                >
                    Export CSV
                </Button>
            </Box>

            {/* Filters */}
            <Paper 
                elevation={0} 
                sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}
            >
                <TextField
                    size="small"
                    placeholder="Search by candidate name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ flexGrow: 1, minWidth: 250 }}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
                    }}
                />
                <TextField
                    select
                    size="small"
                    label="Type"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    sx={{ minWidth: 120 }}
                >
                    <MenuItem value="All">All Types</MenuItem>
                    <MenuItem value="IN">Entries (IN)</MenuItem>
                    <MenuItem value="OUT">Exits (OUT)</MenuItem>
                </TextField>
                <TextField
                    select
                    size="small"
                    label="Status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{ minWidth: 150 }}
                >
                    <MenuItem value="All">All Statuses</MenuItem>
                    <MenuItem value="Present">Authorized</MenuItem>
                    <MenuItem value="Late Entry">Late Entry</MenuItem>
                    <MenuItem value="Late Check-out">Late Check-out</MenuItem>
                </TextField>
            </Paper>

            <TableContainer 
                component={Paper} 
                elevation={0} 
                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 4, overflow: 'hidden' }}
            >
                <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 800 }}>Student Details</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Type</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Time & Date</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Room</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} align="center" sx={{ py: 5 }}><CircularProgress /></TableCell></TableRow>
                        ) : filteredHistory.length === 0 ? (
                            <TableRow><TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                                <Typography color="textSecondary">No attendance records found.</Typography>
                            </TableCell></TableRow>
                        ) : filteredHistory.map((log) => (
                            <TableRow key={log._id} hover>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', fontWeight: 'bold' }}>
                                            {log.studentId?.userId?.name?.[0] || '?'}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight="bold">{log.studentId?.userId?.name || 'Unknown'}</Typography>
                                            <Typography variant="caption" color="textSecondary">{log.studentId?.studentId}</Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        icon={log.type === 'IN' ? <Login fontSize="small" /> : <Logout fontSize="small" />}
                                        label={log.type} 
                                        color={log.type === 'IN' ? 'success' : 'info'} 
                                        size="small" 
                                        variant="outlined"
                                        sx={{ fontWeight: 'bold', borderRadius: 1.5 }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" fontWeight="600">
                                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        {new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" fontWeight="bold">
                                        Room {log.studentId?.currentRoomId?.roomNumber || 'N/A'}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {log.isAuthorized ? (
                                            <CheckCircle sx={{ color: 'success.main', fontSize: 18 }} />
                                        ) : (
                                            <Warning sx={{ color: 'warning.main', fontSize: 18 }} />
                                        )}
                                        <Typography 
                                            variant="body2" 
                                            fontWeight="bold" 
                                            sx={{ color: log.isAuthorized ? 'success.dark' : 'warning.dark' }}
                                        >
                                            {log.status}
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default AttendanceHistory;
