import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Activity, BookOpen, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

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
  parent_feedback?: string;
  created_at: string;
  updated_at: string;
  student_name?: string;
  therapist_name?: string;
}

interface ProgressReportProps {
  // No longer need studentId since we get it from parent profile
}

const ProgressReport: React.FC<ProgressReportProps> = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('access_token');
        console.log('Fetching completed sessions for parent child...');
        
        // Use the new parent-sessions endpoint which automatically gets child_id from parent profile
        const response = await fetch(`http://localhost:8000/api/parent-sessions`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setSessions(data);
          console.log('Completed sessions loaded:', data);
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch sessions:', errorText);
          setError('Failed to fetch completed sessions');
        }
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setError('Error fetching completed sessions');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessions();
  }, []); // No dependency on studentId anymore

  const openFeedbackModal = (session: Session) => {
    setSelectedSession(session);
    setFeedback(session.parent_feedback || ''); // Pre-fill existing feedback
    setFeedbackModalOpen(true);
  };

  const closeFeedbackModal = () => {
    setFeedbackModalOpen(false);
    setSelectedSession(null);
    setFeedback('');
  };

  const submitFeedback = async () => {
    if (!selectedSession || !feedback.trim()) return;
    
    setSubmittingFeedback(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/session-feedback`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: selectedSession.id,
          feedback: feedback.trim()
        })
      });

      if (response.ok) {
        console.log('Feedback submitted successfully');
        
        // Update the local session with the new feedback
        setSessions(prevSessions => 
          prevSessions.map(session => 
            session.id === selectedSession.id 
              ? { ...session, parent_feedback: feedback.trim() }
              : session
          )
        );
        
        closeFeedbackModal();
        // Show success message or update the session list
      } else {
        console.error('Failed to submit feedback');
        // Show error message
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
      // Show error message
    } finally {
      setSubmittingFeedback(false);
    }
  };

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
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 dark:text-red-400 p-8">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="relative z-10 space-y-8 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="flex justify-between items-start"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            Completed Therapy Sessions
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            All completed therapy sessions for your child
          </p>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="glass-card rounded-2xl p-6"
      >
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
              <span className="font-bold">No sessions are completed</span>
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              No completed therapy sessions found for your child. Sessions will appear here after they are completed.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {sessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg">
                        <BookOpen className="h-7 w-7 text-white" />
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
                        {session.session_type.charAt(0).toUpperCase() + session.session_type.slice(1)} Session
                      </h3>
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
                
                {/* Parent Feedback Section */}
                {session.parent_feedback && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-800/50 dark:to-emerald-700/50 rounded-xl border border-green-200/50 dark:border-green-600/50">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mt-0.5">
                        <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-green-600 dark:text-green-400 mb-1 font-medium">Your Feedback</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                          {session.parent_feedback}
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
                  
                  {/* Feedback Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openFeedbackModal(session)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-md ${
                      session.parent_feedback 
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700' 
                        : 'bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:from-violet-700 hover:to-blue-700'
                    }`}
                  >
                    <MessageSquare className="h-4 w-4" />
                    {session.parent_feedback ? 'Edit Feedback' : 'Give Feedback'}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Feedback Modal */}
      {feedbackModalOpen && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {selectedSession.parent_feedback ? 'Edit Session Feedback' : 'Session Feedback'}
              </h2>
              <button
                onClick={closeFeedbackModal}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Session Date</p>
              <p className="font-semibold text-slate-800 dark:text-white">
                {formatDate(selectedSession.session_date)} - {formatTime(selectedSession.start_time)}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Share your feedback about this therapy session:
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="How did your child feel about this session? Any observations or questions you'd like to share with the therapist?"
                className="w-full h-32 p-3 border border-slate-300 dark:border-slate-600 rounded-lg resize-none focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                maxLength={500}
              />
              <p className="text-xs text-slate-500 mt-1">{feedback.length}/500 characters</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeFeedbackModal}
                className="flex-1 px-4 py-2 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitFeedback}
                disabled={!feedback.trim() || submittingFeedback}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-lg hover:from-violet-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {submittingFeedback ? 'Submitting...' : (selectedSession.parent_feedback ? 'Update Feedback' : 'Submit Feedback')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProgressReport;