import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client';

vi.mock('@apollo/client', async () => {
  const actual = await vi.importActual('@apollo/client');
  return {
    ...actual,
    useQuery: vi.fn(),
    useLazyQuery: vi.fn(),
    useMutation: vi.fn(),
  };
});

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
    useLocation: vi.fn(() => ({ pathname: '/teacherprojects' })),
  };
});

import ProjectTable from '../TeacherProjectsView';

const mockProjects = [
  {
    id: 1,
    name: 'Testiprojekti',
    includedInQualificationUnitParts: [{ id: 1, name: 'Osa 1' }],
  },
  {
    id: 2,
    name: 'Toinen projekti',
    includedInQualificationUnitParts: [{ id: 2, name: 'Osa 2' }],
  },
];

describe('TeacherProjectsView', () => {
  beforeEach(() => {
    vi.mocked(useMutation).mockReturnValue([vi.fn(), { loading: false, data: undefined, called: false, error: undefined, reset: vi.fn(), client: {} as never }]);
    vi.mocked(useLazyQuery).mockReturnValue([vi.fn(), { data: null, loading: false, called: false, error: undefined, variables: undefined, previousData: undefined, networkStatus: 7 } as never]);
  });

  it('shows loading state', () => {
    vi.mocked(useQuery)
      .mockReturnValueOnce({ loading: true, data: undefined, error: undefined } as never)
      .mockReturnValueOnce({ loading: false, data: undefined, error: undefined } as never);

    render(<ProjectTable />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders "Lisää Projekti" button when data is loaded', () => {
    vi.mocked(useQuery)
      .mockReturnValueOnce({
        loading: false,
        data: { projects: { projects: mockProjects } },
        error: undefined,
      } as never)
      .mockReturnValueOnce({
        loading: false,
        data: { me: { user: { id: '1' } } },
        error: undefined,
      } as never);

    render(<ProjectTable />);

    expect(screen.getByRole('button', { name: /Lisää Projekti/i })).toBeInTheDocument();
  });

  it('renders project data in table when query returns data', () => {
    vi.mocked(useQuery)
      .mockReturnValueOnce({
        loading: false,
        data: { projects: { projects: mockProjects } },
        error: undefined,
      } as never)
      .mockReturnValueOnce({
        loading: false,
        data: { me: { user: { id: '1' } } },
        error: undefined,
      } as never);

    render(<ProjectTable />);

    expect(screen.getByText('Testiprojekti')).toBeInTheDocument();
    expect(screen.getByText('Toinen projekti')).toBeInTheDocument();
    expect(screen.getByText('Osa 1')).toBeInTheDocument();
    expect(screen.getByText('Osa 2')).toBeInTheDocument();
  });
});
