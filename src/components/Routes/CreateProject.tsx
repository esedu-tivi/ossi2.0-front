import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Switch,
  IconButton,
  MenuItem,
  Typography,
  Chip,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { FormData } from '../../FormData';
import { useMutation } from '@apollo/client';
import { CREATE_PROJECT } from '../../graphql/CreateProject';

const NewProjectForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    materials: '',
    osaamiset: [],
    duration: 0,
    tags: [],
    includedInParts: [],
    isActive: false,
  });

  const [createProject, { loading, error, data }] = useMutation(CREATE_PROJECT);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleToggleActivity = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, isActive: e.target.checked });
  };

  const handleAddItem = (field: keyof Pick<FormData, 'tags' | 'osaamiset' | 'includedInParts'>) => {
    const newItem = prompt(`Lisää ${field}:`);
    if (newItem) {
      setFormData({
        ...formData,
        [field]: [...formData[field], newItem] as string[],
      });
    }
  };

  const handleRemoveItem = (field: keyof Pick<FormData, 'tags' | 'osaamiset' | 'includedInParts'>, index: number) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index),
    });
  };

  const handleAvailableTimeChange = (event: SelectChangeEvent<string | number>) => {
    const newValue = Number(event.target.value);
    setFormData({
      ...formData,
      duration: newValue,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const response = await createProject({
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
      component="form"
      onSubmit={handleSubmit}
      textAlign={'center'}
      sx={{
        maxWidth: 800,
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
          Luo Projekti
        </Typography>
      </Box>

      <TextField
        label="Projektin nimi"
        variant="outlined"
        name="name"
        value={formData.name}
        onChange={handleChange}
        fullWidth
        sx={{ my: 2 }}
      />

      <FormControl fullWidth>
        <InputLabel sx={{ display: 'flex', position: 'relative', paddingBottom: 3 }}>Teemat</InputLabel>
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
          {formData.osaamiset.map((osaaminen, index) => (
            <Chip
              key={index}
              label={osaaminen}
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
        <InputLabel sx={{ display: 'flex', position: 'relative', paddingBottom: 3 }}>Tunnisteet</InputLabel>
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

      <TextField
        label="Materiaalit"
        variant="outlined"
        name="materials"
        value={formData.materials}
        onChange={handleChange}
        fullWidth
        multiline
        rows={3}
        sx={{ my: 2 }}
      />

      <TextField
        label="Projektin kuvaus"
        variant="outlined"
        name="description"
        value={formData.description}
        onChange={handleChange}
        fullWidth
        multiline
        rows={4}
        sx={{ my: 2 }}
      />

      <FormControl fullWidth sx={{ my: 2 }}>
        <InputLabel>Ajankäyttö</InputLabel>
        <Select
          value={formData.duration}
          onChange={handleAvailableTimeChange}
          displayEmpty
          label="Ajankäyttö"
        >
          <MenuItem value={0}>Ei määriteltyä aikaa</MenuItem>
          <MenuItem value={10}>10 tuntia</MenuItem>
          <MenuItem value={20}>20 tuntia</MenuItem>
          <MenuItem value={30}>30 tuntia</MenuItem>
          <MenuItem value={40}>40 tuntia</MenuItem>
          <MenuItem value={50}>50 tuntia</MenuItem>
        </Select>
      </FormControl>

      <Box display="flex" alignItems="center" sx={{ my: 2 }}>
        <Typography>Projektin tila</Typography>
        <Switch
          checked={formData.isActive}
          onChange={handleToggleActivity}
          name="isActive"
          color="primary"
          sx={{ ml: 2 }}
        />
        <Typography>{formData.isActive ? 'Aktiivinen' : 'Ei aktiivinen'}</Typography>
      </Box>

      <Button 
        type="submit" 
        variant="contained" 
        sx={{ backgroundColor: '#65558F', borderRadius: 5, mt: 3, width: 1/4, padding: 1 }}
      >
        {loading ? 'Submitting...' : 'Luo Projekti'}
      </Button>
      {error && <Typography color="error">Virhe: {error.message}</Typography>}
      {data && <Typography color="success">Projekti lisätty</Typography>}
    </Box>
  );
};

export default NewProjectForm;
