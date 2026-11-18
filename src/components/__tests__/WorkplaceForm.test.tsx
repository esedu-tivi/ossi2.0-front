import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import WorkplaceForm from '../WorkplaceForm';

const mockFormData = {
  id: null,
  name: '',
  jobSupervisorIds: [],
};

describe('WorkplaceForm', () => {
  it('renders workplace name input', () => {
    render(
      <WorkplaceForm
        formData={mockFormData}
        setFormData={vi.fn()}
        handleSubmit={vi.fn()}
        submitButtonTitle="Tallenna"
      />
    );

    expect(screen.getByLabelText(/Työpaikan nimi/i)).toBeInTheDocument();
  });

  it('renders save button with provided title', () => {
    render(
      <WorkplaceForm
        formData={mockFormData}
        setFormData={vi.fn()}
        handleSubmit={vi.fn()}
        submitButtonTitle="Luo työpaikka"
      />
    );

    expect(screen.getByRole('button', { name: /Luo työpaikka/i })).toBeInTheDocument();
  });

  it('displays the current form data name value', () => {
    render(
      <WorkplaceForm
        formData={{ ...mockFormData, name: 'Testitoimisto' }}
        setFormData={vi.fn()}
        handleSubmit={vi.fn()}
        submitButtonTitle="Tallenna"
      />
    );

    expect(screen.getByDisplayValue('Testitoimisto')).toBeInTheDocument();
  });
});
