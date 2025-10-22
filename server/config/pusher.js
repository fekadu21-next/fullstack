import Pusher from 'pusher';
import dotenv from 'dotenv';

dotenv.config();

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_APP_SECRET,
  cluster: process.env.PUSHER_APP_CLUSTER,
  useTLS: true
});

export async function sendNotification(userId, notification) {
  try {
    await pusher.trigger(`user-${userId}`, 'notification', notification);
    console.log(`Notification sent to user ${userId}:`, notification.title);
  } catch (error) {
    console.error('Error sending Pusher notification:', error);
  }
}

export async function broadcastTaskUpdate(taskId, data) {
  try {
    await pusher.trigger(`task-${taskId}`, 'task-update', data);
    console.log(`Task update broadcast for task ${taskId}`);
  } catch (error) {
    console.error('Error broadcasting task update:', error);
  }
}

export async function broadcastComment(taskId, comment) {
  try {
    await pusher.trigger(`task-${taskId}`, 'new-comment', comment);
    console.log(`New comment broadcast for task ${taskId}`);
  } catch (error) {
    console.error('Error broadcasting comment:', error);
  }
}
