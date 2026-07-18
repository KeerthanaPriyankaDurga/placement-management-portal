import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import DashboardCard from '../components/DashboardCard';
import api from '../services/api';

const CompanyDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ postedJobs: 0, totalApplicants: 0, shortlisted: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const menuItems = [
    { label: 'Dashboard', path: '/company-dashboard', icon: 'speedometer2' },
    { label: 'Company Profile', path: '/company/profile', icon: 'building' },
    { label: 'Manage Jobs', path: '/company/jobs', icon: 'briefcase' },
    { label: 'Applicants', path: '/company/applicants', icon: 'people' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, statsRes] = await Promise.all([
          api.get('/company/profile'),
          api.get('/company/stats'),
        ]);
        setProfile(profileRes.data);
        setStats(statsRes.data);
      } catch (err) {
        setError('Could not load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container-fluid">
      <div className="row">
        <Sidebar menuItems={menuItems} />
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
            <h1 className="h2">Welcome, {profile?.name}</h1>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="row">
            <DashboardCard title="Active Job Postings" count={stats.postedJobs} icon="briefcase" color="primary" />
            <DashboardCard title="Total Applicants" count={stats.totalApplicants} icon="people" color="info" />
            <DashboardCard title="Shortlisted Candidates" count={stats.shortlisted} icon="star" color="success" />
          </div>

          <div className="row mt-4">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Company Details</h5>
                </div>
                <div className="card-body">
                  <p className="mb-1"><strong>Email:</strong> {profile?.email}</p>
                  <p className="mb-1"><strong>Industry:</strong> {profile?.industry || 'Not set'}</p>
                  <p className="mb-0"><strong>Website:</strong> {profile?.website || 'Not set'}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CompanyDashboard;
