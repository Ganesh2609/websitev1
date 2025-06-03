# 🏥 Hospital Management System (HMS)

A comprehensive web-based hospital management solution built with React, TypeScript, and Node.js, deployed on Azure with PostgreSQL database integration.

## 🌐 Live Demo

[HMS Live Demo](https://frontendv1.azurewebsites.net)

## 📋 Overview

The Hospital Management System (HMS) is a modern, full-stack application designed to streamline healthcare operations. It provides a unified platform for managing patient information, doctor schedules, appointments, and administrative tasks.

The system supports three primary user roles:
- **Patients**: Schedule appointments, manage personal health records
- **Doctors**: View appointments, manage patient treatments
- **Administrators**: Manage system users, specializations, and overall system settings

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **ShadCN UI** and **NextUI** component libraries
- **React Router** for navigation
- **React Hook Form** with Zod for form validation
- **Axios** for API requests
- **Framer Motion** for animations

### Backend
- **Node.js** with Express
- **PostgreSQL** database
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Multer** for file uploads

### Deployment
- **Azure Web App** for hosting
- **GitHub Actions** for CI/CD

## 🔑 Key Features

### Patient Portal
- User registration and profile management
- Appointment scheduling with doctor selection
- View upcoming and past appointments
- Cancel appointments
- Receive notifications

### Doctor Portal
- View scheduled appointments
- Manage patient treatments
- Add medical notes and billing information
- Complete appointment workflows

### Admin Dashboard
- Add/remove doctors and nurses
- Manage specializations
- Monitor system activity

## 🏗️ Project Structure

```
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components for different routes
│   │   ├── lib/           # Utility functions and API actions
│   │   ├── types/         # TypeScript type definitions
│   │   └── assets/        # Static assets (images, icons)
│
├── server.js              # Express server and API endpoints
├── .env                   # Environment variables
└── .github/workflows/     # CI/CD configuration
```

## 💻 Development Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL database

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/hospital-management-system.git
cd hospital-management-system
```

2. Install dependencies
```bash
npm install
cd client
npm install
```

3. Configure environment variables
Create a `.env` file in the root directory with the following:
```
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=hms
DB_HOST=localhost
DB_PORT=5432
```

4. Run the application
```bash
# Run backend server
node server.js

# In a separate terminal, run frontend
cd client
npm run dev
```

## 🚀 Database Schema

The system uses a relational database with the following key tables:

- **users**: Basic user authentication and role information
- **patients**: Patient profile and medical information
- **doctors**: Doctor information and specializations
- **nurses**: Nursing staff information
- **appointment_requests**: Pending appointment requests
- **appointments**: Confirmed appointments
- **appointment_slots**: Available time slots for appointments
- **medical_specializations**: Types of medical specialties
- **treatment_history**: Patient treatment records
- **billing**: Payment and billing information
- **notifications**: System notifications

## 🔐 Authentication Flow

1. User registers with username, email, password, and role
2. Passwords are hashed using bcrypt before storage
3. On login, credentials are verified and role-based access is granted
4. JWT tokens manage authenticated sessions

## 📱 Responsive Design

The application is fully responsive, providing optimal user experience across:
- Desktop computers
- Tablets
- Mobile devices

## 🔄 Appointment Workflow

1. Patient selects a doctor and preferred date/time
2. System checks doctor availability
3. Patient submits appointment request with reason
4. Doctor reviews and approves/rejects request
5. Upon approval, appointment is confirmed and added to schedules
6. After the appointment, doctor adds treatment details and billing information
7. Notifications are sent at each step of the process
