import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('billing_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On mount, if we have a token, we might want to fetch user profile
    // For now, we'll just assume we're logged in if a token exists
    const storedUser = localStorage.getItem('billing_user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, [token]);

  const loginUser = (userData, userToken) => {
    localStorage.setItem('billing_token', userToken);
    localStorage.setItem('billing_user', JSON.stringify(userData));
    setToken(userToken);
    setUser(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem('billing_token');
    localStorage.removeItem('billing_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, loginUser, logoutUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
