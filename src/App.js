import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Receipts from './pages/Receipts';
import Profile from './pages/Profile';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';  // ← EKLE
import './App.css';

// BottomNav aynı kalacak...
function BottomNav() {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'white',
      borderTop: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '8px 0',
      zIndex: 1000
    }}>
      <Link to="/" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textDecoration: 'none',
        color: isActive('/') ? 'var(--primary)' : 'var(--gray-800)',
        padding: '8px',
        fontSize: '12px'
      }}>
        <span style={{ fontSize: '24px', marginBottom: '4px' }}>🏠</span>
        Ana Sayfa
      </Link>
      
      <Link to="/upload" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textDecoration: 'none',
        color: isActive('/upload') ? 'var(--primary)' : 'var(--gray-800)',
        padding: '8px',
        fontSize: '12px'
      }}>
        <span style={{ fontSize: '24px', marginBottom: '4px' }}>📸</span>
        Yükle
      </Link>
      
      <Link to="/receipts" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textDecoration: 'none',
        color: isActive('/receipts') ? 'var(--primary)' : 'var(--gray-800)',
        padding: '8px',
        fontSize: '12px'
      }}>
        <span style={{ fontSize: '24px', marginBottom: '4px' }}>📋</span>
        Fişlerim
      </Link>
      
      <Link to="/profile" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textDecoration: 'none',
        color: isActive('/profile') ? 'var(--primary)' : 'var(--gray-800)',
        padding: '8px',
        fontSize: '12px'
      }}>
        <span style={{ fontSize: '24px', marginBottom: '4px' }}>👤</span>
        Profil
      </Link>
    </nav>
  );
}

function AppContent() {
  const location = useLocation();
  const hideNav = location.pathname === '/login';

  return (
    <div className="app">
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes - Token olmadan giremez */}
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/upload" element={
          <ProtectedRoute>
            <Upload />
          </ProtectedRoute>
        } />
        
        <Route path="/receipts" element={
          <ProtectedRoute>
            <Receipts />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
      </Routes>
      
      {!hideNav && <BottomNav />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;