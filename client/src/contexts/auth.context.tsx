import { useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { useLoginMutation, useMeQuery, User } from '@/types/graphql-generated';
import { AuthContext, AuthContextType } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [loginMutation] = useLoginMutation();
  const { data: meData } = useMeQuery();

  useEffect(() => {
    if (!meData) return;
    const fetchUser = async () => {
      setUser(meData.me as User);
      setIsLoading(false);
    };
    fetchUser();
  }, [meData]);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const { data } = await loginMutation({
          variables: {
            input: {
              email,
              password,
            },
          },
        });

        if (data?.login) {
          setUser(data.login.user as User);
        }
        return data?.login.user.role;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Une erreur est survenue lors de la connexion',
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [loginMutation, setUser, setIsLoading, setError],
  );

  const logout = useCallback(() => {
    setUser(null);
    // Then i will remove the token from the backend in a other PR too not make to much 🦉
  }, [setUser]);

  const contextValue = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      error,
      login,
      logout,
    }),
    [user, isLoading, error, login, logout],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export { AuthContext };
export type { AuthContextType };
