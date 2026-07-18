import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import api from '../services/api';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actioningId, setActioningId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchStudents = async () => {
    try {
      const response = await api.get('/admin/students');
      setStudents(response.data);
    } catch (err) {
      setError('Could not load students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleApprove = async (id) => {
    setActioningId(id);
    setError('');
    try {
      await api.post(`/admin/students/${id}/approve`);
      fetchStudents();
    } catch (err) {
      setError('Could not approve this student. Please try again.');
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject and permanently remove this student registration?')) return;
    setActioningId(id);
    setError('');
    try {
      await api.post(`/admin/students/${id}/reject`);
      fetchStudents();
    } catch (err) {
      setError('Could not reject this student. Please try again.');
    } finally {
      setActioningId(null);
    }
  };

  const handleDownloadResume = async (student) => {
    setError('');
    try {
      const res = await api.get(`/admin/students/${student.id}/resume`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${student.name}_resume.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(`${student.name} has not uploaded a resume yet.`);
    }
  };

  const menuItems = [
    { label: 'Dashboard', path: '/admin-dashboard', icon: 'speedometer2' },
    { label: 'Manage Students', path: '/admin/students', icon: 'people' },
    { label: 'Manage Companies', path: '/admin/companies', icon: 'building' },
    { label: 'Manage Jobs', path: '/admin/jobs', icon: 'briefcase' },
    { label: 'Applications', path: '/admin/applications', icon: 'file-earmark-text' },
  ];

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid bg-light" style={{ minHeight: '100vh' }}>
      <div className="row">
        <Sidebar menuItems={menuItems} />

        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
            <h1 className="h2 fw-bold text-dark">Manage Students</h1>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="card shadow-sm border-0 rounded-0 mb-4" style={{ borderTop: '4px solid #eb9407' }}>
            <div className="card-body p-4">
              <SearchBar placeholder="Search by name, email..." onSearch={setSearchTerm} />

              <div className="table-responsive mt-4">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th className="text-secondary fw-semibold">Name</th>
                      <th className="text-secondary fw-semibold">Email</th>
                      <th className="text-secondary fw-semibold">Approval Status</th>
                      <th className="text-secondary fw-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="4" className="text-center py-4">Loading...</td></tr>
                    ) : filteredStudents.length === 0 ? (
                      <tr><td colSpan="4" className="text-center py-4">No students found.</td></tr>
                    ) : (
                      filteredStudents.map(s => (
                        <tr key={s.id}>
                          <td className="fw-medium text-dark">{s.name}</td>
                          <td className="text-muted">{s.email}</td>
                          <td>
                            {s.approved ? (
                              <span className="badge bg-success">Approved</span>
                            ) : (
                              <span className="badge bg-warning text-dark">Pending</span>
                            )}
                          </td>
                          <td>
                            {!s.approved && (
                              <button
                                className="btn btn-sm text-white fw-bold me-2 rounded-0"
                                style={{ backgroundColor: '#1c87c9' }}
                                onClick={() => handleApprove(s.id)}
                                disabled={actioningId === s.id}
                              >
                                {actioningId === s.id ? 'Approving...' : 'Approve'}
                              </button>
                            )}
                            <button
                              className="btn btn-sm btn-outline-secondary rounded-0 me-2"
                              onClick={() => handleDownloadResume(s)}
                              title="Download resume"
                            >
                              <i className="bi bi-file-earmark-arrow-down"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger rounded-0"
                              onClick={() => handleReject(s.id)}
                              disabled={actioningId === s.id}
                              title="Reject and remove this registration"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminStudents;
