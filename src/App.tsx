/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { isFirebaseConfigured } from './lib/firebase';
import LandingPage from './pages/LandingPage';
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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  
  // If Firebase is configured, enforce authentication. 
  // Otherwise, let the user view the prototype.
  if (isFirebaseConfigured && !currentUser) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="talent" element={<TalentIntelligence />} />
            <Route path="team" element={<TeamInsights />} />
            <Route path="employee/:id" element={<EmployeeView />} />
            <Route path="leave" element={<LeaveManagement />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="automation" element={<Automation />} />
            <Route path="hiring" element={<HiringAutomation />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
