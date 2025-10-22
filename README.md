# Task Management System with Real-Time Pusher Notifications

A full-stack task management application with real-time notifications using Pusher.

## Features

- **Three User Roles:**
  - **Admin/Leader:** Create and manage tasks, assign to developers, view all tasks
  - **Developer:** View assigned tasks, update task status, comment on tasks
  - **Member:** View all tasks and add comments

- **Real-Time Notifications:**
  - Task assignment notifications for developers
  - Task status update notifications for admins
  - Comment notifications for all users involved in a task
  - Real-time updates using Pusher

- **Task Management:**
  - Create, update, and delete tasks
  - Set priority levels (low, medium, high)
  - Track task status (pending, in progress, completed)
  - Assign tasks to developers
  - Set due dates

- **Comment System:**
  - Add comments to tasks
  - Real-time comment notifications
  - View comment history

## Tech Stack

### Backend
- Node.js + Express
- Supabase (PostgreSQL database)
- Pusher (Real-time notifications)
- JWT authentication
- bcryptjs for password hashing

### Frontend
- React 18
- React Router for navigation
- Pusher-js for real-time updates
- Axios for API calls
- Modern CSS with gradient backgrounds

## Setup Instructions

### 1. Database Setup

Run the SQL in `database-setup.sql` in your Supabase SQL Editor to create all necessary tables.

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

The `.env` file is already configured with your Pusher credentials:
- PUSHER_APP_ID
- PUSHER_APP_KEY
- PUSHER_APP_SECRET
- PUSHER_APP_CLUSTER

### 4. Run the Application

```bash
npm run dev
```

This will start both the backend server (port 3001) and frontend (port 5173).

### 5. Access the Application

Open your browser and go to: http://localhost:5173

## User Registration

When registering, you can choose from three roles:
- **Admin:** Can create tasks, assign to developers, and manage everything
- **Developer:** Can view assigned tasks and update their status
- **Member:** Can view all tasks and add comments

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - Get all tasks (filtered by role)
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create task (admin only)
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task (admin only)

### Comments
- `GET /api/comments/task/:taskId` - Get task comments
- `POST /api/comments` - Add comment
- `DELETE /api/comments/:id` - Delete comment

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## Real-Time Features

### Pusher Channels

1. **User Notifications:** `user-{userId}`
   - Event: `notification`
   - Triggered when: Task assigned, task updated, or new comment

2. **Task Updates:** `task-{taskId}`
   - Event: `task-update`
   - Triggered when: Task status changes

3. **New Comments:** `task-{taskId}`
   - Event: `new-comment`
   - Triggered when: New comment added

## Notification Types

1. **task_assigned** - When a task is assigned to a developer
2. **task_updated** - When task status changes
3. **comment_added** - When someone comments on a task you're involved with

## Project Structure

```
project/
├── server/
│   ├── config/
│   │   ├── database.js      # Supabase connection
│   │   └── pusher.js        # Pusher configuration
│   ├── middleware/
│   │   └── auth.js          # JWT authentication
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   ├── tasks.js         # Task management routes
│   │   ├── comments.js      # Comment routes
│   │   └── notifications.js # Notification routes
│   └── index.js             # Express server
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── NotificationBell.jsx
│   │   ├── PrivateRoute.jsx
│   │   └── TaskModal.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── NotificationContext.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   └── TaskDetail.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── database-setup.sql
├── package.json
└── vite.config.js
```

## Browser Notifications

The app requests permission for browser notifications. Click "Allow" when prompted to receive desktop notifications for new events.

## Security

- Passwords are hashed using bcryptjs
- JWT tokens for authentication
- Role-based access control
- Input validation on backend
- SQL injection prevention with parameterized queries

## Development Notes

- Backend runs on port 3001
- Frontend runs on port 5173
- Vite proxy forwards /api requests to backend
- Hot reload enabled for both frontend and backend
