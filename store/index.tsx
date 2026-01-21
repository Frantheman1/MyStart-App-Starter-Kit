/**
 * Global Store
 * 
 * Lightweight global state management using React Context.
 * Can be replaced with Zustand, Redux, or other solutions as needed.
 * 
 * Usage:
 *   const { state, dispatch } = useStore();
 *   dispatch({ type: 'SET_USER', payload: user });
 */

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Define your global state shape
export interface GlobalState {
  user: {
    id: string | null;
    email: string | null;
    name: string | null;
    isAuthenticated: boolean;
  };
  ui: {
    isLoading: boolean;
    theme: 'light' | 'dark' | 'system';
  };
  // Add more state slices as needed
}

// Define action types
export type Action =
  | { type: 'SET_USER'; payload: Partial<GlobalState['user']> }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_THEME'; payload: GlobalState['ui']['theme'] }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: GlobalState = {
  user: {
    id: null,
    email: null,
    name: null,
    isAuthenticated: false,
  },
  ui: {
    isLoading: false,
    theme: 'system',
  },
};

// Reducer function
function globalReducer(state: GlobalState, action: Action): GlobalState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
          isAuthenticated: true,
        },
      };
    case 'LOGOUT':
      return {
        ...state,
        user: {
          id: null,
          email: null,
          name: null,
          isAuthenticated: false,
        },
      };
    case 'SET_LOADING':
      return {
        ...state,
        ui: {
          ...state.ui,
          isLoading: action.payload,
        },
      };
    case 'SET_THEME':
      return {
        ...state,
        ui: {
          ...state.ui,
          theme: action.payload,
        },
      };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

// Create context
interface StoreContextType {
  state: GlobalState;
  dispatch: React.Dispatch<Action>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Provider component
export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(globalReducer, initialState);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

// Hook to use the store
export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}

// Selectors (helper hooks for specific state slices)
export function useUser() {
  const { state } = useStore();
  return state.user;
}

export function useUI() {
  const { state } = useStore();
  return state.ui;
}

export function useIsAuthenticated() {
  const { state } = useStore();
  return state.user.isAuthenticated;
}
