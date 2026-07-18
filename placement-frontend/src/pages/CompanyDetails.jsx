import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

const CompanyDetails = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyingId, setApplyingId] = useState(null);
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

  const fetchCompany = async () => {
    try {
      const res = await api.get(`/jobs/companies/${id}`);
      setCompany(res.data);
    } catch (err) {
      setError('Could not load this company\'s details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleApply = async (jobId) => {
    setApplyingId(jobId);
    setMessage('');
    setError('');
    try {
      await api.post(`/student/jobs/${jobId}/apply`);
      setMessage('Application submitted successfully!');
      fetchCompany();
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
            <h1 className="h2">Company Details</h1>
            <Link to="/companies" className="btn btn-outline-secondary btn-sm">
              <i className="bi bi-arrow-left me-1"></i>Back to Companies
            </Link>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}

          {loading ? (
            <div className="text-center mt-5">Loading company details...</div>
          ) : !company ? null : (
            <>
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="rounded-circle bg-light d-flex align-items-center justify-content-center text-primary"
                        style={{ width: 64, height: 64, fontSize: '1.75rem' }}
                      >
                        <i className="bi bi-building"></i>
                      </div>
                      <div>
                        <h3 className="fw-bold mb-1">{company.name}</h3>
                        {company.industry && <span className="badge bg-secondary">{company.industry}</span>}
                      </div>
                    </div>

                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary fw-bold"
                      >
                        <i className="bi bi-globe me-2"></i>Visit Website
                      </a>
                    )}
                  </div>

                  {company.description && (
                    <p className="text-muted mt-4 mb-0">{company.description}</p>
                  )}

                  <div className="mt-4">
                    <span className="badge bg-light text-dark border">
                      <i className="bi bi-briefcase me-1"></i>{company.activeJobs} active job{company.activeJobs === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>
              </div>

              <h4 className="fw-bold mb-3">Open Positions</h4>
              {company.jobs.length === 0 ? (
                <div className="alert alert-info">This company has no open positions right now.</div>
              ) : (
                <div className="row">
                  {company.jobs.map((job) => (
                    <div className="col-md-6 mb-4" key={job.id}>
                      <div className="card shadow-sm h-100">
                        <div className="card-body d-flex flex-column">
                          <h5 className="card-title fw-bold">{job.title}</h5>
                          <p className="card-text small flex-grow-1">{job.description}</p>
                          <ul className="list-unstyled small mb-3">
                            <li><i className="bi bi-geo-alt me-1 text-muted"></i><strong>Location:</strong> {job.location || 'Not specified'}</li>
                            <li><i className="bi bi-cash-stack me-1 text-muted"></i><strong>Package:</strong> {job.packageOffers || 'Not specified'}</li>
                            <li><i className="bi bi-people me-1 text-muted"></i><strong>Applicants:</strong> {job.applicantsCount}</li>
                          </ul>
                          {job.appliedByCurrentUser ? (
                            <button className="btn btn-secondary btn-sm w-100" disabled>Already Applied</button>
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
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default CompanyDetails;
