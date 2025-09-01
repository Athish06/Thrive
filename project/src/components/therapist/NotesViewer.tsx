import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Calendar as CalendarIcon, Brain, FileText } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

// Mock data for notes with timestamps and severity
const mockNotes: Record<string, { 
  id: number; 
  learner: string; 
  content: string; 
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}[]> = {
  '2023-10-10': [
    { 
      id: 1, 
      learner: 'Emma Johnson', 
      content: 'Made significant progress in emotional regulation exercises. Showed improved understanding of breathing techniques and was able to implement them during our role-play scenarios.',
      timestamp: '09:30',
      severity: 'medium'
    },
    { 
      id: 2, 
      learner: 'Liam Smith', 
      content: 'Responded well to the new visual aids. Particularly engaged with the color-coded emotion cards.',
      timestamp: '14:15',
      severity: 'low'
    },
  ],
  '2023-10-15': [
    { 
      id: 3, 
      learner: 'Sophia Davis', 
      content: 'Showed improved focus during the session. Completed all tasks without requiring redirection.',
      timestamp: '10:45',
      severity: 'low'
    },
  ],
  '2023-10-25': [
    { 
      id: 4, 
      learner: 'Emma Johnson', 
      content: 'Practiced social interaction scenarios. Had difficulty with eye contact but showed improvement by end of session.',
      timestamp: '11:20',
      severity: 'high'
    },
    { 
      id: 5, 
      learner: 'Sophia Davis', 
      content: 'Completed all assigned tasks successfully. Ready to move to next difficulty level.',
      timestamp: '15:30',
      severity: 'low'
    },
  ],
};

interface NotesViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NotesViewer: React.FC<NotesViewerProps> = ({ open, onOpenChange }) => {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);

  // Convert selected date to string for notes lookup
  const selectedDateStr = selectedDate ? 
    `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}` 
    : null;

  const selectedNotes = selectedDateStr ? mockNotes[selectedDateStr] || [] : [];

  return (
    <AnimatePresence>
      {open && (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
          <Dialog.Portal forceMount>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            </motion.div>
            <Dialog.Content asChild>
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="fixed inset-0 z-50 m-auto flex flex-col h-fit max-h-[95vh] w-[95vw] max-w-6xl rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/30 dark:border-slate-700/50 shadow-2xl overflow-hidden"
              >
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
                    className="absolute bottom-10 left-10 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 blur-2xl"
                  />
                </div>

                {/* Header */}
                <div className="relative z-10 flex items-center justify-between p-8 border-b border-slate-200/50 dark:border-slate-700/50">
                  <Dialog.Title className="flex items-center gap-4 text-2xl font-bold text-slate-800 dark:text-white">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white">
                      <Brain className="h-6 w-6" />
                    </div>
                    <div>
                      Neural Session Notes
                      <p className="text-sm font-normal text-slate-600 dark:text-slate-400 mt-1">
                        Cognitive Enhancement Archive
                      </p>
                    </div>
                  </Dialog.Title>
                  
                  <Dialog.Close asChild>
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200/50 dark:border-slate-700/50"
                    >
                      <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </motion.button>
                  </Dialog.Close>
                </div>

                {/* Content */}
                <div className="relative z-10 flex-1 overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
                    {/* Calendar */}
                    <div className="lg:col-span-2 p-6">
                      <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md"
                        classNames={{
                          months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                          month: 'space-y-4',
                          caption: 'flex justify-center pt-1 relative items-center',
                          caption_label: 'text-sm font-medium',
                          nav: 'space-x-1 flex items-center',
                          nav_button: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                          nav_button_previous: 'absolute left-1',
                          nav_button_next: 'absolute right-1',
                          table: 'w-full border-collapse space-y-1',
                          head_row: 'flex',
                          head_cell: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
                          row: 'flex w-full mt-2',
                          cell: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                          day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100',
                          day_selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                          day_today: 'bg-accent text-accent-foreground',
                          day_outside: 'text-muted-foreground opacity-50',
                          day_disabled: 'text-muted-foreground opacity-50',
                          day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
                          day_hidden: 'invisible',
                        }}
                      />
                    </div>

                    {/* Notes Panel */}
                    <div className="border-l border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-slate-50/50 to-white/50 dark:from-slate-800/50 dark:to-slate-900/50">
                      <div className="p-6 h-full flex flex-col">
                        {selectedDateStr ? (
                          <>
                            <div className="flex items-center gap-3 mb-6">
                              <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                                <FileText className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-slate-800 dark:text-white">
                                  {selectedDate?.toLocaleDateString('en-US', { 
                                    month: 'long', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                  })}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  {selectedNotes.length} session note{selectedNotes.length !== 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto space-y-4">
                              <AnimatePresence>
                                {selectedNotes.map((note, index) => (
                                  <motion.div
                                    key={note.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="p-4 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50"
                                  >
                                    <div className="flex items-center gap-3 mb-3">
                                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                                        {note.learner.charAt(0)}
                                      </div>
                                      <div>
                                        <p className="font-semibold text-slate-800 dark:text-white text-sm">
                                          {note.learner}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                          Neural Session Note
                                        </p>
                                      </div>
                                    </div>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                      {note.content}
                                    </p>
                                  </motion.div>
                                ))}
                              </AnimatePresence>
                              
                              {selectedNotes.length === 0 && (
                                <div className="text-center py-8">
                                  <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                                    <FileText className="h-8 w-8 text-slate-400" />
                                  </div>
                                  <p className="text-slate-500 dark:text-slate-400">No notes for this date</p>
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="flex-1 flex items-center justify-center text-center">
                            <div>
                              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-violet-100 to-blue-100 dark:from-violet-900/30 dark:to-blue-900/30 flex items-center justify-center mx-auto mb-4">
                                <CalendarIcon className="h-10 w-10 text-violet-600 dark:text-violet-400" />
                              </div>
                              <h3 className="font-semibold text-slate-800 dark:text-white mb-2">
                                Select a Date
                              </h3>
                              <p className="text-slate-600 dark:text-slate-400 text-sm">
                                Click on a calendar date to view session notes
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </AnimatePresence>
  );
};
