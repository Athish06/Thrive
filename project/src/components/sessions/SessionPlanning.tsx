import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Calendar, Users, BookOpen, Plus, Clock, FileText } from 'lucide-react';
import { SessionAddModal } from './SessionAddModal';

const mockSessions = [
  {
    id: '1',
    title: 'Speech Therapy - Emma Johnson',
    date: '2025-08-21',
    time: '10:00 AM',
    learner: 'Emma Johnson',
    status: 'Planned',
    notes: 'Focus on greeting phrases and turn-taking.'
  },
  {
    id: '2',
    title: 'Occupational Therapy - Liam Chen',
    date: '2025-08-21',
    time: '11:30 AM',
    learner: 'Liam Chen',
    status: 'Planned',
    notes: 'Fine motor skills and sensory play.'
  },
  {
    id: '3',
    title: 'Behavioral Session - Sophia Davis',
    date: '2025-08-22',
    time: '2:00 PM',
    learner: 'Sophia Davis',
    status: 'Draft',
    notes: 'Work on following instructions.'
  }
];

export const SessionPlanning: React.FC = () => {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [sessions, setSessions] = React.useState(mockSessions);

  const handleAddSession = (session: any) => {
    setSessions(prev => [
      {
        id: (prev.length + 1).toString(),
        title: `${session.activities[0]} - ${session.learner}`,
        date: session.date,
        time: session.time,
        learner: session.learner,
        status: 'Planned',
        notes: 'New session added.'
      },
      ...prev
    ]);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-white dark:bg-black p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">Session Planning</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Plan, review, and manage your upcoming therapy sessions.</p>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300" onClick={() => setModalOpen(true)}>
          <Plus className="h-5 w-5" />
          New Session
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map(session => (
          <div key={session.id} className="rounded-2xl p-6 cursor-pointer group hover:shadow-xl transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50 hover:border-violet-300 dark:hover:border-violet-600 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              <span className="text-lg font-semibold text-slate-800 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{session.title}</span>
            </div>
            <div className="text-slate-600 dark:text-slate-400 mb-2 text-sm">{session.date} at {session.time}</div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-slate-800 dark:text-white">{session.learner}</span>
              <span className={
                session.status === 'Planned'
                  ? "inline-block px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
                  : "inline-block px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300"
              }>
                {session.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm mb-2">
              <FileText className="h-4 w-4" />
              <span>{session.notes}</span>
            </div>
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="outline" className="gap-1">
                <BookOpen className="h-4 w-4" />
                View Plan
              </Button>
              <Button size="sm" variant="outline" className="gap-1">
                <Clock className="h-4 w-4" />
                Reschedule
              </Button>
            </div>
          </div>
        ))}
      </div>

      <SessionAddModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAddSession}
      />
    </div>
  );
};

export default SessionPlanning;
