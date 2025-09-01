import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Users, Target, StickyNote } from 'lucide-react';

interface QuickActionsProps {
  onOpenNotesViewer: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onOpenNotesViewer }) => {
  const carouselItems = [
    {
      title: 'View Notes',
      description: 'Review session notes',
      id: 4,
      icon: <StickyNote className="w-6 h-6" />,
      action: onOpenNotesViewer,
    },
    {
      title: 'Add Learner',
      description: 'Enroll participant',
      id: 3,
      icon: <Users className="w-6 h-6" />,
      action: () => console.log('Add learner'),
    },
    {
      title: 'Quick Report',
      description: 'Generate insights',
      id: 5,
      icon: <Target className="w-6 h-6" />,
      action: () => console.log('Quick report'),
    },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.7, duration: 0.6 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle>Quick Actions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            {carouselItems.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={item.action}
                className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 hover:shadow-lg hover:border-violet-300 dark:hover:border-violet-500 transition-all duration-300 text-left"
              >
                <div className="flex-shrink-0 p-2 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 text-white">
                  {item.icon}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white text-sm">{item.title}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{item.description}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
