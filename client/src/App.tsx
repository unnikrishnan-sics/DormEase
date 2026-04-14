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
import ChangePassword from './pages/ChangePassword';
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

        {/* Shared Routes (Visible to both but filtered content) */}
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

        {/* Home Redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

// Helper to choose dashboard based on role
import { useAuth } from './context/AuthContext';
const DashboardSelector = () => {
  const { user } = useAuth();
  return user?.role === 'Admin' ? <Dashboard /> : <StudentDashboard />;
};

export default App;
