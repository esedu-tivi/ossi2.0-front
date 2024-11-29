import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Box,
  Switch,
  IconButton,
  Typography,
  Chip,
  FormControl,
  InputLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DriveFolderUploadSharpIcon from '@mui/icons-material/DriveFolderUploadSharp';
import UndoSharpIcon from '@mui/icons-material/UndoSharp';
import SaveAsSharpIcon from '@mui/icons-material/SaveAsSharp';
import { EditProjectFormData } from '../../FormData';
import { useMutation } from '@apollo/client';
import { UPDATE_PROJECT } from '../../graphql/UpdateProject';

const EditProject: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<EditProjectFormData>({
    name: '',
    description: '',
    materials: '',
    osaamiset: [],
    duration: 0,
    tags: [],
    includedInParts: [],
    isActive: false,
    changeNotification: false,
    changeNotificationText: '',
  });

  const [updateProject, { loading, error, data }] = useMutation(UPDATE_PROJECT);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'duration' ? (value === '' ? '' : Number(value)) : value,
    });
  };

  const handleToggleActivity = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, isActive: e.target.checked });
  };

  const handleChangeNotification = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      changeNotification: checked,
      changeNotificationText: checked ? prev.changeNotificationText : '',
    }));
  };

  const handleAddItem = (field: keyof Pick<EditProjectFormData, 'tags' | 'osaamiset' | 'includedInParts'>) => {
    const newItem = prompt(`Lisää ${field}:`);
    if (newItem) {
      setFormData({
        ...formData,
        [field]: [...formData[field], newItem] as string[],
      });
    }
  };

  const handleRemoveItem = (field: keyof Pick<EditProjectFormData, 'tags' | 'osaamiset' | 'includedInParts'>, index: number) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const response = await updateProject({
        variables: {
          project: {
            name: formData.name,
            description: formData.description,
            materials: formData.materials,
            osaamiset: formData.osaamiset,
            includedInParts: formData.includedInParts,
            tags: formData.tags,
            isActive: formData.isActive,
          },
        },
      });
      console.log('GraphQL Response:', response.data);
    } catch (err) {
      console.error('Submission Error:', err);
    }
  };

  return (
    <Box
      textAlign={'right'}
      sx={{
        maxWidth: 1600,
        margin: 'auto',
        padding: 3,
        position: 'relative',
      }}
    >
      <IconButton
        onClick={() => navigate("/teacherprojects")}
        sx={{
          backgroundColor: '#65558F',
          color: '#fff',
          borderRadius: 5,
          width: 1 / 6,
          padding: 1,
          mb: 2,
          fontSize: '1rem',
          fontWeight: 400,
          '&:hover': {
            backgroundColor: '#4e4574',
          },
          boxShadow: 3,
        }}
      >
        <UndoSharpIcon 
          sx={{
            mr: 1
          }} 
        />
        Hylkää muutokset
      </IconButton>

      <IconButton
        sx={{
          backgroundColor: '#65558F',
          color: '#fff',
          borderRadius: 5,
          width: 1 / 10,
          padding: 1,
          ml: 3,
          mb: 2,
          fontSize: '1rem',
          fontWeight: 400,
          '&:hover': {
            backgroundColor: '#4e4574',
          },
          boxShadow: 3,
        }}
      >
        <DriveFolderUploadSharpIcon
          sx={{
            mr: 1
          }} 
        />
        Arkistoi
      </IconButton>

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
            marginTop: '-24px'
          }}
        >
          <Typography variant="h4" align="center" color="white">
            Muokkaa projektia
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
            <TextField
              label="Projektin nimi"
              variant="outlined"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
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

            <TextField
              label="Projektin kuvaus"
              variant="outlined"
              name="projectInfo"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={10}
              sx={{ my: 2 }}
            />

            {formData.changeNotification && (
              <TextField
                label="Muutosilmoitus"
                variant="outlined"
                name="changeNotificationText"
                value={formData.changeNotificationText}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                sx={{ my: 2 }}
              />
            )}
          </Box>

          <Box sx={{ flex: 1 }}>
            <TextField
              label="Ajankäyttö"
              variant="outlined"
              name="duration"
              type="number"
              value={formData.duration}
              onChange={handleChange}
              fullWidth
              sx={{ my: 2 }}
            />

            <FormControl fullWidth>
              <InputLabel sx={{ 
                display: 'flex', 
                position: 'relative', 
                paddingBottom: 3 
                }}>
                Teemat
              </InputLabel>
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
                {formData.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => handleRemoveItem('tags', index)}
                    sx={{ backgroundColor: '#E0E0E0' }}
                  />
                ))}
                <IconButton
                  onClick={() => handleAddItem('tags')}
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
              <InputLabel sx={{ 
                display: 'flex', 
                position: 'relative', 
                paddingBottom: 3 
                }}>
                Osaamiset
              </InputLabel>
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
                {formData.osaamiset.map((exp, index) => (
                  <Chip
                    key={index}
                    label={exp}
                    onDelete={() => handleRemoveItem('osaamiset', index)}
                    sx={{ backgroundColor: '#E0E0E0' }}
                  />
                ))}
                <IconButton
                  onClick={() => handleAddItem('osaamiset')}
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

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel sx={{ 
                display: 'flex', 
                position: 'relative', 
                paddingBottom: 3 
                }}>
                Tunnisteet
              </InputLabel>
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
                {formData.includedInParts.map((parts, index) => (
                  <Chip
                    key={index}
                    label={parts}
                    onDelete={() => handleRemoveItem('includedInParts', index)}
                    sx={{ backgroundColor: '#E0E0E0' }}
                  />
                ))}
                <IconButton
                  onClick={() => handleAddItem('includedInParts')}
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

            <FormControl
              sx={{
                maxWidth: 300,
                display: 'flex',
                flexDirection: 'column',
                my: 1,
                border: '1px solid #ccc',
                borderRadius: 1,
                padding: 2,
              }}
            >
              <Typography sx={{ mb: 1, textAlign: 'left' }}>
                Projektin tila
              </Typography>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography>{formData.isActive ? 'Aktiivinen' : 'Ei aktiivinen'}</Typography>
                <Switch
                  checked={formData.isActive}
                  onChange={handleToggleActivity}
                  name="isActive"
                  color="primary"
                />
              </Box>
            </FormControl>

            <FormControl
              sx={{
                maxWidth: 300,
                display: 'flex',
                flexDirection: 'column',
                my: 1,
                border: '1px solid #ccc',
                borderRadius: 1,
                padding: 2,
              }}
            >
              <Typography sx={{ mb: 1, textAlign: 'left' }}>
                Muutosilmoitus
              </Typography>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography>{formData.changeNotification 
                  ? 'Ilmoitetaan opiskelijoille' 
                  : 'Ei ilmoiteta'}
                </Typography>
                <Switch
                  checked={formData.changeNotification}
                  onChange={handleChangeNotification}
                  name="changeNotification"
                  color="primary"
                />
              </Box>
            </FormControl>
          </Box>
        </Box>

        <IconButton 
          type="submit" 
          sx={{ 
            backgroundColor: '#65558F', 
            color: '#fff',
            borderRadius: 5, 
            mt: 3, 
            width: 1/4, 
            padding: 1,
            fontSize: '1rem',
            fontWeight: 400,
            '&:hover': {
            backgroundColor: '#4e4574',
            },
            boxShadow: 3,
          }}
        >
          <SaveAsSharpIcon
            sx={{
              mr: 1
            }} 
          />
          {loading ? 'Submitting...' : 'Tallenna muutokset'}
        </IconButton>
        {error && <Typography color="error">Virhe: {error.message}</Typography>}
        {data && <Typography color="success">Projekti päivitetty</Typography>}
      </Box>
    </Box>
  );
};

export default EditProject;
