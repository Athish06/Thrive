import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
  isAuthenticated: boolean;
  fetchUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user_data');
    const token = localStorage.getItem('access_token');
    return savedUser && token ? JSON.parse(savedUser) : null;
  });

  const fetchUserProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await fetch('http://localhost:8000/api/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const profileData = await response.json();
      
      // Update user with profile information
      setUser(currentUser => {
        if (currentUser) {
          const updatedUser: User = {
            ...currentUser,
            name: profileData.name || profileData.email, // Use name from /api/me response
            // Add other profile fields as needed
          };
          
          localStorage.setItem('user_data', JSON.stringify(updatedUser));
          return updatedUser;
        }
        return currentUser;
      });
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  }, []); // Remove user dependency to prevent infinite loop

  // Fetch profile data when component mounts if user exists and name is not set
  React.useEffect(() => {
    if (user && user.name === user.email) {
      fetchUserProfile();
    }
  }, [user?.id, fetchUserProfile]); // Only depend on user.id to prevent infinite loop

  const login = async (email: string, password: string) => {
    try {
      // Send login request to backend API
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const loginData = await response.json();
      
      // Store JWT token and user data
      localStorage.setItem('access_token', loginData.access_token);
      localStorage.setItem('user_data', JSON.stringify(loginData.user));
      
      // Convert backend user format to frontend User type
      const frontendUser: User = {
        id: loginData.user.id.toString(),
        name: loginData.user.email, // Temporary, will be updated by profile fetch
        email: loginData.user.email,
        role: loginData.user.role,
        // Add other fields as needed
      };
      
      setUser(frontendUser);
      
      // Fetch profile data to get the real name
      try {
        const profileResponse = await fetch('http://localhost:8000/api/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${loginData.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          const updatedUser: User = {
            ...frontendUser,
            name: profileData.name || profileData.email, // Use name from /api/me response
          };
          
          setUser(updatedUser);
          localStorage.setItem('user_data', JSON.stringify(updatedUser));
        }
      } catch (profileError) {
        console.warn('Could not fetch profile data:', profileError);
        // Continue with basic user data if profile fetch fails
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user_data');
    localStorage.removeItem('access_token');
  };

  const register = async (userData: Partial<User> & { password: string }) => {
    try {
      // Send registration request to backend API
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: userData.name?.split(' ')[0] || '',
          lastName: userData.name?.split(' ')[1] || '',
          email: userData.email,
          password: userData.password,
          role: userData.role || 'parent',
          phone: userData.phone,
          address: userData.address,
          emergencyContact: userData.emergencyContact
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      const registrationData = await response.json();
      
      // Convert backend user format to frontend User type
      const newUser: User = {
        id: registrationData.id.toString(),
        name: registrationData.email, // We'll use email as name for now
        email: registrationData.email,
        role: registrationData.role,
        phone: userData.phone,
        address: userData.address,
        emergencyContact: userData.emergencyContact,
      };
      
      setUser(newUser);
      localStorage.setItem('user_data', JSON.stringify(registrationData));
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isAuthenticated, fetchUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};