import React, { createContext, useContext, useState, useEffect } from 'react';


interface User {
  _id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Student' | 'Staff';
  isFirstLogin?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: any) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('dormease_user');
    const storedToken = localStorage.getItem('dormease_token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }

    setLoading(false);
  }, []);

  const login = (data: { user: User; token: string }) => {
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('dormease_user', JSON.stringify(data.user));
    localStorage.setItem('dormease_token', data.token);
  };


  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('dormease_user');
    localStorage.removeItem('dormease_token');
  };


  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
