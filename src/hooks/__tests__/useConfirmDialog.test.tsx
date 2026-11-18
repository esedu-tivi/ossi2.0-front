import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useConfirmDialog } from '../useConfirmDialog';
import { useState } from 'react';

function TestComponent() {
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [result, setResult] = useState<string>('none');

  const handleClick = async () => {
    const confirmed = await confirm({
      title: 'Test Dialog Title',
      description: 'Test description',
      confirmText: 'Yes',
      cancelText: 'No',
    });
    setResult(confirmed ? 'confirmed' : 'cancelled');
  };

  return (
    <div>
      <ConfirmDialog />
      <button onClick={handleClick}>Open Dialog</button>
      <span data-testid="result">{result}</span>
    </div>
  );
}

describe('useConfirmDialog', () => {
  it('returns confirm function and ConfirmDialog component', () => {
    let hookResult: ReturnType<typeof useConfirmDialog> | null = null;

    function HookTestComponent() {
      hookResult = useConfirmDialog();
      return null;
    }

    render(<HookTestComponent />);

    expect(hookResult).not.toBeNull();
    expect(typeof hookResult!.confirm).toBe('function');
    expect(typeof hookResult!.ConfirmDialog).toBe('function');
  });

  it('calling confirm() opens the dialog', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    // Dialog should not be visible initially
    expect(screen.queryByText('Test Dialog Title')).not.toBeInTheDocument();

    // Click the button to open the dialog
    await user.click(screen.getByText('Open Dialog'));

    // Dialog should now be visible
    expect(screen.getByText('Test Dialog Title')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('clicking confirm resolves to true', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    // Result should start as 'none'
    expect(screen.getByTestId('result')).toHaveTextContent('none');

    // Open the dialog
    await user.click(screen.getByText('Open Dialog'));

    // Click the confirm button
    await user.click(screen.getByText('Yes'));

    // Result should now be 'confirmed'
    expect(screen.getByTestId('result')).toHaveTextContent('confirmed');

    // Dialog should be closed
    expect(screen.queryByText('Test Dialog Title')).not.toBeInTheDocument();
  });

  it('clicking cancel resolves to false', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    // Result should start as 'none'
    expect(screen.getByTestId('result')).toHaveTextContent('none');

    // Open the dialog
    await user.click(screen.getByText('Open Dialog'));

    // Click the cancel button
    await user.click(screen.getByText('No'));

    // Result should now be 'cancelled'
    expect(screen.getByTestId('result')).toHaveTextContent('cancelled');

    // Dialog should be closed
    expect(screen.queryByText('Test Dialog Title')).not.toBeInTheDocument();
  });

  it('uses default button text when not specified', async () => {
    function DefaultTextComponent() {
      const { confirm, ConfirmDialog } = useConfirmDialog();

      return (
        <div>
          <ConfirmDialog />
          <button onClick={() => confirm({ title: 'Default Text Test' })}>
            Open
          </button>
        </div>
      );
    }

    const user = userEvent.setup();
    render(<DefaultTextComponent />);

    await user.click(screen.getByText('Open'));

    // Should use defaults: 'Ok' and 'Peruuta'
    expect(screen.getByText('Ok')).toBeInTheDocument();
    expect(screen.getByText('Peruuta')).toBeInTheDocument();
  });
});
