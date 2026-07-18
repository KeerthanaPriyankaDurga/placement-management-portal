import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyingId, setApplyingId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState('');

  const [searchText, setSearchText] = useState('');
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');

  const menuItems = [
    { label: 'Dashboard', path: '/student-dashboard', icon: 'speedometer2' },
    { label: 'My Profile', path: '/profile', icon: 'person' },
    { label: 'Companies', path: '/companies', icon: 'building' },
    { label: 'Browse Jobs', path: '/jobs', icon: 'briefcase' },
    { label: 'Saved Jobs', path: '/saved-jobs', icon: 'heart' },
    { label: 'My Applications', path: '/applications', icon: 'file-earmark-text' },
    { label: 'Interview Schedule', path: '/interview-schedule', icon: 'calendar-event' },
  ];

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs');
      setJobs(res.data);
    } catch (err) {
      setError('Could not load jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleApply = async (jobId) => {
    setApplyingId(jobId);
    setMessage('');
    setError('');
    try {
      await api.post(`/student/jobs/${jobId}/apply`);
      setMessage('Application submitted successfully!');
      fetchJobs();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not apply to this job.');
    } finally {
      setApplyingId(null);
    }
  };

  const toggleSaveJob = async (job) => {
    setSavingId(job.id);
    try {
      if (job.savedByCurrentUser) {
        await api.delete(`/student/jobs/${job.id}/save`);
      } else {
        await api.post(`/student/jobs/${job.id}/save`);
      }
      fetchJobs();
    } catch (err) {
      setError('Could not update saved jobs.');
    } finally {
      setSavingId(null);
    }
  };

  // Build filter option lists from whatever jobs are currently open
  const companyOptions = useMemo(
    () => [...new Set(jobs.map(j => j.companyName))].sort(),
    [jobs]
  );
  const locationOptions = useMemo(
    () => [...new Set(jobs.filter(j => j.location).map(j => j.location))].sort(),
    [jobs]
  );

  const toggleCompany = (name) => {
    setSelectedCompanies(prev =>
      prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
    );
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = searchText.trim() === '' ||
        job.title.toLowerCase().includes(searchText.toLowerCase()) ||
        (job.description || '').toLowerCase().includes(searchText.toLowerCase());
      const matchesCompany = selectedCompanies.length === 0 || selectedCompanies.includes(job.companyName);
      const matchesLocation = selectedLocation === '' || job.location === selectedLocation;
      return matchesSearch && matchesCompany && matchesLocation;
    });
  }, [jobs, searchText, selectedCompanies, selectedLocation]);

  const clearFilters = () => {
    setSearchText('');
    setSelectedCompanies([]);
    setSelectedLocation('');
  };

  const filtersActive = searchText !== '' || selectedCompanies.length > 0 || selectedLocation !== '';

  return (
    <div className="container-fluid">
      <div className="row">
        <Sidebar menuItems={menuItems} />
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
            <h1 className="h2">Browse Jobs</h1>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}

          <div className="row">
            {/* Filters sidebar */}
            <div className="col-md-3 mb-4">
              <div className="card shadow-sm">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <span className="fw-bold">Filters</span>
                  {filtersActive && (
                    <button className="btn btn-sm btn-link text-decoration-none p-0" onClick={clearFilters}>
                      Clear
                    </button>
                  )}
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">Search</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Job title or keyword"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                  </div>

                  {companyOptions.length > 0 && (
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-muted text-uppercase">Company</label>
                      {companyOptions.map(name => (
                        <div className="form-check" key={name}>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={`company-${name}`}
                            checked={selectedCompanies.includes(name)}
                            onChange={() => toggleCompany(name)}
                          />
                          <label className="form-check-label small" htmlFor={`company-${name}`}>{name}</label>
                        </div>
                      ))}
                    </div>
                  )}

                  {locationOptions.length > 0 && (
                    <div className="mb-2">
                      <label className="form-label small fw-bold text-muted text-uppercase">Location</label>
                      <select
                        className="form-select form-select-sm"
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                      >
                        <option value="">All locations</option>
                        {locationOptions.map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Job results */}
            <div className="col-md-9">
              {loading ? (
                <div className="text-center mt-5">Loading jobs...</div>
              ) : jobs.length === 0 ? (
                <div className="alert alert-info">No open jobs right now. Check back soon.</div>
              ) : filteredJobs.length === 0 ? (
                <div className="alert alert-info">No jobs match your filters. Try clearing some.</div>
              ) : (
                <div className="row">
                  {filteredJobs.map((job) => (
                    <div className="col-md-6 mb-4" key={job.id}>
                      <div className="card shadow-sm h-100">
                        <div className="card-body d-flex flex-column">
                          <div className="d-flex justify-content-between align-items-start">
                            <h5 className="card-title fw-bold">{job.title}</h5>
                            <button
                              className="btn btn-sm btn-link p-0 fs-5"
                              onClick={() => toggleSaveJob(job)}
                              disabled={savingId === job.id}
                              title={job.savedByCurrentUser ? 'Remove from saved jobs' : 'Save this job'}
                            >
                              <i className={`bi ${job.savedByCurrentUser ? 'bi-heart-fill text-danger' : 'bi-heart text-muted'}`}></i>
                            </button>
                          </div>
                          <h6 className="card-subtitle mb-2 text-muted">{job.companyName}</h6>
                          <p className="card-text small flex-grow-1">{job.description}</p>
                          <ul className="list-unstyled small mb-3">
                            <li><strong>Location:</strong> {job.location || 'Not specified'}</li>
                            <li><strong>Package:</strong> {job.packageOffers || 'Not specified'}</li>
                            <li><strong>Applicants so far:</strong> {job.applicantsCount}</li>
                            {job.expiryDate && (
                              <li><strong>Apply by:</strong> {new Date(job.expiryDate).toLocaleDateString()}</li>
                            )}
                          </ul>
                          {job.appliedByCurrentUser ? (
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
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Jobs;
