import { useNavigate } from 'react-router-dom';
// import { useQuery } from '@apollo/client';
import {
  Container,
  Box,
  Button,
  Typography,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';


const QualificationUnitPartDetails = () => {
    const navigate = useNavigate();
    // const { partId } = useParams();

    return (
      <Container
        maxWidth="lg"
        sx={{ backgroundColor: "#f5f5f5", padding: 3, borderRadius: 2 }}
      >
        {/* Header */}
        <Box
          mb={2}
          display="flex"
          alignItems="center"
          sx={{ backgroundColor: "#65558F", padding: 2, borderRadius: 1 }}
        >
          <Box display="flex" alignItems="center" sx={{ mr: 2 }}>
            <IconButton onClick={() => navigate(-1)} sx={{ color: "white" }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ ml: 2, color: "white" }}>
              Ohjelmointi
            </Typography>
          </Box>
        </Box>
  
        {/* Main Content */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "60% 40%" },
            gap: 3,
          }}
        >
          {/* Left Column */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Teeman nimi
            </Typography>
            <Box
              sx={{
                padding: 2,
                backgroundColor: "#ffffff",
                border: "1px solid #ddd",
                borderRadius: 1,
                maxHeight: 200,
                overflowY: "auto",
              }}
            >
              {/* {part.name} */}
            </Box>
  
            <Typography variant="h6" gutterBottom>
              Teeman kuvaus
            </Typography>
            <Box
              sx={{
                padding: 2,
                backgroundColor: "#ffffff",
                border: "1px solid #ddd",
                borderRadius: 1,
                maxHeight: 600,
                overflowY: "auto",
              }}
            >
              {/* {part.description} */}
            </Box>
  
            <Typography variant="h6" gutterBottom>
              Materiaalit
            </Typography>
            <Box
              sx={{
                padding: 2,
                backgroundColor: "#ffffff",
                border: "1px solid #ddd",
                borderRadius: 1,
                maxHeight: 800,
                overflowY: "auto",
              }}
            >
              {/* {part.materials} */}
            </Box>
          </Box>
  
          {/* Right Column */}
          <Box
            sx={{
              display: "grid",
              gridTemplateRows: "auto auto auto",
              gridRowGap: 3,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Projektit
            </Typography>
  
            <Typography variant="h6" gutterBottom>
              Osaamiset
            </Typography>
  
            <Typography variant="h6" gutterBottom>
              Tunnisteet
            </Typography>
          </Box>
        </Box>
  
        {/* Bottom Right Button */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mt: 4,
          }}
        >
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            sx={{
              backgroundColor: "#65558F",
              borderRadius: 2,
              paddingX: 3,
            }}
          >
            Muokkaa
          </Button>
        </Box>
      </Container>
    );
  };
  
  export default QualificationUnitPartDetails;