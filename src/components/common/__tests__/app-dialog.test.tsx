import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AppDialog from '../app-dialog';

describe('AppDialog', () => {
  it('renders when open=true', () => {
    render(
      <AppDialog title="Testi dialogi" open={true} onClose={vi.fn()}>
        <p>Sisalto</p>
      </AppDialog>
    );

    expect(screen.getByRole('heading', { name: 'Testi dialogi' })).toBeInTheDocument();
    expect(screen.getByText('Sisalto')).toBeInTheDocument();
  });

  it('does not render content when open=false', () => {
    render(
      <AppDialog title="Testi dialogi" open={false} onClose={vi.fn()}>
        <p>Sisalto</p>
      </AppDialog>
    );

    expect(screen.queryByText('Testi dialogi')).not.toBeInTheDocument();
    expect(screen.queryByText('Sisalto')).not.toBeInTheDocument();
  });

  it('shows title', () => {
    render(
      <AppDialog title="Otsikko" open={true} onClose={vi.fn()}>
        <p>Content</p>
      </AppDialog>
    );

    expect(screen.getByRole('heading', { name: 'Otsikko' })).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <AppDialog title="Sulje testi" open={true} onClose={onClose}>
        <p>Content</p>
      </AppDialog>
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledWith(false);
  });
});
