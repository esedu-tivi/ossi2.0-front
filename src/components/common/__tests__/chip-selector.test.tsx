import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChipSelector from '../chip-selector';

const items = [
  { id: '1', name: 'React', description: 'UI library' },
  { id: '2', name: 'TypeScript', description: 'Typed JS' },
];

describe('ChipSelector', () => {
  it('renders label and items as badges', () => {
    render(
      <ChipSelector
        label="Teknologiat"
        items={items}
        onAdd={vi.fn()}
        currentField="technologies"
      />
    );

    expect(screen.getByText('Teknologiat')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('shows add button', () => {
    render(
      <ChipSelector
        label="Teknologiat"
        items={items}
        onAdd={vi.fn()}
        currentField="technologies"
      />
    );

    const addButton = screen.getByRole('button');
    expect(addButton).toBeInTheDocument();
  });

  it('calls onAdd when add button clicked', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();

    render(
      <ChipSelector
        label="Teknologiat"
        items={items}
        onAdd={onAdd}
        currentField="technologies"
      />
    );

    const addButton = screen.getByRole('button');
    await user.click(addButton);

    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('shows description instead of name when currentField is competenceRequirements', () => {
    render(
      <ChipSelector
        label="Ammattitaitovaatimukset"
        items={items}
        onAdd={vi.fn()}
        currentField="competenceRequirements"
      />
    );

    expect(screen.getByText('UI library')).toBeInTheDocument();
    expect(screen.getByText('Typed JS')).toBeInTheDocument();
    expect(screen.queryByText('React')).not.toBeInTheDocument();
    expect(screen.queryByText('TypeScript')).not.toBeInTheDocument();
  });
});
