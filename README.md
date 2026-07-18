# 🎓 Placement Management Portal

A full-stack web application designed to streamline and automate the campus placement process by connecting **students, companies, and placement officers** through a centralized platform.

The system simplifies placement activities such as student registration, company management, job applications, approvals, notifications, resume handling, and placement tracking.

---

# 📌 Project Overview

The Placement Management Portal provides a digital solution for managing the complete placement lifecycle.

The platform enables:

- Students to create profiles, upload resumes, explore opportunities, and apply for jobs.
- Companies to register, publish job openings, and manage recruitment activities.
- Placement officers to monitor students, companies, applications, and placement statistics.

The application is developed using a modern full-stack architecture with:

- React.js for frontend development
- Spring Boot for backend services
- MySQL for database management

---

# 🚀 Features

## 👨‍🎓 Student Module

- Student registration and login
- Student profile management
- Resume upload functionality
- View available job opportunities
- Apply for company drives
- Track application status
- Receive notifications
- View activity history

---

## 🏢 Company Module

- Company registration
- Company profile management
- Job posting management
- View student applications
- Manage recruitment activities

---

## 👨‍💼 Placement Officer Module

- Manage student records
- Manage company records
- Approve company registrations
- Monitor placement activities
- Dashboard statistics
- Maintain activity logs

---

# 🏗️ System Architecture

```
              React Frontend
                    |
                    |
              REST API Communication
                    |
                    |
            Spring Boot Backend
                    |
                    |
              MySQL Database
```

---

# 🛠️ Technology Stack

## Frontend

| Technology | Purpose |
|------------|---------|
| React.js | User Interface Development |
| Vite | Frontend Build Tool |
| React Router | Page Navigation |
| Bootstrap 5 | Responsive UI Design |
| Axios | API Communication |

---

## Backend

| Technology | Purpose |
|------------|---------|
| Java | Programming Language |
| Spring Boot | Backend Framework |
| Spring Data JPA | Database Operations |
| REST API | Client-Server Communication |

---

## Database

| Technology | Purpose |
|------------|---------|
| MySQL | Data Storage |

---

## Development Tools

- Visual Studio Code
- Spring Tool Suite
- MySQL Workbench
- Git & GitHub

---

# 📂 Project Structure

```
Placement-Management-Portal

│
├── placement-frontend
│   ├── src
│   ├── components
│   ├── pages
│   └── package.json
│
├── placement-backendd
│   ├── src/main/java
│   ├── controller
│   ├── service
│   ├── repository
│   └── pom.xml
│
└── README.md
```

---

# ⚙️ Installation & Setup

## Prerequisites

Install the following:

- Java JDK 17+
- Node.js
- MySQL
- Spring Tool Suite
- Visual Studio Code

---

# 🔧 Backend Setup

1. Open the backend project in Spring Tool Suite.

2. Configure database details in:

```
src/main/resources/application.properties
```

Example:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/placement_portal
spring.datasource.username=root
spring.datasource.password=your_password
```

3. Run the Spring Boot application.

Backend runs on:

```
http://localhost:8080
```

---

# 🎨 Frontend Setup

1. Open terminal inside frontend folder:

```
cd placement-frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the application:

```bash
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

# 🗄️ Database Setup

Create the database in MySQL:

```sql
CREATE DATABASE placement_portal;
```

The application automatically creates required tables using Spring Data JPA.

---

# 🔐 Security & Validation

The application provides:

- User authentication
- Protected routes
- Role-based access control
- Input validation
- Secure database communication

---

# 🔮 Future Enhancements

Possible improvements:

- AI-based job recommendation system
- Email notifications
- Interview scheduling module
- AI resume analysis
- Advanced analytics dashboard
- Student-company communication system

---

# 👩‍💻 Developer

**Keerthana**  
B.Tech Artificial Intelligence and Machine Learning

---

# ⭐ Project Status

✅ Completed  
🚀 Full-stack Placement Management Solution
