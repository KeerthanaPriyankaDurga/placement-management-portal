import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

const statusBadge = (status) => {
  switch (status) {
    case 'PLACED': return 'bg-success';
    case 'SELECTED': return 'bg-primary';
    case 'SHORTLISTED': return 'bg-info text-dark';
    case 'REJECTED': return 'bg-danger';
    default: return 'bg-warning text-dark';
  }
};

const InterviewSchedule = () => {
  const [interviews, setInterviews] = useState([]);
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
    const fetchInterviews = async () => {
      try {
        const res = await api.get('/student/interviews');
        setInterviews(res.data);
      } catch (err) {
        setError('Could not load your interview schedule.');
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  return (
    <div className="container-fluid">
      <div className="row">
        <Sidebar menuItems={menuItems} />
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
            <h1 className="h2">Interview Schedule</h1>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {loading ? (
            <div className="text-center mt-5">Loading...</div>
          ) : interviews.length === 0 ? (
            <div className="alert alert-info">
              No upcoming interviews scheduled yet. Once a company schedules one, it'll show up here.
            </div>
          ) : (
            <div className="row">
              {interviews.map((iv) => (
                <div className="col-md-6 mb-4" key={iv.id}>
                  <div className="card shadow-sm h-100 border-0" style={{ borderLeft: '4px solid #294a70' }}>
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h5 className="card-title fw-bold mb-0">{iv.jobTitle}</h5>
                          <h6 className="card-subtitle text-muted">{iv.companyName}</h6>
                        </div>
                        <span className={`badge ${statusBadge(iv.status)}`}>{iv.status}</span>
                      </div>

                      <ul className="list-unstyled small mb-3 mt-3">
                        <li className="mb-2">
                          <i className="bi bi-calendar-date me-2 text-primary"></i>
                          <strong>Date:</strong> {new Date(iv.interviewDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </li>
                        {iv.interviewTime && (
                          <li className="mb-2">
                            <i className="bi bi-clock me-2 text-primary"></i>
                            <strong>Time:</strong> {iv.interviewTime}
                          </li>
                        )}
                        <li className="mb-2">
                          <i className={`bi ${iv.interviewMode === 'ONLINE' ? 'bi-camera-video' : 'bi-geo-alt'} me-2 text-primary`}></i>
                          <strong>Mode:</strong> {iv.interviewMode === 'ONLINE' ? 'Online' : 'Offline'}
                        </li>
                        {iv.interviewMode === 'ONLINE' && iv.interviewMeetingLink && (
                          <li className="mb-2">
                            <i className="bi bi-link-45deg me-2 text-primary"></i>
                            <strong>Meeting Link:</strong>{' '}
                            <a href={iv.interviewMeetingLink} target="_blank" rel="noopener noreferrer">
                              Join Meeting <i className="bi bi-box-arrow-up-right small"></i>
                            </a>
                          </li>
                        )}
                        {iv.interviewMode === 'OFFLINE' && iv.interviewVenue && (
                          <li className="mb-2">
                            <i className="bi bi-pin-map me-2 text-primary"></i>
                            <strong>Venue:</strong> {iv.interviewVenue}
                          </li>
                        )}
                        {iv.interviewInstructions && (
                          <li className="mt-3 p-2 bg-light rounded small">
                            <i className="bi bi-info-circle me-2 text-secondary"></i>
                            {iv.interviewInstructions}
                          </li>
                        )}
                      </ul>
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

export default InterviewSchedule;
