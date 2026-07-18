import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

// Dashboard Pages
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CompanyDashboard from './pages/CompanyDashboard';

// Student Specific Pages
import Companies from './pages/Companies';
import CompanyDetails from './pages/CompanyDetails';
import Jobs from './pages/Jobs';
import SavedJobs from './pages/SavedJobs';
import Applications from './pages/Applications';
import Profile from './pages/Profile';
import InterviewSchedule from './pages/InterviewSchedule';

// Admin Specific Pages
import AdminStudents from './pages/AdminStudents';
import AdminCompanies from './pages/AdminCompanies';
import AdminJobs from './pages/AdminJobs';
import AdminApplications from './pages/AdminApplications';

// Company Specific Pages
import CompanyProfile from './pages/CompanyProfile';
import CompanyJobs from './pages/CompanyJobs';
import CompanyApplicants from './pages/CompanyApplicants';

function App() {
  return (
    <>
      <Navbar />
      <div className="flex-grow-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Student Routes */}
          <Route path="/student-dashboard" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/companies" element={<ProtectedRoute allowedRoles={['STUDENT']}><Companies /></ProtectedRoute>} />
          <Route path="/companies/:id" element={<ProtectedRoute allowedRoles={['STUDENT']}><CompanyDetails /></ProtectedRoute>} />
          <Route path="/jobs" element={<ProtectedRoute allowedRoles={['STUDENT']}><Jobs /></ProtectedRoute>} />
          <Route path="/saved-jobs" element={<ProtectedRoute allowedRoles={['STUDENT']}><SavedJobs /></ProtectedRoute>} />
          <Route path="/applications" element={<ProtectedRoute allowedRoles={['STUDENT']}><Applications /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute allowedRoles={['STUDENT']}><Profile /></ProtectedRoute>} />
          <Route path="/interview-schedule" element={<ProtectedRoute allowedRoles={['STUDENT']}><InterviewSchedule /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminStudents /></ProtectedRoute>} />
          <Route path="/admin/companies" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminCompanies /></ProtectedRoute>} />
          <Route path="/admin/jobs" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminJobs /></ProtectedRoute>} />
          <Route path="/admin/applications" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminApplications /></ProtectedRoute>} />

          {/* Company Routes */}
          <Route path="/company-dashboard" element={<ProtectedRoute allowedRoles={['COMPANY']}><CompanyDashboard /></ProtectedRoute>} />
          <Route path="/company/profile" element={<ProtectedRoute allowedRoles={['COMPANY']}><CompanyProfile /></ProtectedRoute>} />
          <Route path="/company/jobs" element={<ProtectedRoute allowedRoles={['COMPANY']}><CompanyJobs /></ProtectedRoute>} />
          <Route path="/company/applicants" element={<ProtectedRoute allowedRoles={['COMPANY']}><CompanyApplicants /></ProtectedRoute>} />

          {/* Catch-all 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
}

export default App;
