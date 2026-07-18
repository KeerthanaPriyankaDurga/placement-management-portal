import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

const emptyForm = { title: '', description: '', location: '', packageOffers: '', active: true, expiryDate: '' };

const CompanyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null); // null = creating a new job
  const closeButtonRef = useRef(null);

  const menuItems = [
    { label: 'Dashboard', path: '/company-dashboard', icon: 'speedometer2' },
    { label: 'Company Profile', path: '/company/profile', icon: 'building' },
    { label: 'Manage Jobs', path: '/company/jobs', icon: 'briefcase' },
    { label: 'Applicants', path: '/company/applicants', icon: 'people' },
  ];

  const fetchJobs = async () => {
    try {
      const res = await api.get('/company/jobs');
      setJobs(res.data);
    } catch (err) {
      setError('Could not load your job postings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setFormError('');
  };

  const openEditModal = (job) => {
    setEditingId(job.id);
    setFormData({
      title: job.title,
      description: job.description || '',
      location: job.location || '',
      packageOffers: job.packageOffers || '',
      active: job.active,
      expiryDate: job.expiryDate || ''
    });
    setFormError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    const payload = { ...formData, expiryDate: formData.expiryDate === '' ? null : formData.expiryDate };
    try {
      if (editingId) {
        await api.put(`/company/jobs/${editingId}`, payload);
      } else {
        await api.post('/company/jobs', payload);
      }
      fetchJobs();
      closeButtonRef.current?.click();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not save this job.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job posting? This cannot be undone.')) return;
    try {
      await api.delete(`/company/jobs/${id}`);
      fetchJobs();
    } catch (err) {
      setError('Could not delete this job. Please try again.');
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <Sidebar menuItems={menuItems} />
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
            <h1 className="h2">Manage Jobs</h1>
            <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#jobModal" onClick={openCreateModal}>
              <i className="bi bi-plus-lg me-1"></i> Post New Job
            </button>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="card shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Title</th>
                    <th>Location</th>
                    <th>Package</th>
                    <th>Applicants</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr>
                  ) : jobs.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-4">You haven't posted any jobs yet.</td></tr>
                  ) : (
                    jobs.map(job => (
                      <tr key={job.id}>
                        <td className="fw-medium">{job.title}</td>
                        <td>{job.location || '—'}</td>
                        <td>{job.packageOffers || '—'}</td>
                        <td>{job.applicantsCount}</td>
                        <td>
                          {job.expired ? (
                            <span className="badge bg-danger">Expired</span>
                          ) : (
                            <span className={`badge ${job.active ? 'bg-success' : 'bg-secondary'}`}>
                              {job.active ? 'Active' : 'Closed'}
                            </span>
                          )}
                        </td>
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-light text-primary me-2"
                            data-bs-toggle="modal" data-bs-target="#jobModal"
                            onClick={() => openEditModal(job)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-sm btn-light text-danger" onClick={() => handleDelete(job.id)}>
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

          {/* Create/Edit Job Modal */}
          <div className="modal fade" id="jobModal" tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 shadow">
                <div className="modal-header border-bottom-0">
                  <h5 className="modal-title fw-bold">{editingId ? 'Edit Job' : 'Post New Job'}</h5>
                  <button ref={closeButtonRef} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  {formError && <div className="alert alert-danger">{formError}</div>}
                  <form onSubmit={handleSave}>
                    <div className="mb-3">
                      <label className="form-label text-muted small fw-bold text-uppercase">Job Title</label>
                      <input type="text" className="form-control" name="title" value={formData.title} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted small fw-bold text-uppercase">Description</label>
                      <textarea className="form-control" name="description" rows="3" value={formData.description} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted small fw-bold text-uppercase">Location</label>
                      <input type="text" className="form-control" name="location" value={formData.location} onChange={handleChange} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted small fw-bold text-uppercase">Package</label>
                      <input type="text" className="form-control" name="packageOffers" placeholder="e.g. 6 LPA" value={formData.packageOffers} onChange={handleChange} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted small fw-bold text-uppercase">Application Deadline (optional)</label>
                      <input type="date" className="form-control" name="expiryDate" value={formData.expiryDate} onChange={handleChange} />
                      <div className="form-text">Leave blank for no deadline. The job auto-hides from students once this date passes.</div>
                    </div>
                    <div className="form-check mb-3">
                      <input className="form-check-input" type="checkbox" name="active" checked={formData.active} onChange={handleChange} id="activeCheck" />
                      <label className="form-check-label" htmlFor="activeCheck">Accepting applications (Active)</label>
                    </div>
                    <button type="submit" className="btn btn-primary w-100 fw-bold" disabled={saving}>
                      {saving ? 'Saving...' : 'Save Job'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CompanyJobs;
