import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, Grid, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, Button, TextField, 
  InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, 
  MenuItem, CircularProgress, Snackbar, Alert, Card, CardContent,
  Avatar, Divider, IconButton
} from '@mui/material';
import { 
  Search, Add, FileDownload, Receipt, AccountBalanceWallet, 
  TrendingUp, PendingActions, Paid, History, MoreVert, 
  CreditCard, AccountBalance, Payments as PaymentsIcon, Warning as WarningIcon,
  Timeline, EventBusy, Campaign
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Payments: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [payments, setPayments] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalRevenue: 0, pendingPayments: 0, recentRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [expiringSubs, setExpiringSubs] = useState<any[]>([]);
  
  // Invoice Dialog States
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [reminding, setReminding] = useState(false);
  
  // Manual Payment Dialog States
  const [open, setOpen] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    amount: '',
    paymentMethod: 'Cash',
    paymentDate: new Date().toISOString().split('T')[0],
    description: '',
    packageType: 'Monthly'
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleOpenInvoice = (p: any) => {
    const student = students.find(s => s.userId?._id === p.userId?._id);
    setSelectedInvoice({ ...p, student });
    setInvoiceOpen(true);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const paymentsRes = await api.get('/payments');
      setPayments(paymentsRes.data);

      if (isAdmin) {
        const [statsRes, studentsRes, expiringRes] = await Promise.all([
          api.get('/payments/stats'),
          api.get('/students'),
          api.get('/payments/expiring')
        ]);
        setStats(statsRes.data);
        setStudents(studentsRes.data);
        setExpiringSubs(expiringRes.data);
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to fetch financial data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAdmin]);

  const handlePayInvoice = async (paymentId: string) => {
    try {
      setLoading(true);
      const res = await api.post(`/payments/${paymentId}/pay`);
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Payment failed. Please try again.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleManualPayment = async () => {
    try {
      setSaving(true);
      await api.post('/payments/manual', formData);
      setSnackbar({ open: true, message: 'Payment recorded successfully', severity: 'success' });
      setOpen(false);
      fetchData();
      setFormData({ userId: '', amount: '', paymentMethod: 'Cash', paymentDate: new Date().toISOString().split('T')[0], description: '', packageType: 'Monthly' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to record payment', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSendReminders = async () => {
    try {
      setReminding(true);
      const res = await api.post('/payments/remind-expiring');
      setSnackbar({ open: true, message: res.data.message, severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to send reminders', severity: 'error' });
    } finally {
      setReminding(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'success';
      case 'Pending': return 'warning';
      case 'Failed': return 'error';
      default: return 'default';
    }
  };

  const filteredPayments = payments.filter(p => 
    p.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.amount.toString().includes(searchQuery)
  );

  if (!isAdmin && !loading && payments.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5">No payment history found.</Typography>
      </Box>
    );
  }

  return (
    <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="900" color="text.primary">Finance & Billing</Typography>
          <Typography variant="body2" color="text.secondary">Manage transactions, track dues, and audit revenue.</Typography>
        </Box>
        {isAdmin && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              color="warning" 
              startIcon={reminding ? <CircularProgress size={20} color="inherit" /> : <Campaign />} 
              onClick={handleSendReminders}
              disabled={reminding}
              sx={{ borderRadius: 2, fontWeight: 'bold', textTransform: 'none' }}
            >
              {reminding ? 'Sending...' : 'Notify Expiring'}
            </Button>
            <Button variant="outlined" disabled startIcon={<FileDownload />}>Export Report</Button>
            <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>Record Payment</Button>
          </Box>
        )}
      </Box>

      {isAdmin && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { label: 'Total Revenue', val: `$${stats.totalRevenue.toLocaleString()}`, icon: <TrendingUp />, color: '#10B981', bg: '#D1FAE5' },
            { label: 'Pending Dues', val: stats.pendingPayments, icon: <PendingActions />, color: '#F59E0B', bg: '#FEF3C7' },
            { label: 'Recent (30d)', val: `$${stats.recentRevenue.toLocaleString()}`, icon: <AccountBalanceWallet />, color: '#3B82F6', bg: '#DBEAFE' },
          ].map((stat, i) => (
            <Grid xs={12} md={4} key={i}>
              <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                  <Box sx={{ p: 2, borderRadius: '50%', bgcolor: stat.bg, color: stat.color, mr: 2, display: 'flex' }}>
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary" fontWeight="medium">{stat.label}</Typography>
                    <Typography variant="h5" fontWeight="bold">{stat.val}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {isAdmin && expiringSubs.length > 0 && (
        <Box 
          sx={{ 
            mb: 4, p: 2, borderRadius: 3, 
            bgcolor: '#FFF1F2', border: '1px solid #FECDD3',
            display: 'flex', alignItems: 'center', gap: 2
          }}
          component={motion.div}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <Box sx={{ p: 1, bgcolor: '#FB7185', color: 'white', borderRadius: '50%', display: 'flex' }}>
            <WarningIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" color="#9F1239">Attention Required: Upcoming Renewals</Typography>
            <Typography variant="caption" color="#BE123B">
              {expiringSubs.length} student plans are expiring within the next 3 days. Send reminders to avoid service interruption.
            </Typography>
          </Box>
          <Button size="small" variant="text" sx={{ color: '#9F1239', ml: 'auto', fontWeight: 'bold' }}>View All</Button>
        </Box>
      )}

      <Paper sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">Transaction History</Typography>
          <TextField
            size="small"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }
            }}
            sx={{ width: 250 }}
          />
        </Box>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#F1F5F9' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Student</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Room</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Validity / End Date</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Method</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#0F172A' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 3 }}><CircularProgress /></TableCell></TableRow>
              ) : filteredPayments.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 3 }}>No transactions found.</TableCell></TableRow>
              ) : (
                filteredPayments.map((p) => {
                  // Find if student is expiring
                  const student = students.find(s => s.userId?._id === p.userId?._id);
                  const isExpiringSoon = student?.subscriptionEndDate && (new Date(student.subscriptionEndDate).getTime() - new Date().getTime()) < (3 * 24 * 60 * 60 * 1000);

                  return (
                    <TableRow key={p._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 }, bgcolor: isExpiringSoon ? '#FFF8F8' : 'inherit' }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem', bgcolor: 'primary.light' }}>{p.userId?.name?.[0]}</Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">{p.userId?.name}</Typography>
                            <Typography variant="caption" color="textSecondary">{p.userId?.email}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {p.bookingId?.roomId?.roomNumber ? `Room ${p.bookingId.roomId.roomNumber}` : 'General'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {student?.subscriptionEndDate ? (
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {new Date(student.subscriptionEndDate).toLocaleDateString()}
                            </Typography>
                            {isExpiringSoon && (
                              <Chip label="Expiring Soon" size="small" color="error" sx={{ height: 16, fontSize: '0.65rem', fontWeight: 900 }} />
                            )}
                          </Box>
                        ) : (
                          <Typography variant="caption" color="textSecondary">No Plan Set</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold" color="primary">${p.amount.toLocaleString()}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          {new Date(p.paymentDate).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {p.paymentMethod === 'Card' ? <CreditCard fontSize="inherit" /> : <AccountBalance fontSize="inherit" />}
                          <Typography variant="body2">{p.paymentMethod}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={p.paymentStatus} 
                          size="small" 
                          color={getStatusColor(p.paymentStatus)} 
                          sx={{ fontWeight: 'bold', borderRadius: 1.5 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {!isAdmin && p.paymentStatus === 'Pending' ? (
                          <Button 
                            size="small" 
                            variant="contained" 
                            startIcon={<Paid />}
                            onClick={() => handlePayInvoice(p._id)}
                            sx={{ borderRadius: 2 }}
                          >
                            Pay Now
                          </Button>
                        ) : (
                          <IconButton size="small" onClick={() => handleOpenInvoice(p)}><Receipt fontSize="small" /></IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Detailed Invoice Modal */}
      <Dialog open={invoiceOpen} onClose={() => setInvoiceOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 4, position: 'relative' }}>
            {/* Invoice Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
              <Box>
                <Typography variant="h5" fontWeight="900" color="primary.main">INVOICE</Typography>
                <Typography variant="caption" color="textSecondary" sx={{ letterSpacing: 1 }}>#{selectedInvoice?._id?.slice(-8).toUpperCase()}</Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h6" fontWeight="bold">DormEase</Typography>
                <Typography variant="caption" color="textSecondary" display="block">Campus Living Perfected</Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Bill To / Info */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid xs={6}>
                <Typography variant="caption" color="textSecondary" fontWeight="bold" display="block" sx={{ mb: 1 }}>BILL TO</Typography>
                <Typography variant="body1" fontWeight="bold">{selectedInvoice?.userId?.name}</Typography>
                <Typography variant="body2" color="textSecondary">{selectedInvoice?.userId?.email}</Typography>
                <Typography variant="body2" color="textSecondary">{selectedInvoice?.student?.userId?.contactDetails?.phone}</Typography>
              </Grid>
              <Grid xs={6} sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="textSecondary" fontWeight="bold" display="block" sx={{ mb: 1 }}>STATUS</Typography>
                <Chip 
                  label={selectedInvoice?.paymentStatus?.toUpperCase()} 
                  size="small" 
                  color={getStatusColor(selectedInvoice?.paymentStatus)} 
                  sx={{ fontWeight: 'bold', mb: 2 }}
                />
                <Typography variant="caption" color="textSecondary" fontWeight="bold" display="block">DATE</Typography>
                <Typography variant="body2">{new Date(selectedInvoice?.paymentDate).toLocaleDateString()}</Typography>
              </Grid>
            </Grid>

            {/* Invoice Items Table */}
            <Box sx={{ mb: 4, borderRadius: 2, bgcolor: '#f8fafc', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              <Box sx={{ p: 2, bgcolor: '#f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" fontWeight="bold">DESCRIPTION</Typography>
                <Typography variant="caption" fontWeight="bold">AMOUNT</Typography>
              </Box>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0' }}>
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    Room Rent - {selectedInvoice?.student?.currentRoomId?.roomNumber ? `Room ${selectedInvoice.student.currentRoomId.roomNumber}` : 'General Allocation'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">Package: {selectedInvoice?.student?.packageType || 'Monthly'}</Typography>
                </Box>
                <Typography variant="body2" fontWeight="bold">${selectedInvoice?.amount?.toLocaleString()}</Typography>
              </Box>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', bgcolor: '#f8fafc' }}>
                <Typography variant="body1" fontWeight="900">Total</Typography>
                <Typography variant="h6" fontWeight="900" color="primary.main">${selectedInvoice?.amount?.toLocaleString()}</Typography>
              </Box>
            </Box>

            <Typography variant="caption" color="textSecondary" sx={{ fontStyle: 'italic', display: 'block', mt: 4, textAlign: 'center' }}>
              Thank you for choosing DormEase. For any billing queries, contact support@dormease.com
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8fafc' }}>
          <Button onClick={() => setInvoiceOpen(false)} sx={{ fontWeight: 'bold' }}>Close</Button>
          <Button variant="contained" startIcon={<FileDownload />} sx={{ borderRadius: 2, fontWeight: 'bold' }}>Download PDF</Button>
        </DialogActions>
      </Dialog>

      {/* Manual Payment Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Record Offline Payment</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} sx={{ py: 1 }}>
            <Grid xs={12}>
              <TextField
                select
                fullWidth
                label="Student"
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              >
                {students.map((s) => (
                  <MenuItem key={s._id} value={s.userId?._id}>
                    {s.userId?.name} ({s.currentRoomId?.roomNumber ? `Room ${s.currentRoomId.roomNumber}` : 'Unassigned'})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount Paid ($)"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> } }}
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Payment Method"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              >
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="UPI">UPI / Digital Wallet</MenuItem>
                <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
              </TextField>
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Package Plan"
                value={formData.packageType}
                onChange={(e) => setFormData({ ...formData, packageType: e.target.value })}
              >
                <MenuItem value="Monthly">Monthly</MenuItem>
                <MenuItem value="6 Months">6 Months</MenuItem>
                <MenuItem value="12 Months">12 Months</MenuItem>
                <MenuItem value="24 Months">24 Months</MenuItem>
              </TextField>
            </Grid>
            <Grid xs={12}>
              <TextField
                fullWidth
                label="Payment Date"
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleManualPayment} disabled={saving} sx={{ borderRadius: 2, px: 4 }}>
            {saving ? <CircularProgress size={24} /> : 'Confirm & Record'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Payments;
