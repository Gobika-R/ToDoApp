# Todo Task Manager App

A comprehensive task management application built with React frontend and Node.js/Express backend with MongoDB Atlas integration.

## Features

- **User Authentication**: Register, login, and profile management
- **Task Management**: Create, edit, delete, and complete tasks
- **Priority Levels**: Low, Medium, High, and Urgent priorities
- **Due Date Tracking**: Set and track task deadlines
- **User Assignment**: Assign tasks to team members
- **Task Filtering**: Filter by status, priority, and search terms
- **Statistics Dashboard**: View task completion rates and analytics
- **Responsive Design**: Modern UI that works on all devices

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB Atlas** for database
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Mongoose** for ODM
- **Express Validator** for input validation

### Frontend
- **React 19** with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **React Hook Form** for form management
- **Axios** for API communication
- **React Hot Toast** for notifications
- **Heroicons** for icons

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd todo
```

### 2. Backend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   - Copy `env.example` to `.env`
   - Update the following variables:
     ```env
     MONGODB_URI=your_mongodb_atlas_connection_string
     JWT_SECRET=your_jwt_secret_key
     PORT=5000
     NODE_ENV=development
     ```

3. **MongoDB Atlas Setup:**
   - Create a MongoDB Atlas account
   - Create a new cluster
   - Get your connection string
   - Replace `your_mongodb_atlas_connection_string` in `.env`

4. **Start the backend server:**
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd todo-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/change-password` - Change user password

### Tasks
- `GET /api/tasks` - Get all tasks for user
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:id` - Get a specific task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `POST /api/tasks/:id/assign` - Assign users to task
- `POST /api/tasks/:id/comment` - Add comment to task
- `POST /api/tasks/:id/complete` - Mark task as completed

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/stats` - Get user statistics
- `GET /api/users/search` - Search users
- `GET /api/users/:id` - Get user by ID

## Project Structure

```
todo/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── tasks.js
│   │   └── users.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   └── package.json
├── todo-frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   ├── TaskModal.tsx
│   │   │   ├── TaskFilters.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── Profile.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   └── App.tsx
│   └── package.json
└── README.md
```

## Usage

1. **Register/Login**: Create an account or sign in
2. **Dashboard**: View and manage your tasks
3. **Create Tasks**: Add new tasks with title, description, priority, and due date
4. **Edit Tasks**: Modify existing tasks
5. **Filter Tasks**: Use filters to find specific tasks
6. **Complete Tasks**: Mark tasks as completed
7. **Profile**: View your statistics and update profile information

## Features in Detail

### Task Management
- **Priority Levels**: Set task priority (Low, Medium, High, Urgent)
- **Status Tracking**: Track task status (Todo, In Progress, Review, Completed)
- **Due Dates**: Set and track task deadlines
- **Tags**: Add tags to categorize tasks
- **User Assignment**: Assign tasks to team members
- **Comments**: Add comments to tasks for collaboration

### User Features
- **Profile Management**: Update personal information
- **Statistics**: View task completion rates and analytics
- **Search**: Search for tasks by title, description, or tags
- **Filtering**: Filter tasks by status and priority

### Security
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt password encryption
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Cross-origin resource sharing protection

## Deployment

### Backend Deployment
1. Set up environment variables on your hosting platform
2. Deploy to platforms like Heroku, Railway, or DigitalOcean
3. Update CORS settings for your frontend domain

### Frontend Deployment
1. Build the production version: `npm run build`
2. Deploy to platforms like Vercel, Netlify, or GitHub Pages
3. Update API base URL in `src/services/api.ts`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository or contact the development team. 

## IMPORTANT NOTE
This project is a part of a hackathon run by https://www.katomaran.com
