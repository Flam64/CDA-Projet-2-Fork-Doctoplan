import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Logo from '../components/Logo';

describe('Logo Component', () => {
  it('renders the logo image with correct alt text', () => {
    render(<Logo />);
    const logoImage = screen.getByAltText('logo de DoctoPlan');
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute('src', '/doctoplan-logo.svg');
  });

  it('renders the DoctoPlan text', () => {
    render(<Logo />);
    const logoText = screen.getByText('DoctoPlan');
    expect(logoText).toBeInTheDocument();
  });

  it('has the correct layout structure', () => {
    render(<Logo />);
    const container = screen.getByRole('heading', { name: 'DoctoPlan' }).parentElement;
    expect(container).toHaveClass('flex', 'items-center');
  });
});
