import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [activeTab, setActiveTab] = useState('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password, activeTab);

    if (result.success) {
      if (activeTab === 'STUDENT') navigate('/student-dashboard');
      else if (activeTab === 'ADMIN') navigate('/admin-dashboard');
      else if (activeTab === 'COMPANY') navigate('/company-dashboard');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="container py-5" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="row justify-content-center w-100">
        <div className="col-md-8 col-lg-5">
          <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
            <div className="bg-light p-3 border-bottom text-center">
              <h4 className="fw-bold mb-0 text-dark">Welcome Back</h4>
              <p className="text-muted small mb-0 mt-1">Please login to your account</p>
            </div>
            
            <div className="card-body p-4 p-md-5">
              
              {/* Custom Tabs */}
              <ul className="nav nav-pills nav-fill mb-4 p-1 bg-light rounded-3" role="tablist">
                <li className="nav-item" role="presentation">
                  <button 
                    className={`nav-link fw-semibold py-2 ${activeTab === 'STUDENT' ? 'active shadow-sm' : ''}`} 
                    onClick={() => { setActiveTab('STUDENT'); setError(''); }}
                    type="button"
                  >
                    Student
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button 
                    className={`nav-link fw-semibold py-2 ${activeTab === 'ADMIN' ? 'active shadow-sm' : ''}`} 
                    onClick={() => { setActiveTab('ADMIN'); setError(''); }}
                    type="button"
                  >
                    Admin / TPO
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button 
                    className={`nav-link fw-semibold py-2 ${activeTab === 'COMPANY' ? 'active shadow-sm' : ''}`} 
                    onClick={() => { setActiveTab('COMPANY'); setError(''); }}
                    type="button"
                  >
                    Company
                  </button>
                </li>
              </ul>

              {error && <div className="alert alert-danger py-2 small fw-medium rounded-3 border-0"><i className="bi bi-exclamation-triangle-fill me-2"></i>{error}</div>}

              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <label className="form-label fw-medium text-secondary small text-uppercase tracking-wider">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-transparent text-muted border-end-0">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input 
                      type="email" 
                      className="form-control border-start-0 ps-0 bg-transparent" 
                      placeholder={`Enter your ${activeTab.toLowerCase()} email`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label fw-medium text-secondary small text-uppercase tracking-wider mb-0">Password</label>
                    <a href="#" className="small text-primary text-decoration-none fw-medium">Forgot?</a>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text bg-transparent text-muted border-end-0">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      className="form-control border-start-0 border-end-0 ps-0 bg-transparent" 
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                    />
                    <span
                      className="input-group-text bg-transparent text-muted border-start-0"
                      role="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </span>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-100 py-3 fw-bold rounded-3 shadow-sm mt-2 d-flex justify-content-center align-items-center"
                  disabled={loading}
                >
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Authenticating...</>
                  ) : (
                    <>Login as {activeTab === 'ADMIN' ? 'Admin/TPO' : activeTab === 'COMPANY' ? 'Company' : 'Student'} <i className="bi bi-arrow-right ms-2"></i></>
                  )}
                </button>
              </form>
              
              <div className="mt-4 text-center">
                {activeTab === 'STUDENT' ? (
                  <p className="mb-0 text-muted small">
                    Don't have a student account? <Link to="/register" className="fw-bold text-primary text-decoration-none">Register here</Link>
                  </p>
                ) : (
                  <p className="mb-0 text-muted small">
                    Contact the Administrator to request {activeTab === 'ADMIN' ? 'an Admin/TPO' : 'a Company'} account.
                    {activeTab === 'COMPANY' && ' Company accounts require Admin verification before you can log in.'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
