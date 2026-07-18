import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({ department: '', batch: '', cgpa: '', skills: '' });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [resumeError, setResumeError] = useState('');
  const fileInputRef = useRef(null);

  const menuItems = [
    { label: 'Dashboard', path: '/student-dashboard', icon: 'speedometer2' },
    { label: 'My Profile', path: '/profile', icon: 'person' },
    { label: 'Companies', path: '/companies', icon: 'building' },
    { label: 'Browse Jobs', path: '/jobs', icon: 'briefcase' },
    { label: 'Saved Jobs', path: '/saved-jobs', icon: 'heart' },
    { label: 'My Applications', path: '/applications', icon: 'file-earmark-text' },
    { label: 'Interview Schedule', path: '/interview-schedule', icon: 'calendar-event' },
  ];

  const fetchProfile = async () => {
    try {
      const res = await api.get('/student/profile');
      setProfile(res.data);
      setFormData({
        department: res.data.department || '',
        batch: res.data.batch || '',
        cgpa: res.data.cgpa ?? '',
        skills: res.data.skills || ''
      });
    } catch (err) {
      setError('Could not load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.put('/student/profile', {
        department: formData.department,
        batch: formData.batch,
        cgpa: formData.cgpa === '' ? null : parseFloat(formData.cgpa),
        skills: formData.skills
      });
      setProfile(res.data);
      setEditMode(false);
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleResumeSelected = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setResumeError('Only PDF files are allowed.');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setResumeError('File is too large. Maximum size is 5MB.');
      e.target.value = '';
      return;
    }

    setUploading(true);
    setResumeError('');
    try {
      const formPayload = new FormData();
      formPayload.append('file', file);
      const res = await api.post('/student/resume', formPayload);
      setProfile(res.data);
    } catch (err) {
      setResumeError(err.response?.data?.message || 'Failed to upload resume.');
    } finally {
      setUploading(false);
      e.target.value = ''; // allow re-selecting the same file later if needed
    }
  };

  const handleDownloadResume = async () => {
    setDownloading(true);
    setResumeError('');
    try {
      const res = await api.get('/student/resume', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', profile?.resumeOriginalName || 'resume.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setResumeError('Could not download resume.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm('Delete your resume? You can upload a new one anytime.')) return;
    setResumeError('');
    try {
      const res = await api.delete('/student/resume');
      setProfile(res.data);
    } catch (err) {
      setResumeError('Could not delete resume.');
    }
  };

  if (loading) return <div className="text-center mt-5">Loading profile...</div>;

  return (
    <div className="container-fluid">
      <div className="row">
        <Sidebar menuItems={menuItems} />
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
            <h1 className="h2">My Profile</h1>
            {!editMode && (
              <button className="btn btn-primary btn-sm" onClick={() => setEditMode(true)}>
                Edit Profile
              </button>
            )}
          </div>

          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold">Profile Completion</span>
                <span className="fw-bold">{profile?.profileCompletion ?? 0}%</span>
              </div>
              <div className="progress" style={{ height: 8 }}>
                <div
                  className={`progress-bar ${(profile?.profileCompletion ?? 0) === 100 ? 'bg-success' : 'bg-primary'}`}
                  style={{ width: `${profile?.profileCompletion ?? 0}%` }}
                ></div>
              </div>
              {(profile?.profileCompletion ?? 0) < 100 && (
                <p className="text-muted small mt-2 mb-0">
                  Complete your department, batch, CGPA, skills, and resume to reach 100%.
                </p>
              )}
            </div>
          </div>

          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-body text-center">
                  <i className="bi bi-person-circle text-secondary" style={{ fontSize: '5rem' }}></i>
                  <h4 className="mt-3">{profile?.name}</h4>
                  <p className="text-muted">{profile?.email}</p>
                  <p className="badge bg-primary">{profile?.department || 'Department not set'}</p>
                  <p className="badge bg-secondary ms-2">Batch: {profile?.batch || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="col-md-8 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-header bg-white fw-bold">Academic Details</div>
                <div className="card-body">
                  {editMode ? (
                    <form onSubmit={handleSave}>
                      <div className="mb-3 row">
                        <label className="col-sm-3 col-form-label text-muted">Department</label>
                        <div className="col-sm-9">
                          <input type="text" className="form-control" name="department"
                            value={formData.department} onChange={handleChange} required />
                        </div>
                      </div>
                      <div className="mb-3 row">
                        <label className="col-sm-3 col-form-label text-muted">Batch</label>
                        <div className="col-sm-9">
                          <input type="text" className="form-control" name="batch"
                            value={formData.batch} onChange={handleChange} required />
                        </div>
                      </div>
                      <div className="mb-3 row">
                        <label className="col-sm-3 col-form-label text-muted">CGPA</label>
                        <div className="col-sm-9">
                          <input type="number" step="0.01" min="0" max="10" className="form-control"
                            name="cgpa" value={formData.cgpa} onChange={handleChange} />
                        </div>
                      </div>
                      <div className="mb-3 row">
                        <label className="col-sm-3 col-form-label text-muted">Skills</label>
                        <div className="col-sm-9">
                          <input type="text" className="form-control" name="skills"
                            placeholder="e.g. Java, React, SQL"
                            value={formData.skills} onChange={handleChange} />
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-success" disabled={saving}>
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button type="button" className="btn btn-outline-secondary"
                          onClick={() => setEditMode(false)}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="row mb-3">
                        <div className="col-sm-3 text-muted">CGPA</div>
                        <div className="col-sm-9">{profile?.cgpa ?? 'Not set'}</div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-sm-3 text-muted">Skills</div>
                        <div className="col-sm-9">{profile?.skills || 'Not set'}</div>
                      </div>
                      <hr />
                      <h5 className="mb-3">Resume</h5>

                      {resumeError && <div className="alert alert-danger py-2">{resumeError}</div>}

                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <span className="text-muted">
                          {profile?.resumeOriginalName
                            ? <><i className="bi bi-file-earmark-pdf text-danger me-1"></i>{profile.resumeOriginalName}</>
                            : 'No resume uploaded yet.'}
                        </span>
                      </div>

                      <div className="d-flex gap-2 mt-3">
                        <input
                          type="file"
                          accept="application/pdf"
                          ref={fileInputRef}
                          onChange={handleResumeSelected}
                          className="d-none"
                        />
                        <button className="btn btn-outline-primary btn-sm" onClick={handleResumeButtonClick} disabled={uploading}>
                          {uploading ? 'Uploading...' : profile?.resumeOriginalName ? 'Replace Resume' : 'Upload Resume'}
                        </button>
                        {profile?.resumeOriginalName && (
                          <button className="btn btn-outline-secondary btn-sm" onClick={handleDownloadResume} disabled={downloading}>
                            {downloading ? 'Downloading...' : 'Download Resume'}
                          </button>
                        )}
                        {profile?.resumeOriginalName && (
                          <button className="btn btn-outline-danger btn-sm" onClick={handleDeleteResume}>
                            Delete Resume
                          </button>
                        )}
                      </div>
                      <p className="text-muted small mt-2 mb-0">PDF only, max 5MB.</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
