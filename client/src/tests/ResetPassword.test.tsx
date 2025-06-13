import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import ForgotPassword from '../pages/ForgotPassword';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('Test resetPassword', () => {
  test('Test lien retour a la page', () => {
    render(<ForgotPassword />);
    expect(screen.getByText(/Retour a la page login/i)).toBeInTheDocument();
  });

  test('Tester la route forgotpassword', async () => {
    render(<App />);
    const user = userEvent.setup();
    await user.click(screen.getByText(/forgot-password/i));
    expect(screen.getByText(/ForgotPassword/)).toBeDefined();
  });
});
