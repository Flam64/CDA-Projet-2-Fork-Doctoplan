import { screen } from '@testing-library/react';
import Header from '../components/layout/Header';
import { expect, it } from 'vitest';
import { renderWithProviders } from './utils/renderWithProviders';
import { createMockUser } from './utils/createMockUser';

it('le header affiche le logo DoctoPlan', () => {
  const mockUser = createMockUser({
    role: 'SECRETARY',
    status: 'ACTIVE',
  });

  renderWithProviders(<Header />, {
    user: mockUser,
  });

  // Vérifie que l'image du logo est bien présente
  expect(screen.getByAltText('logo de DoctoPlan')).toBeInTheDocument();

  // Vérifie aussi que le texte DoctoPlan est affiché
  expect(screen.getByText('DoctoPlan')).toBeInTheDocument();
});
