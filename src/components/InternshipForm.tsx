import { Box, IconButton, MenuItem, TextField, Typography } from "@mui/material"
import { InternshipFormDataWithoutId } from "./Routes/Internships"
import formStyles from "../styles/formStyles"
import { Dispatch, SetStateAction, useEffect } from "react"

import ArrowBackIosSharpIcon from '@mui/icons-material/ArrowBackIosSharp';
import SaveSharpIcon from '@mui/icons-material/SaveSharp';
import buttonStyles from "../styles/buttonStyles";
import { useQuery } from "@apollo/client";
import { StudentData } from "./common/studentHelpers";
import { GET_INTERNSHIP_DATA } from "../graphql/GetInternshipData";

interface InternshipFormProps {
  formTitle: string
  formSubmitHandler: (event: React.FormEvent<HTMLFormElement>) => void
  setShowForm: Dispatch<SetStateAction<boolean>>
  student: StudentData
  formData: InternshipFormDataWithoutId
  setFormData: Dispatch<SetStateAction<InternshipFormDataWithoutId>>
}

const InternshipForm = ({
  formSubmitHandler,
  formData,
  setFormData,
  setShowForm,
  formTitle,
  student,
}: InternshipFormProps) => {

  const { loading, data, error } = useQuery(GET_INTERNSHIP_DATA)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value
    }));
  };

  // Preload teacherId and studentId for formData
  useEffect(() => {
    if (!loading && !error && data) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        teacherId: data.me?.user.id as unknown as string,
        studentId: student.id as unknown as string,
      }))
    }
  }, [data, setFormData, student, loading, error])

  if (loading) {
    return <div>loading</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  const teacher = data.me?.user || null
  const workplaces = data.workplaces?.workplaces || null
  const qualificationUnits = data.units?.units || null

  return (
    <Box
      component="form"
      onSubmit={formSubmitHandler}
      textAlign={'center'}
      sx={formStyles.formOuterBox}
    >
      <Box sx={{ ...formStyles.formBannerBox, textAlign: "center", marginBottom: 3, position: 'relative', }}>
        <IconButton
          onClick={() => setShowForm(false)}
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
          <TextField
            value={formData.workplaceId}
            onChange={handleChange}
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
          {formData.workplaceId &&
            <TextField
              label="Työpaikka ohjaaja"
              variant="outlined"
              name="jobSupervisorId"
              value={formData.jobSupervisorId}
              onChange={handleChange}
              fullWidth
              sx={{ my: 2 }}
            />}
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
          </IconButton>
        </Box>
      </Box>
    </Box>
  )
}

export default InternshipForm
