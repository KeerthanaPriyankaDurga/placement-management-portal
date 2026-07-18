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

const emptyInterviewForm = { interviewDate: '', interviewTime: '', interviewVenue: '', interviewMode: 'ONLINE', interviewMeetingLink: '' };

const CompanyApplicants = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actioningId, setActioningId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const [interviewTarget, setInterviewTarget] = useState(null);
  const [interviewForm, setInterviewForm] = useState(emptyInterviewForm);
  const [savingInterview, setSavingInterview] = useState(false);
  const [interviewError, setInterviewError] = useState('');
  const interviewCloseRef = useRef(null);

  const [offerTarget, setOfferTarget] = useState(null);
  const [uploadingOffer, setUploadingOffer] = useState(false);
  const [offerError, setOfferError] = useState('');
  const offerFileRef = useRef(null);
  const offerCloseRef = useRef(null);

  const menuItems = [
    { label: 'Dashboard', path: '/company-dashboard', icon: 'speedometer2' },
    { label: 'Company Profile', path: '/company/profile', icon: 'building' },
    { label: 'Manage Jobs', path: '/company/jobs', icon: 'briefcase' },
    { label: 'Applicants', path: '/company/applicants', icon: 'people' },
  ];

  const fetchApplicants = async () => {
    try {
      const res = await api.get('/company/applicants');
      setApplicants(res.data);
    } catch (err) {
      setError('Could not load applicants.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const updateStatus = async (id, status) => {
    setActioningId(id);
    setError('');
    try {
      await api.put(`/company/applications/${id}/status`, { status });
      fetchApplicants();
    } catch (err) {
      setError('Could not update this application. Please try again.');
    } finally {
      setActioningId(null);
    }
  };

  const handleDownloadResume = async (app) => {
    setDownloadingId(app.id);
    setError('');
    try {
      const res = await api.get(`/company/applications/${app.id}/resume`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${app.studentName}_resume.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(`Could not download resume for ${app.studentName}. They may not have uploaded one yet.`);
    } finally {
      setDownloadingId(null);
    }
  };

  const openInterviewModal = (app) => {
    setInterviewTarget(app);
    setInterviewForm({
      interviewDate: app.interviewDate || '',
      interviewTime: app.interviewTime || '',
      interviewVenue: app.interviewVenue || '',
      interviewMode: app.interviewMode || 'ONLINE',
      interviewMeetingLink: app.interviewMeetingLink || ''
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
      await api.put(`/company/applications/${interviewTarget.id}/interview`, interviewForm);
      fetchApplicants();
      interviewCloseRef.current?.click();
    } catch (err) {
      setInterviewError('Could not schedule the interview. Please try again.');
    } finally {
      setSavingInterview(false);
    }
  };

  const openOfferModal = (app) => {
    setOfferTarget(app);
    setOfferError('');
  };

  const handleUploadOfferLetter = async () => {
    const file = offerFileRef.current?.files[0];
    if (!file) {
      setOfferError('Please choose a PDF file first.');
      return;
    }
    if (file.type !== 'application/pdf') {
      setOfferError('Only PDF files are allowed.');
      return;
    }
    setUploadingOffer(true);
    setOfferError('');
    try {
      const formPayload = new FormData();
      formPayload.append('file', file);
      await api.post(`/company/applications/${offerTarget.id}/offer-letter`, formPayload);
      fetchApplicants();
      setOfferTarget(null);
      offerCloseRef.current?.click();
    } catch (err) {
      setOfferError(err.response?.data?.message || 'Could not upload offer letter.');
    } finally {
      setUploadingOffer(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <Sidebar menuItems={menuItems} />
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
            <h1 className="h2">Applicants</h1>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="card shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Student</th>
                    <th>Department</th>
                    <th>CGPA</th>
                    <th>Job Title</th>
                    <th>Applied On</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="7" className="text-center py-4">Loading...</td></tr>
                  ) : applicants.length === 0 ? (
                    <tr><td colSpan="7" className="text-center py-4">No applicants yet.</td></tr>
                  ) : (
                    applicants.map(app => (
                      <tr key={app.id}>
                        <td className="fw-medium">{app.studentName}</td>
                        <td>{app.department || '—'}</td>
                        <td>{app.cgpa ?? '—'}</td>
                        <td>{app.jobTitle}</td>
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
                            <button
                              className="btn btn-sm btn-outline-secondary dropdown-toggle"
                              type="button"
                              data-bs-toggle="dropdown"
                            >
                              Actions
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end">
                              <li>
                                <button className="dropdown-item" onClick={() => handleDownloadResume(app)} disabled={downloadingId === app.id}>
                                  <i className="bi bi-file-earmark-arrow-down me-2"></i>
                                  {downloadingId === app.id ? 'Downloading...' : 'Download Resume'}
                                </button>
                              </li>
                              <li><hr className="dropdown-divider" /></li>
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
                                  data-bs-toggle="modal" data-bs-target="#interviewModal"
                                  onClick={() => openInterviewModal(app)}
                                >
                                  <i className="bi bi-calendar-plus me-2"></i>
                                  {app.interviewDate ? 'Reschedule Interview' : 'Schedule Interview'}
                                </button>
                              </li>
                              <li>
                                <button
                                  className="dropdown-item"
                                  disabled={app.status !== 'SELECTED' && app.status !== 'PLACED'}
                                  data-bs-toggle="modal" data-bs-target="#offerLetterModal"
                                  onClick={() => openOfferModal(app)}
                                >
                                  <i className="bi bi-file-earmark-pdf me-2"></i>
                                  {app.offerLetterAvailable ? 'Replace Offer Letter' : 'Upload Offer Letter'}
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

          {/* Schedule Interview Modal */}
          <div className="modal fade" id="interviewModal" tabIndex="-1" aria-hidden="true">
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
                    <button type="submit" className="btn btn-primary w-100 fw-bold" disabled={savingInterview}>
                      {savingInterview ? 'Saving...' : 'Save Interview Details'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Offer Letter Modal */}
          <div className="modal fade" id="offerLetterModal" tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 shadow">
                <div className="modal-header border-bottom-0">
                  <h5 className="modal-title fw-bold">
                    Upload Offer Letter {offerTarget && `— ${offerTarget.studentName}`}
                  </h5>
                  <button ref={offerCloseRef} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  {offerError && <div className="alert alert-danger">{offerError}</div>}
                  <input type="file" accept="application/pdf" ref={offerFileRef} className="form-control mb-3" />
                  <p className="text-muted small">PDF only, max 5MB.</p>
                  <button
                    type="button"
                    className="btn btn-primary w-100 fw-bold"
                    onClick={handleUploadOfferLetter}
                    disabled={uploadingOffer}
                  >
                    {uploadingOffer ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CompanyApplicants;
