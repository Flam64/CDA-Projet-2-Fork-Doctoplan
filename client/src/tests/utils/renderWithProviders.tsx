import React from 'react';

// Importe la fonction "render" de React Testing Library, qui permet de "monter" un composant dans un test
import { render } from '@testing-library/react';

// Importe "MockedProvider" pour simuler les requêtes GraphQL dans les tests
import { MockedProvider, MockedResponse } from '@apollo/client/testing';

// MemoryRouter permet de simuler un environnement de navigation (React Router) dans les tests
import { MemoryRouter } from 'react-router-dom';

// Importe le contexte d'authentification (AuthContext), pour fournir une fausse authentification aux composants
import { AuthContext } from '@/contexts/auth.context';

// Type d'un utilisateur, utilisé pour typer les données de test
import { User } from '@/types/graphql-generated';

// 🔧 Options qu'on peut passer à la fonction renderWithProviders
type RenderWithProvidersOptions = {
  mocks?: MockedResponse[]; // Mocks des requêtes GraphQL si le composant utilise Apollo Client
  user?: User; // Utilisateur "fictif" à passer dans le contexte d'auth
  isAuthenticated?: boolean; // Est-ce que l'utilisateur est considéré comme connecté ?
  isLoading?: boolean; // Est-ce que le chargement est en cours ?
  route?: string; // URL simulée pour MemoryRouter (utile pour les tests de navigation)
};

// 📦 Fonction personnalisée pour "rendre" un composant avec tous les fournisseurs nécessaires (Apollo + Auth + Router)
export function renderWithProviders(
  component: React.ReactElement, // Le composant React à tester
  {
    mocks = [], // Par défaut : aucune requête mockée
    user, // Par défaut : pas d'utilisateur
    isAuthenticated = true, // Par défaut : l'utilisateur est connecté
    isLoading = false, // Par défaut : pas de chargement en cours
    route = '/', // Par défaut : route d'accueil "/"
  }: RenderWithProvidersOptions = {}, // Les options sont facultatives
) {
  return render(
    // MockedProvider permet de simuler les réponses GraphQL (Apollo Client)
    <MockedProvider mocks={mocks} addTypename={false}>
      {/* Fournit un contexte d'authentification fictif aux composants */}
      <AuthContext.Provider
        value={{
          user: user || null, // Utilisateur fictif ou null
          isAuthenticated, // Simule l'état connecté/déconnecté
          isLoading, // Simule l'état de chargement
          error: null, // Pas d'erreur simulée
          login: async (_email: string, _password: string): Promise<string | undefined> => {
            return undefined; // Fausse fonction login
          },
          logout: () => {}, // Fausse fonction logout
        }}
      >
        {/* MemoryRouter simule la navigation (route initiale = route passée) */}
        <MemoryRouter initialEntries={[route]}>
          {component} {/* Le composant qu'on veut tester */}
        </MemoryRouter>
      </AuthContext.Provider>
    </MockedProvider>,
  );
}
