import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Loader from './Loader';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to respective dashboard if they don't have permission
    const dashboardRoutes = {
      STUDENT: '/student-dashboard',
      COMPANY: '/company-dashboard',
      ADMIN: '/admin-dashboard'
    };
    return <Navigate to={dashboardRoutes[user.role] || '/'} replace />;
  }

  return children;
};

export default ProtectedRoute;
