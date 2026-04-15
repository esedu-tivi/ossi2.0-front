import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

import InternshipForm from '../InternshipForm';
import { GET_JOB_SUPERVISORS } from '../../graphql/GetJobSupervisors';

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
  const setupLoadedQueries = () => {
    vi.mocked(useQuery).mockImplementation((query) => {
      if (query === GET_JOB_SUPERVISORS) {
        return {
          loading: false,
          data: { jobSupervisors: { jobSupervisors: [] } },
          error: undefined,
        } as never;
      }

      return {
        loading: false,
        data: mockInternshipData,
        error: undefined,
        refetch: vi.fn(),
      } as never;
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useMutation).mockReturnValue([
      vi.fn(),
      { loading: false, data: undefined, error: undefined, called: false, reset: vi.fn(), client: {} as never } as never,
    ]);
  });

  it('renders form fields when data is loaded', () => {
    setupLoadedQueries();

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
    setupLoadedQueries();

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
    vi.mocked(useQuery).mockImplementation((query) => {
      if (query === GET_JOB_SUPERVISORS) {
        return {
          loading: false,
          data: { jobSupervisors: { jobSupervisors: [] } },
          error: undefined,
        } as never;
      }

      return {
        loading: true,
        data: undefined,
        error: undefined,
      } as never;
    });

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

  it('opens workplace creation dialog from creatable combobox', async () => {
    const user = userEvent.setup();

    setupLoadedQueries();

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

    await user.click(screen.getByRole('combobox', { name: /työpaikka/i }));
    await user.type(screen.getByPlaceholderText('Hae...'), 'Uusi työpaikka');
    await user.click(screen.getByText('Lisää työpaikka "Uusi työpaikka"'));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Lisää uusi työpaikka' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Uusi työpaikka')).toBeInTheDocument();
  });

  it('shows add supervisor button when workplace is selected but supervisor is missing', () => {
    setupLoadedQueries();

    const loadSupervisors = vi.fn(async () => ({}) as never);

    vi.mocked(useLazyQuery).mockReturnValue([
      loadSupervisors,
      { data: { jobSupervisorsByWorkplace: { jobSupervisors: [] } }, loading: false, called: true, error: undefined, variables: undefined, previousData: undefined, networkStatus: 7 } as never,
    ]);

    render(
      <InternshipForm
        formSubmitHandler={vi.fn()}
        student={mockStudent}
        formData={{ ...mockFormData, workplaceId: '10' }}
        setFormData={vi.fn()}
        workplaceId="10"
        setWorkplaceId={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /Lisää työohjaaja/i })).toBeInTheDocument();
  });
});
