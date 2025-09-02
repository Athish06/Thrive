import { useState, useEffect } from 'react';
import { Users, StickyNote, CalendarPlus } from 'lucide-react';
import ConcentricCircleIcon from '../ui/ConcentricCircleIcon';
import HorizontalDropdown from '../ui/HorizontalDropdown';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { StudentEnrollmentModal } from './StudentEnrollmentModal';
import { useTheme } from '../../hooks/useTheme';

interface QuickActionsProps {
  onOpenNotesViewer: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onOpenNotesViewer }) => {
  const { theme: appTheme } = useTheme();
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  
  useEffect(() => {
    if (appTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setEffectiveTheme(systemTheme);

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        setEffectiveTheme(e.matches ? 'dark' : 'light');
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      setEffectiveTheme(appTheme);
    }
  }, [appTheme]);


  const menuItems = [
    {
      label: 'View Notes',
      action: onOpenNotesViewer,
      icon: <StickyNote className="w-5 h-5" />,
    },
    {
      label: 'Add Learner',
      action: () => setIsEnrollmentModalOpen(true),
      icon: <Users className="w-5 h-5" />,
    },
    {
      label: 'Add Session',
      action: () => console.log('Add session for any date'),
      icon: <CalendarPlus className="w-5 h-5" />,
    },
  ];

  return (
    <div className="relative flex items-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <HorizontalDropdown
                items={menuItems}
                theme={effectiveTheme}
                button={
                  <button className="group p-3 rounded-full transition-all duration-200 hover:scale-105 relative">
                    {/* Simple hover background */}
                    <div className="absolute inset-0 rounded-full bg-slate-100/50 dark:bg-slate-800/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    
                    {/* Light border on hover */}
                    <div className="absolute inset-0 rounded-full border border-transparent group-hover:border-slate-300/50 dark:group-hover:border-slate-600/50 transition-colors duration-200" />
                    
                    {/* Icon */}
                    <div className="relative z-10">
                      <ConcentricCircleIcon className="w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-200" />
                    </div>
                  </button>
                }
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <span>Quick Actions</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Student Enrollment Modal */}
      <StudentEnrollmentModal
        isOpen={isEnrollmentModalOpen}
        onClose={() => setIsEnrollmentModalOpen(false)}
        onSuccess={() => {
          // Optional: Add success callback
          console.log('Student enrolled successfully!');
        }}
      />
    </div>
  );
};
