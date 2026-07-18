import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', industry: '', website: '' });
  const [showPassword, setShowPassword] = useState(false);
  const closeButtonRef = useRef(null);

  const [editTarget, setEditTarget] = useState(null);
  const [editData, setEditData] = useState({ industry: '', website: '', description: '' });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const editCloseRef = useRef(null);

  const menuItems = [
    { label: 'Dashboard', path: '/admin-dashboard', icon: 'speedometer2' },
    { label: 'Manage Students', path: '/admin/students', icon: 'people' },
    { label: 'Manage Companies', path: '/admin/companies', icon: 'building' },
    { label: 'Manage Jobs', path: '/admin/jobs', icon: 'briefcase' },
    { label: 'Applications', path: '/admin/applications', icon: 'file-earmark-text' },
  ];

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/admin/companies');
      setCompanies(res.data);
    } catch (err) {
      setError('Could not load companies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      await api.post('/admin/companies', formData);
      setFormData({ name: '', email: '', password: '', industry: '', website: '' });
      fetchCompanies();
      closeButtonRef.current?.click(); // programmatically close the modal on success
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not create company account.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this company account? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/companies/${id}`);
      fetchCompanies();
    } catch (err) {
      setError('Could not remove this company. Please try again.');
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/admin/companies/${id}/approve`);
      fetchCompanies();
    } catch (err) {
      setError('Could not verify this company. Please try again.');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject and permanently remove this company registration?')) return;
    try {
      await api.post(`/admin/companies/${id}/reject`);
      fetchCompanies();
    } catch (err) {
      setError('Could not reject this company. Please try again.');
    }
  };

  const openEditModal = (c) => {
    setEditTarget(c);
    setEditData({
      industry: c.industry || '',
      website: c.website || '',
      description: c.description || ''
    });
    setEditError('');
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    setEditError('');
    try {
      await api.put(`/admin/companies/${editTarget.userId}`, editData);
      fetchCompanies();
      editCloseRef.current?.click();
    } catch (err) {
      setEditError('Could not save changes. Please try again.');
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div className="container-fluid bg-body-bg">
      <div className="row">
        <Sidebar menuItems={menuItems} />

        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
            <h1 className="h2 fw-bold text-dark">Manage Registered Companies</h1>
            <button className="btn btn-primary fw-medium rounded-3 shadow-sm" data-bs-toggle="modal" data-bs-target="#addCompanyModal">
              <i className="bi bi-building-add me-2"></i> Register Company
            </button>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="text-secondary fw-semibold ps-4 py-3">Company Name</th>
                      <th className="text-secondary fw-semibold py-3">Industry</th>
                      <th className="text-secondary fw-semibold py-3">Website</th>
                      <th className="text-secondary fw-semibold py-3">HR Email</th>
                      <th className="text-secondary fw-semibold py-3">Active Jobs</th>
                      <th className="text-secondary fw-semibold py-3">Status</th>
                      <th className="text-secondary fw-semibold pe-4 py-3 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="7" className="text-center py-4">Loading...</td></tr>
                    ) : companies.length === 0 ? (
                      <tr><td colSpan="7" className="text-center py-4">No companies registered yet.</td></tr>
                    ) : (
                      companies.map(c => (
                        <tr key={c.userId}>
                          <td className="fw-bold text-dark ps-4 py-3">
                            <div className="d-flex align-items-center">
                              <div className="bg-light rounded p-2 me-3 text-primary"><i className="bi bi-building"></i></div>
                              {c.name}
                            </div>
                          </td>
                          <td className="text-muted">{c.industry || '—'}</td>
                          <td>
                            {c.website ? (
                              <a href={c.website} target="_blank" rel="noopener noreferrer" className="small">
                                <i className="bi bi-box-arrow-up-right me-1"></i>Visit
                              </a>
                            ) : '—'}
                          </td>
                          <td className="text-muted">{c.email}</td>
                          <td><span className="badge bg-primary rounded-pill">{c.activeJobs}</span></td>
                          <td>
                            <span className={`badge ${c.approved ? 'bg-success' : 'bg-warning text-dark'}`}>
                              {c.approved ? 'Verified' : 'Pending Verification'}
                            </span>
                          </td>
                          <td className="pe-4 text-end">
                            {!c.approved && (
                              <button
                                className="btn btn-sm btn-success me-2"
                                onClick={() => handleApprove(c.userId)}
                                title="Verify this company"
                              >
                                <i className="bi bi-check-lg"></i> Verify
                              </button>
                            )}
                            {!c.approved && (
                              <button
                                className="btn btn-sm btn-light text-danger shadow-sm me-2"
                                onClick={() => handleReject(c.userId)}
                                title="Reject this company"
                              >
                                <i className="bi bi-x-lg"></i>
                              </button>
                            )}
                            <button
                              className="btn btn-sm btn-light text-primary shadow-sm me-2"
                              onClick={() => openEditModal(c)}
                              data-bs-toggle="modal" data-bs-target="#editCompanyModal"
                              title="Edit company profile"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-light text-danger shadow-sm"
                              onClick={() => handleDelete(c.userId)}
                              title="Remove company"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Add Company Modal */}
          <div className="modal fade" id="addCompanyModal" tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 shadow">
                <div className="modal-header border-bottom-0">
                  <h5 className="modal-title fw-bold">Register New Company</h5>
                  <button ref={closeButtonRef} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  {formError && <div className="alert alert-danger">{formError}</div>}
                  <div className="alert alert-info small">
                    The company won't be able to log in until you verify it from the list afterward.
                  </div>
                  <form onSubmit={handleSave}>
                    <div className="mb-3">
                      <label className="form-label text-muted small fw-bold text-uppercase">Company Name</label>
                      <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted small fw-bold text-uppercase">HR Email (used to login)</label>
                      <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted small fw-bold text-uppercase">Temporary Password</label>
                      <div className="input-group">
                        <input type={showPassword ? 'text' : 'password'} className="form-control" name="password" value={formData.password} onChange={handleChange} required minLength={6} />
                        <span className="input-group-text bg-transparent" role="button" onClick={() => setShowPassword(!showPassword)}>
                          <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted small fw-bold text-uppercase">Industry</label>
                      <input type="text" className="form-control" name="industry" value={formData.industry} onChange={handleChange} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted small fw-bold text-uppercase">Website</label>
                      <input type="text" className="form-control" name="website" value={formData.website} onChange={handleChange} />
                    </div>
                    <button type="submit" className="btn btn-primary w-100 fw-bold" disabled={saving}>
                      {saving ? 'Saving...' : 'Save Company'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>

      {/* Edit Company Modal */}
      <div className="modal fade" id="editCompanyModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 border-0 shadow">
            <div className="modal-header border-bottom-0">
              <h5 className="modal-title fw-bold">
                Edit Company {editTarget && `— ${editTarget.name}`}
              </h5>
              <button ref={editCloseRef} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {editError && <div className="alert alert-danger">{editError}</div>}
              <form onSubmit={handleSaveEdit}>
                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold text-uppercase">Industry</label>
                  <input type="text" className="form-control" name="industry" value={editData.industry} onChange={handleEditChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold text-uppercase">Official Website</label>
                  <input type="text" className="form-control" name="website" placeholder="https://www.example.com" value={editData.website} onChange={handleEditChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold text-uppercase">Description</label>
                  <textarea className="form-control" name="description" rows="3" value={editData.description} onChange={handleEditChange}></textarea>
                </div>
                <button type="submit" className="btn btn-primary w-100 fw-bold" disabled={editSaving}>
                  {editSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCompanies;
