import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';

const mockUseAuth = vi.fn();
const routerFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
} as const;

vi.mock('@/utils/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

function renderWithRouter(ui: React.ReactNode, initialEntry = '/test') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]} future={routerFuture}>
      <Routes>
        <Route path="/test" element={ui} />
        <Route path="/" element={<div>Redirected to Login</div>} />
        <Route path="/teacherdashboard" element={<div>Teacher Dashboard</div>} />
        <Route path="/studentdashboard" element={<div>Student Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders element when user is authenticated with correct role', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      role: 'teacher',
    });

    renderWithRouter(
      <ProtectedRoute
        element={<div>Protected Content</div>}
        allowedRoles={['teacher']}
      />
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders element when user is authenticated and no allowedRoles specified', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      role: 'student',
    });

    renderWithRouter(
      <ProtectedRoute element={<div>Open Content</div>} />
    );

    expect(screen.getByText('Open Content')).toBeInTheDocument();
  });

  it('redirects to "/" when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      role: 'unknown',
    });

    renderWithRouter(
      <ProtectedRoute element={<div>Protected Content</div>} />
    );

    // Should redirect to login
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Redirected to Login')).toBeInTheDocument();
  });

  it('redirects teacher to /teacherdashboard when role does not match allowedRoles', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      role: 'teacher',
    });

    renderWithRouter(
      <ProtectedRoute
        element={<div>Student Only Content</div>}
        allowedRoles={['student']}
      />
    );

    // Teacher should be redirected to teacher dashboard
    expect(screen.queryByText('Student Only Content')).not.toBeInTheDocument();
    expect(screen.getByText('Teacher Dashboard')).toBeInTheDocument();
  });

  it('redirects student to /studentdashboard when role does not match allowedRoles', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      role: 'student',
    });

    renderWithRouter(
      <ProtectedRoute
        element={<div>Teacher Only Content</div>}
        allowedRoles={['teacher']}
      />
    );

    // Student should be redirected to student dashboard
    expect(screen.queryByText('Teacher Only Content')).not.toBeInTheDocument();
    expect(screen.getByText('Student Dashboard')).toBeInTheDocument();
  });

  it('renders element when user has one of multiple allowedRoles', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      role: 'student',
    });

    renderWithRouter(
      <ProtectedRoute
        element={<div>Multi-Role Content</div>}
        allowedRoles={['teacher', 'student']}
      />
    );

    expect(screen.getByText('Multi-Role Content')).toBeInTheDocument();
  });
});
