import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useQuery, useLazyQuery } from '@apollo/client';

vi.mock('@apollo/client', async () => {
  const actual = await vi.importActual('@apollo/client');
  return {
    ...actual,
    useQuery: vi.fn(),
    useLazyQuery: vi.fn(),
  };
});

import InternshipForm from '../InternshipForm';

const mockInternshipData = {
  me: {
    user: { id: '1', firstName: 'Opettaja', lastName: 'Testinen' },
  },
  workplaces: {
    workplaces: [
      { id: '10', name: 'Yritys Oy' },
      { id: '20', name: 'Firma Ab' },
    ],
  },
  units: {
    units: [
      { id: '100', name: 'Tutkinnonosa 1' },
    ],
  },
};

const mockStudent = {
  id: 2,
  firstName: 'Opiskelija',
  lastName: 'Testinen',
  groupId: 'TK24',
  studyingQualificationTitle: { name: 'Tietojenkäsittely' },
  studyingQualification: { name: 'Datanomi' },
};

const mockFormData = {
  startDate: '',
  endDate: '',
  info: '',
  qualificationUnitId: '',
  workplaceId: '',
  teacherId: '',
  studentId: '',
  jobSupervisorId: '',
};

describe('InternshipForm', () => {
  it('renders form fields when data is loaded', () => {
    vi.mocked(useQuery).mockReturnValue({
      loading: false,
      data: mockInternshipData,
      error: undefined,
    } as never);

    vi.mocked(useLazyQuery).mockReturnValue([
      vi.fn(),
      { data: null, loading: false, called: false, error: undefined, variables: undefined, previousData: undefined, networkStatus: 7 } as never,
    ]);

    render(
      <InternshipForm
        formSubmitHandler={vi.fn()}
        student={mockStudent}
        formData={mockFormData}
        setFormData={vi.fn()}
        workplaceId={null}
        setWorkplaceId={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Opettaja')).toBeInTheDocument();
    expect(screen.getByLabelText('Opiskelija')).toBeInTheDocument();
    expect(screen.getByText('Milloin alkaa')).toBeInTheDocument();
    expect(screen.getByText('Milloin loppuu')).toBeInTheDocument();
    expect(screen.getByLabelText(/Lisätietoja/i)).toBeInTheDocument();
  });

  it('renders save button', () => {
    vi.mocked(useQuery).mockReturnValue({
      loading: false,
      data: mockInternshipData,
      error: undefined,
    } as never);

    vi.mocked(useLazyQuery).mockReturnValue([
      vi.fn(),
      { data: null, loading: false, called: false, error: undefined, variables: undefined, previousData: undefined, networkStatus: 7 } as never,
    ]);

    render(
      <InternshipForm
        formSubmitHandler={vi.fn()}
        student={mockStudent}
        formData={mockFormData}
        setFormData={vi.fn()}
        workplaceId={null}
        setWorkplaceId={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /Tallenna/i })).toBeInTheDocument();
  });

  it('shows loading state', () => {
    vi.mocked(useQuery).mockReturnValue({
      loading: true,
      data: undefined,
      error: undefined,
    } as never);

    vi.mocked(useLazyQuery).mockReturnValue([
      vi.fn(),
      { data: null, loading: false, called: false, error: undefined, variables: undefined, previousData: undefined, networkStatus: 7 } as never,
    ]);

    render(
      <InternshipForm
        formSubmitHandler={vi.fn()}
        student={mockStudent}
        formData={mockFormData}
        setFormData={vi.fn()}
        workplaceId={null}
        setWorkplaceId={vi.fn()}
      />
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
