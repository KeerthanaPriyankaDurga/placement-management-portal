import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    fullName: '',
    department: '',
    batch: '2026-27'
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await axios.post('http://localhost:8080/api/auth/register', {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        department: formData.department,
        batch: formData.batch,
        role: 'STUDENT'
      });

      setSuccess(
        'Registration successful! You can log in right away.'
      );
      setError('');

      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data ||
        'Registration failed'
      );
      setSuccess('');
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div
            className="card border-0 rounded-0 shadow"
            style={{ borderTop: '4px solid #eb9407' }}
          >
            <div className="card-header bg-white text-center py-4 rounded-0 border-bottom">
              <h3
                className="mb-0 fw-bold text-uppercase"
                style={{ color: '#294a70' }}
              >
                Student Registration
              </h3>
              <small className="text-muted fw-bold">
                Class of 2026-27
              </small>
            </div>

            <div className="card-body p-4 p-md-5">

              {error && (
                <div className="alert alert-danger rounded-0 border-0">
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success rounded-0 border-0">
                  {success}
                </div>
              )}

              <form onSubmit={handleRegister}>

                <div className="mb-3">
                  <label className="form-label fw-bold text-muted small text-uppercase">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold text-muted small text-uppercase">
                      Department
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold text-muted small text-uppercase">
                      Batch
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="batch"
                      value={formData.batch}
                      onChange={handleChange}
                      readOnly
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold text-muted small text-uppercase">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold text-muted small text-uppercase">
                    Username
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold text-muted small text-uppercase">
                    Password
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      required
                    />
                    <span
                      className="input-group-text bg-transparent"
                      role="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </span>
                  </div>
                </div>

                <div className="alert alert-success rounded-0 small border-0 bg-light border-start border-4 border-success">
                  <strong>Note:</strong> Your account is activated immediately after registration. Companies and Admins cannot register here — contact the Administrator for those accounts.
                </div>

                <button
                  type="submit"
                  className="btn w-100 fw-bold text-white rounded-0 py-2"
                  style={{ backgroundColor: '#eb9407' }}
                >
                  REGISTER NOW
                </button>

              </form>

              <div className="text-center mt-4">
                <p className="text-muted small">
                  Already approved?{' '}
                  <Link
                    to="/login"
                    className="fw-bold text-decoration-none"
                    style={{ color: '#294a70' }}
                  >
                    Login here
                  </Link>
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;