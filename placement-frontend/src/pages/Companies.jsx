import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const menuItems = [
    { label: 'Dashboard', path: '/student-dashboard', icon: 'speedometer2' },
    { label: 'My Profile', path: '/profile', icon: 'person' },
    { label: 'Companies', path: '/companies', icon: 'building' },
    { label: 'Browse Jobs', path: '/jobs', icon: 'briefcase' },
    { label: 'Saved Jobs', path: '/saved-jobs', icon: 'heart' },
    { label: 'My Applications', path: '/applications', icon: 'file-earmark-text' },
    { label: 'Interview Schedule', path: '/interview-schedule', icon: 'calendar-event' },
  ];

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get('/jobs/companies');
        setCompanies(res.data);
      } catch (err) {
        setError('Could not load companies. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  return (
    <div className="container-fluid">
      <div className="row">
        <Sidebar menuItems={menuItems} />
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
            <h1 className="h2">Companies Hiring</h1>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {loading ? (
            <div className="text-center mt-5">Loading companies...</div>
          ) : companies.length === 0 ? (
            <div className="alert alert-info">No companies are currently hiring. Check back soon.</div>
          ) : (
            <div className="row">
              {companies.map((company) => (
                <div className="col-md-4 mb-4" key={company.id}>
                  <div className="card shadow-sm h-100">
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title text-primary fw-bold">{company.name}</h5>
                      {company.industry && <span className="badge bg-light text-dark border mb-2 align-self-start">{company.industry}</span>}
                      <p className="card-text text-muted small mb-3">
                        {company.openJobs} open position{company.openJobs === 1 ? '' : 's'}
                      </p>
                      <div className="mt-auto d-flex flex-column gap-2">
                        <Link to={`/companies/${company.id}`} className="btn btn-primary btn-sm w-100">
                          View Details
                        </Link>
                        {company.website && (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-secondary btn-sm w-100"
                          >
                            <i className="bi bi-globe me-1"></i>Visit Website
                          </a>
                        )}
                      </div>
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

export default Companies;
