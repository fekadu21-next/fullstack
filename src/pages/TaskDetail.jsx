import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../services/api';

const TaskDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchTask();
    fetchComments();
  }, [id]);

  const fetchTask = async () => {
    try {
      const response = await api.get(`/tasks/${id}`);
      setTask(response.data.task);
    } catch (error) {
      console.error('Failed to fetch task:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await api.get(`/comments/task/${id}`);
      setComments(response.data.comments);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      await api.put(`/tasks/${id}`, { status: newStatus });
      setTask({ ...task, status: newStatus });
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update task status');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await api.post('/comments', {
        task_id: id,
        content: newComment
      });
      setComments([...comments, response.data.comment]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment');
    }
  };

  const canUpdateStatus = () => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'developer' && task?.assigned_to === user?.id) return true;
    return false;
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container">
          <div className="flex-center" style={{ minHeight: '400px' }}>
            Loading task...
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div>
        <Navbar />
        <div className="container">
          <div className="card text-center">
            <p>Task not found</p>
            <button onClick={() => navigate('/dashboard')} className="btn btn-primary mt-4">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary btn-sm mb-4">
          ← Back to Dashboard
        </button>

        <div className="card">
          <div className="flex-between mb-4">
            <h1 style={{ margin: 0 }}>{task.title}</h1>
            <span className={`badge badge-${task.status}`}>
              {task.status.replace('_', ' ')}
            </span>
          </div>

          <div className="grid grid-2 mb-4">
            <div>
              <p className="text-muted text-sm">Priority</p>
              <span className={`badge badge-${task.priority}`}>{task.priority}</span>
            </div>
            {task.assigned_user && (
              <div>
                <p className="text-muted text-sm">Assigned To</p>
                <p>{task.assigned_user.full_name}</p>
              </div>
            )}
            {task.creator && (
              <div>
                <p className="text-muted text-sm">Created By</p>
                <p>{task.creator.full_name}</p>
              </div>
            )}
            {task.due_date && (
              <div>
                <p className="text-muted text-sm">Due Date</p>
                <p>{new Date(task.due_date).toLocaleDateString()}</p>
              </div>
            )}
          </div>

          <div className="mb-4">
            <h3>Description</h3>
            <p>{task.description || 'No description provided'}</p>
          </div>

          {canUpdateStatus() && (
            <div className="mb-4">
              <h3>Update Status</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusChange('pending')}
                  className="btn btn-sm btn-secondary"
                  disabled={updating || task.status === 'pending'}
                >
                  Pending
                </button>
                <button
                  onClick={() => handleStatusChange('in_progress')}
                  className="btn btn-sm btn-primary"
                  disabled={updating || task.status === 'in_progress'}
                >
                  In Progress
                </button>
                <button
                  onClick={() => handleStatusChange('completed')}
                  className="btn btn-sm btn-success"
                  disabled={updating || task.status === 'completed'}
                >
                  Completed
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h2>Comments ({comments.length})</h2>

          <form onSubmit={handleAddComment} className="mb-4">
            <div className="form-group">
              <textarea
                className="form-control"
                rows="3"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Add Comment
            </button>
          </form>

          <div>
            {comments.length === 0 ? (
              <p className="text-muted text-center">No comments yet</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} style={styles.comment}>
                  <div className="flex-between mb-2">
                    <div className="flex gap-2">
                      <strong>{comment.user.full_name}</strong>
                      <span className={`badge badge-${comment.user.role}`}>
                        {comment.user.role}
                      </span>
                    </div>
                    <span className="text-xs text-muted">
                      {new Date(comment.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ margin: 0 }}>{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  comment: {
    padding: '16px',
    background: '#f8f9fa',
    borderRadius: '8px',
    marginBottom: '12px'
  }
};

export default TaskDetail;
