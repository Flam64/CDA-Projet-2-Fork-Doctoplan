// 🧪 Fonctions utiles pour tester le rendu
import { screen } from '@testing-library/react';
// 🧩 Composant à tester
import Header from '../components/layout/Header';
// 🔍 Utilitaires de test de Vitest
import { expect, it } from 'vitest';
// 🧪 Méthode utilitaire personnalisée pour rendre un composant avec le contexte nécessaire
import { renderWithProviders } from './utils/renderWithProviders';
// 👤 Génère un faux utilisateur pour le contexte Auth
import { createMockUser } from './utils/createMockUser';

// ✅ Test : vérifie que le Header affiche bien le logo et le texte "DoctoPlan"
it('le header affiche le logo DoctoPlan', () => {
  // 👤 On crée un faux utilisateur de type "secrétaire" actif
  const mockUser = createMockUser({
    role: 'SECRETARY',
    status: 'ACTIVE',
  });

  // 🧪 On rend le composant Header dans un contexte d’authentification simulé
  renderWithProviders(<Header />, {
    user: mockUser, // on injecte notre faux utilisateur dans le contexte Auth
  });

  // 🔍 Vérifie que le logo (balise <img>) est présent grâce à son alt text
  expect(screen.getByAltText('logo de DoctoPlan')).toBeInTheDocument();

  // 🔍 Vérifie aussi que le texte "DoctoPlan" est visible à l’écran
  expect(screen.getByText('DoctoPlan')).toBeInTheDocument();
});
