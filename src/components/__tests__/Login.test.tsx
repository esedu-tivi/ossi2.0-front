import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockLoginRedirect = vi.fn();

vi.mock('@azure/msal-react', () => ({
  useMsal: vi.fn(() => ({
    instance: { loginRedirect: mockLoginRedirect, logoutRedirect: vi.fn() },
    accounts: [],
  })),
}));

vi.mock('../../../authConfig', () => ({
  loginRequest: { scopes: ['openid'] },
}));

import Login from '../Login';

describe('Login', () => {
  it('renders "Ossi 2.0" title', () => {
    render(<Login />);
    expect(screen.getByText('Ossi 2.0')).toBeInTheDocument();
  });

  it('renders "Kirjaudu Sisään" button', () => {
    render(<Login />);
    expect(screen.getByRole('button', { name: /Kirjaudu Sisään/i })).toBeInTheDocument();
  });

  it('calls loginRedirect when button is clicked', async () => {
    const user = userEvent.setup();
    render(<Login />);

    const button = screen.getByRole('button', { name: /Kirjaudu Sisään/i });
    await user.click(button);

    expect(mockLoginRedirect).toHaveBeenCalledWith({ scopes: ['openid'] });
  });
});
