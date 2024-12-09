import React, { useState, useEffect } from 'react';
import {
  TextField,
  Box,
  IconButton,
  Typography,
  FormControl,
  InputLabel,
  Switch,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import UndoSharpIcon from '@mui/icons-material/UndoSharp';
import SaveAsSharpIcon from '@mui/icons-material/SaveAsSharp';
import DriveFolderUploadSharpIcon from '@mui/icons-material/DriveFolderUploadSharp';
import { useQuery } from '@apollo/client';
import { useNavigate, useParams } from 'react-router-dom';
import { EditPartFormData } from '../../FormData';
import { GET_QUALIFICATION_UNIT_PART_BY_ID } from '../../graphql/GetQualificationUnitPartById';

const EditPart: React.FC = () => {
  const navigate = useNavigate();
  const { partId } = useParams();
  const [formData, setFormData] = useState<EditPartFormData>({
    name: '',
    description: '',
    materials: '',
    osaamiset: [],
    notifyStudents: false,
    notifyStudentsText: '',
  });

  const { loading, error, data } = useQuery(GET_QUALIFICATION_UNIT_PART_BY_ID, {
    variables: { partId },
  });

  useEffect(() => {
    console.log('Route partId:', partId);
  }, [partId]);

  useEffect(() => {
    if (!loading && data?.part) {
      console.log('Fetched part:', data.part);
    }
  }, [data, loading]);

  useEffect(() => {
    if (!loading && data?.part && partId) {
      setFormData({
        name: data.part.name || '',
        description: data.part.description || '',
        materials: data.part.materials || '',
        osaamiset: data.part.osaamiset || [],
        notifyStudents: data.part.notifyStudents ?? false,
        notifyStudentsText: data.part.notifyStudentsText || '',
      });
    }
  }, [data, loading]);

  const part = data?.part;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNotifyStudents = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      notifyStudents: checked,
      notifyStudentsText: checked ? prev.notifyStudentsText : '',
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

  if (loading) return <Typography>Loading part details...</Typography>;
  if (error) return <Typography color="error">Error loading part: {error.message}</Typography>;

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
        onClick={() => navigate("/qualificationunitparts")}
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
            marginTop: '-24px',
          }}
        >
          <Typography variant="h4" align="center" color="white">
            Muokkaa teemaa #{part.id} {part.name}
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

            {formData.notifyStudents && (
              <TextField
                label="Muutosilmoitus"
                variant="outlined"
                name="notifyStudentsText"
                value={formData.notifyStudentsText}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                sx={{ my: 2 }}
              />
            )}
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

            <FormControl
              sx={{
                maxWidth: 300,
                display: 'flex',
                flexDirection: 'column',
                my: 3,
                border: '1px solid #ccc',
                borderRadius: 1,
                padding: 2,
              }}
            >
              <Typography sx={{ mb: 1, textAlign: 'left' }}>
                Muutosilmoitus
              </Typography>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography>{formData.notifyStudents 
                  ? 'Ilmoitetaan opiskelijoille' 
                  : 'Ei ilmoiteta'}
                </Typography>
                <Switch
                  checked={formData.notifyStudents}
                  onChange={handleNotifyStudents}
                  name="notifyStudents"
                  color="primary"
                />
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
            <SaveAsSharpIcon 
              sx={{
                mr: 1,
              }}
            />
            Tallenna muutokset
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default EditPart;
