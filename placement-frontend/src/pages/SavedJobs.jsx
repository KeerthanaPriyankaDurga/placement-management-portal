import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

const SavedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyingId, setApplyingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [message, setMessage] = useState('');

  const menuItems = [
    { label: 'Dashboard', path: '/student-dashboard', icon: 'speedometer2' },
    { label: 'My Profile', path: '/profile', icon: 'person' },
    { label: 'Companies', path: '/companies', icon: 'building' },
    { label: 'Browse Jobs', path: '/jobs', icon: 'briefcase' },
    { label: 'Saved Jobs', path: '/saved-jobs', icon: 'heart' },
    { label: 'My Applications', path: '/applications', icon: 'file-earmark-text' },
    { label: 'Interview Schedule', path: '/interview-schedule', icon: 'calendar-event' },
  ];

  const fetchSavedJobs = async () => {
    try {
      const res = await api.get('/student/saved-jobs');
      setJobs(res.data);
    } catch (err) {
      setError('Could not load your saved jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const handleRemove = async (jobId) => {
    setRemovingId(jobId);
    try {
      await api.delete(`/student/jobs/${jobId}/save`);
      fetchSavedJobs();
    } catch (err) {
      setError('Could not remove this job.');
    } finally {
      setRemovingId(null);
    }
  };

  const handleApply = async (jobId) => {
    setApplyingId(jobId);
    setMessage('');
    setError('');
    try {
      await api.post(`/student/jobs/${jobId}/apply`);
      setMessage('Application submitted successfully!');
      fetchSavedJobs();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not apply to this job.');
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <Sidebar menuItems={menuItems} />
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
            <h1 className="h2">Saved Jobs</h1>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}

          {loading ? (
            <div className="text-center mt-5">Loading...</div>
          ) : jobs.length === 0 ? (
            <div className="alert alert-info">
              You haven't saved any jobs yet. Tap the heart icon on any job in <strong>Browse Jobs</strong> to save it here.
            </div>
          ) : (
            <div className="row">
              {jobs.map((job) => (
                <div className="col-md-6 mb-4" key={job.id}>
                  <div className="card shadow-sm h-100">
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start">
                        <h5 className="card-title fw-bold">{job.title}</h5>
                        <button
                          className="btn btn-sm btn-link p-0 text-danger"
                          onClick={() => handleRemove(job.id)}
                          disabled={removingId === job.id}
                          title="Remove from saved jobs"
                        >
                          <i className="bi bi-heart-fill fs-5"></i>
                        </button>
                      </div>
                      <h6 className="card-subtitle mb-2 text-muted">{job.companyName}</h6>
                      <p className="card-text small flex-grow-1">{job.description}</p>
                      <ul className="list-unstyled small mb-3">
                        <li><strong>Location:</strong> {job.location || 'Not specified'}</li>
                        <li><strong>Package:</strong> {job.packageOffers || 'Not specified'}</li>
                      </ul>
                      {job.expired || !job.active ? (
                        <button className="btn btn-secondary btn-sm w-100" disabled>
                          No Longer Available
                        </button>
                      ) : job.appliedByCurrentUser ? (
                        <button className="btn btn-secondary btn-sm w-100" disabled>
                          Already Applied
                        </button>
                      ) : (
                        <button
                          className="btn btn-primary btn-sm w-100"
                          onClick={() => handleApply(job.id)}
                          disabled={applyingId === job.id}
                        >
                          {applyingId === job.id ? 'Applying...' : 'Apply Now'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SavedJobs;
