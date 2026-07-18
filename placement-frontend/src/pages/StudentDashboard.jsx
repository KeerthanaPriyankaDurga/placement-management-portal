import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import Sidebar from '../components/Sidebar';
import DashboardCard from '../components/DashboardCard';
import api from '../services/api';

ChartJS.register(ArcElement, Tooltip, Legend);

const STATUS_COLORS = {
  PENDING: '#ffc107',
  SHORTLISTED: '#0dcaf0',
  SELECTED: '#0d6efd',
  PLACED: '#198754',
  REJECTED: '#dc3545',
};

const StudentDashboard = () => {
  const [stats, setStats] = useState({ applications: 0, offers: 0, pending: 0, statusBreakdown: {} });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, activitiesRes] = await Promise.all([
          api.get('/student/stats'),
          api.get('/student/activities'),
        ]);
        setStats(statsRes.data);
        setActivities(activitiesRes.data);
      } catch (err) {
        setError('Could not load dashboard data. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const menuItems = [
    { label: 'Dashboard', path: '/student-dashboard', icon: 'speedometer2' },
    { label: 'My Profile', path: '/profile', icon: 'person' },
    { label: 'Companies', path: '/companies', icon: 'building' },
    { label: 'Browse Jobs', path: '/jobs', icon: 'briefcase' },
    { label: 'Saved Jobs', path: '/saved-jobs', icon: 'heart' },
    { label: 'My Applications', path: '/applications', icon: 'file-earmark-text' },
    { label: 'Interview Schedule', path: '/interview-schedule', icon: 'calendar-event' },
  ];

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  const breakdown = stats.statusBreakdown || {};
  const labels = Object.keys(breakdown).filter(k => breakdown[k] > 0);
  const hasChartData = labels.length > 0;

  const chartData = {
    labels,
    datasets: [{
      data: labels.map(l => breakdown[l]),
      backgroundColor: labels.map(l => STATUS_COLORS[l] || '#6c757d'),
      borderWidth: 1,
    }],
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <Sidebar menuItems={menuItems} />

        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
            <h1 className="h2">Student Dashboard</h1>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="row">
            <DashboardCard title="Total Applications" count={stats.applications} icon="file-earmark-check" color="primary" />
            <DashboardCard title="Pending Applications" count={stats.pending} icon="clock-history" color="warning" />
            <DashboardCard title="Job Offers" count={stats.offers} icon="trophy" color="success" />
          </div>

          <div className="row mt-4">
            <div className="col-md-5 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Application Breakdown</h5>
                </div>
                <div className="card-body d-flex align-items-center justify-content-center" style={{ minHeight: 260 }}>
                  {hasChartData ? (
                    <Doughnut data={chartData} options={{ plugins: { legend: { position: 'bottom' } } }} />
                  ) : (
                    <p className="text-muted text-center mb-0">Apply to jobs to see your breakdown here.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-7 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Recent Activities</h5>
                </div>
                <div className="card-body">
                  <ul className="list-group list-group-flush">
                    {activities.length === 0 ? (
                      <li className="list-group-item text-center text-muted">No recent activities.</li>
                    ) : (
                      activities.map((item, index) => (
                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                          {item.text}
                          <span className="badge bg-secondary rounded-pill">{item.time}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
