import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import {
  Container,
  Box,
  Button,
  Typography,
  IconButton,
  Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import { GET_QUALIFICATION_UNIT_PART_BY_ID } from "../../graphql/GetQualificationUnitPartById";
import MarkdownIt from "markdown-it";
import DOMPurify from "dompurify";

const QualificationUnitPartDetails = () => {
  const navigate = useNavigate();
  const { partId } = useParams();

  // Fetch part details using GraphQL query
  const { loading, error, data } = useQuery(GET_QUALIFICATION_UNIT_PART_BY_ID, {
    variables: { partId: partId },
    fetchPolicy: "no-cache",
  });

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography>Error: {error.message}</Typography>;

  const part = data?.part;
  if (!part) {
    console.log("Data received from GraphQL query is empty or incorrect.");
    return <Typography>Part not found</Typography>;
  }

  // Markdown rendering
  const md = new MarkdownIt({ html: true });
  const sanitizeHtml = (html: string) =>
    DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ["p", "b", "i", "strong", "a", "ul", "li", "ol", "img", "h1", "h2", "h3", "br", "div"],
      ALLOWED_ATTR: ["src", "href", "alt", "target"],
    });

  const safeDescription = sanitizeHtml(md.render(part.description || ""));
  const safeMaterials = sanitizeHtml(md.render(part.materials || ""));

  return (
    <Container maxWidth="lg" sx={{ backgroundColor: "#f5f5f5", padding: 3, borderRadius: 2 }}>
      {/* Header */}
      <Box mb={2} display="flex" alignItems="center" sx={{ backgroundColor: "#65558F", padding: 2, borderRadius: 1 }}>
        <Box display="flex" alignItems="center" sx={{ mr: 2 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ color: "white" }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2, color: "white" }}>
            {part.name}
          </Typography>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "60% 40%" }, gap: 3 }}>
        {/* Left Column */}
        <Box>
          <Typography variant="h6" gutterBottom>Teeman nimi</Typography>
          <Box sx={{ padding: 2, backgroundColor: "#ffffff", border: "1px solid #ddd", borderRadius: 1 }}>{part.name}</Box>

          <Typography variant="h6" gutterBottom>Teeman kuvaus</Typography>
          <Box sx={{ padding: 2, backgroundColor: "#ffffff", border: "1px solid #ddd", borderRadius: 1 }}>
            <div dangerouslySetInnerHTML={{ __html: safeDescription }} />
          </Box>

          <Typography variant="h6" gutterBottom>Materiaalit</Typography>
          <Box sx={{ padding: 2, backgroundColor: "#ffffff", border: "1px solid #ddd", borderRadius: 1 }}>
            <div dangerouslySetInnerHTML={{ __html: safeMaterials }} />
          </Box>
        </Box>

        {/* Right Column */}
        <Box sx={{ display: "grid", gridTemplateRows: "auto auto auto", gridRowGap: 3 }}>
        <Typography variant="h6" gutterBottom>Tutkinnon osa</Typography>
          <Box>
            {part.parentQualificationUnit ? (
              <Chip
                label={part.parentQualificationUnit.name}
                variant="filled"
                color="primary"
                sx={{ m: 0.5 }}
              />
            ) : (
              <Typography variant="body2" color="textSecondary">Ei tutkinnon osaa</Typography>
            )}
          </Box>
          
          <Typography variant="h6" gutterBottom>Projektit</Typography>
          <Box>
            {part.projects && part.projects.length > 0 ? (
              part.projects.map((project: { id: string; name: string }) => (
                <Chip key={project.id} label={project.name} variant="filled" color="primary" sx={{ m: 0.5 }} />
              ))
            ) : (
              <Typography variant="body2" color="textSecondary">Ei projekteja lisättynä.</Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Bottom Right Button */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          sx={{ backgroundColor: "#65558F", borderRadius: 2, paddingX: 3 }}
          onClick={() => navigate(`/qualificationunitparts/edit/${part.id}`)}
        >
          Muokkaa
        </Button>
      </Box>
    </Container>
  );
};

export default QualificationUnitPartDetails;
