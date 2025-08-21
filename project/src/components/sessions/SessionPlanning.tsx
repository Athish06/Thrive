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
    // Add the new session to the top of the list (mock, no backend)
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
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Session Planning</h1>
          <p className="text-muted-foreground text-lg">Plan, review, and manage your upcoming therapy sessions.</p>
        </div>
        <Button className="gap-2" onClick={() => setModalOpen(true)}>
          <Plus className="h-5 w-5" />
          New Session
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map(session => (
          <Card key={session.id} className="therapy-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {session.title}
              </CardTitle>
              <CardDescription>
                {session.date} at {session.time}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-accent" />
                <span className="font-medium text-foreground">{session.learner}</span>
                <Badge variant={session.status === 'Planned' ? 'default' : 'outline'} className={session.status === 'Planned' ? 'bg-accent text-accent-foreground' : ''}>
                  {session.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
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
            </CardContent>
          </Card>
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
