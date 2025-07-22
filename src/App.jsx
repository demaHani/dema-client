import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import Navigation from './components/Navigation.jsx';
import TravelBookingApp from './components/TravelBookingApp.jsx';
import LoginForm from './components/LoginForm.jsx';
import SignupForm from './components/SignupForm.jsx';
import ForgotPasswordForm from './components/ForgotPasswordForm.jsx';
import UserProfile from './components/UserProfile.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import CarRentPage from './components/CarRentPage.jsx';
import CampingPage from './components/CampingPage.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';

// Authentication Context
const AuthContext = React.createContext();

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on app load
    const token = localStorage.getItem('authToken');
    if (token) {
      // Verify token and get user data
      fetchUserData(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      } else {
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      localStorage.removeItem('authToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        // Ensure user object has consistent ID field
        const userData = {
          ...data.user,
          id: data.user.id || data.user.userId,
          userId: data.user.userId || data.user.id
        };
        setUser(userData);
        return { success: true, user: userData };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const adminLogin = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        // Ensure user object has consistent ID field
        const userData = {
          ...data.user,
          id: data.user.id || data.user.userId,
          userId: data.user.userId || data.user.id
        };
        setUser(userData);
        return { success: true, user: userData };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        // Ensure user object has consistent ID field
        const userData = {
          ...data.user,
          id: data.user.id || data.user.userId,
          userId: data.user.userId || data.user.id
        };
        setUser(userData);
        return { success: true, user: userData };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const value = {
    user,
    login,
    adminLogin,
    signup,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner>Loading...</LoadingSpinner>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContainer>
          <Navigation />
          <MainContent>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<TravelBookingApp />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/signup" element={<SignupForm />} />
              <Route path="/forgot-password" element={<ForgotPasswordForm />} />
              <Route path="/car-rent" element={<CarRentPage />} />
              <Route path="/camping" element={<CampingPage />} />
              
              {/* Protected User Routes */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </MainContent>
          <ScrollToTop />
        </AppContainer>
      </Router>
    </AuthProvider>
  );
};

// Styled Components
const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
`;

const MainContent = styled.main`
  flex: 1;
  width: 100%;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.2rem;
  color: var(--text-secondary);
`;

export default App; 