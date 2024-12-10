import React, { useState } from 'react';
import {
  TextField,
  Box,
  IconButton,
  Typography,
  FormControl,
  InputLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveSharpIcon from '@mui/icons-material/SaveSharp';
import { useNavigate } from 'react-router-dom';
import { CreatePartFormData } from '../../FormData';
import formStyles from '../../styles/formStyles';
import buttonStyles from '../../styles/buttonStyles';

const CreatePart: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreatePartFormData>({
    name: '',
    description: '',
    materials: '',
    osaamiset: [],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log('Nothing to see here yet');
      navigate('/qualificationunitparts');
    } catch (err) {
      console.error('Submission Error:', err);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      textAlign={'center'}
      sx={formStyles.formOuterBox}
    >
      <Box
        sx={formStyles.formBannerBox}
      >
        <Typography variant="h4" align="center" color="white">
          Luo Teema
        </Typography>
      </Box>
      <Box
        sx={formStyles.formColumnBox}
      >
        <Box sx={{ flex: 1 }}>
          <TextField label="Teeman nimi" variant="outlined" name="name" value={formData.name} onChange={handleChange} fullWidth sx={{ my: 2 }} />

          <TextField
            label="Teeman kuvaus"
            variant="outlined"
            name="description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={10}
            sx={{ my: 2 }}
          />

          <TextField
            label="Materiaalit"
            variant="outlined"
            name="materials"
            value={formData.materials}
            onChange={handleChange}
            fullWidth
            multiline
            rows={10}
            sx={{ my: 2 }}
          />
        </Box>

        <Box sx={{ flex: 1 }}>
          <FormControl fullWidth>
            <InputLabel sx={{ display: 'flex', position: 'relative', paddingBottom: 3 }}>Tutkinnon osa</InputLabel>
              <Box
                sx={formStyles.formModalInputBox}
              >
              <IconButton
                color="primary"
                sx={buttonStyles.openModalButton}
              >
                <AddIcon />
              </IconButton>
            </Box>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel sx={{ display: 'flex', position: 'relative', paddingBottom: 3 }}>Projektit</InputLabel>
              <Box
                sx={formStyles.formModalInputBox}
              >
              <IconButton
                color="primary"
                sx={buttonStyles.openModalButton}
              >
                <AddIcon />
              </IconButton>
            </Box>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel sx={{ display: 'flex', position: 'relative', paddingBottom: 3 }}>Osaamiset</InputLabel>
              <Box
                sx={formStyles.formModalInputBox}
              >
              <IconButton
                color="primary"
                sx={buttonStyles.openModalButton}
              >
                <AddIcon />
              </IconButton>
            </Box>
          </FormControl>
        </Box>
      </Box>

      <Box textAlign={'center'} sx={{ mt: 2 }}>
        <IconButton
          sx={buttonStyles.saveButton}
          type="submit"
        >
          <SaveSharpIcon 
            sx={{
              mr: 1,
            }}
          />
          Luo Teema
        </IconButton>
      </Box>
    </Box>
  );
};

export default CreatePart;
