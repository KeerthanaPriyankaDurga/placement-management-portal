import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import Sidebar from '../components/Sidebar';
import DashboardCard from '../components/DashboardCard';
import api from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0, approvedStudents: 0, pendingStudents: 0,
    totalCompanies: 0, totalJobs: 0, totalApplications: 0, placedStudents: 0, placementRate: 0
  });
  const [recentStudents, setRecentStudents] = useState([]);
  const [departmentStats, setDepartmentStats] = useState({});
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
    const fetchData = async () => {
      try {
        const [statsRes, studentsRes, deptRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/students'),
          api.get('/admin/stats/departments'),
        ]);
        setStats(statsRes.data);
        setRecentStudents(studentsRes.data.slice(-5).reverse());
        setDepartmentStats(deptRes.data);
      } catch (err) {
        setError('Could not load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  const deptLabels = Object.keys(departmentStats);
  const hasDeptData = deptLabels.length > 0;

  const deptChartData = {
    labels: deptLabels,
    datasets: [{
      label: 'Students',
      data: deptLabels.map(d => departmentStats[d]),
      backgroundColor: '#294a70',
      borderRadius: 4,
    }],
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <Sidebar menuItems={menuItems} />

        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
            <h1 className="h2">Admin Dashboard</h1>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="row">
            <DashboardCard title="Total Students" count={stats.totalStudents} icon="people" color="primary" />
            <DashboardCard title="Placed Students" count={stats.placedStudents} icon="person-check" color="success" />
            <DashboardCard title="Registered Companies" count={stats.totalCompanies} icon="building" color="info" />
            <DashboardCard title="Placement Rate" count={`${stats.placementRate ?? 0}%`} icon="graph-up-arrow" color="warning" />
          </div>

          <div className="row mt-4">
            <div className="col-md-6 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Overview</h5>
                </div>
                <div className="card-body">
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item d-flex justify-content-between">
                      Total Job Postings <span className="fw-bold">{stats.totalJobs}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      Total Applications <span className="fw-bold">{stats.totalApplications}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      Approved Students <span className="fw-bold">{stats.approvedStudents}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      Pending Approvals <span className="fw-bold">{stats.pendingStudents}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-md-6 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Students by Department</h5>
                </div>
                <div className="card-body d-flex align-items-center justify-content-center" style={{ minHeight: 220 }}>
                  {hasDeptData ? (
                    <Bar
                      data={deptChartData}
                      options={{
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
                      }}
                    />
                  ) : (
                    <p className="text-muted text-center mb-0">No student profiles yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12 mb-4">
              <div className="card shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Recent Student Registrations</h5>
                </div>
                <div className="card-body">
                  <ul className="list-group list-group-flush">
                    {recentStudents.length === 0 ? (
                      <li className="list-group-item text-muted text-center">No students registered yet.</li>
                    ) : (
                      recentStudents.map((s) => (
                        <li key={s.id} className="list-group-item d-flex justify-content-between align-items-center">
                          {s.name}
                          <span className={`badge ${s.approved ? 'bg-success' : 'bg-warning text-dark'}`}>
                            {s.approved ? 'Approved' : 'Pending'}
                          </span>
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

export default AdminDashboard;
