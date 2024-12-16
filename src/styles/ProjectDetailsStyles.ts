import { styled } from '@mui/material/styles';
import { Container, Box, Button, TextField, Chip } from '@mui/material';

export const StyledContainer = styled(Container)(({ theme }) => ({
  backgroundColor: '#f5f5f5',
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  maxWidth: theme.breakpoints.values.lg,
}));

export const HeaderBox = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#65558F',
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
}));

export const BackButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginRight: theme.spacing(2),
}));

export const HeaderTitle = styled(Box)(({ theme }) => ({
  marginLeft: theme.spacing(16),
  color: 'white',
}));

export const ActionButtonsContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  display: 'flex',
  gap: theme.spacing(2),
}));

export const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#65558F',
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: '#55447E',
  },
}));

export const MainGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),
  gridTemplateColumns: '1fr',
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: '60% 40%',
  },
}));

export const ContentBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: '#ffffff',
  border: '1px solid #ddd',
  borderRadius: theme.shape.borderRadius,
  maxHeight: 200,
  overflowY: 'auto',
  fontSize: '16px',
  color: 'black',
  letterSpacing: '0.5px',
  fontFamily: 'Arial, sans-serif',
}));

export const DescriptionBox = styled(ContentBox)(() => ({
  maxHeight: 600,
}));

export const MaterialsBox = styled(ContentBox)(() => ({
  maxHeight: 800,
}));

export const DurationField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  backgroundColor: '#ffffff',
  width: '50%',
  input: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: '16px',
    letterSpacing: '0.5px',
  },
}));

export const TagsBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

export const StyledChip = styled(Chip)(({ theme }) => ({
  marginRight: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

export const StatusBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  width: '50%',
  marginLeft: 0,
}));

export const StatusField = styled(TextField)(({ theme }) => ({
  backgroundColor: '#f5f5f5',
  borderRadius: theme.shape.borderRadius,
  width: '100%',
}));
