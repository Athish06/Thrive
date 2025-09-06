import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Clock, Target, CheckCircle, XCircle, Play, AlertCircle } from 'lucide-react';

interface SessionActivity {
  id: number;
  session_id: number;
  student_activity_id: number;
  estimated_duration?: number;
  actual_duration?: number;
  prerequisites: string[];
  completed_prerequisites: string[];
  skipped_prerequisites: string[];
  status: string;
  created_at: string;
  updated_at: string;
  activity_name?: string;
  activity_description?: string;
  difficulty_level?: number;
}

interface StudentActivity {
  id: number;
  student_id: number;
  activity_name: string;
  activity_description?: string;
  difficulty_level: number;
  estimated_duration: number;
  current_status: string;
  total_attempts: number;
  successful_attempts: number;
  last_attempted?: string;
  created_at: string;
  updated_at: string;
}

interface Session {
  id: number;
  student_id: number;
  student_name?: string;
  session_date: string;
  start_time: string;
  end_time: string;
  status: string;
  total_planned_activities: number;
  completed_activities: number;
}

interface SessionActivitiesModalProps {
  session: Session;
  onClose: () => void;
  onUpdate: () => void;
}

export const SessionActivitiesModal: React.FC<SessionActivitiesModalProps> = ({ 
  session, 
  onClose, 
  onUpdate 
}) => {
  const [sessionActivities, setSessionActivities] = useState<SessionActivity[]>([]);
  const [availableActivities, setAvailableActivities] = useState<StudentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessionActivities = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/sessions/${session.id}/activities`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSessionActivities(data);
      } else {
        setError('Failed to fetch session activities');
      }
    } catch (err) {
      setError('Error fetching session activities');
      console.error('Session activities fetch error:', err);
    }
  };

  const fetchAvailableActivities = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/students/${session.student_id}/activities`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableActivities(data);
      }
    } catch (err) {
      console.error('Available activities fetch error:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSessionActivities(), fetchAvailableActivities()]);
      setLoading(false);
    };

    loadData();
  }, [session.id, session.student_id]);

  const addActivityToSession = async (studentActivityId: number, estimatedDuration?: number) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/sessions/${session.id}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          student_activity_id: studentActivityId,
          estimated_duration: estimatedDuration,
          prerequisites: []
        })
      });

      if (response.ok) {
        await fetchSessionActivities();
        onUpdate();
        setShowAddModal(false);
      } else {
        setError('Failed to add activity to session');
      }
    } catch (err) {
      setError('Error adding activity to session');
    }
  };

  const removeActivityFromSession = async (activityId: number) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/sessions/${session.id}/activities/${activityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchSessionActivities();
        onUpdate();
      } else {
        setError('Failed to remove activity from session');
      }
    } catch (err) {
      setError('Error removing activity from session');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
      case 'skipped':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-900/20 dark:text-slate-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planned':
        return <Clock className="h-4 w-4" />;
      case 'in_progress':
        return <Play className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'skipped':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
      case 2:
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 3:
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300';
      case 4:
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300';
      case 5:
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-900/20 dark:text-slate-300';
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600"></div>
          <span className="text-slate-700 dark:text-slate-300">Loading activities...</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
              Session Activities - {session.student_name}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {new Date(session.session_date).toLocaleDateString()} • {session.start_time} - {session.end_time}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-lg hover:from-violet-700 hover:to-blue-700 transition-all duration-300"
            >
              <Plus className="h-4 w-4" />
              Add Activity
            </motion.button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {sessionActivities.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
                No activities planned yet
              </h3>
              <p className="text-slate-500 dark:text-slate-500 mb-6">
                Add activities to this session to help track progress
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl hover:from-violet-700 hover:to-blue-700 transition-all duration-300"
              >
                Add First Activity
              </motion.button>
            </div>
          ) : (
            <div className="space-y-4">
              {sessionActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-800 dark:text-white">
                          {activity.activity_name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)} flex items-center gap-1`}>
                          {getStatusIcon(activity.status)}
                          {activity.status.replace('_', ' ').toUpperCase()}
                        </span>
                        {activity.difficulty_level && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(activity.difficulty_level)}`}>
                            Level {activity.difficulty_level}
                          </span>
                        )}
                      </div>
                      {activity.activity_description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                          {activity.activity_description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Estimated: {activity.estimated_duration || 'N/A'}min
                        </div>
                        {activity.actual_duration && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            Actual: {activity.actual_duration}min
                          </div>
                        )}
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => removeActivityFromSession(activity.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <XCircle className="h-4 w-4" />
                    </motion.button>
                  </div>

                  {activity.prerequisites.length > 0 && (
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3">
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Prerequisites:</h4>
                      <div className="flex flex-wrap gap-2">
                        {activity.prerequisites.map((prereq, idx) => (
                          <span key={idx} className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded text-xs">
                            {prereq}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Add Activity Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddActivityModal
            availableActivities={availableActivities}
            sessionActivities={sessionActivities}
            onClose={() => setShowAddModal(false)}
            onAdd={addActivityToSession}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Add Activity Modal Component
interface AddActivityModalProps {
  availableActivities: StudentActivity[];
  sessionActivities: SessionActivity[];
  onClose: () => void;
  onAdd: (activityId: number, estimatedDuration?: number) => void;
}

const AddActivityModal: React.FC<AddActivityModalProps> = ({ 
  availableActivities, 
  sessionActivities, 
  onClose, 
  onAdd 
}) => {
  const [selectedActivity, setSelectedActivity] = useState<StudentActivity | null>(null);
  const [estimatedDuration, setEstimatedDuration] = useState<string>('');

  // Filter out activities already in session
  const alreadyInSession = sessionActivities.map(sa => sa.student_activity_id);
  const filteredActivities = availableActivities.filter(
    activity => !alreadyInSession.includes(activity.id)
  );

  const handleAdd = () => {
    if (selectedActivity) {
      const duration = estimatedDuration ? parseInt(estimatedDuration) : selectedActivity.estimated_duration;
      onAdd(selectedActivity.id, duration);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
            Add Activity to Session
          </h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {filteredActivities.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400">
              All available activities are already in this session
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Select Activity:
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedActivity?.id === activity.id
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                    onClick={() => {
                      setSelectedActivity(activity);
                      setEstimatedDuration(activity.estimated_duration.toString());
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-800 dark:text-white">
                          {activity.activity_name}
                        </h4>
                        {activity.activity_description && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {activity.activity_description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(activity.difficulty_level)}`}>
                            Level {activity.difficulty_level}
                          </span>
                          <span className="text-xs text-slate-500">
                            {activity.estimated_duration} min
                          </span>
                          <span className="text-xs text-slate-500">
                            {activity.successful_attempts}/{activity.total_attempts} successful
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedActivity && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Estimated Duration (minutes):
                </label>
                <input
                  type="number"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  min="1"
                  max="120"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!selectedActivity}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-lg hover:from-violet-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Activity
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

function getDifficultyColor(level: number) {
  switch (level) {
    case 1:
      return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
    case 2:
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300';
    case 3:
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300';
    case 4:
      return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300';
    case 5:
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-900/20 dark:text-slate-300';
  }
}
