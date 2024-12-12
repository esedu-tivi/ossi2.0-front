import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import {
  Container,
  Box,
  Button,
  Typography,
  IconButton,
  TextField,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { GET_PROJECT_BY_ID } from '../../graphql/GetProjectById';
import ReactMarkdown from 'react-markdown'



const ProjectDetails = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const { loading, error, data } = useQuery(GET_PROJECT_BY_ID, {
    variables: { id: projectId },
  });

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography>Error: {error.message}</Typography>;

  const project = data?.project;

  if (!project) return <Typography>Project not found</Typography>;

  const handleCopy = () => {
    navigate('/teacherprojects/new', {
      state: {
        description: project.description,
        materials: project.materials,
        includedInParts: project.includedInParts,
      },
    });
  };
  return (
    <Container
      maxWidth="lg"
      sx={{ backgroundColor: '#f5f5f5', padding: 3, borderRadius: 2 }}
    >
      {/* Header */}
      <Box
        mb={2}
        display="flex"
        alignItems="center"
        sx={{ backgroundColor: '#65558F', padding: 2, borderRadius: 1 }}
      >
        <Box display="flex" alignItems="center" sx={{ mr: 2 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ color: 'white' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2, color: 'white' }}>
            Ohjelmointi / TVP
          </Typography>
        </Box>
        <Typography variant="h4" sx={{ color: 'white', ml: 16 }}>
          #{project.id} {project.name}
        </Typography>
      </Box>

      {/* Buttons */}
      <Box mb={2} display="flex" gap={2}>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          sx={{ backgroundColor: '#65558F', borderRadius: 2 }}
        >
          Lisää opiskelijoille
        </Button>
        <Button
          variant="contained"
          startIcon={<ContentCopyIcon />}
          sx={{ backgroundColor: '#65558F', borderRadius: 2 }}
          onClick={handleCopy}
        >
          Kopioi
        </Button>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          sx={{ backgroundColor: '#65558F', borderRadius: 2 }}
          onClick={() => navigate(`/teacherprojects/edit/${project.id}`)}
        >
          Muokkaa
        </Button>
        <Button
          variant="contained"
          startIcon={<AssessmentIcon />}
          sx={{ backgroundColor: '#65558F', borderRadius: 2 }}
        >
          Suoritusaste
        </Button>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '60% 40%' },
          gap: 3,
        }}
      >
        <Box>
          <Typography variant="h6" gutterBottom>
            Projektin nimi
          </Typography>
          <Box
        sx={{
          padding: 2,
          backgroundColor: '#ffffff',
          border: '1px solid #ddd',
          borderRadius: 1,
          maxHeight: 200, // Add scroll for long text
          overflowY: 'auto',
          fontSize: '16px',
          color: 'black',
          letterSpacing: '0.5px',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        {project.name}
      </Box>

          <Typography variant="h6" gutterBottom>
            Projektin kuvaus
          </Typography>
          <Box
        sx={{
          padding: 2,
          backgroundColor: '#ffffff',
          border: '1px solid #ddd',
          borderRadius: 1,
          maxHeight: 600,
          overflowY: 'auto',
          fontSize: '16px',
          color: 'black',
          letterSpacing: '0.5px',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <ReactMarkdown>{project.description}</ReactMarkdown>
      </Box>

          <Typography variant="h6" gutterBottom>
            Materiaalit
          </Typography>
          <Box
        sx={{
          padding: 2,
          backgroundColor: '#ffffff',
          border: '1px solid #ddd',
          borderRadius: 1,
          maxHeight: 800, 
          overflowY: 'auto',
          fontSize: '16px',
          color: 'black',
          letterSpacing: '0.5px',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        {project.materials}
      </Box>

          <Typography variant="h6" gutterBottom>
            Ajankäyttö
          </Typography>
          <TextField
            disabled
            variant="outlined"
            value={project.duration}
            slotProps={{
              input: {
                style: {
                  color: 'black', 
                  fontWeight: 'bold',
                  fontSize: '16px',
                  letterSpacing: '0.5px', 
                },
              },
            }}
            sx={{ mb: 3, backgroundColor: '#ffffff', width: '50%' }}
          />
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>
            Teemat
          </Typography>
          <Box sx={{ padding: 2, mb: 3 }}>
            {project.includedInQualificationUnitParts.map(
              (part: { id: string; name: string }) => (
                <Chip
                  key={part.id}
                  label={part.name}
                  variant="filled"
                  color="primary"
                  sx={{ mr: 1, mb: 1 }}
                />
              )
            )}
          </Box>

          <Typography variant="h6" gutterBottom>
            Osaamiset
          </Typography>
          <Box sx={{ flexDirection: 'column', padding: 2, mb: 3 }}>
            <Box gap={1}>
              {[].map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  variant="filled"
                  color="primary"
                />
              ))}
            </Box>
          </Box>

          <Typography variant="h6" gutterBottom>
            Tunnisteet
          </Typography>
          <Box sx={{ padding: 2, mb: 3 }}>
            {project.tags && project.tags.length > 0 ? (
              project.tags.map((tag: { name: string }, index: number) => (
                <Chip
                  key={index}
                  label={tag.name}
                  variant="filled"
                  color="primary"
                  sx={{ mr: 1, mb: 1 }}
                />
              ))
            ) : (
              <Typography variant="body2" color="textSecondary">
                Ei tunnisteita lisättynä.
              </Typography>
            )}
          </Box>
          <Box
  sx={{
    padding: 2,
    mb: 3,
    width: '50%', 
    marginLeft: 0, 
  }}
>
  <Typography variant="h6" gutterBottom>
    Projektin tila
  </Typography>
  <TextField
    disabled
    variant="outlined"
    value={project.isActive ? 'Opiskelijoille näkyvissä' : 'Ei näkyvissä Opiskelijoille'}
    slotProps={{
      input: {
        readOnly: true,
      },
    }}
    sx={{
      backgroundColor: '#f5f5f5',
      borderRadius: 1,
      width: '100%',
    }}
  />
</Box>
        </Box>
        
      </Box>
    </Container>
  );
};

export default ProjectDetails;
