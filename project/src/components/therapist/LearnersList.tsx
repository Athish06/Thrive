import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { Search, Filter, TrendingUp, User, Plus, Brain, Sparkles, Star, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { StudentEnrollmentModal } from './StudentEnrollmentModal';

export const LearnersList: React.FC = () => {
  const { littleLearners, loading, error, refreshLearners } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const navigate = useNavigate();

  // Refresh data every time the component mounts
  useEffect(() => {
    refreshLearners();
  }, [refreshLearners]);

  const filteredLearners = littleLearners.filter(learner => {
    const matchesSearch = learner.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || learner.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const formatNextSession = (nextSession?: string) => {
    if (!nextSession) return 'No upcoming session';
    const date = new Date(nextSession);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
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
        {/* Add New Learner Button */}
        <div className="flex justify-end">
          <motion.button 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEnrollmentModalOpen(true)}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Enroll New Learner
          </motion.button>
        </div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent backdrop-blur-sm transition-all text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="pl-12 pr-8 py-3 bg-white/50 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent backdrop-blur-sm transition-all text-slate-800 dark:text-white appearance-none min-w-[160px]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="new">New Enrollments</option>
                <option value="assessment_due">Assessment Due</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-3 mt-6">
            <motion.span 
              whileHover={{ scale: 1.05 }}
              className="px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-slate-800/80 dark:to-slate-700/80 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium cursor-pointer transition-all hover:shadow-md"
            >
              Ages 5-7
            </motion.span>
            <motion.span 
              whileHover={{ scale: 1.05 }}
              className="px-4 py-2 bg-gradient-to-r from-emerald-100 to-emerald-200 dark:from-emerald-900/50 dark:to-emerald-800/50 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium cursor-pointer transition-all hover:shadow-md"
            >
              High Progress
            </motion.span>
            <motion.span 
              whileHover={{ scale: 1.05 }}
              className="px-4 py-2 bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900/50 dark:to-amber-800/50 text-amber-700 dark:text-amber-300 rounded-full text-sm font-medium cursor-pointer transition-all hover:shadow-md"
            >
              Needs Attention
            </motion.span>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 space-y-4"
          >
            <LoadingSpinner />
            <p className="text-slate-600 dark:text-slate-400">Loading your students...</p>
          </motion.div>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-8 border border-red-200 dark:border-red-800"
          >
            <div className="flex items-center justify-center space-x-4">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/50">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
                  Failed to load students
                </h3>
                <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                <button
                  onClick={refreshLearners}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Try Again</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Learners Grid */}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredLearners.length > 0 ? (
                filteredLearners.map((learner, index) => (
              <motion.div
                key={learner.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.02, y: -4 }}
                onClick={() => navigate(`/learners/${learner.id}`)}
                className="glass-card rounded-2xl p-6 cursor-pointer group hover:shadow-xl transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50 hover:border-violet-300 dark:hover:border-violet-600"
              >
                <div className="flex items-center space-x-4 mb-6">
                  {learner.photo ? (
                    <img
                      src={learner.photo}
                      alt={learner.name}
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-violet-200 dark:ring-violet-800"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-blue-100 dark:from-slate-800/60 dark:to-slate-700/60 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      {learner.name}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">Age {learner.age}</p>
                    <span className={cn(
                      "inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 transition-all",
                      learner.status === 'active' && "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300",
                      learner.status === 'new' && "bg-blue-100 dark:bg-slate-800/70 text-blue-700 dark:text-blue-300", 
                      learner.status === 'assessment_due' && "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300",
                      learner.status === 'inactive' && "bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                    )}>
                      {learner.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Neural Progress</span>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{learner.progressPercentage}%</span>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${learner.progressPercentage}%` }}
                        transition={{ delay: index * 0.1 + 0.5, duration: 1, ease: "easeOut" }}
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full relative"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                      </motion.div>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                    <Clock className="h-4 w-4 mr-2" />
                    {formatNextSession(learner.nextSession)}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Goals:</p>
                  </div>
                  <div className="space-y-1">
                    {learner.goals.slice(0, 2).map((goal, goalIndex) => (
                      <p key={goalIndex} className="text-sm text-slate-600 dark:text-slate-400 flex items-start">
                        <Sparkles className="h-3 w-3 mr-2 mt-0.5 text-violet-500 dark:text-violet-400 flex-shrink-0" />
                        <span className="truncate">{goal}</span>
                      </p>
                    ))}
                    {learner.goals.length > 2 && (
                      <p className="text-sm text-violet-600 dark:text-violet-400 font-medium">
                        +{learner.goals.length - 2} more cognitive targets
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
                ))
              ) : (
                // Empty state when no learners match filters
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="col-span-full text-center py-16"
                >
                  <div className="glass-card rounded-2xl p-12 max-w-md mx-auto">
                    <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-blue-100 dark:from-slate-800/60 dark:to-slate-700/60 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Brain className="h-10 w-10 text-violet-600 dark:text-violet-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">No Students Found</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      {searchTerm || selectedStatus !== 'all' 
                        ? 'Try adjusting your search criteria' 
                        : 'Enroll new students to get started'}
                    </p>
                    {(!searchTerm && selectedStatus === 'all') && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg"
                      >
                        Enroll First Learner
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* This empty state is removed since it's now handled within the grid */}
      </div>

      {/* Student Enrollment Modal */}
      <StudentEnrollmentModal
        isOpen={isEnrollmentModalOpen}
        onClose={() => setIsEnrollmentModalOpen(false)}
        onSuccess={() => {
          // Optional: Show success message
          console.log('Student enrolled successfully!');
        }}
      />
    </div>
  );
};