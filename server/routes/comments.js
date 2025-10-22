import express from 'express';
import { supabase } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendNotification, broadcastComment } from '../config/pusher.js';

const router = express.Router();

router.get('/task/:taskId', authenticateToken, async (req, res) => {
  try {
    const { taskId } = req.params;

    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        *,
        user:user_id(id, full_name, email, role)
      `)
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json({ comments });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { task_id, content } = req.body;
    const user_id = req.user.id;

    if (!task_id || !content) {
      return res.status(400).json({ error: 'Task ID and content are required' });
    }

    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*, assigned_to, created_by')
      .eq('id', task_id)
      .maybeSingle();

    if (taskError || !task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .insert([{ task_id, user_id, content }])
      .select(`
        *,
        user:user_id(id, full_name, email, role)
      `)
      .single();

    if (error) throw error;

    const usersToNotify = new Set();
    if (task.assigned_to && task.assigned_to !== user_id) {
      usersToNotify.add(task.assigned_to);
    }
    if (task.created_by && task.created_by !== user_id) {
      usersToNotify.add(task.created_by);
    }

    const { data: taskComments } = await supabase
      .from('comments')
      .select('user_id')
      .eq('task_id', task_id)
      .neq('user_id', user_id);

    if (taskComments) {
      taskComments.forEach(c => usersToNotify.add(c.user_id));
    }

    const notificationPromises = Array.from(usersToNotify).map(async (notifyUserId) => {
      const notification = {
        user_id: notifyUserId,
        type: 'comment_added',
        title: 'New Comment',
        message: `${req.user.full_name} commented on: ${task.title}`,
        related_id: task_id
      };

      await supabase.from('notifications').insert([notification]);

      await sendNotification(notifyUserId, {
        ...notification,
        id: comment.id,
        created_at: comment.created_at
      });
    });

    await Promise.all(notificationPromises);

    await broadcastComment(task_id, comment);

    res.status(201).json({ comment, message: 'Comment added successfully' });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: comment } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', id)
      .maybeSingle();

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You can only delete your own comments' });
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

export default router;
