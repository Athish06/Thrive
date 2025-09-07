import React from 'react';
import { useNavigate } from 'react-router-dom';
import ParentRegistrationForm from './ParentRegistrationForm';

export const ParentRegistrationPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/login', { 
      state: { 
        registrationSuccess: true, 
        message: 'Account created successfully! Please log in with your credentials.',
      } 
    });
  };

  const handleClose = () => {
    navigate('/register'); // Go back to main registration page
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <ParentRegistrationForm
        onSuccess={handleSuccess}
        onClose={handleClose}
      />
    </div>
  );
};

export default ParentRegistrationPage;
