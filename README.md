# Job Portal Management System

A simple Job Portal Management System built for college projects using HTML, CSS, JavaScript (Frontend) and Node.js with Express (Backend), MySQL (Database).

## 🎯 Features

### Job Seeker
- Register & Login
- View all available jobs
- Apply for jobs
- View applied jobs

### Employer
- Register & Login
- Post new job openings
- View jobs posted by them
- View list of applicants for each job

### Admin
- Login (no registration)
- View all users (job seekers & employers)
- View all jobs
- Delete jobs or users if required

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher)
- **MySQL** (v5.7 or higher)
- **npm** (comes with Node.js)

## 🚀 Installation & Setup

### Step 1: Clone or Download the Project

```bash
# If using git
git clone <repository-url>
cd job-portal

# Or extract the downloaded zip file
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages:
- express
- mysql2
- body-parser
- cors

### Step 3: Database Setup

1. **Start MySQL Server** (make sure MySQL is running)

2. **Create Database and Tables**

   Open MySQL command line or MySQL Workbench and run the SQL script:

   ```bash
   mysql -u root -p < database.sql
   ```

   Or manually execute the contents of `database.sql` file in MySQL:
   - Create database `job_portal_db`
   - Create tables: `users`, `jobs`, `applications`
   - Insert default admin user

3. **Configure Database Connection**

   Edit `db.js` file and update the database credentials:

   ```javascript
   const pool = mysql.createPool({
     host: 'localhost',
     user: 'root',           // Change if needed
     password: '',           // Enter your MySQL password
     database: 'job_portal_db',
     // ...
   });
   ```

### Step 4: Run the Application

```bash
node server.js
```

The server will start on `http://localhost:3000`

### Step 5: Access the Application

Open your web browser and navigate to:
```
http://localhost:3000
```

## 🔑 Default Admin Credentials

After running the SQL script, you can login as admin:

- **Email:** `admin@jobportal.com`
- **Password:** `admin123`

## 📁 Project Structure

```
job-portal/
│
├── server.js                 # Main server file
├── db.js                     # Database connection configuration
├── database.sql              # SQL schema and initial data
├── package.json              # Node.js dependencies
├── README.md                 # This file
│
├── routes/                   # Backend API routes
│   ├── auth.js              # Authentication routes (login, register)
│   ├── jobs.js              # Job CRUD operations
│   ├── applications.js      # Application management
│   └── users.js             # User management (admin)
│
└── public/                   # Frontend files
    ├── index.html           # Home page
    ├── login.html           # Login page
    ├── register.html        # Registration page
    ├── jobs.html            # Job seeker dashboard
    ├── employer.html        # Employer dashboard
    ├── admin.html           # Admin dashboard
    ├── style.css            # Stylesheet
    ├── auth.js              # Authentication JavaScript
    ├── jobs.js              # Job seeker JavaScript
    ├── employer.js          # Employer JavaScript
    └── admin.js             # Admin JavaScript
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Jobs
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get single job
- `GET /api/jobs/employer/:employerId` - Get jobs by employer
- `POST /api/jobs` - Create new job (Employer)
- `DELETE /api/jobs/:id` - Delete job (Admin/Employer)

### Applications
- `POST /api/applications` - Apply for a job
- `GET /api/applications/user/:userId` - Get user's applications
- `GET /api/applications/job/:jobId` - Get applicants for a job

### Users (Admin)
- `GET /api/users` - Get all users
- `DELETE /api/users/:id` - Delete user

## 🧪 Testing the Application

### 1. Test as Job Seeker
1. Register a new account with role "Job Seeker"
2. Login with your credentials
3. Browse available jobs
4. Apply for jobs
5. View your applications

### 2. Test as Employer
1. Register a new account with role "Employer"
2. Login with your credentials
3. Post a new job
4. View your posted jobs
5. View applicants for each job

### 3. Test as Admin
1. Login with admin credentials:
   - Email: `admin@jobportal.com`
   - Password: `admin123`
2. View all users
3. View all jobs
4. Delete users or jobs if needed

## 📝 Notes

- **Passwords are stored as plain text** (for simplicity in college projects)
- **No session management** - uses localStorage for client-side storage
- **CORS is enabled** for all routes
- The application uses **RESTful API** architecture

## 🐛 Troubleshooting

### Database Connection Error
- Make sure MySQL server is running
- Check database credentials in `db.js`
- Verify database `job_portal_db` exists

### Port Already in Use
- Change the port in `server.js`:
  ```javascript
  const PORT = process.env.PORT || 3001; // Change to 3001 or any available port
  ```

### Module Not Found Error
- Run `npm install` again
- Delete `node_modules` folder and `package-lock.json`, then run `npm install`

### CORS Errors
- Make sure you're accessing the app from `http://localhost:3000`
- Check that the server is running

## 📚 Technologies Used

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Packages:** mysql2, body-parser, cors

## 👨‍💻 Development

To modify the application:

1. **Backend Changes:** Edit files in `routes/` directory
2. **Frontend Changes:** Edit files in `public/` directory
3. **Database Changes:** Modify `database.sql` and re-run it

After making changes, restart the server:
```bash
# Stop the server (Ctrl+C) and restart
node server.js
```

## 📄 License

This project is created for educational purposes (college project).

## 🤝 Contributing

This is a college project. Feel free to use it as a reference or starting point for your own projects.

---

**Happy Coding! 🚀**
