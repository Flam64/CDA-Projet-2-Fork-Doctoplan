import { createContext } from 'react';
import { User } from '@/types/graphql-generated';

export type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<string | undefined>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
