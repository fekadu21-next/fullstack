import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/dashboard" style={styles.brand}>
          Task Manager
        </Link>

        <div style={styles.navRight}>
          <div style={styles.userInfo}>
            <span style={styles.userName}>{user?.full_name}</span>
            <span className={`badge badge-${user?.role}`}>{user?.role}</span>
          </div>

          <NotificationBell />

          <button onClick={logout} className="btn btn-secondary btn-sm">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    background: 'white',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    marginBottom: '30px'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  brand: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#667eea',
    textDecoration: 'none'
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  userName: {
    fontWeight: '600',
    color: '#333'
  }
};

export default Navbar;
