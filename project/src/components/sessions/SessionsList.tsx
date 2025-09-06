import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, User, Plus, BookOpen, Settings, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SessionActivitiesModal } from './SessionActivitiesModal';
import { SessionAddModal } from './SessionAddModal';

interface Session {
  id: number;
  therapist_id: number;
  student_id: number;
  session_date: string;
  start_time: string;
  end_time: string;
  session_type: string;
  status: string;
  total_planned_activities: number;
  completed_activities: number;
  estimated_duration_minutes: number;
  actual_duration_minutes?: number;
  prerequisite_completion_required: boolean;
  therapist_notes?: string;
  created_at: string;
  updated_at: string;
  student_name?: string;
  therapist_name?: string;
}

interface Student {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
}

export const SessionsList: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/sessions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      } else {
        setError('Failed to fetch sessions');
      }
    } catch (err) {
      setError('Error fetching sessions');
      console.error('Sessions fetch error:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/my-students', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        console.error('Failed to fetch students:', response.status);
      }
    } catch (err) {
      console.error('Students fetch error:', err);
    }
  };

  const handleSessionAdd = async (sessionData: any) => {
    try {
      const token = localStorage.getItem('access_token');
      
      // Find the selected learner from the sessionData
      const selectedLearner = students.find(student => 
        student.name === sessionData.learner
      );
      
      if (!selectedLearner) {
        setError('Selected learner not found');
        return;
      }

      // Convert the sessionData format to backend format
      const backendData = {
        student_id: selectedLearner.id,
        session_date: sessionData.date,
        start_time: sessionData.time,
        end_time: calculateEndTime(sessionData.time, 60), // Default 60 min session
        session_type: 'therapy',
        therapist_notes: sessionData.notes 
          ? `${sessionData.notes}\n\nPlanned activities: ${sessionData.activities.join(', ')}`
          : `Planned activities: ${sessionData.activities.join(', ')}`
      };

      const response = await fetch('http://localhost:8000/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(backendData)
      });

      if (response.ok) {
        await fetchSessions();
        setShowCreateModal(false);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to create session');
      }
    } catch (err) {
      setError('Error creating session');
      console.error('Session creation error:', err);
    }
  };

  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    
    return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSessions(), fetchStudents()]);
      setLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300';
      case 'no_show':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-900/20 dark:text-slate-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 dark:text-red-400 p-8">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-white dark:bg-black">
      {/* Floating orbs background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 right-10 h-32 w-32 rounded-full bg-gradient-to-br from-violet-400/20 to-blue-400/20 blur-2xl"
        />
        <motion.div
          animate={{ 
            x: [0, -25, 0],
            y: [0, 15, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-20 left-20 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 blur-2xl"
        />
        <motion.div
          animate={{ 
            x: [0, 20, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute top-1/2 left-1/3 h-20 w-20 rounded-full bg-gradient-to-br from-pink-400/20 to-rose-400/20 blur-2xl"
        />
      </div>

      <div className="relative z-10 space-y-8 p-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="flex justify-between items-start"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
              Therapy Sessions
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage and track your therapy sessions
            </p>
          </div>
          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Session
          </motion.button>
        </motion.div>

        {/* Sessions Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="glass-card rounded-2xl p-6"
        >
          {/* Sessions Grid */}
          {sessions.length === 0 ? (
            <div className="text-center py-16">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-violet-100 to-blue-100 dark:from-violet-900/30 dark:to-blue-900/30 mb-6"
              >
                <Calendar className="h-10 w-10 text-violet-600 dark:text-violet-400" />
              </motion.div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">
                No sessions yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                Create your first therapy session to get started with managing your learners' progress
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl hover:from-violet-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Create Session
              </motion.button>
            </div>
          ) : (
            <div className="grid gap-6">
          {sessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-2xl p-6 cursor-pointer group hover:shadow-xl transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50 hover:border-violet-300 dark:hover:border-violet-600"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg">
                      <User className="h-7 w-7 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1">
                      <div className={`w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 ${
                        session.status === 'completed' ? 'bg-green-500' :
                        session.status === 'in_progress' ? 'bg-yellow-500' :
                        session.status === 'scheduled' ? 'bg-blue-500' :
                        'bg-slate-400'
                      }`}></div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1">
                      {session.student_name || 'Unknown Student'}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      {session.session_type.charAt(0).toUpperCase() + session.session_type.slice(1)} Session
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getStatusColor(session.status)}`}>
                        {session.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Date</p>
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">
                      {formatDate(session.session_date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Time</p>
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">
                      {formatTime(session.start_time)} - {formatTime(session.end_time)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Progress</p>
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">
                      {session.completed_activities}/{session.total_planned_activities} Activities
                    </p>
                  </div>
                </div>
              </div>

              {session.therapist_notes && (
                <div className="mb-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-xl border border-slate-200/50 dark:border-slate-600/50">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg mt-0.5">
                      <BookOpen className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">Session Notes</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {session.therapist_notes}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center gap-4">
                  {session.total_planned_activities > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                          <div 
                            className="bg-gradient-to-r from-violet-600 to-blue-600 h-2.5 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${(session.completed_activities / session.total_planned_activities) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {Math.round((session.completed_activities / session.total_planned_activities) * 100)}%
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                        Progress
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedSession(session)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/30 rounded-xl transition-all duration-200 border border-violet-200 dark:border-violet-800"
                  >
                    <BookOpen className="h-4 w-4" />
                    Activities
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200 border border-slate-200 dark:border-slate-700"
                  >
                    <Settings className="h-4 w-4" />
                    Options
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
        </motion.div>

      {/* Create Session Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <SessionAddModal
            open={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onAdd={handleSessionAdd}
            students={students}
          />
        )}
      </AnimatePresence>

      {/* Session Activities Modal */}
      <AnimatePresence>
        {selectedSession && (
          <SessionActivitiesModal
            session={selectedSession}
            onClose={() => setSelectedSession(null)}
            onUpdate={fetchSessions}
          />
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};
