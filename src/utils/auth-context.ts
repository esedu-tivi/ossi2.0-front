// auth-context.ts works with auth-provider.tsx retaining user authentication state data

import { createContext, useContext } from "react";

// AuthContextProps interface. Data can be sent to other components
interface AuthContextProps {
  isAuthenticated: boolean;
  userEmail: string;
  role: 'teacher' | 'student' | 'unknown';
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setUserEmail: (email: string) => void;
  setRole: (role: 'teacher' | 'student' | 'unknown') => void;
}

const AuthContext = createContext<AuthContextProps>({
  // Default parameters
  isAuthenticated: false,
  userEmail: "",
  role: 'unknown',

  // Placeholders for auth-provider functions
  setIsAuthenticated: () => {},
  setUserEmail: () => {},
  setRole: () => {},
});

// Wraps useContext(AuthContext) hook so it can be used easily on other components
export const useAuth = () => useContext(AuthContext);

export default AuthContext;

