import express from 'express';
import { supabase } from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { sendNotification } from '../config/pusher.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { role, id } = req.user;

    let query = supabase
      .from('tasks')
      .select(`
        *,
        assigned_user:assigned_to(id, full_name, email, role),
        creator:created_by(id, full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (role === 'developer') {
      query = query.or(`assigned_to.eq.${id},created_by.eq.${id}`);
    }

    const { data: tasks, error } = await query;

    if (error) throw error;

    res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: task, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assigned_user:assigned_to(id, full_name, email, role),
        creator:created_by(id, full_name, email)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { title, description, priority, assigned_to, due_date } = req.body;
    const created_by = req.user.id;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .insert([{
        title,
        description: description || '',
        priority: priority || 'medium',
        assigned_to,
        created_by,
        due_date,
        status: 'pending'
      }])
      .select(`
        *,
        assigned_user:assigned_to(id, full_name, email, role),
        creator:created_by(id, full_name, email)
      `)
      .single();

    if (error) throw error;

    if (assigned_to) {
      const notification = {
        user_id: assigned_to,
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: `You have been assigned to: ${title}`,
        related_id: task.id
      };

      const { error: notifError } = await supabase
        .from('notifications')
        .insert([notification]);

      if (!notifError) {
        await sendNotification(assigned_to, {
          ...notification,
          id: task.id,
          created_at: new Date().toISOString()
        });
      }
    }

    res.status(201).json({ task, message: 'Task created successfully' });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, assigned_to, due_date } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const { data: existingTask } = await supabase
      .from('tasks')
      .select('*, assigned_user:assigned_to(id, full_name)')
      .eq('id', id)
      .maybeSingle();

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (userRole === 'developer' && existingTask.assigned_to !== userId) {
      return res.status(403).json({ error: 'You can only update tasks assigned to you' });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;
    if (assigned_to !== undefined) updates.assigned_to = assigned_to;
    if (due_date !== undefined) updates.due_date = due_date;
    updates.updated_at = new Date().toISOString();

    const { data: task, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        assigned_user:assigned_to(id, full_name, email, role),
        creator:created_by(id, full_name, email)
      `)
      .single();

    if (error) throw error;

    const notificationPromises = [];

    if (status && status !== existingTask.status && existingTask.created_by !== userId) {
      const notification = {
        user_id: existingTask.created_by,
        type: 'task_updated',
        title: 'Task Status Updated',
        message: `Task "${title || existingTask.title}" status changed to ${status}`,
        related_id: task.id
      };

      notificationPromises.push(
        supabase.from('notifications').insert([notification]).then(() =>
          sendNotification(existingTask.created_by, {
            ...notification,
            id: task.id,
            created_at: new Date().toISOString()
          })
        )
      );
    }

    if (assigned_to && assigned_to !== existingTask.assigned_to) {
      const notification = {
        user_id: assigned_to,
        type: 'task_assigned',
        title: 'Task Reassigned',
        message: `You have been assigned to: ${title || existingTask.title}`,
        related_id: task.id
      };

      notificationPromises.push(
        supabase.from('notifications').insert([notification]).then(() =>
          sendNotification(assigned_to, {
            ...notification,
            id: task.id,
            created_at: new Date().toISOString()
          })
        )
      );
    }

    await Promise.all(notificationPromises);

    res.json({ task, message: 'Task updated successfully' });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
