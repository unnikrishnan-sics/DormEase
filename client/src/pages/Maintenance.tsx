import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Grid, Card, CardContent, Button, 
    Chip, Divider, Dialog, DialogTitle, DialogContent, 
    DialogActions, TextField, MenuItem, CircularProgress,
    IconButton, Tooltip, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, LinearProgress
} from '@mui/material';
import { 
    Add, Engineering, CleaningServices, Assignment, 
    CheckCircle, Schedule, Warning, Delete, Edit,
    FilterList, Today, EventNote
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Task {
    _id: string;
    title: string;
    description: string;
    category: string;
    location: string;
    assignedTo: {
        _id: string;
        name: string;
    };
    dueDate: string;
    priority: string;
    status: string;
    isRecurring: boolean;
    frequency: string;
}

const Maintenance: React.FC = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'Admin';
    const isStaff = user?.role === 'Staff';

    const [tasks, setTasks] = useState<Task[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Cleaning',
        location: '',
        assignedTo: '',
        dueDate: new Date().toISOString().split('T')[0],
        priority: 'Medium',
        status: 'Pending',
        isRecurring: false,
        frequency: 'None'
    });

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const res = await api.get('/maintenance');
            setTasks(res.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStaff = async () => {
        if (!isAdmin) return;
        try {
            const res = await api.get('/maintenance/staff');
            setStaff(res.data);
        } catch (error) {
            console.error('Error fetching staff:', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchTasks();
            fetchStaff();
        }
    }, [user]);

    const handleOpen = (task?: Task) => {
        if (task) {
            setEditMode(true);
            setSelectedTaskId(task._id);
            setFormData({
                title: task.title,
                description: task.description,
                category: task.category,
                location: task.location,
                assignedTo: task.assignedTo?._id || '',
                dueDate: new Date(task.dueDate).toISOString().split('T')[0],
                priority: task.priority,
                status: task.status,
                isRecurring: task.isRecurring,
                frequency: task.frequency
            });
        } else {
            setEditMode(false);
            setFormData({
                title: '',
                description: '',
                category: 'Cleaning',
                location: '',
                assignedTo: '',
                dueDate: new Date().toISOString().split('T')[0],
                priority: 'Medium',
                status: 'Pending',
                isRecurring: false,
                frequency: 'None'
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedTaskId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editMode && selectedTaskId) {
                await api.put(`/maintenance/${selectedTaskId}`, formData);
            } else {
                await api.post('/maintenance', formData);
            }
            fetchTasks();
            handleClose();
        } catch (error) {
            console.error('Error saving task:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            await api.put(`/maintenance/${id}`, { status });
            fetchTasks();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await api.delete(`/maintenance/${id}`);
            fetchTasks();
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Urgent': return '#E11D48';
            case 'High': return '#F97316';
            case 'Medium': return '#3B82F6';
            case 'Low': return '#10B981';
            default: return '#64748B';
        }
    };

    const getStatusChip = (status: string) => {
        switch (status) {
            case 'Completed': return <Chip label="Completed" size="small" color="success" icon={<CheckCircle />} sx={{ fontWeight: 'bold' }} />;
            case 'In Progress': return <Chip label="In Progress" size="small" color="primary" icon={<Schedule />} sx={{ fontWeight: 'bold' }} />;
            case 'Cancelled': return <Chip label="Cancelled" size="small" variant="outlined" sx={{ fontWeight: 'bold' }} />;
            default: return <Chip label="Pending" size="small" color="warning" icon={<Assignment />} sx={{ fontWeight: 'bold' }} />;
        }
    };

    const categories = ['Cleaning', 'Repair', 'Electrical', 'Plumbing', 'Furniture', 'Other'];

    const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'Completed').length,
        pending: tasks.filter(t => t.status === 'Pending').length,
        inProgress: tasks.filter(t => t.status === 'In Progress').length,
        completionRate: tasks.length > 0 ? (tasks.filter(t => t.status === 'Completed').length / tasks.length) * 100 : 0
    };

    return (
        <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight="900" sx={{ color: '#0F172A' }}>Maintenance & Cleaning</Typography>
                    <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5, fontWeight: 500 }}>
                        {isAdmin ? 'Schedule tasks, assign staff and track facility maintenance.' : 'View your assigned tasks and update completion status.'}
                    </Typography>
                </Box>
                {isAdmin && (
                    <Button 
                        variant="contained" 
                        startIcon={<Add />} 
                        onClick={() => handleOpen()}
                        sx={{ borderRadius: 3, py: 1.2, px: 3, boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}
                    >
                        Schedule Task
                    </Button>
                )}
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid xs={12} md={8}>
                    <Paper sx={{ p: 3, borderRadius: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2" fontWeight="bold" color="textSecondary">Task Completion Overview</Typography>
                            <Typography variant="h6" fontWeight="900" color="primary">{Math.round(stats.completionRate)}%</Typography>
                        </Box>
                        <LinearProgress 
                            variant="determinate" 
                            value={stats.completionRate} 
                            sx={{ height: 10, borderRadius: 5, bgcolor: '#F1F5F9' }} 
                        />
                        <Box sx={{ display: 'flex', gap: 4 }}>
                             <Box>
                                 <Typography variant="caption" color="textSecondary" display="block">Pending</Typography>
                                 <Typography variant="subtitle1" fontWeight="bold">{stats.pending}</Typography>
                             </Box>
                             <Box>
                                 <Typography variant="caption" color="textSecondary" display="block">In Progress</Typography>
                                 <Typography variant="subtitle1" fontWeight="bold">{stats.inProgress}</Typography>
                             </Box>
                             <Box>
                                 <Typography variant="caption" color="textSecondary" display="block">Completed</Typography>
                                 <Typography variant="subtitle1" fontWeight="bold" color="success.main">{stats.completed}</Typography>
                             </Box>
                        </Box>
                    </Paper>
                </Grid>
                <Grid xs={12} md={4}>
                    <Paper sx={{ p: 3, borderRadius: 4, height: '100%', display: 'flex', alignItems: 'center', bgcolor: '#4F46E5', color: 'white' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                            <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 4 }}>
                                <Engineering fontSize="large" />
                            </Box>
                            <Box>
                                <Typography variant="h4" fontWeight="900">{stats.total}</Typography>
                                <Typography variant="body2" sx={{ opacity: 0.8, fontWeight: 600 }}>Active Schedules</Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
            ) : (
                <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0', width: '100%' }}>
                    <Table sx={{ width: '100%' }}>
                        <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                            <TableRow>
                                <TableCell><Typography variant="subtitle2" fontWeight="bold">Task & Location</Typography></TableCell>
                                <TableCell><Typography variant="subtitle2" fontWeight="bold">Category</Typography></TableCell>
                                <TableCell><Typography variant="subtitle2" fontWeight="bold">Assigned To</Typography></TableCell>
                                <TableCell><Typography variant="subtitle2" fontWeight="bold">Due Date</Typography></TableCell>
                                <TableCell><Typography variant="subtitle2" fontWeight="bold">Status</Typography></TableCell>
                                <TableCell align="right"><Typography variant="subtitle2" fontWeight="bold">Actions</Typography></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tasks.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                        <Assignment sx={{ fontSize: 48, color: '#CBD5E1', mb: 2 }} />
                                        <Typography color="textSecondary">No maintenance tasks scheduled yet.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tasks.map((task) => {
                                    const hasAction = (isStaff && (task.status === 'Pending' || task.status === 'In Progress')) || isAdmin;
                                    
                                    return (
                                    <TableRow key={task._id} hover>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2" fontWeight="bold">{task.title}</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: getPriorityColor(task.priority) }} />
                                                    <Typography variant="caption" color="textSecondary">{task.location} • {task.priority}</Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={task.category} 
                                                size="small" 
                                                variant="outlined"
                                                icon={task.category === 'Cleaning' ? <CleaningServices sx={{ fontSize: '12px !important' }} /> : <Engineering sx={{ fontSize: '12px !important' }} />}
                                                sx={{ fontWeight: 'bold' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600}>{task.assignedTo?.name || 'Unassigned'}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{new Date(task.dueDate).toLocaleDateString()}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusChip(task.status)}
                                        </TableCell>
                                        <TableCell align="right">
                                            {hasAction ? (
                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                                    {isStaff && task.status === 'Pending' && (
                                                        <Button size="small" onClick={() => handleStatusUpdate(task._id, 'In Progress')}>Start</Button>
                                                    )}
                                                    {isStaff && task.status === 'In Progress' && (
                                                        <Button size="small" variant="contained" onClick={() => handleStatusUpdate(task._id, 'Completed')}>Complete</Button>
                                                    )}
                                                    {isAdmin && (
                                                        <>
                                                            <IconButton size="small" onClick={() => handleOpen(task)}><Edit fontSize="small" /></IconButton>
                                                            <IconButton size="small" color="error" onClick={() => handleDelete(task._id)}><Delete fontSize="small" /></IconButton>
                                                        </>
                                                    )}
                                                </Box>
                                            ) : (
                                                <Typography variant="caption" color="textSecondary">—</Typography>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );})
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Task Dialog */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmit}>
                    <DialogTitle sx={{ fontWeight: 'bold' }}>{editMode ? 'Edit Task' : 'Schedule New Task'}</DialogTitle>
                    <DialogContent dividers>
                        <Grid container spacing={3} sx={{ pt: 1 }}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth label="Task Title" required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth multiline rows={3} label="Description" required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select fullWidth label="Category" required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth label="Location" required
                                    placeholder="e.g. Room 101, Corridor"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    select fullWidth label="Assign To" required
                                    value={formData.assignedTo}
                                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                                    helperText={staff.length === 0 ? "No staff members found to assign" : ""}
                                >
                                    {staff.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth label="Due Date" type="date" required
                                    InputLabelProps={{ shrink: true }}
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select fullWidth label="Priority"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                >
                                    {['Low', 'Medium', 'High', 'Urgent'].map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                                </TextField>
                            </Grid>
                             <Grid item xs={12} sm={6}>
                                <TextField
                                    select fullWidth label="Status"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    {['Pending', 'In Progress', 'Completed', 'Cancelled'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                                </TextField>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button 
                            type="submit" variant="contained" 
                            disabled={submitting}
                            sx={{ borderRadius: 2, px: 4 }}
                        >
                            {submitting ? <CircularProgress size={24} /> : (editMode ? 'Update Task' : 'Create Task')}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default Maintenance;
