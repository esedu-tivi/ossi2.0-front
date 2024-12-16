import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { Typography, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { GET_PROJECT_BY_ID } from "../../graphql/GetProjectById";
import MarkdownIt from "markdown-it";
import DOMPurify from "dompurify";
import {
  StyledContainer,
  HeaderBox,
  BackButtonContainer,
  HeaderTitle,
  ActionButtonsContainer,
  StyledButton,
  MainGrid,
  ContentBox,
  DescriptionBox,
  MaterialsBox,
  DurationField,
  TagsBox,
  StyledChip,
  StatusBox,
  StatusField,
} from "../../styles/ProjectDetailsStyles";

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

  const md = new MarkdownIt();
  const renderedDescription = md.render(project.description || '');
  const renderedMaterials = md.render(project.materials || '');

  const safeDescription = DOMPurify.sanitize(renderedDescription)
  const safeMaterials = DOMPurify.sanitize(renderedMaterials)

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
    <StyledContainer>
      <HeaderBox>
        <BackButtonContainer>
          <IconButton onClick={() => navigate(-1)} sx={{ color: "white" }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2, color: "white" }}>
            Ohjelmointi / TVP
          </Typography>
        </BackButtonContainer>
        <HeaderTitle>
          <Typography variant="h4" sx={{ color: "white" }}>
            #{project.id} {project.name}
          </Typography>
        </HeaderTitle>
      </HeaderBox>

      <ActionButtonsContainer>
        <StyledButton variant="contained" startIcon={<PersonAddIcon />}>
          Lisää opiskelijoille
        </StyledButton>
        <StyledButton
          variant="contained"
          startIcon={<ContentCopyIcon />}
          onClick={handleCopy}
        >
          Kopioi
        </StyledButton>
        <StyledButton
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/teacherprojects/edit/${project.id}`)}
        >
          Muokkaa
        </StyledButton>
        <StyledButton variant="contained" startIcon={<AssessmentIcon />}>
          Suoritusaste
        </StyledButton>
      </ActionButtonsContainer>

      <MainGrid>
        <div>
          <Typography variant="h6" gutterBottom>
            Projektin nimi
          </Typography>
          <ContentBox>{project.name}</ContentBox>

          <Typography variant="h6" gutterBottom>
            Projektin kuvaus
          </Typography>
          <DescriptionBox>
            <div dangerouslySetInnerHTML={{ __html: safeDescription }} />
          </DescriptionBox>

          <Typography variant="h6" gutterBottom>
            Materiaalit
          </Typography>
          <MaterialsBox>
            <div dangerouslySetInnerHTML={{ __html: safeMaterials }} />
          </MaterialsBox>

          <Typography variant="h6" gutterBottom>
            Ajankäyttö
          </Typography>
          <DurationField disabled variant="outlined" value={project.duration} />
        </div>

        <div>
          <Typography variant="h6" gutterBottom>
            Teemat
          </Typography>
          <TagsBox>
            {project.includedInQualificationUnitParts.map(
              (part: { id: string; name: string }) => (
                <StyledChip
                  key={part.id}
                  label={part.name}
                  variant="filled"
                  color="primary"
                />
              )
            )}
          </TagsBox>

          <Typography variant="h6" gutterBottom>
            Osaamiset
          </Typography>
          <TagsBox>
            {[].map((skill: string, index: number) => (
              <StyledChip
                key={index}
                label={skill}
                variant="filled"
                color="primary"
              />
            ))}
          </TagsBox>

          <Typography variant="h6" gutterBottom>
            Tunnisteet
          </Typography>
          <TagsBox>
            {project.tags && project.tags.length > 0 ? (
              project.tags.map((tag: { name: string }, index: number) => (
                <StyledChip
                  key={index}
                  label={tag.name}
                  variant="filled"
                  color="primary"
                />
              ))
            ) : (
              <Typography variant="body2" color="textSecondary">
                Ei tunnisteita lisättynä.
              </Typography>
            )}
          </TagsBox>

          <StatusBox>
            <Typography variant="h6" gutterBottom>
              Projektin tila
            </Typography>
            <StatusField
              disabled
              variant="outlined"
              value={
                project.isActive
                  ? "Opiskelijoille näkyvissä"
                  : "Ei näkyvissä Opiskelijoille"
              }
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
            />
          </StatusBox>
        </div>
      </MainGrid>
    </StyledContainer>
  );
};

export default ProjectDetails;
