import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LittleLearner, Session, Activity, Homework, ProgressData } from '../types';

interface DataContextType {
  littleLearners: LittleLearner[];
  sessions: Session[];
  activities: Activity[];
  homework: Homework[];
  progressData: ProgressData[];
  addSession: (session: Omit<Session, 'id'>) => void;
  updateHomework: (id: string, updates: Partial<Homework>) => void;
  getLearnerById: (id: string) => LittleLearner | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [littleLearners] = useState<LittleLearner[]>([
    {
      id: '1',
      name: 'Emma Thompson',
      age: 6,
      photo: 'https://images.pexels.com/photos/1166209/pexels-photo-1166209.jpeg?auto=compress&cs=tinysrgb&w=150',
      status: 'active',
      nextSession: '2025-01-16T10:00:00',
      progressPercentage: 78,
      parentId: '1',
      therapistId: '1',
      goals: ['Improve social communication', 'Develop fine motor skills', 'Increase attention span'],
      achievements: [
        { id: '1', title: 'First successful peer interaction', date: '2025-01-10', domain: 'Social Skills' },
        { id: '2', title: 'Completed puzzle independently', date: '2025-01-08', domain: 'Problem Solving' }
      ]
    },
    {
      id: '2',
      name: 'Lucas Miller',
      age: 8,
      photo: 'https://images.pexels.com/photos/1620653/pexels-photo-1620653.jpeg?auto=compress&cs=tinysrgb&w=150',
      status: 'assessment_due',
      nextSession: '2025-01-16T14:00:00',
      progressPercentage: 65,
      therapistId: '1',
      goals: ['Improve verbal communication', 'Reduce repetitive behaviors'],
      achievements: [
        { id: '3', title: 'Used 3-word sentences', date: '2025-01-12', domain: 'Communication' }
      ]
    }
  ]);

  const [sessions, setSessions] = useState<Session[]>([
    {
      id: '1',
      learnerId: '1',
      therapistId: '1',
      date: '2025-01-16',
      time: '10:00',
      status: 'planned',
      activities: []
    }
  ]);

  const [activities] = useState<Activity[]>([
    {
      id: '1',
      name: 'Picture Matching Game',
      domain: 'Communication',
      duration: 15,
      difficultyLevel: 2,
      materials: ['Picture cards', 'Timer'],
      description: 'Match pictures to improve vocabulary and recognition skills'
    },
    {
      id: '2',
      name: 'Social Story Reading',
      domain: 'Social Skills',
      duration: 20,
      difficultyLevel: 3,
      materials: ['Social story book', 'Visual aids'],
      description: 'Read social stories to practice appropriate social responses'
    },
    {
      id: '3',
      name: 'Fine Motor Practice',
      domain: 'Motor Skills',
      duration: 25,
      difficultyLevel: 2,
      materials: ['Playdough', 'Small tools', 'Beads'],
      description: 'Strengthen hand muscles and improve dexterity'
    }
  ]);

  const [homework, setHomework] = useState<Homework[]>([
    {
      id: '1',
      learnerId: '1',
      title: 'Practice Greeting Phrases',
      description: 'Practice saying "Hello" and "Good morning" with family members',
      dueDate: '2025-01-20',
      status: 'in_progress',
      resources: ['Greeting cards printout'],
      parentNotes: 'Emma is getting better at initiating greetings'
    }
  ]);

  const [progressData] = useState<ProgressData[]>([
    { skillDomain: 'Communication', mastery: 78, promptLevel: 2, date: '2025-01-15' },
    { skillDomain: 'Social Skills', mastery: 65, promptLevel: 3, date: '2025-01-15' },
    { skillDomain: 'Motor Skills', mastery: 82, promptLevel: 1, date: '2025-01-15' },
  ]);

  const addSession = (sessionData: Omit<Session, 'id'>) => {
    const newSession: Session = {
      ...sessionData,
      id: Math.random().toString(36).substr(2, 9)
    };
    setSessions(prev => [...prev, newSession]);
  };

  const updateHomework = (id: string, updates: Partial<Homework>) => {
    setHomework(prev => prev.map(hw => hw.id === id ? { ...hw, ...updates } : hw));
  };

  const getLearnerById = (id: string) => littleLearners.find(learner => learner.id === id);

  return (
    <DataContext.Provider value={{
      littleLearners,
      sessions,
      activities,
      homework,
      progressData,
      addSession,
      updateHomework,
      getLearnerById
    }}>
      {children}
    </DataContext.Provider>
  );
};