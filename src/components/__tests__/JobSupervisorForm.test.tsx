import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import JobSupervisorForm from '../JobSupervisorForm';

const mockFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
};

describe('JobSupervisorForm', () => {
  it('renders all form fields', () => {
    render(
      <JobSupervisorForm
        formData={mockFormData}
        setFormData={vi.fn()}
        handleSubmit={vi.fn()}
        submitButtonTitle="Tallenna"
      />
    );

    expect(screen.getByLabelText(/Etunimi/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sukunimi/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sähköposti/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Puhelinnumero/i)).toBeInTheDocument();
  });

  it('renders save button with provided title', () => {
    render(
      <JobSupervisorForm
        formData={mockFormData}
        setFormData={vi.fn()}
        handleSubmit={vi.fn()}
        submitButtonTitle="Lisää työpaikkaohjaaja"
      />
    );

    expect(screen.getByRole('button', { name: /Lisää työpaikkaohjaaja/i })).toBeInTheDocument();
  });

  it('displays form data values in inputs', () => {
    const filledFormData = {
      firstName: 'Matti',
      lastName: 'Meikäläinen',
      email: 'matti@example.fi',
      phoneNumber: '0401234567',
    };

    render(
      <JobSupervisorForm
        formData={filledFormData}
        setFormData={vi.fn()}
        handleSubmit={vi.fn()}
        submitButtonTitle="Tallenna"
      />
    );

    expect(screen.getByDisplayValue('Matti')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Meikäläinen')).toBeInTheDocument();
    expect(screen.getByDisplayValue('matti@example.fi')).toBeInTheDocument();
    expect(screen.getByDisplayValue('0401234567')).toBeInTheDocument();
  });
});
