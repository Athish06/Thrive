import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Clock, Plus, ArrowRight, Calendar } from 'lucide-react';
import { useData } from '../../context/DataContext';

const mockLearners = [
  { id: '1', name: 'Emma Johnson' },
  { id: '2', name: 'Liam Smith' },
  { id: '3', name: 'Sophia Davis' },
];

export const TodaysSessions = () => {
  const { sessions } = useData();

  const todaysSessions = sessions.filter((session: any) => {
    const sessionDate = new Date(session.date);
    const today = new Date();
    return sessionDate.toDateString() === today.toDateString();
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0, duration: 0.6 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle>Today's Sessions</CardTitle>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-medium hover:shadow-lg hover:from-violet-700 hover:to-blue-700 transition-all duration-300"
            >
              <Plus className="h-4 w-4" />
              Add Session
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>
        </CardHeader>
        <CardContent>
          {todaysSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todaysSessions.map((session: any, index: number) => {
                const learner = mockLearners?.find((l: any) => l.id === session.learner_id);
                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.1 + index * 0.1, duration: 0.5 }}
                    className="group p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 hover:shadow-lg hover:border-violet-300 dark:hover:border-violet-500 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                        {learner?.name?.charAt(0) || 'L'}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800 dark:text-white text-sm">
                          {learner?.name || 'Unknown Learner'}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {session.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          session.status === 'completed'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : session.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                        }`}>
                        {session.status}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <ArrowRight className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              className="text-center py-12"
            >
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-violet-100 to-blue-100 dark:from-violet-900/30 dark:to-blue-900/30 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-violet-600 dark:text-violet-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-4">No sessions scheduled for today</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-medium hover:shadow-lg hover:from-violet-700 hover:to-blue-700 transition-all duration-300"
              >
                Schedule Your First Session
              </motion.button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
