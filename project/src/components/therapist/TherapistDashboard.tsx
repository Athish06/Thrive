import * as React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

import { Calendar, Users, TrendingUp, Plus, Clock, CheckCircle } from 'lucide-react';
import { SessionAddModal } from '../sessions/SessionAddModal';

const TherapistDashboard: React.FC = () => {
  const { user } = useAuth();
  const { littleLearners, sessions } = useData();

  const [modalOpen, setModalOpen] = React.useState(false);

  const todaysSessions = sessions.filter(session => {
    const today = new Date().toISOString().split('T')[0];
    return session.date === today;
  });

  const activeLearners = littleLearners.filter(learner => learner.status === 'active');
  const thisWeekSessions = sessions.length; // Simplified for demo

  const stats = [
    {
      title: 'Total Little Learners',
      value: littleLearners.length,
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Today\'s Sessions',
      value: todaysSessions.length,
      icon: Calendar,
      color: 'green'
    },
    {
      title: 'This Week\'s Sessions',
      value: thisWeekSessions,
      icon: Clock,
      color: 'purple'
    },
    {
      title: 'Average Progress',
      value: '78%',
      icon: TrendingUp,
      color: 'orange'
    }
  ];

  const recentActivities = [
    {
      id: '1',
      learnerName: 'Emma Thompson',
      activity: 'Completed communication assessment',
      time: '2 hours ago',
      type: 'assessment'
    },
    {
      id: '2',
      learnerName: 'Lucas Miller',
      activity: 'Session plan updated with new activities',
      time: '4 hours ago',
      type: 'planning'
    },
    {
      id: '3',
      learnerName: 'Emma Thompson',
      activity: 'Homework assigned: Practice greeting phrases',
      time: '1 day ago',
      type: 'homework'
    }
  ];

  // Optionally, you can share the same handler as SessionPlanning, or just open the modal here
  const handleAddSession = (session: any) => {
    // You can implement logic to add the session to global state or show a toast, etc.
    setModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-blue-100 text-lg">Ready to make a difference in your little learners' lives today?</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-gray-600">{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" onClick={() => setModalOpen(true)}>
              <Plus className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Plan New Session</span>
            </button>
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium">View Reports</span>
            </button>
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Users className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Add Little Learner</span>
            </button>
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <span className="font-medium">Progress Review</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'assessment' ? 'bg-blue-500' :
                  activity.type === 'planning' ? 'bg-green-500' : 'bg-orange-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.learnerName}</p>
                  <p className="text-sm text-gray-600">{activity.activity}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today's Sessions Preview */}
      {todaysSessions.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Today's Upcoming Sessions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todaysSessions.slice(0, 3).map((session) => {
              const learner = littleLearners.find(l => l.id === session.learnerId);
              return (
                <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    {learner?.photo && (
                      <img
                        src={learner.photo}
                        alt={learner.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900">{learner?.name}</h3>
                      <p className="text-sm text-gray-500">{session.time}</p>
                    </div>
                  </div>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    session.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                    session.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {session.status.replace('_', ' ')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <SessionAddModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAddSession}
      />
    </div>
  );
};

export default TherapistDashboard;