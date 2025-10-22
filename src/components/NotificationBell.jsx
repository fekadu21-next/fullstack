import { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.notification-bell')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    setShowDropdown(false);
    if (notification.related_id) {
      navigate(`/task/${notification.related_id}`);
    }
  };

  return (
    <div className="notification-bell" style={styles.container}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={styles.bellButton}
        className="btn btn-secondary btn-sm"
      >
        🔔
        {unreadCount > 0 && (
          <span style={styles.badge}>{unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div style={styles.dropdown}>
          <div style={styles.header}>
            <h3 style={styles.title}>Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={styles.markAllBtn}
              >
                Mark all read
              </button>
            )}
          </div>

          <div style={styles.list}>
            {notifications.length === 0 ? (
              <div style={styles.empty}>No notifications</div>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  style={{
                    ...styles.item,
                    background: notification.is_read ? '#fff' : '#f0f4ff'
                  }}
                >
                  <div
                    onClick={() => handleNotificationClick(notification)}
                    style={styles.itemContent}
                  >
                    <div style={styles.itemTitle}>{notification.title}</div>
                    <div style={styles.itemMessage}>{notification.message}</div>
                    <div style={styles.itemTime}>
                      {new Date(notification.created_at).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    style={styles.deleteBtn}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    position: 'relative'
  },
  bellButton: {
    position: 'relative',
    padding: '8px 16px',
    fontSize: '18px'
  },
  badge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    background: '#dc3545',
    color: 'white',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 'bold'
  },
  dropdown: {
    position: 'absolute',
    top: '110%',
    right: 0,
    width: '400px',
    maxHeight: '500px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
    zIndex: 1000,
    overflow: 'hidden'
  },
  header: {
    padding: '16px',
    borderBottom: '1px solid #e1e8ed',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: '16px',
    fontWeight: 'bold',
    margin: 0
  },
  markAllBtn: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  list: {
    maxHeight: '400px',
    overflowY: 'auto'
  },
  empty: {
    padding: '40px 16px',
    textAlign: 'center',
    color: '#6c757d'
  },
  item: {
    padding: '12px 16px',
    borderBottom: '1px solid #e1e8ed',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '8px',
    transition: 'background 0.2s'
  },
  itemContent: {
    flex: 1,
    cursor: 'pointer'
  },
  itemTitle: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '4px',
    color: '#333'
  },
  itemMessage: {
    fontSize: '13px',
    color: '#555',
    marginBottom: '4px'
  },
  itemTime: {
    fontSize: '11px',
    color: '#6c757d'
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: '#6c757d',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '0 4px',
    lineHeight: 1
  }
};

export default NotificationBell;
