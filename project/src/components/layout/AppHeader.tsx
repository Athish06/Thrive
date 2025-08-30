import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Stethoscope, Calendar, Bell, User, LogOut, Settings } from 'lucide-react';
import { TodaysSessionsModal } from '../therapist/TodaysSessionsModal';

export const AppHeader: React.FC = () => {
  const { user, logout, fetchUserProfile } = useAuth();
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch user profile on component mount if user exists but name is just email
  useEffect(() => {
    if (user && user.name === user.email) {
      fetchUserProfile();
    }
  }, [user, fetchUserProfile]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">ThrivePath</h1>
              <p className="text-xs text-gray-500">Therapy Planner</p>
            </div>
          </div>

          {/* Center Actions */}
          <div className="flex items-center space-x-4">
            {user?.role === 'therapist' && (
              <button
                onClick={() => setShowSessionsModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Today's Sessions</span>
              </button>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <Bell className="h-5 w-5" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user?.name || user?.email || 'User'}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user?.role}
                      {user?.role === 'therapist' && (
                        <span className="ml-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                          Therapist
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-dropdown-in">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.name || user?.email || 'User'}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                  <button className="flex items-center space-x-2 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showSessionsModal && (
        <TodaysSessionsModal onClose={() => setShowSessionsModal(false)} />
      )}

      <style>{`
        @keyframes dropdown-in {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-dropdown-in {
          animation: dropdown-in 0.2s ease-out;
        }
      `}</style>
    </header>
  );
};