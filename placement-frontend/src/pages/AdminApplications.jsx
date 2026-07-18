import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

const statusBadge = (status) => {
  switch (status) {
    case 'PLACED': return 'bg-success';
    case 'SELECTED': return 'bg-primary';
    case 'SHORTLISTED': return 'bg-info text-dark';
    case 'REJECTED': return 'bg-danger';
    default: return 'bg-warning text-dark';
  }
};

const emptyInterviewForm = { interviewDate: '', interviewTime: '', interviewVenue: '', interviewMode: 'ONLINE', interviewMeetingLink: '', interviewInstructions: '' };

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [interviewTarget, setInterviewTarget] = useState(null);
  const [interviewForm, setInterviewForm] = useState(emptyInterviewForm);
  const [savingInterview, setSavingInterview] = useState(false);
  const [interviewError, setInterviewError] = useState('');
  const interviewCloseRef = useRef(null);

  const [actioningId, setActioningId] = useState(null);

  const menuItems = [
    { label: 'Dashboard', path: '/admin-dashboard', icon: 'speedometer2' },
    { label: 'Manage Students', path: '/admin/students', icon: 'people' },
    { label: 'Manage Companies', path: '/admin/companies', icon: 'building' },
    { label: 'Manage Jobs', path: '/admin/jobs', icon: 'briefcase' },
    { label: 'Applications', path: '/admin/applications', icon: 'file-earmark-text' },
  ];

  const fetchApplications = async () => {
    try {
      const res = await api.get('/admin/applications');
      setApplications(res.data);
    } catch (err) {
      setError('Could not load applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const updateStatus = async (id, status) => {
    setActioningId(id);
    setError('');
    try {
      await api.put(`/admin/applications/${id}/status`, { status });
      fetchApplications();
    } catch (err) {
      setError('Could not update this application. Please try again.');
    } finally {
      setActioningId(null);
    }
  };

  const openInterviewModal = (app) => {
    setInterviewTarget(app);
    setInterviewForm({
      interviewDate: app.interviewDate || '',
      interviewTime: app.interviewTime || '',
      interviewVenue: app.interviewVenue || '',
      interviewMode: app.interviewMode || 'ONLINE',
      interviewMeetingLink: app.interviewMeetingLink || '',
      interviewInstructions: app.interviewInstructions || ''
    });
    setInterviewError('');
  };

  const handleInterviewChange = (e) => {
    setInterviewForm({ ...interviewForm, [e.target.name]: e.target.value });
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    setSavingInterview(true);
    setInterviewError('');
    try {
      await api.put(`/admin/applications/${interviewTarget.id}/interview`, interviewForm);
      fetchApplications();
      interviewCloseRef.current?.click();
    } catch (err) {
      setInterviewError('Could not schedule the interview. Please try again.');
    } finally {
      setSavingInterview(false);
    }
  };

  return (
    <div className="container-fluid bg-light" style={{ minHeight: '100vh' }}>
      <div className="row">
        <Sidebar menuItems={menuItems} />
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
            <h1 className="h2 fw-bold text-dark">All Applications</h1>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="card shadow-sm border-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Student</th>
                    <th>Department</th>
                    <th>CGPA</th>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Applied On</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="8" className="text-center py-4">Loading...</td></tr>
                  ) : applications.length === 0 ? (
                    <tr><td colSpan="8" className="text-center py-4">No applications yet.</td></tr>
                  ) : (
                    applications.map(app => (
                      <tr key={app.id}>
                        <td className="fw-medium">{app.studentName}</td>
                        <td>{app.department || '—'}</td>
                        <td>{app.cgpa ?? '—'}</td>
                        <td>{app.jobTitle}</td>
                        <td>{app.companyName}</td>
                        <td>{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '—'}</td>
                        <td>
                          <span className={`badge ${statusBadge(app.status)}`}>{app.status}</span>
                          {app.interviewDate && (
                            <div className="small text-muted mt-1">
                              <i className="bi bi-calendar-event"></i> {new Date(app.interviewDate).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="text-end">
                          <div className="dropdown">
                            <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                              Actions
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end">
                              <li>
                                <button
                                  className="dropdown-item"
                                  disabled={actioningId === app.id || app.status === 'SHORTLISTED'}
                                  onClick={() => updateStatus(app.id, 'SHORTLISTED')}
                                >
                                  <i className="bi bi-check2-circle me-2"></i>Shortlist
                                </button>
                              </li>
                              <li>
                                <button
                                  className="dropdown-item"
                                  disabled={actioningId === app.id || app.status === 'SELECTED' || app.status === 'PLACED'}
                                  onClick={() => updateStatus(app.id, 'SELECTED')}
                                >
                                  <i className="bi bi-trophy me-2"></i>Select (Offer)
                                </button>
                              </li>
                              <li>
                                <button
                                  className="dropdown-item text-danger"
                                  disabled={actioningId === app.id || app.status === 'REJECTED'}
                                  onClick={() => updateStatus(app.id, 'REJECTED')}
                                >
                                  <i className="bi bi-x-circle me-2"></i>Reject
                                </button>
                              </li>
                              <li><hr className="dropdown-divider" /></li>
                              <li>
                                <button
                                  className="dropdown-item"
                                  data-bs-toggle="modal" data-bs-target="#adminInterviewModal"
                                  onClick={() => openInterviewModal(app)}
                                >
                                  <i className="bi bi-calendar-plus me-2"></i>
                                  {app.interviewDate ? 'Reschedule Interview' : 'Schedule Interview'}
                                </button>
                              </li>
                            </ul>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Schedule Interview Modal */}
      <div className="modal fade" id="adminInterviewModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 border-0 shadow">
            <div className="modal-header border-bottom-0">
              <h5 className="modal-title fw-bold">
                Schedule Interview {interviewTarget && `— ${interviewTarget.studentName}`}
              </h5>
              <button ref={interviewCloseRef} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {interviewError && <div className="alert alert-danger">{interviewError}</div>}
              <form onSubmit={handleScheduleInterview}>
                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold text-uppercase">Date</label>
                  <input type="date" className="form-control" name="interviewDate" value={interviewForm.interviewDate} onChange={handleInterviewChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold text-uppercase">Time</label>
                  <input type="text" className="form-control" name="interviewTime" placeholder="e.g. 10:30 AM" value={interviewForm.interviewTime} onChange={handleInterviewChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold text-uppercase">Mode</label>
                  <select className="form-select" name="interviewMode" value={interviewForm.interviewMode} onChange={handleInterviewChange}>
                    <option value="ONLINE">Online</option>
                    <option value="OFFLINE">Offline</option>
                  </select>
                </div>
                {interviewForm.interviewMode === 'OFFLINE' ? (
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold text-uppercase">Venue</label>
                    <input type="text" className="form-control" name="interviewVenue" value={interviewForm.interviewVenue} onChange={handleInterviewChange} />
                  </div>
                ) : (
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold text-uppercase">Meeting Link</label>
                    <input type="text" className="form-control" name="interviewMeetingLink" placeholder="https://meet.google.com/..." value={interviewForm.interviewMeetingLink} onChange={handleInterviewChange} />
                  </div>
                )}
                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold text-uppercase">Additional Instructions (optional)</label>
                  <textarea className="form-control" name="interviewInstructions" rows="2" value={interviewForm.interviewInstructions} onChange={handleInterviewChange}></textarea>
                </div>
                <button type="submit" className="btn btn-primary w-100 fw-bold" disabled={savingInterview}>
                  {savingInterview ? 'Saving...' : 'Save Interview Details'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminApplications;
