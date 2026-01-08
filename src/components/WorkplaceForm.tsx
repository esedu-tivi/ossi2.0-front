import { Box, FormControl, IconButton, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from "@mui/material"
import formStyles from "../styles/formStyles"
import buttonStyles from "../styles/buttonStyles"
import SaveSharpIcon from '@mui/icons-material/SaveSharp';
import React from "react";
import { JobSupervisor } from "../types";

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
  jobSupervisors?: JobSupervisor[]
}

interface JobSupervisorFieldProps {
  formData: WorkplaceFormData
  onChange: (event: SelectChangeEvent<string[]>) => void
  jobSupervisors: JobSupervisor[]
}

const SupervisorField = ({ formData, onChange, jobSupervisors }: JobSupervisorFieldProps) => {
  return (
    <Box textAlign={"left"}>
      <FormControl fullWidth>
        <InputLabel shrink={true} id="jobSupervisor-label">
          Työpaikkaohjaajat
        </InputLabel>
        <Select
          labelId="jobSupervisor-label"
          variant="outlined"
          name="jobSupervisorIds"
          value={formData.jobSupervisorIds}
          onChange={onChange}
          fullWidth
          multiple
          sx={{ my: 2 }}
        >
          {jobSupervisors.length > 0 && jobSupervisors.map((jobSupervisor: JobSupervisor) => (
            <MenuItem
              key={jobSupervisor.id}
              value={jobSupervisor.id}
            >
              {`${jobSupervisor.firstName} ${jobSupervisor.lastName}`}
            </MenuItem>
          ))}
        </Select></FormControl>
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
