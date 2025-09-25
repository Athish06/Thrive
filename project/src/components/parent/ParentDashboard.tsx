import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Trophy, BookOpen, Target, Star, CheckCircle, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import SplitText from '../ui/SplitText';

interface ParentDashboardProps {
  isProfileOpen: boolean;
}

interface ChildData {
  id: number;
  name: string;
  age: number;
  status: string;
  diagnosis?: string;
  therapist_name?: string;
  progress_percentage?: number;
  next_session?: string;
  goals?: string[];
  achievements?: any[];
}

interface ParentData {
  id: number;
  user_id: number;
  parent_first_name: string;
  parent_last_name: string;
  child_first_name: string;
  child_last_name: string;
  child_dob: string;
  child_id: number;
  email: string;
  phone: string;
  alternate_phone?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  relation_to_child: string;
  is_verified: boolean;
  created_at: string;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ isProfileOpen }) => {
  const { user } = useAuth();
  const [child, setChild] = React.useState<ChildData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isProfileOpen) {
      console.log('Profile dropdown is open in ParentDashboard');
    }
  }, [isProfileOpen]);

  // Function to get child ID and details from parent profile and children table
  const getChildDataFromDatabase = async (): Promise<{ childData: ChildData | null, parentData: ParentData | null }> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token || !user?.id) {
        console.log('No token or user ID available');
        return { childData: null, parentData: null };
      }

      console.log('Fetching parent profile to get child ID...');
      const parentResponse = await fetch(`http://localhost:8000/api/parent-details/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!parentResponse.ok) {
        console.log('Failed to fetch parent details');
        return { childData: null, parentData: null };
      }

      const parentData = await parentResponse.json();
      console.log('Parent data fetched:', parentData);

      // Store parent information
      const parentInfo: ParentData = {
        id: parentData.id,
        user_id: parentData.user_id,
        parent_first_name: parentData.parent_first_name,
        parent_last_name: parentData.parent_last_name,
        child_first_name: parentData.child_first_name,
        child_last_name: parentData.child_last_name,
        child_dob: parentData.child_dob,
        child_id: parentData.child_id,
        email: parentData.email,
        phone: parentData.phone,
        alternate_phone: parentData.alternate_phone,
        address_line1: parentData.address_line1,
        address_line2: parentData.address_line2,
        city: parentData.city,
        state: parentData.state,
        postal_code: parentData.postal_code,
        country: parentData.country,
        relation_to_child: parentData.relation_to_child,
        is_verified: parentData.is_verified,
        created_at: parentData.created_at
      };

      // Get child ID from parent profile
      const childId = parentData.child_id;
      if (!childId) {
        console.log('No child ID found in parent profile');
        return { childData: null, parentData: parentInfo };
      }

      console.log('Found child ID:', childId, 'Now fetching child details...');

      // Get actual child details from children table using child_id
      const childResponse = await fetch(`http://localhost:8000/api/children/${childId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!childResponse.ok) {
        console.error('Failed to fetch child details:', childResponse.status);
        return { childData: null, parentData: parentInfo };
      }

      const childData = await childResponse.json();
      console.log('Child data fetched:', childData);

      return { childData, parentData: parentInfo };

    } catch (error) {
      console.error('Error getting data from database:', error);
      return { childData: null, parentData: null };
    }
  };

  React.useEffect(() => {
    const fetchChildData = async () => {
      if (!user?.id) {
        console.log('No user ID available');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Get child data and parent info using parent's child_id
        const { childData, parentData } = await getChildDataFromDatabase();
        
        if (childData) {
          setChild(childData);
          console.log('Complete child data loaded:', childData);
        } else {
          setError('Unable to find child information. Please contact support.');
        }

        console.log('Parent info loaded:', parentData);
        
      } catch (error) {
        console.error('Error in data fetching:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch data');
        setChild(null);
      } finally {
        setLoading(false);
      }
    };

    fetchChildData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="text-red-800 font-semibold">Error Loading Child Information</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-6 w-6 text-yellow-600" />
          <div>
            <h3 className="text-yellow-800 font-semibold">No Child Information Found</h3>
            <p className="text-yellow-600">Please complete your registration or contact support.</p>
          </div>
        </div>
      </div>
    );
  }

  const upcomingSession = child.next_session ? new Date(child.next_session) : null;

  return (
    <div className="min-h-screen relative overflow-hidden bg-white dark:bg-black">
      {/* Floating orbs background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 space-y-8 p-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative p-6"
        >
          <div className="relative flex justify-between items-center">
            <SplitText 
              tag="h1"
              text={`Welcome back, ${user?.name?.split(' ')[0] || 'Parent'}`}
              className="text-4xl font-bold text-foreground"
              textAlign="left"
            />
            <div className="hidden md:flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                {child.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-muted-foreground text-xl mt-2"
          >
          </motion.p>
        </motion.div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Left Column - Child Profile & Stats */}
          <div className="xl:col-span-5 space-y-6">
            {/* Child Profile Card */}
            <div className="glass-card rounded-2xl p-6 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  {child.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{child.name}</h2>
                  <p className="text-slate-600 dark:text-slate-400">Age {child.age}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {child.progress_percentage || 0}% Overall Progress
                    </span>
                  </div>
                </div>
              </div>

              {/* Child Details */}
              <div className="grid grid-cols-1 gap-4">
                {child.diagnosis && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <h3 className="font-semibold text-slate-800 dark:text-white text-sm">Diagnosis</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">{child.diagnosis}</p>
                  </div>
                )}
                {child.therapist_name && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <h3 className="font-semibold text-slate-800 dark:text-white text-sm">Therapist</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">{child.therapist_name}</p>
                  </div>
                )}
                {child.status && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <h3 className="font-semibold text-slate-800 dark:text-white text-sm">Status</h3>
                    <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {child.status}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-card rounded-2xl p-4 text-center backdrop-blur-xl bg-gradient-to-br from-green-50/90 to-emerald-50/90 dark:from-green-900/20 dark:to-emerald-900/20">
                <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">Achievements</h3>
                <p className="text-2xl font-bold text-green-600">{child.achievements?.length || 0}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">This month</p>
              </div>
              <div className="glass-card rounded-2xl p-4 text-center backdrop-blur-xl bg-gradient-to-br from-blue-50/90 to-indigo-50/90 dark:from-blue-900/20 dark:to-indigo-900/20">
                <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">Active Goals</h3>
                <p className="text-2xl font-bold text-blue-600">{child.goals?.length || 0}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">In progress</p>
              </div>
              <div className="glass-card rounded-2xl p-4 text-center backdrop-blur-xl bg-gradient-to-br from-orange-50/90 to-amber-50/90 dark:from-orange-900/20 dark:to-amber-900/20">
                <BookOpen className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">Sessions</h3>
                <p className="text-2xl font-bold text-orange-600">2</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">This week</p>
              </div>
            </div>
          </div>

          {/* Middle Column - Next Session */}
          <div className="xl:col-span-4 space-y-6">
            <div className="glass-card rounded-2xl p-6 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 h-fit">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Next Session</h3>
              </div>
              {upcomingSession ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-slate-800 dark:text-white">
                        {upcomingSession.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </h4>
                      <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                        {upcomingSession.toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      with {child.therapist_name || 'Your Therapist'}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                    <p className="text-sm font-bold text-slate-800 dark:text-white mb-3">Planned Activities:</p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                        <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                        <span>Communication exercises</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                        <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                        <span>Fine motor skill development</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Social interaction practice</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-medium">No upcoming sessions</p>
                  <p className="text-sm text-slate-500 mt-1">Contact your therapist to schedule</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Achievements & Goals */}
          <div className="xl:col-span-3 space-y-6">
            {/* Recent Achievements */}
            <div className="glass-card rounded-2xl p-4 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80">
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Trophy className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Achievements</h3>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {child.achievements && child.achievements.length > 0 ? (
                  child.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gradient-to-r from-yellow-50/80 to-orange-50/80 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200/50 dark:border-yellow-700/50">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white text-sm">{achievement.title || 'Achievement'}</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{achievement.domain || 'General Progress'}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {achievement.date ? new Date(achievement.date).toLocaleDateString() : 'Recent'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                      <Trophy className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">No achievements yet</p>
                    <p className="text-xs text-slate-500 mt-1">Keep working towards goals!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Current Goals */}
            <div className="glass-card rounded-2xl p-4 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80">
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Goals</h3>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {child.goals && child.goals.length > 0 ? (
                  child.goals.map((goal, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200/50 dark:border-purple-700/50">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      <span className="text-slate-800 dark:text-white text-sm font-medium">{goal}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                      <Target className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">No active goals</p>
                    <p className="text-xs text-slate-500 mt-1">Goals will be set during sessions</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Progress Summary */}
        <div className="glass-card rounded-2xl p-6 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Progress Summary</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300 font-medium">Overall Progress</span>
                <span className="font-bold text-green-600 text-2xl">{child.progress_percentage || 0}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500 shadow-sm" 
                  style={{ width: `${child.progress_percentage || 0}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Regular attendance and participation</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Consistent engagement with activities</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Positive response to therapy interventions</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};