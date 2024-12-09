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
      sx={{
        maxWidth: 1600,
        margin: 'auto',
        padding: 3,
        borderRadius: 2,
        boxShadow: 3,
        backgroundColor: 'white',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          backgroundColor: '#65558F',
          borderRadius: '8px 8px 0 0',
          padding: 2,
          width: 'calc(100% + 17px)',
          marginLeft: '-24px',
          marginTop: '-24px',
        }}
      >
        <Typography variant="h4" align="center" color="white">
          Luo Teema
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          mt: 2,
        }}
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
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  position: 'relative',
                  border: '1px solid #ccc',
                  borderRadius: 1,
                  padding: 1,
                  minHeight: 32,
                }}
              >
              <IconButton
                color="primary"
                sx={{
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              >
                <AddIcon />
              </IconButton>
            </Box>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel sx={{ display: 'flex', position: 'relative', paddingBottom: 3 }}>Projektit</InputLabel>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  position: 'relative',
                  border: '1px solid #ccc',
                  borderRadius: 1,
                  padding: 1,
                  minHeight: 32,
                }}
              >
              <IconButton
                color="primary"
                sx={{
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              >
                <AddIcon />
              </IconButton>
            </Box>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel sx={{ display: 'flex', position: 'relative', paddingBottom: 3 }}>Osaamiset</InputLabel>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  position: 'relative',
                  border: '1px solid #ccc',
                  borderRadius: 1,
                  padding: 1,
                  minHeight: 32,
                }}
              >
              <IconButton
                color="primary"
                sx={{
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              >
                <AddIcon />
              </IconButton>
            </Box>
          </FormControl>
        </Box>
      </Box>

      <Box textAlign={'center'} sx={{ mt: 2 }}>
        <IconButton
          sx={{
            backgroundColor: '#65558F',
            color: '#fff',
            borderRadius: 5,
            mt: 3,
            width: 1 / 4,
            padding: 1,
            fontSize: '1rem',
            fontWeight: 400,
            '&:hover': {
                backgroundColor: '#4e4574',
            },
            boxShadow: 3,
          }}
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
