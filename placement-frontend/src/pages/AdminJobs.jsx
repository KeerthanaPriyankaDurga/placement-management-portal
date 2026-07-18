import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

// Replaces the old "Placement Drives" page — your backend models job postings
// (JobOffer), not separate "drives", so this shows a read-only view of every
// job every company has posted. Companies manage their own postings from
// their own dashboard; Admin just gets visibility here.
const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const menuItems = [
    { label: 'Dashboard', path: '/admin-dashboard', icon: 'speedometer2' },
    { label: 'Manage Students', path: '/admin/students', icon: 'people' },
    { label: 'Manage Companies', path: '/admin/companies', icon: 'building' },
    { label: 'Manage Jobs', path: '/admin/jobs', icon: 'briefcase' },
    { label: 'Applications', path: '/admin/applications', icon: 'file-earmark-text' },
  ];

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/jobs');
        setJobs(res.data);
      } catch (err) {
        setError('Could not load jobs. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="container-fluid bg-light" style={{ minHeight: '100vh' }}>
      <div className="row">
        <Sidebar menuItems={menuItems} />
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
            <h1 className="h2 fw-bold text-dark">Manage Jobs</h1>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="card shadow-sm border-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Location</th>
                    <th>Package</th>
                    <th>Applicants</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr>
                  ) : jobs.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-4">No jobs posted yet.</td></tr>
                  ) : (
                    jobs.map(job => (
                      <tr key={job.id}>
                        <td className="fw-medium">{job.title}</td>
                        <td>{job.companyName}</td>
                        <td>{job.location || '—'}</td>
                        <td>{job.packageOffers || '—'}</td>
                        <td>{job.applicantsCount}</td>
                        <td>
                          <span className={`badge ${job.active ? 'bg-success' : 'bg-secondary'}`}>
                            {job.active ? 'Active' : 'Closed'}
                          </span>
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
    </div>
  );
};

export default AdminJobs;
