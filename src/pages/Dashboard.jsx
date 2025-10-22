import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import Navbar from '../components/Navbar';
import TaskModal from '../components/TaskModal';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const { requestNotificationPermission } = useNotifications();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTasks();
    if (user?.role === 'admin') {
      fetchUsers();
    }
    requestNotificationPermission();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data.tasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/tasks');
      const allUsers = new Set();
      response.data.tasks.forEach(task => {
        if (task.assigned_user) allUsers.add(JSON.stringify(task.assigned_user));
        if (task.creator) allUsers.add(JSON.stringify(task.creator));
      });
      setUsers(Array.from(allUsers).map(u => JSON.parse(u)));
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleTaskCreated = () => {
    setShowModal(false);
    fetchTasks();
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container">
          <div className="flex-center" style={{ minHeight: '400px' }}>
            Loading tasks...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="card">
          <div className="flex-between mb-4">
            <div>
              <h1 style={{ marginBottom: '8px' }}>Task Dashboard</h1>
              <p className="text-muted">Welcome, {user?.full_name}!</p>
            </div>
            {user?.role === 'admin' && (
              <button onClick={() => setShowModal(true)} className="btn btn-primary">
                Create Task
              </button>
            )}
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setFilter('all')}
              className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            >
              All ({tasks.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`btn btn-sm ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Pending ({tasks.filter(t => t.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('in_progress')}
              className={`btn btn-sm ${filter === 'in_progress' ? 'btn-primary' : 'btn-secondary'}`}
            >
              In Progress ({tasks.filter(t => t.status === 'in_progress').length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`btn btn-sm ${filter === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Completed ({tasks.filter(t => t.status === 'completed').length})
            </button>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="text-center" style={{ padding: '60px 20px' }}>
              <p className="text-muted">No tasks found</p>
            </div>
          ) : (
            <div className="grid grid-2">
              {filteredTasks.map(task => (
                <div
                  key={task.id}
                  className="card"
                  style={{ cursor: 'pointer', margin: 0 }}
                  onClick={() => navigate(`/task/${task.id}`)}
                >
                  <div className="flex-between mb-4">
                    <h3 style={{ margin: 0 }}>{task.title}</h3>
                    <span className={`badge badge-${task.status}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-muted text-sm mb-4">
                    {task.description || 'No description'}
                  </p>

                  <div className="flex-between">
                    <div className="flex gap-2">
                      <span className={`badge badge-${task.priority}`}>
                        {task.priority}
                      </span>
                      {task.assigned_user && (
                        <span className="text-sm text-muted">
                          Assigned: {task.assigned_user.full_name}
                        </span>
                      )}
                    </div>
                    {task.due_date && (
                      <span className="text-xs text-muted">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <TaskModal
          users={users}
          onClose={() => setShowModal(false)}
          onSuccess={handleTaskCreated}
        />
      )}
    </div>
  );
};

export default Dashboard;
