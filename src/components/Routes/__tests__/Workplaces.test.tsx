import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQuery, useMutation } from '@apollo/client';

vi.mock('@apollo/client', async () => {
  const actual = await vi.importActual('@apollo/client');
  return {
    ...actual,
    useQuery: vi.fn(),
    useMutation: vi.fn(),
  };
});

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
    useLocation: vi.fn(() => ({ pathname: '/workplaces' })),
  };
});

vi.mock('../../../context/use-alerts', () => ({
  useAlerts: vi.fn(() => ({
    addAlert: vi.fn(),
  })),
}));

import Workplaces from '../Workplaces';

const mockWorkplaces = [
  {
    id: '1',
    name: 'Yritys Oy',
    internships: [],
    jobSupervisors: [{ id: 'js1', firstName: 'Matti', lastName: 'Meikäläinen', email: 'matti@yritys.fi' }],
  },
  {
    id: '2',
    name: 'Firma Ab',
    internships: [],
    jobSupervisors: [],
  },
];

const mockJobSupervisors = [
  {
    id: 'js1',
    firstName: 'Matti',
    lastName: 'Meikäläinen',
    email: 'matti@yritys.fi',
    phoneNumber: '0401234567',
    workplace: { id: '1', name: 'Yritys Oy' },
  },
];

describe('Workplaces', () => {
  beforeEach(() => {
    vi.mocked(useMutation).mockReturnValue([vi.fn(), { loading: false, data: undefined, called: false, error: undefined, reset: vi.fn(), client: {} as never }]);
  });

  it('shows loading state', () => {
    vi.mocked(useQuery)
      .mockReturnValueOnce({ loading: true, data: undefined, error: undefined } as never)
      .mockReturnValueOnce({ loading: true, data: undefined, error: undefined } as never);

    render(<Workplaces />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders workplace page content when loaded', () => {
    vi.mocked(useQuery)
      .mockReturnValueOnce({
        loading: false,
        data: { workplaces: { workplaces: mockWorkplaces } },
        error: undefined,
      } as never)
      .mockReturnValueOnce({
        loading: false,
        data: { jobSupervisors: { jobSupervisors: mockJobSupervisors } },
        error: undefined,
      } as never);

    render(<Workplaces />);

    // Buttons are visible on the page
    expect(screen.getByRole('button', { name: /Lisää työpaikka/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Lisää uusi työpaikkaohjaaja/i })).toBeInTheDocument();

    // Accordion section headers are rendered
    expect(screen.getByText('Työpaikat')).toBeInTheDocument();
    expect(screen.getByText('Työpaikkaohjaajat')).toBeInTheDocument();
  });

  it('renders workplace data inside accordion when expanded', async () => {
    const user = userEvent.setup();

    // Use mockImplementation so re-renders get valid data too
    let callCount = 0;
    vi.mocked(useQuery).mockImplementation(() => {
      callCount++;
      if (callCount % 2 === 1) {
        return {
          loading: false,
          data: { workplaces: { workplaces: mockWorkplaces } },
          error: undefined,
        } as never;
      }
      return {
        loading: false,
        data: { jobSupervisors: { jobSupervisors: mockJobSupervisors } },
        error: undefined,
      } as never;
    });

    render(<Workplaces />);

    // Open the "Työpaikat" accordion
    await user.click(screen.getByText('Työpaikat'));

    expect(screen.getByText('Yritys Oy')).toBeInTheDocument();
    expect(screen.getByText('Firma Ab')).toBeInTheDocument();
  });
});
