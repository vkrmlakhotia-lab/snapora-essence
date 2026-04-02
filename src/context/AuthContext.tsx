import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (provider: 'google' | 'apple') => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('snaporia_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const signIn = (provider: 'google' | 'apple') => {
    const mockUser: User = {
      name: provider === 'google' ? 'Alex Johnson' : 'Alex J.',
      email: provider === 'google' ? 'alex@gmail.com' : 'alex@icloud.com',
    };
    setUser(mockUser);
    localStorage.setItem('snaporia_user', JSON.stringify(mockUser));
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('snaporia_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
