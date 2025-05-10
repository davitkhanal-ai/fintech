import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { authAPI } from '../api';
import { AuthState, User } from '../types';

// Define the shape of the context
interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' };

// Reducer function
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
      };
    default:
      return state;
  }
};

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (username: string, password: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const data = await authAPI.login(username, password);
      console.log('Login data:', JSON.stringify(data, null, 2)); // Log full response

      // Destructure the response
      const {
        tokens,
        message,
        username: name,
        email,
        user_id,
        account_id,
        balance,
      } = data;
      const { access: access_token } = tokens || {}; // Fallback to empty object if tokens is undefined
      console.log('Access token:', access_token);
      console.log('Type of access_token:', typeof access_token);

      // Validate access_token
      if (!access_token) {
        throw new Error('Access token is missing in the API response');
      }

      // Create user object
      const user = {
        id: user_id || null,
        username: name || username, // Fallback to input username if not in response
        email: email || null,
        account_id: account_id || null,
        balance: balance || 0,
      };

      // Store token in localStorage
      if (
        typeof window !== 'undefined' &&
        typeof window.localStorage !== 'undefined'
      ) {
        try {
          localStorage.setItem('token', access_token);
          console.log(
            'Immediate localStorage token:',
            localStorage.getItem('token')
          );
          setTimeout(() => {
            console.log(
              'Delayed localStorage token:',
              localStorage.getItem('token')
            );
          }, 100);
        } catch (e) {
          console.error('localStorage error:', e);
          throw new Error(
            'Failed to store authentication token due to browser restrictions'
          );
        }
      } else {
        throw new Error('localStorage is not available in this environment');
      }

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token: access_token },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };
  // Register function
  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const data = await authAPI.register(username, email, password);
      const { access_token } = data;
      localStorage.setItem('token', access_token);

      // Simulate login after successful registration
      const loginData = await authAPI.login(username, password);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: loginData.user, token: access_token },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  // Check for token and auto-login on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !state.user) {
      // Here we'd normally validate the token or fetch user info
      // For simplicity, we'll just set the authenticated state
      // In a real app, you would make an API call to get the user info
    }
  }, [state.user]);

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Custom hook for using the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
