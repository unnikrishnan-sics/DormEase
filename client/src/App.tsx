import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudentDashboard from './pages/StudentDashboard';
import Rooms from './pages/Rooms';
import Students from './pages/Students';
import Complaints from './pages/Complaints';
import MessMenu from './pages/MessMenu';
import Payments from './pages/Payments';
import Staff from './pages/Staff';
import ChangePassword from './pages/ChangePassword';
import Profile from './pages/Profile';
import RoomDetail from './pages/RoomDetail';
import LandingPage from './pages/LandingPage';
import NotFound from './pages/NotFound';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancelled from './pages/PaymentCancelled';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />
        
        {/* Core Dashboard Logic (Role Based) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardSelector />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Admin Only Routes */}
        <Route
          path="/rooms"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <Layout>
                <Rooms />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/students"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
              <Layout>
                <Students />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <Layout>
                <Staff />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* Shared Routes (Visible to both but filtered content) */}
        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <Layout>
                <Payments />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/complaints"
          element={
            <ProtectedRoute>
              <Layout>
                <Complaints />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/mess"
          element={
            <ProtectedRoute>
              <Layout>
                <MessMenu />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/room-detail"
          element={
            <ProtectedRoute>
              <Layout>
                <RoomDetail />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Payment Callback Routes */}
        <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
        <Route path="/payment-cancelled" element={<ProtectedRoute><PaymentCancelled /></ProtectedRoute>} />

        {/* Home Route */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Fallback */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </AuthProvider>
  );
}


// Helper to choose dashboard based on role
import { useAuth } from './context/AuthContext';
const DashboardSelector = () => {
  const { user } = useAuth();
  return (user?.role === 'Admin' || user?.role === 'Staff') ? <Dashboard /> : <StudentDashboard />;
};

export default App;
