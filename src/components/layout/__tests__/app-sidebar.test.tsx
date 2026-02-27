import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppSidebar } from '../app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

const mockNavigate = vi.fn();
const mockUseLocation = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockUseLocation(),
}));

vi.mock('@/utils/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock UserNav to avoid needing Apollo, MSAL, etc.
vi.mock('../user-nav', () => ({
  UserNav: () => <div data-testid="user-nav">UserNav</div>,
}));

describe('AppSidebar', () => {
  beforeEach(() => {
    mockUseLocation.mockReturnValue({ pathname: '/teacherdashboard' });
    mockNavigate.mockReset();
  });

  it('shows teacher menu when role is teacher', () => {
    mockUseAuth.mockReturnValue({ role: 'teacher', userEmail: 'opettaja@esedu.fi' });

    render(
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>
    );

    expect(screen.getByText('Etusivu')).toBeInTheDocument();
    expect(screen.getByText('Opiskelijat')).toBeInTheDocument();
    expect(screen.getByText('Projektit')).toBeInTheDocument();
    expect(screen.getByText('Teemat')).toBeInTheDocument();
    expect(screen.getByText('Työpaikat')).toBeInTheDocument();
    expect(screen.getByText('Tutkinnot')).toBeInTheDocument();
  });

  it('shows student menu when role is student', () => {
    mockUseAuth.mockReturnValue({ role: 'student', userEmail: 'opiskelija@esedulainen.fi' });
    mockUseLocation.mockReturnValue({ pathname: '/studentdashboard' });

    render(
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>
    );

    expect(screen.getByText('Etusivu')).toBeInTheDocument();
    expect(screen.getByText('Projektit')).toBeInTheDocument();
    expect(screen.getByText('Tehtävät')).toBeInTheDocument();
    expect(screen.getByText('Arvosanat')).toBeInTheDocument();

    // Teacher-specific items should not appear
    expect(screen.queryByText('Opiskelijat')).not.toBeInTheDocument();
    expect(screen.queryByText('Teemat')).not.toBeInTheDocument();
    expect(screen.queryByText('Työpaikat')).not.toBeInTheDocument();
  });

  it('menu items have correct Finnish text for teacher', () => {
    mockUseAuth.mockReturnValue({ role: 'teacher', userEmail: 'opettaja@esedu.fi' });

    render(
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>
    );

    const expectedItems = ['Etusivu', 'Opiskelijat', 'Projektit', 'Teemat', 'Työpaikat', 'Tutkinnot'];
    expectedItems.forEach((text) => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  });

  it('menu items have correct Finnish text for student', () => {
    mockUseAuth.mockReturnValue({ role: 'student', userEmail: 'opiskelija@esedulainen.fi' });
    mockUseLocation.mockReturnValue({ pathname: '/studentdashboard' });

    render(
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>
    );

    const expectedItems = ['Etusivu', 'Projektit', 'Tehtävät', 'Arvosanat'];
    expectedItems.forEach((text) => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  });
});
