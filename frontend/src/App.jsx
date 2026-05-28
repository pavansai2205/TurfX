import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Core UI Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Page imports
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BrowseTurfs from './pages/BrowseTurfs';
import TurfDetails from './pages/TurfDetails';
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';
import UserDashboard from './pages/UserDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProfilePage from './pages/ProfilePage';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-darkBg-deep">
          
          {/* Header */}
          <Navbar />
          
          {/* Main Content Area */}
          <main className="flex-grow pb-20 sm:pb-8">
            <Routes>
              {/* Public Access Elements */}
              <Route path="/" element={<Home />} />
              <Route path="/browse" element={<BrowseTurfs />} />
              <Route path="/turfs/:id" element={<TurfDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Booking checkout screens */}
              <Route 
                path="/bookings/checkout" 
                element={
                  <ProtectedRoute>
                    <BookingPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/bookings/payment/:bookingId" 
                element={
                  <ProtectedRoute>
                    <PaymentPage />
                  </ProtectedRoute>
                } 
              />

              {/* Protected Dashboards & Profiles */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                    <UserDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />

              {/* Turf Owner Dashboard */}
              <Route 
                path="/owner" 
                element={
                  <ProtectedRoute allowedRoles={['TURF_OWNER', 'ADMIN']}>
                    <OwnerDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* System Admin Dashboard */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Fallback 404 Pages */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          {/* Footer */}
          <Footer />

          {/* Toast Notification Manager */}
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#0f1424',
                color: '#f8fafc',
                border: '1px solid #1e293b',
                fontSize: '12px',
                fontWeight: 'bold',
                borderRadius: '12px',
              },
              success: {
                iconTheme: {
                  primary: '#84cc16',
                  secondary: '#070a13',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#070a13',
                },
              },
            }}
          />
          
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
