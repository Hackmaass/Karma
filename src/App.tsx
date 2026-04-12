import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { isFirebaseConfigured } from './lib/firebase';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import TeamInsights from './pages/TeamInsights';
import EmployeeView from './pages/EmployeeView';
import TalentIntelligence from './pages/TalentIntelligence';
import Settings from './pages/Settings';
import LeaveManagement from './pages/LeaveManagement';
import Attendance from './pages/Attendance';
import Automation from './pages/Automation';
import HiringAutomation from './pages/HiringAutomation';
import EmployeeDataUpload from './pages/EmployeeDataUpload';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  
  if (isFirebaseConfigured && !currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="w-full min-h-screen"
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  
  // We only animate the top-level roots here. Inner dashboard routes are animated inside DashboardLayout.
  // Wait, if we put key={location.pathname} here, it will re-render the whole DashboardLayout on every internal navigation.
  // To prevent DashboardLayout from unmounting on sub-route changes, we use key based on the root path section.
  const rootPath = location.pathname.startsWith('/app') ? '/app' : location.pathname;

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={rootPath}>
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        
        <Route path="/app" element={
          <PageTransition>
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          </PageTransition>
        }>
          <Route index element={<Dashboard />} />
          <Route path="talent" element={<TalentIntelligence />} />
          <Route path="team" element={<TeamInsights />} />
          <Route path="employee/:id" element={<EmployeeView />} />
          <Route path="leave" element={<LeaveManagement />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="automation" element={<Automation />} />
          <Route path="hiring" element={<HiringAutomation />} />
          <Route path="employees/upload" element={<EmployeeDataUpload />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AnimatedRoutes />
      </Router>
    </AuthProvider>
  );
}
