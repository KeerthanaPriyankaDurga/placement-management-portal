import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

const CompanyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({ industry: '', website: '', description: '' });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const menuItems = [
    { label: 'Dashboard', path: '/company-dashboard', icon: 'speedometer2' },
    { label: 'Company Profile', path: '/company/profile', icon: 'building' },
    { label: 'Manage Jobs', path: '/company/jobs', icon: 'briefcase' },
    { label: 'Applicants', path: '/company/applicants', icon: 'people' },
  ];

  const fetchProfile = async () => {
    try {
      const res = await api.get('/company/profile');
      setProfile(res.data);
      setFormData({
        industry: res.data.industry || '',
        website: res.data.website || '',
        description: res.data.description || ''
      });
    } catch (err) {
      setError('Could not load company profile.');
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
      const res = await api.put('/company/profile', formData);
      setProfile(res.data);
      setEditMode(false);
      setSuccess('Company profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center mt-5">Loading profile...</div>;

  return (
    <div className="container-fluid">
      <div className="row">
        <Sidebar menuItems={menuItems} />
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
            <h1 className="h2">Company Profile</h1>
            {!editMode && (
              <button className="btn btn-primary btn-sm" onClick={() => setEditMode(true)}>
                Edit Profile
              </button>
            )}
          </div>

          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="card shadow-sm">
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-sm-3 text-muted">Company Name</div>
                <div className="col-sm-9 fw-bold">{profile?.name}</div>
              </div>
              <div className="row mb-3">
                <div className="col-sm-3 text-muted">HR Email</div>
                <div className="col-sm-9">{profile?.email}</div>
              </div>
              <hr />

              {editMode ? (
                <form onSubmit={handleSave}>
                  <div className="mb-3 row">
                    <label className="col-sm-3 col-form-label text-muted">Industry</label>
                    <div className="col-sm-9">
                      <input type="text" className="form-control" name="industry"
                        value={formData.industry} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="mb-3 row">
                    <label className="col-sm-3 col-form-label text-muted">Website</label>
                    <div className="col-sm-9">
                      <input type="text" className="form-control" name="website"
                        value={formData.website} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="mb-3 row">
                    <label className="col-sm-3 col-form-label text-muted">About</label>
                    <div className="col-sm-9">
                      <textarea className="form-control" name="description" rows="4"
                        value={formData.description} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-success" disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setEditMode(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="row mb-3">
                    <div className="col-sm-3 text-muted">Industry</div>
                    <div className="col-sm-9">{profile?.industry || 'Not set'}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-3 text-muted">Website</div>
                    <div className="col-sm-9">{profile?.website || 'Not set'}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-3 text-muted">About</div>
                    <div className="col-sm-9">{profile?.description || 'Not set'}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CompanyProfile;
