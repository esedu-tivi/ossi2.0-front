import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import BackButton from '../back-button';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('BackButton', () => {
  it('renders with "Palaa" text', () => {
    render(<BackButton />);

    expect(screen.getByRole('button', { name: /palaa/i })).toBeInTheDocument();
    expect(screen.getByText('Palaa')).toBeInTheDocument();
  });

  it('has arrow icon', () => {
    const { container } = render(<BackButton />);

    // lucide-react renders an SVG element for ArrowLeft
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('navigates back on click', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();

    render(<BackButton />);

    await user.click(screen.getByRole('button', { name: /palaa/i }));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
