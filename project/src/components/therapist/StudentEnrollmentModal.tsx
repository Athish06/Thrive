import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Target } from 'lucide-react';
import Stepper, { Step } from '../ui/Stepper';
import { CustomDatePicker } from '../ui/CustomDatePicker';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface StudentEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface StudentData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  diagnosis: string;
  goals: string[];
}

export const StudentEnrollmentModal: React.FC<StudentEnrollmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const { refreshLearners } = useData();
  const [studentData, setStudentData] = useState<StudentData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    diagnosis: '',
    goals: []
  });
  const [currentGoal, setCurrentGoal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof StudentData, value: string) => {
    setStudentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addGoal = () => {
    if (currentGoal.trim() && studentData.goals.length < 5) {
      setStudentData(prev => ({
        ...prev,
        goals: [...prev.goals, currentGoal.trim()]
      }));
      setCurrentGoal('');
    }
  };

  const removeGoal = (index: number) => {
    setStudentData(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }));
  };

  const calculateAge = (dateOfBirth: string): number => {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleSubmit = async () => {
    if (!user) {
      alert('User not authenticated');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const age = calculateAge(studentData.dateOfBirth);
      const token = localStorage.getItem('access_token');
      
      const response = await fetch('http://localhost:8000/api/enroll-student', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: studentData.firstName,
          lastName: studentData.lastName,
          dateOfBirth: studentData.dateOfBirth,
          diagnosis: studentData.diagnosis,
          age: age,
          goals: studentData.goals,
          therapistId: parseInt(user.id)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to enroll student');
      }

      await refreshLearners(); // Refresh the students list
      onSuccess?.();
      onClose();
      
      // Reset form
      setStudentData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        diagnosis: '',
        goals: []
      });
      
    } catch (error) {
      console.error('Error enrolling student:', error);
      alert('Failed to enroll student. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex-shrink-0 p-8 pb-0">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                    Enroll New Student
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Add a new student to your program
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-8 pb-8">

          {/* Stepper */}
          <Stepper
            initialStep={1}
            onFinalStepCompleted={handleSubmit}
            backButtonText="Previous"
            nextButtonText="Next"
          >
            {/* Step 1: Basic Information & Date of Birth */}
            <Step>
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                    Basic Information
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Let's start with the student's basic details
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={studentData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={studentData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Date of Birth
                  </label>
                  <CustomDatePicker
                    value={studentData.dateOfBirth}
                    onChange={(date) => handleInputChange('dateOfBirth', date)}
                    placeholder="Select date of birth"
                  />
                  {studentData.dateOfBirth && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                      Age: {calculateAge(studentData.dateOfBirth)} years old
                    </p>
                  )}
                </div>
              </div>
            </Step>

            {/* Step 2: Learning Goals & Diagnosis */}
            <Step>
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/50 dark:to-amber-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                    Diagnosis & Learning Goals
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Add diagnosis details and set learning goals for the student
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Diagnosis/Condition
                  </label>
                  <textarea
                    value={studentData.diagnosis}
                    onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
                    placeholder="Enter diagnosis or condition details..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Add Goal
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentGoal}
                      onChange={(e) => setCurrentGoal(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addGoal()}
                      className="flex-1 px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                      placeholder="Enter a learning goal..."
                    />
                    <button
                      onClick={addGoal}
                      disabled={!currentGoal.trim() || studentData.goals.length >= 5}
                      className="px-4 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    You can add up to 5 goals
                  </p>
                </div>

                {/* Goals List */}
                {studentData.goals.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Current Goals ({studentData.goals.length}/5)
                    </h4>
                    {studentData.goals.map((goal, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                      >
                        <span className="text-slate-700 dark:text-slate-300">{goal}</span>
                        <button
                          onClick={() => removeGoal(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Completion Summary */}
                <div className="bg-gradient-to-r from-violet-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 p-4 rounded-xl">
                  <h4 className="font-medium text-slate-800 dark:text-white mb-2">Ready to enroll!</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {studentData.firstName} {studentData.lastName} will be enrolled with {studentData.goals.length} learning goals.
                  </p>
                </div>
              </div>
            </Step>
          </Stepper>
          </div>

          {isSubmitting && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-10">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto mb-4"></div>
                <p className="text-slate-600 dark:text-slate-400">Enrolling student...</p>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
