import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

const typeIcon = (type) => {
  switch (type) {
    case 'INTERVIEW': return 'bi-calendar-event text-info';
    case 'OFFER': return 'bi-file-earmark-pdf text-success';
    case 'APPROVAL': return 'bi-check-circle text-primary';
    case 'APPLICATION': return 'bi-briefcase text-warning';
    default: return 'bi-bell text-secondary';
  }
};

const timeAgo = (dateStr) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data.count);
    } catch (err) {
      // Silently ignore - notifications are non-critical
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.slice(0, 10));
    } catch (err) {
      // Silently ignore
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next) fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      // ignore
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await api.post(`/notifications/${notification.id}/read`);
        setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        // ignore
      }
    }
  };

  return (
    <div className="position-relative" ref={dropdownRef}>
      <button
        className="btn btn-outline-light rounded-circle position-relative"
        style={{ width: 40, height: 40 }}
        onClick={toggleOpen}
        title="Notifications"
      >
        <i className="bi bi-bell"></i>
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="card shadow-lg border-0 position-absolute end-0 mt-2"
          style={{ width: 340, zIndex: 1050 }}
        >
          <div className="card-header bg-white d-flex justify-content-between align-items-center py-2">
            <span className="fw-bold small text-uppercase text-muted">Notifications</span>
            {unreadCount > 0 && (
              <button className="btn btn-sm btn-link p-0 text-decoration-none small" onClick={handleMarkAllRead}>
                Mark all read
              </button>
            )}
          </div>
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <p className="text-muted text-center small py-4 mb-0">No notifications yet.</p>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`d-flex align-items-start gap-2 px-3 py-2 border-bottom ${!n.read ? 'bg-light' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleNotificationClick(n)}
                >
                  <i className={`bi ${typeIcon(n.type)} mt-1`}></i>
                  <div className="flex-grow-1">
                    <div className="small" style={{ fontWeight: n.read ? 400 : 600 }}>{n.message}</div>
                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>{timeAgo(n.createdAt)}</div>
                  </div>
                  {!n.read && <span className="bg-primary rounded-circle mt-1" style={{ width: 8, height: 8 }}></span>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
