import * as React from 'react';
import { Hero } from './Hero';
import { QuickActions } from './QuickActions';
import { Calendar } from './Calendar';
import { RecentActivity } from './RecentActivity';
import { TodaysSessions } from './TodaysSessions';
import { NotesViewer } from './NotesViewer';

const TherapistDashboard: React.FC = () => {
  const [notesViewerOpen, setNotesViewerOpen] = React.useState(false);

  return (
    <div className="space-y-8">
      <Hero />
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-4 space-y-6">
          <QuickActions onOpenNotesViewer={() => setNotesViewerOpen(true)} />
          <TodaysSessions />
                  </div>
        <div className="xl:col-span-5">
          <Calendar />
        </div>
        <div className="xl:col-span-3 space-y-4">
          <RecentActivity />
        </div>
      </div>
      <NotesViewer open={notesViewerOpen} onOpenChange={setNotesViewerOpen} />
    </div>
  );
};

export default TherapistDashboard;
