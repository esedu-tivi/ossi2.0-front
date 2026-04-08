import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockUseAuth = vi.fn();
const mockUseQuery = vi.fn();
const mockUseMsal = vi.fn();
const routerFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
} as const;

vi.mock('@/utils/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@apollo/client', async () => {
  const actual = await vi.importActual('@apollo/client');
  return {
    ...actual,
    useQuery: (...args: unknown[]) => mockUseQuery(...args),
  };
});

vi.mock('@azure/msal-react', () => ({
  useMsal: () => mockUseMsal(),
}));

// Mock all route components to avoid their own dependencies
vi.mock('@/components/Routes/teacherDashboard', () => ({
  default: () => <div>Teacher Dashboard</div>,
}));

vi.mock('@/components/Routes/studentDashboard', () => ({
  default: () => <div>Student Dashboard</div>,
}));

vi.mock('@/components/Login', () => ({
  default: () => <div>Login Page</div>,
}));

vi.mock('@/components/Routes/TeacherProjectsView', () => ({
  default: () => <div>Teacher Projects</div>,
}));

vi.mock('@/components/Routes/CreateProject', () => ({
  default: () => <div>Create Project</div>,
}));

vi.mock('@/components/Routes/ProjectDetails', () => ({
  default: () => <div>Project Details</div>,
}));

vi.mock('@/components/Routes/EditProject', () => ({
  default: () => <div>Edit Project</div>,
}));

vi.mock('@/components/QualificationUnitPartList', () => ({
  default: () => <div>Qualification Unit Part List</div>,
}));

vi.mock('@/components/Routes/QualificationUnitPartDetails', () => ({
  default: () => <div>Qualification Unit Part Details</div>,
}));

vi.mock('@/components/Routes/CreatePart', () => ({
  default: () => <div>Create Part</div>,
}));

vi.mock('@/components/Routes/EditPart', () => ({
  default: () => <div>Edit Part</div>,
}));

vi.mock('@/components/Routes/ReorderParts', () => ({
  default: () => <div>Reorder Parts</div>,
}));

vi.mock('@/components/Routes/NewUserLogin', () => ({
  default: () => <div>New User Login</div>,
}));

vi.mock('@/components/Routes/Workplaces', () => ({
  default: () => <div>Workplaces</div>,
}));

vi.mock('@/components/Routes/StudentInfo', () => ({
  default: () => <div>Student Info</div>,
}));

vi.mock('@/components/Routes/Workplace', () => ({
  default: () => <div>Workplace</div>,
}));

vi.mock('@/components/Routes/JobSupervisor', () => ({
  default: () => <div>Job Supervisor</div>,
}));

vi.mock('@/components/layout/app-layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import App from '../App';

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMsal.mockReturnValue({
      instance: {
        loginRedirect: vi.fn(),
      },
    });
  });

  it('shows loading spinner when authenticated and data loading', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      userEmail: 'test@esedu.fi',
      role: 'teacher' as const,
    });

    mockUseQuery.mockReturnValue({
      data: null,
      loading: true,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/']} future={routerFuture}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('Ladataan k\u00e4ytt\u00e4j\u00e4n tietoja...')).toBeInTheDocument();
  });

  it('shows loading spinner when authenticated but studentData is null', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      userEmail: 'student@esedulainen.fi',
      role: 'student' as const,
    });

    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/']} future={routerFuture}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('Ladataan k\u00e4ytt\u00e4j\u00e4n tietoja...')).toBeInTheDocument();
  });

  it('renders Login route at "/"', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      userEmail: '',
      role: 'unknown' as const,
    });

    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/']} future={routerFuture}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('does not show loading spinner when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      userEmail: '',
      role: 'unknown' as const,
    });

    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/']} future={routerFuture}>
        <App />
      </MemoryRouter>
    );

    expect(screen.queryByText('Ladataan k\u00e4ytt\u00e4j\u00e4n tietoja...')).not.toBeInTheDocument();
  });
});
