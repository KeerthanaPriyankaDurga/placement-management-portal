import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container py-5 text-center" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <h1 className="display-1 fw-bold text-primary">404</h1>
      <h2 className="mb-4">Page Not Found</h2>
      <p className="text-muted mb-4">The page you are looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn btn-primary">Go Back Home</Link>
    </div>
  );
};

export default NotFound;
