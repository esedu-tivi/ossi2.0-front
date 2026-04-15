import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useMutation, useQuery } from '@apollo/client';

vi.mock('@apollo/client', async () => {
  const actual = await vi.importActual('@apollo/client');
  return {
    ...actual,
    useQuery: vi.fn(),
    useMutation: vi.fn(),
  };
});

vi.mock('../../../context/AlertContext', () => ({
  useAlerts: vi.fn(),
}));

vi.mock('../../../hooks/useConfirmDialog', () => ({
  useConfirmDialog: vi.fn(),
}));

vi.mock('../../../components/InternshipForm', () => ({
  default: ({
    formSubmitHandler,
  }: {
    formSubmitHandler: (event: React.FormEvent<HTMLFormElement>) => void;
  }) => (
    <form onSubmit={formSubmitHandler}>
      <button type="submit">Mock submit</button>
    </form>
  ),
}));

import { useAlerts } from '../../../context/AlertContext';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
import Internships from '../Internships';

const student = {
  id: 2,
  firstName: 'Opiskelija',
  lastName: 'Testinen',
  groupId: 'TK24',
  studyingQualificationTitle: { name: 'Tietojenkäsittely' },
  studyingQualification: { name: 'Datanomi' },
};

const internshipsData = {
  internships: {
    internships: [
      {
        id: '1',
        info: 'Harjoittelun lisätieto',
        startDate: '2025-01-10',
        endDate: '2025-02-10',
        workplace: {
          id: '10',
          name: 'Yritys Oy',
          jobSupervisor: {
            id: '77',
            firstName: 'Matti',
            lastName: 'Meikäläinen',
            email: 'matti@yritys.fi',
            phoneNumber: '0401234567',
          },
        },
        teacher: {
          id: '1',
          firstName: 'Opettaja',
          lastName: 'Testinen',
        },
        qualificationUnit: {
          id: '100',
          name: 'Tutkinnonosa 1',
        },
      },
    ],
  },
};

describe('Internships', () => {
  const addAlert = vi.fn();
  const confirm = vi.fn();
  const createInternship = vi.fn();
  const deleteInternship = vi.fn();
  const editInternship = vi.fn();
  let mutationCallCount = 0;

  beforeEach(() => {
    vi.clearAllMocks();
    mutationCallCount = 0;

    vi.mocked(useAlerts).mockReturnValue({
      addAlert,
    } as never);

    vi.mocked(useConfirmDialog).mockReturnValue({
      confirm,
      ConfirmDialog: () => <div />,
    });

    vi.mocked(useQuery).mockReturnValue({
      loading: false,
      data: internshipsData,
      error: undefined,
    } as never);

    vi.mocked(useMutation).mockImplementation(() => {
      mutationCallCount += 1;
      if (mutationCallCount % 3 === 1) {
        return [createInternship, { data: undefined, error: undefined, loading: false }] as never;
      }
      if (mutationCallCount % 3 === 2) {
        return [deleteInternship, { data: undefined, error: undefined, loading: false }] as never;
      }
      return [editInternship, { data: undefined, error: undefined, loading: false }] as never;
    });
  });

  it('shows supervisor and qualification columns in the table', async () => {
    render(<Internships student={student as never} />);

    expect(await screen.findByText('Matti Meikäläinen')).toBeInTheDocument();
    expect(screen.getByText('Tutkinnonosa 1')).toBeInTheDocument();
  });

  it('opens info dialog with supervisor contact details', async () => {
    const user = userEvent.setup();

    render(<Internships student={student as never} />);

    await user.click(await screen.findByRole('button', { name: /Tiedot/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Sähköposti: matti@yritys.fi/i)).toBeInTheDocument();
    expect(screen.getByText(/Puhelin: 0401234567/i)).toBeInTheDocument();
  });

  it('blocks invalid create submit and shows validation alert', async () => {
    const user = userEvent.setup();

    render(<Internships student={student as never} />);

    await user.click(screen.getByRole('button', { name: /Lisää harjoittelujakso/i }));
    await user.click(screen.getByRole('button', { name: /Mock submit/i }));

    await waitFor(() => {
      expect(addAlert).toHaveBeenCalledWith(
        'Täytä pakolliset kentät (tutkinnonosa, työpaikka, työpaikkaohjaaja, aloitus- ja lopetusaika).',
        'error',
        true
      );
    });
    expect(createInternship).not.toHaveBeenCalled();
  });
});
