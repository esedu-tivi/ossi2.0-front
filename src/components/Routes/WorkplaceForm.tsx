import { Box, IconButton, TextField, Typography } from "@mui/material"
import formStyles from "../../styles/formStyles"
import buttonStyles from "../../styles/buttonStyles"
//import { useNavigate } from "react-router-dom"
import SaveSharpIcon from '@mui/icons-material/SaveSharp';
import ArrowBackIosSharpIcon from '@mui/icons-material/ArrowBackIosSharp';

interface WorkplaceFormProps {
  formData: { name: string }
  setFormData: React.Dispatch<React.SetStateAction<{ name: string }>>
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  setShowForm: () => void
  formTitle: string
  submitText: string
  loading: boolean
}

const WorkplaceForm = ({
  formData,
  setFormData,
  handleSubmit,
  setShowForm,
  formTitle,
  submitText,
  loading,
}: WorkplaceFormProps) => {

  //const navigate = useNavigate();


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
