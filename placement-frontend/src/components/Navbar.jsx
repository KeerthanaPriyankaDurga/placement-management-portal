import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'STUDENT') return '/student-dashboard';
    if (user.role === 'ADMIN') return '/admin-dashboard';
    if (user.role === 'COMPANY') return '/company-dashboard';
    return '/';
  };

  return (
    <>
      {/* MRU Top Bar */}
      <div className="mru-top-bar d-none d-lg-flex justify-content-between align-items-center">
        <div>
          <a href="#" className="me-3"><i className="bi bi-twitter"></i></a>
          <a href="#" className="me-3"><i className="bi bi-facebook"></i></a>
          <a href="#"><i className="bi bi-youtube"></i></a>
        </div>
        <div>
          <span className="me-4"><i className="bi bi-telephone-fill me-2"></i> 94971-94971, 91778-78365</span>
          <span><i className="bi bi-envelope-fill me-2"></i> info@mallareddyuniversity.ac.in</span>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="navbar navbar-expand-lg py-3 sticky-top shadow-sm">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <img 
              src="https://static.wixstatic.com/media/6685d7_3d4e7a3b47f645e6b8cada0ebadaae63~mv2.png" 
              alt="Malla Reddy University Logo" 
              style={{ height: '55px' }} 
            />
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-lg-center">
              <li className="nav-item">
                <Link className="nav-link px-3 text-white" to="/">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link px-3 text-white" to="/about">About Us</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link px-3 text-white" to="/contact">Contact</Link>
              </li>
              
              {!user ? (
                <>
                  <li className="nav-item ms-lg-3">
                    <Link className="btn text-white rounded-0 px-4 fw-bold text-uppercase" to="/login" style={{ backgroundColor: '#ec691f', fontSize: '13px' }}>Student Login</Link>
                  </li>
                  <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
                    <Link className="btn btn-outline-light rounded-0 px-4 fw-bold text-uppercase" to="/login" style={{ fontSize: '13px' }}>Admin/Company</Link>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item ms-lg-3">
                    <NotificationBell />
                  </li>
                  <li className="nav-item ms-lg-3">
                    <Link className="btn text-white rounded-0 px-4 fw-bold text-uppercase" to={getDashboardLink()} style={{ backgroundColor: '#ec691f', fontSize: '13px' }}>Dashboard</Link>
                  </li>
                  <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
                    <button className="btn btn-outline-light rounded-0 px-4 fw-bold text-uppercase" onClick={handleLogout} style={{ fontSize: '13px' }}>Logout</button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
