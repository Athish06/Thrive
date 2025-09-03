import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Calendar as CalendarIcon, BookOpen, Clock, CheckCircle } from 'lucide-react';
import Stepper, { Step } from '../ui/Stepper';
import { CustomDatePicker } from '../ui/CustomDatePicker';

// Custom styles for the calendar
const calendarStyle = `
  .modern-calendar {
    border: none !important;
    border-radius: 12px !important;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
    font-family: inherit !important;
  }
  
  .modern-calendar .react-calendar__navigation {
    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%) !important;
    border-radius: 12px 12px 0 0 !important;
    padding: 12px !important;
    margin-bottom: 0 !important;
  }
  
  .modern-calendar .react-calendar__navigation button {
    color: white !important;
    background: none !important;
    border: none !important;
    font-weight: 600 !important;
    padding: 8px 12px !important;
    border-radius: 8px !important;
    transition: all 0.2s ease !important;
  }
  
  .modern-calendar .react-calendar__navigation button:hover {
    background: rgba(255, 255, 255, 0.1) !important;
  }
  
  .modern-calendar .react-calendar__month-view__weekdays {
    background: #f8fafc !important;
    padding: 8px 0 !important;
  }
  
  .modern-calendar .react-calendar__month-view__weekdays__weekday {
    color: #64748b !important;
    font-weight: 600 !important;
    text-transform: uppercase !important;
    font-size: 12px !important;
  }
  
  .modern-calendar .react-calendar__tile {
    background: none !important;
    border: none !important;
    padding: 12px 8px !important;
    color: #374151 !important;
    font-weight: 500 !important;
    transition: all 0.2s ease !important;
    border-radius: 8px !important;
    margin: 2px !important;
  }
  
  .modern-calendar .react-calendar__tile:hover {
    background: #e0e7ff !important;
    color: #3730a3 !important;
  }
  
  .modern-calendar .react-calendar__tile--active {
    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%) !important;
    color: white !important;
    box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3) !important;
  }
  
  .modern-calendar .react-calendar__tile--now {
    background: #fef3c7 !important;
    color: #92400e !important;
    font-weight: 600 !important;
  }
  
  .modern-calendar .react-calendar__tile--now:hover {
    background: #fde68a !important;
    color: #78350f !important;
  }
`;

// Mock learners for selection
const learners = [
  { id: '1', name: 'Emma Johnson' },
  { id: '2', name: 'Liam Chen' },
  { id: '3', name: 'Sophia Davis' },
  { id: '4', name: 'Noah Wilson' },
];

const activities = [
  'Speech Therapy',
  'Occupational Therapy',
  'Behavioral Session',
  'Social Skills',
  'Sensory Play',
];

export interface SessionAddModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (session: any) => void;
}

interface SessionData {
  learnerId: string;
  date: string;
  time: string;
  activities: string[];
}

export const SessionAddModal: React.FC<SessionAddModalProps> = ({ open, onClose, onAdd }) => {
  const [sessionData, setSessionData] = useState<SessionData>({
    learnerId: '',
    date: '',
    time: '',
    activities: []
  });

  const handleInputChange = (field: keyof SessionData, value: string | string[]) => {
    setSessionData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleActivity = (activity: string) => {
    setSessionData(prev => ({
      ...prev,
      activities: prev.activities.includes(activity)
        ? prev.activities.filter(a => a !== activity)
        : [...prev.activities, activity]
    }));
  };

  const handleSubmit = () => {
    const selectedLearner = learners.find(l => l.id === sessionData.learnerId);
    if (selectedLearner && sessionData.date && sessionData.time && sessionData.activities.length > 0) {
      onAdd({
        learner: selectedLearner.name,
        date: sessionData.date,
        time: sessionData.time,
        activities: sessionData.activities,
      });
      
      // Reset form
      setSessionData({
        learnerId: '',
        date: '',
        time: '',
        activities: []
      });
      onClose();
    }
  };

  if (!open) return null;

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
                  <CalendarIcon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                    Schedule New Session
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Create a new therapy session for your learners
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
            <Stepper
              initialStep={1}
              onFinalStepCompleted={handleSubmit}
              backButtonText="Previous"
              nextButtonText="Next"
            >
              {/* Step 1: Select Learner */}
              <Step>
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                      Select Learner
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Choose who this session is for
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {learners.map(learner => (
                      <button
                        key={learner.id}
                        onClick={() => handleInputChange('learnerId', learner.id)}
                        className={`p-4 rounded-xl transition-all border-2 text-left ${
                          sessionData.learnerId === learner.id
                            ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                            : 'border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-600 bg-white dark:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                            sessionData.learnerId === learner.id
                              ? 'bg-violet-600 text-white'
                              : 'bg-gradient-to-br from-blue-100 to-purple-100 dark:from-slate-700 dark:to-slate-600 text-blue-700 dark:text-blue-300'
                          }`}>
                            {learner.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="font-medium text-slate-800 dark:text-white">{learner.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </Step>

              {/* Step 2: Schedule Session */}
              <Step>
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/50 dark:to-amber-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CalendarIcon className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                      Schedule Session
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Pick the date and time for the session
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Session Date
                    </label>
                    <CustomDatePicker
                      value={sessionData.date}
                      onChange={(date) => handleInputChange('date', date)}
                      placeholder="Select session date"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Session Time
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="time"
                        value={sessionData.time}
                        onChange={(e) => handleInputChange('time', e.target.value)}
                        min="08:00"
                        max="18:00"
                        className="flex-1 px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-slate-800 dark:text-white"
                      />
                      <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
                        8:00 AM - 6:00 PM
                      </span>
                    </div>
                  </div>
                </div>
              </Step>

              {/* Step 3: Choose Activities */}
              <Step>
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                      Choose Activities
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Select the therapy activities for this session
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {activities.map(activity => (
                      <button
                        key={activity}
                        onClick={() => toggleActivity(activity)}
                        className={`p-4 rounded-xl transition-all border-2 text-left ${
                          sessionData.activities.includes(activity)
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : 'border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-600 bg-white dark:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              sessionData.activities.includes(activity)
                                ? 'bg-green-600 text-white'
                                : 'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-slate-700 dark:to-slate-600 text-green-700 dark:text-green-300'
                            }`}>
                              <BookOpen className="h-4 w-4" />
                            </div>
                            <span className="font-medium text-slate-800 dark:text-white">{activity}</span>
                          </div>
                          {sessionData.activities.includes(activity) && (
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {sessionData.activities.length > 0 && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                      <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                        {sessionData.activities.length} activit{sessionData.activities.length === 1 ? 'y' : 'ies'} selected
                      </p>
                    </div>
                  )}

                  {/* Completion Summary */}
                  <div className="bg-gradient-to-r from-violet-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 p-4 rounded-xl">
                    <h4 className="font-medium text-slate-800 dark:text-white mb-2">Ready to schedule!</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Session will be scheduled with {sessionData.activities.length} selected activities.
                    </p>
                  </div>
                </div>
              </Step>
            </Stepper>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
