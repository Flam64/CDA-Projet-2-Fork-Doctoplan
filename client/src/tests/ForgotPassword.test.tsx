import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ForgotPassword from '../pages/ForgotPassword';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from './utils/renderWithProviders';

describe('ForgotPassword', () => {
  it('should display the link back to the login page', () => {
    renderWithProviders(<ForgotPassword />, { route: '/forgot-password' });
    expect(screen.getByRole('link', { name: 'Retour a la page login' })).toBeInTheDocument();
  });

  it('the field should be of type email', () => {
    renderWithProviders(<ForgotPassword />, { route: '/forgot-password' });
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
  });

  it('the email should be valid', async () => {
    renderWithProviders(<ForgotPassword />, { route: '/forgot-password' });

    const emailInput = screen.getByRole('textbox', { name: /email/i });
    await userEvent.type(emailInput, 'doctor@email.com');
    expect(emailInput).toHaveValue('doctor@email.com');
  });

  it('invalid email should display an error message', async () => {
    renderWithProviders(<ForgotPassword />, { route: '/forgot-password' });

    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const submitButton = screen.getByText('Continuer', { selector: 'button' });

    fireEvent.change(emailInput, { target: { value: 'doctor@example' } });
    fireEvent.click(submitButton);

    const result = await screen.findByText("⚠️ L'email n'est pas valide");
    expect(result).toBeInTheDocument();
  });

  it('an empty field should display an error message', async () => {
    renderWithProviders(<ForgotPassword />, { route: '/forgot-password' });

    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const submitButton = screen.getByText('Continuer', { selector: 'button' });

    fireEvent.change(emailInput, { target: { value: ' ' } });
    fireEvent.click(submitButton);

    const result = await screen.findByText("⚠️ L'email est obligatoire");
    expect(result).toBeInTheDocument();
  });
});
