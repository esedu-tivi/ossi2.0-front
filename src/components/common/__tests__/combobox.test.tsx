import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Combobox, { type Option } from '../combobox';

const options: Option[] = [
  { id: '1', name: 'Helsinki' },
  { id: '2', name: 'Tampere' },
  { id: '3', name: 'Turku' },
];

describe('Combobox', () => {
  it('renders with label and placeholder', () => {
    render(
      <Combobox
        id="test-combo"
        label="Kaupunki"
        value={null}
        options={options}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText('Kaupunki')).toBeInTheDocument();
    expect(screen.getByText('Valitse...')).toBeInTheDocument();
  });

  it('opens popover on click', async () => {
    const user = userEvent.setup();

    render(
      <Combobox
        id="test-combo"
        label="Kaupunki"
        value={null}
        options={options}
        onChange={vi.fn()}
      />
    );

    const trigger = screen.getByRole('combobox');
    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows options list', async () => {
    const user = userEvent.setup();

    render(
      <Combobox
        id="test-combo"
        label="Kaupunki"
        value={null}
        options={options}
        onChange={vi.fn()}
      />
    );

    await user.click(screen.getByRole('combobox'));

    expect(screen.getByText('Helsinki')).toBeInTheDocument();
    expect(screen.getByText('Tampere')).toBeInTheDocument();
    expect(screen.getByText('Turku')).toBeInTheDocument();
  });

  it('selects an option and calls onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Combobox
        id="test-combo"
        label="Kaupunki"
        value={null}
        options={options}
        onChange={onChange}
      />
    );

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Tampere'));

    expect(onChange).toHaveBeenCalledWith(
      expect.anything(),
      { id: '2', name: 'Tampere' }
    );
  });

  it('shows noOptionsText when no options match', async () => {
    const user = userEvent.setup();

    render(
      <Combobox
        id="test-combo"
        label="Kaupunki"
        value={null}
        options={options}
        onChange={vi.fn()}
        noOptionsText="Ei tuloksia"
      />
    );

    await user.click(screen.getByRole('combobox'));

    // Type something that won't match
    const searchInput = screen.getByPlaceholderText('Hae...');
    await user.type(searchInput, 'zzzzz');

    expect(screen.getByText('Ei tuloksia')).toBeInTheDocument();
  });
});
