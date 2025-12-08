import { Box, IconButton, MenuItem, TextField, Typography } from "@mui/material"
import { InternshipWithoutId } from "./Routes/Internships"
import formStyles from "../styles/formStyles"
import { Dispatch, SetStateAction, useEffect, useState } from "react"

import SaveSharpIcon from '@mui/icons-material/SaveSharp';
import buttonStyles from "../styles/buttonStyles";
import { useLazyQuery, useQuery } from "@apollo/client";
import { StudentData } from "./common/studentHelpers";
import { GET_INTERNSHIP_DATA } from "../graphql/GetInternshipData";
import { GET_JOB_SUPERVISORS_BY_WORKPLACE } from "../graphql/GetJobSupervisorsByWorkplace";

interface InternshipFormProps {
  formSubmitHandler: (event: React.FormEvent<HTMLFormElement>) => void
  student: StudentData
  formData: InternshipWithoutId
  setFormData: Dispatch<SetStateAction<InternshipWithoutId>>
}

const InternshipForm = ({
  formSubmitHandler,
  formData,
  setFormData,
  student,
}: InternshipFormProps) => {

  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState<string | null>(null)

  const { loading, data, error } = useQuery(GET_INTERNSHIP_DATA)
  const [loadSupervisors, jobSupervisorsData] = useLazyQuery(GET_JOB_SUPERVISORS_BY_WORKPLACE, {
    variables: { workplaceId: selectedWorkplaceId }
  })

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prevFormData: InternshipWithoutId) => ({
      ...prevFormData,
      [name]: value
    }));
  };

  const workplaceHandleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSelectedWorkplaceId(event.target.value)
    loadSupervisors()
    handleChange(event)
  }

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
          {workplaces.length ?
            <TextField
              value={formData.workplaceId}
              onChange={workplaceHandleChange}
              name="workplaceId"
              label='Työpaikka'
              required
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

              {workplaces.map((workplace: { id: string; name: string }) => (
                <MenuItem
                  key={workplace.id}
                  value={workplace.id}
                >
                  {workplace.name}
                </MenuItem>
              ))}
            </TextField>
            : <Box><Typography color="error">Ei yhtään työpaikkaa löytynyt</Typography></Box>}
          {formData.workplaceId &&
            <TextField
              value={formData.jobSupervisorId}
              onChange={handleChange}
              name="jobSupervisorId"
              label='Työpaikka ohjaaja'
              required
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
              {jobSupervisorsData.loading
                ? <Typography>loading...</Typography>
                : jobSupervisors.map((jobSupervisor: { id: string; firstName: string, lastName: string, email: string }) => (
                  <MenuItem
                    key={jobSupervisor.id}
                    value={jobSupervisor.id}
                  >
                    {`${jobSupervisor.firstName} ${jobSupervisor.lastName}`}
                  </MenuItem>
                ))}
            </TextField>
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
            sx={buttonStyles.saveButton}
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
