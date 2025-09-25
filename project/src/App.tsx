import * as React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { HomePage } from './components/home/HomePage';
import { LoginPage } from './components/auth/LoginPage';
import { RegistrationPage } from './components/auth/RegistrationPage';
import { AppSidebar } from './components/layout/Sidebar';
import { TopNavbar } from './components/layout/TopNavbar';
import { useSidebar } from './hooks/useSidebar';
import { cn } from './lib/utils';
import TherapistDashboard from './components/therapist/TherapistDashboard';
import { ThemeProvider } from './context/ThemeProvider';
import { LearnersList } from './components/therapist/LearnersList';
import { MyLearners } from './components/therapist/MyLearners';
import { ParentDashboard } from './components/parent/ParentDashboard';
import { HomeworkManager } from './components/parent/HomeworkManager';
import ProgressReport from './components/parent/ProgressReport';
import { ParentRegistrationPage } from './components/parent/ParentRegistrationPage';
import { ProtectedRoute } from './components/shared/ProtectedRoute';
import { SessionPlanning } from './components/sessions/SessionPlanning';

const DashboardLayout: React.FC = () => {
  const { user } = useAuth();
  const { isOpen } = useSidebar();
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <TopNavbar isProfileOpen={isProfileOpen} onProfileToggle={setIsProfileOpen} />
      <main className={cn(
        'transition-all duration-300',
        'pt-24 px-4',
        isOpen ? 'md:ml-[260px]' : 'md:ml-[72px]'
      )}>
        <Routes>
          <Route 
            path="/dashboard" 
            element={
              user?.role === 'therapist' ? <TherapistDashboard isProfileOpen={isProfileOpen} /> : <ParentDashboard isProfileOpen={isProfileOpen} />
            } 
          />
          
          {/* Therapist Routes */}
          <Route 
            path="/learners" 
            element={
              <ProtectedRoute requiredRole="therapist">
                <LearnersList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/learners/my-learners" 
            element={
              <ProtectedRoute requiredRole="therapist">
                <MyLearners />
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
                <ParentDashboard isProfileOpen={isProfileOpen} />
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
                <ProgressReport />
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
      </main>
    </div>
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
      <Route path="/parent-registration" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ParentRegistrationPage />} />
      
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
        <ThemeProvider>
          <Router>
            <AppLayout />
          </Router>
        </ThemeProvider>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;