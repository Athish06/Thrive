import * as React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { HomePage } from './components/home/HomePage';
import { LoginPage } from './components/auth/LoginPage';
import { RegistrationPage } from './components/auth/RegistrationPage';
import { AppHeader } from './components/layout/AppHeader';
import { AppSidebar } from './components/layout/Sidebar';
import { SidebarProvider, SidebarTrigger } from './components/ui/sidebar';
import { MainContent } from './components/layout/MainContent';
import TherapistDashboard from './components/therapist/TherapistDashboard';
import { LearnersList } from './components/therapist/LearnersList';
import { ParentDashboard } from './components/parent/ParentDashboard';
import { HomeworkManager } from './components/parent/HomeworkManager';
import { ProtectedRoute } from './components/shared/ProtectedRoute';
import { SessionPlanning } from './components/sessions/SessionPlanning';

const DashboardLayout: React.FC = () => {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <AppHeader />
        
        <div className="flex">
          <AppSidebar />
          
          <div className="flex-1">
            <div className="flex items-center gap-2 p-4">
              <SidebarTrigger />
              <div className="h-4 w-px bg-border" />
              <h1 className="text-lg font-semibold">
                {user?.role === 'therapist' ? 'Therapist Dashboard' : 'Parent Dashboard'}
              </h1>
            </div>
            
            <MainContent>
              <Routes>
                <Route 
                  path="/dashboard" 
                  element={
                    user?.role === 'therapist' ? <TherapistDashboard /> : <ParentDashboard />
                  } 
                />
                
                {/* Therapist Routes */}
                <Route 
                  path="/learners/*" 
                  element={
                    <ProtectedRoute requiredRole="therapist">
                      <LearnersList />
                    </ProtectedRoute>
                  } 
                />
                <Route
                  path="/sessions"
                  element={
                    <ProtectedRoute requiredRole="therapist">
                      <SessionPlanning />
                    </ProtectedRoute>
                  }
                />
                
                {/* Parent Routes */}
                <Route 
                  path="/child" 
                  element={
                    <ProtectedRoute requiredRole="parent">
                      <ParentDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/homework" 
                  element={
                    <ProtectedRoute requiredRole="parent">
                      <HomeworkManager />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/progress" 
                  element={
                    <ProtectedRoute requiredRole="parent">
                      <div className="text-center py-12">
                        <h2 className="text-2xl font-bold text-foreground mb-4">Progress Reports</h2>
                        <p className="text-muted-foreground">Detailed progress reports coming soon!</p>
                      </div>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/goals" 
                  element={
                    <ProtectedRoute requiredRole="parent">
                      <div className="text-center py-12">
                        <h2 className="text-2xl font-bold text-foreground mb-4">Goals & Milestones</h2>
                        <p className="text-muted-foreground">Goal tracking interface coming soon!</p>
                      </div>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Catch all for dashboard routes */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </MainContent>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

const AppLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes - Always accessible */}
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegistrationPage />} />
      
      {/* Protected Dashboard Routes - Only accessible when authenticated */}
      {isAuthenticated ? (
        <Route path="/*" element={<DashboardLayout />} />
      ) : (
        <Route path="*" element={<Navigate to="/" replace />} />
      )}
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <AppLayout />
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;