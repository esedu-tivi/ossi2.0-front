import { Box, FormControl, IconButton, InputLabel, MenuItem, Select, SelectChangeEvent, TextField, Typography } from "@mui/material"
import formStyles from "../../styles/formStyles"
import buttonStyles from "../../styles/buttonStyles"
import SaveSharpIcon from '@mui/icons-material/SaveSharp';
import ArrowBackIosSharpIcon from '@mui/icons-material/ArrowBackIosSharp';
import { WorkplaceFormData } from "./Workplaces";
import React from "react";
import { JobSupervisor } from "../common/teacherHelpers";

interface WorkplaceFormProps {
  formData: WorkplaceFormData
  setFormData: React.Dispatch<React.SetStateAction<WorkplaceFormData>>
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  setShowForm: () => void
  formTitle: string
  submitText: string
  loading: boolean
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
          Työpaikka ohjaajat
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
  setShowForm,
  formTitle,
  submitText,
  loading,
  jobSupervisors
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
      sx={formStyles.formOuterBox}
    >
      <Box sx={{ ...formStyles.formBannerBox, textAlign: "center", marginBottom: 3, position: 'relative', }}>
        <IconButton
          onClick={setShowForm}
          sx={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'white',
          }}
        >
          <ArrowBackIosSharpIcon sx={{ fontSize: 36 }} />
        </IconButton>
        <Typography variant="h4" align="center" color="white">
          {formTitle}
        </Typography>
      </Box>
      <Box
        sx={formStyles.formColumnBox}
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
            sx={buttonStyles.saveButton}
          >
            <SaveSharpIcon
              sx={{
                mr: 1,
              }}
            />
            {loading ? 'Submitting...' : submitText}
          </IconButton>
        </Box>
      </Box>
    </Box>
  )
}

export default WorkplaceForm
