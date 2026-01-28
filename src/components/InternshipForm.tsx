import { Box, IconButton, MenuItem, TextField, Typography } from "@mui/material"
import { InternshipWithoutId } from "./Routes/Internships"
import formStyles from "../styles/formStyles"
import { Dispatch, SetStateAction, useEffect } from "react"

import SaveSharpIcon from '@mui/icons-material/SaveSharp';
import buttonStyles from "../styles/buttonStyles";
import { useLazyQuery, useQuery } from "@apollo/client";
import { GET_INTERNSHIP_DATA } from "../graphql/GetInternshipData";
import { GET_JOB_SUPERVISORS_BY_WORKPLACE } from "../graphql/GetJobSupervisorsByWorkplace";
import { JobSupervisor, Student, Workplace } from "../types";
import Autocomplete, { Option } from "./common/Autocomplete";

interface InternshipFormProps {
  formSubmitHandler: (event: React.FormEvent<HTMLFormElement>) => void
  student: Student
  formData: InternshipWithoutId
  setFormData: Dispatch<SetStateAction<InternshipWithoutId>>
  workplaceId: string | null,
  setWorkplaceId: Dispatch<SetStateAction<string | null>>
}

const InternshipForm = ({
  formSubmitHandler,
  formData,
  setFormData,
  student,
  workplaceId,
  setWorkplaceId,
}: InternshipFormProps) => {
  const { loading, data, error } = useQuery(GET_INTERNSHIP_DATA)
  const [loadSupervisors, jobSupervisorsData] = useLazyQuery(GET_JOB_SUPERVISORS_BY_WORKPLACE, {
    variables: { workplaceId: workplaceId }
  })

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prevFormData: InternshipWithoutId) => ({
      ...prevFormData,
      [name]: value
    }));
  };

  // Preload teacherId and studentId for formData
  useEffect(() => {
    if (!loading && !error && data) {
      setFormData((prevFormData: InternshipWithoutId) => ({
        ...prevFormData,
        teacherId: data.me?.user.id as unknown as string,
        studentId: student.id as unknown as string,
      }))
    }
  }, [data, setFormData, student, loading, error])

  useEffect(() => {
    if (workplaceId) {
      loadSupervisors()
    }
  }, [workplaceId, loadSupervisors])

  if (loading) {
    return <Box><Typography>Loading...</Typography></Box>
  }

  if (error) {
    return <Box><Typography>Error: {error.message}</Typography></Box>
  }

  const teacher = data.me?.user || null
  const workplaces = data.workplaces?.workplaces || []
  const qualificationUnits = data.units?.units || []

  const jobSupervisors = jobSupervisorsData.data?.jobSupervisorsByWorkplace.jobSupervisors || []

  const workplaceOptions: Option[] = workplaces.map((workplace: Workplace) => ({
    id: workplace.id,
    name: workplace.name
  }))

  const jobSupervisorOptions: Option[] = jobSupervisors?.map((jobSupervisor: JobSupervisor) => ({
    id: jobSupervisor.id,
    name: `${jobSupervisor.firstName} ${jobSupervisor.lastName}`
  }))

  return (
    <Box
      component="form"
      onSubmit={formSubmitHandler}
      textAlign={'center'}
    >
      <Box
        sx={formStyles.formColumnBox}
      >
        <Box sx={{ flex: 1 }}>
          <TextField
            label="Opettaja"
            variant="outlined"
            value={`${teacher.firstName} ${teacher.lastName}`}
            fullWidth
            disabled
            sx={{ my: 2 }}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Opiskelija"
            variant="outlined"
            value={`${student.firstName} ${student.lastName}`}
            fullWidth
            disabled
            sx={{ my: 2 }}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            value={formData.qualificationUnitId}
            onChange={handleChange}
            name="qualificationUnitId"
            label='Tutkinnonosa'
            select
            fullWidth
            sx={{ my: 2 }}
            slotProps={{
              htmlInput: {
                sx: {
                  textAlign: "left",
                },
              },
            }}
          >
            {qualificationUnits.map((unit: { id: string; name: string }) => (
              <MenuItem
                key={unit.id}
                value={unit.id}
              >
                {unit.name}
              </MenuItem>
            ))}
          </TextField>

          <Autocomplete
            sx={{ mb: 2 }}
            id="workplace"
            label="Työpaikka"
            options={workplaceOptions}
            value={workplaceOptions.find(option => option.id === formData.workplaceId) || null}
            onChange={(_event, newValue: Option | null) => {
              setFormData((prevFormData: InternshipWithoutId) => ({
                ...prevFormData,
                workplaceId: newValue ? String(newValue.id) : "",
              }));
              setWorkplaceId(newValue ? String(newValue.id) : null);
            }}
            defaultValue={workplaceOptions.find(option => option.id === formData.workplaceId) || undefined}
            noOptionsText="Ei löytynyt yhtään työpaikkaa"
            required
          />
          {formData.workplaceId &&
            <Autocomplete
              sx={{ mb: 2 }}
              id="jobSupervisor"
              label="Työpaikkaohjaaja"
              options={jobSupervisorOptions}
              value={jobSupervisorOptions.find(option => option.id === formData.jobSupervisorId) || null}
              onChange={(_event, newValue: Option | null) => {
                setFormData((prevFormData: InternshipWithoutId) => ({
                  ...prevFormData,
                  jobSupervisorId: newValue ? String(newValue.id) : "",
                }));
              }}
              defaultValue={jobSupervisorOptions.find(option => option.id === formData.jobSupervisorId) || undefined}
              noOptionsText="Ei löytynyt yhtään työpaikkaohjaajaa"
              required
            />
          }

          <TextField
            type="date"
            label="Milloin alkaa"
            variant="outlined"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            fullWidth
            required
            sx={{ my: 2 }}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            type="date"
            label="Milloin loppuu"
            variant="outlined"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            fullWidth
            required
            sx={{ my: 2 }}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Lisätietoja"
            variant="outlined"
            name="info"
            value={formData.info}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
            sx={{ my: 2 }}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <IconButton
            type="submit"
            sx={{ ...buttonStyles.saveButton, px: 10 }}
          >
            <SaveSharpIcon
              sx={{
                mr: 1,
              }}
            />
            Tallenna
          </IconButton>
        </Box>
      </Box>
    </Box>
  )
}

export default InternshipForm
