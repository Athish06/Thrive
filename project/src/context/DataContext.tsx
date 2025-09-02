import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { LittleLearner, Session, Activity, Homework, ProgressData } from '../types';

interface DataContextType {
  littleLearners: LittleLearner[];
  sessions: Session[];
  activities: Activity[];
  homework: Homework[];
  progressData: ProgressData[];
  loading: boolean;
  error: string | null;
  addSession: (session: Omit<Session, 'id'>) => void;
  updateHomework: (id: string, updates: Partial<Homework>) => void;
  getLearnerById: (id: string) => LittleLearner | undefined;
  refreshLearners: () => Promise<void>;
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
  const [littleLearners, setLittleLearners] = useState<LittleLearner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Transform backend student data to frontend LittleLearner format
  const transformStudentData = (student: any): LittleLearner => {
    return {
      id: student.id.toString(),
      name: student.name, // API already provides formatted name
      age: student.age || 0,
      photo: student.photo,
      status: student.status || 'active',
      nextSession: student.nextSession,
      progressPercentage: student.progressPercentage || 0,
      parentId: undefined, // Not provided by current API
      therapistId: student.primaryTherapistId?.toString() || '',
      goals: student.goals || [],
      achievements: [] // Can be added later when available
    };
  };

  // Fetch students from API
  const fetchLearners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user_data');
      
      console.log('=== DEBUG INFO ===');
      console.log('Token exists:', !!token);
      console.log('Token length:', token?.length);
      console.log('User data exists:', !!userData);
      console.log('User data:', userData ? JSON.parse(userData) : null);
      console.log('All localStorage keys:', Object.keys(localStorage));
      
      if (!token) {
        throw new Error('No access token found');
      }

      // First test authentication with a simple endpoint
      console.log('Testing authentication...');
      const authTestResponse = await fetch('http://localhost:8000/api/test-auth', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Auth test response status:', authTestResponse.status);
      if (!authTestResponse.ok) {
        const authError = await authTestResponse.text();
        console.log('Auth test error:', authError);
        throw new Error(`Authentication failed: ${authTestResponse.statusText}`);
      }

      const authResult = await authTestResponse.json();
      console.log('Auth test successful:', authResult);

      console.log('Sending request with token:', token?.substring(0, 20) + '...');

      const response = await fetch('http://localhost:8000/api/students', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error(`Failed to fetch students: ${response.statusText}`);
      }

      const data = await response.json();
      const transformedLearners = data.map(transformStudentData);
      setLittleLearners(transformedLearners);
    } catch (err) {
      console.error('Error fetching learners:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      
      // Fallback to mock data if API fails
      setLittleLearners([
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
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since we want this to be stable

  // Refresh learners function
  const refreshLearners = useCallback(async () => {
    await fetchLearners();
  }, [fetchLearners]);

  // Fetch learners on component mount
  useEffect(() => {
    fetchLearners();
  }, [fetchLearners]);

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
      loading,
      error,
      addSession,
      updateHomework,
      getLearnerById,
      refreshLearners
    }}>
      {children}
    </DataContext.Provider>
  );
};