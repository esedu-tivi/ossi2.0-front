import { Autocomplete, Box, Chip, IconButton, SelectChangeEvent, TextField } from "@mui/material"
import formStyles from "../styles/formStyles"
import buttonStyles from "../styles/buttonStyles"
import SaveSharpIcon from '@mui/icons-material/SaveSharp';
import React from "react";
import { JobSupervisor } from "../types";

interface JobSupervisorWithId extends JobSupervisor {
  id: string
}

export interface WorkplaceFormData {
  id: string | number | null
  name: string;
  jobSupervisorIds: string[]
}

interface WorkplaceFormProps {
  formData: WorkplaceFormData
  setFormData: React.Dispatch<React.SetStateAction<WorkplaceFormData>>
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  submitButtonTitle: string
  jobSupervisors?: JobSupervisorWithId[]
}

interface JobSupervisorFieldProps {
  formData: WorkplaceFormData
  onChange: (event: SelectChangeEvent<string[]>) => void
  jobSupervisors: JobSupervisorWithId[]
}

const SupervisorField = ({ formData, onChange, jobSupervisors }: JobSupervisorFieldProps) => {
  return (
    <Box textAlign={"left"}>
      <Autocomplete
        multiple
        options={jobSupervisors}
        getOptionLabel={(option) => (`${option.firstName} ${option.lastName}`)}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip label={`${option.firstName} ${option.lastName}`} {...getTagProps({ index })} key={option.id} />
          ))
        }
        renderInput={(params) => <TextField {...params} label="Työpaikkaohjaajat" />}
        value={jobSupervisors.filter(jobSupervisor => formData.jobSupervisorIds.includes(jobSupervisor.id))}
        noOptionsText="Ei yhtään työpaikkaohjaajaa"
        onChange={(_, value) => {
          onChange({
            target: {
              name: "jobSupervisorIds",
              value: value.map((jobSupervisor: JobSupervisor) => jobSupervisor.id)
            }
          } as SelectChangeEvent<string[]>);
        }}
      />
    </Box>
  )
}

const WorkplaceForm = ({
  formData,
  setFormData,
  handleSubmit,
  jobSupervisors,
  submitButtonTitle
}: WorkplaceFormProps) => {

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string[]>
  ) => {
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
      <Box sx={formStyles.formColumnBox}
      >
        <Box sx={{ flex: 1 }}>
          <TextField
            label="Työpaikan nimi"
            variant="outlined"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
            sx={{ my: 2 }}
          />
          {(jobSupervisors && <SupervisorField jobSupervisors={jobSupervisors} formData={formData} onChange={handleChange} />)}
          <IconButton
            type="submit"
            sx={{ ...buttonStyles.saveButton, px: 10 }}
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

export default WorkplaceForm
