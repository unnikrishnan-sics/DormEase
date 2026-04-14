# 🏠 DormEase - PG & Dormitory Management System

A premium, AI-powered MERN stack application for managing paying guest accommodations and dormitories.

## 🚀 Setup Instructions

### 1. Repository Setup
Clone the repository to your local machine:
```bash
git clone https://github.com/unnikrishnan-sics/DormEase.git
cd DormEase
```

### 2. Backend Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. **Database Initialization (Required for new machines):**
   Run the seeding script to create the initial Admin and Student accounts:
   ```bash
   node seed.js
   ```
4. Start the server:
   ```bash
   node index.js
   ```

### 3. Frontend Setup
1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 🔑 Login Credentials
After running `node seed.js`, use these credentials to log in:

- **Admin**: `admin@gmail.com` / `admin@123`
- **Student**: `student@example.com` / `password123`

## ✨ Features
- **AI-Powered**: Complaint analysis and Mess menu suggestions using Google Gemini.
- **Role-Based Access**: Specialized dashboards for Admins and Students.
- **Automated Notifications**: Email invites for new students via Nodemailer.
- **Secure**: First-login password change enforcement and JWT protection.
- **Modern UI**: Built with React, Material UI, and Framer Motion.

---
Developed by **DormEase Support Team**.
