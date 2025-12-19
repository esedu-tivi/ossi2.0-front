import { Box, IconButton, TextField } from "@mui/material";
import SaveSharpIcon from '@mui/icons-material/SaveSharp';
import buttonStyles from "../styles/buttonStyles";
import formStyles from "../styles/formStyles";
import { JobSupervisor } from "../types";

export type JobSupervisorFormData = Omit<JobSupervisor, "id"> & { phoneNumber: string }

interface JobSupervisorFormProps {
  formData: JobSupervisorFormData
  setFormData: React.Dispatch<React.SetStateAction<JobSupervisorFormData>>
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  submitButtonTitle: string
}

const JobSupervisorForm = ({
  formData,
  setFormData,
  handleSubmit,
  submitButtonTitle
}: JobSupervisorFormProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value
    }));
  };
  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      textAlign={'center'}
    >
      <Box
        sx={formStyles.formColumnBox}
      >
        <Box sx={{ flex: 1 }}>
          <TextField
            label="Etunimi"
            variant="outlined"
            name="firstName"
            value={formData.firstName}
            fullWidth
            required
            onChange={handleChange}
            sx={{ my: 2 }}
          />
          <TextField
            label="Sukunimi"
            variant="outlined"
            name="lastName"
            value={formData.lastName}
            fullWidth
            required
            onChange={handleChange}
            sx={{ my: 2 }}
          />
          <TextField
            label="Sähköposti"
            variant="outlined"
            name="email"
            value={formData.email}
            fullWidth
            required
            onChange={handleChange}
            sx={{ my: 2 }}
          />
          <TextField
            label="Puhelinnumero"
            variant="outlined"
            name="phoneNumber"
            value={formData.phoneNumber}
            fullWidth
            onChange={handleChange}
            sx={{ my: 2 }}
          />

          <IconButton
            type="submit"
            sx={buttonStyles.saveButton}
          >
            <SaveSharpIcon
              sx={{
                mr: 1,
              }}
            />
            {submitButtonTitle}
          </IconButton>
        </Box>
      </Box>
    </Box>
  )
}

export default JobSupervisorForm
