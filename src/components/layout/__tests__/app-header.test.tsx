import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppHeader } from '../app-header';

const mockUseLocation = vi.fn();

vi.mock('react-router-dom', () => ({
  useLocation: () => mockUseLocation(),
}));

// SidebarTrigger requires SidebarProvider context; mock it as a simple button
vi.mock('@/components/ui/sidebar', () => ({
  SidebarTrigger: (props: React.ComponentProps<'button'>) => (
    <button {...props}>Menu</button>
  ),
}));

vi.mock('@/components/ui/separator', () => ({
  Separator: () => <hr />,
}));

describe('AppHeader', () => {
  beforeEach(() => {
    mockUseLocation.mockReset();
  });

  it('renders breadcrumb with "Etusivu" for /teacherdashboard', () => {
    mockUseLocation.mockReturnValue({ pathname: '/teacherdashboard' });

    render(<AppHeader />);

    expect(screen.getByText('Etusivu')).toBeInTheDocument();
  });

  it('renders breadcrumb with "Etusivu" for /studentdashboard', () => {
    mockUseLocation.mockReturnValue({ pathname: '/studentdashboard' });

    render(<AppHeader />);

    expect(screen.getByText('Etusivu')).toBeInTheDocument();
  });

  it('renders breadcrumb with "Projektit" for /teacherprojects', () => {
    mockUseLocation.mockReturnValue({ pathname: '/teacherprojects' });

    render(<AppHeader />);

    expect(screen.getByText('Projektit')).toBeInTheDocument();
  });

  it('renders breadcrumb with "Teemat" for /qualificationunitparts', () => {
    mockUseLocation.mockReturnValue({ pathname: '/qualificationunitparts' });

    render(<AppHeader />);

    expect(screen.getByText('Teemat')).toBeInTheDocument();
  });

  it('renders breadcrumb with "Tyopaikat" for /workplaces', () => {
    mockUseLocation.mockReturnValue({ pathname: '/workplaces' });

    render(<AppHeader />);

    expect(screen.getByText('Työpaikat')).toBeInTheDocument();
  });

  it('renders "Projektin tiedot" for dynamic /project/:id route', () => {
    mockUseLocation.mockReturnValue({ pathname: '/project/123' });

    render(<AppHeader />);

    expect(screen.getByText('Projektin tiedot')).toBeInTheDocument();
  });

  it('renders "Tyopaikan tiedot" for dynamic /workplace/:id route', () => {
    mockUseLocation.mockReturnValue({ pathname: '/workplace/456' });

    render(<AppHeader />);

    expect(screen.getByText('Työpaikan tiedot')).toBeInTheDocument();
  });

  it('renders "Opiskelijan tiedot" for dynamic /student/:id route', () => {
    mockUseLocation.mockReturnValue({ pathname: '/student/789' });

    render(<AppHeader />);

    expect(screen.getByText('Opiskelijan tiedot')).toBeInTheDocument();
  });

  it('renders default "Ossi 2.0" for unknown route', () => {
    mockUseLocation.mockReturnValue({ pathname: '/unknown-route' });

    render(<AppHeader />);

    expect(screen.getByText('Ossi 2.0')).toBeInTheDocument();
  });
});
