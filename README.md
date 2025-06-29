# 📝 Todo Task Manager App

A comprehensive, full-featured **Task Management Application** built with the **MERN stack** (MongoDB, Express, React, Node.js). It includes user authentication, real-time task management, and a responsive UI.

🔗 **Live App:** [https://to-do-app-pied-three-19.vercel.app/](https://to-do-app-pied-three-19.vercel.app/)

---
## 💻 Demo of the Live APP

🔗 👉 [Watch on Google Drive](https://drive.google.com/file/d/10uKQkSlshl5TYOCpEUDfd2wuLXgrVPqy/view?usp=sharing)

---
## 🚀 Features

- ✅ **User Authentication** – Register, login, JWT-based sessions  
- ✅ **Task CRUD** – Create, edit, delete, mark tasks as completed  
- ✅ **Priority Levels** – Low, Medium, High, Urgent  
- ✅ **Due Dates** – Set and track task deadlines  
- ✅ **User Assignment** – Assign tasks to team members  
- ✅ **Filtering & Search** – Filter by status, priority, keywords  
- ✅ **Statistics Dashboard** – View task progress analytics  
- ✅ **Responsive UI** – Clean, mobile-friendly interface  

---

## 🧰 Tech Stack

### 🔧 Backend

- Node.js with Express.js
- MongoDB Atlas (NoSQL database)
- Mongoose for ODM
- JWT for authentication
- bcryptjs for password hashing
- Express Validator for input validation

### 🎨 Frontend

- React 19 with TypeScript
- React Router for navigation
- Tailwind CSS for styling
- React Hook Form for forms
- Axios for API communication
- React Hot Toast for notifications
- Heroicons for icons

---

## ⚙️ Prerequisites

- Node.js (v16+)
- npm or yarn
- MongoDB Atlas account

---

## 🛠️ Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone <repository-url>
cd todo
````

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development
```

Start the server:

```bash
npm run dev
```

> Backend runs at: `http://localhost:5000`

---

### 3️⃣ Frontend Setup

```bash
cd ../todo-frontend
npm install
```

Start the development server:

```bash
npm start
```

> Frontend runs at: `http://localhost:3000`

---

## 🔌 API Endpoints

### 🔐 Authentication

| Method | Endpoint                    | Description       |
| ------ | --------------------------- | ----------------- |
| POST   | `/api/auth/register`        | Register new user |
| POST   | `/api/auth/login`           | Login user        |
| GET    | `/api/auth/me`              | Get current user  |
| POST   | `/api/auth/refresh`         | Refresh token     |
| POST   | `/api/auth/change-password` | Change password   |

### ✅ Tasks

| Method | Endpoint                  | Description           |
| ------ | ------------------------- | --------------------- |
| GET    | `/api/tasks`              | Get all tasks         |
| POST   | `/api/tasks`              | Create a task         |
| GET    | `/api/tasks/:id`          | Get task by ID        |
| PUT    | `/api/tasks/:id`          | Update task           |
| DELETE | `/api/tasks/:id`          | Delete task           |
| POST   | `/api/tasks/:id/assign`   | Assign users to task  |
| POST   | `/api/tasks/:id/comment`  | Add comment to task   |
| POST   | `/api/tasks/:id/complete` | Mark task as complete |

### 👥 Users

| Method | Endpoint             | Description      |
| ------ | -------------------- | ---------------- |
| GET    | `/api/users/profile` | Get user profile |
| PUT    | `/api/users/profile` | Update profile   |
| GET    | `/api/users/stats`   | Get user stats   |
| GET    | `/api/users/search`  | Search users     |
| GET    | `/api/users/:id`     | Get user by ID   |

---

## 🗂️ Project Structure

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

---

## 🧪 Usage

1. **Register/Login**: Create an account or sign in
2. **Dashboard**: View your personal tasks
3. **Create Tasks**: Title, description, due date, priority
4. **Edit/Delete Tasks**: Modify or remove tasks
5. **Filter/Search**: Narrow results by priority, status, or keyword
6. **User Profile**: View and edit user info, stats

---

## 🔍 Detailed Features

### ✅ Task Features

* Priority: Low, Medium, High, Urgent
* Status: Todo, In Progress, Review, Completed
* Due Dates and countdown timers
* Tags and filters
* User assignment
* Commenting system

### 👤 User Features

* Profile updates
* Statistics dashboard
* Task search and filtering

### 🔐 Security

* JWT token-based auth
* Password hashing with bcrypt
* Input validation (server-side)
* CORS protection for API

---

## 🚀 Deployment

### 🔧 Backend

* Host on platforms like Render, Railway, or Heroku
* Configure environment variables
* Update CORS settings with frontend URL

### 🌐 Frontend

* Build the app:

  ```bash
  npm run build
  ```
* Deploy on [Vercel](https://vercel.com/)
* Update API base URL in `src/services/api.ts`

🔗 **Live App on Vercel**: [https://to-do-app-pied-three-19.vercel.app/](https://to-do-app-pied-three-19.vercel.app/)

---

## 🤝 Contributing

1. Fork the repo
2. Create a new branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request ✅

---

## 📄 License

This project is licensed under the **MIT License**

---

## 💬 Support

For help, open an issue in this repo or reach out to the development team.

---

## 🏁 Hackathon Note

This project was created as part of a hackathon hosted by [https://www.katomaran.com](https://www.katomaran.com)
