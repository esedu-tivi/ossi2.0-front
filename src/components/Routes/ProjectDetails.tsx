import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { Copy, Pencil, BarChart3 } from "lucide-react";
import { GET_PROJECT_BY_ID } from "../../graphql/GetProjectById";
import MarkdownIt from "markdown-it";
import DOMPurify from "dompurify";
import BackButton from "@/components/common/back-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const ProjectDetails = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const { loading, error, data } = useQuery(GET_PROJECT_BY_ID, {
    variables: { id: projectId },
  });

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4">Error: {error.message}</p>;

  const project = data?.project?.project;

  console.log('Project details', project)

  if (!project) return <p className="p-4">Project not found</p>;

  const md = new MarkdownIt({
    html: true,
  });

  // Content is sanitized with DOMPurify before rendering
  const sanitizeHtml = (html: string | Node) =>
    DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ["iframe", "p", "b", "i", "em", "strong", "a", "ul", "li", "ol", "img", "h1", "h2", "h3", "h4", "h5", "h6", "br", "span", "div"],
      ALLOWED_ATTR: ["src", "title", "width", "height", "frameborder", "allowfullscreen", "href", "alt", "target", "rel", "style", "class"],
    });

  const renderedDescription = md.render(project.description || "");
  const renderedMaterials = md.render(project.materials || "");

  const safeDescription = sanitizeHtml(renderedDescription);
  const safeMaterials = sanitizeHtml(renderedMaterials);

  const handleCopy = () => {
    navigate('/teacherprojects/new', {
      state: {
        name: project.name + " (Kopio)",
        description: project.description,
        materials: project.materials,
        duration: project.duration,
        includedInParts: project.includedInQualificationUnitParts,
        competenceRequirements: project.competenceRequirements,
        tags: project.tags,
        isActive: project.isActive,
      },
    });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="rounded-lg bg-primary px-6 py-4">
        <div className="flex items-center gap-2">
          <BackButton variant="ghost" className="mb-0 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground" />
        </div>
        <h2 className="mt-2 text-2xl font-bold text-primary-foreground">
          #{project.id} {project.name}
        </h2>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleCopy}>
          <Copy className="mr-2 h-4 w-4" />
          Kopioi
        </Button>
        <Button onClick={() => navigate(`/teacherprojects/edit/${project.id}`)}>
          <Pencil className="mr-2 h-4 w-4" />
          Muokkaa
        </Button>
        <Button>
          <BarChart3 className="mr-2 h-4 w-4" />
          Suoritusaste
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[3fr_2fr]">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-lg font-semibold">Projektin nimi</h3>
            <div className="rounded-md border bg-white p-3">{project.name}</div>
          </div>

          <div>
            <h3 className="mb-2 text-lg font-semibold">Projektin kuvaus</h3>
            <div className="prose max-w-none rounded-md border bg-white p-3" dangerouslySetInnerHTML={{ __html: safeDescription }} />
          </div>

          <div>
            <h3 className="mb-2 text-lg font-semibold">Materiaalit</h3>
            <div className="prose max-w-none rounded-md border bg-white p-3" dangerouslySetInnerHTML={{ __html: safeMaterials }} />
          </div>

          <div>
            <h3 className="mb-2 text-lg font-semibold">Ajankäyttö</h3>
            <Input disabled value={project.duration} className="max-w-xs" />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-lg font-semibold">Teemat</h3>
            <div className="flex flex-wrap gap-2">
              {project.includedInQualificationUnitParts.map(
                (part: { id: string; name: string }) => (
                  <Badge key={part.id}>{part.name}</Badge>
                )
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-lg font-semibold">Osaamiset</h3>
            <div className="flex flex-wrap gap-2">
              {project.competenceRequirements && project.competenceRequirements.length > 0 ? (
                project.competenceRequirements.map((competence: { id: string; description: string }) => (
                  <Badge key={competence.id}>{competence.description}</Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Ei osaamisia lisättynä.
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-lg font-semibold">Tunnisteet</h3>
            <div className="flex flex-wrap gap-2">
              {project.tags && project.tags.length > 0 ? (
                project.tags.map((tag: { name: string }, index: number) => (
                  <Badge key={index}>{tag.name}</Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Ei tunnisteita lisättynä.
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-lg font-semibold">Projektin tila</h3>
            <Input
              disabled
              readOnly
              value={
                project.isActive
                  ? "Opiskelijoille näkyvissä"
                  : "Ei näkyvissä Opiskelijoille"
              }
              className="max-w-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
