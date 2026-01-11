import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Token yoksa login'e yönlendir
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default ProtectedRoute;