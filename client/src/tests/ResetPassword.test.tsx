import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ForgotPassword from '../pages/ForgotPassword';
//import userEvent from '@testing-library/user-event';
//import App from '../App';
import { renderWithProviders } from './utils/renderWithProviders';

describe('Test resetPassword', () => {
  it('Test lien retour a la page', () => {
    renderWithProviders(<ForgotPassword />, { route: '/forgot-password' });
    expect(screen.getByText(/Retour a la page login/i)).toBeInTheDocument();
  });
});
