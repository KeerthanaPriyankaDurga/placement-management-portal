import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import StatusTimeline from '../components/StatusTimeline';
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

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [actioningId, setActioningId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const menuItems = [
    { label: 'Dashboard', path: '/student-dashboard', icon: 'speedometer2' },
    { label: 'My Profile', path: '/profile', icon: 'person' },
    { label: 'Companies', path: '/companies', icon: 'building' },
    { label: 'Browse Jobs', path: '/jobs', icon: 'briefcase' },
    { label: 'Saved Jobs', path: '/saved-jobs', icon: 'heart' },
    { label: 'My Applications', path: '/applications', icon: 'file-earmark-text' },
    { label: 'Interview Schedule', path: '/interview-schedule', icon: 'calendar-event' },
  ];

  const fetchApplications = async () => {
    try {
      const res = await api.get('/student/applications');
      setApplications(res.data);
    } catch (err) {
      setError('Could not load your applications. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleDownloadOfferLetter = async (app) => {
    setError('');
    try {
      const res = await api.get(`/student/applications/${app.id}/offer-letter`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${app.companyName}_offer_letter.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Could not download offer letter.');
    }
  };

  const handleAcceptOffer = async (id) => {
    setActioningId(id);
    setMessage('');
    setError('');
    try {
      await api.post(`/student/applications/${id}/accept-offer`);
      setMessage('Offer accepted! Congratulations on your placement.');
      fetchApplications();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not accept this offer.');
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <Sidebar menuItems={menuItems} />
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
            <h1 className="h2">My Applications</h1>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}

          {loading ? (
            <div className="text-center mt-5">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="alert alert-info">
              You haven't applied to any jobs yet. Head to <strong>Browse Jobs</strong> to get started.
            </div>
          ) : (
            <div className="card shadow-sm">
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Job Title</th>
                      <th>Company</th>
                      <th>Applied On</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <React.Fragment key={app.id}>
                        <tr>
                          <td>{app.jobTitle}</td>
                          <td>{app.companyName}</td>
                          <td>{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '—'}</td>
                          <td>
                            <span className={`badge ${statusBadge(app.status)}`}>{app.status}</span>
                            {app.interviewDate && (
                              <div className="small text-muted mt-1">
                                <i className="bi bi-calendar-event"></i> {new Date(app.interviewDate).toLocaleDateString()} {app.interviewTime}
                              </div>
                            )}
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-link text-decoration-none p-0 me-2"
                              onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                            >
                              {expandedId === app.id ? 'Hide progress' : 'View progress'}
                            </button>
                            {app.status === 'SELECTED' && (
                              <button
                                className="btn btn-sm btn-success me-2"
                                disabled={actioningId === app.id}
                                onClick={() => handleAcceptOffer(app.id)}
                              >
                                {actioningId === app.id ? 'Accepting...' : 'Accept Offer'}
                              </button>
                            )}
                            {app.offerLetterAvailable && (
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleDownloadOfferLetter(app)}
                              >
                                <i className="bi bi-file-earmark-pdf me-1"></i>Offer Letter
                              </button>
                            )}
                          </td>
                        </tr>
                        {expandedId === app.id && (
                          <tr>
                            <td colSpan="5" className="bg-light">
                              <div className="py-2 px-3">
                                <StatusTimeline status={app.status} />
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Applications;
